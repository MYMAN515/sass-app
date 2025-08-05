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

  if (!imageUrl || !prompt) {
    return res.status(400).json({ error: 'Missing imageUrl or prompt' });
  }

  // ✅ Create supabase client (reads cookies from req/res)
  const supabase = createPagesServerClient({ req, res });

  // ✅ Get current session from cookie
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (!session || sessionError) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userEmail = session.user.email;

  // ✅ Fetch user data (credits + plan)
  const { data: userData, error: userError } = await supabase
    .from('Data')
    .select('credits, plan')
    .eq('email', userEmail)
    .single();

  if (userError || !userData) {
    return res.status(404).json({ error: 'User not found' });
  }

  // ✅ Check credits
  if (userData.plan !== 'Pro' && userData.credits <= 0) {
    return res.status(403).json({ error: 'No credits left' });
  }

  // ✅ Send request to Replicate
  const replicateRes = await fetch('https://api.replicate.com/v1/predictions', {
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
        aspect_ratio: 'square',
      },
    }),
  });

  const replicateData = await replicateRes.json();

  if (!replicateData || replicateData.error) {
    console.error('Replicate error:', replicateData?.error);
    return res.status(500).json({ error: 'Failed to generate image' });
  }

  const generatedImage = replicateData?.urls?.get;

  if (!generatedImage) {
    return res.status(500).json({ error: 'Image generation failed' });
  }

  // ✅ Deduct credit for Free plan
  if (userData.plan !== 'Pro') {
    await supabase.rpc('decrement_credit', { user_email: userEmail });
  }

  return res.status(200).json({ success: true, image: generatedImage });
}
