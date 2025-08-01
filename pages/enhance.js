'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import EnhanceCustomizer from '@/components/EnhanceCustomizer';
import Spinner from '@/components/Spinner';
import Toast from '@/components/Toast';
import Button from '@/components/Button';
function generateEnhancePrompt({ productType, photographyStyle, background, lighting, purpose }) {
  return `
Enhance the uploaded ${productType} photo using a ${photographyStyle} setup.
Use a ${background} background with ${lighting} lighting conditions.
Final output should look ${purpose}-ready with clarity, realism, and modern styling.
`.trim();
}
import { uploadImageToSupabase } from '@/lib/uploadImageToSupabase';

export default function EnhancePage() {
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [options, setOptions] = useState({});
  const [customPrompt, setCustomPrompt] = useState('');
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setToast({ show: true, message: 'Only JPG, PNG, JPEG, WEBP formats are allowed.', type: 'error' });
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setToast({ show: true, message: 'File is too large. Max size is 5MB.', type: 'error' });
      return;
    }

    setFile(selectedFile);
    setImagePreview(URL.createObjectURL(selectedFile));
  };

  const handleGenerate = async () => {
    if (!file) {
      setToast({ show: true, message: 'Please upload an image file.', type: 'error' });
      return;
    }

    const prompt = useCustomPrompt ? customPrompt : generateEnhancePrompt(options);
    setLoading(true);
    setToast({ show: false, message: '', type: 'success' });
    setResult(null);

    try {
      const uploadedUrl = await uploadImageToSupabase(file);

      const res = await fetch('/api/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: uploadedUrl, prompt }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');

      setResult(data.output);
      setToast({ show: true, message: 'AI enhancement complete!', type: 'success' });
    } catch (err) {
      setToast({ show: true, message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white flex items-center justify-center px-6 py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-700/10 via-fuchsia-600/10 to-indigo-800/10 animate-pulse-fast blur-3xl z-0" />

      <div className="relative z-10 w-full max-w-5xl backdrop-blur-sm bg-white/5 border border-white/10 rounded-3xl p-10 shadow-2xl space-y-10">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            ✨ AI Enhance Studio
          </h1>
          <p className="text-purple-200 max-w-2xl mx-auto">
            Upload your product image and generate a professional, AI-enhanced version styled for e-commerce.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-2xl shadow-xl space-y-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-purple-300">Upload Product Image</label>
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleFileChange}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
              />
              <p className="text-xs text-purple-400 mt-1">
                Accepted formats: JPG, PNG, JPEG, WEBP. Max size: 5MB.
              </p>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="mt-4 rounded-xl border border-purple-500 shadow max-h-64 mx-auto"
                />
              )}
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={useCustomPrompt} onChange={() => setUseCustomPrompt(!useCustomPrompt)} />
                Write custom prompt
              </label>

              {useCustomPrompt ? (
                <textarea
                  className="w-full bg-zinc-800 border border-zinc-600 rounded-md p-3 text-sm"
                  rows={6}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g., Enhance the image with a clean white background and soft shadows for Amazon listing."
                />
              ) : (
                <EnhanceCustomizer onChange={setOptions} />
              )}
            </div>

            <div className="text-center">
              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-xl shadow-xl transition-transform hover:scale-105 active:scale-95"
              >
                {loading ? <Spinner /> : 'Enhance Image'}
              </Button>
            </div>
          </div>
        </motion.div>

        {result && (
          <motion.div
            className="mt-10 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-semibold mb-4 text-purple-200">✅ Enhanced Result</h2>
            <img
              src={result}
              alt="Enhanced AI result"
              className="rounded-2xl shadow-2xl border border-purple-500 max-w-[90vw] max-h-[80vh] mx-auto"
            />
          </motion.div>
        )}
      </div>

      <Toast show={toast.show} message={toast.message} type={toast.type} />
    </main>
  );
}