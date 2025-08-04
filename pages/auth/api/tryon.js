import { supabase } from '@/lib/supabaseClient';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { imageUrl, prompt, user_email } = req.body;

  if (!imageUrl || !prompt || !user_email) {
    return res.status(400).json({ error: 'Missing imageUrl, prompt, or user_email' });
  }

  const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;
  if (!REPLICATE_TOKEN) {
    return res.status(500).json({ error: 'Replicate API token not set' });
  }

  // ✅ Step 1: Start AI generation
  const startRes = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      Authorization: `Token ${REPLICATE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: 'black-forest-labs/flux-kontext-pro',
      input: {
        prompt,
        input_image: imageUrl,
        aspect_ratio: 'match_input_image',
        output_format: 'jpg',
        safety_tolerance: 2,
      },
    }),
  });

  const startData = await startRes.json();

  if (!startRes.ok || !startData?.urls?.get) {
    return res.status(400).json({
      error: startData?.error || 'Replicate API failed to start generation',
      detail: startData,
    });
  }

  // ✅ Step 2: Poll for result
  const statusUrl = startData.urls.get;
  let output = null;
  let pollCount = 0;
  const maxPolls = 30;

  while (pollCount < maxPolls) {
    const pollRes = await fetch(statusUrl, {
      headers: { Authorization: `Token ${REPLICATE_TOKEN}` },
    });
    const pollData = await pollRes.json();

    if (pollData.status === 'succeeded') {
      output = pollData.output?.[0]; // it's an array, take first
      break;
    }
    if (pollData.status === 'failed') {
      return res.status(500).json({ error: 'AI generation failed', detail: pollData });
    }

    await new Promise((r) => setTimeout(r, 2000));
    pollCount++;
  }

  if (!output) {
    return res.status(504).json({ error: 'Timed out waiting for AI result' });
  }

  // ✅ Step 3: Download generated image
  const imageRes = await fetch(output);
  if (!imageRes.ok) {
    return res.status(500).json({ error: 'Failed to fetch generated image from Replicate' });
  }
  const blob = await imageRes.blob();

  // ✅ Step 4: Upload to Supabase Storage (bucket: tryon)
  const supabaseClient = createPagesBrowserClient();
  const fileName = `tryon-${Date.now()}.jpg`;

  const { data: uploadData, error: uploadError } = await supabaseClient.storage
    .from('tryon')
    .upload(fileName, blob, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    return res.status(500).json({ error: 'Failed to upload to Supabase Storage', detail: uploadError.message });
  }

  // ✅ Step 5: Get public URL
  const { data: publicUrlData } = supabaseClient.storage.from('tryon').getPublicUrl(fileName);
  const publicUrl = publicUrlData.publicUrl.replace(/\/{2,}/g, '/');

  // ✅ Step 6: Save to Supabase DB
  const { error: dbError } = await supabase.from('generation_history').insert([
    {
      user_email: user_email.toLowerCase(),
      image_url: publicUrl,
      prompt,
      type: 'tryon',
    },
  ]);

  if (dbError) {
    return res.status(500).json({ error: 'Failed to save to database', detail: dbError.message });
  }

  // ✅ Done
  return res.status(200).json({ output: publicUrl });
}
