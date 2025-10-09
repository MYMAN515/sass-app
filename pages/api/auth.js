// pages/api/auth.js

import { supabase } from '@/lib/supabaseClient';
import {
  isPasswordAllowed,
  sanitizeActionType,
  sanitizeEmail,
  sanitizeString,
  safeJsonResponse,
} from '@/lib/security';
import { createRateLimiter } from '@/lib/rateLimit';

const authRateLimiter = createRateLimiter({ uniqueTokenPerInterval: 5, interval: 60_000 });

export default async function handler(req, res) {
  safeJsonResponse(res);

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Only POST requests allowed' });
  }

  const ip =
    (req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || '').trim() ||
    'unknown';

  const limiterResult = authRateLimiter.check(ip);
  if (!limiterResult.success) {
    res.setHeader('Retry-After', String(limiterResult.retryAfter));
    return res
      .status(429)
      .json({ success: false, error: 'Too many requests. Please slow down and try again.' });
  }

  const { email, password, name, type } = req.body || {};

  const sanitizedEmail = sanitizeEmail(email);
  const sanitizedType = sanitizeActionType(type, ['login', 'register']);
  const sanitizedName = sanitizeString(name, { maxLength: 80 });

  if (!sanitizedEmail || !sanitizedType) {
    return res
      .status(400)
      .json({ success: false, error: 'Valid email and action type are required.' });
  }

  if (!isPasswordAllowed(password)) {
    return res.status(400).json({ success: false, error: 'Password requirements not met.' });
  }

  try {
    if (sanitizedType === 'register') {
      // ✅ تسجيل مستخدم جديد
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/verify-email`, // تأكيد الإيميل
          data: {
            full_name: sanitizedName || '',
          },
        },
      });

      if (signUpError) throw signUpError;

      // ✅ لا تُدرج في جدول Data الآن (سيتم الإدراج في verify-email.js بعد التفعيل)
      return res.status(200).json({ success: true, message: 'Registration successful, please verify your email.' });
    }

    if (sanitizedType === 'login') {
      // ✅ تسجيل دخول
      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password,
      });

      if (error) {
        if (error.message === 'Email not confirmed') {
          return res.status(403).json({ success: false, error: 'Please verify your email before logging in.' });
        }
        throw error;
      }

      const user = data.user;
      const session = data.session;

      if (!user || !session) {
        return res.status(401).json({ success: false, error: 'Invalid session or user' });
      }

      return res.status(200).json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
        },
        token: session.access_token,
        refresh_token: session.refresh_token,
      });
    }

    return res
      .status(400)
      .json({ success: false, error: 'Invalid type. Must be "login" or "register"' });

  } catch (err) {
    console.error('🔥 Auth API Error:', err);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}
