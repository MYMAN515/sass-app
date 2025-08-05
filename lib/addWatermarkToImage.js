import { createCanvas, loadImage } from 'canvas';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';

/**
 * Adds a watermark to the provided image and uploads it to Supabase storage
 * @param {string} imageUrl - The original image URL
 * @param {object} supabase - An instance of Supabase client (server-side)
 * @returns {string} - Public URL of the watermarked image
 */
export async function addWatermarkToImage(imageUrl, supabase) {
  try {
    const response = await fetch(imageUrl);
    const buffer = await response.buffer();
    const image = await loadImage(buffer);

    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(image, 0, 0);

    const watermarkText = 'AI Store Assistant';
    const fontSize = Math.floor(image.width / 25);
    ctx.font = `${fontSize}px sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(watermarkText, image.width - 20, image.height - 20);

    const finalBuffer = canvas.toBuffer('image/png');
    const filename = `watermarked-${uuidv4()}.png`;

    const { error: uploadError } = await supabase.storage
      .from('generated-images')
      .upload(filename, finalBuffer, {
        contentType: 'image/png',
        upsert: true,
      });

    if (uploadError) {
      console.error('[Upload Error]', uploadError);
      throw new Error('Failed to upload watermarked image');
    }

    const { data: publicUrlData } = supabase.storage
      .from('generated-images')
      .getPublicUrl(filename);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('[Watermark Error]', err);
    throw new Error('Watermark processing failed');
  }
}
