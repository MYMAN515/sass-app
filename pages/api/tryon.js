// pages/api/tryon.js
<<<<<<< HEAD
=======
export const config = {
  api: {
    bodyParser: true,
  },
};
>>>>>>> 292c6fba (New Front-end | Back-End|)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }
<<<<<<< HEAD

  const { imageUrl, prompt } = req.body;
=======
  
  const { imageUrl, prompt } = req.body || {};


>>>>>>> 292c6fba (New Front-end | Back-End|)
  if (!imageUrl || !prompt) {
    return res.status(400).json({ error: 'Missing imageUrl or prompt' });
  }

  const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;
  if (!REPLICATE_TOKEN) {
    return res.status(500).json({ error: 'Replicate API token not set' });
  }

  // Start the prediction
  const startRes = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      Authorization: `Token ${REPLICATE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: 'black-forest-labs/flux-kontext-pro',
      input: {
        prompt,
        input_image: imageUrl,
        aspect_ratio: 'match_input_image',
        output_format: 'jpg',
        safety_tolerance: 2,
      },
    }),
  });

  const startData = await startRes.json();

  if (!startRes.ok || !startData?.urls?.get) {
    return res.status(400).json({
      error: startData?.error || 'Replicate API failed to start generation',
      detail: startData,
    });
  }

  // Poll for the result
  const statusUrl = startData.urls.get;
  let output = null;
  let pollCount = 0;
  const maxPolls = 30; // ~1 minute

  while (pollCount < maxPolls) {
    const pollRes = await fetch(statusUrl, {
      headers: { Authorization: `Token ${REPLICATE_TOKEN}` },
    });
    const pollData = await pollRes.json();

    if (pollData.status === 'succeeded') {
      output = pollData.output;
      break;
    }
    if (pollData.status === 'failed') {
      return res.status(500).json({ error: 'AI generation failed', detail: pollData });
    }

    await new Promise((r) => setTimeout(r, 2000));
    pollCount++;
  }

  if (!output) {
    return res.status(504).json({ error: 'Timed out waiting for AI result' });
  }

  return res.status(200).json({ output });
}