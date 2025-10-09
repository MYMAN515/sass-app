// pages/api/ai.js
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import Replicate from 'replicate';

import { createRateLimiter } from '@/lib/rateLimit';
import { sanitizeEmail, sanitizeString, safeJsonResponse } from '@/lib/security';

export const config = {
  api: { bodyParser: true },
};

const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;
const MODEL_ID = 'google/nano-banana';

const clamp = (n, min, max) =>
  Math.max(min, Math.min(max, Number.isFinite(n) ? n : min));

// فلترة الروابط
const ensureHttpList = (arr = []) =>
  arr
    .map((u) => (typeof u === 'string' ? u.trim() : ''))
    .filter((u) => /^https?:\/\//i.test(u));

const replicate = new Replicate({ auth: REPLICATE_TOKEN });
const aiRateLimiter = createRateLimiter({ uniqueTokenPerInterval: 3, interval: 60_000 });

// تشغيل الموديل (باستخدام predictions.create + wait)
async function runNanoBananaOnce({ prompt, inputs }) {
  const prediction = await replicate.predictions.create({
    model: MODEL_ID,
    input: {
      prompt,
      image_input: inputs,
      output_format: 'jpg',
    },
  });

  const result = await replicate.wait(prediction);

  let images = [];
  if (result?.output) {
    if (typeof result.output === 'string') {
      images = [result.output];
    } else if (Array.isArray(result.output)) {
      images = result.output;
    } else if (result.output?.url) {
      images = [result.output.url];
    }
  }

  return images;
}

export default async function handler(req, res) {
  try {
    safeJsonResponse(res);

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Only POST allowed' });
    }

    if (!REPLICATE_TOKEN) {
      console.error('❌ Missing REPLICATE_API_TOKEN');
      return res.status(500).json({ error: 'Missing Replicate token' });
    }

    const ip =
      (req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || '').trim() ||
      'unknown';

    const limiterResult = aiRateLimiter.check(ip);
    if (!limiterResult.success) {
      res.setHeader('Retry-After', String(limiterResult.retryAfter));
      return res.status(429).json({ error: 'Too many requests. Please slow down and try again.' });
    }

    const { imageUrl, imageUrls, prompt, user_email, num_images } = req.body || {};

    let inputs = Array.isArray(imageUrls) ? imageUrls.filter(Boolean) : [];
    if (!inputs.length && typeof imageUrl === 'string') inputs = [imageUrl];
    inputs = ensureHttpList(inputs).slice(0, 6);

    const sanitizedPrompt = sanitizeString(prompt, { maxLength: 600 });
    const sanitizedEmail = sanitizeEmail(user_email);

    if (!inputs.length || !sanitizedPrompt || !sanitizedEmail) {
      return res.status(400).json({
        error: 'Missing required fields: imageUrls/imageUrl, prompt, user_email',
      });
    }

    console.log('📦 Payload to nano-banana:', {
      prompt: sanitizedPrompt?.slice(0, 120),
      inputsCount: inputs.length,
      first: inputs[0],
    });

    // ✅ Supabase Auth
    const supabase = createPagesServerClient({ req, res });
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (!session || sessionError) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // ✅ بيانات المستخدم
    const { data: userData, error: userError } = await supabase
      .from('Data')
      .select('credits, plan')
      .eq('email', sanitizedEmail)
      .single();

    if (userError || !userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (userData.plan !== 'Pro' && (userData.credits ?? 0) <= 0) {
      return res.status(403).json({ error: 'No credits left' });
    }

    // ✅ عدد المخرجات
    const outputsCount = clamp(
      typeof num_images === 'number'
        ? num_images
        : userData.plan === 'Pro'
        ? 2
        : 1,
      1,
      3
    );

    const harden = (p) =>
      `${p} Ensure correct layering and natural fusion of all garments/items; maintain realistic proportions, lighting, and alignment.`;

    let variants = [];
    let firstError = null;

    for (let i = 0; i < outputsCount; i++) {
      try {
        let urls = await runNanoBananaOnce({ prompt: sanitizedPrompt, inputs });
        if (!urls.length) {
          urls = await runNanoBananaOnce({ prompt: harden(sanitizedPrompt), inputs });
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
      return res
        .status(500)
        .json({ error: firstError || 'No image returned' });
    }

    // ✅ خصم كريدت لو Free
    if (userData.plan !== 'Pro') {
      try {
        await supabase.rpc('decrement_credit', { user_email: sanitizedEmail });
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
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
