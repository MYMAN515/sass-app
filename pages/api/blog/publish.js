import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  try {
    const supabase = createPagesServerClient({ req, res });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return res.status(401).json({ error: 'Not authenticated' });

    // verify admin/editor
    const { data: roleRow } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (!roleRow || !['admin','editor'].includes(roleRow.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { id, action } = req.body || {};
    if (!id || !action) return res.status(400).json({ error: 'id and action required' });

    let patch = {};
    if (action === 'publish') {
      patch = { status: 'published', published_at: new Date().toISOString() };
    } else if (action === 'reject') {
      patch = { status: 'rejected' };
    } else if (action === 'unpublish') {
      patch = { status: 'draft', published_at: null };
    } else {
      return res.status(400).json({ error: 'invalid action' });
    }

    const { error } = await supabase.from('posts').update(patch).eq('id', id);
    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Unexpected error' });
  }
}
