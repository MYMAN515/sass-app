import { supabase } from './supabaseClient';

export async function uploadImageToSupabase(file) {
  if (!file) throw new Error('No file provided');

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `tryon/${fileName}`;

  // Upload to Supabase Storage
  const { error } = await supabase.storage
    .from('img')
    .upload(filePath, file);

  if (error) throw new Error('Failed to upload image');

  // Get public URL
  const { data } = supabase.storage.from('img').getPublicUrl(filePath);
  if (!data?.publicUrl) throw new Error('Failed to get public URL');

  return data.publicUrl;
}