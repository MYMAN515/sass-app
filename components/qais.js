'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';

/* -------------------------------------------------------
   Theme (Tabby-like soft fintech palette)
------------------------------------------------------- */
const BG_GRADIENT =
  'bg-[radial-gradient(1200px_600px_at_-10%_-10%,#FFFBEA_0%,transparent_50%),radial-gradient(900px_600px_at_110%_-10%,#E6FFF5_0%,transparent_45%),radial-gradient(1000px_600px_at_30%_120%,#EAF3FF_0%,transparent_50%)]';

const SOFT_CARD = 'bg-white/90 backdrop-blur border border-slate-200 shadow-sm';
const ACCENT_BTN = 'bg-[#2BC48A] hover:bg-[#1FB57C] text-white'; // Mint
const ACCENT_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2BC48A]/60 rounded-xl';

/* -------------------------------------------------------
   Helpers
------------------------------------------------------- */
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
    return v;
  }
  return '';
};

/* -------------------------------------------------------
   Product Enhance (presets)
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
            className={`${SOFT_CARD} rounded-xl p-3`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-slate-800">{t.msg}</div>
              <button className="text-xs text-slate-500 hover:text-slate-800" onClick={() => onClose(t.id)}>✕</button>
            </div>
            {typeof t.progress === 'number' && (
              <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-[#2BC48A] transition-all"
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
  { id: 'people', label: 'AI Try-On', icon: PersonIcon },
  { id: 'product', label: 'Product', icon: BoxIcon },
];

const PRODUCT_TOOLS = [
  { id: 'removeBg', label: 'Remove BG', icon: ScissorsIcon },
  { id: 'enhance', label: 'Enhance', icon: RocketIcon },
];

const PEOPLE_TOOLS = [{ id: 'tryon', label: 'Try-On (Realistic Model)', icon: PersonIcon }];

/* -------------------------------------------------------
   Try-On Presets
------------------------------------------------------- */
const TRYON_PRESETS = [
  {
    id: 'ecom-female-front-white',
    title: 'E-commerce • Female',
    subtitle: 'Front • Studio White',
    persona: 'female',
    pose: 'front',
    bg: 'studio_white',
    style: 'ecom',
    thumb: '/presets/ecom-female-front-white.webp',
  },
  {
    id: 'editorial-female-34-beige',
    title: 'Editorial • Female',
    subtitle: '3/4 • Warm Beige',
    persona: 'female',
    pose: '3/4',
    bg: 'studio_beige',
    style: 'editorial',
    thumb: '/presets/editorial-female-34-beige.webp',
  },
  {
    id: 'ecom-male-front-white',
    title: 'E-commerce • Male',
    subtitle: 'Front • Studio White',
    persona: 'male',
    pose: 'front',
    bg: 'studio_white',
    style: 'ecom',
    thumb: '/presets/ecom-male-front-white.webp',
  },
  {
    id: 'street-male-casual-slate',
    title: 'Street • Male',
    subtitle: 'Casual • Slate',
    persona: 'male',
    pose: 'casual stance',
    bg: 'slate',
    style: 'street',
    thumb: '/presets/street-male-casual-slate.webp',
  },
];

/* Style & BG recipes */
const STYLE_PACKS = [
  { id: 'editorial', title: 'Editorial', recipe: 'editorial fashion photo, crisp studio light, subtle grain' },
  { id: 'ecom', title: 'E-commerce', recipe: 'ecommerce catalog photo, true-to-color, centered, no props' },
  { id: 'street', title: 'Street', recipe: 'streetwear lifestyle, soft daylight, candid vibe' },
];
const BG_PACKS = [
  { id: 'studio_white', title: 'Studio White', recipe: 'white seamless background, softbox light, gentle shadow' },
  { id: 'studio_beige', title: 'Warm Beige', recipe: 'matte beige backdrop, directional soft key' },
  { id: 'slate', title: 'Slate Gray', recipe: 'charcoal slate, controlled specular, rim light' },
];

const SKIN_TONES = ['fair', 'light', 'medium', 'tan', 'deep'];
const POSES = ['front', '3/4', 'side', 'casual stance'];

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

  // single-file work area
  const [file, setFile] = useState(null);
  const [localUrl, setLocalUrl] = useState('');
  const [imageData, setImageData] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [variants, setVariants] = useState([]);

  // Try-On minimal flow
  const [persona, setPersona] = useState('female');
  const [pieceType, setPieceType] = useState('upper'); // upper | lower | dress
  const [skin, setSkin] = useState('medium');
  const [pose, setPose] = useState('front');
  const [stylePack, setStylePack] = useState('ecom');
  const [bgPack, setBgPack] = useState('studio_white');

  // Options
  const [numImages, setNumImages] = useState(1);
  const [aspect, setAspect] = useState('match_input_image');
  const [seed, setSeed] = useState('');
  const [guidance, setGuidance] = useState(3.7);
  const [safety, setSafety] = useState(2);

  // Enhance Prompt Builder (chips)
  const [builder, setBuilder] = useState({
    base: new Set(['retouch']), // 'retouch'|'upscale'|'relight'|'recolor'|'shadow'
    look: new Set(['soft studio', '50mm']),
    constraints: new Set(['preserve brand colors']),
    negative: new Set(['no text', 'no watermark', 'no artifacts']),
    strength: 35,
  });

  // Modal flow
  const [showFlow, setShowFlow] = useState(true);
  const [flowStep, setFlowStep] = useState(0); // 0: QuickStart, 1: Upload, 2: Presets, 3: Customize
  const [rememberChoice, setRememberChoice] = useState(false);

  // Customize modal (legacy quick access)
  const [showCustomize, setShowCustomize] = useState(false);
  const [custom, setCustom] = useState({
    camera: '50mm eye-level',
    lighting: 'softbox + fill, gentle reflections',
    colorMood: 'neutral, accurate color',
    extras: '',
  });

  // Enhance modal (legacy)
  const [pendingEnhancePreset, setPendingEnhancePreset] = useState(null);
  const [showEnhance, setShowEnhance] = useState(false);

  // Progress / phase
  const [phase, setPhase] = useState('idle'); // idle|processing|ready|error
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [history, setHistory] = useState([]);

  // Compare
  const [compare, setCompare] = useState(false);
  const [compareOpacity, setCompareOpacity] = useState(50);

  // Refs
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

  /* ---------- remember choice ---------- */
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('aiStudioDefaultChoice') : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.group && parsed?.tool) {
          setGroup(parsed.group);
          setTool(parsed.tool);
          setShowFlow(false);
          setFlowStep(1);
        }
      } catch {}
    }
  }, []);

  /* ---------- DnD / paste ---------- */
  useEffect(() => {
    const el = dropRef.current; if (!el) return;
    const over  = (e) => { e.preventDefault(); el.classList.add('ring-2','ring-[#2BC48A]'); };
    const leave = () => el.classList.remove('ring-2','ring-[#2BC48A]');
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
    setVariants([]);
    setErr('');
    setPhase('idle');
    setImageData(await fileToDataURL(f));
  };

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
  const STYLE_RECIPES = useMemo(() => Object.fromEntries(STYLE_PACKS.map(p => [p.id, p.recipe])), []);
  const BG_RECIPES = useMemo(() => Object.fromEntries(BG_PACKS.map(p => [p.id, p.recipe])), []);

  const buildPersonaLine = (p, tone, pPose) => {
    const base = p === 'female' ? 'photorealistic woman, natural makeup'
               : 'photorealistic man, light grooming';
    return `${base}, ${tone} skin tone, ${pPose} pose`;
  };

  const buildPieceScope = (type) => {
    if (type === 'upper') return 'Replace the model’s TOP with the uploaded garment.';
    if (type === 'lower') return 'Replace the model’s BOTTOM with the uploaded garment.';
    return 'Replace the model’s FULL OUTFIT with the uploaded garment as a one-piece dress.';
  };

  const buildTryOnPrompt = () => {
    const personaLine = buildPersonaLine(persona, skin, pose);
    const styleLine = STYLE_RECIPES[stylePack] || 'editorial fashion photo';
    const bgLine = BG_RECIPES[bgPack] || 'white seamless background';

    const customBits = [
      custom?.camera ? `camera: ${custom.camera}` : null,
      custom?.lighting ? `lighting: ${custom.lighting}` : null,
      custom?.colorMood ? `colors: ${custom.colorMood}` : null,
      custom?.extras ? custom.extras : null,
    ].filter(Boolean).join(', ');

    return [
      'Photorealistic AI try-on. Render a REAL human model (no user photo provided).',
      personaLine + '.',
      buildPieceScope(pieceType),
      'Use the uploaded garment EXACTLY: preserve fabric, color, pattern, buttons, collar, pockets, and logos.',
      'Natural fit & drape: correct scale and alignment, accurate neckline/sleeves/hem geometry, realistic wrinkles and self-shadowing.',
      `Background: ${bgLine}.`,
      `Style: ${styleLine}.`,
      customBits ? `Aesthetic: ${customBits}.` : '',
      'No accessories, no text. High detail, sharp, 4k realistic output.',
    ].filter(Boolean).join(' ');
  };

  const buildEnhancePromptFromPreset = (f) =>
    [
      f?.photographyStyle,
      `background: ${f?.background}`,
      `lighting: ${f?.lighting}`,
      `colors: ${f?.colorStyle}`,
      f?.realism,
      `output: ${f?.outputQuality}`,
    ].filter(Boolean).join(', ');

  const buildEnhancePromptFromBuilder = () => {
    const base = [...builder.base].join(', ');
    const look = [...builder.look].join(', ');
    const constraints = [...builder.constraints].join(', ');
    const negative = [...builder.negative].join(', ');
    return [
      base && `Base: ${base}`,
      look && `Look: ${look}`,
      constraints && `Constraints: ${constraints}`,
      `Strength: ${builder.strength}/100`,
      negative && `Negative: ${negative}`,
    ].filter(Boolean).join(' — ');
  };

  /* ---------- runners ---------- */
  const runRemoveBg = useCallback(async () => {
    if (!file) return setErr('Pick an image first.');
    setBusy(true); setErr(''); setPhase('processing');
    const t = toasts.push('Removing background…', { progress: 8 });
    let adv = 8; const iv = setInterval(() => { adv = Math.min(adv + 6, 88); t.update({ progress: adv }); }, 450);
    try {
      const r = await fetch('/api/remove-bg', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || 'remove-bg failed');
      const out = pickFirstUrl(j); if (!out) throw new Error('No output from remove-bg');
      setResultUrl(out);
      setVariants([]);
      setHistory((h) => [{ tool: 'Remove BG', inputThumb: localUrl, outputUrl: out, ts: Date.now() }, ...h].slice(0, 24));
      setPhase('ready'); t.update({ progress: 100, msg: 'Background removed ✓' });
      setTimeout(() => t.close(), 700);
    } catch (e) {
      console.error(e); setPhase('error'); setErr('Failed to process.');
      t.update({ msg: 'Remove BG failed', type: 'error' }); setTimeout(() => t.close(), 1200);
    } finally { clearInterval(iv); setBusy(false); }
  }, [file, imageData, localUrl, toasts]);

  const runEnhance = useCallback(async (selectionsOrNull) => {
    if (!file) return setErr('Pick an image first.');
    setBusy(true); setErr(''); setPhase('processing');
    const imageUrl = await uploadToStorage(file);
    const prompt = selectionsOrNull ? buildEnhancePromptFromPreset(selectionsOrNull) : buildEnhancePromptFromBuilder();
    const t = toasts.push('Enhancing…', { progress: 12 });
    let adv = 12; const iv = setInterval(() => { adv = Math.min(adv + 6, 88); t.update({ progress: adv }); }, 450);
    try {
      const r = await fetch('/api/enhance', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, selections: selectionsOrNull || {}, prompt, plan, user_email: user.email }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || 'enhance failed');
      const out = pickFirstUrl(j); if (!out) throw new Error('No output from enhance');
      setResultUrl(out);
      setVariants([]);
      setHistory((h) => [{ tool: 'Enhance', inputThumb: localUrl, outputUrl: out, ts: Date.now() }, ...h].slice(0, 24));
      setPhase('ready'); t.update({ progress: 100, msg: 'Enhanced ✓' }); setTimeout(() => t.close(), 700);
    } catch (e) {
      console.error(e); setPhase('error'); setErr('Failed to process.');
      t.update({ msg: 'Enhance failed', type: 'error' }); setTimeout(() => t.close(), 1200);
    } finally { clearInterval(iv); setBusy(false); }
  }, [file, uploadToStorage, plan, user, localUrl, toasts, builder]);

  const runTryOn = useCallback(async () => {
    if (!file) return setErr('Upload a clothing image first.');
    setBusy(true); setErr(''); setPhase('processing');

    const t = toasts.push('Generating Try-On…', { progress: 10 });
    let adv = 10; const iv = setInterval(() => { adv = Math.min(adv + 6, 88); t.update({ progress: adv }); }, 450);

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
      setHistory((h) => [{ tool: 'Try-On', inputThumb: localUrl, outputUrl: out || '', ts: Date.now() }, ...h].slice(0, 24));
      setPhase('ready'); t.update({ progress: 100, msg: 'Try-On ✓' }); setTimeout(() => t.close(), 700);
    } catch (e) {
      console.error(e); setPhase('error'); setErr('Failed to process.');
      toasts.push('Try-On failed', { type: 'error' });
    } finally { clearInterval(iv); setBusy(false); }
  }, [file, plan, user, uploadToStorage, numImages, seed, aspect, guidance, safety, toasts, localUrl, pieceType, persona, skin, pose, stylePack, bgPack, custom]);

  const handleRun = () => {
    if (group === 'people' && tool === 'tryon') return runTryOn();
    if (group === 'product' && tool === 'removeBg') return runRemoveBg();
    if (group === 'product' && tool === 'enhance') return runEnhance(null);
  };

  const switchTool = (nextId) => {
    setTool(nextId);
    setResultUrl(''); setVariants([]); setErr(''); setPhase('idle'); setCompare(false);
    setFile(null); setLocalUrl('');
  };

  const resetAll = () => {
    setFile(null); setLocalUrl(''); setResultUrl(''); setVariants([]);
    setErr(''); setPhase('idle'); setCompare(false);
  };

  /* ---------- UI ---------- */
  if (loading || user === undefined) {
    return (
      <main className={`min-h-screen grid place-items-center ${BG_GRADIENT} text-slate-600`}>
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`${SOFT_CARD} rounded-2xl px-4 py-3 text-sm`}
        >
          Loading…
        </motion.div>
      </main>
    );
  }
  if (!user) return null;

  const initials = (() => {
    const n = user?.user_metadata?.name || user?.email || 'U';
    const p = n.split(' ').filter(Boolean);
    return ((p[0]?.[0] || n[0]) + (p[1]?.[0] || '')).toUpperCase();
  })();

  const currentStep = !file ? 1 : (resultUrl ? 3 : 2);

  return (
    <main className={`min-h-screen ${BG_GRADIENT} text-slate-900`}>
      <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 md:gap-6 px-3 md:px-6 py-4 md:py-6">

        {/* Sidebar */}
        <motion.aside
          initial={{ x: -12, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 16 }}
          className={`${SOFT_CARD} rounded-2xl sticky top-3 md:top-4 self-start h-fit`}
        >
          <div className="px-4 py-4 flex items-center gap-3 border-b border-slate-200">
            <div className="grid place-items-center size-9 rounded-xl bg-gradient-to-br from-[#2BC48A] to-[#83E0BE] text-white shadow">
              <SparkleIcon className="w-4 h-4" />
            </div>
            <div className="font-semibold tracking-tight">AI Studio</div>
          </div>

          <div className="px-3 py-3">
            <div className="text-xs font-semibold text-slate-500 mb-1">Workspace</div>
            <div className="inline-flex rounded-full border border-slate-200 bg-white p-1">
              {GROUPS.map((g) => {
                const Active = group === g.id;
                const Icon = g.icon;
                return (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    key={g.id}
                    onClick={() => { setGroup(g.id); switchTool(g.id === 'product' ? 'enhance' : 'tryon'); }}
                    className={[
                      'inline-flex items-center gap-2 py-1.5 px-3 rounded-full text-sm transition',
                      Active ? 'bg-[#2BC48A] text-white shadow' : 'text-slate-800 hover:bg-slate-100'
                    ].join(' ')}
                  >
                    <Icon className="size-4" /> {g.label}
                  </motion.button>
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
                  <motion.button
                    whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
                    key={t.id}
                    onClick={() => switchTool(t.id)}
                    className={[
                      'w-full group flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm transition',
                      Active ? 'bg-white text-[#2BC48A] border border-[#2BC48A]/30 shadow-sm'
                             : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                    ].join(' ')}
                  >
                    <Icon className={['size-4', Active ? 'text-[#2BC48A]' : 'text-slate-500 group-hover:text-slate-700'].join(' ')} />
                    <span className="truncate">{t.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="px-4 py-3 border-t border-slate-200">
            <div className="flex items-center gap-3">
              <div className="grid place-items-center size-10 rounded-full bg-slate-100 text-slate-700 font-bold">{initials}</div>
              <div className="text-sm">
                <div className="font-medium leading-tight">{user.user_metadata?.name || user.email}</div>
              </div>
            </div>
          </div>
        </motion.aside>

        {/* Main column */}
        <section className="space-y-5 md:space-y-6">
          {/* Header / Steps */}
          <motion.div
            initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className={`${SOFT_CARD} rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-6`}
          >
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
                  {group === 'people' ? 'Try-On (Realistic Model)' : 'Product Tools'}
                </h1>
                <p className="text-slate-600 text-xs sm:text-sm">
                  {group === 'people'
                    ? <>Step 1: Upload clothing → Step 2: Preset or Customize → Step 3: Run.</>
                    : <>Pick a preset or open <span className="font-semibold">Customize</span>.</>}
                </p>
              </div>

              {group === 'people' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <button
                    onClick={() => setShowCustomize(true)}
                    className={`${ACCENT_BTN} ${ACCENT_RING} inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs sm:text-sm font-semibold`}
                  >
                    🎛️ Customize
                  </button>
                </motion.div>
              )}

              {group === 'product' && (
                <button
                  onClick={() => { setTool('enhance'); setPendingEnhancePreset(null); setShowEnhance(true); }}
                  className={`${ACCENT_RING} inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs sm:text-sm font-semibold hover:bg-slate-50`}
                >
                  ✨ Customize Enhance
                </button>
              )}
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <ProgressSteps current={currentStep} />
            </div>

            {/* Try-On presets or Product enhance presets */}
            {group === 'people' ? (
              <div className="mt-4">
                <div className="mb-2 text-[12px] font-semibold text-slate-700">Quick Presets</div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {TRYON_PRESETS.map((p) => (
                    <TryonPresetCard
                      key={p.id}
                      title={p.title}
                      subtitle={p.subtitle}
                      thumb={p.thumb}
                      onClick={() => {
                        setPersona(p.persona);
                        setPose(p.pose);
                        setBgPack(p.bg);
                        setStylePack(p.style);
                      }}
                    />
                  ))}
                </div>

                {/* Minimal quick switches */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <ToggleChips
                    label="Gender"
                    value={persona}
                    setValue={setPersona}
                    options={[
                      { id: 'female', label: 'Female' },
                      { id: 'male', label: 'Male' },
                    ]}
                  />
                  <ToggleChips
                    label="Garment"
                    value={pieceType}
                    setValue={setPieceType}
                    options={[
                      { id: 'upper', label: 'Upper' },
                      { id: 'lower', label: 'Lower' },
                      { id: 'dress', label: 'Dress' },
                    ]}
                  />
                  <SelectField label="Pose" value={pose} onChange={setPose} options={POSES} />
                  <SelectField label="Skin" value={skin} onChange={setSkin} options={SKIN_TONES} />
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <div className="mb-2 text-[12px] font-semibold text-slate-700">Enhance Presets</div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {/* None (Default) card */}
                  <PresetCard
                    key="none-default"
                    title="None (Default)"
                    subtitle="Use Prompt Builder"
                    preview="/placeholder-default.webp"
                    tag="Default"
                    onClick={() => { setTool('enhance'); setPendingEnhancePreset(null); setShowEnhance(true); }}
                  />
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
            )}
          </motion.div>

          {/* Workbench */}
          <div className="grid gap-4 md:gap-6 lg:grid-cols-[1fr_360px]">
            {/* Canvas Panel */}
            <motion.section
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={`${SOFT_CARD} rounded-2xl md:rounded-3xl relative`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 px-3 sm:px-4 md:px-5 pt-3 md:pt-4">
                <div className="inline-flex rounded-full border border-slate-200 bg-white p-1">
                  {(group === 'product' ? PRODUCT_TOOLS : PEOPLE_TOOLS).map((it) => {
                    const Active = tool === it.id;
                    const Icon = it.icon;
                    return (
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        key={it.id}
                        onClick={() => switchTool(it.id)}
                        className={[
                          'inline-flex items-center gap-2 py-1.5 px-3 rounded-full text-sm transition',
                          Active ? 'bg-[#2BC48A] text-white shadow' : 'text-slate-800 hover:bg-slate-100'
                        ].join(' ')}
                      >
                        <Icon className="size-4" />
                        <span>{it.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <StepBadge phase={phase} />
                  <button onClick={resetAll} className={`${ACCENT_RING} text-xs px-2 py-1 rounded-lg border bg-white hover:bg-slate-50`}>
                    Reset
                  </button>
                </div>
              </div>

              {/* Drop area */}
              <div
                ref={dropRef}
                className="m-3 sm:m-4 md:m-5 min-h-[240px] sm:min-h-[300px] md:min-h-[360px] grid place-items-center rounded-2xl border-2 border-dashed border-slate-300/70 bg-white hover:bg-slate-50 transition cursor-pointer"
                onClick={() => inputRef.current?.click()}
                title="Drag & drop / Click / Paste (Ctrl+V)"
              >
                <input
                  ref={inputRef}
                  type="file" accept="image/*" className="hidden"
                  onChange={async (e) => { const f = e.target.files?.[0]; if (f) await onPick(f); }}
                />
                {!localUrl && !resultUrl ? (
                  <motion.div initial={{ opacity: 0.6 }} animate={{ opacity: 1 }}
                    className="text-center text-slate-700 text-sm"
                  >
                    <div className="mx-auto mb-3 grid place-items-center size-12 sm:size-14 rounded-full bg-white border border-slate-200">⬆</div>
                    Upload a clothing image (PNG/JPG). Transparent PNG preferred.
                  </motion.div>
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

              {/* Try-On Advanced row (compact) */}
              {group === 'people' && (
                <div className="px-3 sm:px-4 md:px-5 -mt-3 pb-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <SelectField
                      label="Aspect"
                      value={aspect}
                      onChange={setAspect}
                      options={['match_input_image', '1:1', '3:4', '4:5', '9:16', '16:9']}
                    />
                    <NumberField label="# Images" value={numImages} setValue={setNumImages} min={1} max={3} />
                    <TextField label="Seed (optional)" value={seed} setValue={(v)=>setSeed(v.replace(/[^\d\-]/g,''))} placeholder="e.g. 123" />
                  </div>
                </div>
              )}

              {/* Variants */}
              {variants?.length > 1 && (
                <div className="px-3 sm:px-4 md:px-5 pb-1">
                  <div className="text-xs text-slate-600 mb-1">Variants</div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {variants.map((v, i) => (
                      <motion.button
                        whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
                        key={i}
                        onClick={() => setResultUrl(v)}
                        className={[
                          'shrink-0 w-24 h-24 rounded-lg overflow-hidden border',
                          resultUrl === v ? 'border-[#2BC48A] ring-2 ring-[#2BC48A]/40' : 'border-slate-200 hover:border-slate-300'
                        ].join(' ')}
                        title={`Variant ${i+1}`}
                      >
                        <img src={v} alt={`v${i+1}`} className="w-full h-full object-cover" />
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 px-3 sm:px-4 md:px-5 pb-4 md:pb-5">
                <button
                  onClick={handleRun}
                  disabled={busy || !file}
                  className={`${ACCENT_BTN} ${ACCENT_RING} inline-flex items-center gap-2 rounded-xl px-3 sm:px-4 py-2 text-sm font-semibold shadow-sm transition disabled:opacity-50`}
                >
                  {busy ? 'Processing…' : (
                    <>
                      <PlayIcon className="size-4" />
                      {tool === 'tryon' ? 'Run Try-On' : (tool === 'removeBg' ? 'Remove Background' : 'Run Enhance')}
                    </>
                  )}
                </button>

                {/* Independent Remove BG */}
                <button
                  onClick={runRemoveBg}
                  disabled={busy || !file}
                  className={`${ACCENT_RING} inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 sm:px-4 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50`}
                >
                  ✂ Remove Background
                </button>

                {resultUrl && (
                  <>
                    <button
                      onClick={() => exportPng(resultUrl)}
                      className={`${ACCENT_RING} inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 sm:px-4 py-2 text-sm font-semibold hover:bg-slate-50`}
                    >
                      ⬇ Download PNG
                    </button>
                    <a
                      href={resultUrl} target="_blank" rel="noreferrer"
                      className={`${ACCENT_RING} inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-xs font-semibold hover:bg-slate-50`}
                    >
                      ↗ Open
                    </a>
                    <button
                      onClick={() => { navigator.clipboard.writeText(resultUrl).catch(()=>{}); }}
                      className={`${ACCENT_RING} inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-xs font-semibold hover:bg-slate-50`}
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
            </motion.section>

            {/* Inspector */}
            <motion.aside
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={`${SOFT_CARD} rounded-2xl md:rounded-3xl p-4 md:pb-5`}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900">Inspector</div>
                <span className="text-xs text-slate-600">Tool: {tool}</span>
              </div>

              {tool === 'tryon' && (
                <div className="space-y-3 mt-3 text-xs">
                  <div className="rounded-lg border p-3">
                    <div className="text-slate-600 mb-1">Clothing</div>
                    {localUrl ? (
                      <img src={localUrl} alt="cloth" className="w-full max-h-48 object-contain rounded-md border bg-white" />
                    ) : (
                      <div className="text-slate-400">— Upload a clothing image —</div>
                    )}
                  </div>

                  <div className="rounded-lg border p-3 grid grid-cols-2 gap-2">
                    <Info label="Gender" value={persona} />
                    <Info label="Type" value={pieceType} />
                    <Info label="Skin" value={skin} />
                    <Info label="Pose" value={pose} />
                    <Info label="Style" value={stylePack} />
                    <Info label="Background" value={bgPack} />
                    <Info label="Aspect" value={aspect} />
                    <Info label="Guidance" value={String(guidance)} />
                    <Info label="Safety" value={String(safety)} />
                    <Info label="Seed" value={seed || '—'} />
                    <Info label="# Images" value={String(numImages)} />
                  </div>

                  {resultUrl && (
                    <div className="rounded-lg border p-3">
                      <div className="text-slate-600 mb-2">Result</div>
                      <img
                        src={resultUrl}
                        alt="final"
                        className="w-full max-h-64 object-contain rounded-md border bg-white"
                      />
                    </div>
                  )}
                </div>
              )}

              {tool === 'enhance' && (
                <div className="space-y-3 mt-3 text-xs text-slate-700">
                  <div className="rounded-lg border p-3 space-y-2">
                    <div className="font-semibold text-slate-900">Prompt Builder</div>
                    <ChipGroup
                      label="Base"
                      options={['retouch','upscale','relight','recolor','shadow']}
                      value={builder.base}
                      onToggle={(id)=>toggleSet('base', id)}
                    />
                    <ChipGroup
                      label="Look & Camera"
                      options={['soft studio','high-key','50mm','neutral color','white sweep']}
                      value={builder.look}
                      onToggle={(id)=>toggleSet('look', id)}
                    />
                    <ChipGroup
                      label="Constraints"
                      options={['preserve brand colors','no extra fabric','no background props']}
                      value={builder.constraints}
                      onToggle={(id)=>toggleSet('constraints', id)}
                    />
                    <ChipGroup
                      label="Negative"
                      options={['no text','no watermark','no artifacts','no deformed shapes']}
                      value={builder.negative}
                      onToggle={(id)=>toggleSet('negative', id)}
                    />
                    <StrengthSlider value={builder.strength} onChange={(v)=>setBuilder(s=>({...s, strength:v}))} />
                  </div>

                  {resultUrl && (
                    <div className="mt-2 rounded-xl overflow-hidden border">
                      <div className="relative w-full min-h-[140px] grid place-items-center">
                        <img src={resultUrl} alt="final" className="max-w-full max-h-[38vh] object-contain" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.aside>
          </div>

          {/* History */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`${SOFT_CARD} rounded-2xl md:rounded-3xl p-4 md:p-5`}
          >
            <div className="text-sm font-semibold text-slate-900 mb-2">History</div>
            {history.length === 0 ? (
              <div className="text-xs text-slate-500 px-1 py-4">— No renders yet —</div>
            ) : (
              <>
                <div className="mb-2">
                  <button
                    onClick={() => setHistory([])}
                    className={`${ACCENT_RING} text-xs px-2 py-1 rounded-lg border bg-white hover:bg-slate-50`}
                  >
                    Clear history
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {history.map((h, i) => (
                    <motion.button
                      whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
                      key={i}
                      onClick={() => setResultUrl(h.outputUrl)}
                      className="group relative rounded-xl overflow-hidden border border-slate-200 hover:border-slate-300 transition bg-white"
                    >
                      <img
                        src={h.outputUrl || h.inputThumb}
                        alt="hist"
                        className="w-full h-28 object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 text-[10px] px-2 py-1 bg-black/35 text-white backdrop-blur">
                        {h.tool} • {new Date(h.ts).toLocaleTimeString()}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </section>
      </div>

      {/* Sticky mobile actions */}
      <div className="lg:hidden fixed bottom-2 left-1/2 -translate-x-1/2 z-[60]">
        <div className="inline-flex gap-2 rounded-2xl border border-slate-200 bg-white/95 backdrop-blur px-2 py-2 shadow">
          <button
            onClick={() => setShowFlow(true)}
            className={`${ACCENT_RING} text-xs px-3 py-2 rounded-xl border hover:bg-slate-50`}
          >
            ◷ Steps
          </button>
          <button
            onClick={handleRun}
            disabled={busy || !file}
            className={`${ACCENT_BTN} ${ACCENT_RING} text-xs px-3 py-2 rounded-xl font-semibold disabled:opacity-50`}
          >
            {tool === 'tryon' ? 'Run Try-On' : tool === 'enhance' ? 'Run Enhance' : 'Remove BG'}
          </button>
          <button
            onClick={runRemoveBg}
            disabled={busy || !file}
            className={`${ACCENT_RING} text-xs px-3 py-2 rounded-xl border hover:bg-slate-50 disabled:opacity-50`}
          >
            ✂ BG
          </button>
        </div>
      </div>

      {/* Modals: Flow Stepper + Legacy modals */}
      <AnimatePresence>
        {showFlow && (
          <motion.div className="fixed inset-0 z-[100] grid place-items-end sm:place-items-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/55" onClick={() => setShowFlow(false)} />
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              className="relative w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-2xl shadow-xl border overflow-hidden"
            >
              <div className="p-3 sm:p-4 border-b flex items-center justify-between">
                <div className="text-sm font-semibold">QuickStart</div>
                <button onClick={() => setShowFlow(false)} className="text-xs text-slate-500 hover:text-slate-800">✕</button>
              </div>

              {/* Stepper header */}
              <div className="px-3 sm:px-4 py-2">
                <StepperHeader step={flowStep} />
              </div>

              {/* Steps */}
              <div className="p-3 sm:p-4">
                {flowStep === 0 && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <ActionCard
                        title="Try-On"
                        subtitle="Render on a realistic model"
                        onClick={() => { setGroup('people'); setTool('tryon'); setFlowStep(1); }}
                        icon={<PersonIcon className="size-5" />}
                      />
                      <ActionCard
                        title="Enhance"
                        subtitle="Retouch, relight, upscale"
                        onClick={() => { setGroup('product'); setTool('enhance'); setFlowStep(1); }}
                        icon={<RocketIcon className="size-5" />}
                      />
                    </div>
                    <label className="flex items-center gap-2 text-xs text-slate-600">
                      <input type="checkbox" checked={rememberChoice} onChange={(e)=>setRememberChoice(e.target.checked)} />
                      Remember my choice
                    </label>
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          if (rememberChoice) {
                            localStorage.setItem('aiStudioDefaultChoice', JSON.stringify({ group, tool }));
                          }
                          setFlowStep(1);
                        }}
                        className={`${ACCENT_RING} text-xs px-3 py-1.5 rounded-lg border bg-white hover:bg-slate-50`}
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                )}

                {flowStep === 1 && (
                  <div className="space-y-3">
                    <DropZoneInline onPick={onPick} />
                    <div className="flex items-center justify-between">
                      <button onClick={() => setFlowStep(2)} className={`${ACCENT_RING} text-xs px-3 py-1.5 rounded-lg border bg-white hover:bg-slate-50`}>
                        Continue
                      </button>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setShowFlow(false)} className="text-xs text-slate-600">Skip</button>
                      </div>
                    </div>
                  </div>
                )}

                {flowStep === 2 && (
                  <div className="space-y-3">
                    {group === 'people' ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {TRYON_PRESETS.map((p) => (
                          <SmallPreset key={p.id} title={p.title} onClick={() => {
                            setPersona(p.persona); setPose(p.pose); setBgPack(p.bg); setStylePack(p.style);
                          }} />
                        ))}
                        <SmallPreset title="None (Default)" onClick={() => { /* use defaults */ }} />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <SmallPreset title="None (Default)" onClick={() => setPendingEnhancePreset(null)} />
                        {ENHANCE_PRESETS.map((p)=> (
                          <SmallPreset key={p.id} title={p.title} onClick={() => setPendingEnhancePreset(p.config)} />
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <button onClick={() => setFlowStep(3)} className={`${ACCENT_RING} text-xs px-3 py-1.5 rounded-lg border bg-white hover:bg-slate-50`}>
                        Continue
                      </button>
                      <button onClick={() => setShowFlow(false)} className="text-xs text-slate-600">Skip</button>
                    </div>
                  </div>
                )}

                {flowStep === 3 && (
                  <div className="space-y-3">
                    {group === 'people' ? (
                      <div className="grid grid-cols-2 gap-2">
                        <ChipGroup label="Gender" options={['female','male']} value={new Set([persona])} single onToggle={(id)=>setPersona(id)} />
                        <ChipGroup label="Garment" options={['upper','lower','dress']} value={new Set([pieceType])} single onToggle={(id)=>setPieceType(id)} />
                        <ChipGroup label="Pose" options={POSES} value={new Set([pose])} single onToggle={(id)=>setPose(id)} />
                        <ChipGroup label="Skin" options={SKIN_TONES} value={new Set([skin])} single onToggle={(id)=>setSkin(id)} />
                      </div>
                    ) : (
                      <div className="rounded-lg border p-3 space-y-2">
                        <div className="text-xs text-slate-600">Use Prompt Builder or selected preset.</div>
                        <ChipGroup label="Base" options={['retouch','upscale','relight','recolor','shadow']} value={builder.base} onToggle={(id)=>toggleSet('base', id)} />
                        <StrengthSlider value={builder.strength} onChange={(v)=>setBuilder(s=>({...s, strength:v}))} />
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <button onClick={() => { setShowFlow(false); }} className={`${ACCENT_RING} text-xs px-3 py-1.5 rounded-lg border bg-white hover:bg-slate-50`}>
                        Done
                      </button>
                      <button onClick={() => setShowFlow(false)} className="text-xs text-slate-600">Skip</button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {showEnhance && (
          <motion.div
            className="fixed inset-0 z-[100] grid place-items-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/55" onClick={() => setShowEnhance(false)} />
            <div className="relative w-full max-w-3xl mx-3">
              <EnhanceCustomizer
                initial={pendingEnhancePreset || undefined}
                onChange={() => {}}
                onComplete={(form) => {
                  setShowEnhance(false);
                  setPendingEnhancePreset(null);
                  runEnhance(form && Object.keys(form).length ? form : null);
                }}
              />
            </div>
          </motion.div>
        )}

        {showCustomize && (
          <motion.div
            className="fixed inset-0 z-[110] grid place-items-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/55" onClick={() => setShowCustomize(false)} />
            <div className="relative w-full max-w-2xl mx-3">
              <TryOnCustomizeModal
                initial={custom}
                onCancel={() => setShowCustomize(false)}
                onConfirm={(val) => { setCustom(val); setShowCustomize(false); }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toasts */}
      <ToastHost items={toasts.items} onClose={toasts.remove} />
    </main>
  );

  /* ------ local helpers ------ */
  function toggleSet(key, id) {
    setBuilder((s) => {
      const next = new Set(s[key]);
      if (s[key] instanceof Set) {
        if (next.has(id)) next.delete(id); else next.add(id);
        return { ...s, [key]: next };
      }
      return s;
    });
  }
}

/* -------------------------------------------------------
   Progress steps
------------------------------------------------------- */
function ProgressSteps({ current = 1 }) {
  const steps = [
    { id: 1, label: 'Upload' },
    { id: 2, label: 'Select' },
    { id: 3, label: 'Preview' },
  ];
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => {
        const active = s.id === current;
        const done = s.id < current;
        return (
          <div key={s.id} className="flex items-center gap-2">
            <motion.div
              layout
              className={[
                'size-7 rounded-full grid place-items-center border text-[11px] font-semibold',
                done
                  ? 'bg-[#2BC48A] text-white border-[#2BC48A]'
                  : active
                  ? 'bg-[#B7E9F7] text-slate-800 border-[#B7E9F7]'
                  : 'bg-white text-slate-600 border-slate-300',
              ].join(' ')}
            >
              {done ? '✓' : s.id}
            </motion.div>
            <div className={['text-xs', done ? 'text-[#2BC48A]' : active ? 'text-slate-800' : 'text-slate-500'].join(' ')}>
              {s.label}
            </div>
            {i < steps.length - 1 && (
              <motion.div layout className="w-10 h-1 rounded-full bg-slate-200 overflow-hidden">
                <motion.div
                  initial={false}
                  animate={{ width: s.id < current ? '100%' : '0%' }}
                  transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                  className="h-full bg-[#2BC48A]"
                />
              </motion.div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------
   Small components
------------------------------------------------------- */
function ToggleChips({ label, value, setValue, options }) {
  return (
    <div>
      <div className="text-[12px] font-semibold text-slate-700 mb-1">{label}</div>
      <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => setValue(o.id)}
            className={[
              'px-3 py-1.5 text-xs rounded-lg transition capitalize',
              value === o.id ? 'bg-[#2BC48A] text-white shadow' : 'text-slate-800 hover:bg-slate-100',
            ].join(' ')}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="flex items-center justify-between gap-3 text-xs text-slate-700">
      <span className="min-w-24">{label}</span>
      <select
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
      >
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </label>
  );
}

function TextField({ label, value, setValue, placeholder }) {
  return (
    <label className="flex items-center justify-between gap-3 text-xs text-slate-700">
      <span className="min-w-24">{label}</span>
      <input
        value={value}
        onChange={(e)=>setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
      />
    </label>
  );
}

function NumberField({ label, value, setValue, min=1, max=3 }) {
  return (
    <label className="flex items-center justify-between gap-3 text-xs text-slate-700">
      <span className="min-w-24">{label}</span>
      <input
        type="number"
        min={min} max={max}
        value={value}
        onChange={(e)=>setValue(Math.max(min, Math.min(max, Number(e.target.value) || min)))}
        className="w-24 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
      />
    </label>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white px-2 py-1">
      <div className="text-[10px] text-slate-600">{label}</div>
      <div className="text-[11px] text-slate-900 capitalize">{value}</div>
    </div>
  );
}

function PresetCard({ title, subtitle, onClick, preview, tag }) {
  const [broken, setBroken] = useState(false);
  const [loaded, setLoaded] = useState(false);
  if (broken) return null;

  return (
    <motion.button
      whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm transition text-left hover:shadow-md"
    >
      <div className="relative w-full aspect-[4/3] bg-slate-50">
        {!loaded && <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white via-slate-50 to-white" />}
        {preview && (
          <img
            src={preview}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setBroken(true)}
          />
        )}
        {tag && (
          <span className="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full bg-[#2BC48A]/90 text-white shadow">
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
    </motion.button>
  );
}

function TryonPresetCard({ title, subtitle, thumb, onClick }) {
  const [loaded, setLoaded] = useState(false);
  const [broken, setBroken] = useState(false);
  if (broken) return null;
  return (
    <motion.button
      whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-white hover:shadow-md transition text-left"
    >
      <div className="relative w-full aspect-[4/3]">
        {!loaded && <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#FFF8B7] via-white to-[#EAF3FF]" />}
        <img
          src={thumb}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setBroken(true)}
        />
        <div className="absolute top-2 right-2 rounded-full bg-white/90 backdrop-blur px-2 py-1 text-[11px] border border-white shadow-sm">
          Select
        </div>
      </div>
      <div className="p-3">
        <div className="font-semibold">{title}</div>
        <div className="text-xs text-slate-500">{subtitle}</div>
      </div>
    </motion.button>
  );
}

function StepBadge({ phase }) {
  const map = {
    idle: { label: 'Ready', color: 'bg-slate-200 text-slate-800 border-slate-300' },
    processing: { label: 'Processing', color: 'bg-[#FFF8B7] text-slate-900 border-yellow-200' },
    ready: { label: 'Done', color: 'bg-[#A7E9AF] text-emerald-900 border-emerald-300' },
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
   Modals
------------------------------------------------------- */
function TryOnCustomizeModal({ initial, onCancel, onConfirm }) {
  const [state, setState] = useState(initial || {
    camera: '50mm eye-level',
    lighting: 'softbox + fill, gentle reflections',
    colorMood: 'neutral, accurate color',
    extras: '',
  });

  return (
    <div className="rounded-2xl bg-white p-4 sm:p-5 shadow-lg border space-y-3">
      <div className="text-sm font-semibold">Customize Try-On Aesthetics</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <label className="space-y-1">
          <span className="text-slate-600">Camera</span>
          <input
            value={state.camera}
            onChange={(e)=>setState(s=>({...s, camera: e.target.value}))}
            className="w-full rounded-lg border px-2 py-1"
            placeholder="35mm low angle / 50mm eye-level / 85mm portrait"
          />
        </label>
        <label className="space-y-1">
          <span className="text-slate-600">Lighting</span>
          <input
            value={state.lighting}
            onChange={(e)=>setState(s=>({...s, lighting: e.target.value}))}
            className="w-full rounded-lg border px-2 py-1"
            placeholder="softbox + fill / clamp specular / daylight"
          />
        </label>
        <label className="space-y-1 sm:col-span-2">
          <span className="text-slate-600">Color mood</span>
          <input
            value={state.colorMood}
            onChange={(e)=>setState(s=>({...s, colorMood: e.target.value}))}
            className="w-full rounded-lg border px-2 py-1"
            placeholder="neutral, accurate color / warm editorial / cool slate"
          />
        </label>
        <label className="space-y-1 sm:col-span-2">
          <span className="text-slate-600">Extras</span>
          <input
            value={state.extras}
            onChange={(e)=>setState(s=>({...s, extras: e.target.value}))}
            className="w-full rounded-lg border px-2 py-1"
            placeholder="e.g., subtle grain, shallow depth, soft rim light"
          />
        </label>
      </div>
      <div className="flex items-center justify-end gap-2 pt-1">
        <button className="rounded-lg border px-3 py-1.5 text-xs" onClick={onCancel}>Cancel</button>
        <button
          className="rounded-lg bg-[#2BC48A] text-white px-3 py-1.5 text-xs"
          onClick={()=>onConfirm(state)}
        >
          Save
        </button>
      </div>
    </div>
  );
}

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

/* -------------------------------------------------------
   Flow components
------------------------------------------------------- */
function StepperHeader({ step }) {
  const labels = ['Choose Tool', 'Upload', 'Presets', 'Customize'];
  return (
    <div className="flex items-center gap-2 text-xs">
      {labels.map((lb, i) => (
        <div key={lb} className="flex items-center gap-2">
          <div className={`size-6 grid place-items-center rounded-full border ${i===step? 'bg-[#BFF7E0] border-[#BFF7E0] text-slate-900' : i<step? 'bg-[#2BC48A] border-[#2BC48A] text-white' : 'bg-white border-slate-300 text-slate-600'}`}>{i<step?'✓':i}</div>
          <span className={`${i===step?'text-slate-900':'text-slate-500'}`}>{lb}</span>
          {i<labels.length-1 && <div className="w-8 h-1 rounded-full bg-slate-200" />}
        </div>
      ))}
    </div>
  );
}

function ActionCard({ title, subtitle, onClick, icon }) {
  return (
    <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} onClick={onClick}
      className="p-4 rounded-2xl border bg-white hover:shadow-md text-left">
      <div className="flex items-center gap-3">
        <div className="size-9 grid place-items-center rounded-xl bg-[#E8FFF5] text-[#0F766E]">{icon}</div>
        <div>
          <div className="font-semibold">{title}</div>
          <div className="text-[11px] text-slate-600">{subtitle}</div>
        </div>
      </div>
    </motion.button>
  );
}

function DropZoneInline({ onPick }) {
  const iref = useRef(null);
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-300 p-4 grid place-items-center bg-white">
      <div className="text-center text-xs text-slate-700">
        <div className="mb-2">Upload clothing/product image (PNG/JPG)</div>
        <div className="flex items-center justify-center gap-2">
          <button onClick={()=>iref.current?.click()} className={`${ACCENT_RING} text-xs px-3 py-1.5 rounded-lg border bg-white hover:bg-slate-50`}>Choose file</button>
          <span className="text-slate-400">or drag & drop / paste</span>
        </div>
      </div>
      <input ref={iref} type="file" accept="image/*" className="hidden" onChange={async (e)=>{ const f=e.target.files?.[0]; if (f) await onPick(f); }} />
    </div>
  );
}

function SmallPreset({ title, onClick }) {
  return (
    <button onClick={onClick} className="rounded-xl border bg-white px-3 py-2 text-xs text-left hover:bg-slate-50">
      {title}
    </button>
  );
}

function ChipGroup({ label, options, value, onToggle, single=false }) {
  const isActive = (id) => value instanceof Set ? value.has(id) : value === id;
  return (
    <div>
      <div className="text-[12px] font-semibold text-slate-700 mb-1">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button key={opt}
            onClick={() => {
              if (single) onToggle(opt);
              else onToggle(opt);
            }}
            className={`px-3 py-1.5 text-xs rounded-lg border ${isActive(opt)? 'bg-[#2BC48A] text-white border-[#2BC48A]':'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'}`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function StrengthSlider({ value, onChange }) {
  return (
    <label className="flex items-center gap-2 text-xs">
      <span className="min-w-24 text-slate-700">Strength</span>
      <input type="range" min={0} max={100} value={value} onChange={(e)=>onChange(Number(e.target.value))} className="flex-1" />
      <span className="w-10 text-right">{value}</span>
    </label>
  );
}