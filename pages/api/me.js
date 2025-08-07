import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
// import { NextApiRequest, NextApiResponse } from 'next'; // ← إلغاء التعليق إذا كنت تستخدم TypeScript

export default async function handler(req, res) {
  try {
    // إنشاء عميل Supabase باستخدام كوكيز الجلسة من الطلب
    const supabase = createServerSupabaseClient({ req, res });
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();  // الحصول على المستخدم الحالي من الجلسة

    // معالجة أي خطأ في جلب بيانات المستخدم
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to retrieve user session' });
    }

    // إذا لم يوجد مستخدم (الجلسة غير صالحة أو المستخدم غير مسجّل دخول)
    if (error || !user) return res.status(401).json({ error: 'Unauthorized' });


    // إذا وجد المستخدم، تجهيز البيانات للإرجاع (البريد أو المعرّف عند غياب البريد)
    const result = user.email 
      ? { email: user.email } 
      : { id: user.id };

    // إرسال استجابة بنجاح تتضمن إما البريد الإلكتروني أو المعرّف
    return res.status(200).json(result);
  } catch (err) {
    console.error('Unexpected error in /api/me:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
