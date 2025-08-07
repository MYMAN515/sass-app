import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const sig = req.headers['x-webhook-signature'];
  if (sig !== process.env.REPLICATE_WEBHOOK_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const prediction = req.body;
  if (prediction.status === 'succeeded') {
    const { email, feature, prompt } = prediction.input || {};
    const imageUrl = prediction.output;
    const { error: dbError } = await supabaseAdmin.from('generation_history').insert([
      { user_email: email || 'unknown', feature, prompt, image_url: imageUrl, created_at: new Date().toISOString() }
    ]);
    if (dbError) return res.status(500).json({ error: 'DB error' });
  }

  return res.status(200).json({ success: true });
}
