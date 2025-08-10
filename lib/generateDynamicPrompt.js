// lib/generateDynamicPrompt.js

const compact = (arr) => arr.filter(Boolean).map((s) => String(s).trim()).filter(Boolean);
const lc = (v) => (v ? String(v).trim().toLowerCase() : '');
const cap = (v) => (v ? String(v).trim().replace(/^\s*([a-z])/i, (m, c) => c.toUpperCase()) : '');

export function generateTryOnNegativePrompt(extra = []) {
  const base = [
    'low resolution',
    'blurry',
    'warped body parts',
    'misaligned clothing',
    'melted textures',
    'extra limbs',
    'hands merged',
    'distorted logos',
    'messy background',
    'harsh shadows',
    'overexposed highlights',
    'banding',
    'jpeg artifacts',
    'watermark',
    'text overlay',
  ];
  return compact([...base, ...(Array.isArray(extra) ? extra : [])]).join(', ');
}

/**
 * Generate try-on prompt (improved, backward-compatible with your keys).
 * Accepts:
 *  gender, Age, product, height, skinTone, background, bodyType, style, angle
 */
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
} = {}) {
  const g  = lc(gender);
  const a  = lc(Age);
  const p  = lc(product);
  const h  = lc(height);
  const st = lc(skinTone);
  const bg = lc(background);
  const bt = lc(bodyType);
  const sd = lc(style);
  const ang= lc(angle);

  const lines = compact([
    `Generate a high-resolution, studio-quality image of a realistic ${st} ${a} ${g} fashion model with a ${bt} body type and ${h} height, wearing the uploaded ${p}.`,
    `Overall direction: professional ${sd} fashion photoshoot for a top-tier e-commerce platform (e.g., Zara, ASOS, Farfetch).`,
    '',
    `Pose: natural, relaxed stance; arms slightly apart so the garment is fully visible; captured from a ${ang} angle.`,
    `Look: fashion-forward, clean posture, age-appropriate hairstyle, neutral expression.`,
    `Clothing fit: the ${p} must fit naturally with realistic fabric behavior, seams and edges intact, correct drape and silhouette.`,
    '',
    `Lighting: soft, evenly distributed studio lighting that enhances stitching, texture and material; subtle, natural shadows under neck, around arms and waistline.`,
    `Background: ${bg} background with soft blur, clean, no clutter or props.`,
    `Framing: high-resolution, centered composition from the ${ang} angle; crop suitable for catalog and PDP.`,
    '',
    `Fabric detail: preserve patterns, prints, logos/tags (if present), textures and creases with clean edges; avoid distortion or melting.`,
    `Photographic quality: premium brand feel; color-accurate, sharp but not over-sharpened, no halos.`,
    '',
    `Output: high-resolution, crisp edges, no watermark, no logos, no text overlays.`,
  ]);

  return lines.join('\n').trim();
}

// Optional helper to return both prompts at once
export function buildTryOnPromptBundle(opts = {}, negativeExtras = []) {
  return {
    prompt: generateDynamicPrompt(opts),
    negativePrompt: generateTryOnNegativePrompt(negativeExtras),
  };
}
