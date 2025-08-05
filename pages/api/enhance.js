// pages/api/enhance.js

import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { imageUrl, prompt } = req.body;
  console.log('[DEBUG] Received:', { imageUrl, prompt });

  if (!imageUrl || !prompt) {
    return res.status(400).json({ error: 'Missing imageUrl or prompt' });
  }

  const supabase = createPagesServerClient({ req, res });

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  console.log('[DEBUG] Session:', session);
  if (!session || sessionError) {
    console.error('[ERROR] Session error:', sessionError);
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userEmail = session.user.email;
  console.log('[DEBUG] userEmail:', userEmail);

  const { data: userData, error: userError } = await supabase
    .from('Data')
    .select('credits, plan')
    .eq('email', userEmail)
    .single();

  console.log('[DEBUG] userData:', userData);
  if (userError || !userData) {
    console.error('[ERROR] Supabase user fetch error:', userError);
    return res.status(404).json({ error: 'User not found' });
  }

  if (userData.plan !== 'Pro' && userData.credits <= 0) {
    console.warn('[WARNING] No credits left');
    return res.status(403).json({ error: 'No credits left' });
  }

  // ✅ Step 1: Send initial request to Replicate
  const predictionRes = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: 'black-forest-labs/flux-kontext-max',
      input: {
        input_image: imageUrl,
        prompt,
        aspect_ratio: '1:1',
      },
    }),
  });

  const prediction = await predictionRes.json();
  console.log('[DEBUG] Replicate prediction response:', prediction);

  if (!prediction?.urls?.get) {
    console.error('[ERROR] No prediction get URL');
    return res.status(500).json({ error: 'Failed to get prediction' });
  }

  // ✅ Step 2: Poll until image is ready
  let finalResult = null;
  for (let i = 0; i < 20; i++) {
    const statusRes = await fetch(prediction.urls.get, {
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
      },
    });
    const statusData = await statusRes.json();

    console.log(`[DEBUG] Polling status [${i}]:`, statusData.status);

    if (statusData.status === 'succeeded') {
      finalResult = statusData;
      break;
    } else if (statusData.status === 'failed') {
      console.error('[ERROR] Image generation failed inside Replicate');
      return res.status(500).json({ error: 'Image generation failed (model error)' });
    }

    await new Promise((r) => setTimeout(r, 1500));
  }

  if (!finalResult?.output) {
    return res.status(500).json({ error: 'Image generation did not complete in time' });
  }

  const generatedImage = finalResult.output[0];
  console.log('[DEBUG] Final generated image:', generatedImage);

  // ✅ Deduct credit only if successful
  if (userData.plan !== 'Pro') {
    const { error: rpcError } = await supabase.rpc('decrement_credit', {
      user_email: userEmail,
    });

    if (rpcError) {
      console.error('[ERROR] Failed to decrement credit:', rpcError);
    } else {
      console.log('[DEBUG] Credit decremented successfully');
    }
  }

  return res.status(200).json({ success: true, image: generatedImage });
}
