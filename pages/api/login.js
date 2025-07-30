import fs from 'fs';
import path from 'path';
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

  const filePath = path.join(process.cwd(), 'data', 'users.json');
  let users = [];
  try {
    const fileData = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '[]';
    users = JSON.parse(fileData);
  } catch (e) {
    return res.status(500).json({ error: 'Server error reading users' });
  }

  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // ✅ Cookie for UI (readable by Navbar)
  const readableCookie = cookie.serialize('user', JSON.stringify({ email: user.email }), {
    httpOnly: false, // ✅ Client-readable
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
  });

  // ✅ Cookie for server (secure session)
  const secureCookie = cookie.serialize('token', 'mock-token', {
    httpOnly: true, // ✅ Only accessible by server
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  // ✅ Send both
  res.setHeader('Set-Cookie', [readableCookie, secureCookie]);

  return res.status(200).json({
    success: true,
    user: { name: user.name, email: user.email },
  });
}
