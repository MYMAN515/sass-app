// pages/enhance.js
'use client';

import React, { useEffect, useReducer, useRef, useState } from 'react';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import Spinner from '@/components/Spinner';
import Toast from '@/components/Toast';
import Button from '@/components/Button';
import EnhanceCustomizer from '@/components/EnhanceCustomizer';
import { uploadImageToSupabase } from '@/lib/uploadImageToSupabase';
import Layout from '@/components/Layout';
import { AnimatePresence, motion } from 'framer-motion';
import { Poppins } from 'next/font/google';

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '600', '700'], display: 'swap' });

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;

function bytesToMB(x) {
  return (x / (1024 * 1024)).toFixed(2);
}

function generateEnhancePrompt({
  photographyStyle = '',
  background = '',
  lighting = '',
  colorStyle = '',
  realism = '',
  outputQuality = '',
}) {
  return `Enhance this product photo using the ${photographyStyle} photography style.
Apply a ${background} background that complements the product without distracting from it.
Use ${lighting} to highlight material textures, contours, and product details clearly and naturally.
Match the scene with a ${colorStyle} color palette to reinforce brand tone and aesthetic harmony.
Ensure a ${realism} level that maintains photorealistic integrity and avoids any artificial or cartoonish effects.
The final image should be in ${outputQuality} resolution — clean, crisp, and flawless.`.trim();
}

/** ✅ Mobile-first before/after slider with larger handle & full-surface drag */
function CompareSlider({ before, after, altBefore = 'Before', altAfter = 'After' }) {
  const trackRef = useRef(null);
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);

  const clamp = (v) => Math.max(0, Math.min(100, v));

  const move = (clientX) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = clamp(((clientX - rect.left) / rect.width) * 100);
    setPos(x);
  };

  const onPointerDown = (e) => {
    e.preventDefault();
    setDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
    move(e.clientX);
  };

  const onPointerMove = (e) => {
    if (!dragging) return;
    move(e.clientX);
  };

  const onPointerUp = () => setDragging(false);

  return (
    <div className="w-full max-w-3xl mx-auto select-none" aria-label="Before after comparison">
      <div
        ref={trackRef}
        className="relative w-full mx-auto overflow-hidden rounded-2xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900
                   aspect-[4/3] sm:aspect-[16/10]"
      >
        {/* AFTER */}
        <img
          src={after}
          alt={altAfter}
          className="absolute inset-0 w-full h-full object-contain"
          loading="lazy"
        />

        {/* BEFORE mask */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ width: `${pos}%` }}
        >
          <img
            src={before}
            alt={altBefore}
            className="w-full h-full object-contain"
            loading="lazy"
          />
        </div>

        {/* in-frame labels for mobile */}
        <div className="absolute left-3 top-3 text-[10px] sm:text-xs px-2 py-1 rounded-full bg-black/55 text-white">
          {altBefore}
        </div>
        <div className="absolute right-3 top-3 text-[10px] sm:text-xs px-2 py-1 rounded-full bg-black/55 text-white">
          {altAfter}
        </div>

        {/* handle/center line */}
        <div
          role="slider"
          aria-label="Compare before and after"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          tabIndex={0}
          className="absolute top-0 bottom-0 cursor-ew-resize touch-none"
          style={{ left: `calc(${pos}% - 1px)` }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') setPos((p) => clamp(p - 5));
            if (e.key === 'ArrowRight') setPos((p) => clamp(p + 5));
          }}
        >
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] sm:w-0.5 bg-white/90 mix-blend-difference" />
          <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2
                          w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-black/65 backdrop-blur
                          flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="white">
              <path d="M8 12H4m16 0h-4" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M14 8l-4 4 4 4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* full-surface drag layer for easier touch control */}
        <div
          className="absolute inset-0"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
      </div>

      {/* bottom labels (optional, keep small & unobtrusive) */}
      <div className="flex justify-between text-[10px] sm:text-xs text-zinc-600 dark:text-zinc-400 mt-2 px-1">
        <span>{altBefore}</span>
        <span>{altAfter}</span>
      </div>
    </div>
  );
}

const initialState = {
  session: null,
  userEmail: '',
  userId: '',
  userPlan: 'Free',
  file: null,
  previewUrl: '',
  resultUrl: '',
  loading: false,
  showEnhanceModal: false,
  toast: { show: false, message: '', type: 'success' },
  options: {},
  progress: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SESSION':
      return { ...state, ...action.payload };
    case 'FILE':
      return { ...state, file: action.payload.file, previewUrl: action.payload.previewUrl, resultUrl: '' };
    case 'RESULT':
      return { ...state, resultUrl: action.payload.resultUrl };
    case 'LOADING':
      return { ...state, loading: action.payload };
    case 'TOAST':
      return { ...state, toast: action.payload };
    case 'SHOW_MODAL':
      return { ...state, showEnhanceModal: action.payload };
    case 'OPTIONS':
      return { ...state, options: { ...state.options, ...action.payload } };
    case 'PROGRESS':
      return { ...state, progress: action.payload };
    case 'RESET':
      return { ...initialState, session: state.session, userEmail: state.userEmail, userId: state.userId, userPlan: state.userPlan };
    default:
      return state;
  }
}

export default function EnhancePage() {
  const [supabase] = useState(() => createBrowserSupabaseClient());
  const [dragActive, setDragActive] = useState(false);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { userEmail, userId, userPlan, previewUrl, file, resultUrl, loading, showEnhanceModal, toast, options, progress } = state;

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      if (!session) {
        dispatch({ type: 'TOAST', payload: { show: true, message: 'Session expired. Please login again.', type: 'error' } });
        return;
      }
      const email = session.user.email;
      const uid = session.user.id;
      const { data: userData } = await supabase.from('Data').select('plan').eq('email', email).single();
      dispatch({ type: 'SESSION', payload: { session, userEmail: email, userId: uid, userPlan: userData?.plan || 'Free' } });
    })();
  }, [supabase]);

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  function validateFile(f) {
    if (!ACCEPTED_TYPES.includes(f.type)) {
      dispatch({ type: 'TOAST', payload: { show: true, message: 'Only JPG/PNG/WEBP allowed.', type: 'error' } });
      return false;
    }
    if (f.size > MAX_SIZE) {
      dispatch({ type: 'TOAST', payload: { show: true, message: `Max size ${bytesToMB(MAX_SIZE)}MB.`, type: 'error' } });
      return false;
    }
    return true;
  }

  function handleNewFile(f) {
    if (!validateFile(f)) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(f);
    dispatch({ type: 'FILE', payload: { file: f, previewUrl: url } });
    dispatch({ type: 'SHOW_MODAL', payload: true });
  }

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleNewFile(f);
  };

  async function handleGenerate(customOptions) {
    if (!file) {
      dispatch({ type: 'TOAST', payload: { show: true, message: 'Please upload an image.', type: 'error' } });
      return;
    }
    if (!userEmail || !userId) {
      dispatch({ type: 'TOAST', payload: { show: true, message: 'User not logged in. Please login again.', type: 'error' } });
      return;
    }
    dispatch({ type: 'LOADING', payload: true });
    dispatch({ type: 'PROGRESS', payload: 12 });

    const prompt = generateEnhancePrompt(customOptions || options);

    try {
      const imageUrl = await uploadImageToSupabase(file);
      dispatch({ type: 'PROGRESS', payload: 38 });

      const res = await fetch('/api/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, prompt, plan: userPlan, user_email: userEmail }),
      });

      dispatch({ type: 'PROGRESS', payload: 72 });

      const data = await res.json();
      if (!res.ok) {
        dispatch({ type: 'TOAST', payload: { show: true, message: `Server Error: ${data?.error || 'Unknown error'}`, type: 'error' } });
        dispatch({ type: 'LOADING', payload: false });
        return;
      }

      dispatch({ type: 'RESULT', payload: { resultUrl: data.image } });
      dispatch({ type: 'TOAST', payload: { show: true, message: 'Enhancement complete!', type: 'success' } });
      dispatch({ type: 'PROGRESS', payload: 100 });
    } catch (err) {
      dispatch({ type: 'TOAST', payload: { show: true, message: err.message, type: 'error' } });
    } finally {
      dispatch({ type: 'LOADING', payload: false });
      setTimeout(() => dispatch({ type: 'PROGRESS', payload: null }), 700);
    }
  }

  const downloadImage = async () => {
    try {
      const res = await fetch(resultUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `enhanced-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      dispatch({ type: 'TOAST', payload: { show: true, message: 'Failed to download image.', type: 'error' } });
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(resultUrl);
      dispatch({ type: 'TOAST', payload: { show: true, message: 'Link copied to clipboard.', type: 'success' } });
    } catch {
      dispatch({ type: 'TOAST', payload: { show: true, message: 'Failed to copy link.', type: 'error' } });
    }
  };

  return (
    <Layout title="Enhance Product Image" description="Enhance your product images with AI">
      <main className={`${poppins.className} min-h-screen pb-20`}>
        <Toast show={toast.show} message={toast.message} type={toast.type} />

        {/* Header */}
        <div className="px-4 sm:px-6 md:px-12 lg:px-24 mx-auto max-w-6xl pt-12">
          <div className="flex items-start md:items-center justify-between gap-6 flex-col md:flex-row">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Enhance Product Image</h1>
              <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 mt-2">
                Upload your product photo, choose style, and get a crisp, marketplace-ready image.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-xs bg-white dark:bg-zinc-900">
                <span className="size-2 rounded-full bg-emerald-500" />
                Plan: <strong className="font-semibold">{userPlan}</strong>
              </span>
              {userEmail && (
                <span className="hidden sm:inline-flex rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-xs">
                  {userEmail}
                </span>
              )}
            </div>
          </div>

          {/* Progress */}
          {progress !== null && (
            <div className="h-2 w-full mt-5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                className="h-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-pink-500"
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 md:px-12 lg:px-24 mx-auto max-w-6xl mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Uploader / Preview / Result */}
          <section className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-zinc-100 dark:border-zinc-800 p-6">
            {/* Dropzone */}
            {!previewUrl && !resultUrl && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative rounded-2xl border-2 border-dashed p-10 text-center transition
                ${dragActive ? 'border-fuchsia-500 bg-fuchsia-50/40 dark:bg-fuchsia-500/10' : 'border-zinc-300 dark:border-zinc-700'} `}
                onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                onDrop={onDrop}
              >
                <input
                  id="file-input"
                  type="file"
                  accept={ACCEPTED_TYPES.join(',')}
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleNewFile(f);
                  }}
                />
                <label htmlFor="file-input" className="cursor-pointer inline-flex flex-col items-center gap-3">
                  <div className="size-14 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M12 16V4m0 12-3-3m3 3 3-3" strokeWidth="1.5" />
                      <path d="M20 16.5V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2.5" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <div className="text-lg font-semibold">Click to upload</div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">or drag & drop your image here</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                    JPG, PNG, WEBP — up to {bytesToMB(MAX_SIZE)}MB
                  </div>
                </label>
              </motion.div>
            )}

            {/* Preview before generate (✅ mobile-safe aspect ratio + contain) */}
            {previewUrl && !resultUrl && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="relative mt-2 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                  <div className="w-full aspect-[4/3] sm:aspect-[16/10]">
                    <img src={previewUrl} alt="preview" className="w-full h-full object-contain" />
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button onClick={() => dispatch({ type: 'SHOW_MODAL', payload: true })} disabled={loading}>
                    Choose Style & Enhance
                  </Button>
                  <Button variant="secondary" onClick={() => handleGenerate()} disabled={loading}>
                    Quick Enhance
                  </Button>
                  <Button variant="ghost" onClick={() => dispatch({ type: 'RESET' })}>
                    Reset
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Result with toolbar + compare (✅ toolbar relocates on mobile) */}
            {resultUrl && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 space-y-4">
                <div className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                  <CompareSlider before={previewUrl} after={resultUrl} />
                  <div
                    className="absolute right-3 left-3 bottom-3 sm:top-3 sm:right-3 sm:left-auto sm:bottom-auto
                               flex flex-col sm:flex-row gap-2"
                  >
                    <Button size="sm" onClick={downloadImage}>Download</Button>
                    <Button size="sm" variant="secondary" onClick={copyLink}>Copy Link</Button>
                    <Button size="sm" variant="ghost" onClick={() => handleGenerate(options)} disabled={loading}>
                      Re-run
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => dispatch({ type: 'RESET' })} variant="ghost">New Image</Button>
                </div>
              </motion.div>
            )}

            {/* Loading overlay */}
            {loading && !resultUrl && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center min-h-[180px] mt-6"
              >
                <Spinner />
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-3">Enhancing… please wait</p>
              </motion.div>
            )}
          </section>

          {/* Right: Tips / Steps / Summary */}
          <aside className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-zinc-100 dark:border-zinc-800 p-6">
              <h3 className="text-lg font-semibold">How it works</h3>
              <ol className="mt-3 space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                <li>1. Upload your product image (Drag & Drop supported).</li>
                <li>2. Pick your style and settings (lighting, background, color harmony).</li>
                <li>3. Click Enhance — we’ll process and return a sharper version.</li>
                <li>4. Compare Before/After and Download.</li>
              </ol>
            </div>

            <div className="bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 dark:from-indigo-500/15 dark:to-fuchsia-500/15 rounded-3xl border border-indigo-200/40 dark:border-indigo-900/40 p-6">
              <h3 className="text-lg font-semibold">Pro tips</h3>
              <ul className="mt-3 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                <li>• Use neutral backgrounds for marketplace-ready shots.</li>
                <li>• Soft directional lighting reveals textures better.</li>
                <li>• Keep color palette consistent with your brand.</li>
              </ul>
            </div>
          </aside>
        </div>

        {/* Modal */}
        <AnimatePresence>
          {showEnhanceModal && (
            <motion.div
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white dark:bg-zinc-950 rounded-3xl p-6 shadow-2xl w-full sm:max-w-xl md:max-w-2xl border border-zinc-100 dark:border-zinc-800"
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Enhance Settings</h3>
                  <button
                    onClick={() => dispatch({ type: 'SHOW_MODAL', payload: false })}
                    className="rounded-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>
                <div className="mt-4">
                  <EnhanceCustomizer
                    onChange={(update) => dispatch({ type: 'OPTIONS', payload: update })}
                    onComplete={(finalOptions) => {
                      dispatch({ type: 'SHOW_MODAL', payload: false });
                      handleGenerate(finalOptions);
                    }}
                  />
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => dispatch({ type: 'SHOW_MODAL', payload: false })}>Cancel</Button>
                  <Button onClick={() => handleGenerate(options)} disabled={loading}>Enhance</Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </Layout>
  );
}
