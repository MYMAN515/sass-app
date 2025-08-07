// pages/api/login-with-google.js
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
  const supabase = createPagesServerClient({ req, res });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
  redirectTo: 'https://aistoreassistant.app/auth/callback',
    },
  });

  if (error) return res.status(400).json({ error: error.message });

  // ✅ إعادة التوجيه إلى Google OAuth
  return res.redirect(data.url);
}
