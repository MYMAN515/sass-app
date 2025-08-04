import { createClient } from '@supabase/supabase-js';
import * as cookie from 'cookie';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }

  // ✅ تسجيل الدخول من Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.session) {
    return res.status(401).json({ error: 'Invalid credentials or unverified account' });
  }

  const accessToken = authData.session.access_token;

  // ✅ جلب بيانات المستخدم من جدول Data
  const { data: user, error: userError } = await supabase
    .from('Data')
    .select('name, email')
    .eq('email', email)
    .single();

  if (userError || !user) {
    return res.status(401).json({ error: 'User data not found' });
  }

  // ✅ حفظ الـ token وبيانات المستخدم في الكوكيز
  const readableCookie = cookie.serialize('user', JSON.stringify(user), {
    httpOnly: false,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
  });

  const tokenCookie = cookie.serialize('token', accessToken, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  res.setHeader('Set-Cookie', [readableCookie, tokenCookie]);

  return res.status(200).json({
    success: true,
    user,
  });
}