// pages/dashboard.js
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';

/* -------------------------------------------------------
   Theme helpers
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
  const keys = ['image', 'image_url', 'output', 'result', 'url', 'variants'];
  for (const k of keys) {
    const v = obj[k];
    if (!v) continue;
    if (Array.isArray(v)) return v[0];
    return v;
  }
  return '';
};

/* -------------------------------------------------------
   Presets (Enhance remains unchanged – for completeness)
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
      outputQuality: '4k sharp',
    },
    preview: '/clean-studio.webp',
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
      outputQuality: '4k',
    },
    preview: '/desert-tones.webp',
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
      outputQuality: '4k print',
    },
    preview: '/editorial-beige.webp',
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
      outputQuality: '4k',
    },
    preview: '/slate-contrast.webp',
  },
];

/* -------------------------------------------------------
   Toasts
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
      close: () => setItems((s) => s.filter((it) => it.id !== id)),
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
            className="rounded-xl border border-slate-200 bg-white shadow-lg p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-slate-800">{t.msg}</div>
              <button className="text-xs text-slate-500 hover:text-slate-800" onClick={() => onClose(t.id)}>✕</button>
            </div>
            {typeof t.progress === 'number' && (
              <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
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
   Groups/Tools
------------------------------------------------------- */
const GROUPS = [
  { id: 'product', label: 'Product', icon: BoxIcon },
  { id: 'people', label: 'AI Try-On', icon: HangerIcon },
];

const PRODUCT_TOOLS = [
  { id: 'removeBg', label: 'Remove BG', icon: ScissorsIcon },
  { id: 'enhance', label: 'Enhance', icon: RocketIcon },
];

// People group now has only Try-On (without person photo)
const PEOPLE_TOOLS = [
  { id: 'tryon', label: 'Try-On (No Model)', icon: HangerIcon },
];

/* -------------------------------------------------------
   Dashboard
------------------------------------------------------- */
export default function Dashboard() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const router = useRouter();
  const toasts = useToasts();

  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState('people');
  const [tool, setTool] = useState('tryon');
  const [plan, setPlan] = useState('Free');

  // single-file area
  const [file, setFile] = useState(null);
  const [localUrl, setLocalUrl] = useState('');
  const [imageData, setImageData] = useState('');
  const [resultUrl, setResultUrl] = useState('');

  // Try-On specific controls (client options that map to /api/tryon.js)
  const [pieceType, setPieceType] = useState('upper'); // upper | lower | dress
  const [numImages, setNumImages] = useState(1); // 1..3 (API clamps)
  const [aspect, setAspect] = useState('match_input_image');
  const [seed, setSeed] = useState('');
  const [guidance, setGuidance] = useState(3.5);
  const [safety, setSafety] = useState(2);

  // Enhance modal
  const [pendingEnhancePreset, setPendingEnhancePreset] = useState(null);
  const [showEnhance, setShowEnhance] = useState(false);

  const [phase, setPhase] = useState('idle'); // idle|processing|ready|error
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [history, setHistory] = useState([]);

  const dropRef = useRef(null);
  const inputRef = useRef(null);

  /* ---------- auth/init ---------- */
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (user === undefined) return;
      if (!user) { router.replace('/login'); return; }
      try {
        const { data } = await supabase.from('Data').select('plan').eq('user_id', user.id).single();
        if (!mounted) return;
        setPlan(data?.plan || 'Free');
      } catch {}
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [user, router, supabase]);

  /* ---------- DnD / paste ---------- */
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
    setErr('');
    setPhase('idle');
    setImageData(await fileToDataURL(f));
  };

  /* ---------- computed ---------- */
  const frameStyle = useMemo(() => {
    return {
      background: `linear-gradient(35deg, ${hexToRGBA('#DFFBE6', 1)}, ${hexToRGBA('#FFFADB', 1)})`,
      borderRadius: 20,
      padding: 16,
      boxShadow: '0 18px 50px rgba(0,0,0,.08), 0 6px 18px rgba(0,0,0,.05)',
      transition: 'all .25s ease',
    };
  }, []);

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
  // برومبت Try-On بدون صورة شخص: إخراج “on-body style mannequin/editorial” من نفس القطعة
  const buildTryOnPrompt = (type) => {
    const scope =
      type === 'upper' ? 'Render the UPER garment realistically on an editorial ghost-mannequin torso.'
      : type === 'lower' ? 'Render the LOWER garment on an editorial ghost-mannequin waist/legs.'
      : 'Render a FULL dress on an editorial ghost-mannequin body.';
    return [
      'Virtual try-on result WITHOUT providing a person image.',
      scope,
      'Use the uploaded garment EXACTLY: preserve fabric, color, pattern, buttons, collar, pockets, and logos.',
      'Correct scaling & alignment, accurate neckline/sleeves/hem geometry, natural cloth drape with realistic shadows and wrinkles.',
      'Simple neutral studio background, soft light, no extra accessories, no text or watermark.',
      'High-detail, sharp, 4k realistic output.',
    ].join(' ');
  };

  const buildEnhancePrompt = (f) =>
    [
      f?.photographyStyle,
      `background: ${f?.background}`,
      `lighting: ${f?.lighting}`,
      `colors: ${f?.colorStyle}`,
      f?.realism,
      `output: ${f?.outputQuality}`,
    ].filter(Boolean).join(', ');

  /* ---------- runners ---------- */
  const [compare, setCompare] = useState(false);
  const [compareOpacity, setCompareOpacity] = useState(50);

  const runRemoveBg = useCallback(async () => {
    if (!file) return setErr('Pick an image first.');
    setBusy(true); setErr(''); setPhase('processing');
    const t = toasts.push('Removing background…', { progress: 8 });
    let adv = 8; const iv = setInterval(() => { adv = Math.min(adv + 6, 88); t.update({ progress: adv }); }, 500);
    try {
      const r = await fetch('/api/remove-bg', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || 'remove-bg failed');
      const out = pickFirstUrl(j); if (!out) throw new Error('No output from remove-bg');
      setResultUrl(out);
      setHistory((h) => [{ tool: 'Remove BG', inputThumb: localUrl, outputUrl: out, ts: Date.now() }, ...h].slice(0, 24));
      setPhase('ready'); t.update({ progress: 100, msg: 'Background removed ✓' });
      setTimeout(() => t.close(), 700);
    } catch (e) {
      console.error(e); setPhase('error'); setErr('Failed to process.');
      t.update({ msg: 'Remove BG failed', type: 'error' }); setTimeout(() => t.close(), 1400);
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
        body: JSON.stringify({ imageUrl, selections, prompt, plan, user_email: user.email }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || 'enhance failed');
      const out = pickFirstUrl(j); if (!out) throw new Error('No output from enhance');
      setResultUrl(out);
      setHistory((h) => [{ tool: 'Enhance', inputThumb: localUrl, outputUrl: out, ts: Date.now() }, ...h].slice(0, 24));
      setPhase('ready'); t.update({ progress: 100, msg: 'Enhanced ✓' }); setTimeout(() => t.close(), 700);
    } catch (e) {
      console.error(e); setPhase('error'); setErr('Failed to process.');
      t.update({ msg: 'Enhance failed', type: 'error' }); setTimeout(() => t.close(), 1400);
    } finally { clearInterval(iv); setBusy(false); }
  }, [file, uploadToStorage, plan, user, localUrl, toasts]);

  const runTryOn = useCallback(async () => {
    if (!file) return setErr('Upload a clothing image first.');
    setBusy(true); setErr(''); setPhase('processing');

    const t = toasts.push('Generating Try-On…', { progress: 10 });
    let adv = 10; const iv = setInterval(() => { adv = Math.min(adv + 6, 88); t.update({ progress: adv }); }, 500);

    try {
      // 1) ارفع صورة الملابس لـ Storage لتحصل على URL عام
      const clothUrl = await uploadToStorage(file);

      // 2) ابنِ البرومبت
      const prompt = buildTryOnPrompt(pieceType);

      // 3) استدعاء API الخاص بك كما طلبت (لا نعدل api/tryon.js)
      const payload = {
        imageUrl: clothUrl,
        prompt,
        plan,
        user_email: user.email,
        // خيارات عميل جاهزة:
        num_images: numImages,
        seed: seed === '' ? undefined : Number(seed),
        aspect_ratio: aspect,
        guidance_scale: guidance,
        safety_tolerance: safety,
      };

      const r = await fetch('/api/tryon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || 'try-on failed');

      const out = pickFirstUrl(j); if (!out) throw new Error('No output from try-on');
      setResultUrl(out);
      setHistory((h) => [{ tool: 'Try-On', inputThumb: localUrl, outputUrl: out, ts: Date.now() }, ...h].slice(0, 24));
      setPhase('ready'); t.update({ progress: 100, msg: 'Try-On ✓' }); setTimeout(() => t.close(), 700);
    } catch (e) {
      console.error(e); setPhase('error'); setErr('Failed to process.');
      toasts.push('Try-On failed', { type: 'error' });
    } finally { clearInterval(iv); setBusy(false); }
  }, [file, pieceType, plan, user, uploadToStorage, numImages, seed, aspect, guidance, safety, toasts, localUrl]);

  const handleRun = () => {
    if (group === 'people' && tool === 'tryon') return runTryOn();
    if (group === 'product' && tool === 'removeBg') return runRemoveBg();
    if (group === 'product' && tool === 'enhance') return setShowEnhance(true);
  };

  const switchTool = (nextId) => {
    setTool(nextId);
    setResultUrl(''); setErr(''); setPhase('idle'); setCompare(false);
    setFile(null); setLocalUrl('');
  };

  const resetAll = () => {
    setFile(null); setLocalUrl(''); setResultUrl('');
    setErr(''); setPhase('idle'); setCompare(false);
  };

  /* ---------- UI ---------- */
  if (loading || user === undefined) {
    return (
      <main className="min-h-screen grid place-items-center bg-gradient-to-b from-emerald-50 to-yellow-50 text-slate-600">
        <div className="rounded-2xl bg-white/80 backdrop-blur px-4 py-3 border shadow-sm text-sm">Loading…</div>
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
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-yellow-50 text-slate-900">
      <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 md:gap-6 px-3 md:px-6 py-4 md:py-6">
        {/* Sidebar */}
        <aside className="rounded-2xl border border-emerald-200 bg-white shadow-sm sticky top-3 md:top-4 self-start h-fit">
          <div className="px-4 py-4 flex items-center gap-3 border-b border-emerald-100">
            <div className="grid place-items-center size-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow">
              <SparkleIcon className="w-4 h-4" />
            </div>
            <div className="font-semibold tracking-tight">AI Studio</div>
          </div>

          <div className="px-3 py-3">
            <div className="text-xs font-semibold text-slate-500 mb-1">Workspace</div>
            <div className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 p-1">
              {GROUPS.map((g) => {
                const Active = group === g.id;
                const Icon = g.icon;
                return (
                  <button
                    key={g.id}
                    onClick={() => { setGroup(g.id); switchTool(g.id === 'product' ? 'enhance' : 'tryon'); }}
                    className={[
                      'inline-flex items-center gap-2 py-1.5 px-3 rounded-full text-sm transition',
                      Active ? 'bg-emerald-600 text-white shadow'
                             : 'text-emerald-800 hover:bg-emerald-100'
                    ].join(' ')}
                  >
                    <Icon className="size-4" /> {g.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-3 pb-3">
            <div className="text-xs font-semibold text-slate-500 mb-1">Tools</div>
            <div className="space-y-1">
              {(group === 'product' ? PRODUCT_TOOLS : PEOPLE_TOOLS).map((t) => {
                const Active = tool === t.id;
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => switchTool(t.id)}
                    className={[
                      'w-full group flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm transition',
                      Active ? 'bg-white text-emerald-700 border border-emerald-300 shadow-sm'
                             : 'text-emerald-900 hover:bg-emerald-50 border border-transparent'
                    ].join(' ')}
                  >
                    <Icon className={['size-4', Active ? 'text-emerald-600' : 'text-emerald-500 group-hover:text-emerald-700'].join(' ')} />
                    <span className="truncate">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-4 py-3 border-t border-emerald-100">
            <div className="flex items-center gap-3">
              <div className="grid place-items-center size-10 rounded-full bg-emerald-100 text-emerald-700 font-bold">{initials}</div>
              <div className="text-sm">
                <div className="font-medium leading-tight">{user.user_metadata?.name || user.email}</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main column */}
        <section className="space-y-5 md:space-y-6">
          {/* Header / Flow */}
          <div className="rounded-2xl md:rounded-3xl border border-emerald-200 bg-white/90 backdrop-blur p-4 sm:p-5 md:p-6 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
                  {group === 'people' ? 'Try-On Flow (No Model)' : 'Quick Presets'}
                </h1>
                <p className="text-slate-600 text-xs sm:text-sm">
                  {group === 'people'
                    ? <>Step 1: upload clothing → Step 2: choose garment type → Step 3: set options → Run.</>
                    : <>Pick a preset or open <span className="font-semibold">Customize</span>.</>}
                </p>
              </div>

              {group === 'product' && (
                <button
                  onClick={() => { setTool('enhance'); setPendingEnhancePreset(null); setShowEnhance(true); }}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs sm:text-sm font-semibold hover:bg-slate-50"
                >
                  ✨ Customize Enhance
                </button>
              )}
            </div>

            {group === 'product' ? (
              <div className="mt-4">
                <div className="mb-2 text-[12px] font-semibold text-slate-700">Enhance</div>
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
            ) : (
              <TryOnOptions
                pieceType={pieceType}
                setPieceType={setPieceType}
                numImages={numImages}
                setNumImages={setNumImages}
                aspect={aspect}
                setAspect={setAspect}
                seed={seed}
                setSeed={setSeed}
                guidance={guidance}
                setGuidance={setGuidance}
                safety={safety}
                setSafety={setSafety}
              />
            )}
          </div>

          {/* Workbench */}
          <div className="grid gap-4 md:gap-6 lg:grid-cols-[1fr_340px]">
            {/* Canvas Panel */}
            <section className="rounded-2xl md:rounded-3xl border border-emerald-200 bg-white shadow-sm relative">
              <div className="flex flex-wrap items-center justify-between gap-3 px-3 sm:px-4 md:px-5 pt-3 md:pt-4">
                <div className="inline-flex rounded-full border border-emerald-300 bg-emerald-50 p-1">
                  {(group === 'product' ? PRODUCT_TOOLS : PEOPLE_TOOLS).map((it) => {
                    const Active = tool === it.id;
                    const Icon = it.icon;
                    return (
                      <button
                        key={it.id}
                        onClick={() => switchTool(it.id)}
                        className={[
                          'inline-flex items-center gap-2 py-1.5 px-3 rounded-full text-sm transition',
                          Active ? 'bg-emerald-600 text-white shadow' : 'text-emerald-900 hover:bg-emerald-100'
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
                  <button onClick={resetAll} className="text-xs px-2 py-1 rounded-lg border bg-white hover:bg-emerald-50">Reset</button>
                </div>
              </div>

              {/* Drop area (single) */}
              <div
                ref={dropRef}
                className="m-3 sm:m-4 md:m-5 min-h-[240px] sm:min-h-[300px] md:min-h-[360px] grid place-items-center rounded-2xl border-2 border-dashed border-emerald-300/70 bg-emerald-50 hover:bg-emerald-100 transition cursor-pointer"
                onClick={() => inputRef.current?.click()}
                title="Drag & drop / Click / Paste (Ctrl+V)"
              >
                <input
                  ref={inputRef}
                  type="file" accept="image/*" className="hidden"
                  onChange={async (e) => { const f = e.target.files?.[0]; if (f) await onPick(f); }}
                />
                {!localUrl && !resultUrl ? (
                  <div className="text-center text-emerald-800 text-sm">
                    <div className="mx-auto mb-3 grid place-items-center size-10 sm:size-12 rounded-full bg-white border border-emerald-200">⬆</div>
                    {tool === 'tryon'
                      ? 'Upload a clothing image (PNG/JPG). Transparent PNG preferred.'
                      : 'Drag & drop an image here, click to choose, or paste (Ctrl+V)'}
                  </div>
                ) : (
                  <div className="relative w-full h-full grid place-items-center p-2 sm:p-3">
                    {compare && localUrl && resultUrl ? (
                      <div className="relative max-w-full max-h-[70vh]">
                        <img src={resultUrl} alt="after" className="max-w-full max-h-[70vh] object-contain rounded-xl" />
                        <img src={localUrl} alt="before" style={{opacity: compareOpacity/100}}
                             className="absolute inset-0 w-full h-full object-contain rounded-xl pointer-events-none" />
                      </div>
                    ) : (
                      <img
                        src={resultUrl || localUrl}
                        alt="preview"
                        className="max-w-full max-h-[70vh] object-contain rounded-xl"
                        draggable={false}
                        loading="lazy"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 px-3 sm:px-4 md:px-5 pb-4 md:pb-5">
                <button
                  onClick={handleRun}
                  disabled={
                    busy || (
                      tool === 'tryon' ? (!file) :
                      tool === 'modelSwap' ? true :
                      !file
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white px-3 sm:px-4 py-2 text-sm font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {busy ? 'Processing…' : (<><PlayIcon className="size-4" /> Run {tool === 'tryon' ? 'Try-On' : (tool === 'removeBg' ? 'Remove BG' : 'Enhance')}</>)}
                </button>

                {resultUrl && (
                  <>
                    <button
                      onClick={() => exportPng(resultUrl)}
                      className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-white px-3 sm:px-4 py-2 text-sm font-semibold hover:bg-emerald-50"
                    >
                      ⬇ Download PNG
                    </button>
                    <a
                      href={resultUrl} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-white px-2.5 py-2 text-xs font-semibold hover:bg-emerald-50"
                    >
                      ↗ Open
                    </a>
                    <button
                      onClick={() => { navigator.clipboard.writeText(resultUrl).catch(()=>{}); }}
                      className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-white px-2.5 py-2 text-xs font-semibold hover:bg-emerald-50"
                    >
                      🔗 Copy URL
                    </button>

                    {localUrl && (
                      <>
                        <label className="inline-flex items-center gap-2 text-xs ml-1 sm:ml-2">
                          <input type="checkbox" checked={compare} onChange={(e)=>setCompare(e.target.checked)} />
                          Compare
                        </label>
                        {compare && (
                          <div className="flex items-center gap-2">
                            <input type="range" min={0} max={100} value={compareOpacity}
                              onChange={(e)=>setCompareOpacity(Number(e.target.value))} />
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
                    className="pointer-events-none absolute inset-0 rounded-2xl md:rounded-3xl grid place-items-center bg-white/60"
                  >
                    <div className="text-xs px-3 py-2 rounded-lg bg-white border shadow">Working…</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* Inspector */}
            <aside className="rounded-2xl md:rounded-3xl border border-emerald-200 bg-white shadow-sm p-4 md:pb-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900">Inspector</div>
                <span className="text-xs text-emerald-700">Tool: {tool}</span>
              </div>

              {/* Try-On summary */}
              {tool === 'tryon' && (
                <div className="space-y-3 mt-3 text-xs">
                  <div className="rounded-lg border p-3">
                    <div className="text-slate-600 mb-1">Clothing</div>
                    {localUrl ? (
                      <img src={localUrl} alt="cloth" className="w-full max-h-48 object-contain rounded-md border bg-emerald-50" />
                    ) : (
                      <div className="text-slate-400">— Upload a clothing image —</div>
                    )}
                  </div>

                  <div className="rounded-lg border p-3">
                    <div className="text-slate-600 mb-1">Type</div>
                    <div className="flex items-center justify-between">
                      <div className="text-slate-800 capitalize">{pieceType}</div>
                    </div>
                  </div>

                  {resultUrl && (
                    <div className="rounded-lg border p-3">
                      <div className="text-slate-600 mb-2">Result</div>
                      <img
                        src={resultUrl}
                        alt="final"
                        className="w-full max-h-64 object-contain rounded-md border bg-emerald-50"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Enhance inspector */}
              {tool === 'enhance' && (
                <div className="space-y-2 text-xs text-slate-600 mt-3">
                  <div>Choose a preset above or press <span className="font-semibold">Customize</span>.</div>
                  {resultUrl && (
                    <div className="mt-2 rounded-xl overflow-hidden border bg-emerald-50">
                      <div className="relative w-full min-h-[140px] grid place-items-center">
                        <img src={resultUrl} alt="final" className="max-w-full max-h-[38vh] object-contain" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </aside>
          </div>

          {/* History */}
          <div className="rounded-2xl md:rounded-3xl border border-emerald-200 bg-white shadow-sm p-4 md:p-5">
            <div className="text-sm font-semibold text-slate-900 mb-2">History</div>
            {history.length === 0 ? (
              <div className="text-xs text-slate-500 px-1 py-4">— No renders yet —</div>
            ) : (
              <>
                <div className="mb-2">
                  <button
                    onClick={() => setHistory([])}
                    className="text-xs px-2 py-1 rounded-lg border bg-white hover:bg-emerald-50"
                  >
                    Clear history
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {history.map((h, i) => (
                    <button
                      key={i}
                      onClick={() => setResultUrl(h.outputUrl)}
                      className="group relative rounded-xl overflow-hidden border border-emerald-200 hover:border-emerald-300 transition bg-emerald-50"
                    >
                      <img
                        src={h.outputUrl || h.inputThumb}
                        alt="hist"
                        className="w-full h-28 object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 text-[10px] px-2 py-1 bg-black/35 text-white backdrop-blur">
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
            <div className="absolute inset-0 bg-black/55" onClick={() => setShowEnhance(false)} />
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
      </AnimatePresence>

      {/* Toasts */}
      <ToastHost items={toasts.items} onClose={toasts.remove} />
    </main>
  );
}

/* -------------------------------------------------------
   Try-On Options Panel (No person image)
------------------------------------------------------- */
function TryOnOptions({
  pieceType, setPieceType,
  numImages, setNumImages,
  aspect, setAspect,
  seed, setSeed,
  guidance, setGuidance,
  safety, setSafety,
}) {
  return (
    <div className="mt-4 grid gap-3">
      <div className="text-[12px] font-semibold text-slate-700">Try-On Options</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Garment Type">
          <div className="inline-flex rounded-xl border border-emerald-200 bg-emerald-50 p-1">
            {['upper','lower','dress'].map((id) => (
              <button
                key={id}
                onClick={() => setPieceType(id)}
                className={[
                  'px-3 py-1.5 text-xs rounded-lg transition capitalize',
                  pieceType === id ? 'bg-white shadow text-emerald-900' : 'text-emerald-700 hover:bg-white'
                ].join(' ')}
              >
                {id}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Aspect Ratio">
          <select
            value={aspect}
            onChange={(e)=>setAspect(e.target.value)}
            className="w-full rounded-lg border border-emerald-200 bg-white px-2 py-1 text-xs"
          >
            <option value="match_input_image">Match input</option>
            <option value="1:1">1:1</option>
            <option value="3:4">3:4</option>
            <option value="4:5">4:5</option>
            <option value="9:16">9:16</option>
            <option value="16:9">16:9</option>
          </select>
        </Field>

        <Field label="Num Images">
          <input
            type="number"
            min={1}
            max={3}
            value={numImages}
            onChange={(e)=>setNumImages(Math.max(1, Math.min(3, Number(e.target.value) || 1)))}
            className="w-24 rounded-lg border border-emerald-200 bg-white px-2 py-1 text-xs"
          />
        </Field>

        <Field label="Seed (optional)">
          <input
            value={seed}
            onChange={(e)=>setSeed(e.target.value.replace(/[^\d\-]/g,''))}
            placeholder="e.g. 123"
            className="w-full rounded-lg border border-emerald-200 bg-white px-2 py-1 text-xs"
          />
        </Field>

        <Field label="Guidance">
          <Range value={guidance} onChange={setGuidance} min={1} max={8} step={0.1} />
        </Field>

        <Field label="Safety">
          <Range value={safety} onChange={setSafety} min={1} max={6} step={1} />
        </Field>
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   Reusable UI widgets
------------------------------------------------------- */
function PresetCard({ title, subtitle, onClick, preview, tag }) {
  const [broken, setBroken] = useState(false);
  const [loaded, setLoaded] = useState(false);
  if (broken) return null;

  return (
    <button
      onClick={onClick}
      className="group relative rounded-2xl overflow-hidden border border-emerald-200 hover:border-emerald-300 bg-white shadow-sm transition text-left hover:shadow-md"
    >
      <div className="relative w-full aspect-[4/3] bg-emerald-50">
        {!loaded && <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-emerald-50 via-white to-emerald-50" />}
        <img
          src={preview}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setBroken(true)}
        />
        {tag && (
          <span className="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full bg-emerald-700/90 text-white shadow">
            {tag}
          </span>
        )}
        <div className="absolute top-2 right-2 rounded-full bg-white/90 backdrop-blur px-2 py-1 text-[11px] border border-white shadow-sm">
          Use preset
        </div>
      </div>
      <div className="p-3">
        <div className="font-semibold">{title}</div>
        <div className="text-xs text-slate-500">{subtitle}</div>
      </div>
    </button>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex items-center justify-between gap-3 text-xs text-slate-700">
      <span className="min-w-28">{label}</span>
      <div className="flex-1">{children}</div>
    </label>
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
      <span className="w-12 text-right">{typeof value === 'number' ? value : ''}</span>
    </div>
  );
}

function StepBadge({ phase }) {
  const map = {
    idle: { label: 'Ready', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    processing: { label: 'Processing', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    ready: { label: 'Done', color: 'bg-emerald-200 text-emerald-900 border-emerald-300' },
    error: { label: 'Error', color: 'bg-rose-200 text-rose-900 border-rose-300' },
  };
  const it = map[phase] || map.idle;
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${it.color}`}>
      <span
        className={`inline-block size-2 rounded-full ${
          phase === 'processing' ? 'bg-slate-700 animate-pulse' : 'bg-slate-600'
        }`}
      />
      {it.label}
    </span>
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
function HangerIcon(props) {
  return (
    <svg viewBox="0 0 24 24" className={props.className || ''}>
      <path d="M12 6a2 2 0 112-2 2 2 0 01-2 2zm1 2.5l7.5 5.5a1 1 0 01-1.2 1.6L12 11l-7.3 4.6a1 1 0 11-1.2-1.6L11 8.5V8a1 1 0 112 0v.5z" fill="currentColor"/>
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
   Simple Enhance Customizer (unchanged)
------------------------------------------------------- */
function EnhanceCustomizer({ initial, onChange, onComplete }) {
  return (
    <div className="rounded-2xl bg-white p-4 sm:p-5 shadow border space-y-3">
      <div className="text-sm font-semibold">Enhance Settings</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <label className="space-y-1">
          <span className="text-slate-600">Style</span>
          <input
            defaultValue={initial?.photographyStyle || ''}
            onChange={() => {}}
            className="w-full rounded-lg border px-2 py-1"
            placeholder="studio product photography, 50mm"
          />
        </label>
        <label className="space-y-1">
          <span className="text-slate-600">Background</span>
          <input
            defaultValue={initial?.background || ''}
            onChange={() => {}}
            className="w-full rounded-lg border px-2 py-1"
            placeholder="white seamless"
          />
        </label>
        <label className="space-y-1">
          <span className="text-slate-600">Lighting</span>
          <input
            defaultValue={initial?.lighting || ''}
            onChange={() => {}}
            className="w-full rounded-lg border px-2 py-1"
            placeholder="softbox, gentle reflections"
          />
        </label>
        <label className="space-y-1">
          <span className="text-slate-600">Colors</span>
          <input
            defaultValue={initial?.colorStyle || ''}
            onChange={() => {}}
            className="w-full rounded-lg border px-2 py-1"
            placeholder="neutral whites, subtle grays"
          />
        </label>
      </div>
      <div className="flex items-center justify-end gap-2 pt-1">
        <button className="rounded-lg border px-3 py-1.5 text-xs" onClick={() => onComplete(initial || {})}>
          Run
        </button>
      </div>
    </div>
  );
}
