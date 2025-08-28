// pages/api/ai.js
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import Replicate from 'replicate';

export const config = {
  api: { bodyParser: true },
};

const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;
const MODEL_ID = 'google/nano-banana';

const clamp = (n, min, max) => Math.max(min, Math.min(max, Number.isFinite(n) ? n : min));

// فلترة الروابط
const ensureHttpList = (arr = []) =>
  arr
    .map((u) => (typeof u === 'string' ? u.trim() : ''))
    .filter((u) => /^https?:\/\//i.test(u));

// استخراج روابط من استجابة Replicate
const toUrlList = (output) => {
  if (!output) return [];
  if (Array.isArray(output)) {
    return output.filter((x) => typeof x === 'string' && x.startsWith('http'));
  }
  if (typeof output === 'string') return [output];
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

const replicate = new Replicate({ auth: REPLICATE_TOKEN });

// تشغيل الموديل الرسمي (always array)
async function runNanoBananaOnce({ prompt, inputs }) {
  const result = await replicate.run(MODEL_ID, {
    input: {
      prompt,
      image_input: inputs,   // مصفوفة صور (صورة أو أكثر)
      output_format: "jpg",  // أو png حسب رغبتك
    },
  });
  return toUrlList(result);
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

    const {
      imageUrl,
      imageUrls,
      prompt,
      user_email,
      plan,
      num_images,
    } = req.body || {};

    let inputs = Array.isArray(imageUrls) ? imageUrls.filter(Boolean) : [];
    if (!inputs.length && typeof imageUrl === 'string') inputs = [imageUrl];
    inputs = ensureHttpList(inputs).slice(0, 6);

    if (!inputs.length || !prompt || !user_email) {
      return res.status(400).json({ error: 'Missing required fields: imageUrls/imageUrl, prompt, user_email' });
    }

    console.log('📦 Payload to nano-banana:', {
      prompt: prompt?.slice(0, 120),
      inputsCount: inputs.length,
      first: inputs[0],
    });

    // Supabase Auth
    const supabase = createPagesServerClient({ req, res });
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (!session || sessionError) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // بيانات المستخدم
    const { data: userData, error: userError } = await supabase
      .from('Data')
      .select('credits, plan')
      .eq('email', user_email)
      .single();

    if (userError || !userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (userData.plan !== 'Pro' && (userData.credits ?? 0) <= 0) {
      return res.status(403).json({ error: 'No credits left' });
    }

    const outputsCount = clamp(
      typeof num_images === 'number' ? num_images : (userData.plan === 'Pro' ? 2 : 1),
      1, 3
    );

    const harden = (p) =>
      `${p} Ensure correct layering and natural fusion of all garments/items; maintain realistic proportions, lighting, and alignment.`;

    let variants = [];
    let firstError = null;

    for (let i = 0; i < outputsCount; i++) {
      try {
        let urls = await runNanoBananaOnce({ prompt, inputs });
        if (!urls.length) {
          urls = await runNanoBananaOnce({ prompt: harden(prompt), inputs });
        }
        if (urls.length) {
          variants.push(urls[0]);
        } else {
          firstError = 'Model returned no image';
        }
      } catch (e) {
        console.error('❌ replicate run error:', e);
        firstError = e?.message || 'Replicate run failed';
      }
    }

    variants = [...new Set(variants)];

    if (!variants.length) {
      return res.status(500).json({ error: firstError || 'No image returned' });
    }

    // خصم كريدت لو Free
    if (userData.plan !== 'Pro') {
      try {
        await supabase.rpc('decrement_credit', { user_email });
      } catch (e) {
        console.warn('⚠️ Failed to decrement credit:', e?.message || e);
      }
    }

    return res.status(200).json({
      success: true,
      image: variants[0],
      variants,
      plan: userData.plan,
      inputsCount: inputs.length,
    });
  } catch (err) {
    console.error('🔥 /api/ai fatal error:', err);
    return res.status(500).json({ error: err?.message || 'Internal error' });
  }
}
