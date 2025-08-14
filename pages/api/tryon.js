// /pages/api/tryon.js
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export const config = {
  api: { bodyParser: { sizeLimit: '12mb' } },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;
  if (!REPLICATE_TOKEN) {
    console.error('❌ Missing REPLICATE_API_TOKEN');
    return res.status(500).json({ error: 'Missing Replicate token' });
  }

  // من الداشبورد
  const {
    modelUrl,           // صورة الشخص
    clothUrl,           // صورة القطعة
    prompt,             // برومبت إيجابي
    negativePrompt,     // اختياري
    user_email,         // للمصادقة والرصيد
    aspect_ratio,       // اختياري
    seed,               // اختياري
    output_format,      // اختياري (png/jpg)
    safety_tolerance,   // اختياري (0..2)
  } = req.body || {};

  if (!modelUrl || !clothUrl || !prompt || !user_email) {
    return res.status(400).json({
      error: 'Missing required fields (modelUrl, clothUrl, prompt, user_email)',
    });
  }

  // Supabase auth + الرصيد
  const supabase = createPagesServerClient({ req, res });
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (!session || sessionError) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

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

  // حوّل أي مسار نسبي إلى رابط مطلق
  const makeAbs = (u) => {
    try { return new URL(u).toString(); }
    catch {
      const proto = req.headers['x-forwarded-proto'] || 'https';
      const host  = req.headers.host;
      return new URL(u, `${proto}://${host}`).toString();
    }
  };
  const input_image_1 = makeAbs(modelUrl); // الشخص أولاً
  const input_image_2 = makeAbs(clothUrl); // القطعة ثانيًا

  // صياغة تحكم الـsplit/collage
  const positive =
    `${prompt} Generate ONE single photo of the person in image 1 WEARING the garment from image 2. No split-screen or collage.`.trim();

  const negative =
    negativePrompt ||
    [
      'split screen','side-by-side','diptych','collage','before and after',
      'duplicate person','twins','floating clothing','overlaid garment',
      'extra arms','extra hands','wrong background','text','watermark','border'
    ].join(', ');

  // إعدادات الإدخال للمودل
  const input = {
    input_image_1,
    input_image_2,
    prompt: positive,
    negative_prompt: negative,                // بعض الإصدارات قد تتجاهله، لا يضر
    aspect_ratio: aspect_ratio || 'match_input_image',
    seed: typeof seed === 'number' ? seed : 42,
    output_format: output_format || 'jpg',
    safety_tolerance: typeof safety_tolerance === 'number' ? safety_tolerance : 2,
  };

  // ابدأ التنبؤ باستخدام الـslug مباشرة (بدون VERSION_ID)
  const startUrl = 'https://api.replicate.com/v1/models/flux-kontext-apps/multi-image-kontext-max/predictions';
  let start;
  try {
    start = await fetch(startUrl, {
      method: 'POST',
      headers: {
        Authorization: `Token ${REPLICATE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input }),
    });
  } catch (e) {
    console.error('Replicate start error:', e?.message || e);
    return res.status(500).json({ error: 'Failed to reach Replicate' });
  }

  const startData = await start.json();
  if (!start.ok || !startData?.urls?.get) {
    return res.status(500).json({
      error: startData?.error || 'Failed to start image generation',
      detail: startData,
    });
  }

  // Polling حتى النجاح/الفشل
  const statusUrl = startData.urls.get;
  let output = null;
  for (let i = 0; i < 20; i++) { // ~30 ثانية
    const statusRes = await fetch(statusUrl, {
      headers: { Authorization: `Token ${REPLICATE_TOKEN}` },
    });
    const statusData = await statusRes.json();

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

  const generatedImage =
    Array.isArray(output) ? output[0] :
    (typeof output === 'string' ? output : output?.image || output?.url);

  // خصم رصيد لغير الـ Pro (لو فشل ما نوقف الاستجابة)
  if (userData.plan !== 'Pro') {
    try {
      await supabase.rpc('decrement_credit', { user_email });
    } catch (e) {
      console.error('decrement_credit failed', e?.message || e);
    }
  }

  return res.status(200).json({
    success: true,
    image: generatedImage,               // الفرونت يستخدم pickFirstUrl
    model: 'flux-kontext-apps/multi-image-kontext-max',
    used_images: [input_image_1, input_image_2],
  });
}
