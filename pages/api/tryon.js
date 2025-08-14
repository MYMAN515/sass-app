// /pages/api/tryon.js
// Next.js API Route — Try-On (شخص + قطعة لبس) بدون negative prompt

import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export const config = { api: { bodyParser: true } };

const REPLICATE_URL = 'https://api.replicate.com/v1/predictions';
const POLL_STEP_MS = 1500;
const POLL_MAX_MS  = 90_000;

/* ------------ helpers ------------ */
// يعيد URL مطلق حتى لو وصلك relative
function toAbsoluteUrl(u, req) {
  try { return new URL(u).toString(); }
  catch {
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const host  = req.headers.host;
    return new URL(u, `${proto}://${host}`).toString();
  }
}

// نتحقق بشكل مرن — بعض CDNs/Supabase يرجّع octet-stream أو يحجب HEAD
async function assertPublicImage(url) {
  const r = await fetch(url, { method: 'HEAD' }).catch(() => null);
  if (!r || !r.ok) return; // لا نفشل بدري لو HEAD محجوب
  const ct = (r.headers.get('content-type') || '').toLowerCase();
  if (!(ct.startsWith('image/') || ct === 'application/octet-stream')) {
    throw new Error(`URL is not an image: ${url} (${ct})`);
  }
}

// نص برومبت مضبوط حسب نوع القطعة؛ يدمج أي نص إضافي من المستخدم (اختياري)
function buildTryOnPrompt(pieceType, userPrompt) {
  const pt = (pieceType || 'upper').toLowerCase();
  let scope;
  if (pt === 'upper') {
    scope = 'Replace ONLY the TOP with the garment from IMAGE 2. Do NOT stack clothes.';
  } else if (pt === 'lower') {
    scope = 'Replace ONLY the BOTTOM (pants/skirt) with the garment from IMAGE 2. Do NOT stack clothes.';
  } else {
    scope = 'Replace the FULL OUTFIT with the garment from IMAGE 2 as a one-piece dress. Do NOT stack clothes.';
  }

  const base = [
    'Photorealistic virtual try-on.',
    'Use IMAGE 1 as the person AND background; keep face, hair, body shape, pose, camera and lighting IDENTICAL.',
    scope,
    'Reproduce the exact fabric, color, pattern, buttons, collar/pockets and prints/logos with correct position and scale.',
    pt === 'upper'
      ? 'Align shoulder seams and neckline precisely; correct sleeve length.'
      : pt === 'lower'
      ? 'Align waist/hips correctly; accurate rise and inseam.'
      : 'Align neckline, shoulders, waist and hem correctly.',
    'Natural fit and drape; realistic wrinkles, seams and shadows.',
    'Single final photo, uncropped, sharp 4k.'
  ].join(' ');

  // نضيف أي وصف إضافي يرسله المستخدم بدون ما نلخبط القواعد الأساسية
  return userPrompt ? `${base} ${userPrompt}` : base;
}

/* ------------ handler ------------ */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;
  if (!REPLICATE_TOKEN) return res.status(500).json({ error: 'Missing Replicate token' });

  const {
    modelUrl,        // صورة الشخص/المودل (IMAGE 1)
    clothUrl,        // صورة القطعة (IMAGE 2)
    pieceType,       // upper | lower | dress
    prompt,          // (مطلوب) وصف إضافي من الواجهة الأمامية
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
  if (!prompt)     missing.push('prompt'); // نبقيها مطلوبة زي أسلوبك
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
    // URLs مطلقة + تحقق مرن
    const img1 = toAbsoluteUrl(modelUrl, req);
    const img2 = toAbsoluteUrl(clothUrl, req);
    await Promise.all([assertPublicImage(img1), assertPublicImage(img2)]);

    // برومبت نهائي (بدون negative)
    const finalPrompt = buildTryOnPrompt(pieceType, prompt);

    // بدء التوليد — نستخدم endpoint العام ونمرر اسم الموديل
    const start = await fetch(REPLICATE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Token ${REPLICATE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'flux-kontext-apps/multi-image-kontext-max',
        input: {
          // نُمرّر التسميتين لضمان التوافق
          image_1: img1, input_image_1: img1,
          image_2: img2, input_image_2: img2,
          prompt: finalPrompt,
          num_outputs: 1,
          aspect_ratio: aspect_ratio || 'match_image_1',
          seed: typeof seed === 'number' ? seed : 42,
          output_format: output_format || 'jpg',
          safety_tolerance: typeof safety_tolerance === 'number' ? safety_tolerance : 2,
        }
      }),
    });

    const startData = await start.json().catch(() => ({}));
    if (!start.ok || !startData?.urls?.get) {
      const msg =
        startData?.error?.message ||
        startData?.detail ||
        (typeof startData === 'string' ? startData : '') ||
        'Failed to start prediction';
      console.error('Replicate start error:', { status: start.status, startData });
      return res.status(500).json({ error: msg, detail: startData });
    }

    // Poll حتى 90 ثانية
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
