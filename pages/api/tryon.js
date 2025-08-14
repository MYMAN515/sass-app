// /pages/api/tryon.js
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export const config = { api: { bodyParser: true } };

const REPLICATE_PREDICT_URL = 'https://api.replicate.com/v1/predictions';
const REPLICATE_MODEL_URL   = 'https://api.replicate.com/v1/models';
const POLL_STEP_MS = 1500;
const POLL_MAX_MS  = 90_000;

/* ------------ helpers ------------ */
function toAbsoluteUrl(u, req) {
  try { return new URL(u).toString(); }
  catch {
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const host  = req.headers.host;
    return new URL(u, `${proto}://${host}`).toString();
  }
}

async function assertPublicImage(url) {
  const r = await fetch(url, { method: 'HEAD' }).catch(() => null);
  if (!r || !r.ok) return; // بعض CDNs يحجب HEAD
  const ct = (r.headers.get('content-type') || '').toLowerCase();
  if (!(ct.startsWith('image/') || ct === 'application/octet-stream')) {
    throw new Error(`URL is not an image: ${url} (${ct})`);
  }
}

function buildTryOnPrompt(pieceType, userPrompt) {
  const pt = (pieceType || 'upper').toLowerCase();
  const scope =
    pt === 'upper'
      ? 'Replace ONLY the TOP with the garment from IMAGE 2. Do NOT stack clothes.'
      : pt === 'lower'
      ? 'Replace ONLY the BOTTOM (pants/skirt) with the garment from IMAGE 2. Do NOT stack clothes.'
      : 'Replace the FULL OUTFIT with the garment from IMAGE 2 as a one-piece dress. Do NOT stack clothes.';

  const base = [
    'Photorealistic virtual try-on.',
    'Use IMAGE 1 as the person AND background; keep face, hair, body shape, pose, camera and lighting IDENTICAL.',
    scope,
    'Reproduce fabric, color, pattern, buttons and prints/logos with correct position and scale.',
    pt === 'upper'
      ? 'Align shoulder seams and neckline; correct sleeve length.'
      : pt === 'lower'
      ? 'Align waist/hips; accurate rise and inseam.'
      : 'Align neckline, shoulders, waist and hem.',
    'Natural fit and drape; realistic wrinkles, seams and shadows.',
    'Single final photo, uncropped, sharp 4k.'
  ].join(' ');

  return userPrompt ? `${base} ${userPrompt}` : base;
}

/** يبدأ توقع Replicate:
 *  - يحاول إرسال { model: owner/name }
 *  - إن رجع 400 وفيه "version is required" → يجلب latest_version.id ويعيد بـ { version }
 */
async function startReplicate({ token, modelName, input }) {
  const common = {
    method: 'POST',
    headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
  };

  // المحاولة الأولى بـ model
  let start = await fetch(REPLICATE_PREDICT_URL, {
    ...common,
    body: JSON.stringify({ model: modelName, input }),
  });

  let data = await start.json().catch(() => ({}));
  const needsVersion =
    start.status === 400 &&
    (data?.error?.includes?.('version is required') ||
     data?.detail?.includes?.('version is required') ||
     JSON.stringify(data).toLowerCase().includes('version is required'));

  if (!needsVersion) return { resp: start, json: data };

  // جلب أحدث نسخة
  const meta = await fetch(`${REPLICATE_MODEL_URL}/${modelName}`, {
    headers: { Authorization: `Token ${token}` },
  }).then(r => r.json()).catch(() => ({}));

  const versionId = meta?.latest_version?.id || meta?.versions?.[0]?.id;
  if (!versionId) {
    return {
      resp: { ok: false, status: 400 },
      json: { error: 'Replicate model version not found', detail: meta }
    };
  }

  // إعادة الإرسال بـ version
  start = await fetch(REPLICATE_PREDICT_URL, {
    ...common,
    body: JSON.stringify({ version: versionId, input }),
  });
  data = await start.json().catch(() => ({}));
  return { resp: start, json: data };
}

/* ------------ handler ------------ */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;
  if (!REPLICATE_TOKEN) return res.status(500).json({ error: 'Missing Replicate token' });

  const {
    modelUrl, clothUrl, pieceType, prompt, user_email,
    aspect_ratio, seed, output_format, safety_tolerance,
  } = req.body || {};

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
    const img1 = toAbsoluteUrl(modelUrl, req);
    const img2 = toAbsoluteUrl(clothUrl, req);
    await Promise.all([assertPublicImage(img1), assertPublicImage(img2)]);

    const finalPrompt = buildTryOnPrompt(pieceType, prompt);

    // ابدأ التوقع (مع fallback للـ version)
    const { resp: start, json: startData } = await startReplicate({
      token: REPLICATE_TOKEN,
      modelName: 'flux-kontext-apps/multi-image-kontext-max',
      input: {
        image_1: img1, input_image_1: img1,
        image_2: img2, input_image_2: img2,
        prompt: finalPrompt,
        num_outputs: 1,
        aspect_ratio: aspect_ratio || 'match_image_1',
        seed: typeof seed === 'number' ? seed : 42,
        output_format: output_format || 'jpg',
        safety_tolerance: typeof safety_tolerance === 'number' ? safety_tolerance : 2,
      }
    });

    if (!start.ok || !startData?.urls?.get) {
      const msg = startData?.error?.message || startData?.error || startData?.detail || 'Failed to start prediction';
      console.error('Replicate start error:', { status: start.status, startData });
      return res.status(500).json({ error: msg, detail: startData });
    }

    // Poll
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

    if (userData.plan !== 'Pro') {
      try { await supabase.rpc('decrement_credit', { user_email }); } catch {}
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
