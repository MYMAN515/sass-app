// /pages/api/tryon.js
// Next.js API Route — JavaScript فقط (بدون JSX)

import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export const config = { api: { bodyParser: { sizeLimit: '12mb' } } };

const REPLICATE_URL =
  'https://api.replicate.com/v1/models/flux-kontext-apps/multi-image-kontext-max/predictions';

const POLL_STEP_MS = 1500;
const POLL_MAX_MS  = 90_000;

/* ---------------- helpers (WHY only) ---------------- */
function absUrl(u, req) {
  // Why: Replicate يحتاج روابط مطلقة
  try { return new URL(u).toString(); }
  catch {
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const host  = req.headers.host;
    return new URL(u, `${proto}://${host}`).toString();
  }
}

async function assertPublicImage(url) {
  // Why: نفشل مبكراً إذا غير علني/ليست صورة
  const r = await fetch(url, { method: 'HEAD' }).catch(() => null);
  if (!r || !r.ok) throw new Error(`Image not reachable: ${url}`);
  const ct = r.headers.get('content-type') || '';
  if (!ct.startsWith('image/')) throw new Error(`URL is not an image: ${url}`);
}

function regionHints(region) {
  // Why: ضبط ملاءمة حسب نوع القطعة
  if (region === 'upper') {
    return 'Align shoulder seams and neckline from garment; correct sleeve length and cuff; respect chest prints/logos exactly.';
  }
  if (region === 'lower') {
    return 'Align waist and hips; correct rise and inseam; preserve pocket placement; respect fabric texture and stitching.';
  }
  // dress
  return 'Align neckline/shoulders and waist; correct hem length; natural drape from shoulders to hem; keep pattern continuity.';
}

function buildPrompts({ userPrompt, negativePrompt, pieceType }) {
  // Why: فرض صورة واحدة، الحفاظ على الخلفية والوجه، وتثبيت الطباعة/الشعار بدقة
  const region = pieceType || 'upper';

  const prompt = [
    userPrompt || 'Photorealistic virtual try-on, high fidelity, 4k sharp.',
    'Use IMAGE 1 as the person AND background; keep face, hair, body shape, pose, camera, lighting IDENTICAL.',
    'Replace ONLY the ' + region + ' with the garment from IMAGE 2.',
    'Reproduce the garment EXACTLY: fabric, color, weave, buttons, collar/pockets, and ALL prints/logos/emblems (e.g., Jordan flag) at the correct location and scale — do not redraw or simplify.',
    'Do NOT stack clothing; remove the original clothing in that region.',
    regionHints(region),
    'Natural fit and drape with correct perspective; realistic wrinkles, seams, and shadows.',
    'Single photo — no borders, no comparisons, no extra people.'
  ].join(' ');

  const negative =
    (negativePrompt ? negativePrompt + ', ' : '') +
    'split screen, side-by-side, collage, before and after, duplicate person, twins, floating clothing, overlayed sticker, text, watermark, border, wrong background, mismatched pose, blur, smudged print, washed-out colors, extra arms, extra hands';

  return { prompt, negative };
}

async function startReplicate({ token, image1, image2, prompt, negative, seed, aspectRatio, outputFormat, safetyTolerance }) {
  const res = await fetch(REPLICATE_URL, {
    method: 'POST',
    headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: {
        // Why: بعض الإصدارات تقبل تسميتين
        image_1: image1, input_image_1: image1,
        image_2: image2, input_image_2: image2,
        prompt, negative_prompt: negative,
        num_outputs: 1,                   // Why: نتيجة واحدة لتفادي الكولاج
        aspect_ratio: aspectRatio || 'match_image_1', // Why: طابق نسبة صورة الموديل
        seed: typeof seed === 'number' ? seed : 42,   // Why: ثبات
        output_format: outputFormat || 'jpg',
        safety_tolerance: typeof safetyTolerance === 'number' ? safetyTolerance : 2
      }
    })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.urls?.get) {
    const friendly =
      data?.error?.message ||
      data?.error ||
      (res.status === 401 ? 'Invalid REPLICATE_API_TOKEN.' :
       res.status === 400 ? 'Bad input. Check that both image URLs are public images.' :
       'Failed to start prediction');
    const err = new Error(friendly);
    err.detail = data;
    throw err;
  }
  return data.urls.get; // status URL
}

async function pollResult({ statusUrl, token }) {
  // Why: انتظار منضبط مع مهلة
  const t0 = Date.now();
  while (Date.now() - t0 < POLL_MAX_MS) {
    const r = await fetch(statusUrl, { headers: { Authorization: `Token ${token}` } });
    const s = await r.json();
    if (s?.status === 'succeeded') {
      const out = Array.isArray(s.output) ? s.output[0] : s.output;
      return { output: out, raw: s };
    }
    if (s?.status === 'failed' || s?.status === 'canceled') {
      const e = new Error('Image generation failed');
      e.detail = s;
      throw e;
    }
    await new Promise((ok) => setTimeout(ok, POLL_STEP_MS));
  }
  throw new Error('Image generation timed out');
}

/* ---------------- handler ---------------- */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;
  if (!REPLICATE_TOKEN) return res.status(500).json({ error: 'Missing REPLICATE_API_TOKEN' });

  const {
    modelUrl,
    clothUrl,
    pieceType,              // upper | lower | dress
    prompt: userPrompt,
    negativePrompt,
    user_email,
    // optional
    aspect_ratio,
    seed,
    output_format,
    safety_tolerance,
    debug                    // Why: لعرض البرومبت في الرد عند الحاجة
  } = req.body || {};

  // Required
  const missing = [];
  if (!modelUrl)   missing.push('modelUrl');
  if (!clothUrl)   missing.push('clothUrl');
  if (!pieceType)  missing.push('pieceType');
  if (!userPrompt) missing.push('prompt');
  if (!user_email) missing.push('user_email');
  if (missing.length) return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });

  // Auth + credits
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
    // Absolute + public
    const img1 = absUrl(modelUrl, req);
    const img2 = absUrl(clothUrl, req);
    await assertPublicImage(img1);
    await assertPublicImage(img2);

    // Prompts
    const { prompt, negative } = buildPrompts({ userPrompt, negativePrompt, pieceType });

    // Start + poll
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

    const { output, raw } = await pollResult({ statusUrl, token: REPLICATE_TOKEN });
    if (!output) throw new Error('Empty output from Replicate');

    // Spend credit if not Pro
    if (userData.plan !== 'Pro') {
      try { await supabase.rpc('decrement_credit', { user_email }); } catch {}
    }

    return res.status(200).json({
      success: true,
      image: output,
      model: 'flux-kontext-apps/multi-image-kontext-max',
      pieceType,
      used_images: [img1, img2],
      ...(debug ? { debug: { prompt, negative, raw } } : {})
    });
  } catch (err) {
    return res.status(500).json({
      error: err?.message || 'Try-on failed',
      detail: err?.detail
    });
  }
}
