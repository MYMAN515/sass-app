// pages/api/remove-bg.js
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export const config = { api: { bodyParser: true } };

const VERSION_851 =
  '851-labs/background-remover:a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  try {
    const { imageData } = req.body || {};
    const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;
    if (!REPLICATE_TOKEN) return res.status(500).json({ error: 'Missing REPLICATE_API_TOKEN' });
    if (!imageData?.startsWith?.('data:image/')) {
      return res.status(400).json({ error: 'Missing imageData (data URL)' });
    }

    // جلسة Supabase
    const supabase = createPagesServerClient({ req, res });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return res.status(401).json({ error: 'Unauthorized' });

    // جلب كريدت/خطة
    const email = session.user.email;
    const { data: userData, error: userError } = await supabase
      .from('Data')
      .select('credits, plan')
      .eq('email', email)
      .single();

    if (userError || !userData) return res.status(404).json({ error: 'User not found' });
    const isPro = userData.plan === 'Pro';
    if (!isPro && userData.credits <= 0) return res.status(403).json({ error: 'No credits left' });

    // بدء التنبؤ
    const startRes = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: { Authorization: `Token ${REPLICATE_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        version: VERSION_851,
        input: {
          image: imageData,       // << Data URL مباشرة
          background_type: 'rgba',
          format: 'png',
          threshold: 0,
        },
      }),
    });
    const startJson = await startRes.json();
    if (!startRes.ok || !startJson?.urls?.get) {
      return res.status(502).json({ error: startJson?.error || 'Failed to start prediction', detail: startJson });
    }

    // Polling
    const statusUrl = startJson.urls.get;
    const t0 = Date.now();
    let outputUrl = null;

    while (true) {
      const r = await fetch(statusUrl, { headers: { Authorization: `Token ${REPLICATE_TOKEN}` } });
      const j = await r.json();
      if (j.status === 'succeeded') {
        const out = j.output;
        outputUrl = Array.isArray(out) ? out[0] : out;
        break;
      }
      if (j.status === 'failed') return res.status(500).json({ error: 'Background removal failed' });
      if (Date.now() - t0 > 60_000) return res.status(504).json({ error: 'Prediction timed out' });
      await new Promise((r) => setTimeout(r, 1200));
    }

    // خصم كريدت بعد النجاح (إن لم يكن Pro)
    if (!isPro) await supabase.rpc('decrement_credit', { user_email: email });

    return res.status(200).json({ success: true, image: outputUrl });
  } catch (e) {
    console.error('remove-bg api error:', e);
    return res.status(500).json({ error: 'Server error' });
  }
}
