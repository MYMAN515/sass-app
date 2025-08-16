import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;
  // ضع الهـاش الخاص بنسخة flux-vton هنا أو في env باسم TRYON_VERSION_ID
  const TRYON_VERSION_ID ='a02643ce418c0e12bad371c4adbfaec0dd1cb34b034ef37650ef205f92ad6199';

  if (!REPLICATE_TOKEN) return res.status(500).json({ error: 'Missing Replicate token' });
  if (!TRYON_VERSION_ID) return res.status(500).json({ error: 'Missing TRYON_VERSION_ID env' });

  // من الفرونت: image1 = الشخص، image2 = الملابس، pieceType = upper|lower|dress
  const { image1, image2, pieceType, user_email } = req.body;

  if (!image1 || !image2 || !user_email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // جلسة Supabase
  const supabase = createPagesServerClient({ req, res });
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (!session || sessionError) return res.status(401).json({ error: 'Unauthorized' });

  // بيانات المستخدم
  const { data: userData, error: userError } = await supabase
    .from('Data')
    .select('credits, plan')
    .eq('email', user_email)
    .single();

  if (userError || !userData) return res.status(404).json({ error: 'User not found' });
  if (userData.plan !== 'Pro' && userData.credits <= 0)
    return res.status(403).json({ error: 'No credits left' });

  // تحويل pieceType إلى part حسب الموديل
  const partMap = { upper: 'upper_body', lower: 'lower_body', dress: 'full_body' };
  const part = partMap[(pieceType || '').toLowerCase()] || 'upper_body';

  // استدعاء Replicate: /v1/predictions + version (بدون model)
  const start = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      Authorization: `Token ${REPLICATE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: TRYON_VERSION_ID,
      input: {
        image: image1,      // صورة الشخص
        garment: image2,    // صورة القطعة
        part,               // upper_body | lower_body | full_body
      },
    }),
  });

  const startData = await start.json();

  if (!start.ok || !startData?.urls?.get) {
    return res.status(500).json({
      error: startData?.error || 'Failed to start image generation',
      detail: startData,
    });
  }

  // Poll على نفس أسلوب enhance
  const statusUrl = startData.urls.get;
  let output = null;

  for (let i = 0; i < 20; i++) {
    const statusRes = await fetch(statusUrl, {
      headers: { Authorization: `Token ${REPLICATE_TOKEN}` },
    });
    const statusData = await statusRes.json();

    if (statusData.status === 'succeeded') {
      output = statusData.output; // حسب السكيمة: string URI
      break;
    }
    if (statusData.status === 'failed') {
      return res.status(500).json({ error: statusData?.error || 'Image generation failed' });
    }

    await new Promise((r) => setTimeout(r, 1500));
  }

  if (!output) return res.status(500).json({ error: 'Image generation timed out' });

  const generatedImage =
    typeof output === 'string'
      ? output
      : Array.isArray(output)
      ? output[0]
      : output?.url || output;

  // خصم كريدت لغير الـ Pro
  if (userData.plan !== 'Pro') {
    await supabase.rpc('decrement_credit', { user_email });
  }

  return res.status(200).json({ success: true, image: generatedImage });
}
