import { supabase } from './supabaseClient';

export async function uploadImageToSupabase(file, folder) {
  const user = await supabase.auth.getUser(); // 👈 تأكد من وجود session
  const session = await supabase.auth.getSession();

  if (!session.data.session) {
    throw new Error('User is not authenticated');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;
console.log('Session:', session);
  const { error } = await supabase.storage
    .from('img') // اسم البكت
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error('Upload error:', error);
    throw error;
  }

  const { data } = supabase.storage.from('img').getPublicUrl(filePath);
  return data.publicUrl;
}
