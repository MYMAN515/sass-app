import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

let cachedSupabaseClient;

const getSupabaseClient = () => {
  if (!cachedSupabaseClient) {
    cachedSupabaseClient = createPagesBrowserClient();
  }
  return cachedSupabaseClient;
};

export async function uploadImageToSupabase(file) {
  const supabase = getSupabaseClient();

  // استخراج الامتداد واسم الملف
  const fileExt = file.name.split('.').pop();
  const fileName = `img-${Date.now()}.${fileExt}`;
  const filePath = fileName; // لا تضيف أي مجلد أو slash

  // رفع الملف
  const { data, error } = await supabase.storage
    .from('img') // اسم البكت
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('❌ Upload error:', error.message);
    throw error;
  }

  // استخراج الرابط العام وتنظيفه من أي // زائد
  const { data: publicUrlData } = supabase.storage
    .from('img')
    .getPublicUrl(filePath);

  // تنظيف الرابط من أي تكرار slashes
  const cleanUrl = publicUrlData.publicUrl.replace(/\/{2,}/g, '/');

  // التأكد إن الدومين ما تأثر من التنظيف
  return cleanUrl.replace('https:/', 'https://'); // إذا حذف واحدة من https
}
