'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Poppins } from 'next/font/google';
import Spinner from '@/components/Spinner';
import Toast from '@/components/Toast';
import { useSession } from '@supabase/auth-helpers-react';
import Button from '@/components/Button';
import Layout from '@/components/Layout';
import TryOnCustomizer from '@/components/TryOnCustomizer';
import generateDynamicPrompt from '@/lib/generateDynamicPrompt';
import { uploadImageToSupabase } from '@/lib/uploadImageToSupabase';

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '600', '700'], display: 'swap' });

export default function TryOnPage() {
  const session = useSession();

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [options, setOptions] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showCustomizer, setShowCustomizer] = useState(false);

  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const valid = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!valid.includes(f.type) || f.size > 5 * 1024 * 1024) {
      setToast({ show: true, message: 'Only JPG/PNG/WEBP under 5MB.', type: 'error' });
      return;
    }
    previewUrl && URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
    setFile(f);
    setResult(null);
    setShowCustomizer(true);
  };

  const handleCustomizerComplete = () => setShowCustomizer(false);

  const handleGenerate = async () => {
    if (!file) {
      return setToast({ show: true, message: 'Upload an image.', type: 'error' });
    }

    const finalPrompt = useCustom ? customPrompt : generateDynamicPrompt(options);

    if (!finalPrompt || finalPrompt.length < 10) {
      return setToast({ show: true, message: 'Prompt is missing or incomplete.', type: 'error' });
    }


    setLoading(true);

    try {
      const url = await uploadImageToSupabase(file);
 
      const res = await fetch('/api/tryon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: url, prompt: finalPrompt }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Generation failed');

      setResult(Array.isArray(data.output) ? data.output[0] : data.output);
      setToast({ show: true, message: 'Done!', type: 'success' });
    } catch (err) {
      setToast({ show: true, message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="AI Try-On Experience" description="Upload your clothing photo and try on different styles with AI.">
      <main className={`${poppins.className} min-h-screen bg-gradient-to-b from-white to-purple-50 dark:from-zinc-900 dark:to-purple-900 text-gray-900 dark:text-gray-100 py-20`}>
        <Toast show={toast.show} message={toast.message} type={toast.type} />

        {/* Upload Section */}
        <section className="max-w-md mx-auto mb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="text-3xl font-semibold mb-4 text-center">Upload Clothing Photo</h2>
            <div className="bg-white dark:bg-zinc-800 rounded-3xl p-8 shadow-xl">
              <label className="block mb-4">
                <div className="bg-gray-100 dark:bg-zinc-700 rounded-lg p-4 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-zinc-600 transition cursor-pointer">
                  <span>{file?.name || 'Click to choose an image'}</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </label>
              {previewUrl && (
                <motion.img
                  src={previewUrl}
                  alt="preview"
                  className="rounded-2xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
              )}
            </div>
          </motion.div>
        </section>

        {/* Modal Popup */}
        <AnimatePresence>
          {showCustomizer && (
            <motion.div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xl max-w-2xl w-full" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
                <TryOnCustomizer
                  onChange={(update) => setOptions((prev) => ({ ...prev, ...update }))}
                  onComplete={handleCustomizerComplete}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generate Button */}
        {!showCustomizer && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="text-center mt-20">
            <Button onClick={handleGenerate} disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition">
              {loading ? <Spinner /> : 'Generate Try-On'}
            </Button>
          </motion.section>
        )}

        {/* Result Section */}
        {result && (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mt-16">
            <h2 className="text-3xl font-semibold mb-4 text-center">Result</h2>
            <div className="flex justify-center mb-6"><div className="w-20 h-1 bg-purple-600 rounded" /></div>
            <AnimatePresence>
              {!loading && <motion.img src={result} alt="result" className="w-full max-w-md mx-auto rounded-2xl border border-purple-600 shadow-xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} />}
            </AnimatePresence>
          </motion.section>
        )}

        <style jsx global>{`
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </main>
    </Layout>
  );
}
