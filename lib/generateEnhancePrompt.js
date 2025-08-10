// components/prompt/enhancePrompt.js

/**
 * Small helpers
 */
const compact = (arr) => arr.filter(Boolean).map((s) => String(s).trim()).filter(Boolean);
const sentence = (s) => (s ? String(s).trim().replace(/\s+/g, ' ') : '');
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/**
 * Optional: normalize some common synonyms to keep prompts consistent
 */
const normalize = {
  lighting: (v) => {
    if (!v) return '';
    const s = v.toLowerCase();
    if (s.includes('softbox')) return 'diffused softbox';
    if (s.includes('golden')) return 'warm golden hour';
    if (s.includes('studio') && s.includes('high')) return 'high-key studio light';
    return v;
  },
  background: (v) => {
    if (!v) return '';
    const s = v.toLowerCase();
    if (s.includes('white')) return 'clean white';
    if (s.includes('gray') || s.includes('grey')) return 'soft grey gradient';
    return v;
  },
  realism: (v) => v || '',
  colorStyle: (v) => v || '',
  outputQuality: (v) => v || '',
  photographyStyle: (v) => v || '',
  purpose: (v) => v || '',
  productType: (v) => v || 'product',
};

/**
 * Build a strong negative prompt to reduce common visual defects.
 */
export function generateEnhanceNegativePrompt(extra = []) {
  const base = [
    'low resolution',
    'blurry',
    'over-sharpened halos',
    'jpeg artifacts',
    'color banding',
    'chromatic aberration',
    'over-saturated colors',
    'washed out whites',
    'unnatural shadows',
    'harsh reflections',
    'warped logos',
    'stretched text',
    'dirty background',
    'clipping on edges',
    'posterization',
    'skin smoothing artifacts',
  ];
  return compact([...base, ...(Array.isArray(extra) ? extra : [])]).join(', ');
}

/**
 * Main prompt generator (improved).
 * Accepts the original keys and also optional extras:
 * - colorStyle, realism, outputQuality, composition, brandTone, mood, retouch
 * - notes (free text), enforcePng (bool), aspect (e.g. "square", "4:5", "16:9")
 */
export function generateEnhancePromptFromChoices(input = {}) {
  const productType     = normalize.productType(input.productType);
  const photographyStyle= normalize.photographyStyle(input.photographyStyle);
  const background      = normalize.background(input.background);
  const lighting        = normalize.lighting(input.lighting);
  const colorStyle      = normalize.colorStyle(input.colorStyle);
  const realism         = normalize.realism(input.realism);
  const outputQuality   = normalize.outputQuality(input.outputQuality);
  const purpose         = normalize.purpose(input.purpose);

  // Optional extras (safe defaults)
  const composition = sentence(
    input.composition ||
    'centered product, ample negative space, clean framing, natural perspective'
  );
  const brandTone = sentence(input.brandTone || 'modern, premium, trustworthy');
  const mood = sentence(input.mood || '');
  const notes = sentence(input.notes || '');
  const aspect = sentence(input.aspect || 'original aspect');
  const retouch = sentence(
    input.retouch ||
    'subtle retouching only; preserve true materials, textures, seams, and labels'
  );
  const enforcePng = input.enforcePng !== false; // default true

  const header = `Enhance a ${productType} product photo`.trim();

  const lines = compact([
    `${header}.`,
    photographyStyle && `Style: ${photographyStyle}.`,
    background && `Background: ${background}.`,
    lighting && `Lighting: ${lighting}.`,
    colorStyle && `Color palette: ${colorStyle}.`,
    realism && `Rendering realism: ${realism}.`,
    purpose && `Purpose: ${purpose}.`,
    `Composition: ${composition}.`,
    brandTone && `Brand tone: ${brandTone}.`,
    mood && `Mood: ${mood}.`,
    `Technical: high dynamic range, accurate white balance, true-to-life colors, crisp micro-contrast, clean cutouts.`,
    outputQuality && `Output target: ${outputQuality}.`,
    aspect && `Aspect: ${aspect}.`,
    retouch && `Retouching: ${retouch}.`,
    notes && `Notes: ${notes}.`,
    enforcePng && `Export as PNG with transparent background if applicable.`,
    `Avoid artifacts, halos, banding, warped edges, or distorted logos.`,
  ]);

  return lines.join('\n');
}

/**
 * Convenience bundler if you prefer both strings at once.
 */
export function buildEnhancePromptBundle(choices = {}, negativeExtras = []) {
  return {
    prompt: generateEnhancePromptFromChoices(choices),
    negativePrompt: generateEnhanceNegativePrompt(negativeExtras),
  };
}

export default generateEnhancePromptFromChoices;
