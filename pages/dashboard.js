// pages/dashboard.js
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';

/* -----------------------------------------------------------------------------
   Calm, modern, mobile-first Try-On + Enhance Dashboard
   - Female/Male only
   - Clear stepper (progress bar)
   - Preset Cards + obvious Customize
   - Responsive for phone, tablet, desktop
   - Soft, soothing palette (mint/sky/stone) + subtle motion
   - Compatible with /api/tryon.js and /api/enhance.js (no backend changes)
-------------------------------------------------------------------------------- */

/* ----------------------------------
   Small helpers
---------------------------------- */
const STORAGE_BUCKET = 'img';

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
    if (typeof v === 'string') return v;
  }
  return '';
};

/* ----------------------------------
   Toasts with progress
---------------------------------- */
function useToasts() {
  const [items, setItems] = useState([]);
  const push = (msg, opts = {}) => {
    const id = Math.random().toString(36).slice(2);
    const item = {
      id,
      msg,
      type: opts.type || 'info',
      progress: typeof opts.progress === 'number' ? opts.progress : null,
    };
    setItems((s) => [...s, item]);
    return {
      id,
      update: (patch) =>
        setItems((s) => s.map((it) => (it.id === id ? { ...it, ...patch } : it))),
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
            className="rounded-xl border border-stone-200 bg-white shadow-lg p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-stone-800">{t.msg}</div>
              <button
                className="text-xs text-stone-500 hover:text-stone-800"
                onClick={() => onClose(t.id)}
              >
                ✕
              </button>
            </div>
            {typeof t.progress === 'number' && (
              <div className="mt-2 h-1.5 rounded-full bg-stone-100 overflow-hidden">
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

/* ----------------------------------
   TRY-ON Presets (pose + bg + lighting + style)
---------------------------------- */
const TRYON_PRESETS = [
  {
    id: 'studio-front',
    title: 'Studio Front',
    subtitle: 'Clean • eye-level • 50mm',
    personaNote: 'Neutral studio, true-to-color',
    config: {
      pose: 'front facing',
      background: 'white seamless studio',
      lighting: 'large softbox key + fill, gentle reflections',
      style: 'e-commerce catalog, accurate color, minimal',
      camera: '50mm eye-level',
      colorMood: 'neutral whites & gentle grays',
    },
    preview: '/tryon/studio-front.webp',
    tag: 'Popular',
  },
  {
    id: 'editorial-34',
    title: 'Editorial 3/4',
    subtitle: 'Magazine • directional',
    personaNote: 'Crisp shadows, subtle grain',
    config: {
      pose: '3/4 semi-profile',
      background: 'matte beige editorial backdrop',
      lighting: 'directional key with soft fill, controlled shadows',
      style: 'editorial fashion, subtle grain',
      camera: '85mm portrait',
      colorMood: 'warm neutral',
    },
    preview: '/tryon/editorial-34.webp',
    tag: 'Editorial',
  },
  {
    id: 'lifestyle-soft',
    title: 'Lifestyle Soft',
    subtitle: 'Daylight • indoor loft',
    personaNote: 'Natural vibe, shallow depth',
    config: {
      pose: 'casual stance, relaxed arms',
      background: 'sunlit loft interior, soft daylight',
      lighting: 'window light + fill, soft rim',
      style: 'lifestyle candid',
      camera: '35mm eye-level',
      colorMood: 'soft warm daylight',
    },
    preview: '/tryon/lifestyle-soft.webp',
    tag: 'Lifestyle',
  },
  {
    id: 'runway-hero',
    title: 'Runway Hero',
    subtitle: 'High-fashion • spotlight',
    personaNote: 'Bold, high contrast',
    config: {
      pose: 'runway walk stance',
      background: 'dark runway with soft spotlight',
      lighting: 'hard key + rim, strong contrast',
      style: 'runway fashion, dramatic',
      camera: '70mm slightly low angle',
      colorMood: 'cool slate & black',
    },
    preview: '/tryon/runway-hero.webp',
    tag: 'High-Contrast',
  },
];

/* ----------------------------------
   ENHANCE Presets (fresh UI, same API)
---------------------------------- */
const ENHANCE_PRESETS = [
  {
    id: 'clean',
    title: 'Clean Catalog',
    subtitle: 'True color • soft light',
    config: {
      photographyStyle: 'catalog product photography, 50mm',
      background: 'white seamless',
      lighting: 'softbox + fill, gentle reflections',
      colorStyle: 'neutral whites, accurate color',
      realism: 'high-fidelity',
      outputQuality: '4k sharp',
    },
    preview: '/enhance/clean.webp',
    tag: 'Catalog',
  },
  {
    id: 'beige-editorial',
    title: 'Beige Editorial',
    subtitle: 'Warm matte • directional',
    config: {
      photographyStyle: 'editorial still life',
      background: 'matte beige',
      lighting: 'directional key with soft fill',
      colorStyle: 'warm neutrals',
      realism: 'photo-real',
      outputQuality: '4k',
    },
    preview: '/enhance/beige.webp',
    tag: 'Editorial',
  },
  {
    id: 'slate-hero',
    title: 'Slate Hero',
    subtitle: 'Contrast • rim light',
    config: {
      photographyStyle: 'hero product shot',
      background: 'charcoal slate',
      lighting: 'hard key + rim, controlled specular',
      colorStyle: 'cool slate, deep blacks',
      realism: 'high-fidelity',
      outputQuality: '4k',
    },
    preview: '/enhance/slate.webp',
    tag: 'Bold',
  },
  {
    id: 'cinematic-warm',
    title: 'Cinematic Warm',
    subtitle: 'Golden hour • soft',
    config: {
      photographyStyle: 'cinematic product photo',
      background: 'warm beige backdrop',
      lighting: 'golden hour, soft shadows',
      colorStyle: 'sand, amber, beige',
      realism: 'crisp textures',
      outputQuality: '4k',
    },
    preview: '/enhance/cinematic.webp',
    tag: 'Cinematic',
  },
];

/* ----------------------------------
   Root Dashboard
---------------------------------- */
export default function Dashboard() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const router = useRouter();
  const toasts = useToasts();

  // app / auth state
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState('Free');

  // tool: 'tryon' | 'enhance'
  const [tool, setTool] = useState('tryon');

  // shared single-file area
  const [file, setFile] = useState(null);
  const [localUrl, setLocalUrl] = useState('');
  const [imageData, setImageData] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [variants, setVariants] = useState([]);

  // try-on options (simplified, user-friendly)
  const [gender, setGender] = useState('female'); // female | male (only)
  const [selectedPreset, setSelectedPreset] = useState('studio-front');

  // customize (clear & minimal)
  const [showCustomize, setShowCustomize] = useState(false);
  const [custom, setCustom] = useState({
    pose: 'front facing',
    background: 'white seamless studio',
    lighting: 'softbox + fill',
    camera: '50mm eye-level',
    colorMood: 'neutral, accurate color',
    extras: '',
  });

  // advanced options (collapsed by default)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [numImages, setNumImages] = useState(1); // 1..3
  const [aspect, setAspect] = useState('match_input_image');
  const [seed, setSeed] = useState('');
  const [guidance, setGuidance] = useState(3.7);
  const [safety, setSafety] = useState(2);

  // enhance customizer
  const [showEnhanceModal, setShowEnhanceModal] = useState(false);
  const [pendingEnhancePreset, setPendingEnhancePreset] = useState(null);

  // run state
  const [phase, setPhase] = useState('idle'); // idle|processing|ready|error
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  // history
  const [history, setHistory] = useState([]);

  // drop/pick
  const dropRef = useRef(null);
  const inputRef = useRef(null);

  /* ---------- auth/init ---------- */
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (user === undefined) return;
      if (!user) {
        router.replace('/login');
        return;
      }
      try {
        const { data } = await supabase
          .from('Data')
          .select('plan')
          .eq('user_id', user.id)
          .single();
        if (!mounted) return;
        setPlan(data?.plan || 'Free');
      } catch {}
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [user, router, supabase]);

  /* ---------- drag & drop / paste ---------- */
  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;
    const over = (e) => {
      e.preventDefault();
      el.classList.add('ring-2', 'ring-emerald-300');
    };
    const leave = () => el.classList.remove('ring-2', 'ring-emerald-300');
    const drop = async (e) => {
      e.preventDefault();
      leave();
      const f = e.dataTransfer.files?.[0];
      if (f) await onPick(f);
    };
    el.addEventListener('dragover', over);
    el.addEventListener('dragleave', leave);
    el.addEventListener('drop', drop);
    const onPaste = async (e) => {
      const item = Array.from(e.clipboardData?.items || []).find((it) =>
        it.type.startsWith('image/')
      );
      const f = item?.getAsFile?.();
      if (f) await onPick(f);
    };
    window.addEventListener('paste', onPaste);
    return () => {
      el.removeEventListener('dragover', over);
      el.removeEventListener('dragleave', leave);
      el.removeEventListener('drop', drop);
      window.removeEventListener('paste', onPaste);
    };
  }, [tool]);

  const onPick = async (f) => {
    setFile(f);
    setLocalUrl(URL.createObjectURL(f));
    setResultUrl('');
    setVariants([]);
    setErr('');
    setPhase('idle');
    setImageData(await fileToDataURL(f));
  };

  /* ---------- supabase storage ---------- */
  const uploadToStorage = useCallback(
    async (f) => {
      if (!f) throw new Error('no file');
      const ext = (f.name?.split('.').pop() || 'png').toLowerCase();
      const path = `${user.id}/${Date.now()}_${Math.random()
        .toString(36)
        .slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, f, {
          cacheControl: '3600',
          upsert: false,
          contentType: f.type || 'image/*',
        });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      if (!data?.publicUrl) throw new Error('no public url');
      return data.publicUrl;
    },
    [supabase, user]
  );

  /* ---------- progress / stepper ---------- */
  const stepIndex = useMemo(() => {
    // 0 Upload, 1 Gender, 2 Style (preset/custom), 3 Generate
    if (!file) return 0;
    if (!gender) return 1;
    if (!selectedPreset && !custom) return 2;
    return 3;
  }, [file, gender, selectedPreset, custom]);

  /* ---------- prompt builders ---------- */
  const resolvePresetConfig = useCallback(() => {
    const found = TRYON_PRESETS.find((p) => p.id === selectedPreset)?.config;
    return found || {};
  }, [selectedPreset]);

  const buildPersonaLine = (g) =>
    g === 'male'
      ? 'photorealistic adult male model, light grooming'
      : 'photorealistic adult female model, natural makeup';

  // Build try-on prompt (no person image; we create a realistic human)
  const buildTryOnPrompt = () => {
    const preset = resolvePresetConfig();
    const persona = buildPersonaLine(gender);

    const cfg = {
      pose: custom?.pose || preset.pose,
      background: custom?.background || preset.background,
      lighting: custom?.lighting || preset.lighting,
      style: preset.style || 'editorial fashion',
      camera: custom?.camera || preset.camera || '50mm eye-level',
      colorMood: custom?.colorMood || preset.colorMood || 'neutral',
      extras: custom?.extras || '',
    };

    return [
      'Photorealistic AI try-on. Render a REAL human model (no user photo provided).',
      `${persona}, ${cfg.pose}.`,
      'Use the uploaded garment EXACTLY: preserve fabric, color, pattern, buttons, collar, pockets, logos.',
      'Natural fit & drape: correct scale & alignment, accurate neckline/sleeves/hem geometry, realistic wrinkles & self-shadowing.',
      `Background: ${cfg.background}.`,
      `Lighting: ${cfg.lighting}.`,
      `Style: ${cfg.style}.`,
      `Camera: ${cfg.camera}. Colors: ${cfg.colorMood}.`,
      cfg.extras ? `Aesthetic details: ${cfg.extras}.` : '',
      'No extra accessories, no text/watermark. High detail, sharp, 4k output.',
    ]
      .filter(Boolean)
      .join(' ');
  };

  const buildEnhancePrompt = (f) =>
    [
      f?.photographyStyle,
      `background: ${f?.background}`,
      `lighting: ${f?.lighting}`,
      `colors: ${f?.colorStyle}`,
      f?.realism,
      `output: ${f?.outputQuality}`,
    ]
      .filter(Boolean)
      .join(', ');

  /* ---------- runners ---------- */
  const runTryOn = useCallback(async () => {
    if (!file) return setErr('Please upload a clothing image first.');
    setBusy(true);
    setErr('');
    setPhase('processing');

    const t = toasts.push('Generating Try-On…', { progress: 10 });
    let adv = 10;
    const iv = setInterval(() => {
      adv = Math.min(adv + 6, 88);
      t.update({ progress: adv });
    }, 500);

    try {
      const clothUrl = await uploadToStorage(file);
      const prompt = buildTryOnPrompt();

      const payload = {
        imageUrl: clothUrl,
        prompt,
        plan,
        user_email: user.email,
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

      const out = pickFirstUrl(j);
      setResultUrl(out || '');
      setVariants(Array.isArray(j?.variants) ? j.variants : out ? [out] : []);
      setHistory((h) => [{ tool: 'Try-On', outputUrl: out || '', ts: Date.now() }, ...h].slice(0, 36));
      setPhase('ready');
      t.update({ progress: 100, msg: 'Try-On ✓' });
      setTimeout(() => t.close(), 700);
    } catch (e) {
      console.error(e);
      setPhase('error');
      setErr('Failed to generate try-on.');
      toasts.push('Try-On failed', { type: 'error' });
    } finally {
      clearInterval(iv);
      setBusy(false);
    }
  }, [
    file,
    plan,
    user,
    uploadToStorage,
    numImages,
    seed,
    aspect,
    guidance,
    safety,
    toasts,
    gender,
    selectedPreset,
    custom,
  ]);

  const runEnhance = useCallback(
    async (selections) => {
      if (!file) return setErr('Please upload an image first.');
      setBusy(true);
      setErr('');
      setPhase('processing');

      const imageUrl = await uploadToStorage(file);
      const prompt = buildEnhancePrompt(selections || pendingEnhancePreset || {});

      const t = toasts.push('Enhancing…', { progress: 12 });
      let adv = 12;
      const iv = setInterval(() => {
        adv = Math.min(adv + 6, 88);
        t.update({ progress: adv });
      }, 500);

      try {
        const r = await fetch('/api/enhance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageUrl,
            selections: selections || pendingEnhancePreset || {},
            prompt,
            plan,
            user_email: user.email,
          }),
        });
        const j = await r.json();
        if (!r.ok) throw new Error(j?.error || 'enhance failed');

        const out = pickFirstUrl(j);
        if (!out) throw new Error('No output from enhance');
        setResultUrl(out);
        setVariants([]);
        setHistory((h) => [{ tool: 'Enhance', outputUrl: out, ts: Date.now() }, ...h].slice(0, 36));
        setPhase('ready');
        t.update({ progress: 100, msg: 'Enhanced ✓' });
        setTimeout(() => t.close(), 700);
      } catch (e) {
        console.error(e);
        setPhase('error');
        setErr('Failed to enhance image.');
        toasts.push('Enhance failed', { type: 'error' });
      } finally {
        clearInterval(iv);
        setBusy(false);
      }
    },
    [file, uploadToStorage, pendingEnhancePreset, plan, user, toasts]
  );

  /* ---------- actions ---------- */
  const handleRun = () => {
    if (tool === 'tryon') return runTryOn();
    if (tool === 'enhance') return setShowEnhanceModal(true);
  };

  const resetAll = () => {
    setFile(null);
    setLocalUrl('');
    setImageData('');
    setResultUrl('');
    setVariants([]);
    setErr('');
    setPhase('idle');
  };

  /* ---------- UI scaffolding ---------- */
  if (loading || user === undefined) {
    return (
      <main className="min-h-screen grid place-items-center bg-gradient-to-b from-sky-50 to-emerald-50 text-stone-600">
        <div className="rounded-2xl bg-white/80 backdrop-blur px-4 py-3 border shadow-sm text-sm">
          Loading…
        </div>
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
    <main className="min-h-screen bg-gradient-to-b from-sky-50 to-emerald-50 text-stone-900">
      {/* Top bar */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/70 border-b border-stone-200">
        <div className="mx-auto max-w-7xl px-3 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid place-items-center size-9 rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 text-white shadow">
              <SparkleIcon className="w-4 h-4" />
            </div>
            <div className="font-semibold tracking-tight">AI Studio</div>
          </div>
          <nav className="inline-flex rounded-full border border-stone-200 bg-white p-1">
            {[
              { id: 'tryon', label: 'Try-On' },
              { id: 'enhance', label: 'Enhance' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTool(t.id);
                  setResultUrl('');
                  setVariants([]);
                  setErr('');
                  setPhase('idle');
                }}
                className={[
                  'px-3 py-1.5 text-sm rounded-full transition',
                  tool === t.id ? 'bg-stone-900 text-white shadow' : 'text-stone-700 hover:bg-stone-100',
                ].join(' ')}
              >
                {t.label}
              </button>
            ))}
          </nav>
          <div className="grid place-items-center size-9 rounded-full bg-stone-100 text-stone-700 font-bold">
            {initials}
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto max-w-7xl px-3 md:px-6 py-4 md:py-6 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 md:gap-6">
        {/* Main */}
        <section className="space-y-5 md:space-y-6">
          {/* Stepper + Basic Controls */}
          <div className="rounded-2xl md:rounded-3xl border border-stone-200 bg-white/90 backdrop-blur p-4 sm:p-5 md:p-6 shadow-sm">
            {/* Stepper */}
            <Stepper
              steps={['Upload', 'Gender', 'Style', 'Generate']}
              index={stepIndex}
            />

            {tool === 'tryon' ? (
              <div className="mt-4 grid gap-4">
                {/* Gender Toggle */}
                <div className="grid gap-2">
                  <div className="text-[12px] font-semibold text-stone-700">Gender</div>
                  <div className="inline-flex rounded-xl border border-emerald-200 bg-emerald-50 p-1 w-fit">
                    {['female', 'male'].map((g) => (
                      <button
                        key={g}
                        onClick={() => setGender(g)}
                        className={[
                          'px-3 py-1.5 text-xs rounded-lg transition capitalize',
                          gender === g ? 'bg-white shadow text-stone-900' : 'text-emerald-800 hover:bg-white',
                        ].join(' ')}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Presets Row */}
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <div className="text-[12px] font-semibold text-stone-700">Style Presets</div>
                    <button
                      onClick={() => setShowCustomize(true)}
                      className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-stone-50"
                    >
                      🎛️ Customize
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {TRYON_PRESETS.map((p) => (
                      <PresetCard
                        key={p.id}
                        active={selectedPreset === p.id}
                        title={p.title}
                        subtitle={p.subtitle}
                        note={p.personaNote}
                        preview={p.preview}
                        tag={p.tag}
                        onClick={() => setSelectedPreset(p.id)}
                      />
                    ))}
                  </div>
                </div>

                {/* Advanced options (collapsible) */}
                <div className="rounded-xl border border-stone-200 bg-white">
                  <button
                    onClick={() => setShowAdvanced((v) => !v)}
                    className="w-full px-3 py-2 text-xs font-semibold flex items-center justify-between"
                  >
                    Advanced Options
                    <span className="text-stone-500">{showAdvanced ? '—' : '+'}</span>
                  </button>
                  <AnimatePresence initial={false}>
                    {showAdvanced && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-3 pb-3 grid grid-cols-1 sm:grid-cols-2 gap-3"
                      >
                        <Field label="# Images">
                          <input
                            type="number"
                            min={1}
                            max={3}
                            value={numImages}
                            onChange={(e) =>
                              setNumImages(Math.max(1, Math.min(3, Number(e.target.value) || 1)))
                            }
                            className="w-28 rounded-lg border border-stone-300 bg-white px-2 py-1 text-xs"
                          />
                        </Field>
                        <Field label="Aspect ratio">
                          <select
                            value={aspect}
                            onChange={(e) => setAspect(e.target.value)}
                            className="w-full rounded-lg border border-stone-300 bg-white px-2 py-1 text-xs"
                          >
                            <option value="match_input_image">Match input</option>
                            <option value="1:1">1:1</option>
                            <option value="3:4">3:4</option>
                            <option value="4:5">4:5</option>
                            <option value="9:16">9:16</option>
                            <option value="16:9">16:9</option>
                          </select>
                        </Field>
                        <Field label="Seed (optional)">
                          <input
                            value={seed}
                            onChange={(e) => setSeed(e.target.value.replace(/[^\d\-]/g, ''))}
                            placeholder="e.g. 123"
                            className="w-full rounded-lg border border-stone-300 bg-white px-2 py-1 text-xs"
                          />
                        </Field>
                        <Field label="Guidance">
                          <Range value={guidance} onChange={setGuidance} min={1} max={8} step={0.1} />
                        </Field>
                        <Field label="Safety">
                          <Range value={safety} onChange={setSafety} min={1} max={6} step={1} />
                        </Field>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              /* ENHANCE top section */
              <div className="mt-4 grid gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[12px] font-semibold text-stone-700">Enhance Presets</div>
                    <div className="text-xs text-stone-500">
                      Pick a preset or press <span className="font-semibold">Customize</span>.
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setPendingEnhancePreset(null);
                      setShowEnhanceModal(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-stone-50"
                  >
                    ✨ Customize Enhance
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {ENHANCE_PRESETS.map((p) => (
                    <PresetCard
                      key={p.id}
                      active={pendingEnhancePreset?.id === p.id}
                      title={p.title}
                      subtitle={p.subtitle}
                      note=""
                      preview={p.preview}
                      tag={p.tag}
                      onClick={() => {
                        setPendingEnhancePreset({ id: p.id, ...p.config });
                        setShowEnhanceModal(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Workbench (drop area + result + actions) */}
          <section className="rounded-2xl md:rounded-3xl border border-stone-200 bg-white shadow-sm relative">
            {/* Drop area */}
            <div
              ref={dropRef}
              className="m-3 sm:m-4 md:m-5 min-h-[240px] sm:min-h-[300px] md:min-h-[360px] grid place-items-center rounded-2xl border-2 border-dashed border-emerald-300/70 bg-emerald-50 hover:bg-emerald-100 transition cursor-pointer"
              onClick={() => inputRef.current?.click()}
              title="Drag & drop / Click / Paste (Ctrl+V)"
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
              {!localUrl && !resultUrl ? (
                <div className="text-center text-emerald-900 text-sm">
                  <div className="mx-auto mb-3 grid place-items-center size-10 sm:size-12 rounded-full bg-white border border-emerald-200">
                    ⬆
                  </div>
                  Upload a clothing/image file (PNG/JPG). Transparent PNG preferred.
                </div>
              ) : (
                <div className="relative w-full h-full grid place-items-center p-2 sm:p-3">
                  <img
                    src={resultUrl || localUrl}
                    alt="preview"
                    className="max-w-full max-h-[70vh] object-contain rounded-xl"
                    draggable={false}
                    loading="lazy"
                  />
                </div>
              )}
            </div>

            {/* Variants */}
            {variants?.length > 1 && (
              <div className="px-3 sm:px-4 md:px-5 pb-2">
                <div className="text-xs text-stone-600 mb-1">Variants</div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {variants.map((v, i) => (
                    <button
                      key={i}
                      onClick={() => setResultUrl(v)}
                      className={[
                        'shrink-0 w-24 h-24 rounded-lg overflow-hidden border',
                        resultUrl === v
                          ? 'border-emerald-500 ring-2 ring-emerald-300'
                          : 'border-emerald-200 hover:border-emerald-300',
                      ].join(' ')}
                      title={`Variant ${i + 1}`}
                    >
                      <img src={v} alt={`v${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 px-3 sm:px-4 md:px-5 pb-4 md:pb-5">
              <button
                onClick={tool === 'enhance' ? () => setShowEnhanceModal(true) : handleRun}
                disabled={busy || !file}
                className="inline-flex items-center gap-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white px-3 sm:px-4 py-2 text-sm font-semibold shadow-sm transition disabled:opacity-50"
              >
                {busy ? 'Processing…' : (
                  <>
                    <PlayIcon className="size-4" />
                    Run {tool === 'tryon' ? 'Try-On' : 'Enhance'}
                  </>
                )}
              </button>

              {resultUrl && (
                <>
                  <button
                    onClick={() => exportPng(resultUrl)}
                    className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-3 sm:px-4 py-2 text-sm font-semibold hover:bg-stone-50"
                  >
                    ⬇ Download PNG
                  </button>
                  <a
                    href={resultUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-2.5 py-2 text-xs font-semibold hover:bg-stone-50"
                  >
                    ↗ Open
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(resultUrl).catch(() => {});
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-2.5 py-2 text-xs font-semibold hover:bg-stone-50"
                  >
                    🔗 Copy URL
                  </button>
                </>
              )}

              <button
                onClick={resetAll}
                className="ml-auto text-xs px-2 py-1 rounded-lg border bg-white hover:bg-stone-50"
              >
                Reset
              </button>

              {!!err && <div className="text-xs text-rose-600">{err}</div>}
            </div>

            {/* busy overlay */}
            <AnimatePresence>
              {busy && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="pointer-events-none absolute inset-0 rounded-2xl md:rounded-3xl grid place-items-center bg-white/60"
                >
                  <div className="text-xs px-3 py-2 rounded-lg bg-white border shadow">
                    Working…
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* History */}
          <div className="rounded-2xl md:rounded-3xl border border-stone-200 bg-white shadow-sm p-4 md:p-5">
            <div className="text-sm font-semibold text-stone-900 mb-2">History</div>
            {history.length === 0 ? (
              <div className="text-xs text-stone-500 px-1 py-4">— No renders yet —</div>
            ) : (
              <>
                <div className="mb-2">
                  <button
                    onClick={() => setHistory([])}
                    className="text-xs px-2 py-1 rounded-lg border bg-white hover:bg-stone-50"
                  >
                    Clear history
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {history.map((h, i) => (
                    <button
                      key={i}
                      onClick={() => setResultUrl(h.outputUrl)}
                      className="group relative rounded-xl overflow-hidden border border-stone-200 hover:border-stone-300 transition bg-stone-50"
                    >
                      <img src={h.outputUrl} alt="hist" className="w-full h-28 object-cover" />
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

        {/* Inspector */}
        <aside className="rounded-2xl md:rounded-3xl border border-stone-200 bg-white shadow-sm p-4 md:pb-5 h-fit">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-stone-900">Inspector</div>
            <span className="text-xs text-stone-500 capitalize">Tool: {tool}</span>
          </div>

          {tool === 'tryon' ? (
            <div className="space-y-3 mt-3 text-xs">
              <div className="rounded-lg border p-3">
                <div className="text-stone-600 mb-1">Clothing</div>
                {localUrl ? (
                  <img
                    src={localUrl}
                    alt="cloth"
                    className="w-full max-h-48 object-contain rounded-md border bg-emerald-50"
                  />
                ) : (
                  <div className="text-stone-400">— Upload a clothing image —</div>
                )}
              </div>

              <div className="rounded-lg border p-3 grid grid-cols-2 gap-2">
                <Info label="Gender" value={gender} />
                <Info label="Preset" value={selectedPreset.replace('-', ' ')} />
                <Info label="Aspect" value={aspect} />
                <Info label="Guidance" value={String(guidance)} />
                <Info label="Safety" value={String(safety)} />
                <Info label="# Images" value={String(numImages)} />
                <Info label="Seed" value={seed || '—'} />
              </div>

              {resultUrl && (
                <div className="rounded-lg border p-3">
                  <div className="text-stone-600 mb-2">Result</div>
                  <img
                    src={resultUrl}
                    alt="final"
                    className="w-full max-h-64 object-contain rounded-md border bg-emerald-50"
                  />
                </div>
              )}

              <div className="pt-1">
                <button
                  onClick={handleRun}
                  disabled={busy || !file}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white px-3 py-2 text-sm font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {busy ? 'Processing…' : 'Run Try-On'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 mt-3 text-xs">
              <div className="rounded-lg border p-3">
                <div className="text-stone-600 mb-1">Image</div>
                {localUrl ? (
                  <img
                    src={localUrl}
                    alt="image"
                    className="w-full max-h-48 object-contain rounded-md border bg-sky-50"
                  />
                ) : (
                  <div className="text-stone-400">— Upload an image to enhance —</div>
                )}
              </div>
              {resultUrl && (
                <div className="rounded-lg border p-3">
                  <div className="text-stone-600 mb-2">Result</div>
                  <img
                    src={resultUrl}
                    alt="final"
                    className="w-full max-h-64 object-contain rounded-md border bg-sky-50"
                  />
                </div>
              )}
              <button
                onClick={() => setShowEnhanceModal(true)}
                disabled={busy || !file}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white px-3 py-2 text-sm font-semibold shadow-sm transition disabled:opacity-50"
              >
                {busy ? 'Processing…' : 'Run Enhance'}
              </button>
            </div>
          )}
        </aside>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCustomize && (
          <motion.div
            className="fixed inset-0 z-[100] grid place-items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/55" onClick={() => setShowCustomize(false)} />
            <div className="relative w-full max-w-2xl mx-3">
              <TryOnCustomizeModal
                initial={custom}
                onCancel={() => setShowCustomize(false)}
                onConfirm={(val) => {
                  setCustom(val);
                  setShowCustomize(false);
                }}
              />
            </div>
          </motion.div>
        )}

        {showEnhanceModal && (
          <motion.div
            className="fixed inset-0 z-[110] grid place-items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/55" onClick={() => setShowEnhanceModal(false)} />
            <div className="relative w-full max-w-3xl mx-3">
              <EnhanceCustomizer
                initial={pendingEnhancePreset || undefined}
                onCancel={() => setShowEnhanceModal(false)}
                onRun={(form) => {
                  setShowEnhanceModal(false);
                  setPendingEnhancePreset(form || {});
                  runEnhance(form || {});
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

/* ----------------------------------
   Components
---------------------------------- */
function Stepper({ steps, index }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        {steps.map((s, i) => {
          const done = i < index;
          const active = i === index;
          return (
            <div key={s} className="flex-1">
              <div className="flex items-center gap-2">
                <motion.div
                  layout
                  className={[
                    'size-6 rounded-full grid place-items-center border text-[11px] font-semibold',
                    done
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : active
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white text-stone-600 border-stone-300',
                  ].join(' ')}
                >
                  {done ? '✓' : i + 1}
                </motion.div>
                <div
                  className={[
                    'text-xs sm:text-[13px]',
                    done ? 'text-emerald-700' : active ? 'text-stone-900' : 'text-stone-600',
                  ].join(' ')}
                >
                  {s}
                </div>
              </div>
              {i < steps.length - 1 && (
                <motion.div layout className="h-1 mt-2 rounded-full bg-stone-200 overflow-hidden">
                  <motion.div
                    initial={false}
                    animate={{ width: i < index ? '100%' : '0%' }}
                    transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                    className="h-full bg-stone-900"
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

function Field({ label, children }) {
  return (
    <label className="flex items-center justify-between gap-3 text-xs text-stone-700">
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
        className="w-full accent-stone-900"
      />
      <span className="w-12 text-right">{typeof value === 'number' ? value : ''}</span>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-md border border-stone-200 bg-stone-50 px-2 py-1">
      <div className="text-[10px] text-stone-600">{label}</div>
      <div className="text-[11px] text-stone-900 capitalize">{value}</div>
    </div>
  );
}

function PresetCard({ title, subtitle, note, preview, tag, active, onClick }) {
  const [broken, setBroken] = useState(false);
  const [loaded, setLoaded] = useState(false);
  if (broken) return null;
  return (
    <button
      onClick={onClick}
      className={[
        'group relative rounded-2xl overflow-hidden border bg-white shadow-sm transition text-left hover:shadow-md',
        active ? 'border-stone-400 ring-2 ring-stone-300' : 'border-stone-200 hover:border-stone-300',
      ].join(' ')}
      title={title}
    >
      <div className="relative w-full aspect-[4/3] bg-stone-100">
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-sky-50 via-white to-emerald-50" />
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
          <span className="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full bg-stone-900/90 text-white shadow">
            {tag}
          </span>
        )}
        <div className="absolute top-2 right-2 rounded-full bg-white/90 backdrop-blur px-2 py-1 text-[11px] border border-white shadow-sm">
          {active ? 'Selected' : 'Use preset'}
        </div>
      </div>
      <div className="p-3">
        <div className="font-semibold">{title}</div>
        <div className="text-xs text-stone-500">{subtitle}</div>
        {note ? <div className="mt-1 text-[11px] text-stone-500">{note}</div> : null}
      </div>
    </button>
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
function PlayIcon(props) {
  return (
    <svg viewBox="0 0 24 24" className={props.className || ''}>
      <path d="M8 5v14l11-7z" fill="currentColor" />
    </svg>
  );
}

/* ----------------------------------
   Export helper
---------------------------------- */
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

/* ----------------------------------
   Modals
---------------------------------- */
function TryOnCustomizeModal({ initial, onCancel, onConfirm }) {
  const [state, setState] = useState(
    initial || {
      pose: 'front facing',
      background: 'white seamless studio',
      lighting: 'softbox + fill',
      camera: '50mm eye-level',
      colorMood: 'neutral, accurate color',
      extras: '',
    }
  );

  return (
    <div className="rounded-2xl bg-white p-4 sm:p-5 shadow-lg border space-y-3">
      <div className="text-sm font-semibold">Customize Try-On Aesthetics</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <label className="space-y-1">
          <span className="text-stone-600">Pose</span>
          <input
            value={state.pose}
            onChange={(e) => setState((s) => ({ ...s, pose: e.target.value }))}
            className="w-full rounded-lg border px-2 py-1"
            placeholder="front facing / 3/4 / side / casual"
          />
        </label>
        <label className="space-y-1">
          <span className="text-stone-600">Background</span>
          <input
            value={state.background}
            onChange={(e) => setState((s) => ({ ...s, background: e.target.value }))}
            className="w-full rounded-lg border px-2 py-1"
            placeholder="white seamless / matte beige / loft / runway"
          />
        </label>
        <label className="space-y-1">
          <span className="text-stone-600">Lighting</span>
          <input
            value={state.lighting}
            onChange={(e) => setState((s) => ({ ...s, lighting: e.target.value }))}
            className="w-full rounded-lg border px-2 py-1"
            placeholder="softbox + fill / daylight window / rim + key"
          />
        </label>
        <label className="space-y-1">
          <span className="text-stone-600">Camera</span>
          <input
            value={state.camera}
            onChange={(e) => setState((s) => ({ ...s, camera: e.target.value }))}
            className="w-full rounded-lg border px-2 py-1"
            placeholder="35mm / 50mm eye-level / 85mm portrait"
          />
        </label>
        <label className="space-y-1 sm:col-span-2">
          <span className="text-stone-600">Color mood</span>
          <input
            value={state.colorMood}
            onChange={(e) => setState((s) => ({ ...s, colorMood: e.target.value }))}
            className="w-full rounded-lg border px-2 py-1"
            placeholder="neutral, accurate color / warm editorial / cool slate"
          />
        </label>
        <label className="space-y-1 sm:col-span-2">
          <span className="text-stone-600">Extras</span>
          <input
            value={state.extras}
            onChange={(e) => setState((s) => ({ ...s, extras: e.target.value }))}
            className="w-full rounded-lg border px-2 py-1"
            placeholder="e.g., subtle grain, shallow depth, soft rim light"
          />
        </label>
      </div>
      <div className="flex items-center justify-end gap-2 pt-1">
        <button className="rounded-lg border px-3 py-1.5 text-xs" onClick={onCancel}>
          Cancel
        </button>
        <button
          className="rounded-lg bg-stone-900 text-white px-3 py-1.5 text-xs"
          onClick={() => onConfirm(state)}
        >
          Save
        </button>
      </div>
    </div>
  );
}

function EnhanceCustomizer({ initial, onCancel, onRun }) {
  const [state, setState] = useState(
    initial || {
      id: 'custom',
      photographyStyle: '',
      background: '',
      lighting: '',
      colorStyle: '',
      realism: 'high-fidelity',
      outputQuality: '4k',
    }
  );

  return (
    <div className="rounded-2xl bg-white p-4 sm:p-5 shadow border space-y-3">
      <div className="text-sm font-semibold">Enhance Settings</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <label className="space-y-1">
          <span className="text-stone-600">Style</span>
          <input
            value={state.photographyStyle}
            onChange={(e) => setState((s) => ({ ...s, photographyStyle: e.target.value }))}
            className="w-full rounded-lg border px-2 py-1"
            placeholder="catalog / editorial / hero product"
          />
        </label>
        <label className="space-y-1">
          <span className="text-stone-600">Background</span>
          <input
            value={state.background}
            onChange={(e) => setState((s) => ({ ...s, background: e.target.value }))}
            className="w-full rounded-lg border px-2 py-1"
            placeholder="white / matte beige / slate"
          />
        </label>
        <label className="space-y-1">
          <span className="text-stone-600">Lighting</span>
          <input
            value={state.lighting}
            onChange={(e) => setState((s) => ({ ...s, lighting: e.target.value }))}
            className="w-full rounded-lg border px-2 py-1"
            placeholder="softbox + fill / hard key + rim"
          />
        </label>
        <label className="space-y-1">
          <span className="text-stone-600">Colors</span>
          <input
            value={state.colorStyle}
            onChange={(e) => setState((s) => ({ ...s, colorStyle: e.target.value }))}
            className="w-full rounded-lg border px-2 py-1"
            placeholder="neutral whites / warm beige / cool slate"
          />
        </label>
      </div>
      <div className="flex items-center justify-end gap-2 pt-1">
        <button className="rounded-lg border px-3 py-1.5 text-xs" onClick={onCancel}>
          Cancel
        </button>
        <button
          className="rounded-lg bg-stone-900 text-white px-3 py-1.5 text-xs"
          onClick={() => onRun(state)}
        >
          Run
        </button>
      </div>
    </div>
  );
}
