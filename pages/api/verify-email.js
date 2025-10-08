import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { access_token: accessToken, refresh_token: refreshToken } = req.body || {};
  if (!accessToken || !refreshToken) {
    return res.status(400).json({ error: 'Missing access_token or refresh_token' });
  }

  try {
    const supabase = createPagesServerClient({ req, res });
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error || !data?.session) {
      return res.status(400).json({ error: error?.message || 'Unable to verify session' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('verify-email handler error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
