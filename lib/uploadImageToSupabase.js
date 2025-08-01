import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export async function uploadImageToSupabase(file) {
  const supabase = createClientComponentClient();
  const fileExt = file.name.split('.').pop();
  const fileName = `img-${Date.now()}.${fileExt}`;
  const filePath = fileName;

  const { data, error } = await supabase.storage
    .from('img')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error("❌ Upload error:", error);
    throw error;
  }

  const { data: publicUrlData } = supabase.storage.from('img').getPublicUrl(filePath);
  return publicUrlData.publicUrl;
}
