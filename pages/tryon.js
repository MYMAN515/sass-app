// ✅ TryOnPage.js — Fully updated version for AI Try-On Experience

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Poppins } from 'next/font/google';
import Spinner from '@/components/Spinner';
import Toast from '@/components/Toast';
import Button from '@/components/Button';
import TryOnCustomizer from '@/components/TryOnCustomizer';
import generateDynamicPrompt from '@/lib/generateDynamicPrompt';
import { uploadImageToSupabase } from '@/lib/uploadImageToSupabase';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const poppins = Poppins({ subsets: ['latin'], weight: ['400','600','700'], display: 'swap' });

const presetOptions = [
  {
    id: 'casual',
    title: 'Casual Outfit',
    img: '/presets/casual.png',
    options: {
      gender: 'Female',
      product: 'T-Shirt and Jeans',
      height: 'Average',
      skinTone: 'Medium',
      background: 'Urban Street',
      bodyType: 'Slim',
      style: 'Streetwear',
      angle: 'Front',
    },
  },
  {
    id: 'luxury',
    title: 'Luxury Dress',
    img: '/presets/luxury-dress.png',
    options: {
      gender: 'Female',
      product: 'Evening Dress',
      height: 'Tall',
      skinTone: 'Light',
      background: 'Plain White',
      bodyType: 'Curvy',
      style: 'Luxury',
      angle: '3/4 Angle',
    },
  },
  {
    id: 'sporty',
    title: 'Sporty Look',
    img: '/presets/sporty.png',
    options: {
      gender: 'Female',
      product: 'Sportswear Set',
      height: 'Short',
      skinTone: 'Dark',
      background: 'Urban Street',
      bodyType: 'Athletic',
      style: 'Catalog',
      angle: 'Side',
    },
  },
];

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const PresetCard = React.memo(({ preset, selected, onClick }) => (
  <motion.div
    variants={itemVariants}
    onClick={onClick}
    className={`cursor-pointer p-4 rounded-3xl shadow-lg transition-all border ${
      selected ? 'border-purple-600 scale-105' : 'border-gray-200 dark:border-zinc-700'
    } bg-white dark:bg-zinc-800`}
  >
    <img src={preset.img} alt={preset.title} className="w-full h-24 object-cover mb-2 rounded-lg" />
    <h3 className="text-sm text-center font-medium text-gray-800 dark:text-gray-200">
      {preset.title}
    </h3>
  </motion.div>
));

export default function TryOnPage() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [useCustom, setUseCustom] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [options, setOptions] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const carouselRef = useRef(null);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const valid = ['image/jpeg','image/png','image/jpg','image/webp'];
    if (!valid.includes(f.type)) {
      setToast({ show: true, message: 'Only JPG/PNG/WEBP allowed.', type: 'error' });
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setToast({ show: true, message: 'Max size 5MB.', type: 'error' });
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
    setFile(f);
    setSelectedPreset(null);
    setResult(null);
  };

  const selectPreset = (preset) => {
    setSelectedPreset(preset.id);
    setUseCustom(false);
    setCustomPrompt('');
    setOptions(preset.options);
  };

  const toggleCustom = () => {
    setUseCustom(prev => {
      const next = !prev;
      if (next) setSelectedPreset(null);
      return next;
    });
  };

  const scroll = (dir) => {
    if (!carouselRef.current) return;
    const offset = 240;
    carouselRef.current.scrollBy({ left: dir === 'left' ? -offset : offset, behavior: 'smooth' });
  };

  const handleGenerate = async () => {
    if (!file) {
      setToast({ show: true, message: 'Please upload an image.', type: 'error' });
      return;
    }
    setLoading(true);
    setToast({ show: false, message: '', type: 'success' });
    const prompt = useCustom ? customPrompt : generateDynamicPrompt(options);

    try {
      const url = await uploadImageToSupabase(file);
      const res = await fetch('/api/tryon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: url, prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setResult(data.output);
      setToast({ show: true, message: 'Try-On image ready!', type: 'success' });
    } catch (err) {
      setToast({ show: true, message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (carouselRef.current) carouselRef.current.scrollTo({ left: 0 });
  }, []);

  return (
    <main className={`${poppins.className} min-h-screen bg-gradient-to-b from-white to-purple-50 dark:from-zinc-900 dark:to-purple-900 text-gray-900 dark:text-gray-100 py-20`}>
      <Toast show={toast.show} message={toast.message} type={toast.type} />
      <div className="px-6 md:px-24 mx-auto space-y-32">

        {/* Upload Section */}
        <motion.section initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>
          <h2 className="text-3xl font-semibold mb-4 text-center">Upload Clothing Photo</h2>
          <div className="flex justify-center mb-6"><div className="w-20 h-1 bg-purple-600 rounded" /></div>
          <div className="max-w-md mx-auto bg-white dark:bg-zinc-800 rounded-3xl p-8 shadow-xl">
            <label className="block mb-4">
              <div className="w-full bg-gray-100 dark:bg-zinc-700 rounded-lg p-4 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-zinc-600 transition cursor-pointer">
                <span className="text-gray-600 dark:text-gray-300">{file?.name || 'Click to choose an image'}</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>
            </label>
            {previewUrl && <motion.img src={previewUrl} alt="preview" className="w-full rounded-2xl" initial={{ opacity:0 }} animate={{ opacity:1 }} />}
          </div>
        </motion.section>

        {/* Presets Carousel */}
        <motion.section initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>
          <h2 className="text-3xl font-semibold mb-4 text-center">Choose a Try-On Style</h2>
          <div className="flex justify-center mb-6"><div className="w-20 h-1 bg-purple-600 rounded" /></div>
          <div className="relative max-w-4xl mx-auto">
            <button onClick={() => scroll('left')} className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/50 dark:bg-zinc-800 p-2 rounded-full shadow-lg z-10 hover:bg-white dark:hover:bg-zinc-700 transition">
              <ChevronLeft size={24} />
            </button>
            <motion.div ref={carouselRef} className="flex space-x-6 overflow-x-auto scrollbar-hide py-4" variants={containerVariants} initial="hidden" animate="show">
              {presetOptions.map(p => (
                <PresetCard key={p.id} preset={p} selected={selectedPreset === p.id} onClick={() => selectPreset(p)} />
              ))}
            </motion.div>
            <button onClick={() => scroll('right')} className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/50 dark:bg-zinc-800 p-2 rounded-full shadow-lg z-10 hover:bg-white dark:hover:bg-zinc-700 transition">
              <ChevronRight size={24} />
            </button>
          </div>
        </motion.section>

        {/* Customize Prompt */}
        <motion.section initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>
          <h2 className="text-3xl font-semibold mb-4 text-center">Customize Try-On Prompt</h2>
          <div className="flex justify-center mb-6"><div className="w-20 h-1 bg-purple-600 rounded" /></div>
          <div className="max-w-md mx-auto bg-white dark:bg-zinc-800 rounded-3xl p-8 shadow-xl space-y-4">
            <label className="flex items-center space-x-2">
              <input type="checkbox" checked={useCustom} onChange={toggleCustom} className="accent-purple-600" />
              <span className="font-medium">Use custom prompt</span>
            </label>
            {useCustom
              ? <textarea value={customPrompt} onChange={e => setCustomPrompt(e.target.value)} rows={4} className="w-full bg-gray-100 dark:bg-zinc-700 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 transition" placeholder="Type your prompt..." />
              : <TryOnCustomizer onChange={setOptions} />
            }
          </div>
        </motion.section>

        {/* Generate Button */}
        <motion.section initial={{ opacity:0 }} whileInView={{ opacity:1 }} transition={{ duration:0.5 }} className="text-center">
          <Button onClick={handleGenerate} disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition">
            {loading ? <Spinner /> : 'Generate Try-On'}
          </Button>
        </motion.section>

        {/* Result Display */}
        {result && (
          <motion.section initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>
            <h2 className="text-3xl font-semibold mb-4 text-center">Result</h2>
            <div className="flex justify-center mb-6"><div className="w-20 h-1 bg-purple-600 rounded" /></div>
            <AnimatePresence>
              {!loading && <motion.img src={result} alt="result" className="w-full max-w-md mx-auto rounded-2xl border border-purple-600 shadow-xl" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} />}
            </AnimatePresence>
          </motion.section>
        )}
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </main>
  );
}