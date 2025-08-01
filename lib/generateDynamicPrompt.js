function generateDynamicPrompt({ product, height, skinTone, background, bodyType, style, angle }) {
  return `
Generate a high-resolution studio-quality image of a realistic ${skinTone} fashion model with a ${bodyType} body type and ${height} height, wearing the uploaded ${product}. The model should appear as if part of a professional fashion photoshoot for a ${style} e-commerce website (e.g., Zara, ASOS, Farfetch).

Model Pose: Model should be standing in a natural, relaxed position, arms slightly apart from the body to avoid covering the garment. The pose should be captured from a ${angle} angle. Full body or upper half should be visible depending on image crop.

Model Look: Fashion-forward, clean, with good posture. Modern hairstyle and neutral expression are essential.

Clothing Fit: Ensure the ${product} fits naturally and accurately on the model’s body. Include realistic shadows under arms, around edges, buttons, and any folds or design elements.

Lighting: Soft, evenly distributed studio lighting that highlights garment details, stitching, and fabric texture. Shadows should appear under the neck, around arms, and waistline.

Background: Use a ${background} background. It should be plain and softly blurred to mimic a premium studio shoot with no distractions.

Camera Framing: High-resolution, front-facing or as per selected angle, with clean composition suitable for display in professional catalogs or global e-commerce platforms.

Fabric Detail: Preserve all details of the original item such as patterns, logos, prints, tags, creases, and stitching. Avoid any blurring, melting, or distortion of the fabric.

Photographic Quality: The final output must look like it was shot by a professional fashion photographer for use in a luxury clothing brand’s online store.

Output: High-resolution, clean edges, no watermark, no text overlays.
`.trim();
}