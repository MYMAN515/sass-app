// components/EnhanceCustomizer.js
'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Check, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const fields = [
  { name: 'photographyStyle', label: 'Preferred photography style?', options: ['summer outdoor lifestyle','cozy indoor winter','clean professional catalog','dark luxury branding','streetwear edgy','minimal artistic'] },
  { name: 'background',       label: 'Background style?',           options: ['clean white','soft grey gradient','wooden table','kitchen counter','studio black','blurry street market'] },
  { name: 'lighting',         label: 'Lighting preference?',        options: ['natural daylight','diffused softbox lighting','high-key studio light','moody spotlight','warm golden hour'] },
  { name: 'colorStyle',       label: 'Color palette?',              options: ['vibrant and bold','natural soft colors','high contrast','monochrome black & white'] },
  { name: 'realism',          label: 'Realism level?',              options: ['photo-realistic','marketing-style rendering','artistic stylized'] },
  { name: 'outputQuality',    label: 'Output quality?',             options: ['4K studio-grade','HD ecommerce-ready','square - Instagram style','vertical - story format'] },
];

export default function EnhanceCustomizer({ onChange, onComplete }) {
  const [stepIndex, setStepIndex]   = useState(0);
  const [form, setForm]             = useState({});
  const [customEdit, setCustomEdit] = useState(null);   // name of field being edited
  const [inputBuffer, setInputBuf]  = useState('');     // buffer text for custom

  const current = fields[stepIndex];
  const isLast  = stepIndex === fields.length - 1;
  const progress = useMemo(() => Math.round(((stepIndex + 1) / fields.length) * 100), [stepIndex]);

  useEffect(() => { onChange?.(form); }, [form, onChange]);

  // keyboard nav
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'Enter' && form[current?.name]) next();
      if (e.key.toLowerCase() === 'c') toggleCustom(); // quick custom
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [stepIndex, form, current]);

  const choose = (value) => {
    const updated = { ...form, [current.name]: value };
    setForm(updated);
    // advance softly
    setTimeout(() => {
      if (!isLast) setStepIndex((i) => i + 1);
      else onComplete?.(updated);
    }, 120);
  };

  const toggleCustom = () => {
    if (customEdit === current.name) {
      // close custom mode
      setCustomEdit(null);
      setInputBuf('');
    } else {
      setCustomEdit(current.name);
      setInputBuf(form[current.name] || '');
    }
  };

  const saveCustom = () => {
    const v = (inputBuffer || '').trim();
    if (v) choose(v);
    setCustomEdit(null);
  };

  const next = () => (isLast ? onComplete?.(form) : setStepIndex((i) => Math.min(i + 1, fields.length - 1)));
  const prev = () => setStepIndex((i) => Math.max(0, i - 1));

  return (
    <motion.div
      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-3xl shadow-2xl w-full max-w-4xl mx-auto overflow-hidden"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-fuchsia-500 to-indigo-500 text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-white">🎨 Enhance Product Image</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Step {stepIndex + 1} of {fields.length}</p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4 h-1.5 w-full rounded-full bg-zinc-200/70 dark:bg-zinc-800">
          <div className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500" style={{ width: `${progress}%` }} />
        </div>

        {/* Summary chips */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {fields.map((f, i) => (
            <span
              key={f.name}
              className={[
                'text-[11px] rounded-full px-2 py-1 border',
                i === stepIndex
                  ? 'border-purple-500 text-purple-600 bg-purple-50 dark:bg-zinc-800/60'
                  : form[f.name]
                  ? 'border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/40'
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-400'
              ].join(' ')}
              title={f.label}
            >
              {f.name}: <span className="font-medium">{form[f.name] || '—'}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="px-6 pb-6">
        <AnimatePresence mode="wait">
          {current && (
            <motion.div
              key={current.name}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 p-5"
            >
              {/* Label + Custom */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-zinc-800 dark:text-white">{current.label}</h3>
                {customEdit === current.name ? (
                  <button onClick={saveCustom} className="text-green-600 text-sm inline-flex items-center gap-1">
                    <Check className="w-4 h-4" /> Done
                  </button>
                ) : (
                  <button onClick={toggleCustom} className="text-purple-600 text-sm inline-flex items-center gap-1">
                    <Pencil className="w-4 h-4" /> Custom
                  </button>
                )}
              </div>

              {/* Custom input */}
              {customEdit === current.name && (
                <div className="space-y-2 mb-4">
                  <input
                    autoFocus
                    type="text"
                    placeholder={`Enter custom ${current.name}…`}
                    value={inputBuffer}
                    onChange={(e) => setInputBuf(e.target.value)}
                    className="w-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-xl px-4 py-3 border border-zinc-300 dark:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-zinc-500">اكتب اختيارك الخاص ثم اضغط Done.</p>
                </div>
              )}

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {current.options.map((opt) => {
                  const active = form[current.name] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => choose(opt)}
                      className={[
                        'rounded-xl px-4 py-3 min-h-[48px] text-sm font-medium border transition-all duration-200 text-center',
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
      <div className="flex items-center justify-between gap-2 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur">
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
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-5 py-2 text-sm font-semibold text-white shadow disabled:opacity-50"
          >
            {isLast ? <>Generate <Check className="w-4 h-4" /></> : <>Next <ChevronRight className="w-4 h-4" /></>}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
