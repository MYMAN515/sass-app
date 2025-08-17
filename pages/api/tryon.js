// pages/api/tryon.js
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export const config = {
  api: { bodyParser: true },
};

// --------- إعدادات بسيطة ---------
const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;
// ملاحظة: في مشروعك القديم كنت تستخدم version كسلسلة. بنحافظ عليها لنفس التوافق.
const MODEL_VERSION = 'black-forest-labs/flux-kontext-max'; // شغال عندك

// حدود آمنة
const clamp = (n, min, max) => Math.max(min, Math.min(max, n || 0));

// استدعاء Replicate (بدء + بول)
async function callReplicateOnce({ prompt, input_image, aspect_ratio, output_format, safety_tolerance, num_outputs, seed, guidance_scale }) {
  const start = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      Authorization: `Token ${REPLICATE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: MODEL_VERSION,
      input: {
        prompt,
        input_image,
        aspect_ratio: aspect_ratio || 'match_input_image',
        output_format: output_format || 'jpg',
        safety_tolerance: safety_tolerance ?? 2,
        // خيارات إضافية اختيارية:
        ...(num_outputs ? { num_outputs: clamp(num_outputs, 1, 3) } : {}),
        ...(typeof seed === 'number' ? { seed } : {}),
        ...(typeof guidance_scale === 'number' ? { guidance_scale } : {}),
      },
    }),
  });

  const startData = await start.json();
  if (!start.ok || !startData?.urls?.get) {
    return { error: startData?.error || 'Failed to start image generation', detail: startData };
  }

  const statusUrl = startData.urls.get;
  // Poll ~45s (30 * 1.5s)
  for (let i = 0; i < 30; i++) {
    const statusRes = await fetch(statusUrl, {
      headers: { Authorization: `Token ${REPLICATE_TOKEN}` },
    });
    const statusData = await statusRes.json();

    if (statusData?.status === 'succeeded') {
      const output = statusData.output;
      const images = Array.isArray(output) ? output : output ? [output] : [];
      const usedSeed = statusData?.input?.seed ?? seed ?? null;
      return { images, seed: usedSeed };
    }
    if (statusData?.status === 'failed') {
      return { error: 'Image generation failed' };
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  return { error: 'Image generation timed out' };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  // ---- تحقّق التوكن ----
  if (!REPLICATE_TOKEN) {
    console.error('❌ Missing REPLICATE_API_TOKEN');
    return res.status(500).json({ error: 'Missing Replicate token' });
  }

  // ---- مدخلات ----
  const {
    imageUrl,
    prompt,
    plan,          // اختياري من الواجهة، القرار الحقيقي من جدول Data
    user_email,
    // تحسينات جديدة (كلها اختيارية):
    num_images,        // 1..3  (افتراضي نحدده حسب الخطة)
    seed,              // رقم لتثبيت الهوية
    aspect_ratio,      // 'match_input_image' أو نسب أخرى يدعمها الموديل
    guidance_scale,    // مثلاً 3.5
    safety_tolerance,  // 1..6
  } = req.body || {};

  if (!imageUrl || !prompt || !user_email) {
    return res.status(400).json({ error: 'Missing required fields: imageUrl, prompt, user_email' });
  }

  // ---- Supabase Session/Auth ----
  const supabase = createPagesServerClient({ req, res });
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (!session || sessionError) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // ---- بيانات المستخدم (الخطة/الكريدت) ----
  const { data: userData, error: userError } = await supabase
    .from('Data')
    .select('credits, plan')
    .eq('email', user_email)
    .single();

  if (userError || !userData) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (userData.plan !== 'Pro' && userData.credits <= 0) {
    return res.status(403).json({ error: 'No credits left' });
  }

  // ---- إعدادات التنفيذ الافتراضية حسب الخطة ----
  const outputs = clamp(
    typeof num_images === 'number' ? num_images : (userData.plan === 'Pro' ? 2 : 1),
    1, 3
  );

  const baseCall = {
    prompt,
    input_image: imageUrl,
    aspect_ratio: aspect_ratio || 'match_input_image',
    output_format: 'jpg',
    safety_tolerance: typeof safety_tolerance === 'number' ? safety_tolerance : 2,
    num_outputs: outputs,
    seed: typeof seed === 'number' ? seed : undefined,
    guidance_scale: typeof guidance_scale === 'number' ? guidance_scale : 3.5,
  };

  // ---- تشغيل أساسي + Retry ببرومبت مشدّد إن لزم ----
  const harden = (p) => `${p} Enforce exact sleeve/neckline/hem geometry, correct scale & alignment, avoid partial crops.`;

  // المحاولة الأولى
  let result = await callReplicateOnce(baseCall);

  // إذا فشل أو ما رجعت صور، جرّب مرة ثانية ببرومبت مشدّد
  if (result.error || !result.images?.length) {
    const retryCall = { ...baseCall, prompt: harden(prompt) };
    result = await callReplicateOnce(retryCall);
  }

  if (result.error || !result.images?.length) {
    return res.status(500).json({ error: result.error || 'No image returned' });
  }

  // أول صورة + كل التنويعات
  const variants = result.images;
  const first = variants[0];
  const usedSeed = result.seed ?? (typeof seed === 'number' ? seed : null);

  // ---- خصم كريدت لغير الـ Pro ----
  if (userData.plan !== 'Pro') {
    try {
      await supabase.rpc('decrement_credit', { user_email });
    } catch (e) {
      console.warn('decrement_credit failed:', e?.message || e);
    }
  }

  // ---- استجابة ----
  return res.status(200).json({
    success: true,
    image: first,
    variants,
    seed: usedSeed,
    plan: userData.plan,
  });
}
