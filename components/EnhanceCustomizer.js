'use client';

<<<<<<< HEAD
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
=======
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Check } from 'lucide-react';

const fields = [
  {
    name: 'photographyStyle',
    label: 'Preferred photography style?',
    options: ['summer outdoor lifestyle', 'cozy indoor winter', 'clean professional catalog', 'dark luxury branding', 'streetwear edgy', 'minimal artistic'],
  },
  {
    name: 'background',
    label: 'Background style?',
    options: ['clean white', 'soft grey gradient', 'wooden table', 'kitchen counter', 'studio black', 'blurry street market'],
  },
  {
    name: 'lighting',
    label: 'Lighting preference?',
    options: ['natural daylight', 'diffused softbox lighting', 'high-key studio light', 'moody spotlight', 'warm golden hour'],
  },
  {
    name: 'colorStyle',
    label: 'Color palette?',
    options: ['vibrant and bold', 'natural soft colors', 'high contrast', 'monochrome black & white'],
  },
  {
    name: 'realism',
    label: 'Realism level?',
    options: ['photo-realistic', 'marketing-style rendering', 'artistic stylized'],
  },
  {
    name: 'outputQuality',
    label: 'Output quality?',
    options: ['4K studio-grade', 'HD ecommerce-ready', 'square - Instagram style', 'vertical - story format'],
  },
];

export default function EnhanceCustomizer({ onChange, onComplete }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState({});
  const [customEdit, setCustomEdit] = useState({});
  const [inputBuffer, setInputBuffer] = useState({});

  const current = fields[stepIndex];

  const handleSelect = (value) => {
    const updated = { ...form, [current.name]: value };
    setForm(updated);
    onChange?.(updated);

    if (stepIndex < fields.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      onComplete?.(updated); // ✅ Final step triggers completion
    }
  };

  const handleEdit = () => {
    setCustomEdit({ ...customEdit, [current.name]: true });
    setInputBuffer({ ...inputBuffer, [current.name]: form[current.name] || '' });
  };

  const handleDone = () => {
    const val = inputBuffer[current.name]?.trim();
    if (val) {
      handleSelect(val);
    }
    setCustomEdit({ ...customEdit, [current.name]: false });
  };

  return (
    <motion.div
      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-3xl p-6 sm:p-8 shadow-xl w-full max-w-3xl mx-auto mt-10 sm:mt-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2 sm:gap-0">
        <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-white">
          🎨 Enhance Product Image
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-300">
          Step {stepIndex + 1} of {fields.length}
        </p>
      </div>

      {/* Field Step */}
      <AnimatePresence mode="wait">
        {current && (
          <motion.div
            key={current.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {/* Label + Edit */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-zinc-800 dark:text-white">
                {current.label}
              </h3>
              {!customEdit[current.name] ? (
                <button onClick={handleEdit} className="text-purple-500 text-sm flex items-center gap-1">
                  <Pencil className="w-4 h-4" /> Edit
                </button>
              ) : (
                <button onClick={handleDone} className="text-green-600 text-sm flex items-center gap-1">
                  <Check className="w-4 h-4" /> Done
                </button>
              )}
            </div>

            {/* Custom Input or Options */}
            {customEdit[current.name] ? (
              <>
                <input
                  type="text"
                  placeholder={`Enter custom ${current.name}...`}
                  value={inputBuffer[current.name]}
                  onChange={(e) =>
                    setInputBuffer({ ...inputBuffer, [current.name]: e.target.value })
                  }
                  className="w-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-xl px-4 py-3 border border-zinc-300 dark:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-zinc-400 mt-2">Type your own value and click Done.</p>
              </>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {current.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleSelect(opt)}
                    className={`rounded-xl px-4 py-3 min-h-[48px] text-sm font-medium border transition-all duration-200 flex items-center justify-center text-center
                      ${
                        form[current.name] === opt
                          ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-white border-zinc-300 dark:border-zinc-700 hover:border-purple-400'
                      }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
>>>>>>> 292c6fba (New Front-end | Back-End|)
  );
}
