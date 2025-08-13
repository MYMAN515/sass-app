// pages/api/blog/create.js
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import slugify from '@/lib/slugify';

export const config = { api: { bodyParser: true } };

function wc(text = '') {
  return (text.trim().match(/\S+/g) || []).length;
}
function makeExcerpt(md = '', n = 180) {
  // strip basic markdown tokens for a cleaner excerpt
  const plain = md
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')  // images
    .replace(/\[[^\]]*\]\([^)]+\)/g, '$1') // links -> text
    .replace(/[`*_#>-]/g, ' ')             // md symbols
    .replace(/\s+/g, ' ')
    .trim();
  return plain.slice(0, n);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  try {
    const supabase = createPagesServerClient({ req, res });

    // auth
    const { data: { session }, error: sessErr } = await supabase.auth.getSession();
    if (sessErr) return res.status(401).json({ error: sessErr.message });
    if (!session?.user) return res.status(401).json({ error: 'Not authenticated' });

    const userId = session.user.id;

    // payload
    const {
      title = '',
      content_md = '',
      cover_url = null,
      language = 'en',
      excerpt = '',
    } = (req.body || {});

    // validation
    if (title.trim().length < 6) {
      return res.status(400).json({ error: 'Title is too short (min 6 characters).' });
    }
    if (wc(content_md) < 50) {
      return res.status(400).json({ error: 'Content is too short (min 50 words).' });
    }
    const lang = ['en', 'ar'].includes(language) ? language : 'en';

    // slug (base)
    let base = slugify(title?.trim() || '');
    if (!base) base = `post-${Date.now().toString(36)}`;

    // helper to try insert with a candidate slug
    const tryInsert = async (slugCandidate) => {
      return await supabase
        .from('posts')
        .insert({
          author_id: userId,            // <- owner (RLS expects author_id)
          title: title.trim(),
          slug: slugCandidate,
          content_md,
          cover_url,
          language: lang,
          excerpt: (excerpt || makeExcerpt(content_md, 180)),
          status: 'pending',            // editors/admins can publish later
        })
        .select('id, slug')
        .single();
    };

    // attempt insert; on slug conflict, retry with -2, -3 ... up to -10
    let candidate = base;
    let result = await tryInsert(candidate);

    // if conflict, check code and retry
    if (result.error && result.error.code === '23505') {
      // unique_violation (likely on slug)
      for (let i = 2; i <= 10; i++) {
        candidate = `${base}-${i}`;
        result = await tryInsert(candidate);
        if (!result.error) break;
        if (result.error.code !== '23505') break; // different error => stop
      }
    }

    if (result.error) {
      return res.status(400).json({ error: result.error.message });
    }

    return res.status(200).json({ ok: true, ...result.data });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Unexpected error' });
  }
}
