// pages/api/enhance.js

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // يجب أن يكون هذا المفتاح في .env.local
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { imageUrl, prompt } = req.body;

  // 1. تحقق من الجلسة
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (!session || sessionError) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userEmail = session.user.email;

  // 2. جلب بيانات المستخدم
  const { data: userData, error: userError } = await supabase
    .from('Data')
    .select('credits, plan')
    .eq('email', userEmail)
    .single();

  if (userError || !userData) {
    return res.status(404).json({ error: 'User not found' });
  }

  // 3. تحقق من الكريدت
  if (userData.plan !== 'Pro' && userData.credits <= 0) {
    return res.status(403).json({ error: 'No credits left' });
  }

  // 4. أرسل الصورة إلى Replicate
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

  // 5. خصم كريدت واحد إذا الخطة Free ونجحت الصورة
  if (userData.plan !== 'Pro') {
    await supabase.rpc('decrement_credit', { user_email: userEmail });
  }

  return res.status(200).json({ success: true, image: generatedImage });
}
