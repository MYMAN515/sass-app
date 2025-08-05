import { createCanvas, loadImage } from 'canvas';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from './supabaseClient'; // تأكد أنه مهيأ بشكل صحيح

export async function addWatermarkToImage(imageUrl) {
  // Step 1: تحميل الصورة من URL
  const response = await fetch(imageUrl);
  const buffer = await response.buffer();
  const image = await loadImage(buffer);

  // Step 2: إنشاء canvas بنفس أبعاد الصورة
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');

  // Step 3: رسم الصورة الأصلية
  ctx.drawImage(image, 0, 0);

  // Step 4: إضافة watermark نصي
  const watermarkText = 'AI Store Assistant';
  const fontSize = Math.floor(image.width / 25);
  ctx.font = `${fontSize}px sans-serif`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText(watermarkText, image.width - 20, image.height - 20);

  // Step 5: حفظ الصورة المعدلة
  const finalBuffer = canvas.toBuffer('image/png');
  const filename = `watermarked-${uuidv4()}.png`;

  // Step 6: رفع الصورة إلى Supabase
  const { data, error } = await supabase.storage
    .from('generated-images') // تأكد أن الـ bucket موجود و public
    .upload(filename, finalBuffer, {
      contentType: 'image/png',
      upsert: true,
    });

  if (error) {
    throw new Error('Failed to upload watermarked image');
  }

  const { publicUrl } = supabase.storage.from('generated-images').getPublicUrl(filename);
  return publicUrl;
}
