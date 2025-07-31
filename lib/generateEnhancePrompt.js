export function generateEnhancePrompt({
  productType,
  cameraAngle,
  photographyStyle,
  background,
  lighting,
  colorStyle,
  realism,
  outputQuality
}) {
  return `
Enhance the uploaded image of a "${productType}" to produce a high-quality, ${realism}, and visually compelling product photo.

📐 Framing:
Use a "${cameraAngle}" view with clean composition.

💡 Lighting & Color:
Apply "${lighting}" to highlight details. Use "${colorStyle}" tones for strong visual impact.

🏞 Background:
Replace with "${background}" to match brand tone and avoid distractions.

🎯 Style:
Follow the "${photographyStyle}" theme with modern commercial aesthetics.

🖼️ Output:
Render at "${outputQuality}" resolution. Maintain clarity, detail, and realism. No watermark or distortion.

⚠️ Do not alter product shape, branding, or core identity. Preserve textures, shadows, and proportions.
  `.trim();
}
    