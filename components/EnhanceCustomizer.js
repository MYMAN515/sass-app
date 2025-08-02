'use client';

import { useState, useEffect } from 'react';

const fields = [
  {
    name: 'productType',
    label: 'Product Type',
    options: [
      'food', 'clothing', 'accessory', 'electronics', 'furniture', 'cosmetics', 'bottle', 'shoes', 'bag', 'watch', 'jewelry', 'perfume'
    ],
  },
  {
    name: 'photographyStyle',
    label: 'Photography Style',
    options: [
      'summer outdoor lifestyle', 'cozy indoor winter', 'clean professional catalog',
      'dark luxury branding', 'streetwear edgy', 'minimal artistic'
    ],
  },
  {
    name: 'background',
    label: 'Background Style',
    options: [
      'clean white', 'soft grey gradient', 'wooden table',
      'kitchen counter', 'studio black', 'blurry street market'
    ],
  },
  {
    name: 'lighting',
    label: 'Lighting Type',
    options: [
      'natural daylight', 'diffused softbox lighting', 'high-key studio light',
      'moody spotlight', 'warm golden hour'
    ],
  },
  {
    name: 'colorStyle',
    label: 'Color Style',
    options: [
      'vibrant and bold', 'natural soft colors', 'high contrast', 'monochrome black & white'
    ],
  },
  {
    name: 'realism',
    label: 'Realism Level',
    options: [
      'photo-realistic', 'marketing-style rendering', 'artistic stylized'
    ],
  },
  {
    name: 'outputQuality',
    label: 'Output Quality',
    options: [
      '4K studio-grade', 'HD ecommerce-ready', 'square - Instagram style', 'vertical - story format'
    ],
  },
];

export default function EnhanceCustomizer({ onChange }) {
  const [form, setForm] = useState(() => {
    const init = {};
    fields.forEach(({ name, options }) => {
      init[name] = options[0];
    });
    return init;
  });

  const [customInputs, setCustomInputs] = useState({});

  useEffect(() => {
    const merged = { ...form };
    for (const key in customInputs) {
      if (customInputs[key]) merged[key] = customInputs[key];
    }
    onChange(merged);
  }, [form, customInputs, onChange]);

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (value !== '__custom__') setCustomInputs((prev) => ({ ...prev, [name]: '' }));
  };

  const handleCustomChange = (e) => {
    const { name, value } = e.target;
    setCustomInputs((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
      {fields.map(({ name, label, options }) => (
        <div key={name}>
          <label className="block text-sm font-semibold text-purple-300 mb-1">{label}</label>
          <select
            name={name}
            value={form[name]}
            onChange={handleSelectChange}
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg"
          >
            {options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
            <option value="__custom__">➕ Custom...</option>
          </select>

          {form[name] === '__custom__' && (
            <input
              type="text"
              name={name}
              value={customInputs[name] || ''}
              onChange={handleCustomChange}
              placeholder={`Enter custom ${label.toLowerCase()}`}
              className="mt-2 w-full px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-sm"
            />
          )}
        </div>
      ))}
    </div>
  );
}
