'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Poppins } from 'next/font/google';
import Spinner from '@/components/Spinner';
import Toast from '@/components/Toast';
import Button from '@/components/Button';
import EnhanceCustomizer from '@/components/EnhanceCustomizer';
import { uploadImageToSupabase } from '@/lib/uploadImageToSupabase';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Layout from '@/components/Layout';

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '600', '700'], display: 'swap' });

const presetOptions = [
  { id: 'rustic', title: 'Rustic Food', img: '/presets/rustic-food.png' },
  { id: 'luxury', title: 'Luxury Perfume', img: '/presets/luxury-perfume.png' },
  { id: 'minimalist', title: 'Minimalist', img: '/presets/minimalist.png' },
  { id: 'tech', title: 'Tech Product', img: '/presets/tech-product.png' },
  { id: 'organic', title: 'Organic Cosmetic', img: '/presets/organic-cosmetic.png' },
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
    <h3 className="text-sm text-center font-medium text-gray-800 dark:text-gray-200">{preset.title}</h3>
  </motion.div>
));

const generateEnhancePrompt = ({
  photographyStyle = '',
  background = '',
  lighting = '',
  colorStyle = '',
  realism = '',
  outputQuality = '',
}) => {
  return `Enhance this product photo using the ${photographyStyle} photography style.
Apply a ${background} background that complements the product without distracting from it.
Use ${lighting} to highlight material textures, contours, and product details clearly and naturally.
Match the scene with a ${colorStyle} color palette to reinforce brand tone and aesthetic harmony.
Ensure a ${realism} level that maintains photorealistic integrity and avoids any artificial or cartoonish effects.
The final image should be in ${outputQuality} resolution — clean, crisp, and flawless.`.trim();
};

export default function EnhancePage() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [options, setOptions] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showEnhanceModal, setShowEnhanceModal] = useState(false);
  const carouselRef = useRef(null);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const valid = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
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
    setShowEnhanceModal(true);
  };

  const handleGenerate = async (customOptions) => {
    if (!file) {
      setToast({ show: true, message: 'Please upload an image.', type: 'error' });
      return;
    }

    setLoading(true);
    setToast({ show: false, message: '', type: 'success' });

    const prompt = generateEnhancePrompt(customOptions || options);

    try {
      const url = await uploadImageToSupabase(file);
      const res = await fetch('/api/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: url, prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Enhancement failed');
      setResult(data.output);
      setToast({ show: true, message: 'Enhancement complete!', type: 'success' });
    } catch (err) {
      setToast({ show: true, message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const scroll = (dir) => {
    if (!carouselRef.current) return;
    const offset = 240;
    carouselRef.current.scrollBy({ left: dir === 'left' ? -offset : offset, behavior: 'smooth' });
  };

  return (
    <Layout title="Enhance Product Image" description="Enhance your product images with AI">
      <main className={`${poppins.className} min-h-screen bg-gradient-to-b from-white to-purple-50 dark:from-zinc-900 dark:to-purple-900 text-gray-900 dark:text-gray-100 py-20`}>
        <Toast show={toast.show} message={toast.message} type={toast.type} />
        <div className="px-4 sm:px-6 md:px-12 lg:px-24 mx-auto space-y-32 max-w-7xl">
          
          {/* Upload Section */}
          <section className="max-w-xl mx-auto mb-20">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-4 text-center">Upload Product Photo</h2>
              <div className="bg-white dark:bg-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                <label className="block mb-4 relative">
                  <div className="bg-gray-100 dark:bg-zinc-700 rounded-lg p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-zinc-600 transition cursor-pointer text-center sm:text-left">
                    <span>{file?.name || 'Click to choose an image'}</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </label>
                {previewUrl && (
                  <motion.img
                    src={previewUrl}
                    alt="preview"
                    className="rounded-2xl mt-4 sm:mt-6 max-w-full h-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  />
                )}
              </div>
            </motion.div>
          </section>

          {/* Modal */}
          <AnimatePresence>
            {showEnhanceModal && (
              <motion.div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <motion.div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xl w-full sm:max-w-xl md:max-w-2xl" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
                  <EnhanceCustomizer
                    onChange={(update) => setOptions((prev) => ({ ...prev, ...update }))}
                    onComplete={(finalOptions) => {
                      setShowEnhanceModal(false);
                      handleGenerate(finalOptions);
                    }}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result */}
          {result && (
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-4 text-center">Enhanced Result</h2>
              <div className="flex justify-center mb-6"><div className="w-20 h-1 bg-purple-600 rounded" /></div>
              <AnimatePresence>
                {!loading && (
                  <motion.img
                    src={result}
                    alt="result"
                    className="w-full max-w-md mx-auto rounded-2xl border border-purple-600 shadow-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </AnimatePresence>
            </motion.section>
          )}

          {/* Spinner */}
          {loading && !result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-center min-h-[300px] px-4"
            >
              <Spinner />
            </motion.div>
          )}
        </div>
      </main>
    </Layout>
  );
}
