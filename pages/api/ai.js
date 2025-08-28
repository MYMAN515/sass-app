// pages/api/ai.js
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import Replicate from 'replicate';

export const config = {
  api: { bodyParser: true }, // نرسل روابط فقط، ليس ملفات خام
};

// ---------- Settings ----------
const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;
const MODEL_ID = 'google/nano-banana';

// Helpers
const clamp = (n, min, max) => Math.max(min, Math.min(max, Number.isFinite(n) ? n : min));

const ensureHttpList = (arr = []) =>
  arr
    .map((u) => (typeof u === 'string' ? u.trim() : ''))
    .filter((u) => /^https?:\/\//i.test(u));

/**
 * Normalize different output shapes coming from Replicate into a list of URLs.
 * Replicate usually returns an array of strings (urls). Be generous here.
 */
const toUrlList = (output) => {
  if (!output) return [];

  // 1) Common: array of url strings
  if (Array.isArray(output)) {
    const urls = [];
    for (const x of output) {
      if (typeof x === 'string') urls.push(x);
      else if (x && typeof x === 'object') {
        if (typeof x.url === 'string') urls.push(x.url);
        if (typeof x.image === 'string') urls.push(x.image);
      }
    }
    return urls.filter(Boolean);
  }

  // 2) Single string
  if (typeof output === 'string') return [output];

  // 3) Object with a known field
  if (output && typeof output === 'object') {
    const keys = ['output', 'image', 'images', 'variants', 'urls', 'result'];
    for (const k of keys) {
      const v = output[k];
      if (Array.isArray(v)) return v.filter(Boolean);
      if (typeof v === 'string') return [v];
    }
  }

  return [];
};

// Replicate client
const replicate = new Replicate({ auth: REPLICATE_TOKEN });

/**
 * Run nano-banana once.
 * - If there are two images we pass them as input_image_1 / input_image_2 (most compatible).
 * - If there is only one image we pass input_image_1 only.
 * - If nothing comes back, we try a fallback field set (image_input / image) once.
 */
async function runNanoBananaOnce({ prompt, inputs }) {
  const [i1, i2] = inputs;

  // Attempt 1: field names used by the model UI on Replicate
  const attempt1 = await replicate.run(MODEL_ID, {
    input: {
      prompt,
      ...(i1 ? { input_image_1: i1 } : {}),
      ...(i2 ? { input_image_2: i2 } : {}),
    },
  });
  let urls = toUrlList(attempt1);
  if (urls.length) return urls;

  // Attempt 2: more generic field names some builds accept
  const attempt2 = await replicate.run(MODEL_ID, {
    input: {
      prompt,
      image_input: inputs, // as array
      image: i1,           // single
    },
  });
  urls = toUrlList(attempt2);
  return urls;
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Only POST allowed' });
    }

    if (!REPLICATE_TOKEN) {
      console.error('❌ Missing REPLICATE_API_TOKEN');
      return res.status(500).json({ error: 'Missing Replicate token' });
    }

    // ---------- Read body ----------
    const {
      imageUrl,     // optional string
      imageUrls,    // optional array
      prompt,       // required
      user_email,   // required
      plan,         // optional (client hint)
      num_images,   // optional desired outputs (<=3)
    } = req.body || {};

    // Gather inputs (urls)
    let inputs = Array.isArray(imageUrls) ? imageUrls.filter(Boolean) : [];
    if (!inputs.length && typeof imageUrl === 'string') inputs = [imageUrl];
    inputs = ensureHttpList(inputs).slice(0, 6);

    if (!inputs.length || !prompt || !user_email) {
      console.warn('⚠️ Missing inputs', { inputsLen: inputs.length, hasPrompt: !!prompt, user_email });
      return res.status(400).json({ error: 'Missing required fields: imageUrls/imageUrl, prompt, user_email' });
    }

    console.log('📦 /api/ai payload:', {
      prompt: prompt?.slice(0, 140),
      user_email,
      plan,
      inputsCount: inputs.length,
      firstInput: inputs[0],
    });

    // ---------- Auth via Supabase ----------
    const supabase = createPagesServerClient({ req, res });
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (!session || sessionError) {
      console.error('🔒 Unauthorized');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // ---------- User data ----------
    const { data: userData, error: userError } = await supabase
      .from('Data')
      .select('credits, plan')
      .eq('email', user_email)
      .single();

    if (userError || !userData) {
      console.error('❌ User not found or db error', userError);
      return res.status(404).json({ error: 'User not found' });
    }

    if (userData.plan !== 'Pro' && (userData.credits ?? 0) <= 0) {
      console.warn('💸 No credits left for user:', user_email);
      return res.status(403).json({ error: 'No credits left' });
    }

    const outputsCount = clamp(
      typeof num_images === 'number' ? num_images : (userData.plan === 'Pro' ? 2 : 1),
      1, 3
    );

    const harden = (p) =>
      `${p} Ensure correct layering and natural fusion of all garments/items; maintain realistic proportions, lighting, and alignment; avoid artifacts or partial crops.`;

    // ---------- Run model ----------
    let variants = [];
    let firstError = null;

    for (let i = 0; i < outputsCount; i++) {
      try {
        let urls = await runNanoBananaOnce({ prompt, inputs });

        if (!urls.length) {
          console.warn(`⏱️ Retry with hardened prompt on attempt ${i + 1}`);
          urls = await runNanoBananaOnce({ prompt: harden(prompt), inputs });
        }

        if (!urls.length) {
          firstError = 'Model returned no image';
          continue;
        }

        variants.push(urls[0]);
      } catch (e) {
        console.error('❌ replicate run error:', e);
        firstError = e?.message || 'Replicate run failed';
      }
    }

    // Deduplicate
    variants = [...new Set(variants)].filter(Boolean);

    if (!variants.length) {
      console.error('❌ All attempts failed - no image returned');
      return res.status(500).json({ error: firstError || 'No image returned' });
    }

    // ---------- Credit decrement for non-Pro ----------
    if (userData.plan !== 'Pro') {
      try {
        await supabase.rpc('decrement_credit', { user_email });
        console.log('✅ Credit decremented');
      } catch (e) {
        console.warn('⚠️ Failed to decrement credit:', e?.message || e);
      }
    }

    const first = variants[0];

    return res.status(200).json({
      success: true,
      image: first,
      variants,
      inputsCount: inputs.length,
      plan: userData.plan,
    });
  } catch (err) {
    console.error('🔥 /api/ai fatal error:', err);
    return res.status(500).json({ error: err?.message || 'Internal error' });
  }
}
