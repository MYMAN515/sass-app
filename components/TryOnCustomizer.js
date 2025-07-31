// components/TryOnCustomizer.js
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function TryOnCustomizer({ onChange }) {
  const [options, setOptions] = useState({
    product: 'Shirt',
    height: 'Average',
    skinTone: 'Medium',
    background: 'Beige Studio',
    bodyType: 'Athletic',
    style: 'Catalog',
    angle: 'Front',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...options, [name]: value };
    setOptions(updated);
    onChange(updated);
  };

  return (
    <motion.div
      className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-purple-700 rounded-3xl p-8 shadow-2xl mb-10"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
        ✨ Customize your AI Try-On Experience
      </h2>
      <p className="text-sm text-zinc-400 mb-6">
        Choose model preferences and styling details to visualize your product more accurately.
      </p>

      <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-6">
        {[
          { label: 'Product Type', name: 'product', options: ['Shirt', 'T-Shirt', 'Jacket', 'Sweater', 'Pants', 'Jeans', 'Shorts', 'Dress', 'Skirt', 'Hoodie'] },
          { label: 'Model Height', name: 'height', options: ['Short', 'Average', 'Tall'] },
          { label: 'Skin Tone', name: 'skinTone', options: ['Light', 'Medium', 'Dark'] },
          { label: 'Background', name: 'background', options: ['Beige Studio', 'Plain White', 'Urban Street'] },
          { label: 'Body Type', name: 'bodyType', options: ['Slim', 'Athletic', 'Curvy'] },
          { label: 'Photo Style', name: 'style', options: ['Catalog', 'Streetwear', 'Luxury'] },
          { label: 'Pose Angle', name: 'angle', options: ['Front', 'Side', '3/4 Angle'] },
        ].map(({ label, name, options: optionList }) => (
          <div key={name} className="text-left">
            <label className="block text-sm text-zinc-300 font-medium mb-1">
              {label}
            </label>
            <select
              name={name}
              value={options[name]}
              onChange={handleChange}
              className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-2 rounded-lg shadow-sm hover:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              {optionList.map((opt) => (
                <option key={opt}>{opt}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
