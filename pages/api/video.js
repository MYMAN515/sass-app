// pages/api/video.js
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import Replicate from 'replicate';

import { createRateLimiter } from '@/lib/rateLimit';
import { sanitizeEmail, sanitizeString, safeJsonResponse } from '@/lib/security';

export const config = {
  api: { bodyParser: true },
};

const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;
const MODEL_ID = 'bytedance/seedance-1-pro';

const RESOLUTION_COSTS = {
  '480p': 1,
  '720p': 3,
  '1080p': 5,
};

const ASPECT_RATIOS = new Set(['16:9', '4:3', '1:1', '3:4', '9:16', '21:9', '9:21']);

const replicate = new Replicate({ auth: REPLICATE_TOKEN });
const videoRateLimiter = createRateLimiter({ uniqueTokenPerInterval: 2, interval: 60_000 });

const clampNumber = (value, min, max, fallback) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
};

const ensureHttp = (url) => {
  if (!url || typeof url !== 'string') return '';
  return /^https?:\/\//i.test(url.trim()) ? url.trim() : '';
};

const extractVideoUrl = (output) => {
  if (!output) return '';
  if (typeof output === 'string') return output;
  if (Array.isArray(output)) {
    for (const item of output) {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object') {
        const nested = extractVideoUrl(item);
        if (nested) return nested;
      }
    }
    return '';
  }
  if (typeof output === 'object') {
    if (typeof output.video === 'string') return output.video;
    if (Array.isArray(output.video)) {
      const nested = extractVideoUrl(output.video);
      if (nested) return nested;
    }
    if (Array.isArray(output.videos)) {
      const nested = extractVideoUrl(output.videos);
      if (nested) return nested;
    }
    if (typeof output.mp4 === 'string') return output.mp4;
    if (typeof output.url === 'string') return output.url;
    if (output.output) return extractVideoUrl(output.output);
  }
  return '';
};

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
    const limiterResult = videoRateLimiter.check(ip);
    if (!limiterResult.success) {
      res.setHeader('Retry-After', String(limiterResult.retryAfter));
      return res.status(429).json({ error: 'Too many requests. Please slow down and try again.' });
    }

    const {
      imageUrl,
      prompt,
      user_email,
      resolution,
      aspectRatio,
      cameraFixed,
      fps,
      duration,
    } = req.body || {};

    const sanitizedEmail = sanitizeEmail(user_email);
    const sanitizedPrompt = sanitizeString(prompt, { maxLength: 600 });
    const image = ensureHttp(imageUrl);

    if (!sanitizedEmail || !image) {
      return res.status(400).json({ error: 'Missing required fields: imageUrl, user_email' });
    }

    const supabase = createPagesServerClient({ req, res });
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (!session || sessionError) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: userData, error: userError } = await supabase
      .from('Data')
      .select('credits, plan')
      .eq('email', sanitizedEmail)
      .single();

    if (userError || !userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (userData.plan !== 'Pro') {
      return res.status(403).json({ error: 'This feature is available for Pro members only.' });
    }

    const normalizedResolution = (typeof resolution === 'string' ? resolution.toLowerCase() : '1080p')
      .replace(/\s+/g, '')
      .replace(/[^0-9p]/gi, '')
      .replace(/p?$/, 'p');
    const chosenResolution =
      normalizedResolution === '480p' || normalizedResolution === '720p' || normalizedResolution === '1080p'
        ? normalizedResolution
        : '1080p';

    const cost = RESOLUTION_COSTS[chosenResolution];
    const currentCredits = Number.isFinite(userData.credits) ? userData.credits : 0;
    if (currentCredits < cost) {
      return res.status(402).json({ error: 'Not enough credits for the selected resolution.' });
    }

    const ratioInput = typeof aspectRatio === 'string' ? aspectRatio.trim() : '';
    const ratio = ASPECT_RATIOS.has(ratioInput) ? ratioInput : '16:9';
    const fixedCamera = !!cameraFixed;
    const safeFps = clampNumber(fps, 1, 60, 24) || 24;
    const safeDuration = clampNumber(duration, 1, 10, 5) || 5;
    const finalPrompt = sanitizedPrompt || 'make it walk like a model ,realstic,4k';

    const prediction = await replicate.predictions.create({
      model: MODEL_ID,
      input: {
        fps: safeFps,
        image,
        prompt: finalPrompt,
        duration: safeDuration,
        resolution: chosenResolution,
        aspect_ratio: ratio,
        camera_fixed: fixedCamera,
      },
    });

    const result = await replicate.wait(prediction);

    const videoUrl = extractVideoUrl(result?.output);
    if (!videoUrl) {
      console.error('❌ seedance returned no video', result);
      return res.status(500).json({ error: 'Model returned no video output' });
    }

    let updatedCredits = currentCredits;
    try {
      const remaining = Math.max(currentCredits - cost, 0);
      const { error: rpcErr } = await supabase.rpc('decrement_credit_by', {
        user_email: sanitizedEmail,
        amount: cost,
      });
      if (rpcErr) {
        const { error: rpcErr2 } = await supabase.rpc('decrement_credit', {
          user_email: sanitizedEmail,
          amount: cost,
        });
        if (rpcErr2) {
          const { error: updateErr } = await supabase
            .from('Data')
            .update({ credits: remaining })
            .eq('email', sanitizedEmail);
          if (updateErr) throw updateErr;
        }
      }
      updatedCredits = Math.max(currentCredits - cost, 0);
    } catch (creditErr) {
      console.warn('⚠️ Failed to deduct credits precisely:', creditErr);
      updatedCredits = Math.max(currentCredits - cost, 0);
    }

    return res.status(200).json({
      success: true,
      video: videoUrl,
      resolution: chosenResolution,
      cost,
      credits: updatedCredits,
      plan: userData.plan,
      fps: safeFps,
      duration: safeDuration,
      aspect_ratio: ratio,
      camera_fixed: fixedCamera,
    });
  } catch (err) {
    console.error('🔥 /api/video fatal error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
