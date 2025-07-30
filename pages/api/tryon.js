export default async function handler(req, res) {
  const { imageUrl, params } = req.body;
  if (!imageUrl) return res.status(400).json({ error: 'Image required' });

  const result = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: "tryon-model-id", // update with real ID
      input: {
        image: imageUrl,
        ...params,
      },
    }),
  });

  const data = await result.json();
  res.status(200).json({ tryonImage: data?.output });
}
