// /pages/api/tryon.js
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;

  // نفس المدخلات + أضف personUrl (صورة المودل) و garmentUrl (صورة الملابس)
  const { image1, image2, prompt, plan, user_email } = req.body;

  if (!REPLICATE_TOKEN) return res.status(500).json({ error: 'Missing Replicate token' });

  // نحتاج صورتين: المودل + الملابس (نقبل garmentUrl أو imageUrl كمرادف)
  if (!image1 || !image2 || !prompt || !user_email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // جلسة Supabase
  const supabase = createPagesServerClient({ req, res });
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (!session || sessionError) return res.status(401).json({ error: 'Unauthorized' });

  // بيانات المستخدم
  const { data: userData, error: userError } = await supabase
    .from('Data')
    .select('credits, plan')
    .eq('email', user_email)
    .single();

  if (userError || !userData) return res.status(404).json({ error: 'User not found' });
  if (userData.plan !== 'Pro' && userData.credits <= 0)
    return res.status(403).json({ error: 'No credits left' });

  // نفس استدعاء enhance بالضبط: /v1/predictions + version فقط (بدون model)
  // NOTE: غيّر أسماء الحقول هنا لو موديلك يتطلب تسميات مختلفة.
  const start = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      Authorization: `Token ${REPLICATE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: "flux-kontext-apps/multi-image-kontext-max",          // ← أهم فرق: نسخة موديل الـ Try-On
      input: {
        // شائع في كثير من موديلات الـ Try-On:
        // معظم موديلات الـ Try-On تستخدم هذين الاسمين:
        input_image_1: image1, // صورة الشخص/المودل
        input_image_2: image2, // صورة الملابس
        prompt,
        output_format: 'jpg',
        safety_tolerance: 2,
      },
    }),
  });

  const startData = await start.json();

  if (!start.ok || !startData?.urls?.get) {
    return res.status(500).json({
      error: startData?.error || 'Failed to start image generation',
      detail: startData,
    });
  }

  // نفس الـ polling
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
    if (statusData.status === 'failed') {
      return res.status(500).json({ error: statusData?.error || 'Image generation failed' });
    }
    await new Promise((r) => setTimeout(r, 1500));
  }

  if (!output) return res.status(500).json({ error: 'Image generation timed out' });

  const generatedImage = Array.isArray(output) ? output[0] : output;

  // نفس خصم الكردت
  if (userData.plan !== 'Pro') {
    await supabase.rpc('decrement_credit', { user_email });
  }

  return res.status(200).json({ success: true, image: generatedImage });
}
