// /pages/api/tryon.js
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export const config = {
  api: { bodyParser: true },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { image1, image2, prompt, plan, user_email } = req.body || {};
  const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;

  if (!REPLICATE_TOKEN) {
    console.error('❌ Missing REPLICATE_API_TOKEN');
    return res.status(500).json({ error: 'Missing Replicate token' });
  }

  if (!image1 || !image2 || !prompt || !user_email) {
    return res.status(400).json({ error: 'Missing required fields (image1, image2, prompt, user_email)' });
  }

  // Supabase auth (مطابق لأسلوبك)
  const supabase = createPagesServerClient({ req, res });
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (!session || sessionError) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // بيانات المستخدم
  const { data: userData, error: userError } = await supabase
    .from('Data')
    .select('credits, plan')
    .eq('email', user_email)
    .single();

  if (userError || !userData) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (userData.plan !== 'Pro' && (userData.credits ?? 0) <= 0) {
    return res.status(403).json({ error: 'No credits left' });
  }

  // 🔥 استدعاء Replicate بنفس نمطك (version + 4 حقول فقط)
  const start = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      Authorization: `Token ${REPLICATE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: 'flux-kontext-apps/multi-image-kontext-max',
      input: {
        prompt,
        aspect_ratio: '1:1',
        input_image_1: image1,
        input_image_2: image2,
      },
    }),
  });

  const startData = await start.json().catch(() => ({}));

  if (!start.ok || !startData?.urls?.get) {
    return res.status(500).json({
      error: startData?.error || startData?.detail || 'Failed to start image generation',
      detail: startData,
    });
  }

  // Polling بسيط (نفس تايمينغك تقريباً)
  const statusUrl = startData.urls.get;
  let output = null;
  for (let i = 0; i < 20; i++) {
    const statusRes = await fetch(statusUrl, {
      headers: { Authorization: `Token ${REPLICATE_TOKEN}` },
    });
    const statusData = await statusRes.json();

    if (statusData.status === 'succeeded') {
      output = statusData.output;
      break;
    }
    if (statusData.status === 'failed' || statusData.status === 'canceled') {
      return res.status(500).json({ error: 'Image generation failed', detail: statusData });
    }

    await new Promise((r) => setTimeout(r, 1500));
  }

  if (!output) {
    return res.status(500).json({ error: 'Image generation timed out' });
  }

  const generatedImage = Array.isArray(output) ? output[0] : output;

  // خصم رصيد لغير الـ Pro
  if (userData.plan !== 'Pro') {
    try {
      await supabase.rpc('decrement_credit', { user_email });
    } catch (e) {
      console.error('decrement_credit failed', e?.message || e);
    }
  }

  return res.status(200).json({
    success: true,
    image: generatedImage,
    model: 'flux-kontext-apps/multi-image-kontext-max',
    used_images: [image1, image2],
  });
}
