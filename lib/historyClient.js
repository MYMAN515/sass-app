'use client';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

let _sb;
function sb() {
  _sb ||= createPagesBrowserClient();
  return _sb;
}

async function ensureSession(client = sb()) {
  const {
    data: { session },
  } = await client.auth.getSession();
  if (!session?.user) throw new Error('No session');
  return { client, session };
}

export async function createHistory({
  kind,
  input_url,
  output_url,
  prompt,
  options = {},
  credits_used = 0,
  status = 'success',
}) {
  const { client, session } = await ensureSession();
  const row = { user_id: session.user.id, kind, input_url, output_url, prompt, options, credits_used, status };
  const { error } = await client.from('history').insert(row);
  if (error) throw error;
  return true;
}

export async function listHistory({ kind = 'all', q = '', limit = 12, cursor = null } = {}) {
  const { client, session } = await ensureSession();
  let query = client
    .from('history')
    .select('id,created_at,kind,status,input_url,output_url,prompt,options,credits_used', { count: 'exact' })
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (kind !== 'all') {
    query = query.eq('kind', kind);
  }

  if (q) {
    query = query.or(`prompt.ilike.%${q}%,options::text.ilike.%${q}%`);
  }

  if (cursor?.createdBefore) {
    query = query.lt('created_at', cursor.createdBefore);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  const items = data || [];
  const nextCursor = items.length ? { createdBefore: items[items.length - 1].created_at } : null;

  return { items, nextCursor, totalCount: typeof count === 'number' ? count : items.length };
}

export async function deleteHistory(id) {
  const { client } = await ensureSession();

  const { data: rec, error: selErr } = await client.from('history').select('id, options').eq('id', id).single();
  if (selErr) throw selErr;

  const storagePath = rec?.options?.storage_path;
  if (storagePath) {
    try {
      await client.storage.from('generated').remove([storagePath]);
    } catch (e) {
      console.warn('Storage remove failed:', e?.message || e);
    }
  }

  const { error } = await client.from('history').delete().eq('id', id);
  if (error) throw error;

  return true;
}
