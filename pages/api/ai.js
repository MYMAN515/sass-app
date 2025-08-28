import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import Replicate from 'replicate';

export const config = {
  api: { bodyParser: true },
};

// --------- إعدادات ---------
const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;
const MODEL_ID = 'google/nano-banana';

// حدود آمنة
const clamp = (n, min, max) => Math.max(min, Math.min(max, n || 0));

// عميل Replicate
const replicate = new Replicate({
  auth: REPLICATE_TOKEN,
});

// تبسيط استخراج URL
const toUrlList = (output) => {
  if (!output) return [];
  if (typeof output === 'string') return [output];
  return [];
};

// تشغيل الموديل مرة واحدة
async function runNanoBananaOnce({ prompt, image_input }) {
  console.log('🚀 Running nano-banana with:', { prompt, image_input });
  const output = await replicate.run(MODEL_ID, {
    input: {
      prompt,
      image_input,
    },
  });
  console.log('🖼️ Output from replicate:', output);
  return toUrlList(output);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  if (!REPLICATE_TOKEN) {
    console.error('❌ Missing REPLICATE_API_TOKEN');
    return res.status(500).json({ error: 'Missing Replicate token' });
  }

  // ---- مدخلات ----
  const {
    imageUrl,
    imageUrls,
    prompt,
    user_email,
    plan,
    num_images,
  } = req.body || {};

  let inputs = [];
  if (Array.isArray(imageUrls)) inputs = imageUrls.filter(Boolean);
  if (!inputs.length && typeof imageUrl === 'string') inputs = [imageUrl];

  const MAX_INPUTS = 6;
  inputs = inputs.slice(0, MAX_INPUTS);

  if (!inputs.length || !prompt || !user_email) {
    console.warn('⚠️ Missing inputs', { inputs, prompt, user_email });
    return res.status(400).json({ error: 'Missing required fields: imageUrls/imageUrl, prompt, user_email' });
  }

  console.log('📦 Received API payload:', { prompt, user_email, plan, inputs, num_images });

  // ---- Supabase Auth ----
  const supabase = createPagesServerClient({ req, res });
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (!session || sessionError) {
    console.error('🔒 Unauthorized access attempt');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // ---- بيانات المستخدم ----
  const { data: userData, error: userError } = await supabase
    .from('Data')
    .select('credits, plan')
    .eq('email', user_email)
    .single();

  if (userError || !userData) {
    console.error('❌ User not found or error in DB', userError);
    return res.status(404).json({ error: 'User not found' });
  }

  console.log('🧑‍💻 User data from Supabase:', userData);

  if (userData.plan !== 'Pro' && userData.credits <= 0) {
    console.warn('💸 No credits left for user:', user_email);
    return res.status(403).json({ error: 'No credits left' });
  }

  const outputsCount = clamp(
    typeof num_images === 'number' ? num_images : (userData.plan === 'Pro' ? 2 : 1),
    1, 3
  );

  const harden = (p) =>
    `${p} Ensure correct layering and natural fusion of all garments/items; maintain realistic proportions, lighting, and alignment; avoid artifacts or partial crops.`;

  let variants = [];
  let firstError = null;

  try {
    for (let i = 0; i < outputsCount; i++) {
      let urls = await runNanoBananaOnce({ prompt, image_input: inputs });

      if (!urls.length) {
        console.warn(`⏱️ Retry with hardened prompt on attempt ${i + 1}`);
        urls = await runNanoBananaOnce({ prompt: harden(prompt), image_input: inputs });
      }

      if (!urls.length) {
        firstError = 'Model returned no image';
        continue;
      }

      variants.push(urls[0]);
    }
  } catch (e) {
    console.error('❌ nano-banana error:', e);
    return res.status(500).json({ error: e?.message || 'Replicate run failed' });
  }

  variants = [...new Set(variants)];

  if (!variants.length) {
    console.error('❌ All attempts failed - no image returned');
    return res.status(500).json({ error: firstError || 'No image returned' });
  }

  const first = variants[0];

  if (userData.plan !== 'Pro') {
    try {
      await supabase.rpc('decrement_credit', { user_email });
      console.log('✅ Credit decremented');
    } catch (e) {
      console.warn('⚠️ Failed to decrement credit:', e?.message || e);
    }
  }

  return res.status(200).json({
    success: true,
    image: first,
    variants,
    seed: null,
    plan: userData.plan,
    inputsCount: inputs.length,
  });
}
