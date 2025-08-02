// components/EnhancePresets.js
'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const presets = [
  {
    name: 'Rustic Food',
    description: 'Capture food in a rustic, cozy style with natural light and a wooden table setup.',
    image: '/presets/rustic-food.jpg',
    options: {
      productType: 'food',
      photographyStyle: 'rustic lifestyle',
      background: 'wooden table',
      lighting: 'natural daylight',
      colorStyle: 'warm',
      realism: 'photo-realistic',
      promot: `
Enhance the uploaded image of a "food" item to produce a high-quality, photo-realistic, and visually compelling product photo.

📐 Framing:
Use a "top-down" view with clean composition.

💡 Lighting & Color:
Apply "natural daylight" to highlight textures and freshness. Use "warm" tones for a rustic, inviting aesthetic.

🏞 Background:
Replace with "wooden table" to create a cozy, authentic mood.

🎯 Style:
Follow the "rustic lifestyle" theme with natural, editorial photography vibes.

🖼️ Output:
Render at "4K studio-grade" resolution. Maintain texture, organic feel, and contrast. No filters or artificial effects.

⚠️ Do not alter food shape, plating, or color balance. Keep shadows soft and appetizing.
      `.trim(),
      outputQuality: '4K studio-grade',
    },
  },
  {
    name: 'Minimal Electronics',
    description: 'Showcase tech products with a clean, minimal style ideal for online shops.',
    image: '/presets/minimal-tech.jpg',
    options: {
      productType: 'electronics',
      photographyStyle: 'clean studio',
      background: 'white background',
      lighting: 'softbox lighting',
      colorStyle: 'neutral',
      realism: 'high-realism',
      promot: `
Enhance the uploaded image of an "electronics" product to produce a high-quality, high-realism, and visually compelling product photo.

📐 Framing:
Use a "flat lay" or "angled front" view with minimalist balance.

💡 Lighting & Color:
Apply "softbox lighting" to emphasize product form and edges. Use "neutral" tones for modern minimalism.

🏞 Background:
Replace with a clean "white background" to maintain focus and consistency.

🎯 Style:
Follow the "clean studio" photography style ideal for online catalogs and tech listings.

🖼️ Output:
Render at "HD ecommerce-ready" resolution. Ensure clarity, edge sharpness, and natural reflections.

⚠️ Do not modify logos, labels, or interface screens. Maintain realistic materials (metal, glass, plastic).
      `.trim(),
      outputQuality: 'HD ecommerce-ready',
    },
  },
  {
    name: 'Luxury Perfume',
    description: 'Highlight perfume bottles with dramatic lighting and premium branding aesthetics.',
    image: '/presets/luxury-perfume.jpg',
    options: {
      productType: 'bottle',
      photographyStyle: 'luxury branding',
      background: 'black studio',
      lighting: 'moody spotlight',
      colorStyle: 'high contrast',
      realism: 'ultra-realistic',
      promot: `
Enhance the uploaded image of a "bottle" product to produce a high-quality, ultra-realistic, and visually compelling product photo.

📐 Framing:
Use a "close-up angle" to highlight curves, glass, and label detail.

💡 Lighting & Color:
Apply "moody spotlight" to create depth and focus. Use "high contrast" tones for dramatic luxury branding.

🏞 Background:
Replace with a sleek "black studio" to evoke exclusivity and premium aesthetics.

🎯 Style:
Follow the "luxury branding" theme for high-end advertisements and fashion campaigns.

🖼️ Output:
Render at "4K studio-grade" resolution. Emphasize reflections, clarity, and depth without distortion.

⚠️ Do not alter brand logo, bottle shape, or texture. Preserve lighting gradients and highlight transitions.
      `.trim(),
      outputQuality: '4K studio-grade',
    },
  },
];

export default function EnhancePresets({ onSelect }) {
  const [index, setIndex] = useState(0);
  const current = presets[index];

  const handleNext = () => setIndex((prev) => (prev + 1) % presets.length);
  const handlePrev = () => setIndex((prev) => (prev - 1 + presets.length) % presets.length);

  return (
    <div className="relative w-full max-w-4xl mx-auto text-white">
      <div className="relative border border-zinc-700 rounded-2xl overflow-hidden bg-zinc-900 shadow-xl">
        <img
          src={current.image}
          alt={current.name}
          className="w-full h-64 object-cover"
        />
        <div className="p-6 space-y-2">
          <h3 className="text-2xl font-bold text-white">{current.name}</h3>
          <p className="text-purple-300 text-sm">{current.description}</p>
          <button
            className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg"
            onClick={() => onSelect(current.options)}
          >
            Use this preset
          </button>
        </div>
        <button onClick={handlePrev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 rounded-full p-2">
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <button onClick={handleNext} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 rounded-full p-2">
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}
