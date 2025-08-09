'use client';
export async function mirrorToStorage({ url }) {
  const res = await fetch('/api/save-remote-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j.error || 'Failed to mirror image');
  }
  return res.json(); // { publicUrl, path, contentType }
}
