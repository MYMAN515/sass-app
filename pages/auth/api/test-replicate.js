// pages/api/test-replicate.js
import Replicate from 'replicate';

export default async function handler(req, res) {
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  try {
    const output = await replicate.run("black-forest-labs/flux-kontext-max", {
      input: {
        input_image: "https://replicate.delivery/mgxt/793a533e-150c-41e4-b130-0d55cf33c97c/testshirt.png",
        prompt: "Place the t-shirt on a fashion model standing in a studio",
        output_format: "jpg",
        aspect_ratio: "match_input_image",
        safety_tolerance: 2,
      },
    });

    if (!Array.isArray(output) || !output[0]) {
      return res.status(500).json({ error: "No image returned from Replicate" });
    }

    return res.status(200).json({ image: output[0] });
  } catch (err) {
    console.error("❌ API Replicate Error:", err);
    return res.status(500).json({ error: err.message || "Failed to generate image" });
  }
}
