export default async function handler(req, res) {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Missing text' });

  const result = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'Rewrite this product description:' },
        { role: 'user', content: text },
      ],
    }),
  });

  const data = await result.json();
  res.status(200).json({ rewritten: data.choices?.[0]?.message?.content.trim() });
}
