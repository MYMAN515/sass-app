import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export const config = { api: { bodyParser: true } };

const VERSION_851 =
  '851-labs/background-remover:a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  try {
    const { imageUrl } = req.body || {};
    const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;

    if (!REPLICATE_TOKEN) return res.status(500).json({ error: 'Missing REPLICATE_API_TOKEN' });
    if (!imageUrl) return res.status(400).json({ error: 'Missing imageUrl (must be public URL)' });

    // session check (مثل أسلوبك)
    const supabase = createPagesServerClient({ req, res });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return res.status(401).json({ error: 'Unauthorized' });

    // اطلب من Replicate
    const start = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        Authorization: `Token ${REPLICATE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: VERSION_851,
        input: {
          image: imageUrl,
          background_type: 'rgba', // ناتج شفاف
          format: 'png',
          threshold: 0,
        },
      }),
    });

    const sJson = await start.json();
    if (!start.ok || !sJson?.urls?.get) {
      return res.status(502).json({ error: sJson?.error || 'Failed to start prediction', detail: sJson });
    }

    // poll
    const statusUrl = sJson.urls.get;
    const t0 = Date.now();
    let out = null;
    while (true) {
      const r = await fetch(statusUrl, { headers: { Authorization: `Token ${REPLICATE_TOKEN}` } });
      const j = await r.json();
      if (j.status === 'succeeded') { out = Array.isArray(j.output) ? j.output[0] : j.output; break; }
      if (j.status === 'failed') return res.status(500).json({ error: 'Background removal failed' });
      if (Date.now() - t0 > 60_000) return res.status(504).json({ error: 'Prediction timed out' });
      await new Promise(r => setTimeout(r, 1200));
    }

    return res.status(200).json({ success: true, image: out });
  } catch (e) {
    console.error('remove-bg debug error:', e);
    return res.status(500).json({ error: 'Server error' });
  }
}
