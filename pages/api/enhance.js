export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { imageUrl, prompt } = req.body;
  const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;

  if (!REPLICATE_TOKEN) {
    return res.status(500).json({ error: 'Missing Replicate token' });
  }

  if (!imageUrl || !prompt) {
    return res.status(400).json({ error: 'Missing imageUrl or prompt' });
  }

  try {
    const start = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        Authorization: `Token ${REPLICATE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'black-forest-labs/flux-kontext-pro', // ← استبدلها بنسخة النموذج اللي تستخدمها لو لزم
        input: {
          prompt,
          input_image: imageUrl,
          aspect_ratio: 'match_input_image',
          output_format: 'jpg',
          safety_tolerance: 2
        },
      }),
    });

    const startData = await start.json();

    if (!start.ok || !startData?.urls?.get) {
      return res.status(400).json({
        error: startData?.error || 'Replicate API failed to start generation',
        detail: startData,
      });
    }

    const statusUrl = startData.urls.get;

    let output = null;
    while (true) {
      const pollRes = await fetch(statusUrl, {
        headers: { Authorization: `Token ${REPLICATE_TOKEN}` },
      });

      const pollData = await pollRes.json();

      if (pollData.status === 'succeeded') {
        output = pollData.output;
        break;
      }

      if (pollData.status === 'failed') {
        return res.status(500).json({ error: 'AI generation failed' });
      }

      await new Promise((r) => setTimeout(r, 2000)); // wait 2 seconds
    }

    return res.status(200).json({ output });
  } catch (err) {
    console.error("❌ Replicate API error:", err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
