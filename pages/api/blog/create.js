import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import slugify from '@/lib/slugify';

export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  try {
    const supabase = createPagesServerClient({ req, res });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return res.status(401).json({ error: 'Not authenticated' });

    const userId = session.user.id;
    const { title, content_md, cover_url = null, language = 'en', excerpt = '' } = req.body || {};
    if (!title || !content_md) return res.status(400).json({ error: 'title and content_md are required' });

    // generate unique slug
    let base = slugify(title);
    if (!base) base = `post-${Date.now().toString(36)}`;
    let candidate = base;
    let i = 0;
    while (true) {
      const { data: exists } = await supabase.from('posts').select('slug').eq('slug', candidate).maybeSingle();
      if (!exists) break;
      i += 1;
      candidate = `${base}-${i}`;
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        author_id: userId,
        title,
        slug: candidate,
        content_md,
        cover_url,
        language,
        excerpt: excerpt || content_md.slice(0, 180),
        status: 'pending',
      })
      .select('id, slug')
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ ok: true, ...data });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Unexpected error' });
  }
}
