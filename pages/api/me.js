// pages/api/me.js
import * as cookie from 'cookie';
import { verifyToken } from '@/lib/auth'; // or from fakeDb

export default function handler(req, res) {
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.token;

  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const decoded = verifyToken(token);
    res.status(200).json({ email: decoded.email || decoded.userId });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}
