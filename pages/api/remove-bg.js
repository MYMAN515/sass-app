// pages/api/remove-bg.js
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

/**
 * المدخلات (JSON):
 * - imageUrl: رابط الصورة المراد إزالة خلفيتها
 * - engine: "best" | "fast"  (اختياري، الافتراضي "best")
 * - background: "rgba" | "white" | "green" | "blur"  (اختياري، الافتراضي "rgba" — شفاف)
 * - user_email: بريد المستخدم (نفس جدولك)
 *
 * المخرجات:
 * - { success: true, image: <url> }
 */

export const config = {
  api: { bodyParser: true },
};

const REPLICATE_VERSION_851 =
  '851-labs/background-remover:a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc';

const REPLICATE_VERSION_LUCATACO =
  'lucataco/remove-bg:95fcc2a26d3899cd6c2691c900465aaeff466285a65c14638cc5f36f34befaf1';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  const { imageUrl, user_email, engine = 'best', background = 'rgba' } = req.body;
  const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;
  if (!REPLICATE_TOKEN) return res.status(500).json({ error: 'Missing Replicate token' });

  if (!imageUrl || !user_email) {
    return res.status(400).json({ error: 'Missing required fields (imageUrl, user_email)' });
  }

  // Supabase session check
  const supabase = createPagesServerClient({ req, res });
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (!session || sessionError) return res.status(401).json({ error: 'Unauthorized' });

  // Fetch user credits/plan
  const { data: userData, error: userError } = await supabase
    .from('Data')
    .select('credits, plan')
    .eq('email', user_email)
    .single();

  if (userError || !userData) return res.status(404).json({ error: 'User not found' });
  const isPro = userData.plan === 'Pro';
  if (!isPro && userData.credits <= 0) return res.status(403).json({ error: 'No credits left' });

  // Choose model & inputs
  const use851 = String(engine).toLowerCase() !== 'fast';
  const modelVersion = use851 ? REPLICATE_VERSION_851 : REPLICATE_VERSION_LUCATACO;

  // لكل موديل شكل إدخال مختلف
  const input = use851
    ? {
        image: imageUrl,
        // خيارات 851-labs (شفاف/أبيض/أخضر/ضبابي)
        background_type: ['rgba', 'white', 'green', 'blur'].includes(background) ? background : 'rgba',
        format: 'png',
        threshold: 0, // alpha ناعم
      }
    : {
        image: imageUrl, // lucataco/remove-bg يقبل الصورة فقط ويرجع رابط الناتج
      };

  // Start prediction
  const start = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      Authorization: `Token ${REPLICATE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: modelVersion,
      input,
    }),
  });

  const startData = await start.json();
  if (!start.ok || !startData?.urls?.get) {
    return res.status(500).json({
      error: startData?.error || 'Failed to start prediction',
      detail: startData,
    });
  }

  // Polling
  const statusUrl = startData.urls.get;
  let output = null;

  for (let i = 0; i < 20; i++) {
    const statusRes = await fetch(statusUrl, {
      headers: { Authorization: `Token ${REPLICATE_TOKEN}` },
    });
    const statusData = await statusRes.json();

    if (statusData.status === 'succeeded') {
      output = statusData.output;
      break;
    }
    if (statusData.status === 'failed') {
      return res.status(500).json({ error: 'Background removal failed' });
    }
    await new Promise((r) => setTimeout(r, 1500));
  }

  if (!output) return res.status(500).json({ error: 'Prediction timed out' });

  // Normalize output
  const resultImage = Array.isArray(output) ? output[0] : output;

  // Deduct credit (if not Pro)
  if (!isPro) {
    await supabase.rpc('decrement_credit', { user_email });
  }

  return res.status(200).json({ success: true, image: resultImage });
}
