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
    return res
      .status(400)
      .json({ error: 'Missing required fields (image1, image2, prompt, user_email)' });
  }

  // ---- Supabase auth/session ----
  const supabase = createPagesServerClient({ req, res });
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (!session || sessionError) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // ---- User data / credits ----
  const { data: userData, error: userError } = await supabase
    .from('Data')
    .select('credits, plan')
    .eq('email', user_email)
    .single();

  if (userError || !userData) {
    return res.status(404).json({ error: 'User not found' });
  }

  if ((userData.plan || plan) !== 'Pro' && (userData.credits ?? 0) <= 0) {
    return res.status(403).json({ error: 'No credits left' });
  }

  // ---- Create prediction (Replicate Apps schema) ----
  let start;
  try {
    start = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        Authorization: `Token ${REPLICATE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'flux-kontext-apps/multi-image-kontext-max',
        input: {
          prompt,
          input_image_1: image1,        // IMAGE 1: model/person
          input_image_2: image2,        // IMAGE 2: garment
          aspect_ratio: 'match_input_image',
          output_format: 'png',
          safety_tolerance: 2,
        },
      }),
    });
  } catch (e) {
    console.error('Replicate start error:', e?.message || e);
    return res.status(500).json({ error: 'Failed to reach Replicate' });
  }

  const startData = await start.json().catch(() => ({}));

  if (!start.ok || !startData?.urls?.get) {
    return res.status(500).json({
      error: startData?.error || startData?.detail || 'Failed to start image generation',
      detail: startData,
    });
  }

  // ---- Poll for completion ----
  const statusUrl = startData.urls.get;
  let output = null;

  for (let i = 0; i < 24; i++) { // ~36s @ 1.5s interval
    const statusRes = await fetch(statusUrl, {
      headers: { Authorization: `Token ${REPLICATE_TOKEN}` },
    });
    const statusData = await statusRes.json().catch(() => ({}));

    if (statusData?.status === 'succeeded') {
      output = statusData.output;
      break;
    }
    if (statusData?.status === 'failed' || statusData?.status === 'canceled') {
      return res.status(500).json({ error: 'Image generation failed', detail: statusData });
    }

    await new Promise((r) => setTimeout(r, 1500));
  }

  if (!output) {
    return res.status(500).json({ error: 'Image generation timed out' });
  }

  // ---- Normalize output to a single URL ----
  let imageUrl = null;
  if (typeof output === 'string') {
    imageUrl = output;
  } else if (Array.isArray(output)) {
    const first = output[0];
    imageUrl = typeof first === 'string' ? first : first?.url || null;
  } else if (output?.url) {
    imageUrl = output.url;
  }

  if (!imageUrl) {
    return res.status(500).json({ error: 'No output URL returned by Replicate', detail: output });
  }

  // ---- Decrement credit for non-Pro plans ----
  try {
    if ((userData.plan || plan) !== 'Pro') {
      await supabase.rpc('decrement_credit', { user_email });
    }
  } catch (e) {
    console.warn('decrement_credit failed:', e?.message || e);
    // لا نكسر الاستجابة الأساسية بسبب الرصيد
  }

  return res.status(200).json({
    success: true,
    image: imageUrl,
    model: 'flux-kontext-apps/multi-image-kontext-max',
    used_images: [image1, image2],
  });
}
