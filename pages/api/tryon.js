// /pages/api/tryon.js
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export const config = { api: { bodyParser: true } };

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;
  const TRYON_VERSION_ID =
    process.env.TRYON_VERSION_ID ||
    'a02643ce418c0e12bad371c4adbfaec0dd1cb34b034ef37650ef205f92ad6199'; // flux-vton

  if (!REPLICATE_TOKEN) return res.status(500).json({ error: 'Missing Replicate token' });
  if (!TRYON_VERSION_ID) return res.status(500).json({ error: 'Missing TRYON_VERSION_ID env' });

  // من الفرونت: image1 = الشخص، image2 = الملابس، pieceType = upper|lower|dress
  const { image1, image2, pieceType, user_email } = req.body;
  if (!image1 || !image2 || !user_email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Supabase session + رصيد
  const supabase = createPagesServerClient({ req, res });
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (!session || sessionError) return res.status(401).json({ error: 'Unauthorized' });

  const { data: userData, error: userError } = await supabase
    .from('Data').select('credits, plan').eq('email', user_email).single();
  if (userError || !userData) return res.status(404).json({ error: 'User not found' });
  if (userData.plan !== 'Pro' && userData.credits <= 0)
    return res.status(403).json({ error: 'No credits left' });

  // map pieceType -> part كما يتوقع الموديل
  const partMap = { upper: 'upper_body', lower: 'lower_body', dress: 'full_body' };
  const part = partMap[(pieceType || '').toLowerCase()] || 'upper_body';

  // بدء التنبؤ
  const startRes = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      Authorization: `Token ${REPLICATE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: TRYON_VERSION_ID,      // ملاحظة: لا نرسل "model" هنا
      input: { image: image1, garment: image2, part },
    }),
  });

  const startData = await startRes.json();
  if (!startRes.ok || !startData?.urls?.get) {
    const errMsg = startData?.error || 'Failed to start image generation';
    return res.status(/required|allowed|version|model|input/i.test(errMsg) ? 400 : 500)
      .json({ error: errMsg, detail: startData });
  }

  // ------- Poll أدق لمدة دقيقة -------
  const statusUrl = startData.urls.get;
  const startedAt = Date.now();
  const maxWaitMs = 90_000;            // ⏱️ دقيقة واحدة بالضبط
  let intervalMs = 1200;               // يبدأ 1.2s
  const maxIntervalMs = 4000;

  let lastStatus = 'queued';
  let prediction = startData;

  while (Date.now() - startedAt < maxWaitMs) {
    const statusRes = await fetch(statusUrl, {
      headers: { Authorization: `Token ${REPLICATE_TOKEN}` },
    });

    // في حال rate limit/429: احترم Retry-After
    if (statusRes.status === 429) {
      const ra = Number(statusRes.headers.get('retry-after') || '1');
      await sleep(Math.min(Math.max(ra * 1000, 1000), 5000));
      continue;
    }

    if (!statusRes.ok) {
      // على 5xx نعطي فرصة أخرى مع backoff
      intervalMs = Math.min(intervalMs * 1.4, maxIntervalMs);
      await sleep(intervalMs + Math.floor(Math.random() * 250));
      continue;
    }

    prediction = await statusRes.json();
    const st = prediction?.status;

    // حالات التقدّم
    if (st === 'succeeded') break;
    if (st === 'failed' || st === 'canceled') {
      return res.status(500).json({ error: prediction?.error || `Prediction ${st}` });
    }

    // في حالات queued/starting/processing نستمر
    lastStatus = st || lastStatus;

    // backoff لطيف + jitter
    intervalMs = Math.min(
      st === 'processing' ? intervalMs * 1.15 : intervalMs * 1.3,
      maxIntervalMs
    );
    await sleep(intervalMs + Math.floor(Math.random() * 200));
  }

  // بعد الدقيقة
  if (!prediction || prediction.status !== 'succeeded') {
    // نرجّع رسالة واضحة أنه ما زال يعمل
    return res.status(504).json({
      error: 'Prediction still running after 60s',
      status: prediction?.status || 'unknown',
      id: prediction?.id,
      get_url: prediction?.urls?.get,
    });
  }

  // إخراج الصورة (الموديل يرجّع URI واحد)
  const out = prediction.output;
  const generatedImage =
    typeof out === 'string' ? out : Array.isArray(out) ? out[0] : out?.url || out;

  if (!generatedImage) {
    return res.status(500).json({ error: 'No image returned from model.' });
  }

  // خصم الكريديت لغير الـ Pro
  if (userData.plan !== 'Pro') {
    await supabase.rpc('decrement_credit', { user_email });
  }

  const durationMs = Date.now() - startedAt;
  return res.status(200).json({
    success: true,
    image: generatedImage,
    meta: { status: 'succeeded', durationMs, id: prediction.id },
  });
}
