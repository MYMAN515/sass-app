// pages/api/replicate-webhook.js
import { supabase } from '@/lib/supabaseClient';
console.log("✅ Webhook HIT!", req.body);

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!req.headers['content-type']?.includes('application/json')) {
    return res.status(400).json({ error: 'Invalid content-type' });
  }

  try {
    const prediction = req.body;

    if (!prediction || !prediction.status) {
      return res.status(400).json({ error: 'Missing prediction data' });
    }

    console.log('[Webhook] Received prediction:', prediction.id, prediction.status);

    if (prediction.status === 'succeeded') {
      const outputUrl = prediction.output;
      const { email, feature, prompt } = prediction.input || {};

      const { error } = await supabase.from('generation_history').insert([
        {
          user_email: email || 'unknown',
          feature: feature || 'unknown',
          prompt: prompt || '',
          image_url: outputUrl,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error('[Webhook] Supabase insert error:', error);
        return res.status(500).json({ error: 'DB insert failed' });
      }

      console.log('[Webhook] Prediction saved to Supabase:', outputUrl);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[Webhook] Handler error:', err);
    return res.status(500).json({ error: 'Webhook handling failed' });
  }
}
