'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Check } from 'lucide-react';

export default function TryOnCustomizer({ onChange, onComplete }) {
  const basicSteps = [
    { name: 'product', label: 'What is your product?', options: ['Shirt', 'T-Shirt', 'Jacket', 'Sweater', 'Pants', 'Jeans', 'Shorts', 'Dress', 'Skirt', 'Hoodie'] },
    { name: 'gender', label: 'Who is the model?', options: ['Female', 'Male'] },
  ];

  const advancedSteps = [
    { name: 'Age', label: 'What is the age category?', options: ['Adult', 'Teen', 'Child'] },
    { name: 'height', label: 'Model height?', options: ['Tall', 'Average', 'Short'] },
    { name: 'skinTone', label: 'Model skin tone?', options: ['Light', 'Medium', 'Dark'] },
    { name: 'bodyType', label: 'Model body type?', options: ['Slim', 'Athletic', 'Plus'] },
  ];

  const otherSteps = [
    { name: 'style', label: 'Preferred style?', options: ['Catalog', 'Streetwear', 'Luxury'] },
    { name: 'background', label: 'Background preference?', options: ['Beige Studio', 'Plain White', 'Urban Street'] },
    { name: 'angle', label: 'Camera angle?', options: ['Front', 'Side', '3/4 Angle'] },
  ];

  const [showAdvanced, setShowAdvanced] = useState(false);
  const steps = [...basicSteps, ...(showAdvanced ? advancedSteps : []), ...otherSteps];

  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState({});
  const [customEdit, setCustomEdit] = useState({});
  const [inputBuffer, setInputBuffer] = useState({});

  const current = steps[stepIndex];

  const handleSelect = (value) => {
    const updated = { ...form, [current.name]: value };
    setForm(updated);
    onChange({ [current.name]: value });

    if (stepIndex < steps.length - 1) {
      setStepIndex((prev) => prev + 1);
    } else {
      onComplete?.();
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
      className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-3xl p-8 shadow-xl max-w-3xl mx-auto mt-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold text-zinc-900 dark:text-white">
          🧍 Customize Your Try-On
        </h2>
        <button
          onClick={() => {
            const toggled = !showAdvanced;
            setShowAdvanced(toggled);
            setStepIndex(toggled ? 2 : 0);
          }}
          className="text-sm px-4 py-2 bg-purple-100 text-purple-700 rounded-full border border-purple-300 hover:bg-purple-200"
        >
          {showAdvanced ? 'Hide Model Options' : 'Customize Model'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {current && (
          <motion.div
            key={current.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
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

            {customEdit[current.name] ? (
              <>
                <input
                  type="text"
                  placeholder={`Enter custom ${current.name}...`}
                  value={inputBuffer[current.name]}
                  onChange={(e) => setInputBuffer({ ...inputBuffer, [current.name]: e.target.value })}
                  className="w-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-xl px-4 py-3 border border-zinc-300 dark:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-zinc-400 mt-2">Type your own value and click Done.</p>
              </>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
  );
}
