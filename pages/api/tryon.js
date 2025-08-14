// /pages/api/tryon.js
// Next.js API Route — Multi-Image فقط (شخص + لبس)

import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export const config = {
  api: { bodyParser: true }, // نحافظ على أسلوبك
};

const REPLICATE_URL =
  'https://api.replicate.com/v1/models/flux-kontext-apps/multi-image-kontext-max/predictions';

const POLL_STEP_MS = 1500;
const POLL_MAX_MS  = 90_000;

/* ------------ helpers (تعليقات "لماذا" فقط) ------------ */
function toAbsoluteUrl(u, req) {
  // Why: Replicate لا يجلب relative
  try { return new URL(u).toString(); }
  catch {
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const host  = req.headers.host;
    return new URL(u, `${proto}://${host}`).toString();
  }
}

async function assertPublicImage(url) {
  // Why: نفشل مبكرًا لو الرابط غير علني أو ليس صورة
  const r = await fetch(url, { method: 'HEAD' }).catch(() => null);
  if (!r || !r.ok) throw new Error(`Image not reachable: ${url}`);
  const ct = r.headers.get('content-type') || '';
  if (!ct.startsWith('image/')) throw new Error(`URL is not an image: ${url}`);
}

function regionHint(pieceType) {
  if (pieceType === 'upper')
    return 'Align shoulders & neckline; correct sleeve length; keep chest prints/logos exactly.';
  if (pieceType === 'lower')
    return 'Align waist/hips; correct rise & inseam; keep pockets and stitching.';
  return 'Align shoulders/neckline & waist; correct hem; keep pattern continuity.'; // dress
}

function buildPrompts({ userPrompt, negativePrompt, pieceType }) {
  // Why: صورة واحدة، الخلفية/الوجه كما هي، تثبيت الطباعة/الشعار
  const region = pieceType || 'upper';
  const prompt = [
    userPrompt || 'Photorealistic virtual try-on, high fidelity.',
    'Use IMAGE 1 as person AND background; keep face, hair, pose, camera and lighting IDENTICAL.',
    `Replace ONLY the ${region} with the garment from IMAGE 2. Do NOT stack clothes.`,
    'Reproduce fabric, color, buttons, collar/pockets and ALL prints/logos at exact position and scale.',
    regionHint(region),
    'Natural fit and drape; realistic wrinkles, seams and shadows.',
    'Single photo only.'
  ].join(' ');

  const negative =
    (negativePrompt ? negativePrompt + ', ' : '') +
    'split screen, side-by-side, collage, before and after, duplicate person, twins, floating clothing, overlay sticker, text, watermark, border, wrong background, blur, smudged print, extra arms, extra hands';

  return { prompt, negative };
}

/* ------------ handler ------------ */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;
  if (!REPLICATE_TOKEN) return res.status(500).json({ error: 'Missing Replicate token' });

  const {
    modelUrl,        // صورة الشخص/المودل
    clothUrl,        // صورة القطعة
    pieceType,       // upper | lower | dress
    prompt,          // وصف المستخدم
    negativePrompt,  // اختياري
    user_email,      // لحساب الرصيد

    // اختياري:
    aspect_ratio,
    seed,
    output_format,
    safety_tolerance,
  } = req.body || {};

  // required
  const missing = [];
  if (!modelUrl)   missing.push('modelUrl');
  if (!clothUrl)   missing.push('clothUrl');
  if (!pieceType)  missing.push('pieceType');
  if (!prompt)     missing.push('prompt');
  if (!user_email) missing.push('user_email');
  if (missing.length) return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });

  // Supabase auth + credits
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

  try {
    // URLs مطلقة + علنية
    const img1 = toAbsoluteUrl(modelUrl, req);
    const img2 = toAbsoluteUrl(clothUrl, req);
    await assertPublicImage(img1);
    await assertPublicImage(img2);

    // برومبت
    const { prompt: posPrompt, negative } = buildPrompts({ userPrompt: prompt, negativePrompt, pieceType });

    // بدء التوليد
    const start = await fetch(REPLICATE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Token ${REPLICATE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          // Why: تمرير التسميتين لسهولة التوافق
          image_1: img1, input_image_1: img1,
          image_2: img2, input_image_2: img2,
          prompt: posPrompt,
          negative_prompt: negative,
          num_outputs: 1,                                 // صورة واحدة
          aspect_ratio: aspect_ratio || 'match_image_1',  // طابق نسبة صورة المودل
          seed: typeof seed === 'number' ? seed : 42,     // ثبات
          output_format: output_format || 'jpg',
          safety_tolerance: typeof safety_tolerance === 'number' ? safety_tolerance : 2,
        }
      }),
    });

    const startData = await start.json().catch(() => ({}));
    if (!start.ok || !startData?.urls?.get) {
      console.error('Replicate start error:', { status: start.status, startData });
      return res.status(500).json({
        error: startData?.error?.message || startData?.error || 'Failed to start prediction',
        detail: startData
      });
    }

    // Poll حتى 90 ثانية تقريبًا
    const statusUrl = startData.urls.get;
    let output = null;
    for (let i = 0; i < Math.ceil(POLL_MAX_MS / POLL_STEP_MS); i++) {
      const statusRes = await fetch(statusUrl, { headers: { Authorization: `Token ${REPLICATE_TOKEN}` } });
      const s = await statusRes.json();
      if (s?.status === 'succeeded') { output = s.output; break; }
      if (s?.status === 'failed' || s?.status === 'canceled') {
        return res.status(500).json({ error: 'Image generation failed', detail: s });
      }
      await new Promise(r => setTimeout(r, POLL_STEP_MS));
    }

    if (!output) return res.status(500).json({ error: 'Image generation timed out' });
    const generatedImage = Array.isArray(output) ? output[0] : output;

    // خصم رصيد لغير الـ Pro
    if (userData.plan !== 'Pro') {
      try { await supabase.rpc('decrement_credit', { user_email }); } catch { /* ignore */ }
    }

    return res.status(200).json({
      success: true,
      image: generatedImage,
      model: 'flux-kontext-apps/multi-image-kontext-max',
      pieceType,
      used_images: [img1, img2]
    });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Try-on failed' });
  }
}
