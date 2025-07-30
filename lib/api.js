export async function generateTryon(imageUrl, params) {
  const res = await fetch('/api/tryon', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl, params }),
  });
  const data = await res.json();
  return data.tryonImage;
}
