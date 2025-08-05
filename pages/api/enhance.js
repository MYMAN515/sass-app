// pages/api/enhance.js

import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

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

  // ✅ Create Supabase client (server-side)
  const supabase = createServerSupabaseClient({ req, res });

  // ✅ Get session
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

  // ✅ Fetch user data
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

  // ✅ Check credits
  if (userData.plan !== 'Pro' && userData.credits <= 0) {
    console.warn('[WARNING] No credits left');
    return res.status(403).json({ error: 'No credits left' });
  }

  // ✅ Call Replicate API
  console.log('[DEBUG] Sending request to Replicate...');
  const replicateRes = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: 'black-forest-labs/flux-kontext-max', // ✅ تأكد من وجود هذا الموديل على Replicate
      input: {
        input_image: imageUrl,
        prompt,
        aspect_ratio: 'square',
      },
    }),
  });

  const replicateData = await replicateRes.json();
  console.log('[DEBUG] Replicate response:', replicateData);

  if (!replicateData || replicateData.error) {
    console.error('[ERROR] Replicate API error:', replicateData?.error);
    return res.status(500).json({ error: 'Failed to generate image' });
  }

  const generatedImage = replicateData?.urls?.get;
  console.log('[DEBUG] Generated image URL:', generatedImage);

  if (!generatedImage) {
    return res.status(500).json({ error: 'Image generation failed' });
  }

  // ✅ Deduct credit if Free plan
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
