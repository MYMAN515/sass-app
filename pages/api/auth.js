// pages/api/auth.js

import { supabase } from '@/lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Only POST requests allowed' });
  }

  const { email, password, name, type } = req.body;

  if (!email || !password || !type) {
    return res.status(400).json({ success: false, error: 'Email, password, and type are required' });
  }

  try {
    if (type === 'register') {
      // ✅ تسجيل مستخدم جديد
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/verify-email`, // تأكيد الإيميل
          data: {
            full_name: name || '',
          },
        },
      });

      if (signUpError) throw signUpError;

      // ✅ لا تُدرج في جدول Data الآن (سيتم الإدراج في verify-email.js بعد التفعيل)
      return res.status(200).json({ success: true, message: 'Registration successful, please verify your email.' });
    }

    if (type === 'login') {
      // ✅ تسجيل دخول
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
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

    return res.status(400).json({ success: false, error: 'Invalid type. Must be "login" or "register"' });

  } catch (err) {
    console.error('🔥 Auth API Error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
  }
}
