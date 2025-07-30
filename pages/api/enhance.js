export default async function handler(req, res) {
  const { imageUrl } = req.body;
  if (!imageUrl) return res.status(400).json({ error: 'Image URL required' });

  const result = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: "sdxl-enhancer-model-id", // update to correct ID
      input: { image: imageUrl },
    }),
  });

  const data = await result.json();
  res.status(200).json({ enhancedImage: data?.output });
}
