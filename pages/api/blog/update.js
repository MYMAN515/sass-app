import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  try {
    const supabase = createPagesServerClient({ req, res });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return res.status(401).json({ error: 'Not authenticated' });

    const { id, title, content_md, excerpt, cover_url, language } = req.body || {};
    if (!id) return res.status(400).json({ error: 'id required' });

    const patch = {};
    if (title !== undefined) patch.title = title;
    if (content_md !== undefined) patch.content_md = content_md;
    if (excerpt !== undefined) patch.excerpt = excerpt;
    if (cover_url !== undefined) patch.cover_url = cover_url;
    if (language !== undefined) patch.language = language;

    const { data, error } = await supabase
      .from('posts')
      .update(patch)
      .eq('id', id)
      .select('id')
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ ok: true, id: data.id });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Unexpected error' });
  }
}
