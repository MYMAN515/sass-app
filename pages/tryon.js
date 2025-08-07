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
import { uploadImageToSupabase } from '@/lib/uploadImageToSupabase';

function generateDynamicPrompt({
  gender = 'Female',
  Age = 'Adult',
  product = 'Shirt',
  height = 'Average',
  skinTone = 'Medium',
  background = 'Beige Studio',
  bodyType = 'Athletic',
  style = 'Catalog',
  angle = 'Front',
}) {
  return `
Generate a high-resolution studio-quality image of a realistic ${skinTone.toLowerCase()} ${Age.toLowerCase()} ${gender.toLowerCase()} fashion model with a ${bodyType.toLowerCase()} body type and ${height.toLowerCase()} height, wearing the uploaded ${product.toLowerCase()}. The model should appear as if part of a professional ${style.toLowerCase()} fashion photoshoot for a top-tier e-commerce platform (e.g., Zara, ASOS, Farfetch).

Model Pose: Model should be standing in a natural, relaxed position, arms slightly apart from the body to avoid covering the garment. The pose should be captured from a ${angle.toLowerCase()} angle. Full body or upper half should be visible depending on image crop.

Model Look: Fashion-forward, clean, with good posture. Age-appropriate hairstyle and a neutral expression are essential.

Clothing Fit: The ${product} must fit naturally and accurately on the model’s body. Include realistic shadows under arms, around fabric edges, seams, buttons, and design folds.

Lighting: Use soft, evenly distributed studio lighting that enhances garment details, stitching, and fabric texture. Subtle shadows should appear under the neck, around arms, and the waistline.

Background: Use a ${background} background with soft blur to simulate a professional studio shoot. Avoid clutter, text, or visual distractions.

Camera Framing: High-resolution framing from the ${angle} angle with clean, centered composition suitable for catalog and online store presentation.

Fabric Detail: Ensure full preservation of garment features including patterns, logos, prints, tags, textures, creases, and stitching lines. Avoid any distortion, melting, or blurring of the fabric.

Photographic Quality: The final output must look like a professionally shot image for a premium clothing brand’s digital catalog or storefront.

Output Requirements: High-resolution, crisp edges, no watermark, no logos, no text overlays.`.trim();
}

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '600', '700'], display: 'swap' });

export default function TryOnPage() {
  const session = useSession();

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [options, setOptions] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showCustomizer, setShowCustomizer] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setUserEmail(session.user.email);
      setUserId(session.user.id);
    }
  }, [session]);

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
        body: JSON.stringify({
          imageUrl: url,
          prompt: finalPrompt,
          user_email: userEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Generation failed');

      setResult(Array.isArray(data.image) ? data.image[0] : data.image);
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

        <section className="max-w-md mx-auto mb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="text-3xl font-semibold mb-4 text-center">Upload Clothing Photo</h2>
            <div className="bg-white dark:bg-zinc-800 rounded-3xl p-8 shadow-xl">
              <div className="mb-4 relative">
                <label htmlFor="image-upload" className="block">
                  <div className="bg-gray-100 dark:bg-zinc-700 rounded-lg p-4 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-zinc-600 transition cursor-pointer">
                    <span>{file?.name || 'Click to choose an image'}</span>
                  </div>
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {previewUrl && (
                <motion.img
                  src={previewUrl}
                  alt="preview"
                  className="rounded-2xl mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
              )}
            </div>
          </motion.div>
        </section>

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

        {!showCustomizer && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="text-center mt-20">
            <Button onClick={handleGenerate} disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition">
              {loading ? <Spinner /> : 'Generate Try-On'}
            </Button>
          </motion.section>
        )}

        {result && (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mt-16">
            <h2 className="text-3xl font-semibold mb-4 text-center">Result</h2>
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

        <style jsx global>{`
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </main>
    </Layout>
  );
}
