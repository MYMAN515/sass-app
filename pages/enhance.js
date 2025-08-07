// pages/enhance.js
'use client';

import React, { useEffect, useMemo, useReducer, useRef } from 'react';
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
  return `Enhance this product photo using the ${photographyStyle} photography style.\nApply a ${background} background that complements the product without distracting from it.\nUse ${lighting} to highlight material textures, contours, and product details clearly and naturally.\nMatch the scene with a ${colorStyle} color palette to reinforce brand tone and aesthetic harmony.\nEnsure a ${realism} level that maintains photorealistic integrity and avoids any artificial or cartoonish effects.\nThe final image should be in ${outputQuality} resolution — clean, crisp, and flawless.`.trim();
}

function CompareSlider({ before, after, altBefore = 'Before', altAfter = 'After' }) {
  const trackRef = useRef(null);
  const [pos, setPos] = React.useState(50);

  function clamp(v) { return Math.max(0, Math.min(100, v)); }
  function onPointerDown(e) {
    if (!trackRef.current) return;
    e.target.setPointerCapture(e.pointerId);
    move(e);
  }
  function onPointerMove(e) {
    if (!(e.buttons & 1)) return;
    move(e);
  }
  function move(e) {
    const rect = trackRef.current.getBoundingClientRect();
    const x = clamp(((e.clientX - rect.left) / rect.width) * 100);
    setPos(x);
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto select-none" aria-label="Before after comparison">
      <div ref={trackRef} className="relative w-full overflow-hidden rounded-2xl border">
        <img src={after} alt={altAfter} className="block w-full" loading="lazy" />
        <div className="absolute inset-0" style={{ width: `${pos}%` }}>
          <img src={before} alt={altBefore} className="block w-full h-full object-cover" loading="lazy" />
        </div>
        <div
          role="slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          tabIndex={0}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') setPos((p) => clamp(p - 5));
            if (e.key === 'ArrowRight') setPos((p) => clamp(p + 5));
          }}
          className="absolute top-0" style={{ left: `calc(${pos}% - 1px)`, height: '100%' }}
        >
          <div className="h-full w-0.5 bg-white/80 mix-blend-difference" />
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
            Drag
          </div>
        </div>
      </div>
      <div className="flex justify-between text-sm text-gray-600 mt-2">
        <span>Before</span>
        <span>After</span>
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
  const [supabase] = React.useState(() => createBrowserSupabaseClient());
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
    dispatch({ type: 'PROGRESS', payload: 10 });
    const prompt = generateEnhancePrompt(customOptions || options);
    try {
      const imageUrl = await uploadImageToSupabase(file);
      dispatch({ type: 'PROGRESS', payload: 40 });
      const res = await fetch('/api/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, prompt, plan: userPlan, user_email: userEmail }),
      });
      dispatch({ type: 'PROGRESS', payload: 70 });
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
      setTimeout(() => dispatch({ type: 'PROGRESS', payload: null }), 600);
    }
  }

  return (
    <Layout title="Enhance Product Image" description="Enhance your product images with AI">
      <main className={`${poppins.className} min-h-screen py-16`}>
        <Toast show={toast.show} message={toast.message} type={toast.type} />
        <div className="px-4 sm:px-6 md:px-12 lg:px-24 mx-auto max-w-5xl mb-10">
          <h1 className="text-3xl md:text-4xl font-bold">Enhance Product Image</h1>
          {progress !== null && (
            <div className="h-1 w-full bg-gray-200 dark:bg-zinc-800 rounded mt-4 overflow-hidden">
              <div className="h-full w-0 bg-purple-600 transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
        <div className="px-4 sm:px-6 md:px-12 lg:px-24 mx-auto space-y-16 max-w-5xl">
          <section>
            <div className="bg-white dark:bg-zinc-800 p-6 rounded-3xl shadow-xl">
              <label className="block cursor-pointer">
                <input type="file" accept={ACCEPTED_TYPES.join(',')} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleNewFile(f); }} className="sr-only" />
                <div className="border-2 border-dashed p-8 text-center rounded-2xl">Click to choose or drag & drop</div>
              </label>
              {previewUrl && (
                <div className="mt-6">
                  <img src={previewUrl} alt="preview" className="rounded-2xl w-full shadow" />
                  <div className="mt-3 flex gap-3">
                    <Button onClick={() => handleGenerate()} disabled={loading}>Enhance</Button>
                    <Button variant="ghost" onClick={() => dispatch({ type: 'RESET' })}>Reset</Button>
                  </div>
                </div>
              )}
              {resultUrl && (
                <div className="mt-6">
                  <CompareSlider before={previewUrl} after={resultUrl} />
                </div>
              )}
            </div>
          </section>
        </div>
        {loading && !resultUrl && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="flex flex-col items-center justify-center min-h-[220px]">
            <Spinner />
            <p className="text-sm text-gray-600 mt-3">Enhancing… please wait</p>
          </motion.div>
        )}
        <AnimatePresence>
          {showEnhanceModal && (
            <motion.div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xl w-full sm:max-w-xl md:max-w-2xl" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
                <EnhanceCustomizer onChange={(update) => dispatch({ type: 'OPTIONS', payload: update })} onComplete={(finalOptions) => { dispatch({ type: 'SHOW_MODAL', payload: false }); handleGenerate(finalOptions); }} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </Layout>
  );
}
