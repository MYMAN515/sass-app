'use client';

import { useState, useEffect } from 'react';

export default function EnhanceCustomizer({ onChange }) {
  const [form, setForm] = useState({
    productType: 'food - burger',
    cameraAngle: '45-degree front side',
    photographyStyle: 'summer outdoor lifestyle',
    background: 'natural wooden table with soft blur',
    lighting: 'natural daylight',
    colorStyle: 'vibrant and bold',
    realism: 'photo-realistic',
    outputQuality: '4K studio-grade'
  });

  useEffect(() => {
    onChange(form);
  }, [form, onChange]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const createSelect = (name, label, options) => (
    <div>
      <label className="block text-sm text-purple-300 mb-1">{label}</label>
      <select
        name={name}
        value={form[name]}
        onChange={handleChange}
        className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
      {createSelect('productType', 'Product Type', [
        'food - burger', 'food - pizza', 'clothing - t-shirt', 'clothing - dress', 'accessory - watch', 'electronics - phone', 'perfume - bottle', 'furniture - chair'])}

      {createSelect('cameraAngle', 'Camera Angle', [
        'front-facing', 'top-down flat lay', '45-degree front side', 'close-up macro', 'back-facing'])}

      {createSelect('photographyStyle', 'Photography Style', [
        'summer outdoor lifestyle', 'cozy indoor winter', 'clean professional catalog', 'dark luxury branding', 'streetwear edgy', 'minimal artistic'])}

      {createSelect('background', 'Background Style', [
        'clean white', 'soft grey gradient', 'wooden table', 'kitchen counter', 'studio black', 'blurry street market'])}

      {createSelect('lighting', 'Lighting Type', [
        'natural daylight', 'diffused softbox lighting', 'high-key studio light', 'moody spotlight', 'warm golden hour'])}

      {createSelect('colorStyle', 'Color Style', [
        'vibrant and bold', 'natural soft colors', 'high contrast', 'monochrome black & white'])}

      {createSelect('realism', 'Realism Level', [
        'photo-realistic', 'marketing-style rendering', 'artistic stylized'])}

      {createSelect('outputQuality', 'Output Quality', [
        '4K studio-grade', 'HD ecommerce-ready', 'square - Instagram style', 'vertical - story format'])}
    </div>
  );
}
