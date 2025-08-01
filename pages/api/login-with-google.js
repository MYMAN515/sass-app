// pages/api/login-with-google.js
import { supabase } from '@/lib/supabaseClient';

export default async function handler(req, res) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
redirectTo: `http://localhost:3000/auth/callback`,
    },
  });

  if (error) return res.status(400).json({ error: error.message });
  res.redirect(data.url);
}
