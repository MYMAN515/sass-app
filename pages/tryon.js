// ✅ Premium AI Try-On Page: modern layout, animation-rich, responsive, with smart prompt logic

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import TryOnCustomizer from '@/components/TryOnCustomizer';
import Spinner from '@/components/Spinner';
import Toast from '@/components/Toast';
import Button from '@/components/Button';
import { uploadImageToSupabase } from '@/lib/uploadImageToSupabase';
function generateDynamicPrompt({ product, height, skinTone, background, bodyType, style, angle }) {
  return `
Generate a high-resolution studio-quality image of a realistic ${skinTone} fashion model with a ${bodyType} body type and ${height} height, wearing the uploaded ${product}. The model should appear as if part of a professional fashion photoshoot for a ${style} e-commerce website (e.g., Zara, ASOS, Farfetch).

Model Pose: Model should be standing in a natural, relaxed position, arms slightly apart from the body to avoid covering the garment. The pose should be captured from a ${angle} angle. Full body or upper half should be visible depending on image crop.

Model Look: Fashion-forward, clean, with good posture. Modern hairstyle and neutral expression are essential.

Clothing Fit: Ensure the ${product} fits naturally and accurately on the model’s body. Include realistic shadows under arms, around edges, buttons, and any folds or design elements.

Lighting: Soft, evenly distributed studio lighting that highlights garment details, stitching, and fabric texture. Shadows should appear under the neck, around arms, and waistline.

Background: Use a ${background} background. It should be plain and softly blurred to mimic a premium studio shoot with no distractions.

Camera Framing: High-resolution, front-facing or as per selected angle, with clean composition suitable for display in professional catalogs or global e-commerce platforms.

Fabric Detail: Preserve all details of the original item such as patterns, logos, prints, tags, creases, and stitching. Avoid any blurring, melting, or distortion of the fabric.

Photographic Quality: The final output must look like it was shot by a professional fashion photographer for use in a luxury clothing brand’s online store.

Output: High-resolution, clean edges, no watermark, no text overlays.
`.trim();
}
export default function TryOnPage() {
  const [file, setFile] = useState(null);
  const [uploadedImage, setUploadedImage] = useState('');
  const [options, setOptions] = useState({});
  const [customPrompt, setCustomPrompt] = useState('');
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setToast({ show: true, message: 'Unsupported file type.', type: 'error' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setToast({ show: true, message: 'Max file size is 5MB.', type: 'error' });
      return;
    }
    setFile(file);
    setUploadedImage(URL.createObjectURL(file));
    setResult(null);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = result;
    link.download = 'ai-tryon.jpg';
    link.click();
  };

  const handleGenerate = async () => {
    if (!file) {
      setToast({ show: true, message: 'Upload an image first.', type: 'error' });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const imageUrl = await uploadImageToSupabase(file);
      const prompt = useCustomPrompt ? customPrompt : generateDynamicPrompt(options);

      const res = await fetch('/api/tryon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, prompt }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');

      setResult(data.output);
      setToast({ show: true, message: 'Try-On complete!', type: 'success' });
    } catch (err) {
      setToast({ show: true, message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white px-4 py-20 flex flex-col items-center justify-center font-sans">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-6xl space-y-12"
      >
        <div className="text-center space-y-3">
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight"
          >
            🧠 Try-On Anything with AI
          </motion.h1>
          <p className="text-purple-200 max-w-2xl mx-auto text-lg">
            Upload a clothing image and visualize it on a model with studio-level quality. Customize or write your own prompt.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-zinc-900 border border-zinc-700 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6"
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">🖼️ Select your product image</label>
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleFileChange}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-sm text-white cursor-pointer"
              />
              {uploadedImage && (
                <img src={uploadedImage} alt="preview" className="mt-4 rounded-xl border border-purple-500 shadow max-h-[300px] mx-auto" />
              )}
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm text-white">
                <input
                  type="checkbox"
                  checked={useCustomPrompt}
                  onChange={() => setUseCustomPrompt(!useCustomPrompt)}
                />
                ✏️ Write custom AI prompt
              </label>
              {useCustomPrompt ? (
                <textarea
                  className="w-full bg-zinc-800 border border-zinc-600 rounded-md p-3 text-sm"
                  rows={6}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g., Generate a realistic model wearing a red t-shirt on clean background from side angle."
                />
              ) : (
                <TryOnCustomizer onChange={setOptions} />
              )}
            </div>
          </div>

          <div className="text-center">
            <Button onClick={handleGenerate} disabled={loading} variant="primary">
              {loading ? <Spinner /> : '🚀 Generate Try-On Image'}
            </Button>
          </div>
        </motion.div>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center space-y-4"
          >
            <h2 className="text-xl text-purple-300 font-semibold">✅ AI Result</h2>
            <img
              src={result}
              alt="Generated"
              className="rounded-2xl shadow-2xl border border-purple-600 max-w-[90vw] max-h-[80vh] mx-auto"
            />
            <Button onClick={handleDownload} variant="secondary">⬇️ Download Result</Button>
          </motion.div>
        )}
      </motion.div>

      <Toast show={toast.show} message={toast.message} type={toast.type} />
    </main>
  );
}