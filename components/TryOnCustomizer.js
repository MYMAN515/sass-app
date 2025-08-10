// components/TryOnCustomizer.js
'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Check, ChevronLeft, ChevronRight, User, Camera, Wand2 } from 'lucide-react';

export default function TryOnCustomizer({ onChange, onComplete }) {
  const basicSteps = [
    { name: 'product', label: 'What is your product?', icon: <Wand2 className="w-4 h-4" />, options: ['Shirt','T-Shirt','Jacket','Sweater','Pants','Jeans','Shorts','Dress','Skirt','Hoodie'] },
    { name: 'gender',  label: 'Who is the model?',     icon: <User  className="w-4 h-4" />, options: ['Female','Male'] },
  ];

  const advancedSteps = [
    { name: 'Age',      label: 'Age category?',    icon: <User  className="w-4 h-4" />, options: ['Adult','Teen','Child'] },
    { name: 'height',   label: 'Model height?',    icon: <User  className="w-4 h-4" />, options: ['Tall','Average','Short'] },
    { name: 'skinTone', label: 'Model skin tone?', icon: <User  className="w-4 h-4" />, options: ['Light','Medium','Dark'] },
    { name: 'bodyType', label: 'Model body type?', icon: <User  className="w-4 h-4" />, options: ['Slim','Athletic','Plus'] },
  ];

  const otherSteps = [
    { name: 'style',     label: 'Preferred style?',     icon: <Wand2   className="w-4 h-4" />, options: ['Catalog','Streetwear','Luxury'] },
    { name: 'background',label: 'Background preference?', icon: <Camera className="w-4 h-4" />, options: ['Beige Studio','Plain White','Urban Street'] },
    { name: 'angle',     label: 'Camera angle?',        icon: <Camera className="w-4 h-4" />, options: ['Front','Side','3/4 Angle'] },
  ];

  const [showAdvanced, setShowAdvanced] = useState(false);
  const steps = useMemo(() => [...basicSteps, ...(showAdvanced ? advancedSteps : []), ...otherSteps], [showAdvanced]);

  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState({});
  const [customEdit, setCustomEdit] = useState(null); // field name or null
  const [customValue, setCustomValue] = useState('');

  const current = steps[stepIndex];
  const isLast  = stepIndex === steps.length - 1;
  const progress = useMemo(() => Math.round(((stepIndex + 1) / steps.length) * 100), [stepIndex, steps.length]);

  // emit changes upward
  useEffect(() => { onChange?.(form); }, [form, onChange]);

  // keep index in range if toggling advanced
  useEffect(() => {
    if (stepIndex >= steps.length) setStepIndex(steps.length - 1);
  }, [steps.length, stepIndex]);

  // keyboard nav
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'Enter' && form[current?.name]) next();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [stepIndex, form, current]);

  const choose = (value) => {
    const updated = { ...form, [current.name]: value };
    setForm(updated);
    setTimeout(() => { isLast ? onComplete?.(updated) : setStepIndex((i) => i + 1); }, 120);
  };

  const toggleCustomEdit = () => {
    if (customEdit === current.name) {
      setCustomEdit(null);
      setCustomValue('');
    } else {
      setCustomEdit(current.name);
      setCustomValue(form[current.name] || '');
    }
  };

  const saveCustom = () => {
    const v = (customValue || '').trim();
    if (v) choose(v);
    setCustomEdit(null);
  };

  const next = () => (isLast ? onComplete?.(form) : setStepIndex((i) => Math.min(i + 1, steps.length - 1)));
  const prev = () => setStepIndex((i) => Math.max(0, i - 1));

  return (
    <motion.div
      className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-white">🧍 Customize Your Try-On</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Step {stepIndex + 1} of {steps.length}</p>
        </div>
        <button
          onClick={() => {
            const toggled = !showAdvanced;
            setShowAdvanced(toggled);
            // keep progress intuitive
            setStepIndex((i) => Math.min(i, (toggled ? basicSteps.length + advancedSteps.length : basicSteps.length) - 1));
          }}
          className="text-sm px-4 py-2 rounded-full border border-purple-300 text-purple-700 bg-purple-100 hover:bg-purple-200"
        >
          {showAdvanced ? 'Hide Model Options' : 'Customize Model'}
        </button>
      </div>

      {/* Progress */}
      <div className="mt-4 h-1.5 w-full rounded-full bg-zinc-200/70 dark:bg-zinc-800">
        <div className="h-1.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500" style={{ width: `${progress}%` }} />
      </div>

      {/* Summary chips */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {steps.map((s, i) => (
          <span
            key={s.name}
            className={[
              'text-[11px] rounded-full px-2 py-1 border',
              i === stepIndex
                ? 'border-purple-500 text-purple-600 bg-purple-50 dark:bg-zinc-800/60'
                : form[s.name]
                ? 'border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/40'
                : 'border-zinc-200 dark:border-zinc-800 text-zinc-400'
            ].join(' ')}
            title={s.label}
          >
            {s.name}: <span className="font-medium">{form[s.name] || '—'}</span>
          </span>
        ))}
      </div>

      {/* Body */}
      <div className="mt-5">
        <AnimatePresence mode="wait">
          {current && (
            <motion.div
              key={current.name}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-fuchsia-500">{current.icon}</span>
                  <h3 className="text-lg font-medium text-zinc-800 dark:text-white">{current.label}</h3>
                </div>
                {customEdit === current.name ? (
                  <button onClick={saveCustom} className="text-green-600 text-sm inline-flex items-center gap-1">
                    <Check className="w-4 h-4" /> Done
                  </button>
                ) : (
                  <button onClick={toggleCustomEdit} className="text-purple-600 text-sm inline-flex items-center gap-1">
                    <Pencil className="w-4 h-4" /> Custom
                  </button>
                )}
              </div>

              {customEdit === current.name && (
                <div className="space-y-2 mb-4">
                  <input
                    autoFocus
                    type="text"
                    placeholder={`Enter custom ${current.name}…`}
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    className="w-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-xl px-4 py-3 border border-zinc-300 dark:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-zinc-500">اكتب اختيارك الخاص ثم اضغط Done.</p>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {current.options.map((opt) => {
                  const active = form[current.name] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => choose(opt)}
                      className={[
                        'rounded-xl px-3 py-2 min-h-[44px] text-sm font-medium border transition-all duration-200 text-center',
                        active
                          ? 'bg-purple-600 text-white border-purple-600 shadow'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-white border-zinc-300 dark:border-zinc-700 hover:border-purple-400'
                      ].join(' ')}
                      aria-pressed={active}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between gap-2">
        <button
          onClick={prev}
          className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
          disabled={stepIndex === 0}
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onComplete?.(form)}
            className="rounded-full px-4 py-2 text-sm font-semibold border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Skip & Generate
          </button>
          <button
            onClick={next}
            disabled={!form[current?.name]}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 px-5 py-2 text-sm font-semibold text-white shadow disabled:opacity-50"
          >
            {isLast ? <>Generate <Check className="w-4 h-4" /></> : <>Next <ChevronRight className="w-4 h-4" /></>}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
