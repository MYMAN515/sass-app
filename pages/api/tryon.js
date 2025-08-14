// /pages/api/tryon.js
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export const config = { api: { bodyParser: { sizeLimit: '12mb' } } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;
  if (!REPLICATE_TOKEN) return res.status(500).json({ error: 'Missing Replicate token' });

  const {
    modelUrl, clothUrl, prompt, negativePrompt, user_email,
    aspect_ratio, seed, output_format, safety_tolerance
  } = req.body || {};

  if (!modelUrl || !clothUrl || !prompt || !user_email) {
    return res.status(400).json({ error: 'Missing required fields (modelUrl, clothUrl, prompt, user_email)' });
  }

  // Supabase auth + credits
  const supabase = createPagesServerClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const { data: userData } = await supabase
    .from('Data').select('credits, plan').eq('email', user_email).single();
  if (!userData) return res.status(404).json({ error: 'User not found' });
  if (userData.plan !== 'Pro' && (userData.credits ?? 0) <= 0) {
    return res.status(403).json({ error: 'No credits left' });
  }

  // تأكد أن الروابط مطلقة
  const makeAbs = (u) => {
    try { return new URL(u).toString(); }
    catch {
      const proto = req.headers['x-forwarded-proto'] || 'https';
      const host = req.headers.host;
      return new URL(u, `${proto}://${host}`).toString();
    }
  };
  const img1 = makeAbs(modelUrl);
  const img2 = makeAbs(clothUrl);

  // برومبت مضبوطة لتفادي الـ side-by-side وإجبار اللبس
  const positive =
    `${prompt} Generate ONE single photo of the SAME person from image 1 WEARING the garment from image 2. ` +
    `No split-screen, no collage, no before/after. Preserve the original background, face, pose and camera. ` +
    `Replace ONLY the ${req.body.pieceType || 'top'} with the garment. Fit naturally with correct shadows & wrinkles.`;
  const negative =
    (negativePrompt ? negativePrompt + ', ' : '') +
    'split screen, side-by-side, collage, before and after, duplicate person, twins, floating clothing, overlaid garment, text, watermark, border, wrong background, extra arms, extra hands';

  // ✅ استخدم endpoint المودل مباشرة + مرّر الاسمين لكل صورة
  const start = await fetch(
    'https://api.replicate.com/v1/models/flux-kontext-apps/multi-image-kontext-max/predictions',
    {
      method: 'POST',
      headers: {
        Authorization: `Token ${REPLICATE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          // الصورتان (ندعم الاسمين)
          image_1: img1, input_image_1: img1,
          image_2: img2, input_image_2: img2,

          prompt: positive,
          negative_prompt: negative,

          // خيارات عامة
          aspect_ratio: aspect_ratio || 'match_input_image',
          seed: typeof seed === 'number' ? seed : 42,
          output_format: output_format || 'jpg',
          safety_tolerance: typeof safety_tolerance === 'number' ? safety_tolerance : 2,
        }
      }),
    }
  );

  const startData = await start.json();
  if (!start.ok || !startData?.urls?.get) {
    return res.status(500).json({ error: startData?.error || 'Failed to start', detail: startData });
  }

  // Poll until done (حد أقصى ~90 ثانية)
  const statusUrl = startData.urls.get;
  const MAX_MS = 90_000;
  const STEP_MS = 1500;
  const t0 = Date.now();
  let output;

  while (Date.now() - t0 < MAX_MS) {
    const statusRes = await fetch(statusUrl, { headers: { Authorization: `Token ${REPLICATE_TOKEN}` } });
    const s = await statusRes.json();

    if (s?.status === 'succeeded') { output = s.output; break; }
    if (s?.status === 'failed' || s?.status === 'canceled') {
      return res.status(500).json({ error: 'Image generation failed', detail: s });
    }
    // أحيانًا يرمي تحذير "could not download image X" — يرجع بالـ detail
    await new Promise(r => setTimeout(r, STEP_MS));
  }
  if (!output) return res.status(500).json({ error: 'Image generation timed out' });

  const generatedImage = Array.isArray(output) ? output[0] : output;

  // خصم رصيد لو مستخدم عادي
  if (userData.plan !== 'Pro') {
    try { await supabase.rpc('decrement_credit', { user_email }); } catch {}
  }

  return res.status(200).json({
    success: true,
    image: generatedImage,
    model: 'flux-kontext-apps/multi-image-kontext-max',
    used_images: [img1, img2],
  });
}
