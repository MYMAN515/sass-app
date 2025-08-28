'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';

/* -------------------------------------------------------
   Small helpers
------------------------------------------------------- */
const STORAGE_BUCKET = 'img';

const hexToRGBA = (hex, a = 1) => {
  const c = hex.replace('#', '');
  const v = c.length === 3 ? c.replace(/(.)/g, '$1$1') : c;
  const n = parseInt(v, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = (n) & 255;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const fileToDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const pickFirstUrl = (obj) => {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  const keys = ['image', 'image_url', 'output', 'result', 'url'];
  for (const k of keys) if (obj[k]) return Array.isArray(obj[k]) ? obj[k][0] : obj[k];
  return '';
};

/* -------------------------------------------------------
   Presets (images live in /public)
------------------------------------------------------- */
const ENHANCE_PRESETS = [
  {
    id: 'clean-studio',
    title: 'Clean Studio',
    subtitle: 'Soft light • white sweep',
    tag: 'Popular',
    config: {
      photographyStyle: 'studio product photography, 50mm prime',
      background: 'white seamless',
      lighting: 'large softbox, gentle reflections',
      colorStyle: 'neutral whites, subtle grays',
      realism: 'hyperrealistic details',
      outputQuality: '4k sharp'
    },
    preview: '/clean-studio.webp'
  },
  {
    id: 'desert-tones',
    title: 'Desert Tones',
    subtitle: 'Warm • cinematic',
    tag: 'Warm',
    config: {
      photographyStyle: 'cinematic product shot',
      background: 'warm beige backdrop',
      lighting: 'golden hour, soft shadows',
      colorStyle: 'sand, beige, amber',
      realism: 'photo-real, crisp textures',
      outputQuality: '4k'
    },
    preview: '/desert-tones.webp'
  },
  {
    id: 'editorial-beige',
    title: 'Editorial Beige',
    subtitle: 'Minimal • magazine look',
    tag: 'Editorial',
    config: {
      photographyStyle: 'editorial catalog',
      background: 'matte beige',
      lighting: 'directional key + fill',
      colorStyle: 'beige monochrome',
      realism: 'realistic',
      outputQuality: '4k print'
    },
    preview: '/editorial-beige.webp'
  },
  {
    id: 'slate-contrast',
    title: 'Slate Contrast',
    subtitle: 'Dark slate • specular',
    tag: 'High-contrast',
    config: {
      photographyStyle: 'hero product shot',
      background: 'charcoal slate',
      lighting: 'hard key + rim, controlled specular',
      colorStyle: 'cool slate, deep blacks',
      realism: 'high-fidelity',
      outputQuality: '4k'
    },
    preview: '/slate-contrast.webp'
  }
];

/** مكتبة المودلز */
const MODELS = [
  { id: 'm01', name: 'Ava — Studio Front', pose: 'front', url: '/models/m01.webp' },
  { id: 'm02', name: 'Maya — Side Pose', pose: 'side', url: '/models/m02.webp' },
  { id: 'm03', name: 'Lina — Half Body', pose: 'half', url: '/models/m03.webp' },
  { id: 'm04', name: 'Zoe — Studio 3/4', pose: '34', url: '/models/m04.webp' },
  { id: 'm05', name: 'Noah — Casual Front', pose: 'front', url: '/models/m05.webp' },
  { id: 'm06', name: 'Omar — Studio Side', pose: 'side', url: '/models/m06.webp' },
  { id: 'm07', name: 'Yara — Full Body', pose: 'full', url: '/models/m07.webp' },
  { id: 'm08', name: 'Sara — 3/4 Smile', pose: '34', url: '/models/m08.webp' },
  { id: 'm09', name: 'Jude — Front Studio', pose: 'front', url: '/models/m09.webp' },
  { id: 'm10', name: 'Ali — Casual Half', pose: 'half', url: '/models/m10.webp' },
];

/* -------------------------------------------------------
   Toast system with progress
------------------------------------------------------- */
function useToasts() {
  const [items, setItems] = useState([]);
  const push = (msg, opts = {}) => {
    const id = Math.random().toString(36).slice(2);
    const item = { id, msg, type: opts.type || 'info', progress: opts.progress ?? null };
    setItems((s) => [...s, item]);
    return {
      id,
      update: (patch) => setItems((s) => s.map((it) => (it.id === id ? { ...it, ...patch } : it))),
      close: () => setItems((s) => s.filter((it) => it.id !== id))
    };
  };
  const remove = (id) => setItems((s) => s.filter((it) => it.id !== id));
  return { items, push, remove };
}

function ToastHost({ items, onClose }) {
  return (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-4 z-[999] w-[92vw] max-w-sm sm:max-w-md space-y-2">
      <AnimatePresence initial={false}>
        {items.map((t) => (
          <motion.div
            key={t.id}
            initial={{ y: 16, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0, scale: 0.98 }}
            className="rounded-2xl border border-emerald-200/70 bg-white/90 backdrop-blur shadow-lg p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-emerald-900">{t.msg}</div>
              <button className="text-xs text-emerald-600 hover:text-emerald-900" onClick={() => onClose(t.id)}>✕</button>
            </div>
            {typeof t.progress === 'number' && (
              <div className="mt-2 h-1.5 rounded-full bg-emerald-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 transition-all"
                  style={{ width: `${Math.min(Math.max(t.progress, 0), 100)}%` }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------
   Dashboard
------------------------------------------------------- */
const GROUPS = [
  { id: 'product', label: 'Product', icon: BoxIcon },
  { id: 'people', label: 'People', icon: PersonIcon }
];

const PRODUCT_TOOLS = [
  { id: 'removeBg', label: 'Remove BG', icon: ScissorsIcon },
  { id: 'enhance',  label: 'Enhance',   icon: RocketIcon }
];

const PEOPLE_TOOLS = [
  { id: 'tryon',     label: 'Try-On',     icon: PersonIcon },
  { id: 'modelSwap', label: 'Model Swap', icon: SwapIcon   }
];

export default function Dashboard() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const router = useRouter();
  const toasts = useToasts();

  /* ---------- app state ---------- */
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState('product');     // product | people
  const [tool, setTool]   = useState('enhance');     // active tool per group
  const [plan, setPlan]   = useState('Free');

  // single-file work area
  const [file, setFile] = useState(null);
  const [localUrl, setLocalUrl] = useState('');
  const [imageData, setImageData] = useState('');
  const [resultUrl, setResultUrl] = useState('');

  // model swap
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [local1, setLocal1] = useState('');
  const [local2, setLocal2] = useState('');
  const [swapPrompt, setSwapPrompt] = useState('');

  // Try-On (stepper)
  const [selectedModel, setSelectedModel] = useState(null);
  const [pieceType, setPieceType] = useState(null);
  const [tryonStep, setTryonStep] = useState('cloth');
  const [showPieceType, setShowPieceType] = useState(false);

  const [phase, setPhase] = useState('idle'); // idle|processing|ready|error
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [history, setHistory] = useState([]);

  // compare overlay
  const [compare, setCompare] = useState(false);
  const [compareOpacity, setCompareOpacity] = useState(50);

  // remove/bg frame
  const [bgMode, setBgMode] = useState('color');   // color | gradient | pattern
  const [color, setColor] = useState('#ffffff');
  const [color2, setColor2] = useState('#ecfccb'); // lime-100
  const [angle, setAngle] = useState(35);
  const [radius, setRadius] = useState(22);
  const [padding, setPadding] = useState(24);
  const [shadow, setShadow] = useState(true);
  const [patternOpacity, setPatternOpacity] = useState(0.06);

  // enhance modal
  const [pendingEnhancePreset, setPendingEnhancePreset] = useState(null);
  const [showEnhance, setShowEnhance] = useState(false);

  const dropRef = useRef(null);
  const inputRef = useRef(null);
  const inputRef1 = useRef(null);
  const inputRef2 = useRef(null);

  /* ---------- auth and init ---------- */
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (user === undefined) return;
      if (!user) { router.replace('/login'); return; }

      try {
        const { data } = await supabase
          .from('Data')
          .select('plan')
          .eq('user_id', user.id)
          .single();
        if (!mounted) return;
        setPlan(data?.plan || 'Free');
      } catch {/* ignore */}

      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [user, router, supabase]);

  /* ---------- drag & drop / paste (single file area) ---------- */
  useEffect(() => {
    const el = dropRef.current; if (!el) return;
    const over  = (e) => { e.preventDefault(); el.classList.add('ring-2','ring-emerald-300'); };
    const leave = () => el.classList.remove('ring-2','ring-emerald-300');
    const drop  = async (e) => { e.preventDefault(); leave(); const f = e.dataTransfer.files?.[0]; if (f) await onPick(f); };
    el.addEventListener('dragover', over); el.addEventListener('dragleave', leave); el.addEventListener('drop', drop);

    const onPaste = async (e) => {
      const item = Array.from(e.clipboardData?.items || []).find(it => it.type.startsWith('image/'));
      const f = item?.getAsFile?.(); if (f) await onPick(f);
    };
    window.addEventListener('paste', onPaste);
    return () => {
      el.removeEventListener('dragover', over); el.removeEventListener('dragleave', leave); el.removeEventListener('drop', drop);
      window.removeEventListener('paste', onPaste);
    };
  }, [tool]);

  const onPick = async (f) => {
    setFile(f);
    setLocalUrl(URL.createObjectURL(f));
    setResultUrl('');
    setErr(''); setPhase('idle');
    if (tool === 'removeBg') setImageData(await fileToDataURL(f));
    if (tool === 'tryon') {
      setTryonStep('piece');
      setShowPieceType(true);
    }
  };

  /* ---------- computed styles ---------- */
  const frameStyle = useMemo(() => {
    let bgStyle;
    if (bgMode === 'color') {
      bgStyle = { background: color };
    } else if (bgMode === 'gradient') {
      bgStyle = { background: `linear-gradient(${angle}deg, ${color}, ${color2})` };
    } else {
      const svg = encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'>
          <defs><pattern id='p' width='24' height='24' patternUnits='userSpaceOnUse'>
            <path d='M0 12h24M12 0v24' stroke='${hexToRGBA('#000000', patternOpacity)}' stroke-width='1' opacity='0.18'/>
          </pattern></defs>
          <rect width='100%' height='100%' fill='${color}'/>
          <rect width='100%' height='100%' fill='url(#p)'/>
        </svg>`
      );
      bgStyle = { backgroundColor: color, backgroundImage: `url("data:image/svg+xml;utf8,${svg}")`, backgroundSize: '24px 24px' };
    }
    return {
      ...bgStyle,
      borderRadius: `${radius}px`,
      padding: `${padding}px`,
      boxShadow: shadow ? '0 18px 50px rgba(16,185,129,.12), 0 6px 18px rgba(16,185,129,.06)' : 'none',
      transition: 'all .25s ease'
    };
  }, [bgMode, color, color2, angle, radius, padding, shadow, patternOpacity]);

  /* ---------- storage ---------- */
  const uploadToStorage = useCallback(async (f) => {
    if (!f) throw new Error('no file');
    const ext = (f.name?.split('.').pop() || 'png').toLowerCase();
    const path = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: upErr } = await supabase.storage.from(STORAGE_BUCKET).upload(path, f, {
      cacheControl: '3600', upsert: false, contentType: f.type || 'image/*',
    });
    if (upErr) throw upErr;
    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    if (!data?.publicUrl) throw new Error('no public url');
    return data.publicUrl;
  }, [supabase, user]);

  /* ---------- prompt builders ---------- */
  const buildEnhancePrompt = (f) =>
    [f?.photographyStyle, `background: ${f?.background}`, `lighting: ${f?.lighting}`, `colors: ${f?.colorStyle}`, f?.realism, `output: ${f?.outputQuality}`]
      .filter(Boolean).join(', ');

  const buildTryOnPrompt = (pieceType) => {
    const region =
      pieceType === 'upper' ? 'the TOP' :
      pieceType === 'lower' ? 'the BOTTOM' :
      'the FULL OUTFIT';
    return [
      `Make the model wear the cloth , make it fit and look exatilcy as the cloth photo , make 2 virions of the photo with same cloth in the another pic ,Put the cloth  on ${region} of the person `
    ].join(' ');
  };

  /* ---------- runners ---------- */
  const runRemoveBg = useCallback(async () => {
    if (!file) return setErr('Pick an image first.');
    setBusy(true); setErr(''); setPhase('processing');
    const t = toasts.push('Removing background…', { progress: 8 });
    let adv = 8; const iv = setInterval(() => { adv = Math.min(adv + 6, 88); t.update({ progress: adv }); }, 500);
    try {
      const r = await fetch('/api/remove-bg', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || 'remove-bg failed');
      const out = pickFirstUrl(j); if (!out) throw new Error('No output from remove-bg');
      setResultUrl(out);
      setHistory(h => [{ tool:'Remove BG', inputThumb: localUrl, outputUrl: out, ts: Date.now() }, ...h].slice(0,24));
      setPhase('ready'); t.update({ progress: 100, msg: 'Background removed ✓' });
      setTimeout(() => t.close(), 700);
    } catch (e) {
      console.error(e); setPhase('error'); setErr('Failed to process.');
      t.update({ msg: 'Remove BG failed', type: 'error' }); setTimeout(() => t.close(), 1500);
    } finally { clearInterval(iv); setBusy(false); }
  }, [file, imageData, localUrl, toasts]);

  const runEnhance = useCallback(async (selections) => {
    if (!file) return setErr('Pick an image first.');
    setBusy(true); setErr(''); setPhase('processing');
    const imageUrl = await uploadToStorage(file);
    const prompt = buildEnhancePrompt(selections);
    const t = toasts.push('Enhancing…', { progress: 12 });
    let adv = 12; const iv = setInterval(() => { adv = Math.min(adv + 6, 88); t.update({ progress: adv }); }, 500);
    try {
      const r = await fetch('/api/enhance', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, selections, prompt, plan, user_email: user.email })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || 'enhance failed');
      const out = pickFirstUrl(j); if (!out) throw new Error('No output from enhance');
      setResultUrl(out);
      setHistory(h => [{ tool:'Enhance', inputThumb: localUrl, outputUrl: out, ts: Date.now() }, ...h].slice(0,24));
      setPhase('ready'); t.update({ progress: 100, msg: 'Enhanced ✓' }); setTimeout(() => t.close(), 700);
    } catch (e) {
      console.error(e); setPhase('error'); setErr('Failed to process.');
      t.update({ msg: 'Enhance failed', type: 'error' }); setTimeout(() => t.close(), 1500);
    } finally { clearInterval(iv); setBusy(false); }
  }, [file, uploadToStorage, plan, user, localUrl, toasts]);

  const runTryOn = useCallback(async () => {
    if (!file)              { setErr('Please upload a clothing image first.'); return; }
    if (!selectedModel?.url){ setErr('Please select a model first.'); return; }
    if (!pieceType)         { setErr('Please choose the clothing type.'); return; }

    const origin =
      (typeof window !== 'undefined' && window.location?.origin) ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'https://aistoreassistant.app';

    const modelUrlAbs = selectedModel.url.startsWith('http')
      ? selectedModel.url
      : new URL(selectedModel.url, origin).toString();

    setBusy(true);
    setErr('');
    setPhase('processing');

    const prompt = buildTryOnPrompt(pieceType);

    const toast = toasts.push('Generating try-on…', { progress: 10 });
    let progress = 10;
    const iv = setInterval(() => {
      progress = Math.min(progress + 6, 88);
      toast.update({ progress });
    }, 500);

    try {
      const clothUrl = await uploadToStorage(file);

      const r = await fetch('/api/tryon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image1: modelUrlAbs,
          image2: clothUrl,
          pieceType,
          plan,
          user_email: user.email
        })
      });

      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        const msg =
          j?.error ||
          (r.status === 400 ? 'Missing required fields.' :
           r.status === 401 ? 'Unauthorized.' :
           r.status === 403 ? 'No credits left.' :
           r.status === 404 ? 'User not found.' :
           r.status === 500 ? 'Generation failed on the server.' :
           `Unexpected error (${r.status}).`);
        throw new Error(msg);
      }

      const out = j?.image || j?.url || j?.result || (Array.isArray(j?.output) ? j.output[0] : '');
      if (!out) throw new Error('No output image returned from the API.');

      setResultUrl(out);
      setHistory(h => [
        { tool: 'Try-On', inputThumb: selectedModel.url, outputUrl: out, ts: Date.now() },
        ...h
      ].slice(0, 24));

      setPhase('ready');
      toast.update({ progress: 100, msg: 'Try-On ✓' });
      setTimeout(() => toast.close(), 700);
    } catch (e) {
      console.error(e);
      setPhase('error');
      setErr(e?.message || 'Processing failed.');
      toast.update({ msg: `Try-On failed: ${e?.message || 'Error'}`, type: 'error' });
      setTimeout(() => toast.close(), 1500);
    } finally {
      clearInterval(iv);
      setBusy(false);
    }
  }, [file, selectedModel, pieceType, uploadToStorage, plan, user, toasts]);

  const runModelSwap = useCallback(async () => {
    if (!file1 || !file2) return setErr('Pick both images.');
    setBusy(true); setErr(''); setPhase('processing');
    const [image1, image2] = await Promise.all([uploadToStorage(file1), uploadToStorage(file2)]);
    const t = toasts.push('Running Model Swap…', { progress: 10 });
    let adv = 10; const iv = setInterval(() => { adv = Math.min(adv + 6, 88); t.update({ progress: adv }); }, 500);
    try {
      const r = await fetch('/api/model', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image1, image2, prompt: swapPrompt, plan, user_email: user.email })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || 'model swap failed');
      const out = pickFirstUrl(j) || j?.url || j?.image;
      if (!out) throw new Error('No output from model.');
      setResultUrl(out);
      setHistory(h => [{ tool:'Model Swap', inputThumb: local1, outputUrl: out, ts: Date.now() }, ...h].slice(0,24));
      setPhase('ready'); t.update({ progress: 100, msg: 'Model Swap done ✓' }); setTimeout(() => t.close(), 700);
    } catch (e) {
      console.error(e); setPhase('error'); setErr('Failed to process.');
      t.update({ msg: 'Model Swap failed', type: 'error' }); setTimeout(() => t.close(), 1500);
    } finally { clearInterval(iv); setBusy(false); }
  }, [file1, file2, swapPrompt, uploadToStorage, plan, user, local1, toasts]);

  /* ---------- handlers ---------- */
  const resetAll = () => {
    setFile(null); setLocalUrl(''); setResultUrl('');
    setFile1(null); setFile2(null); setLocal1(''); setLocal2('');
    setErr(''); setPhase('idle'); setCompare(false);
    setSelectedModel(null); setPieceType(null); setTryonStep(tool==='tryon' ? 'cloth' : 'cloth');
  };

  const switchTool = (nextId) => {
    setTool(nextId);
    setResultUrl(''); setErr(''); setPhase('idle'); setCompare(false);
    setFile(null); setLocalUrl('');
    setFile1(null); setFile2(null); setLocal1(''); setLocal2('');
    setSelectedModel(null); setPieceType(null); setTryonStep(nextId==='tryon' ? 'cloth' : 'cloth');
  };

  const handleRun = () => {
    if (group === 'product') {
      if (tool === 'removeBg') return runRemoveBg();
      if (tool === 'enhance')  return setShowEnhance(true);
    } else {
      if (tool === 'tryon') return runTryOn();
      if (tool === 'modelSwap') return runModelSwap();
    }
  };

  /* ---------- UI ---------- */
  if (loading || user === undefined) {
    return (
      <main className="min-h-screen grid place-items-center bg-gradient-to-b from-emerald-50 via-lime-50 to-white text-emerald-700">
        <div className="rounded-2xl bg-white/80 backdrop-blur px-4 py-3 border border-emerald-200 shadow-sm text-sm">Loading…</div>
      </main>
    );
  }
  if (!user) return null;

  const initials = (() => {
    const n = user?.user_metadata?.name || user?.email || 'U';
    const p = n.split(' ').filter(Boolean);
    return ((p[0]?.[0] || n[0]) + (p[1]?.[0] || '')).toUpperCase();
  })();

  return (
    <main className="min-h-screen bg-[linear-gradient(120deg,#ecfeff_0%,#f0fdf4_45%,#fefce8_100%)] text-emerald-950">
      <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 md:gap-6 px-3 md:px-6 py-4 md:py-6">

        {/* Sidebar — glassy, mint/lemon */}
        <aside className="rounded-3xl border border-emerald-200/70 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm sticky top-3 md:top-4 self-start h-fit">
          <div className="px-4 py-4 flex items-center gap-3 border-b border-emerald-100/80">
            <div className="grid place-items-center size-9 rounded-2xl bg-gradient-to-br from-emerald-400 to-lime-400 text-white shadow">
              <SparkleIcon className="w-4 h-4" />
            </div>
            <div className="font-semibold tracking-tight text-emerald-900">AI Studio</div>
          </div>

          <div className="px-3 py-3">
            <div className="text-[11px] font-semibold text-emerald-600 mb-1">Workspace</div>
            <div className="inline-flex rounded-full border border-emerald-200 bg-white p-1">
              {GROUPS.map((g) => {
                const Active = group === g.id;
                const Icon = g.icon;
                return (
                  <button
                    key={g.id}
                    onClick={() => { setGroup(g.id); switchTool(g.id === 'product' ? 'enhance' : 'tryon'); }}
                    className={[
                      'inline-flex items-center gap-2 py-1.5 px-3 rounded-full text-sm transition',
                      Active ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-800 hover:bg-emerald-50'
                    ].join(' ')}
                  >
                    <Icon className="size-4" /> {g.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-3 pb-3">
            <div className="text-[11px] font-semibold text-emerald-600 mb-1">Tools</div>
            <div className="space-y-1">
              {(group === 'product' ? PRODUCT_TOOLS : PEOPLE_TOOLS).map((t) => {
                const Active = tool === t.id;
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => switchTool(t.id)}
                    className={[
                      'w-full group flex items-center gap-3 rounded-xl px-2 py-1.5 text-sm transition border',
                      Active
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'text-emerald-900 hover:bg-emerald-50 border-transparent'
                    ].join(' ')}
                  >
                    <Icon className={['size-4', Active ? 'text-emerald-600' : 'text-emerald-500 group-hover:text-emerald-700'].join(' ')} />
                    <span className="truncate">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-4 py-3 border-t border-emerald-100/80">
            <div className="flex items-center gap-3">
              <div className="grid place-items-center size-10 rounded-full bg-emerald-50 text-emerald-800 font-bold">{initials}</div>
              <div className="text-sm">
                <div className="font-medium leading-tight text-emerald-900">{user.user_metadata?.name || user.email}</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main column */}
        <section className="space-y-5 md:space-y-6">

          {/* Presets / Model Flow */}
          <div className="rounded-3xl border border-emerald-200 bg-white/70 backdrop-blur p-4 sm:p-5 md:p-6 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-emerald-900">
                  {group === 'product' ? 'Quick Presets' : (tool === 'tryon' ? 'Try-On Flow' : 'Pick a Model')}
                </h1>
                <p className="text-emerald-700/80 text-xs sm:text-sm">
                  {group === 'product'
                    ? <>Pick a preset or open <span className="font-semibold text-emerald-900">Customize</span>.</>
                    : tool === 'tryon'
                      ? <>Step 1: upload clothing → Step 2: choose type → Step 3: pick a model → Run.</>
                      : <>Choose two images and run <span className="font-semibold text-emerald-900">Model Swap</span>.</>}
                </p>
              </div>

              {group === 'product' ? (
                <button
                  onClick={() => { setTool('enhance'); setPendingEnhancePreset(null); setShowEnhance(true); }}
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs sm:text-sm font-semibold hover:bg-emerald-50 text-emerald-900"
                >
                  ✨ Customize Enhance
                </button>
              ) : tool === 'tryon' ? (
                pieceType ? (
                  <button
                    onClick={() => setShowPieceType(true)}
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs sm:text-sm font-semibold hover:bg-emerald-50 text-emerald-900"
                  >
                    Change clothing type
                  </button>
                ) : null
              ) : null}
            </div>

            {group === 'product' ? (
              <div className="mt-4">
                <div className="mb-2 text-[12px] font-semibold text-emerald-700">Enhance</div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {ENHANCE_PRESETS.map((p) => (
                    <PresetCard
                      key={p.id}
                      title={p.title}
                      subtitle={p.subtitle}
                      preview={p.preview}
                      tag={p.tag}
                      onClick={() => { setTool('enhance'); setPendingEnhancePreset(p.config); setShowEnhance(true); }}
                    />
                  ))}
                </div>
              </div>
            ) : tool === 'tryon' ? (
              <div className="mt-4">
                <TryOnStepper step={tryonStep} pieceType={pieceType} modelPicked={!!selectedModel} />
                {tryonStep === 'model' ? (
                  <div className="mt-3">
                    <div className="mb-2 text-[12px] font-semibold text-emerald-700">Models</div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {MODELS.map((m) => (
                        <ModelCard
                          key={m.id}
                          model={m}
                          active={selectedModel?.id === m.id}
                          onSelect={() => setSelectedModel(m)}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 rounded-2xl border border-dashed border-emerald-300/70 p-4 text-xs text-emerald-700 bg-emerald-50/50">
                    Upload clothing first, then choose type. Models will appear next.
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-4">
                <div className="mb-2 text-[12px] font-semibold text-emerald-700">Model Swap</div>
                <div className="text-xs text-emerald-700/80">Upload two images below and write a short instruction.</div>
              </div>
            )}
          </div>

          {/* Workbench */}
          <div className="grid gap-4 md:gap-6 lg:grid-cols-[1fr_340px]">

            {/* Canvas Panel */}
            <section className="rounded-3xl border border-emerald-200 bg-white/70 backdrop-blur relative shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 px-3 sm:px-4 md:px-5 pt-3 md:pt-4">
                <div className="inline-flex rounded-full border border-emerald-200 bg-white p-1">
                  {(group === 'product' ? PRODUCT_TOOLS : PEOPLE_TOOLS).map((it) => {
                    const Active = tool === it.id;
                    const Icon = it.icon;
                    return (
                      <button
                        key={it.id}
                        onClick={() => switchTool(it.id)}
                        className={[
                          'inline-flex items-center gap-2 py-1.5 px-3 rounded-full text-sm transition',
                          Active ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-900 hover:bg-emerald-50'
                        ].join(' ')}
                      >
                        <Icon className="size-4" />
                        <span>{it.label}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <StepBadge phase={phase} />
                  <button onClick={resetAll} className="text-xs px-2 py-1 rounded-lg border border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-900">Reset</button>
                </div>
              </div>

              {/* Drop areas */}
              {tool !== 'modelSwap' ? (
                <div
                  ref={dropRef}
                  className="m-3 sm:m-4 md:m-5 min-h-[240px] sm:min-h-[300px] md:min-h-[360px] grid place-items-center rounded-3xl border-2 border-dashed border-emerald-300/80 bg-emerald-50/40 hover:bg-emerald-50 transition cursor-pointer"
                  onClick={() => inputRef.current?.click()}
                  title="Drag & drop / Click / Paste (Ctrl+V)"
                >
                  <input
                    ref={inputRef}
                    type="file" accept="image/*" className="hidden"
                    onChange={async (e) => { const f = e.target.files?.[0]; if (f) await onPick(f); }}
                  />
                  {!localUrl && !resultUrl ? (
                    <div className="text-center text-emerald-700 text-sm">
                      <div className="mx-auto mb-3 grid place-items-center size-10 sm:size-12 rounded-full bg-white border border-emerald-200">⬆</div>
                      {tool === 'tryon'
                        ? 'Upload a clothing image (PNG/JPG). Transparent PNG preferred.'
                        : 'Drag & drop an image here, click to choose, or paste (Ctrl+V)'}
                    </div>
                  ) : (
                    <div className="relative w-full h-full grid place-items-center p-2 sm:p-3">
                      {compare && localUrl && resultUrl ? (
                        <div className="relative max-w-full max-h-[70vh]">
                          <img src={resultUrl} alt="after" className="max-w-full max-h-[70vh] object-contain rounded-2xl" />
                          <img src={localUrl} alt="before" style={{opacity: compareOpacity/100}}
                               className="absolute inset-0 w-full h-full object-contain rounded-2xl pointer-events-none" />
                        </div>
                      ) : (
                        <img
                          src={resultUrl || localUrl}
                          alt="preview"
                          className="max-w-full max-h-[70vh] object-contain rounded-2xl"
                          draggable={false}
                          loading="lazy"
                        />
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="m-3 sm:m-4 md:m-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Image 1 */}
                    <FileDrop
                      label="Image 1"
                      file={file1}
                      localUrl={local1}
                      onPick={async (f) => { setFile1(f); setLocal1(URL.createObjectURL(f)); setResultUrl(''); setPhase('idle'); }}
                      inputRef={inputRef1}
                    />
                    {/* Image 2 */}
                    <FileDrop
                      label="Image 2"
                      file={file2}
                      localUrl={local2}
                      onPick={async (f) => { setFile2(f); setLocal2(URL.createObjectURL(f)); setResultUrl(''); setPhase('idle'); }}
                      inputRef={inputRef2}
                    />
                  </div>
                  <div className="mt-3">
                    <label className="text-xs text-emerald-700">Prompt</label>
                    <input
                      value={swapPrompt} onChange={(e)=>setSwapPrompt(e.target.value)}
                      placeholder="Describe how to combine or arrange the two images…"
                      className="mt-1 w-full rounded-2xl border border-emerald-200 bg-white px-3 py-2 text-sm"
                    />
                  </div>

                  {resultUrl && (
                    <div className="mt-4">
                      <div className="text-xs text-emerald-700 mb-2">Result</div>
                      <div className="w-full rounded-2xl border border-emerald-200 bg-emerald-50/40 p-2 grid place-items-center">
                        <img src={resultUrl} alt="result" className="max-w-full max-h-[60vh] object-contain rounded-xl" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 px-3 sm:px-4 md:px-5 pb-4 md:pb-5">
                <button
                  onClick={handleRun}
                  disabled={
                    busy || (
                      tool === 'modelSwap' ? (!file1 || !file2) :
                      tool === 'tryon' ? (!file || !selectedModel || !pieceType) :
                      !file
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white px-3 sm:px-4 py-2 text-sm font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {busy ? 'Processing…' : (<><PlayIcon className="size-4" /> Run {tool === 'modelSwap' ? 'Model Swap' : (tool === 'removeBg' ? 'Remove BG' : tool === 'enhance' ? 'Enhance' : 'Try-On')}</>)}
                </button>

                {resultUrl && (
                  <>
                    <button
                      onClick={() => exportPng(resultUrl)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white px-3 sm:px-4 py-2 text-sm font-semibold hover:bg-emerald-50 text-emerald-900"
                    >
                      ⬇ Download PNG
                    </button>
                    <a
                      href={resultUrl} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white px-2.5 py-2 text-xs font-semibold hover:bg-emerald-50 text-emerald-900"
                    >
                      ↗ Open
                    </a>
                    <button
                      onClick={() => { navigator.clipboard.writeText(resultUrl).catch(()=>{}); }}
                      className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white px-2.5 py-2 text-xs font-semibold hover:bg-emerald-50 text-emerald-900"
                    >
                      🔗 Copy URL
                    </button>

                    {tool !== 'modelSwap' && localUrl && (
                      <>
                        <label className="inline-flex items-center gap-2 text-xs ml-1 sm:ml-2 text-emerald-900">
                          <input type="checkbox" checked={compare} onChange={(e)=>setCompare(e.target.checked)} />
                          Compare
                        </label>
                        {compare && (
                          <div className="flex items-center gap-2">
                            <input type="range" min={0} max={100} value={compareOpacity}
                              onChange={(e)=>setCompareOpacity(Number(e.target.value))} className="accent-emerald-600"/>
                            <span className="text-xs w-8 text-right">{compareOpacity}%</span>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}

                {!!err && <div className="text-xs text-rose-600">{err}</div>}
              </div>

              {/* busy overlay */}
              <AnimatePresence>
                {busy && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="pointer-events-none absolute inset-0 rounded-3xl grid place-items-center bg-white/60"
                  >
                    <div className="text-xs px-3 py-2 rounded-lg bg-white border border-emerald-200 shadow">Working…</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* Inspector */}
            <aside className="rounded-3xl border border-emerald-200 bg-white/70 backdrop-blur p-4 md:pb-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-emerald-900">Inspector</div>
                <span className="text-xs text-emerald-700">Tool: {tool}</span>
              </div>

              {/* Try-On summary */}
              {tool === 'tryon' && (
                <div className="space-y-3 mt-3 text-xs">
                  <div className="rounded-xl border border-emerald-200 p-3 bg-white">
                    <div className="text-emerald-700 mb-1">Clothing</div>
                    {localUrl ? (
                      <img src={localUrl} alt="cloth" className="w-full max-h-48 object-contain rounded-lg border border-emerald-100 bg-emerald-50/40" />
                    ) : (
                      <div className="text-emerald-400">— Upload a clothing image —</div>
                    )}
                  </div>

                  <div className="rounded-xl border border-emerald-200 p-3 bg-white">
                    <div className="text-emerald-700 mb-1">Type</div>
                    <div className="flex items-center justify-between">
                      <div className="text-emerald-900">{pieceType ? pieceType : '—'}</div>
                      <button className="rounded-lg border border-emerald-200 px-2 py-1 text-[11px] bg-white hover:bg-emerald-50" onClick={() => setShowPieceType(true)}>Change</button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-emerald-200 p-3 bg-white">
                    <div className="text-emerald-700 mb-1">Selected Model</div>
                    {selectedModel ? (
                      <div className="flex items-center gap-2">
                        <img src={selectedModel.url} alt={selectedModel.name} className="w-10 h-10 rounded-md object-cover border border-emerald-100" />
                        <div>
                          <div className="font-semibold text-emerald-900">{selectedModel.name}</div>
                          <div className="text-[11px] text-emerald-600">Pose: {selectedModel.pose}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-emerald-400">— Pick a model above —</div>
                    )}
                  </div>

                  {resultUrl && (
                    <div className="rounded-xl border border-emerald-200 p-3 bg-white">
                      <div className="text-emerald-700 mb-2">Result</div>
                      <img
                        src={resultUrl}
                        alt="final"
                        className="w-full max-h-64 object-contain rounded-md border border-emerald-100 bg-emerald-50/40"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Remove BG inspector */}
              {tool === 'removeBg' && (
                <div className="space-y-3 mt-3">
                  <ModeTabs mode={bgMode} setMode={setBgMode} />
                  <Field label="Primary">
                    <Color value={color} onChange={setColor} />
                  </Field>

                  {bgMode === 'gradient' && (
                    <>
                      <Field label="Secondary">
                        <Color value={color2} onChange={setColor2} />
                      </Field>
                      <Field label="Angle">
                        <Range value={angle} onChange={setAngle} min={0} max={360} />
                      </Field>
                    </>
                  )}

                  {bgMode === 'pattern' && (
                    <Field label="Pattern opacity">
                      <Range
                        value={patternOpacity}
                        onChange={setPatternOpacity}
                        min={0}
                        max={0.5}
                        step={0.01}
                      />
                    </Field>
                  )}

                  <Field label="Radius">
                    <Range value={radius} onChange={setRadius} min={0} max={48} />
                  </Field>
                  <Field label="Padding">
                    <Range value={padding} onChange={setPadding} min={0} max={64} />
                  </Field>

                  <label className="mt-1 inline-flex items-center gap-2 text-xs text-emerald-800">
                    <input
                      type="checkbox"
                      checked={shadow}
                      onChange={(e) => setShadow(e.target.checked)}
                    />
                    Shadow
                  </label>

                  <div className="mt-3">
                    <div className="text-xs text-emerald-700 mb-2">Final Preview</div>
                    <div
                      style={frameStyle}
                      className="relative rounded-xl overflow-hidden border border-emerald-200"
                    >
                      <div className="relative w-full min-h-[140px] sm:min-h-[160px] grid place-items-center">
                        {resultUrl ? (
                          <img
                            src={resultUrl}
                            alt="final"
                            className="max-w-full max-h-[38vh] object-contain"
                          />
                        ) : (
                          <div className="grid place-items-center h-[140px] text-xs text-emerald-400">
                            — Run Remove BG first —
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhance inspector */}
              {tool === 'enhance' && (
                <div className="space-y-2 text-xs text-emerald-700 mt-3">
                  <div>
                    Choose a preset above or press <span className="font-semibold text-emerald-900">Customize</span>.
                  </div>
                  {resultUrl && (
                    <div className="mt-2 rounded-2xl overflow-hidden border border-emerald-200 bg-emerald-50/40">
                      <div className="relative w-full min-h-[140px] grid place-items-center">
                        <img
                          src={resultUrl}
                          alt="final"
                          className="max-w-full max-h-[38vh] object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Model Swap inspector */}
              {tool === 'modelSwap' && (
                <div className="text-xs text-emerald-700 mt-3 space-y-3">
                  <div className="rounded-xl border border-emerald-200 p-3 bg-white">
                    <div className="text-emerald-700 mb-1">Inputs</div>
                    <div className="grid grid-cols-2 gap-2">
                      {local1 ? (
                        <img
                          src={local1}
                          alt="image1"
                          className="w-full h-24 object-cover rounded-md border border-emerald-100 bg-emerald-50/40"
                        />
                      ) : (
                        <div className="h-24 grid place-items-center text-emerald-400 border border-emerald-100 rounded-md bg-emerald-50/40">
                          — Image 1 —
                        </div>
                      )}
                      {local2 ? (
                        <img
                          src={local2}
                          alt="image2"
                          className="w-full h-24 object-cover rounded-md border border-emerald-100 bg-emerald-50/40"
                        />
                      ) : (
                        <div className="h-24 grid place-items-center text-emerald-400 border border-emerald-100 rounded-md bg-emerald-50/40">
                          — Image 2 —
                        </div>
                      )}
                    </div>
                    {swapPrompt && (
                      <div className="mt-2 text-[11px] text-emerald-600">
                        Prompt: <span className="text-emerald-800">{swapPrompt}</span>
                      </div>
                    )}
                  </div>

                  {resultUrl && (
                    <div className="rounded-xl border border-emerald-200 p-3 bg-white">
                      <div className="text-emerald-700 mb-2">Result</div>
                      <img
                        src={resultUrl}
                        alt="model-swap-result"
                        className="w-full max-h-64 object-contain rounded-md border border-emerald-100 bg-emerald-50/40"
                      />
                    </div>
                  )}
                </div>
              )}
            </aside>
          </div>

          {/* History */}
          <div className="rounded-3xl border border-emerald-200 bg-white/70 backdrop-blur p-4 md:p-5 shadow-sm">
            <div className="text-sm font-semibold text-emerald-900 mb-2">History</div>
            {history.length === 0 ? (
              <div className="text-xs text-emerald-600 px-1 py-4">— No renders yet —</div>
            ) : (
              <>
                <div className="mb-2">
                  <button
                    onClick={() => setHistory([])}
                    className="text-xs px-2 py-1 rounded-lg border border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-900"
                  >
                    Clear history
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {history.map((h, i) => (
                    <button
                      key={i}
                      onClick={() => setResultUrl(h.outputUrl)}
                      className="group relative rounded-2xl overflow-hidden border border-emerald-200 hover:border-emerald-300 transition bg-emerald-50/40"
                    >
                      <img
                        src={h.outputUrl || h.inputThumb}
                        alt="hist"
                        className="w-full h-28 object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 text-[10px] px-2 py-1 bg-emerald-700/50 text-white backdrop-blur">
                        {h.tool} • {new Date(h.ts).toLocaleTimeString()}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showEnhance && (
          <motion.div
            className="fixed inset-0 z-[100] grid place-items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-emerald-900/40" onClick={() => setShowEnhance(false)} />
            <div className="relative w-full max-w-3xl mx-3">
              <EnhanceCustomizer
                initial={pendingEnhancePreset || undefined}
                onChange={() => {}}
                onComplete={(form) => {
                  setShowEnhance(false);
                  setPendingEnhancePreset(null);
                  runEnhance(form);
                }}
              />
            </div>
          </motion.div>
        )}

        {showPieceType && (
          <motion.div
            className="fixed inset-0 z-[110] grid place-items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-emerald-900/40" onClick={() => setShowPieceType(false)} />
            <div className="relative w-full max-w-md mx-3">
              <PieceTypeModal
                initial={pieceType || 'upper'}
                onCancel={() => setShowPieceType(false)}
                onConfirm={(type) => {
                  setPieceType(type);
                  setShowPieceType(false);
                  setTryonStep('model');
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toasts */}
      <ToastHost items={toasts.items} onClose={toasts.remove} />
    </main>
  );
}

/* -------------------------------------------------------
   Reusable UI widgets
------------------------------------------------------- */
function FileDrop({ label, file, localUrl, onPick, inputRef }) {
  return (
    <div
      className="min-h-[220px] grid place-items-center rounded-2xl border-2 border-dashed border-emerald-300/80 bg-emerald-50/40 hover:bg-emerald-50 transition cursor-pointer"
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (f) await onPick(f);
        }}
      />
      {!localUrl ? (
        <div className="text-center text-emerald-700 text-sm">
          <div className="mx-auto mb-3 grid place-items-center size-10 rounded-full bg-white border border-emerald-200">
            ⬆
          </div>
          {label}: Click to choose
        </div>
      ) : (
        <img
          src={localUrl}
          alt={label}
          className="max-w-full max-h-[45vh] object-contain rounded-xl"
        />
      )}
    </div>
  );
}

function PresetCard({ title, subtitle, onClick, preview, tag }) {
  const [broken, setBroken] = useState(false);
  const [loaded, setLoaded] = useState(false);
  if (broken) return null;

  return (
    <button
      onClick={onClick}
      className="group relative rounded-2xl overflow-hidden border border-emerald-200 hover:border-emerald-300 bg-white/80 backdrop-blur shadow-sm transition text-left hover:shadow-md"
    >
      <div className="relative w-full aspect-[4/3] bg-emerald-50/60">
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-emerald-50 via-white to-lime-50" />
        )}
        <img
          src={preview}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setBroken(true)}
        />
        {tag && (
          <span className="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full bg-emerald-700/80 text-white shadow">
            {tag}
          </span>
        )}
        <div className="absolute top-2 right-2 rounded-full bg-white/90 backdrop-blur px-2 py-1 text-[11px] border border-white shadow-sm">
          Use preset
        </div>
      </div>
      <div className="p-3">
        <div className="font-semibold text-emerald-900">{title}</div>
        <div className="text-xs text-emerald-700">{subtitle}</div>
      </div>
    </button>
  );
}

function ModelCard({ model, active, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className={[
        'group relative rounded-2xl overflow-hidden border bg-white/80 backdrop-blur shadow-sm transition',
        active
          ? 'border-emerald-400 ring-2 ring-emerald-300'
          : 'border-emerald-200 hover:border-emerald-300 hover:shadow-md',
      ].join(' ')}
      title={model.name}
    >
      <div className="relative w-full aspect-[4/5] bg-emerald-50/60">
        <img
          src={model.url}
          alt={model.name}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-2 left-2 rounded-full bg-white/90 backdrop-blur px-2 py-1 text-[11px] border border-white shadow-sm">
          {active ? 'Selected' : 'Use model'}
        </div>
      </div>
      <div className="p-3">
        <div className="font-semibold truncate text-emerald-900">{model.name}</div>
        <div className="text-[11px] text-emerald-600">Pose: {model.pose}</div>
      </div>
    </button>
  );
}

/** Stepper */
function TryOnStepper({ step, pieceType, modelPicked }) {
  const map = { cloth: 0, piece: 1, model: 2 };
  const idx = map[step] ?? 0;

  const steps = [
    { id: 'cloth', label: 'Upload clothing' },
    { id: 'piece', label: pieceType ? `Type: ${pieceType}` : 'Choose type' },
    { id: 'model', label: modelPicked ? 'Model selected' : 'Pick a model' },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-2">
        {steps.map((s, i) => {
          const done = i < idx;
          const active = i === idx;
          return (
            <div key={s.id} className="flex-1">
              <div className="flex items-center gap-2">
                <motion.div
                  layout
                  className={[
                    'size-6 rounded-full grid place-items-center border text-[11px] font-semibold',
                    done
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : active
                      ? 'bg-lime-500 text-emerald-950 border-lime-500'
                      : 'bg-white text-emerald-700 border-emerald-200',
                  ].join(' ')}
                >
                  {done ? '✓' : i + 1}
                </motion.div>
                <div
                  className={[
                    'text-xs sm:text-[13px]',
                    done ? 'text-emerald-700' : active ? 'text-emerald-900' : 'text-emerald-700/80',
                  ].join(' ')}
                >
                  {s.label}
                </div>
              </div>
              {i < steps.length - 1 && (
                <motion.div
                  layout
                  className="h-1 mt-2 rounded-full bg-emerald-100 overflow-hidden"
                >
                  <motion.div
                    initial={false}
                    animate={{ width: i < idx ? '100%' : '0%' }}
                    transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                    className="h-full bg-emerald-600"
                  />
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepBadge({ phase }) {
  const map = {
    idle: { label: 'Ready', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    processing: { label: 'Processing', color: 'bg-lime-100 text-lime-800 border-lime-200' },
    ready: { label: 'Done', color: 'bg-teal-100 text-teal-800 border-teal-200' },
    error: { label: 'Error', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  };
  const it = map[phase] || map.idle;
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${it.color}`}>
      <span
        className={`inline-block size-2 rounded-full ${
          phase === 'processing' ? 'bg-emerald-700 animate-pulse' : 'bg-emerald-700'
        }`}
      />
      {it.label}
    </span>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex items-center justify-between gap-3 text-xs text-emerald-800">
      <span className="min-w-28">{label}</span>
      <div className="flex-1">{children}</div>
    </label>
  );
}
function Color({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
      <input
        className="w-full rounded-lg border border-emerald-200 bg-white px-2 py-1 text-emerald-900"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
function Range({ value, onChange, min, max, step = 1 }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-emerald-600"
      />
      <span className="w-10 text-right">{typeof value === 'number' ? value : ''}</span>
    </div>
  );
}

function ModeTabs({ mode, setMode }) {
  const tabs = [
    { id: 'color', label: 'Color' },
    { id: 'gradient', label: 'Gradient' },
    { id: 'pattern', label: 'Pattern' },
  ];
  return (
    <div className="inline-flex rounded-xl border border-emerald-200 bg-emerald-50/50 p-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => setMode(t.id)}
          className={[
            'px-3 py-1.5 text-xs rounded-lg transition',
            mode === t.id ? 'bg-white shadow text-emerald-900' : 'text-emerald-700 hover:bg-white'
          ].join(' ')}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function PieceTypeModal({ initial = 'upper', onCancel, onConfirm }) {
  const [active, setActive] = useState(initial);
  const options = [
    { id: 'upper', label: 'Upper (T-shirt/Shirt/Jacket)' },
    { id: 'lower', label: 'Lower (Pants/Jeans/Skirt)' },
    { id: 'dress', label: 'Full Dress (One-piece)' },
  ];
  return (
    <div className="rounded-2xl bg-white p-4 sm:p-5 shadow-lg border border-emerald-200 space-y-3">
      <div className="text-sm font-semibold text-emerald-900">Choose clothing type</div>
      <div className="grid grid-cols-1 gap-2">
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => setActive(o.id)}
            className={[
              'w-full text-left rounded-xl border px-3 py-2 text-sm transition',
              active === o.id ? 'border-emerald-400 bg-emerald-50' : 'border-emerald-200 hover:bg-emerald-50/50',
            ].join(' ')}
          >
            {o.label}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-end gap-2 pt-1">
        <button className="rounded-lg border border-emerald-200 px-3 py-1.5 text-xs bg-white hover:bg-emerald-50 text-emerald-900" onClick={onCancel}>
          Cancel
        </button>
        <button
          className="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 text-xs"
          onClick={() => onConfirm(active)}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

/* ----- Icons (SVG) ----- */
function SparkleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" className={props.className || ''}>
      <path d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z" fill="currentColor" />
    </svg>
  );
}
function BoxIcon(props) {
  return (
    <svg viewBox="0 0 24 24" className={props.className || ''}>
      <path
        d="M12 2l8 4v12l-8 4-8-4V6l8-4zm0 2l-6 3 6 3 6-3-6-3zm-6 5v8l6 3V12l-6-3zm8 3v8l6-3V9l-6 3z"
        fill="currentColor"
      />
    </svg>
  );
}
function PersonIcon(props) {
  return (
    <svg viewBox="0 0 24 24" className={props.className || ''}>
      <path
        d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-4.33 0-8 2.17-8 4.5V21h16v-2.5C20 16.17 16.33 14 12 14z"
        fill="currentColor"
      />
    </svg>
  );
}
function ScissorsIcon(props) {
  return (
    <svg viewBox="0 0 24 24" className={props.className || ''}>
      <path
        d="M14.7 6.3a1 1 0 1 1 1.4 1.4L13.83 10l2.27 2.27a1 1 0 1 1-1.42 1.42L12.4 11.4l-2.3 2.3a3 3 0 1 1-1.41-1.41l2.3-2.3-2.3-2.3A3 3 0 1 1 10.1 6.3l2.3 2.3 2.3-2.3zM7 17a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0-8a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
        fill="currentColor"
      />
    </svg>
  );
}
function RocketIcon(props) {
  return (
    <svg viewBox="0 0 24 24" className={props.className || ''}>
      <path d="M5 14s2-6 9-9c0 0 1.5 3.5-1 7 0 0 3.5-1 7-1-3 7-9 9-9 9 0-3-6-6-6-6z" fill="currentColor" />
      <circle cx="15" cy="9" r="1.5" fill="#fff" />
    </svg>
  );
}
function SwapIcon(props) {
  return (
    <svg viewBox="0 0 24 24" className={props.className || ''}>
      <path d="M7 7h9l-2-2 1.4-1.4L20.8 7l-5.4 3.4L14 9l2-2H7V7zm10 10H8l2 2-1.4 1.4L3.2 17l5.4-3.4L10 15l-2 2h9v0z" fill="currentColor" />
    </svg>
  );
}
function PlayIcon(props) {
  return (
    <svg viewBox="0 0 24 24" className={props.className || ''}>
      <path d="M8 5v14l11-7z" fill="currentColor" />
    </svg>
  );
}

/* -------------------------------------------------------
   Export helpers
------------------------------------------------------- */
async function exportPng(url) {
  const img = await fetch(url).then((r) => r.blob()).then(createImageBitmap);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d', { alpha: true });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0);
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = 'studio-output.png';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/* -------------------------------------------------------
   Simple customizer
------------------------------------------------------- */
function EnhanceCustomizer({ initial, onChange, onComplete }) {
  return (
    <div className="rounded-2xl bg-white p-4 sm:p-5 shadow-lg border border-emerald-200 space-y-3">
      <div className="text-sm font-semibold text-emerald-900">Enhance Settings</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <label className="space-y-1">
          <span className="text-emerald-700">Style</span>
          <input
            defaultValue={initial?.photographyStyle || ''}
            onChange={() => {}}
            className="w-full rounded-lg border border-emerald-200 bg-white px-2 py-1 text-emerald-900"
            placeholder="studio product photography, 50mm"
          />
        </label>
        <label className="space-y-1">
          <span className="text-emerald-700">Background</span>
          <input
            defaultValue={initial?.background || ''}
            onChange={() => {}}
            className="w-full rounded-lg border border-emerald-200 bg-white px-2 py-1 text-emerald-900"
            placeholder="white seamless"
          />
        </label>
        <label className="space-y-1">
          <span className="text-emerald-700">Lighting</span>
          <input
            defaultValue={initial?.lighting || ''}
            onChange={() => {}}
            className="w-full rounded-lg border border-emerald-200 bg-white px-2 py-1 text-emerald-900"
            placeholder="softbox, gentle reflections"
          />
        </label>
        <label className="space-y-1">
          <span className="text-emerald-700">Colors</span>
          <input
            defaultValue={initial?.colorStyle || ''}
            onChange={() => {}}
            className="w-full rounded-lg border border-emerald-200 bg-white px-2 py-1 text-emerald-900"
            placeholder="neutral whites, subtle grays"
          />
        </label>
      </div>
      <div className="flex items-center justify-end gap-2 pt-1">
        <button className="rounded-lg border border-emerald-200 px-3 py-1.5 text-xs bg-white hover:bg-emerald-50 text-emerald-900" onClick={() => onComplete(initial || {})}>
          Run
        </button>
      </div>
    </div>
  );
}
