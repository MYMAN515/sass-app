import { supabase } from '@/lib/supabaseClient';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const form = new IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parsing error:', err);
      return res.status(500).json({ error: 'Form parsing failed' });
    }

    const email = fields.email?.toString();
    const imageFile = files.image;

    if (!email || !imageFile) {
      return res.status(400).json({ error: 'Missing email or image' });
    }

    const filePath = Array.isArray(imageFile)
      ? imageFile[0].filepath
      : imageFile.filepath;

    const fileName = `enhance-${Date.now()}-${path.basename(filePath)}`;

    try {
      const fileBuffer = fs.readFileSync(filePath);

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('img')
        .upload(fileName, fileBuffer, {
          contentType: imageFile.mimetype || 'image/jpeg',
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return res.status(500).json({ error: 'Failed to upload image' });
      }

      const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/img/${fileName}`;

      // Step 1: Call Replicate
      const predictionRes = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: "a9758cbef03c9c49bb1d62a161baa1e14473f5b78a68b0d910fe26cd8a3b09e6",
          input: { image: imageUrl },
        }),
      });

      const prediction = await predictionRes.json();

      if (!prediction?.id) {
        console.error('Prediction creation failed:', prediction);
        return res.status(500).json({ error: 'Failed to start enhancement' });
      }

      // Step 2: Polling until the result is ready
      let enhancedImage = null;
      for (let i = 0; i < 20; i++) {
        const statusRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
          headers: {
            Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
        });

        const statusData = await statusRes.json();

        if (statusData.status === 'succeeded') {
          enhancedImage = statusData.output;
          break;
        } else if (statusData.status === 'failed') {
          console.error('Prediction failed:', statusData);
          return res.status(500).json({ error: 'AI enhancement failed' });
        }

        // Wait a bit before checking again
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      if (!enhancedImage) {
        return res.status(500).json({ error: 'Enhancement took too long' });
      }

      // Save to DB
      const { error: dbError } = await supabase.from('generation_history').insert([
        {
          user_email: email,
          feature: 'enhance',
          prompt: null,
          image_url: enhancedImage,
        },
      ]);

      if (dbError) {
        console.error('Supabase DB error:', dbError);
        return res.status(500).json({ error: 'Failed to save result' });
      }

      return res.status(200).json({ enhancedImage });
    } catch (error) {
      console.error('Enhance error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
}
