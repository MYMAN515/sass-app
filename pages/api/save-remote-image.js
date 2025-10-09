import crypto from 'node:crypto';

import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';

import { createRateLimiter } from '@/lib/rateLimit';
import { clampFileSize, safeJsonResponse, validateRemoteUrl } from '@/lib/security';

const MAX_REMOTE_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB limit to reduce abuse
const fetchLimiter = createRateLimiter({ uniqueTokenPerInterval: 8, interval: 60_000 });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ⚠️ سرّي - لا تضعه على الواجهة
);

export default async function handler(req, res) {
  safeJsonResponse(res);

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const ip =
    (req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || '').trim() ||
    'unknown';

  const limiterResult = fetchLimiter.check(ip);
  if (!limiterResult.success) {
    res.setHeader('Retry-After', String(limiterResult.retryAfter));
    return res.status(429).json({ error: 'Too many requests. Please wait before retrying.' });
  }

  try {
    const supabase = createPagesServerClient({ req, res });
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) return res.status(401).json({ error: 'Unauthorized' });

    const { url } = req.body || {};
    const validatedUrl = await validateRemoteUrl(url);
    if (!validatedUrl) {
      return res.status(400).json({ error: 'Invalid or unsafe URL provided.' });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    let response;
    try {
      response = await fetch(validatedUrl.toString(), {
        redirect: 'follow',
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response?.ok) {
      return res.status(400).json({ error: 'Failed to fetch remote image' });
    }

    const contentType = response.headers.get('content-type') || 'image/png';

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!clampFileSize(buffer.length, MAX_REMOTE_IMAGE_BYTES)) {
      return res.status(413).json({ error: 'Remote image exceeds the maximum allowed size (5MB).' });
    }

    const ext =
      contentType.includes('webp') ? 'webp' :
      contentType.includes('jpeg') ? 'jpg' :
      contentType.includes('png') ? 'png' :
      'png';

    const userId = session.user.id;
    const fileName = `${Date.now()}-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 10)}.${ext}`;
    const path = `${userId}/${fileName}`;

    const { error: uploadError } = await supabaseAdmin
      .storage.from('generated')
      .upload(path, buffer, { contentType, upsert: false });

    if (uploadError) {
      console.error('save-remote-image upload error:', uploadError);
      return res.status(400).json({ error: 'Unable to persist remote image.' });
    }

    const { data: pub } = supabaseAdmin.storage.from('generated').getPublicUrl(path);

    return res.status(200).json({ path, publicUrl: pub.publicUrl, contentType });
  } catch (error) {
    console.error('save-remote-image fatal error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

