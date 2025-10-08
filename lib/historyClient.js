'use client';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

let _sb;
function sb() { _sb ||= createPagesBrowserClient(); return _sb; }

export async function createHistory({ kind, input_url, output_url, prompt, options = {}, credits_used = 0, status = 'success' }) {
  const { data: { session } } = await sb().auth.getSession();
  if (!session?.user) throw new Error('No session');
  const row = { user_id: session.user.id, kind, input_url, output_url, prompt, options, credits_used, status };
  const { error } = await sb().from('history').insert(row);
  if (error) throw error;
  return true;
}

export async function listHistory({ kind = 'all', q = '', limit = 12, cursor = null } = {}) {
  const client = sb();
  const { data: { session } } = await client.auth.getSession();
  if (!session?.user) throw new Error('No session');
  let query = client.from('history').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(limit);
  if (kind !== 'all') query = query.eq('kind', kind);
  if (q) query = query.or(`prompt.ilike.%${q}%,options::text.ilike.%${q}%`);
  if (cursor?.createdBefore) query = query.lt('created_at', cursor.createdBefore);
  const { data, error } = await query;
  if (error) throw error;
  const nextCursor = data?.length ? { createdBefore: data[data.length - 1].created_at } : null;
  return { items: data || [], nextCursor };
}

export async function deleteHistory(id) {
  const client = sb();
  // نجيب السجل أولًا عشان نعرف storage_path لو مخزّن داخل options
  const { data: rec, error: selErr } = await client.from('history').select('id, options').eq('id', id).single();
  if (selErr) throw selErr;

  // نحاول حذف من Storage إذا كان في storage_path
  const storagePath = rec?.options?.storage_path;
  if (storagePath) {
    try {
      // اسم البكت ثابت 'generated'
      await client.storage.from('generated').remove([storagePath]);
    } catch (e) {
      // تجاهل الخطأ: قد يكون الملف محذوف مسبقًا
      console.warn('Storage remove failed:', e?.message || e);
    }
  }

  const { error } = await client.from('history').delete().eq('id', id);
  if (error) throw error;
  return true;
}
