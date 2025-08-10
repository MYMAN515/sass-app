// pages/api/remove-bg.js
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export const config = { api: { bodyParser: true } };

const REPLICATE_VERSION_851 =
  '851-labs/background-remover:a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc';
const REPLICATE_VERSION_LUCATACO =
  'lucataco/remove-bg:95fcc2a26d3899cd6c2691c900465aaeff466285a65c14638cc5f36f34befaf1';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  try {
    const { imageUrl, user_email, engine = 'best' } = req.body || {};
    const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;

    if (!REPLICATE_TOKEN) return res.status(500).json({ error: 'Missing Replicate token' });
    if (!imageUrl || !user_email) {
      return res.status(400).json({ error: 'Missing required fields (imageUrl, user_email)' });
    }

    // Auth
    const supabase = createPagesServerClient({ req, res });
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (!session || sessionError) return res.status(401).json({ error: 'Unauthorized' });

    // User credits
    const { data: userData, error: userError } = await supabase
      .from('Data')
      .select('credits, plan')
      .eq('email', user_email)
      .single();

    if (userError || !userData) return res.status(404).json({ error: 'User not found' });

    const isPro = userData.plan === 'Pro';
    if (!isPro && userData.credits <= 0) {
      return res.status(403).json({ error: 'No credits left' });
    }

    // Model + input
    const use851 = String(engine).toLowerCase() !== 'fast';
    const version = use851 ? REPLICATE_VERSION_851 : REPLICATE_VERSION_LUCATACO;
    const input = use851 ? { image: imageUrl, background_type: 'rgba', format: 'png', threshold: 0 } : { image: imageUrl };

    // Start prediction
    const startRes = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: { Authorization: `Token ${REPLICATE_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ version, input }),
    });
    const startData = await startRes.json();
    if (!startRes.ok || !startData?.urls?.get) {
      return res.status(502).json({ error: startData?.error || 'Failed to start prediction' });
    }

    // Polling with timeout
    const statusUrl = startData.urls.get;
    const startedAt = Date.now();
    let outputUrl = null;

    while (true) {
      const s = await fetch(statusUrl, { headers: { Authorization: `Token ${REPLICATE_TOKEN}` } });
      const j = await s.json();

      if (j.status === 'succeeded') {
        const out = j.output;
        outputUrl = Array.isArray(out) ? out[0] : out;
        break;
      }
      if (j.status === 'failed') return res.status(500).json({ error: 'Background removal failed' });

      if (Date.now() - startedAt > 60_000) {
        return res.status(504).json({ error: 'Prediction timed out' });
      }
      await new Promise(r => setTimeout(r, 1200));
    }

    // Deduct credit only if not Pro
    if (!isPro) await supabase.rpc('decrement_credit', { user_email });

    return res.status(200).json({ success: true, image: outputUrl });
  } catch (e) {
    console.error('remove-bg error:', e);
    return res.status(500).json({ error: 'Server error' });
  }
}
