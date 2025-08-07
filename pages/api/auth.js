import { supabase } from '@/lib/supabaseClient';
import { serialize } from 'cookie';
const accessToken = data.session.access_token;
const refreshToken = data.session.refresh_token;
const cookieOptions = { httpOnly: true, secure: true, sameSite: 'Strict', path: '/' };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, name, email, password } = req.body;

  if (!action || !email || !password || (action === 'register' && !name)) {
    return res.status(400).json({ error: 'Missing fields or action' });
  }

if (action === 'register') {
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { credits: 5 } } });
  if (error) {
    const msg = error.message.toLowerCase().includes('already') ? 'هذا البريد مسجل' : 'خطأ في التسجيل';
    return res.status(error.message.toLowerCase().includes('already') ? 400 : 500)
              .json({ success: false, error: msg });
  }
  return res.status(201).json({ success: true, user: data.user, message: 'تم التسجيل مع 5 credits' });
}

if (action === 'login') {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ success: false, error: 'بيانات الدخول غير صحيحة' });
  return res.status(200).json({ success: true, user: data.user });
}


  return res.status(400).json({ error: 'Invalid action' });
}


res.setHeader('Set-Cookie', [
  serialize('sb-access-token', accessToken, { ...cookieOptions, maxAge: 60 * 60 * 24 * 7 }),
  serialize('sb-refresh-token', refreshToken, { ...cookieOptions, maxAge: 60 * 60 * 24 * 7 * 4 })
]);
return res.status(200).json({ success: true, user: data.user });

