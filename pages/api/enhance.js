// pages/api/enhance.js

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // هذا لازم يكون service role token
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { imageUrl, prompt } = req.body;

  // 1. التحقق من الجلسة
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (!session || sessionError) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userEmail = session.user.email;

  // 2. جلب بيانات المستخدم من جدول Data
  const { data: userData, error: userError } = await supabase
    .from('Data')
    .select('credits, plan')
    .eq('email', userEmail)
    .single();

  if (userError || !userData) {
    return res.status(404).json({ error: 'User not found' });
  }

  // 3. التحقق من الكريدت قبل الإرسال
  if (userData.plan !== 'Pro' && userData.credits <= 0) {
    return res.status(403).json({ error: 'No credits left' });
  }

  // 4. إرسال الصورة إلى Replicate API
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

  if (!replicateData || replicateData.error || !replicateData.urls?.get) {
    return res.status(500).json({ error: 'Failed to generate image' });
  }

  const generatedImage = replicateData.urls.get;

  // 5. خصم كريدت واحد إذا المستخدم في الخطة المجانية
  if (userData.plan !== 'Pro') {
    const { error: decrementError } = await supabase.rpc('decrement_credit', {
      user_email: userEmail,
    });

    if (decrementError) {
      return res.status(500).json({ error: 'Failed to decrement credit' });
    }
  }

  // 6. إرسال النتيجة النهائية
  return res.status(200).json({ success: true, image: generatedImage });
}
