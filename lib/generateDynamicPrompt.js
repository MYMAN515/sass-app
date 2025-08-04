// lib/generateDynamicPrompt.js

export default function generateDynamicPrompt({
  gender = 'Female',
  Age = 'Adult',
  product = 'Shirt',
  height = 'Average',
  skinTone = 'Medium',
  background = 'Beige Studio',
  bodyType = 'Athletic',
  style = 'Catalog',
  angle = 'Front',
}) {
  return `
Generate a high-resolution studio-quality image of a realistic ${skinTone.toLowerCase()} ${Age.toLowerCase()} ${gender.toLowerCase()} fashion model with a ${bodyType.toLowerCase()} body type and ${height.toLowerCase()} height, wearing the uploaded ${product.toLowerCase()}. The model should appear as if part of a professional ${style.toLowerCase()} fashion photoshoot for a top-tier e-commerce platform (e.g., Zara, ASOS, Farfetch).

Model Pose: Model should be standing in a natural, relaxed position, arms slightly apart from the body to avoid covering the garment. The pose should be captured from a ${angle.toLowerCase()} angle. Full body or upper half should be visible depending on image crop.

Model Look: Fashion-forward, clean, with good posture. Age-appropriate hairstyle and a neutral expression are essential.

Clothing Fit: The ${product} must fit naturally and accurately on the model’s body. Include realistic shadows under arms, around fabric edges, seams, buttons, and design folds.

Lighting: Use soft, evenly distributed studio lighting that enhances garment details, stitching, and fabric texture. Subtle shadows should appear under the neck, around arms, and the waistline.

Background: Use a ${background} background with soft blur to simulate a professional studio shoot. Avoid clutter, text, or visual distractions.

Camera Framing: High-resolution framing from the ${angle} angle with clean, centered composition suitable for catalog and online store presentation.

Fabric Detail: Ensure full preservation of garment features including patterns, logos, prints, tags, textures, creases, and stitching lines. Avoid any distortion, melting, or blurring of the fabric.

Photographic Quality: The final output must look like a professionally shot image for a premium clothing brand’s digital catalog or storefront.

Output Requirements: High-resolution, crisp edges, no watermark, no logos, no text overlays.
  `.trim();
}
