// pages/api/auth.js

import { supabase } from '@/lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Only POST allowed' });
  }

  const { action, email, password, name } = req.body;

  if (!email || !password || !action) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  if (action === 'register') {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, credits: 5 },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/verify-email`, // يجب تحديد هذا المتغير في .env
      }
    });

    if (error) {
      const msg = error.message.toLowerCase().includes('already') ? 'هذا البريد مسجل' : 'خطأ في التسجيل';
      return res.status(400).json({ success: false, error: msg });
    }

    return res.status(200).json({
      success: true,
      message: 'تم التسجيل. يرجى التحقق من بريدك الإلكتروني لتفعيل الحساب.',
    });
  }

  if (action === 'login') {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ success: false, error: 'بيانات الدخول غير صحيحة' });
    }

    const user = data?.user;
    const token = data?.session?.access_token;
    const refreshToken = data?.session?.refresh_token;

    if (!token || !refreshToken) {
      return res.status(500).json({ success: false, error: 'لم يتم إنشاء الجلسة بشكل صحيح' });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user?.id,
        email: user?.email,
      },
      token,
      refresh_token: refreshToken,
    });
  }

  return res.status(400).json({ success: false, error: 'Invalid action' });
}
