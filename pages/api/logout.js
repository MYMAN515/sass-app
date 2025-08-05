// pages/api/logout.js
import * as cookie from 'cookie';

export default async function handler(req, res) {
  res.setHeader('Set-Cookie', [
    cookie.serialize('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(0),
      sameSite: 'lax',
      path: '/',
    }),
    cookie.serialize('user', '', {
      httpOnly: false,
      expires: new Date(0),
      sameSite: 'lax',
      path: '/',
    }),
  ]);

  // يمكنك إعادة توجيه المستخدم
  // res.writeHead(302, { Location: '/' }).end();

  return res.status(200).json({ message: 'Logged out successfully' });
}
