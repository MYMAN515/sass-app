import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import Replicate from 'replicate';

export const config = {
  api: { bodyParser: true },
};

const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;
const MODEL_ID = 'google/nano-banana';

const clamp = (n, min, max) => Math.max(min, Math.min(max, n || 0));

const replicate = new Replicate({
  auth: REPLICATE_TOKEN,
});

// ✅ تحسين toUrlList لمخرجات nano-banana
const toUrlList = (output) => {
  if (!output) return [];

  if (typeof output === 'string') return [output];
  if (output?.url && typeof output.url === 'string') return [output.url];

  if (Array.isArray(output)) {
    return output
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item?.url && typeof item.url === 'string') return item.url;
        return null;
      })
      .filter(Boolean);
  }

  return [];
};

// ✅ Logging + تشغيل الموديل مرة واحدة
async function runNanoBananaOnce({ prompt, image_input }) {
  console.log('[AIStudio] 🚀 Running nano-banana with:', { prompt, image_input });

  const output = await replicate.run(MODEL_ID, {
    input: {
      prompt,
      image_input,
    },
  });

  console.log('[AIStudio] ✅ Raw output from replicate:', output);

  const urls = toUrlList(output);
  console.log('[AIStudio] 📷 Extracted URLs:', urls);

  return urls;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  if (!REPLICATE_TOKEN) {
    console.error('❌ Missing REPLICATE_API_TOKEN');
    return res.status(500).json({ error: 'Missing Replicate token' });
  }

  const { imageUrl, imageUrls, prompt, user_email, plan, num_images } = req.body || {};

  let inputs = [];
  if (Array.isArray(imageUrls)) inputs = imageUrls.filter(Boolean);
  if (!inputs.length && typeof imageUrl === 'string') inputs = [imageUrl];

  const MAX_INPUTS = 6;
  inputs = inputs.slice(0, MAX_INPUTS);

  if (!inputs.length || !prompt || !user_email) {
    return res.status(400).json({ error: 'Missing required fields: imageUrls/imageUrl, prompt, user_email' });
  }

  // ✅ Log: Input payload
  console.log('[AIStudio] 📨 Received payload:', {
    imageUrls: inputs,
    prompt,
    user_email,
    plan,
    num_images,
  });

  const supabase = createPagesServerClient({ req, res });
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (!session || sessionError) {
    console.warn('🔒 Invalid session or not logged in');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { data: userData, error: userError } = await supabase
    .from('Data')
    .select('credits, plan')
    .eq('email', user_email)
    .single();

  if (userError || !userData) {
    console.warn('👤 User not found:', user_email);
    return res.status(404).json({ error: 'User not found' });
  }

  if (userData.plan !== 'Pro' && userData.credits <= 0) {
    return res.status(403).json({ error: 'No credits left' });
  }

  const outputsCount = clamp(
    typeof num_images === 'number' ? num_images : (userData.plan === 'Pro' ? 2 : 1),
    1,
    3
  );

  const harden = (p) =>
    `${p} Ensure correct layering and natural fusion of all garments/items; maintain realistic proportions, lighting, and alignment; avoid artifacts or partial crops.`;

  let variants = [];
  let firstError = null;

  try {
    for (let i = 0; i < outputsCount; i++) {
      let urls = await runNanoBananaOnce({ prompt, image_input: inputs });

      if (!urls.length) {
        console.warn(`⚠️ No image returned. Retrying with hardened prompt...`);
        urls = await runNanoBananaOnce({ prompt: harden(prompt), image_input: inputs });
      }

      if (!urls.length) {
        firstError = 'Model returned no image';
        continue;
      }

      variants.push(urls[0]);
    }
  } catch (e) {
    console.error('🔥 Error during replicate run:', e);
    return res.status(500).json({ error: e?.message || 'Replicate run failed' });
  }

  variants = [...new Set(variants)];

  if (!variants.length) {
    console.warn('❌ All attempts failed — no image returned');
    return res.status(500).json({ error: firstError || 'No image returned' });
  }

  const first = variants[0];

  if (userData.plan !== 'Pro') {
    try {
      await supabase.rpc('decrement_credit', { user_email });
    } catch (e) {
      console.warn('⚠️ Failed to decrement credit:', e?.message || e);
    }
  }

  console.log('[AIStudio] ✅ Success! Returning response');

  return res.status(200).json({
    success: true,
    image: first,
    variants,
    seed: null,
    plan: userData.plan,
    inputsCount: inputs.length,
  });
}
