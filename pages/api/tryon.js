// /pages/api/tryon.js
// Next.js API Route — JavaScript فقط (لا JSX)

// حجم الجسم
export const config = { api: { bodyParser: { sizeLimit: '12mb' } } };

import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

/**
 * ملاحظات مهمّة:
 * - أرسل pieceType من الواجهة (upper | lower | dress).
 * - استخدم URLs مطلقة للصور؛ Replicate لا يفهم relative.
 * - نُجبر إخراج صورة واحدة ونمنع “قبل/بعد” عبر البرومبت والخيارات.
 */

const REPLICATE_URL =
  'https://api.replicate.com/v1/models/flux-kontext-apps/multi-image-kontext-max/predictions';

// --- إعدادات عامة للـ polling ---
const POLL_STEP_MS = 1500;
const POLL_MAX_MS = 90_000;

/** يبني برومبت واضح يفرض اللبس ويمنع الكولاج */
function buildPrompts({ userPrompt, negativePrompt, pieceType }) {
  const region = pieceType || 'upper';

  // لماذا: نص موجّه يمنع side-by-side ويوضح المطلوب من الموديل.
  const prompt = [
    userPrompt || 'Virtual try-on, photorealistic.',
    'Generate ONE single photo of the SAME person from image 1 WEARING the garment from image 2.',
    'Keep the ORIGINAL background, face, pose and camera.',
    `Replace ONLY the ${region} with the uploaded garment. Do NOT stack clothes.`,
    'Natural fit, correct scaling, seams aligned, neckline/sleeve from garment, realistic shadows & wrinkles.',
    'High-detail, sharp.'
  ].join(' ');

  const negative =
    (negativePrompt ? negativePrompt + ', ' : '') +
    'split screen, side-by-side, collage, before and after, duplicate person, twins, floating clothing, sticker overlay, text, watermark, border, wrong background, extra arms, extra hands';

  return { prompt, negative };
}

/** يحوّل أي URL إلى absolute بالاعتماد على أصل الطلب */
function toAbsoluteUrl(u, req) {
  try {
    return new URL(u).toString();
  } catch {
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host;
    return new URL(u, `${proto}://${host}`).toString();
  }
}

/** طلب إلى Replicate مع مدخلين (شخص + لباس) */
async function startReplicate({ token, image1, image2, prompt, negative, seed, aspectRatio, outputFormat, safetyTolerance }) {
  const res = await fetch(REPLICATE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      input: {
        // لماذا: بعض النسخ تقبل الاسمين، نمرر الاثنين لضمان التوافق.
        image_1: image1,
        input_image_1: image1,
        image_2: image2,
        input_image_2: image2,

        prompt,
        negative_prompt: negative,

        // لماذا: صورة واحدة ونسبة تطابق صورة الموديل حتى لا يتحفّز كولاج.
        num_outputs: 1,
        aspect_ratio: aspectRatio || 'match_image_1',

        seed: typeof seed === 'number' ? seed : 42,
        output_format: outputFormat || 'jpg',
        safety_tolerance: typeof safetyTolerance === 'number' ? safetyTolerance : 2
      }
    })
  });

  const data = await res.json();
  if (!res.ok || !data?.urls?.get) {
    const msg = data?.error || 'Failed to start prediction';
    const detail = data || {};
    const err = new Error(msg);
    err.detail = detail;
    throw err;
  }
  return data.urls.get; // status URL
}

/** polling حتى يكتمل أو يفشل */
async function waitForResult({ statusUrl, token }) {
  const t0 = Date.now();
  while (Date.now() - t0 < POLL_MAX_MS) {
    const r = await fetch(statusUrl, { headers: { Authorization: `Token ${token}` } });
    const s = await r.json();

    if (s?.status === 'succeeded') {
      const out = Array.isArray(s.output) ? s.output[0] : s.output;
      return { output: out, raw: s };
    }
    if (s?.status === 'failed' || s?.status === 'canceled') {
      const err = new Error('Image generation failed');
      err.detail = s;
      throw err;
    }
    await new Promise((ok) => setTimeout(ok, POLL_STEP_MS));
  }
  throw new Error('Image generation timed out');
}

/** خصم رصيد للمستخدم غير الـ Pro */
async function spendCreditIfNeeded({ supabase, plan, user_email }) {
  if (plan === 'Pro') return;
  try {
    await supabase.rpc('decrement_credit', { user_email });
  } catch {
    // تجاهل: لا نوقف الطلب بسبب فشل خصم الرصيد.
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;
  if (!REPLICATE_TOKEN) return res.status(500).json({ error: 'Missing REPLICATE_API_TOKEN' });

  // 1) قراءة المدخلات
  const {
    modelUrl,
    clothUrl,
    pieceType,               // مهم
    prompt: userPrompt,
    negativePrompt,
    user_email,

    // اختياري:
    aspect_ratio,
    seed,
    output_format,
    safety_tolerance
  } = req.body || {};

  // 2) تحقق من المدخلات
  const missing = [];
  if (!modelUrl) missing.push('modelUrl');
  if (!clothUrl) missing.push('clothUrl');
  if (!pieceType) missing.push('pieceType');
  if (!userPrompt) missing.push('prompt');
  if (!user_email) missing.push('user_email');
  if (missing.length) {
    return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
  }

  // 3) مصادقة Supabase + رصيد
  const supabase = createPagesServerClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const { data: userData, error: userErr } = await supabase
    .from('Data')
    .select('credits, plan')
    .eq('email', user_email)
    .single();

  if (userErr || !userData) return res.status(404).json({ error: 'User not found' });
  if (userData.plan !== 'Pro' && (userData.credits ?? 0) <= 0) {
    return res.status(403).json({ error: 'No credits left' });
  }

  try {
    // 4) تحويل الروابط إلى absolute
    const img1 = toAbsoluteUrl(modelUrl, req);
    const img2 = toAbsoluteUrl(clothUrl, req);

    // 5) بناء البرومبت
    const { prompt, negative } = buildPrompts({ userPrompt, negativePrompt, pieceType });

    // 6) البدء في Replicate
    const statusUrl = await startReplicate({
      token: REPLICATE_TOKEN,
      image1: img1,
      image2: img2,
      prompt,
      negative,
      seed,
      aspectRatio: aspect_ratio,
      outputFormat: output_format,
      safetyTolerance: safety_tolerance
    });

    // 7) الانتظار حتى النتيجة
    const { output, raw } = await waitForResult({ statusUrl, token: REPLICATE_TOKEN });
    if (!output) throw new Error('Empty output from Replicate');

    // 8) خصم رصيد إذا لزم
    await spendCreditIfNeeded({ supabase, plan: userData.plan, user_email });

    // 9) إرجاع النتيجة
    return res.status(200).json({
      success: true,
      image: output,
      model: 'flux-kontext-apps/multi-image-kontext-max',
      used_images: [img1, img2],
      pieceType
      // ملاحظة: لا نعيد الـ prompt للعميل إلا للديبَغ.
    });
  } catch (err) {
    const detail = err?.detail || undefined; // إن وُجدت تفاصيل من Replicate
    return res.status(500).json({
      error: err?.message || 'Try-on failed',
      detail
    });
  }
}
