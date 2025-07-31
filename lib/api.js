export async function generateTryon(imageUrl, prompt) {
  const res = await fetch('/api/tryon', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl, prompt }),
  });
  const data = await res.json();
  return data.output;
}
