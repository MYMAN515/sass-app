'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import TryOnCustomizer from '@/components/TryOnCustomizer';
import Spinner from '@/components/Spinner';
import Toast from '@/components/Toast';
import Button from '@/components/Button';

function generateDynamicPrompt({ product, height, skinTone, background, bodyType, style, angle }) {
  return `
Generate a high-resolution studio-quality image of a realistic ${skinTone} fashion model with a ${bodyType} body type and ${height} height, wearing the uploaded ${product}. The model should appear as if part of a professional fashion photoshoot for a ${style} e-commerce website (e.g., Zara, ASOS, Farfetch).

Model Pose: Model should be standing in a natural, relaxed position, arms slightly apart from the body to avoid covering the garment. The pose should be captured from the ${angle} angle. Full body or upper half should be visible depending on image crop.

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
  const [imageUrl, setImageUrl] = useState('');
  const [options, setOptions] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const handleGenerate = async () => {
    if (!imageUrl) {
      setToast({ show: true, message: 'Please enter a valid image URL.', type: 'error' });
      return;
    }

    const prompt = generateDynamicPrompt(options);
    setLoading(true);
    setToast({ show: false, message: '', type: 'success' });
    setResult(null);

    try {
      const res = await fetch('/api/tryon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, prompt }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');

      setResult(data.output);
      setToast({ show: true, message: 'AI generation complete!', type: 'success' });
    } catch (err) {
      setToast({ show: true, message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-5xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            🧠 AI Try-On Studio
          </h1>
          <p className="text-purple-200 max-w-2xl mx-auto">
            Upload a clothing image and visualize it on a hyper-realistic AI model with custom pose, look, and background.
          </p>
        </motion.div>

        {/* Upload & Customizer */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-2xl shadow-xl space-y-6">
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-1">Image URL</label>
              <input
                type="text"
                placeholder="https://example.com/shirt.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <TryOnCustomizer onChange={setOptions} />

            <div className="text-center">
              <Button onClick={handleGenerate} disabled={loading} variant="primary">
                {loading ? <Spinner /> : 'Generate Try-On'}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Result Image */}
        {result && (
          <motion.div
            className="mt-10 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-semibold mb-4 text-purple-200">✨ Your Generated Image</h2>
            <img
              src={result}
              alt="Generated AI result"
              className="rounded-2xl shadow-2xl border border-purple-500 max-w-full mx-auto"
            />
          </motion.div>
        )}
      </div>

      <Toast show={toast.show} message={toast.message} type={toast.type} />
    </main>
  );
}
