import { supabase } from '@/lib/supabaseClient';
import bcrypt from 'bcryptjs';
import * as cookie from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }

  // ✅ Query the user from Supabase (using "Data" table)
  const { data: user, error } = await supabase
    .from('Data') // your actual table name
    .select('email, password, name')
    .eq('email', email)
    .single();

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // ✅ Create both readable and secure cookies
  const readableCookie = cookie.serialize('user', JSON.stringify({ email: user.email }), {
    httpOnly: false,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
  });

  const secureCookie = cookie.serialize('token', 'mock-token', {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  res.setHeader('Set-Cookie', [readableCookie, secureCookie]);

  return res.status(200).json({
    success: true,
    user: { name: user.name, email: user.email },
  });
}
