// pages/api/logout.js
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
  // لماذا: منع أساليب غير مقصودة
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const supabase = createPagesServerClient({ req, res });
    const { error } = await supabase.auth.signOut(); // يزيل كوكيز الجلسة بأمان
    if (error) return res.status(400).json({ error: error.message });

    // منع التخزين المؤقت على المتصفح/الوسيط
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}


