// pages/api/logout.js
import * as cookie from 'cookie';

export default function handler(req, res) {
  res.setHeader('Set-Cookie', [
    // Clear secure token (server session)
    cookie.serialize('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(0),
      sameSite: 'lax',
      path: '/',
    }),
    // Clear user info (client-side Navbar)
    cookie.serialize('user', '', {
      httpOnly: false,
      expires: new Date(0),
      sameSite: 'lax',
      path: '/',
    }),
  ]);

  return res.status(200).json({ message: 'Logged out' });
}
