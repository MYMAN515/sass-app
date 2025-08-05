// pages/api/enhance.js

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // لا تستخدم هذا في الكلاينت
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { imageUrl, prompt, user_email: userEmail } = req.body;

  if (!userEmail) {
    return res.status(401).json({ error: 'Unauthorized - Missing email' });
  }

  // 1. جلب بيانات المستخدم
  const { data: userData, error: userError } = await supabase
    .from('Data')
    .select('credits, plan')
    .eq('email', userEmail)
    .single();

  if (userError || !userData) {
    return res.status(404).json({ error: 'User not found' });
  }

  // 2. تحقق من الكريدت
  if (userData.plan !== 'Pro' && userData.credits <= 0) {
    return res.status(403).json({ error: 'No credits left' });
  }

  // 3. أرسل الصورة إلى Replicate
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
    return res.status(500).json({ error: 'Failed to generate image' });
  }

  const generatedImage = replicateData?.urls?.get;

  // 4. خصم كريدت واحد إذا الخطة Free
  if (userData.plan !== 'Pro') {
    await supabase.rpc('decrement_credit', { user_email: userEmail });
  }

  return res.status(200).json({ success: true, image: generatedImage });
}
