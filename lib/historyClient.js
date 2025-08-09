// ─────────────────────────────────────────────────────────
// 2) /lib/historyClient.js  (عميل بسيط للتعامل مع history)
// ─────────────────────────────────────────────────────────
'use client';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';

// لماذا: منع تكرار الإنشاء
let _sb;
function sb() { _sb ||= createBrowserSupabaseClient(); return _sb; }

export async function createHistory({ kind, input_url, output_url, prompt, options = {}, credits_used = 0, status = 'success' }) {
  const { data: { session } } = await sb().auth.getSession();
  if (!session?.user) throw new Error('No session');
  const row = {
    user_id: session.user.id, kind, input_url, output_url, prompt,
    options, credits_used, status
  };
  const { error } = await sb().from('history').insert(row);
  if (error) throw error;
  return true;
}

// cursor = { createdBefore: ISO string }
export async function listHistory({ kind = 'all', q = '', limit = 12, cursor = null } = {}) {
  const client = sb();
  const { data: { session } } = await client.auth.getSession();
  if (!session?.user) throw new Error('No session');

  let query = client
    .from('history')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (kind !== 'all') query = query.eq('kind', kind);
  if (q) query = query.or(`prompt.ilike.%${q}%,options::text.ilike.%${q}%`);
  if (cursor?.createdBefore) query = query.lt('created_at', cursor.createdBefore);

  const { data, error } = await query;
  if (error) throw error;

  const nextCursor = data?.length ? { createdBefore: data[data.length - 1].created_at } : null;
  return { items: data || [], nextCursor };
}

export async function deleteHistory(id) {
  const { error } = await sb().from('history').delete().eq('id', id);
  if (error) throw error;
  return true;
}
