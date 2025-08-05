'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import Spinner from '@/components/Spinner';
import Toast from '@/components/Toast';
import Button from '@/components/Button';
import EnhanceCustomizer from '@/components/EnhanceCustomizer';
import { uploadImageToSupabase } from '@/lib/uploadImageToSupabase';
import Layout from '@/components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { Poppins } from 'next/font/google';

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '600', '700'], display: 'swap' });

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
  const [supabase] = useState(() => createBrowserSupabaseClient());
  const [session, setSession] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [userPlan, setUserPlan] = useState('Free');

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showEnhanceModal, setShowEnhanceModal] = useState(false);
  const [options, setOptions] = useState({});
  const carouselRef = useRef(null);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;

      if (!session) {
        setToast({ show: true, message: 'Session expired. Please login again.', type: 'error' });
        return;
      }

      setSession(session);
      setUserEmail(session.user.email);
      setUserId(session.user.id);

      const { data: userData } = await supabase
        .from('Data')
        .select('plan')
        .eq('email', session.user.email)
        .single();

      if (userData?.plan) {
        setUserPlan(userData.plan);
      }
    };

    getSession();
  }, [supabase]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(f.type)) {
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
    setResult(null);
    setShowEnhanceModal(true);
  };

  const handleGenerate = async (customOptions) => {
    if (!file) {
      setToast({ show: true, message: 'Please upload an image.', type: 'error' });
      return;
    }

    if (!userEmail || !userId) {
      setToast({ show: true, message: 'User not logged in. Please login again.', type: 'error' });
      return;
    }

    setLoading(true);
    setToast({ show: false, message: '', type: 'success' });

    const prompt = generateEnhancePrompt(customOptions || options);

    try {
      const imageUrl = await uploadImageToSupabase(file);
      const res = await fetch('/api/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          prompt,
          plan: userPlan,
          user_email: userEmail,
        }),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        setToast({ show: true, message: `Server Error (non-JSON): ${text.slice(0, 150)}`, type: 'error' });
        setLoading(false);
        return;
      }

      if (!res.ok) {
        let errorMessage = `Server Error: ${data?.error || 'Unknown error'}`;
        if (data?.detail) {
          errorMessage += `\nDetails: ${data.detail}`;
        }
        setToast({ show: true, message: errorMessage, type: 'error' });
        setLoading(false);
        return;
      }

      setResult(data.image);
      setToast({ show: true, message: 'Enhancement complete!', type: 'success' });

      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 500);

    } catch (err) {
      setToast({ show: true, message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result;
    link.download = `enhanced-image-${Date.now()}.webp`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout title="Enhance Product Image" description="Enhance your product images with AI">
      <main className={`${poppins.className} min-h-screen py-20`}>
        <Toast show={toast.show} message={toast.message} type={toast.type} />
        <div className="px-4 sm:px-6 md:px-12 lg:px-24 mx-auto space-y-32 max-w-4xl">

          {/* Upload Section */}
          <section>
            <h2 className="text-3xl font-semibold text-center mb-6">Upload Product Photo</h2>
            <div className="bg-white dark:bg-zinc-800 p-6 rounded-3xl shadow-xl">
              <label className="block mb-4 relative">
                <div className="bg-gray-100 dark:bg-zinc-700 rounded-lg p-4 text-center hover:bg-gray-200 dark:hover:bg-zinc-600 transition cursor-pointer">
                  <span>{file?.name || 'Click to choose an image'}</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </label>
              {previewUrl && <img src={previewUrl} alt="preview" className="rounded-2xl mt-4 max-w-full" />}
            </div>
          </section>

          {/* Customize Modal */}
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

          {/* Result Section */}
          {result && !loading && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h2 className="text-2xl font-semibold mb-4">Enhanced Result</h2>
              <div className="relative inline-block">
                <motion.img
                  src={result}
                  alt="Enhanced Result"
                  className="w-full max-w-md rounded-3xl border-2 border-purple-600 shadow-xl transition-transform duration-300 hover:scale-105"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                />
              </div>
              <button
                onClick={downloadImage}
                className="mt-6 inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                </svg>
                Download Image
              </button>
            </motion.section>
          )}

          {/* Spinner while loading */}
          {loading && (
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
