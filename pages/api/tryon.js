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

  // نفس الواجهه اللي عندك
  const {
    modelUrl,        // صورة الشخص (المودل)
    clothUrl,        // صورة القطعة
    prompt,          // برومبت من الفرونت
    negativePrompt,  // اختياري
    user_email,      // للمصادقة والرصيد
    aspect_ratio,    // اختياري
    seed,            // اختياري
    output_format,   // اختياري: 'jpg' | 'png'
    safety_tolerance // اختياري: 0..2
  } = req.body || {};

  if (!modelUrl || !clothUrl || !prompt || !user_email) {
    return res.status(400).json({ error: 'Missing required fields (modelUrl, clothUrl, prompt, user_email)' });
  }

  // مصادقة Supabase + الرصيد (مثل القديم)
  const supabase = createPagesServerClient({ req, res });
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (!session || sessionError) return res.status(401).json({ error: 'Unauthorized' });

  const { data: userData, error: userError } = await supabase
    .from('Data')
    .select('credits, plan')
    .eq('email', user_email)
    .single();

  if (userError || !userData) return res.status(404).json({ error: 'User not found' });
  if (userData.plan !== 'Pro' && (userData.credits ?? 0) <= 0) {
    return res.status(403).json({ error: 'No credits left' });
  }

  // حوّل أي رابط نسبي إلى مطلق عشان Replicate يقدر يوصل
  const makeAbs = (u) => {
    try { return new URL(u).toString(); }
    catch {
      const proto = req.headers['x-forwarded-proto'] || 'https';
      const host  = req.headers.host;
      return new URL(u, `${proto}://${host}`).toString();
    }
  };

  const input_image_1 = makeAbs(modelUrl); // الشخص
  const input_image_2 = makeAbs(clothUrl); // القطعة

  // ✅ نحقن سطر بسيط يجبر “صورة واحدة” + نمنع الكولاج والسيدباي سايد
  const positive =
    `${prompt} ` +
    'Generate ONE single photo of the person in image 1 WEARING the garment from image 2. ' +
    'No split-screen, no side-by-side, no collage, no before/after.';

  const negative =
    (negativePrompt ? negativePrompt + ', ' : '') +
    [
      'split screen','side-by-side','diptych','collage','before and after',
      'duplicate person','twins','floating clothing','overlaid garment',
      'extra arms','extra hands','wrong background','text','watermark','border'
    ].join(', ');

  // 👇 نفس جسم الطلب القديم عندك (خليه زي ما كان شغال)
  const replicateBody = {
    // استخدمت نفس الـ"version" اللي كنت حاطّه قبل — لا نغيّره بما أنه شغّال
    version: 'flux-kontext-apps/multi-image-kontext-pro',
    input: {
      input_image_1,
      input_image_2,
      prompt: positive.trim(),
      negative_prompt: negative,                 // لو النسخة تتجاهله ما يضر
      aspect_ratio: aspect_ratio || 'match_input_image',
      seed: typeof seed === 'number' ? seed : 42,
      output_format: output_format || 'jpg',
      safety_tolerance: typeof safety_tolerance === 'number' ? safety_tolerance : 2,
    },
  };

  // نبدأ التنبؤ (نفس مسار predictions القديم)
  let start;
  try {
    start = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        Authorization: `Token ${REPLICATE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(replicateBody),
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

  // ⏱️ بولينغ سريع (إحساس snappy) — ~20 ثانية
  const statusUrl = startData.urls.get;
  const MAX_POLLS = 20;
  const INTERVAL_MS = 1000;

  let output = null;
  for (let i = 0; i < MAX_POLLS; i++) {
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
    await new Promise((r) => setTimeout(r, INTERVAL_MS));
  }

  if (!output) {
    return res.status(500).json({ error: 'Image generation timed out' });
  }

  const generatedImage = Array.isArray(output) ? output[0] : output;

  // خصم رصيد لغير Pro (لو فشل ما نوقف الاستجابة)
  if (userData.plan !== 'Pro') {
    try {
      await supabase.rpc('decrement_credit', { user_email });
    } catch (e) {
      console.error('decrement_credit failed', e?.message || e);
    }
  }

  return res.status(200).json({
    success: true,
    image: generatedImage,                    // الفرونت يستعمل pickFirstUrl
    model: 'flux-kontext-apps/multi-image-kontext-max',
    used_images: [input_image_1, input_image_2],
  });
}
