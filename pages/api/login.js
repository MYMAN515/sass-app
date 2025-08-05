// pages/api/login.js

import { supabase } from '@/lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Only POST allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return res.status(401).json({ success: false, error: error.message });
  }

  const user = data?.user;
  const token = data?.session?.access_token;
  const refreshToken = data?.session?.refresh_token;

  if (!token || !refreshToken) {
    return res.status(500).json({ success: false, error: 'Session tokens not returned' });
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
