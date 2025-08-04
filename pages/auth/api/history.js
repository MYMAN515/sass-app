import { supabase } from '@/lib/supabaseClient';

export default async function handler(req, res) {
  // ✅ 1. التحقق من نوع الطلب
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // ✅ 2. التحقق من وجود الإيميل
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'Email is required in query string' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ✅ 3. جلب البيانات من Supabase
    const { data, error } = await supabase
      .from('generation_history')
      .select('image_url, prompt, created_at, type')
      .eq('user_email', normalizedEmail)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Supabase DB error:', error.message);
      return res.status(500).json({ error: 'Failed to fetch history', detail: error.message });
    }

    // ✅ 4. التحقق من النتائج الفارغة
    if (!data || data.length === 0) {
      return res.status(200).json({ records: [] });
    }

    // ✅ 5. إرسال النتيجة النهائية
    return res.status(200).json({ records: data });
  } catch (err) {
    console.error('❌ Unexpected API error:', err.message);
    return res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
}
