// pages/tryon.js
'use client';

import React, { useEffect, useReducer, useRef, useState } from 'react';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import Layout from '@/components/Layout';
import Toast from '@/components/Toast';
import Spinner from '@/components/Spinner';
import Button from '@/components/Button';
import TryOnCustomizer from '@/components/TryOnCustomizer';
import { uploadImageToSupabase } from '@/lib/uploadImageToSupabase';
import { AnimatePresence, motion } from 'framer-motion';
import { Poppins } from 'next/font/google';
import { mirrorToStorage } from '@/lib/mirrorToStorage';
import { createHistory } from '@/lib/historyClient';

const poppins = Poppins({ subsets: ['latin'], weight: ['400','600','700'], display: 'swap' });

/* ---------------- Config ---------------- */
const ACCEPTED_TYPES = ['image/jpeg','image/png','image/jpg','image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;

/* ---------------- Utils ---------------- */
function bytesToMB(x){ return (x/(1024*1024)).toFixed(2); }

function generateDynamicPrompt({
  gender='Female', Age='Adult', product='Shirt', height='Average',
  skinTone='Medium', background='Beige Studio', bodyType='Athletic',
  style='Catalog', angle='Front',
} = {}) {
  return `
Generate a high-resolution studio-quality image of a realistic ${skinTone.toLowerCase()} ${Age.toLowerCase()} ${gender.toLowerCase()} fashion model with a ${bodyType.toLowerCase()} body type and ${height.toLowerCase()} height, wearing the uploaded ${product.toLowerCase()}. Captured from a ${angle.toLowerCase()} angle in a professional ${style.toLowerCase()} fashion photoshoot with a ${background.toLowerCase()} background. Preserve garment details (textures, seams, prints) with soft studio lighting. No text or watermarks.
  `.trim();
}

/* ---------------- Compare Slider (mobile-first) ---------------- */
function CompareSlider({ before, after, altBefore='Before', altAfter='After' }) {
  const trackRef = useRef(null);
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);

  const clamp = v => Math.max(0, Math.min(100, v));

  const move = clientX => {
    if(!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    setPos( clamp( ((clientX - rect.left)/rect.width) * 100 ) );
  };

  const onPointerDown = e => {
    e.preventDefault();
    setDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
    move(e.clientX);
  };
  const onPointerMove = e => dragging && move(e.clientX);
  const onPointerUp   = () => setDragging(false);

  return (
    <div className="w-full select-none">
      <div
        ref={trackRef}
        className="relative w-full overflow-hidden rounded-2xl md:rounded-3xl border border-zinc-200/70 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900
                   aspect-[3/4] sm:aspect-[4/3]"
      >
        {/* After */}
        <img src={after} alt={altAfter} className="absolute inset-0 w-full h-full object-contain" loading="lazy" />

        {/* Before mask */}
        <div className="absolute inset-0 pointer-events-none" style={{ width: `${pos}%` }}>
          <img src={before} alt={altBefore} className="w-full h-full object-contain" loading="lazy" />
        </div>

        {/* Center line + handle */}
        <div
          role="slider"
          aria-label="Compare before and after"
          aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pos)}
          tabIndex={0}
          className="absolute top-0 bottom-0 cursor-ew-resize touch-none"
          style={{ left: `calc(${pos}% - 1px)` }}
          onKeyDown={(e)=>{ if(e.key==='ArrowLeft') setPos(p=>clamp(p-5)); if(e.key==='ArrowRight') setPos(p=>clamp(p+5)); }}
        >
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] md:w-[1px] bg-white/90 mix-blend-difference" />
          <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2
                          w-11 h-11 md:w-9 md:h-9 rounded-full bg-black/65 backdrop-blur
                          flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 md:w-4 md:h-4" viewBox="0 0 24 24" fill="none" stroke="white">
              <path d="M8 12H4m16 0h-4" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M14 8l-4 4 4 4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Full-surface drag layer (touch-friendly) */}
        <div
          className="absolute inset-0"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
      </div>

      {/* Mobile range control under the image (extra accessible) */}
      <input
        type="range"
        min={0} max={100} value={pos}
        onChange={(e)=>setPos(Number(e.target.value))}
        className="mt-3 block w-full md:hidden accent-fuchsia-500"
      />

      {/* Bottom labels */}
      <div className="flex justify-between text-[10px] sm:text-xs text-zinc-600 dark:text-zinc-400 mt-2 px-1">
        <span>{altBefore}</span><span>{altAfter}</span>
      </div>
    </div>
  );
}

/* ---------------- State ---------------- */
const initialState = {
  session: null,
  userEmail: '', userId: '', userPlan: 'Free',
  file: null, previewUrl: '', resultUrl: '',
  loading: false, progress: null,
  showCustomizer: false, options: {},
  toast: { show:false, message:'', type:'success' },
};

function reducer(state, action){
  switch(action.type){
    case 'SESSION':         return { ...state, ...action.payload };
    case 'FILE':            return { ...state, file: action.payload.file, previewUrl: action.payload.previewUrl, resultUrl: '' };
    case 'RESULT':          return { ...state, resultUrl: action.payload.resultUrl };
    case 'LOADING':         return { ...state, loading: action.payload };
    case 'PROGRESS':        return { ...state, progress: action.payload };
    case 'TOAST':           return { ...state, toast: action.payload };
    case 'SHOW_CUSTOMIZER': return { ...state, showCustomizer: action.payload };
    case 'OPTIONS':         return { ...state, options: { ...state.options, ...action.payload } };
    case 'RESET':           return { ...initialState, session: state.session, userEmail: state.userEmail, userId: state.userId, userPlan: state.userPlan };
    default:                return state;
  }
}

/* ---------------- Page ---------------- */
export default function TryOnPage(){
  const [supabase] = useState(()=>createBrowserSupabaseClient());
  const [dragActive, setDragActive] = useState(false);
  const [state, dispatch] = useReducer(reducer, initialState);

  const { userEmail, userId, userPlan, previewUrl, file, resultUrl,
          loading, progress, showCustomizer, options, toast } = state;

  // Session + plan
  useEffect(()=>{
    (async ()=>{
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      if(!session){
        dispatch({ type:'TOAST', payload:{ show:true, message:'Session expired. Please login again.', type:'error' }});
        return;
      }
      const email = session.user.email;
      const uid   = session.user.id;
      const { data: userData } = await supabase.from('Data').select('plan').eq('email', email).single();
      dispatch({ type:'SESSION', payload:{ session, userEmail: email, userId: uid, userPlan: userData?.plan || 'Free' }});
    })();
  },[supabase]);

  // Cleanup preview URL
  useEffect(()=>()=>{ if(previewUrl) URL.revokeObjectURL(previewUrl); },[previewUrl]);

  // File validation
  function validateFile(f){
    if(!ACCEPTED_TYPES.includes(f.type)){
      dispatch({ type:'TOAST', payload:{ show:true, message:'Only JPG/PNG/WEBP allowed.', type:'error' }});
      return false;
    }
    if(f.size > MAX_SIZE){
      dispatch({ type:'TOAST', payload:{ show:true, message:`Max size ${bytesToMB(MAX_SIZE)}MB.`, type:'error' }});
      return false;
    }
    return true;
  }

  // Handle new file
  function handleNewFile(f){
    if(!validateFile(f)) return;
    if(previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(f);
    dispatch({ type:'FILE', payload:{ file:f, previewUrl: url }});
    dispatch({ type:'SHOW_CUSTOMIZER', payload:true });
  }

  // Dropzone
  const onDrop = e => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if(f) handleNewFile(f);
  };

  // Generate
  async function handleGenerate(customOptions){
    if(!file)      return dispatch({ type:'TOAST', payload:{ show:true, message:'Please upload an image.', type:'error' }});
    if(!userEmail) return dispatch({ type:'TOAST', payload:{ show:true, message:'User not logged in. Please login again.', type:'error' }});

    dispatch({ type:'LOADING', payload:true });
    dispatch({ type:'PROGRESS', payload:12 });

    const prompt = generateDynamicPrompt(customOptions || options);

    try{
      const imageUrl = await uploadImageToSupabase(file);
      dispatch({ type:'PROGRESS', payload:40 });

      const res = await fetch('/api/tryon',{
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ imageUrl, prompt, user_email: userEmail }),
      });

      dispatch({ type:'PROGRESS', payload:75 });

      const text = await res.text();
      let data;
      try{ data = JSON.parse(text); } catch{
        throw new Error(`Server returned non-JSON: ${text.slice(0,150)}`);
      }

      if(!res.ok){
        dispatch({ type:'TOAST', payload:{ show:true, message: data?.error ? `Server Error: ${data.error}` : 'Unknown server error', type:'error' }});
        dispatch({ type:'LOADING', payload:false });
        return;
      }
            const mirrored = await mirrorToStorage({ url: data.image });

// 2) نحط الرابط الجديد في الـ state
dispatch({ type: 'RESULT', payload: { resultUrl: mirrored.publicUrl } });

// 3) نحفظ في history
await createHistory({
  kind: 'tryon',
  input_url: imageUrl,
  output_url: mirrored.publicUrl,
  prompt,
  options: { ...options, source_url: data.image, storage_path: mirrored.path },
  credits_used: 1,
  status: 'success',
});

      const image = Array.isArray(data.image) ? data.image[0] : data.image;
      dispatch({ type:'RESULT', payload:{ resultUrl: image }});
      dispatch({ type:'TOAST', payload:{ show:true, message:'Try-On complete!', type:'success' }});
      dispatch({ type:'PROGRESS', payload:100 });
    }catch(err){
      dispatch({ type:'TOAST', payload:{ show:true, message: err.message, type:'error' }});
    }finally{
      dispatch({ type:'LOADING', payload:false });
      setTimeout(()=>dispatch({ type:'PROGRESS', payload:null }), 700);
    }
  }

  // Download & copy
  const downloadImage = async ()=>{
    try{
      const res = await fetch(resultUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `tryon-${Date.now()}.png`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    }catch{
      dispatch({ type:'TOAST', payload:{ show:true, message:'Failed to download image.', type:'error' }});
    }
  };
  const copyLink = async ()=>{
    try{
      await navigator.clipboard.writeText(resultUrl);
      dispatch({ type:'TOAST', payload:{ show:true, message:'Link copied to clipboard.', type:'success' }});
    }catch{
      dispatch({ type:'TOAST', payload:{ show:true, message:'Failed to copy link.', type:'error' }});
    }
  };

  return (
    <Layout title="AI Try-On" description="Upload your clothing image, choose model/look, and get a studio-quality try-on render.">
      <main className={`${poppins.className} min-h-screen pb-20`}>
        <Toast show={toast.show} message={toast.message} type={toast.type} />

        {/* --------- Hero/Header --------- */}
        <div className="px-4 sm:px-6 md:px-12 lg:px-24 mx-auto max-w-6xl pt-10">
          <div className="flex items-start md:items-center justify-between gap-6 flex-col md:flex-row">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">AI Try-On</h1>
              <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 mt-2">
                Upload your clothing photo, pick model options, and get a clean studio render.
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

          {/* progress */}
          {progress !== null && (
            <div className="h-2 w-full mt-5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type:'spring', stiffness:120, damping:20 }}
                className="h-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-pink-500"
              />
            </div>
          )}
        </div>

        {/* --------- Content --------- */}
        <div className="px-4 sm:px-6 md:px-12 lg:px-24 mx-auto max-w-6xl mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Uploader / Preview / Result */}
          <section className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur rounded-3xl shadow-xl border border-zinc-100 dark:border-zinc-800 p-6">
            {/* Empty / Dropzone */}
            {!previewUrl && !resultUrl && (
              <motion.div
                initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
                className={`relative rounded-2xl border-2 border-dashed p-10 text-center transition
                ${dragActive ? 'border-fuchsia-500 bg-fuchsia-50/40 dark:bg-fuchsia-500/10' : 'border-zinc-300 dark:border-zinc-700'}`}
                onDragEnter={(e)=>{ e.preventDefault(); setDragActive(true); }}
                onDragOver={(e)=>{ e.preventDefault(); setDragActive(true); }}
                onDragLeave={(e)=>{ e.preventDefault(); setDragActive(false); }}
                onDrop={onDrop}
              >
                <input
                  id="file-input" type="file" accept={ACCEPTED_TYPES.join(',')}
                  className="sr-only"
                  onChange={e=>{ const f = e.target.files?.[0]; if(f) handleNewFile(f); }}
                />
                <label htmlFor="file-input" className="cursor-pointer inline-flex flex-col items-center gap-3">
                  <div className="size-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
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

            {/* Preview (before generate) */}
            {previewUrl && !resultUrl && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}>
                <div className="relative mt-2 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                  <div className="w-full aspect-[3/4] sm:aspect-[4/3]">
                    <img src={previewUrl} alt="preview" className="w-full h-full object-contain" />
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button onClick={()=>dispatch({ type:'SHOW_CUSTOMIZER', payload:true })} disabled={loading}>
                    Choose Model & Options
                  </Button>
                  <Button variant="secondary" onClick={()=>handleGenerate()} disabled={loading}>
                    Quick Try-On
                  </Button>
                  <Button variant="ghost" onClick={()=>dispatch({ type:'RESET' })}>
                    Reset
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Result (compare) */}
            {resultUrl && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="mt-2 space-y-4">
                <div className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                  <CompareSlider before={previewUrl} after={resultUrl} />

                  {/* Toolbar: under image on mobile, overlay top-right on desktop */}
                  <div className="mt-3 px-1 flex flex-col sm:flex-row gap-2 sm:mt-0 sm:absolute sm:top-3 sm:right-3 sm:px-0">
                    <Button size="sm" onClick={downloadImage}>Download</Button>
                    <Button size="sm" variant="secondary" onClick={copyLink}>Copy Link</Button>
                    <Button size="sm" variant="ghost" onClick={()=>handleGenerate(options)} disabled={loading}>
                      Re-run
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button onClick={()=>dispatch({ type:'RESET' })} variant="ghost">New Image</Button>
                </div>
              </motion.div>
            )}

            {/* Loading */}
            {loading && !resultUrl && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
                className="flex flex-col items-center justify-center min-h-[180px] mt-6">
                <Spinner />
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-3">Generating try-on… please wait</p>
              </motion.div>
            )}
          </section>

          {/* Right: Tips */}
          <aside className="space-y-6">
            <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur rounded-3xl shadow-xl border border-zinc-100 dark:border-zinc-800 p-6">
              <h3 className="text-lg font-semibold">How it works</h3>
              <ol className="mt-3 space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                <li>1) Upload your clothing image.</li>
                <li>2) Pick model/look options.</li>
                <li>3) Click Try-On.</li>
                <li>4) Compare & Download.</li>
              </ol>
            </div>

            <div className="bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 dark:from-indigo-500/15 dark:to-fuchsia-500/15 rounded-3xl border border-indigo-200/40 dark:border-indigo-900/40 p-6">
              <h3 className="text-lg font-semibold">Pro tips</h3>
              <ul className="mt-3 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                <li>• Clear garment edges & neutral light.</li>
                <li>• Simple background for best matting.</li>
                <li>• Match camera angle to original shot.</li>
              </ul>
            </div>
          </aside>
        </div>

        {/* --------- Customizer Modal --------- */}
        <AnimatePresence>
          {showCustomizer && (
            <motion.div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4"
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
              <motion.div
                className="bg-white dark:bg-zinc-950 rounded-3xl p-6 shadow-2xl w-full sm:max-w-xl md:max-w-2xl border border-zinc-100 dark:border-zinc-800"
                initial={{ scale:0.96, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.96, opacity:0 }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Try-On Settings</h3>
                  <button
                    onClick={()=>dispatch({ type:'SHOW_CUSTOMIZER', payload:false })}
                    className="rounded-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition" aria-label="Close"
                  >✕</button>
                </div>

                <div className="mt-4">
                  <TryOnCustomizer
                    onChange={(u)=>dispatch({ type:'OPTIONS', payload:u })}
                    onComplete={(finalOptions)=>{
                      dispatch({ type:'SHOW_CUSTOMIZER', payload:false });
                      handleGenerate(finalOptions);
                    }}
                  />
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="ghost" onClick={()=>dispatch({ type:'SHOW_CUSTOMIZER', payload:false })}>Cancel</Button>
                  <Button onClick={()=>handleGenerate(options)} disabled={loading}>Generate</Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </Layout>
  );
}
