import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ⚠️ سرّي - لا تضعه على الواجهة
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try {
    const supabase = createPagesServerClient({ req, res });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return res.status(401).json({ error: 'Unauthorized' });

    const { url } = req.body || {};
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Invalid url' });
    }

    const r = await fetch(url);
    if (!r.ok) return res.status(400).json({ error: 'Failed to fetch remote image' });

    const contentType = r.headers.get('content-type') || 'image/png';
    const ab = await r.arrayBuffer();
    const buffer = Buffer.from(ab);

    const ext =
      contentType.includes('webp') ? 'webp' :
      contentType.includes('jpeg') ? 'jpg'  :
      contentType.includes('png')  ? 'png'  : 'png';

    const userId = session.user.id;
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;
    const path = `${userId}/${fileName}`;

    const { error: uploadError } = await supabaseAdmin
      .storage.from('generated')
      .upload(path, buffer, { contentType, upsert: false });

    if (uploadError) return res.status(400).json({ error: uploadError.message });

    const { data: pub } = supabaseAdmin.storage.from('generated').getPublicUrl(path);

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ path, publicUrl: pub.publicUrl, contentType });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
}

