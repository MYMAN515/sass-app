// /pages/api/tryon.js
import { supabase } from '@/lib/supabaseClient';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

function generateDynamicPrompt({ product, height, skinTone, background, bodyType, style, angle }) {
  return `
Generate a high-resolution studio-quality image of a realistic ${skinTone} fashion model with a ${bodyType} body type and ${height} height, wearing the uploaded ${product}. The model should appear as if part of a professional fashion photoshoot for a ${style} e-commerce website (e.g., Zara, ASOS, Farfetch).

Model Pose: Model should be standing in a natural, relaxed position, arms slightly apart from the body to avoid covering the garment. The pose should be captured from a ${angle} angle. Full body or upper half should be visible depending on image crop.

Model Look: Fashion-forward, clean, with good posture. Modern hairstyle and neutral expression are essential.

Clothing Fit: Ensure the ${product} fits naturally and accurately on the model’s body. Include realistic shadows under arms, around edges, buttons, and any folds or design elements.

Lighting: Soft, evenly distributed studio lighting that highlights garment details, stitching, and fabric texture. Shadows should appear under the neck, around arms, and waistline.

Background: Use a ${background} background. It should be plain and softly blurred to mimic a premium studio shoot with no distractions.

Camera Framing: High-resolution, front-facing or as per selected angle, with clean composition suitable for display in professional catalogs or global e-commerce platforms.

Fabric Detail: Preserve all details of the original item such as patterns, logos, prints, tags, creases, and stitching. Avoid any blurring, melting, or distortion of the fabric.

Photographic Quality: The final output must look like it was shot by a professional fashion photographer for use in a luxury clothing brand’s online store.

Output: High-resolution, clean edges, no watermark, no text overlays.
`.trim();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const form = new IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err);
      return res.status(500).json({ error: 'Form parse failed' });
    }

    const email = fields.email?.toString();
    const product = fields.product?.toString() || 'product';
    const customization = {
      height: fields.height?.toString() || 'Average',
      skinTone: fields.skinTone?.toString() || 'Medium',
      background: fields.background?.toString() || 'Beige Studio',
      bodyType: fields.bodyType?.toString() || 'Athletic',
      style: fields.style?.toString() || 'Catalog',
      angle: fields.angle?.toString() || 'Front',
    };

    const imageFile = files.image;
    if (!email || !imageFile) {
      return res.status(400).json({ error: 'Missing email or image' });
    }

    const filePath = Array.isArray(imageFile) ? imageFile[0].filepath : imageFile.filepath;
    const fileName = `tryon-${Date.now()}-${path.basename(filePath)}`;
    const fileBuffer = fs.readFileSync(filePath);

    try {
      const { error: uploadError } = await supabase.storage
        .from('img')
        .upload(fileName, fileBuffer, {
          contentType: imageFile.mimetype || 'image/jpeg',
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return res.status(500).json({ error: 'Image upload failed' });
      }

      const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/img/${fileName}`;
      const prompt = generateDynamicPrompt({ product, ...customization });

      const replicateRes = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: "black-forest-labs/flux-kontext-max", // أو ضع ID النسخة حسب الحاجة
          input: {
            input_image: imageUrl,
            prompt,
            output_format: "jpg",
            email,
            feature: "tryon",
          },
          webhook: `${process.env.NEXT_PUBLIC_BASE_URL}/api/replicate-webhook`,
          webhook_events_filter: ["completed"],
        }),
      });

      const data = await replicateRes.json();

      if (data?.error || replicateRes.status >= 400) {
        console.error('Replicate error:', data);
        return res.status(500).json({ error: 'Replicate prediction failed' });
      }

      return res.status(200).json({ status: 'Processing started', prediction_id: data.id });
    } catch (error) {
      console.error('Try-On error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
}
