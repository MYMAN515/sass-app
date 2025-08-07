// app/enhance/page.tsx (or /pages/enhance.tsx)
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

// --- Config ---
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;

// --- Utils ---
function bytesToMB(x: number) {
  return (x / (1024 * 1024)).toFixed(2);
}

function generateEnhancePrompt({
  photographyStyle = '',
  background = '',
  lighting = '',
  colorStyle = '',
  realism = '',
  outputQuality = '',
}: Partial<Record<string, string>>) {
  return `Enhance this product photo using the ${photographyStyle} photography style.\nApply a ${background} background that complements the product without distracting from it.\nUse ${lighting} to highlight material textures, contours, and product details clearly and naturally.\nMatch the scene with a ${colorStyle} color palette to reinforce brand tone and aesthetic harmony.\nEnsure a ${realism} level that maintains photorealistic integrity and avoids any artificial or cartoonish effects.\nThe final image should be in ${outputQuality} resolution — clean, crisp, and flawless.`.trim();
}

// --- Image Compare (Before/After) ---
function CompareSlider({ before, after, altBefore = 'Before', altAfter = 'After' }: { before: string; after: string; altBefore?: string; altAfter?: string; }) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = React.useState(50);

  function clamp(v: number) { return Math.max(0, Math.min(100, v)); }

  function onPointerDown(e: React.PointerEvent) {
    if (!trackRef.current) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    move(e);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!(e.buttons & 1)) return;
    move(e);
  }

  function move(e: React.PointerEvent) {
    const rect = trackRef.current!.getBoundingClientRect();
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
          ref={handleRef}
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

// --- State ---
interface State {
  session: any | null;
  userEmail: string;
  userId: string;
  userPlan: 'Free' | 'Pro' | string;

  file: File | null;
  previewUrl: string;
  resultUrl: string;

  loading: boolean;
  showEnhanceModal: boolean;
  toast: { show: boolean; message: string; type: 'success' | 'error' | 'info' };
  options: Record<string, string>;
  showErrorDetails: boolean;
  progress: number | null;
}

type Action =
  | { type: 'SESSION'; payload: { session: any | null; userEmail: string; userId: string; userPlan: string } }
  | { type: 'FILE'; payload: { file: File | null; previewUrl: string } }
  | { type: 'RESULT'; payload: { resultUrl: string } }
  | { type: 'LOADING'; payload: boolean }
  | { type: 'TOAST'; payload: State['toast'] }
  | { type: 'SHOW_MODAL'; payload: boolean }
  | { type: 'OPTIONS'; payload: Record<string, string> }
  | { type: 'ERROR_DETAILS'; payload: boolean }
  | { type: 'PROGRESS'; payload: number | null }
  | { type: 'RESET' };

const initialState: State = {
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
  showErrorDetails: false,
  progress: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SESSION':
      return { ...state, ...action.payload } as State;
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
    case 'ERROR_DETAILS':
      return { ...state, showErrorDetails: action.payload };
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
  const { userEmail, userId, userPlan, previewUrl, file, resultUrl, loading, showEnhanceModal, toast, options, showErrorDetails, progress } = state;
  const dropRef = useRef<HTMLDivElement | null>(null);

  // session
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      if (!isMounted) return;
      if (!session) {
        dispatch({ type: 'TOAST', payload: { show: true, message: 'Session expired. Please login again.', type: 'error' } });
        return;
      }
      const email = session.user.email as string;
      const uid = session.user.id as string;

      const { data: userData } = await supabase.from('Data').select('plan').eq('email', email).single();
      dispatch({ type: 'SESSION', payload: { session, userEmail: email, userId: uid, userPlan: userData?.plan || 'Free' } });
    })();
    return () => { isMounted = false; };
  }, [supabase]);

  // cleanup object url
  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  // paste support
  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const item = e.clipboardData?.files?.[0];
      if (item) handleNewFile(item);
    }
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, []);

  // ESC to close modal
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') dispatch({ type: 'SHOW_MODAL', payload: false }); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const planBadge = useMemo(() => (userPlan === 'Pro' ? 'Pro' : 'Free'), [userPlan]);

  function humanAccept() {
    return 'JPG, PNG, WEBP • ' + `≤ ${bytesToMB(MAX_SIZE)}MB`;
  }

  function validateFile(f: File) {
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

  function handleNewFile(f: File) {
    if (!validateFile(f)) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(f);
    dispatch({ type: 'FILE', payload: { file: f, previewUrl: url } });
    dispatch({ type: 'SHOW_MODAL', payload: true });
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleNewFile(f);
  }

  // drag and drop
  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleNewFile(f);
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>) { e.preventDefault(); }

  async function handleGenerate(customOptions?: Record<string, string>) {
    if (!file) { dispatch({ type: 'TOAST', payload: { show: true, message: 'Please upload an image.', type: 'error' } }); return; }
    if (!userEmail || !userId) { dispatch({ type: 'TOAST', payload: { show: true, message: 'User not logged in. Please login again.', type: 'error' } }); return; }

    dispatch({ type: 'LOADING', payload: true });
    dispatch({ type: 'TOAST', payload: { show: false, message: '', type: 'success' } });
    dispatch({ type: 'PROGRESS', payload: 10 });

    const prompt = generateEnhancePrompt(customOptions || options);

    try {
      const imageUrl = await uploadImageToSupabase(file);
      dispatch({ type: 'PROGRESS', payload: 40 });

      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 1000 * 60 * 2);

      const res = await fetch('/api/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, prompt, plan: userPlan, user_email: userEmail }),
        signal: controller.signal,
      });

      clearTimeout(id);
      dispatch({ type: 'PROGRESS', payload: 70 });

      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch (err) {
        dispatch({ type: 'TOAST', payload: { show: true, message: `Server Error (non-JSON)`, type: 'error' } });
        dispatch({ type: 'ERROR_DETAILS', payload: true });
        dispatch({ type: 'LOADING', payload: false });
        return;
      }

      if (!res.ok) {
        let errorMessage = `Server Error: ${data?.error || 'Unknown error'}`;
        if (data?.detail) errorMessage += `\nDetails: ${data.detail}`;
        dispatch({ type: 'TOAST', payload: { show: true, message: errorMessage, type: 'error' } });
        dispatch({ type: 'LOADING', payload: false });
        return;
      }

      dispatch({ type: 'RESULT', payload: { resultUrl: data.image } });
      dispatch({ type: 'TOAST', payload: { show: true, message: 'Enhancement complete!', type: 'success' } });
      dispatch({ type: 'PROGRESS', payload: 100 });
    } catch (err: any) {
      dispatch({ type: 'TOAST', payload: { show: true, message: err?.message || 'Unexpected error', type: 'error' } });
    } finally {
      dispatch({ type: 'LOADING', payload: false });
      setTimeout(() => dispatch({ type: 'PROGRESS', payload: null }), 600);
    }
  }

  function downloadImage() {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = 'enhanced.jpg';
    a.click();
  }

  return (
    <Layout title="Enhance Product Image" description="Enhance your product images with AI">
      <main className={`${poppins.className} min-h-screen py-16`}>        
        <Toast show={toast.show} message={toast.message} type={toast.type} />

        {/* Header */}
        <div className="px-4 sm:px-6 md:px-12 lg:px-24 mx-auto max-w-5xl mb-10">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Enhance Product Image</h1>
            <span className="text-xs md:text-sm px-2 py-1 rounded-full border bg-white dark:bg-zinc-800">Plan: {planBadge}</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">Upload a product photo, tweak options, then compare before/after.</p>
          {progress !== null && (
            <div className="h-1 w-full bg-gray-200 dark:bg-zinc-800 rounded mt-4 overflow-hidden" aria-label="progress">
              <div className="h-full w-0 bg-purple-600 transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>

        <div className="px-4 sm:px-6 md:px-12 lg:px-24 mx-auto space-y-16 max-w-5xl">
          {/* Upload Card */}
          <section aria-labelledby="upload-title">
            <h2 id="upload-title" className="sr-only">Upload Product Photo</h2>
            <div className="bg-white dark:bg-zinc-800 p-6 rounded-3xl shadow-xl">
              <div
                ref={dropRef}
                onDrop={onDrop}
                onDragOver={onDragOver}
                className="relative rounded-2xl border-2 border-dashed border-gray-300 dark:border-zinc-600 text-center p-8 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-700 transition"
              >
                <label className="block cursor-pointer">
                  <input
                    type="file"
                    accept={ACCEPTED_TYPES.join(',')}
                    onChange={onInputChange}
                    className="sr-only"
                    aria-describedby="upload-hint"
                  />
                  <div className="flex flex-col items-center gap-3">
                    <div className="text-sm text-gray-600">Click to choose or drag & drop</div>
                    <div id="upload-hint" className="text-xs text-gray-500">{humanAccept()} • Or paste from clipboard</div>
                  </div>
                </label>
              </div>

              {previewUrl && (
                <div className="mt-6 grid md:grid-cols-2 gap-6 items-start">
                  <div>
                    <h3 className="font-semibold mb-2">Preview</h3>
                    <img src={previewUrl} alt="preview" className="rounded-2xl w-full shadow" />
                    <div className="mt-3 flex gap-3">
                      <Button variant="secondary" onClick={() => dispatch({ type: 'SHOW_MODAL', payload: true })}>Adjust Options</Button>
                      <Button onClick={() => handleGenerate() } disabled={loading}>Enhance</Button>
                      <Button variant="ghost" onClick={() => dispatch({ type: 'RESET' })}>Reset</Button>
                    </div>
                  </div>

                  {resultUrl && (
                    <div className="relative">
                      {loading && (
                        <div className="absolute inset-0 z-10 grid place-items-center bg-black/20 rounded-2xl backdrop-blur-sm">
                          <Spinner />
                        </div>
                      )}
                      <h3 className="font-semibold mb-2">Compare</h3>
                      <CompareSlider before={previewUrl} after={resultUrl} />
                      <div className="mt-3 flex gap-3">
                        <Button onClick={downloadImage}>Download</Button>
                        <Button variant="secondary" onClick={() => handleGenerate(options)} disabled={loading}>Re-run</Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!previewUrl && (
                <p className="text-xs text-gray-500 mt-4">Tip: you can paste an image directly (Ctrl/Cmd + V).</p>
              )}
            </div>
          </section>

          {/* Loading (no result yet) */}
          {loading && !resultUrl && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="flex flex-col items-center justify-center min-h-[220px]">
              <Spinner />
              <p className="text-sm text-gray-600 mt-3">Enhancing… please wait</p>
            </motion.div>
          )}
        </div>

        {/* Modal */}
        <AnimatePresence>
          {showEnhanceModal && (
            <motion.div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={(e) => { if (e.currentTarget === e.target) dispatch({ type: 'SHOW_MODAL', payload: false }); }}
            >
              <motion.div
                className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xl w-full sm:max-w-xl md:max-w-2xl"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                role="dialog" aria-modal="true" aria-label="Enhance options"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Enhance Options</h2>
                  <button
                    className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-zinc-800"
                    onClick={() => dispatch({ type: 'SHOW_MODAL', payload: false })}
                    aria-label="Close"
                  >×</button>
                </div>
                <EnhanceCustomizer
                  onChange={(update: Record<string, string>) => dispatch({ type: 'OPTIONS', payload: update })}
                  onComplete={(finalOptions: Record<string, string>) => { dispatch({ type: 'SHOW_MODAL', payload: false }); handleGenerate(finalOptions); }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </Layout>
  );
}
