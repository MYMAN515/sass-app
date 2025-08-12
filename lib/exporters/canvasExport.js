// lib/exporters/canvasExport.js
export async function composeForPreset(cutoutUrl, preset, { padding = 0.06, bgOverride } = {}) {
  // cutoutUrl = صورة شفافة (ناتج remove BG)
  const srcBlob = await fetch(cutoutUrl, { cache: 'no-store' }).then(r => r.blob());
  const bmp = await createImageBitmap(srcBlob);

  const [W, H] = preset.size;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  // خلفية
  ctx.fillStyle = bgOverride ?? preset.bg ?? '#ffffff';
  ctx.fillRect(0, 0, W, H);

  // حواف/تمركز
  const boxW = Math.round(W * (1 - padding * 2));
  const boxH = Math.round(H * (1 - padding * 2));
  const ratio = Math.min(boxW / bmp.width, boxH / bmp.height);
  const dw = bmp.width * ratio, dh = bmp.height * ratio;
  const dx = (W - dw) / 2, dy = (H - dh) / 2;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bmp, dx, dy, dw, dh);

  const mime = preset.format === 'png' ? 'image/png' : 'image/jpeg';
  const quality = preset.quality ?? 0.9;
  return canvas.toDataURL(mime, quality);
}

export function downloadDataUrl(dataUrl, filename) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.click();
}
