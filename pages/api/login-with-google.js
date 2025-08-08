
// ==============================
// pages/api/login-with-google.js
// ==============================
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
  // لماذا: API Route آمن لإطلاق OAuth من السيرفر وتفادي مشاكل الـ redirect origins
  const supabase = createPagesServerClient({ req, res });
  const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo }, // يضمن العودة للـ callback الصحيح
  });

  if (error) {
    return res.status(400).json({ error: error.message || 'OAuth init failed' });
  }

  // توجيه مباشر إلى صفحة موافقة Google
  return res.redirect(data.url);
}


