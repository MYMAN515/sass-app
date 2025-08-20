'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';

/**
 * MintLemon Studio — Dashboard (Single-Image Try-On + Presets)
 * ------------------------------------------------------------
 * - Try-On redesigned to generate a virtual model from prompt (no model image)
 * - Persona / Pose & Camera / Scene & Lighting presets + Quick Presets
 * - Live prompt preview, chips for Fit/Aspect/Shadow
 * - Mobile-first, mint–lemon aesthetic, soft glass UI
 *
 * NOTE:
 * - /api/tryon now receives a SINGLE garment image + prompt.
 *   Payload includes `image` (and `image2` for backward-compat).
 * - If you're on App Router, swap next/router → next/navigation useRouter.
 */

/* -------------------------------------------------------
   Theme helpers
------------------------------------------------------- */
const MINT = '#D8FFEA';
const LEMON = '#FFF7B3';
const ease = [0.22, 1, 0.36, 1];

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
  return Array.isArray(obj) ? obj[0] : '';
};

/* -------------------------------------------------------
   ENHANCE PRESETS (unchanged)
------------------------------------------------------- */
const ENHANCE_PRESETS = [
  {
    id: 'studio-white',
    title: 'Studio White',
    subtitle: 'Soft light • seamless',
    tag: 'Popular',
    config: {
      photographyStyle: 'studio product, 50mm prime',
      background: 'white seamless sweep',
      lighting: 'large softbox, gentle reflections',
      colorStyle: 'neutral whites, subtle grays',
      realism: 'hyperrealistic details',
      outputQuality: '4k sharp',
    },
    preview: '/clean-studio.webp',
  },
  {
    id: 'mint-aura',
    title: 'Mint Aura',
    subtitle: 'Fresh • airy',
    tag: 'Fresh',
    config: {
      photographyStyle: 'editorial catalog',
      background: 'mint haze gradient',
      lighting: 'soft key + fill, micro-contrast',
      colorStyle: 'mint, white, soft gray',
      realism: 'photoreal textures',
      outputQuality: '4k',
    },
    preview: '/desert-tones.webp',
  },
  {
    id: 'lemon-sun',
    title: 'Lemon Sun',
    subtitle: 'Warm • bright',
    tag: 'Crisp',
    config: {
      photographyStyle: 'hero product shot',
      background: 'lemon beige gradient',
      lighting: 'golden hour, clean shadows',
      colorStyle: 'beige, sand, lemon',
      realism: 'high fidelity',
      outputQuality: '4k print',
    },
    preview: '/editorial-beige.webp',
  },
  {
    id: 'slate-pop',
    title: 'Slate Pop',
    subtitle: 'Cool • contrast',
    tag: 'Bold',
    config: {
      photographyStyle: 'e-commerce hero',
      background: 'cool slate vignette',
      lighting: 'hard rim + specular control',
      colorStyle: 'deep slate, white highlights',
      realism: 'crisp edges',
      outputQuality: '4k',
    },
    preview: '/slate-contrast.webp',
  },
];

/* -------------------------------------------------------
   TRY-ON (single image) — Presets Data
------------------------------------------------------- */
// Persona (no real people; abstract virtual model descriptors)
const PERSONA_PRESETS = [
  { id: 'female_clean', label: 'Female — Clean', gender: 'female', body_shape: 'regular', skin_tone: 'III', hair_or_hijab: 'long hair', age_range: '25-30', height: 'average' },
  { id: 'female_modest', label: 'Female — Hijab', gender: 'female', body_shape: 'regular', skin_tone: 'III', hair_or_hijab: 'hijab', age_range: '25-30', height: 'average' },
  { id: 'male_beard', label: 'Male — Beard', gender: 'male', body_shape: 'regular', skin_tone: 'IV', hair_or_hijab: 'short hair + beard', age_range: '28-35', height: 'average' },
  { id: 'female_plus', label: 'Female — Plus Size', gender: 'female', body_shape: 'plus-size', skin_tone: 'V', hair_or_hijab: 'covered hair', age_range: '28-35', height: 'average' },
  { id: 'teen_unisex', label: 'Teen — Unisex', gender: 'unisex', body_shape: 'slim', skin_tone: 'IV', hair_or_hijab: 'short hair', age_range: '16-18', height: 'average' },
  { id: 'male_business', label: 'Male — Business', gender: 'male', body_shape: 'regular', skin_tone: 'II', hair_or_hijab: 'short hair', age_range: '30-40', height: 'tall' },
];

// Pose & Camera
const POSE_PRESETS = [
  { id: 'front_mid', label: 'Front / Mid', pose: 'front', camera_distance: 'mid' },
  { id: 'threeq_mid', label: '3/4 / Mid', pose: 'three-quarter', camera_distance: 'mid' },
  { id: 'side_mid', label: 'Side / Mid', pose: 'side', camera_distance: 'mid' },
  { id: 'front_full', label: 'Front / Full', pose: 'front', camera_distance: 'full' },
  { id: 'front_close', label: 'Front / Close-up', pose: 'front', camera_distance: 'close-up' },
];

// Scene & Lighting
const SCENE_PRESETS = [
  { id: 'studio_white', label: 'Studio White + Softbox', backdrop: 'white seamless background', lighting: 'large softbox' },
  { id: 'mint_rim', label: 'Mint Gradient + Soft Rim', backdrop: 'mint haze gradient', lighting: 'soft rim + fill' },
  { id: 'lemon_editorial', label: 'Lemon Beige + Editorial Glow', backdrop: 'lemon beige gradient', lighting: 'editorial glow' },
  { id: 'slate_contrast', label: 'Slate Vignette + High Contrast', backdrop: 'cool slate vignette', lighting: 'high contrast studio' },
  { id: 'street_day', label: 'Street Daylight', backdrop: 'neutral city daylight', lighting: 'soft daylight with gentle shadow' },
];

// 1-click Quick Presets (combine Persona + Pose + Scene)
const QUICK_PRESETS = [
  { id: 'qp_f_clean', title: 'E-Comm Clean (Female)', persona: 'female_clean', pose: 'front_mid', scene: 'studio_white' },
  { id: 'qp_m_clean', title: 'E-Comm Clean (Male)', persona: 'male_beard', pose: 'threeq_mid', scene: 'studio_white' },
  { id: 'qp_modest', title: 'Modest Hijab', persona: 'female_modest', pose: 'front_mid', scene: 'mint_rim' },
  { id: 'qp_plus', title: 'Plus-Size Confidence', persona: 'female_plus', pose: 'side_mid', scene: 'studio_white' },
  { id: 'qp_street', title: 'Street Casual', persona: 'teen_unisex', pose: 'threeq_mid', scene: 'street_day' },
  { id: 'qp_business', title: 'Business Male', persona: 'male_business', pose: 'front_full', scene: 'slate_contrast' },
];

/* -------------------------------------------------------
   Toasts (with progress)
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
            initial={{ y: 18, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 18, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="rounded-2xl border border-zinc-200 bg-white/90 backdrop-blur shadow-lg p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-zinc-900">{t.msg}</div>
              <button className="text-xs text-zinc-600 hover:text-zinc-900" onClick={() => onClose(t.id)}>✕</button>
            </div>
            {typeof t.progress === 'number' && (
              <div className="mt-2 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                <div className="h-full bg-zinc-900 transition-all" style={{ width: `${Math.min(Math.max(t.progress, 0), 100)}%` }} />
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------
   Dashboard Root
------------------------------------------------------- */
const GROUPS = [
  { id: 'product', label: 'Product', icon: BoxIcon },
  { id: 'people', label: 'People', icon: PersonIcon },
];

const PRODUCT_TOOLS = [
  { id: 'removeBg', label: 'Remove BG', icon: ScissorsIcon },
  { id: 'enhance', label: 'Enhance', icon: RocketIcon },
];

const PEOPLE_TOOLS = [
  { id: 'tryon', label: 'Try-On', icon: PersonIcon },
  { id: 'modelSwap', label: 'Model Swap', icon: SwapIcon },
];

export default function Dashboard() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const router = useRouter();
  const toasts = useToasts();

  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState('people'); // default users land on Try-On
  const [tool, setTool] = useState('tryon');
  const [plan, setPlan] = useState('Free');

  // Work items
  const [file, setFile] = useState(null);
  const [localUrl, setLocalUrl] = useState('');
  const [imageData, setImageData] = useState('');
  const [resultUrl, setResultUrl] = useState('');

  // Compare overlay
  const [compare, setCompare] = useState(false);
  const [compareOpacity, setCompareOpacity] = useState(50);

  // Model Swap (kept for completeness)
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [local1, setLocal1] = useState('');
  const [local2, setLocal2] = useState('');
  const [swapPrompt, setSwapPrompt] = useState('');

  // Try-On (single image) selections
  const [pieceType, setPieceType] = useState(null); // upper / lower / dress / outfit
  const [tryonStep, setTryonStep] = useState('cloth'); // cloth → piece → options
  const [personaId, setPersonaId] = useState(PERSONA_PRESETS[0].id);
  const [poseId, setPoseId] = useState(POSE_PRESETS[0].id);
  const [sceneId, setSceneId] = useState(SCENE_PRESETS[0].id);
  const [fit, setFit] = useState('regular');
  const [aspect, setAspect] = useState('1:1'); // 1:1 / 4:5 / 3:2
  const [shadowOn, setShadowOn] = useState(true);
  const [faceMode, setFaceMode] = useState('subtle'); // subtle / none / natural

  const [phase, setPhase] = useState('idle');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [history, setHistory] = useState([]);

  // Remove BG design
  const [bgMode, setBgMode] = useState('gradient'); // color | gradient | pattern
  const [color, setColor] = useState('#ffffff');
  const [color2, setColor2] = useState('#E8FFF4');
  const [angle, setAngle] = useState(30);
  const [radius, setRadius] = useState(24);
  const [padding, setPadding] = useState(20);
  const [shadow, setShadow] = useState(true);
  const [patternOpacity, setPatternOpacity] = useState(0.06);

  const dropRef = useRef(null);
  const inputRef = useRef(null);
  const inputRef1 = useRef(null);
  const inputRef2 = useRef(null);

  /* ---------- auth + plan ---------- */
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (user === undefined) return;
      if (!user) {
        router.replace('/login');
        return;
      }
      try {
        const { data } = await supabase.from('Data').select('plan').eq('user_id', user.id).single();
        if (!mounted) return;
        setPlan(data?.plan || 'Free');
      } catch {}
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [user, router, supabase]);

  /* ---------- drop & paste --------- */
  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;
    const over = (e) => { e.preventDefault(); el.classList.add('ring-2', 'ring-zinc-300'); };
    const leave = () => el.classList.remove('ring-2', 'ring-zinc-300');
    const drop = async (e) => {
      e.preventDefault(); leave();
      const f = e.dataTransfer.files?.[0];
      if (f) await onPick(f);
    };
    el.addEventListener('dragover', over);
    el.addEventListener('dragleave', leave);
    el.addEventListener('drop', drop);

    const onPaste = async (e) => {
      const item = Array.from(e.clipboardData?.items || []).find((it) => it.type.startsWith('image/'));
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
    setErr('');
    setPhase('idle');
    if (tool === 'removeBg') setImageData(await fileToDataURL(f));
    if (tool === 'tryon') setTryonStep('piece');
  };

  /* ---------- computed styles --------- */
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
      bgStyle = {
        backgroundColor: color,
        backgroundImage: `url("data:image/svg+xml;utf8,${svg}")`,
        backgroundSize: '24px 24px',
      };
    }
    return {
      ...bgStyle,
      borderRadius: 16,
      padding: 16,
      boxShadow: shadow ? '0 22px 60px rgba(0,0,0,.08), 0 8px 20px rgba(0,0,0,.05)' : 'none',
      transition: 'all .25s ease',
    };
  }, [bgMode, color, color2, angle, shadow, patternOpacity]);

  /* ---------- storage ---------- */
  const uploadToStorage = useCallback(
    async (f) => {
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
    },
    [supabase, user]
  );

  /* ---------- prompts ---------- */
  const getPersona = (id) => PERSONA_PRESETS.find(p => p.id === id);
  const getPose = (id) => POSE_PRESETS.find(p => p.id === id);
  const getScene = (id) => SCENE_PRESETS.find(s => s.id === id);

  const buildTryOnPromptFromCards = () => {
    const persona = getPersona(personaId);
    const pose = getPose(poseId);
    const scene = getScene(sceneId);

    // Aspect to wording
    const aspectWords = aspect === '1:1' ? 'square 1:1' : aspect === '4:5' ? 'portrait 4:5' : 'landscape 3:2';
    const faceText =
      faceMode === 'none' ? 'no visible face; no identity; ' :
      faceMode === 'subtle' ? 'subtle, non-identifiable face features; ' : 'natural face; ';

    return [
      'Generate a photorealistic fashion model (virtual, not a real person) wearing the garment from the input image only.',
      `Persona: ${persona.gender}, ${persona.body_shape} body, skin tone ${persona.skin_tone}, ${persona.hair_or_hijab}, approx ${persona.height} height, age ${persona.age_range}.`,
      `Pose & Camera: ${pose.pose} orientation, ${pose.camera_distance} framing, centered body, realistic proportions.`,
      `Scene & Lighting: ${scene.backdrop}, ${scene.lighting}, ${shadowOn ? 'coherent ground shadow,' : 'no ground shadow,'} ${aspectWords} composition.`,
      faceText + 'no brands, no extra text.',
      'Preserve garment anatomy exactly: sleeves, collar, hem, waistband, seams, logos; align scale to torso; natural fabric drape; avoid cropping garment edges.',
      `Clothing placement: ${pieceType ? (pieceType === 'upper' ? 'TOP' : pieceType === 'lower' ? 'BOTTOM' : pieceType === 'dress' ? 'FULL DRESS' : 'FULL OUTFIT') : 'TOP'}.`,
      `Fit style: ${fit}. Output 4k, crisp edges, clean studio result.`,
      'If any region is occluded in source, inpaint realistically to complete without altering design.',
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
      const out = pickFirstUrl(j);
      if (!out) throw new Error('No output from remove-bg');
      setResultUrl(out);
      setHistory((h) => [{ tool: 'Remove BG', inputThumb: localUrl, outputUrl: out, ts: Date.now() }, ...h].slice(0, 24));
      setPhase('ready');
      t.update({ progress: 100, msg: 'Background removed ✓' });
      setTimeout(() => t.close(), 700);
    } catch (e) {
      console.error(e); setPhase('error'); setErr('Failed to process.');
      t.update({ msg: 'Remove BG failed', type: 'error' });
      setTimeout(() => t.close(), 1500);
    } finally { clearInterval(iv); setBusy(false); }
  }, [file, imageData, localUrl, toasts]);

  const runEnhance = useCallback(
    async (selections) => {
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
        const out = pickFirstUrl(j);
        if (!out) throw new Error('No output from enhance');
        setResultUrl(out);
        setHistory((h) => [{ tool: 'Enhance', inputThumb: localUrl, outputUrl: out, ts: Date.now() }, ...h].slice(0, 24));
        setPhase('ready');
        t.update({ progress: 100, msg: 'Enhanced ✓' });
        setTimeout(() => t.close(), 700);
      } catch (e) {
        console.error(e); setPhase('error'); setErr('Failed to process.');
        t.update({ msg: 'Enhance failed', type: 'error' });
        setTimeout(() => t.close(), 1500);
      } finally { clearInterval(iv); setBusy(false); }
    },
    [file, uploadToStorage, plan, user, localUrl, toasts]
  );

  const runTryOn = useCallback(async () => {
    if (!file) { setErr('Please upload a clothing image first.'); return; }
    if (!pieceType) { setErr('Please choose the clothing type.'); return; }

    setBusy(true); setErr(''); setPhase('processing');

    const prompt = buildTryOnPromptFromCards();
    const toast = toasts.push('Generating try-on…', { progress: 10 });
    let progress = 10; const iv = setInterval(() => { progress = Math.min(progress + 6, 88); toast.update({ progress }); }, 500);

    try {
      const clothUrl = await uploadToStorage(file);

      // Send only ONE image. Include image2 for backward-compat if backend still expects it.
      const payload = {
        image: clothUrl,
        image2: clothUrl,
        pieceType,
        plan,
        user_email: user.email,
        prompt,
        aspect, // optional hint to backend
      };

      const r = await fetch('/api/tryon', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        const msg = j?.error || (r.status === 500 ? 'Generation failed on the server.' : `Unexpected error (${r.status}).`);
        throw new Error(msg);
      }

      const out = j?.image || j?.url || j?.result || (Array.isArray(j?.output) ? j.output[0] : '');
      if (!out) throw new Error('No output image returned from the API.');

      setResultUrl(out);
      setHistory((h) => [{ tool: 'Try-On', inputThumb: localUrl, outputUrl: out, ts: Date.now() }, ...h].slice(0, 24));
      setPhase('ready');
      toast.update({ progress: 100, msg: 'Try-On ✓' });
      setTimeout(() => toast.close(), 700);
    } catch (e) {
      console.error(e);
      setPhase('error'); setErr(e?.message || 'Processing failed.');
      toast.update({ msg: `Try-On failed: ${e?.message || 'Error'}`, type: 'error' });
      setTimeout(() => toast.close(), 1500);
    } finally {
      clearInterval(iv); setBusy(false);
    }
  }, [file, pieceType, uploadToStorage, plan, user, toasts, aspect, buildTryOnPromptFromCards, localUrl]);

  const runModelSwap = useCallback(
    async () => {
      if (!file1 || !file2) return setErr('Pick both images.');
      setBusy(true); setErr(''); setPhase('processing');
      const [image1, image2] = await Promise.all([uploadToStorage(file1), uploadToStorage(file2)]);
      const t = toasts.push('Running Model Swap…', { progress: 10 });
      let adv = 10; const iv = setInterval(() => { adv = Math.min(adv + 6, 88); t.update({ progress: adv }); }, 500);
      try {
        const r = await fetch('/api/model', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image1, image2, prompt: swapPrompt, plan, user_email: user.email }),
        });
        const j = await r.json();
        if (!r.ok) throw new Error(j?.error || 'model swap failed');
        const out = pickFirstUrl(j) || j?.url || j?.image;
        if (!out) throw new Error('No output from model.');
        setResultUrl(out);
        setHistory((h) => [{ tool: 'Model Swap', inputThumb: local1, outputUrl: out, ts: Date.now() }, ...h].slice(0, 24));
        setPhase('ready');
        t.update({ progress: 100, msg: 'Model Swap done ✓' });
        setTimeout(() => t.close(), 700);
      } catch (e) {
        console.error(e); setPhase('error'); setErr('Failed to process.');
        t.update({ msg: 'Model Swap failed', type: 'error' });
        setTimeout(() => t.close(), 1500);
      } finally { clearInterval(iv); setBusy(false); }
    },
    [file1, file2, swapPrompt, uploadToStorage, plan, user, local1, toasts]
  );

  /* ---------- handlers ---------- */
  const resetAll = () => {
    setFile(null); setLocalUrl(''); setResultUrl('');
    setFile1(null); setFile2(null); setLocal1(''); setLocal2('');
    setErr(''); setPhase('idle'); setCompare(false);
    setPieceType(null); setTryonStep(tool === 'tryon' ? 'cloth' : 'cloth');
  };

  const switchTool = (nextId) => {
    setTool(nextId);
    setResultUrl(''); setErr(''); setPhase('idle'); setCompare(false);
    setFile(null); setLocalUrl('');
    setFile1(null); setFile2(null); setLocal1(''); setLocal2('');
    setPieceType(null); setTryonStep(nextId === 'tryon' ? 'cloth' : 'cloth');
  };

  const handleRun = () => {
    if (group === 'product') {
      if (tool === 'removeBg') return runRemoveBg();
      if (tool === 'enhance') return setShowEnhance(true);
    } else {
      if (tool === 'tryon') return runTryOn();
      if (tool === 'modelSwap') return runModelSwap();
    }
  };

  // Enhance modal
  const [pendingEnhancePreset, setPendingEnhancePreset] = useState(null);
  const [showEnhance, setShowEnhance] = useState(false);

  /* ---------- UI ---------- */
  if (loading || user === undefined) {
    return (
      <main className="min-h-screen grid place-items-center bg-gradient-to-b from-[#F3FFF8] via-[#FFFCE8] to-white text-zinc-700">
        <div className="rounded-2xl bg-white/80 backdrop-blur px-4 py-3 border border-zinc-200 shadow-sm text-sm">Loading…</div>
      </main>
    );
  }
  if (!user) return null;

  const initials = (() => {
    const n = user?.user_metadata?.name || user?.email || 'U';
    const p = n.split(' ').filter(Boolean);
    return ((p[0]?.[0] || n[0]) + (p[1]?.[0] || '')).toUpperCase();
  })();

  const livePrompt = buildTryOnPromptFromCards();

  return (
    <main className="relative min-h-screen w-full overflow-clip bg-gradient-to-b from-[#F3FFF8] via-[#FFFCE8] to-white text-zinc-900">
      <BackgroundAuras />

      {/* Top bar */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="sticky top-0 z-40 border-b border-zinc-200/60 backdrop-blur bg-white/60"
      >
        <div className="mx-auto max-w-7xl px-3 md:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid place-items-center size-9 rounded-xl bg-gradient-to-br from-[#CFFAE2] to-[#FFF0A6] text-zinc-900 shadow-sm">
              <SparkleIcon className="w-4 h-4" />
            </div>
            <div className="leading-tight">
              <div className="font-semibold">Studio</div>
              <div className="text-[11px] text-zinc-600">Fresh • Clean • Fast</div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1">Plan: {plan}</span>
            <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 flex items-center gap-2">
              <span className="grid place-items-center size-6 rounded-full bg-zinc-100 font-bold text-zinc-700">{initials}</span>
              {user.user_metadata?.name || user.email}
            </span>
          </div>
        </div>
      </motion.header>

      {/* Main grid */}
      <div className="relative mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 md:gap-6 px-3 md:px-6 lg:px-8 py-4 md:py-6">
        {/* Sidebar */}
        <motion.aside
          layout
          className="rounded-3xl border border-zinc-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm sticky top-20 h-fit"
        >
          <div className="px-4 py-4 flex items-center gap-3 border-b border-zinc-200/80">
            <div className="grid place-items-center size-10 rounded-2xl bg-gradient-to-br from-[#CFFAE2] to-[#FFF0A6] text-zinc-900 shadow">
              <SparkleIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold tracking-tight text-zinc-900 text-[15px]">Workspace</div>
              <div className="text-[11px] text-zinc-600">Pick group & tools</div>
            </div>
          </div>

          <div className="px-3 py-3">
            <div className="text-[11px] font-semibold text-zinc-700 mb-1">Group</div>
            <div className="inline-flex rounded-full border border-zinc-200 bg-white p-1">
              {GROUPS.map((g) => {
                const Active = group === g.id;
                const Icon = g.icon;
                return (
                  <button
                    key={g.id}
                    onClick={() => {
                      setGroup(g.id);
                      switchTool(g.id === 'product' ? 'enhance' : 'tryon');
                    }}
                    className={[
                      'inline-flex items-center gap-2 py-1.5 px-3 rounded-full text-sm transition',
                      Active ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-900 hover:bg-zinc-100',
                    ].join(' ')}
                  >
                    <Icon className="size-4" /> {g.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-3 pb-3">
            <div className="text-[11px] font-semibold text-zinc-700 mb-1">Tools</div>
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
                        ? 'bg-white text-zinc-900 border-zinc-200 shadow-sm'
                        : 'text-zinc-900 hover:bg-white/70 border-transparent',
                    ].join(' ')}
                  >
                    <Icon className={['size-4', Active ? 'text-zinc-900' : 'text-zinc-500 group-hover:text-zinc-700'].join(' ')} />
                    <span className="truncate">{t.label}</span>
                    {!Active && <motion.span layoutId={`dot-${t.id}`} className="ml-auto size-1.5 rounded-full bg-zinc-300" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-4 py-3 border-t border-zinc-200/80">
            <div className="flex items-center gap-3">
              <div className="grid place-items-center size-10 rounded-full bg-zinc-100 text-zinc-800 font-bold">{initials}</div>
              <div className="text-sm">
                <div className="font-medium leading-tight text-zinc-900">{user.user_metadata?.name || user.email}</div>
                <div className="text-[11px] text-zinc-600">Plan: {plan}</div>
              </div>
            </div>
          </div>
        </motion.aside>

        {/* Main column */}
        <section className="space-y-5 md:space-y-6">
          {/* Header Card */}
          <motion.div layout className="rounded-3xl border border-zinc-200 bg-white/70 backdrop-blur p-4 sm:p-5 md:p-6 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900">
                  {group === 'product' ? 'Presets & Actions' : tool === 'tryon' ? 'Try-On (Single Image)' : 'Model Swap'}
                </h1>
                <p className="text-zinc-700/80 text-xs sm:text-sm">
                  {group === 'product'
                    ? 'Choose a preset or open Customize.'
                    : tool === 'tryon'
                    ? 'Step 1: upload clothing → Step 2: choose type → Step 3: select presets → Run.'
                    : 'Upload two images and write a short instruction, then run Model Swap.'}
                </p>
              </div>

              {group === 'product' ? (
                <button
                  onClick={() => { setTool('enhance'); setPendingEnhancePreset(null); setShowEnhance(true); }}
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs sm:text-sm font-semibold hover:bg-zinc-50 text-zinc-900"
                >
                  ✨ Customize Enhance
                </button>
              ) : tool === 'tryon' ? (
                pieceType ? (
                  <button
                    onClick={() => setTryonStep('piece')}
                    className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs sm:text-sm font-semibold hover:bg-zinc-50 text-zinc-900"
                  >
                    Change clothing type
                  </button>
                ) : null
              ) : null}
            </div>

            {group === 'product' ? (
              <div className="mt-4">
                <div className="mb-2 text-[12px] font-semibold text-zinc-700">Enhance</div>
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
              <div className="mt-4 space-y-3">
                {/* Stepper */}
                <TryOnStepper step={tryonStep} pieceType={pieceType} />

                {/* Quick Presets */}
                {tryonStep === 'options' ? (
                  <div className="rounded-2xl border border-zinc-200 bg-white/70 p-3">
                    <div className="mb-2 text-[12px] font-semibold text-zinc-700">Quick Presets</div>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {QUICK_PRESETS.map(q => (
                        <QuickPresetCard
                          key={q.id}
                          title={q.title}
                          active={personaId === q.persona && poseId === q.pose && sceneId === q.scene}
                          onClick={() => { setPersonaId(q.persona); setPoseId(q.pose); setSceneId(q.scene); }}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Persona / Pose / Scene */}
                {tryonStep === 'options' ? (
                  <div className="grid gap-3 lg:grid-cols-3">
                    <PresetGroup
                      title="Persona"
                      items={PERSONA_PRESETS}
                      activeId={personaId}
                      onSelect={setPersonaId}
                      getSubtitle={(p) => `${p.gender}, ${p.body_shape}, tone ${p.skin_tone}`}
                    />
                    <PresetGroup
                      title="Pose & Camera"
                      items={POSE_PRESETS}
                      activeId={poseId}
                      onSelect={setPoseId}
                      getSubtitle={(p) => `${p.pose}, ${p.camera_distance}`}
                    />
                    <PresetGroup
                      title="Scene & Lighting"
                      items={SCENE_PRESETS}
                      activeId={sceneId}
                      onSelect={setSceneId}
                      getSubtitle={(s) => s.lighting}
                    />
                  </div>
                ) : tryonStep === 'piece' ? (
                  <div className="mt-3">
                    <div className="text-[12px] font-semibold text-zinc-700 mb-2">Choose clothing type</div>
                    <PieceChips value={pieceType} onChange={(v) => { setPieceType(v); setTryonStep('options'); }} />
                  </div>
                ) : (
                  <div className="mt-3 rounded-2xl border border-dashed border-zinc-300/70 p-4 text-xs text-zinc-700 bg-white/60">
                    Upload clothing first, then choose type. Presets will appear next.
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-4">
                <div className="mb-2 text-[12px] font-semibold text-zinc-700">Model Swap</div>
                <div className="text-xs text-zinc-700/80">Upload two images below and write a short instruction.</div>
              </div>
            )}
          </motion.div>

          {/* Workbench */}
          <div className="grid gap-4 md:gap-6 lg:grid-cols-[1fr_360px]">
            {/* Canvas Panel */}
            <section className="rounded-3xl border border-zinc-200 bg-white/70 backdrop-blur relative shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 px-3 sm:px-4 md:px-5 pt-3 md:pt-4">
                <div className="inline-flex rounded-full border border-zinc-200 bg-white p-1">
                  {(group === 'product' ? PRODUCT_TOOLS : PEOPLE_TOOLS).map((it) => {
                    const Active = tool === it.id;
                    const Icon = it.icon;
                    return (
                      <button
                        key={it.id}
                        onClick={() => switchTool(it.id)}
                        className={[
                          'inline-flex items-center gap-2 py-1.5 px-3 rounded-full text-sm transition',
                          Active ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-900 hover:bg-zinc-100',
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
                  <button onClick={resetAll} className="text-xs px-2 py-1 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-900">
                    Reset
                  </button>
                </div>
              </div>

              {/* Drop areas */}
              {tool !== 'modelSwap' ? (
                <div
                  ref={dropRef}
                  className="m-3 sm:m-4 md:m-5 min-h-[260px] sm:min-h-[320px] md:min-h-[380px] grid place-items-center rounded-3xl border-2 border-dashed border-zinc-300/80 bg-white/60 hover:bg-white/70 transition cursor-pointer"
                  onClick={() => inputRef.current?.click()}
                  title="Drag & drop / Click / Paste (Ctrl+V)"
                >
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => { const f = e.target.files?.[0]; if (f) await onPick(f); }}
                  />
                  {!localUrl && !resultUrl ? (
                    <div className="text-center text-zinc-700 text-sm">
                      <div className="mx-auto mb-3 grid place-items-center size-10 sm:size-12 rounded-full bg-white border border-zinc-200">⬆</div>
                      {tool === 'tryon' ? 'Upload a clothing image (PNG/JPG). Transparent PNG preferred.' : 'Drag & drop an image here, click to choose, or paste (Ctrl+V)'}
                    </div>
                  ) : (
                    <div className="relative w-full h-full grid place-items-center p-2 sm:p-3">
                      {compare && localUrl && resultUrl ? (
                        <div className="relative max-w-full max-h-[70vh]">
                          <img src={resultUrl} alt="after" className="max-w-full max-h-[70vh] object-contain rounded-2xl" />
                          <img src={localUrl} alt="before" style={{ opacity: compareOpacity / 100 }} className="absolute inset-0 w-full h-full object-contain rounded-2xl pointer-events-none" />
                        </div>
                      ) : (
                        <img src={resultUrl || localUrl} alt="preview" className="max-w-full max-h-[70vh] object-contain rounded-2xl" draggable={false} loading="lazy" />
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="m-3 sm:m-4 md:m-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FileDrop label="Image 1" file={file1} localUrl={local1} onPick={async (f) => { setFile1(f); setLocal1(URL.createObjectURL(f)); setResultUrl(''); setPhase('idle'); }} inputRef={inputRef1} />
                    <FileDrop label="Image 2" file={file2} localUrl={local2} onPick={async (f) => { setFile2(f); setLocal2(URL.createObjectURL(f)); setResultUrl(''); setPhase('idle'); }} inputRef={inputRef2} />
                  </div>
                  <div className="mt-3">
                    <label className="text-xs text-zinc-700">Prompt</label>
                    <input value={swapPrompt} onChange={(e) => setSwapPrompt(e.target.value)} placeholder="Describe how to combine or arrange the two images…" className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm" />
                  </div>

                  {resultUrl && (
                    <div className="mt-4">
                      <div className="text-xs text-zinc-700 mb-2">Result</div>
                      <div className="w-full rounded-2xl border border-zinc-200 bg-white/60 p-2 grid place-items-center">
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
                    busy ||
                    (tool === 'modelSwap'
                      ? !file1 || !file2
                      : tool === 'tryon'
                      ? !file || !pieceType
                      : !file)
                  }
                  className="inline-flex items-center gap-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white px-3 sm:px-4 py-2 text-sm font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {busy ? 'Processing…' : (<><PlayIcon className="size-4" /> Run {tool === 'modelSwap' ? 'Model Swap' : tool === 'removeBg' ? 'Remove BG' : tool === 'enhance' ? 'Enhance' : 'Try-On'}</>)}
                </button>

                {resultUrl && (
                  <>
                    <button onClick={() => exportPngSafe(resultUrl)} className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 sm:px-4 py-2 text-sm font-semibold hover:bg-zinc-50 text-zinc-900">
                      ⬇ Download PNG
                    </button>
                    <a href={resultUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-2.5 py-2 text-xs font-semibold hover:bg-zinc-50 text-zinc-900">
                      ↗ Open
                    </a>
                    <button onClick={() => { navigator.clipboard.writeText(resultUrl).catch(() => {}); }} className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-2.5 py-2 text-xs font-semibold hover:bg-zinc-50 text-zinc-900">
                      🔗 Copy URL
                    </button>

                    {tool !== 'modelSwap' && localUrl && (
                      <>
                        <label className="inline-flex items-center gap-2 text-xs ml-1 sm:ml-2 text-zinc-900">
                          <input type="checkbox" checked={compare} onChange={(e) => setCompare(e.target.checked)} />
                          Compare
                        </label>
                        {compare && (
                          <div className="flex items-center gap-2">
                            <input type="range" min={0} max={100} value={compareOpacity} onChange={(e) => setCompareOpacity(Number(e.target.value))} className="accent-zinc-900" />
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
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-0 rounded-3xl grid place-items-center bg-white/60">
                    <div className="text-xs px-3 py-2 rounded-lg bg-white border border-zinc-200 shadow">Working…</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* Inspector */}
            <aside className="rounded-3xl border border-zinc-200 bg-white/70 backdrop-blur p-4 md:pb-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-zinc-900">Inspector</div>
                <span className="text-xs text-zinc-700">Tool: {tool}</span>
              </div>

              {/* Try-On inspector */}
              {tool === 'tryon' && (
                <div className="space-y-3 mt-3 text-xs">
                  <div className="rounded-xl border border-zinc-200 p-3 bg-white">
                    <div className="text-zinc-700 mb-1">Clothing</div>
                    {localUrl ? (
                      <img src={localUrl} alt="cloth" className="w-full max-h-48 object-contain rounded-lg border border-zinc-100 bg-white/60" />
                    ) : (
                      <div className="text-zinc-400">— Upload a clothing image —</div>
                    )}
                  </div>

                  <div className="rounded-xl border border-zinc-200 p-3 bg-white">
                    <div className="text-zinc-700 mb-1">Type</div>
                    <div className="flex items-center justify-between">
                      <div className="text-zinc-900">{pieceType ? pieceType : '—'}</div>
                      <button className="rounded-lg border border-zinc-200 px-2 py-1 text-[11px] bg-white hover:bg-zinc-50" onClick={() => setTryonStep('piece')}>
                        Change
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-zinc-200 p-3 bg-white space-y-2">
                    <div className="text-zinc-700">Fine Controls</div>
                    <div className="flex flex-wrap gap-1.5">
                      <Chip active={fit === 'regular'} onClick={() => setFit('regular')}>Fit: Regular</Chip>
                      <Chip active={fit === 'slim'} onClick={() => setFit('slim')}>Fit: Slim</Chip>
                      <Chip active={fit === 'oversized'} onClick={() => setFit('oversized')}>Fit: Oversized</Chip>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <Chip active={aspect === '1:1'} onClick={() => setAspect('1:1')}>1:1</Chip>
                      <Chip active={aspect === '4:5'} onClick={() => setAspect('4:5')}>4:5</Chip>
                      <Chip active={aspect === '3:2'} onClick={() => setAspect('3:2')}>3:2</Chip>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <Chip active={shadowOn} onClick={() => setShadowOn(true)}>Shadow: On</Chip>
                      <Chip active={!shadowOn} onClick={() => setShadowOn(false)}>Shadow: Off</Chip>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <Chip active={faceMode === 'subtle'} onClick={() => setFaceMode('subtle')}>Face: Subtle</Chip>
                      <Chip active={faceMode === 'none'} onClick={() => setFaceMode('none')}>Face: None</Chip>
                      <Chip active={faceMode === 'natural'} onClick={() => setFaceMode('natural')}>Face: Natural</Chip>
                    </div>
                  </div>

                  <div className="rounded-xl border border-zinc-200 p-3 bg-white">
                    <div className="text-zinc-700 mb-1">Live Prompt Preview</div>
                    <div className="text-[11px] leading-relaxed text-zinc-700 max-h-40 overflow-auto">
                      {livePrompt}
                    </div>
                  </div>

                  {resultUrl && (
                    <div className="rounded-xl border border-zinc-200 p-3 bg-white">
                      <div className="text-zinc-700 mb-2">Result</div>
                      <img src={resultUrl} alt="final" className="w-full max-h-64 object-contain rounded-md border border-zinc-100 bg-white/60" />
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
                      <Range value={patternOpacity} onChange={setPatternOpacity} min={0} max={0.5} step={0.01} />
                    </Field>
                  )}
                  <Field label="Radius">
                    <Range value={16} onChange={() => {}} min={0} max={48} />
                  </Field>
                  <Field label="Padding">
                    <Range value={16} onChange={() => {}} min={0} max={64} />
                  </Field>

                  <label className="mt-1 inline-flex items-center gap-2 text-xs text-zinc-800">
                    <input type="checkbox" checked={shadow} onChange={(e) => setShadow(e.target.checked)} />
                    Shadow
                  </label>

                  <div className="mt-3">
                    <div className="text-xs text-zinc-700 mb-2">Final Preview</div>
                    <div style={frameStyle} className="relative rounded-xl overflow-hidden border border-zinc-200">
                      <div className="relative w-full min-h-[140px] sm:min-h-[160px] grid place-items-center">
                        {resultUrl ? (
                          <img src={resultUrl} alt="final" className="max-w-full max-h-[38vh] object-contain" />
                        ) : (
                          <div className="grid place-items-center h-[140px] text-xs text-zinc-400">— Run Remove BG first —</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhance inspector */}
              {tool === 'enhance' && (
                <div className="space-y-2 text-xs text-zinc-700 mt-3">
                  <div>Choose a preset above or press <span className="font-semibold text-zinc-900">Customize</span>.</div>
                  {resultUrl && (
                    <div className="mt-2 rounded-2xl overflow-hidden border border-zinc-200 bg-white/60">
                      <div className="relative w-full min-h-[140px] grid place-items-center">
                        <img src={resultUrl} alt="final" className="max-w-full max-h-[38vh] object-contain" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Model Swap inspector */}
              {tool === 'modelSwap' && (
                <div className="text-xs text-zinc-700 mt-3 space-y-3">
                  <div className="rounded-xl border border-zinc-200 p-3 bg-white">
                    <div className="text-zinc-700 mb-1">Inputs</div>
                    <div className="grid grid-cols-2 gap-2">
                      {local1 ? (
                        <img src={local1} alt="image1" className="w-full h-24 object-cover rounded-md border border-zinc-100 bg-white/60" />
                      ) : (
                        <div className="h-24 grid place-items-center text-zinc-400 border border-zinc-100 rounded-md bg-white/60">— Image 1 —</div>
                      )}
                      {local2 ? (
                        <img src={local2} alt="image2" className="w-full h-24 object-cover rounded-md border border-zinc-100 bg-white/60" />
                      ) : (
                        <div className="h-24 grid place-items-center text-zinc-400 border border-zinc-100 rounded-md bg-white/60">— Image 2 —</div>
                      )}
                    </div>
                    {swapPrompt && (
                      <div className="mt-2 text-[11px] text-zinc-600">
                        Prompt: <span className="text-zinc-800">{swapPrompt}</span>
                      </div>
                    )}
                  </div>

                  {resultUrl && (
                    <div className="rounded-xl border border-zinc-200 p-3 bg-white">
                      <div className="text-zinc-700 mb-2">Result</div>
                      <img src={resultUrl} alt="model-swap-result" className="w-full max-h-64 object-contain rounded-md border border-zinc-100 bg-white/60" />
                    </div>
                  )}
                </div>
              )}
            </aside>
          </div>

          {/* History Dock */}
          <div className="rounded-3xl border border-zinc-200 bg-white/70 backdrop-blur p-4 md:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-zinc-900">History</div>
              {history.length > 0 && (
                <button onClick={() => setHistory([])} className="text-xs px-2 py-1 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-900">
                  Clear
                </button>
              )}
            </div>
            {history.length === 0 ? (
              <div className="text-xs text-zinc-600 px-1 py-4">— No renders yet —</div>
            ) : (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {history.map((h, i) => (
                  <button
                    key={i}
                    onClick={() => setResultUrl(h.outputUrl)}
                    className="group relative rounded-2xl overflow-hidden border border-zinc-200 hover:border-zinc-300 transition bg-white/60 min-w-[160px]"
                  >
                    <img src={h.outputUrl || h.inputThumb} alt="hist" className="w-[160px] h-[110px] object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 text-[10px] px-2 py-1 bg-zinc-800/50 text-white backdrop-blur">
                      {h.tool} • {new Date(h.ts).toLocaleTimeString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showEnhance && (
          <motion.div className="fixed inset-0 z-[100] grid place-items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/30" onClick={() => setShowEnhance(false)} />
            <div className="relative w-full max-w-3xl mx-3">
              <EnhanceCustomizer
                initial={pendingEnhancePreset || undefined}
                onComplete={(form) => { setShowEnhance(false); setPendingEnhancePreset(null); runEnhance(form); }}
              />
            </div>
          </motion.div>
        )}

        {/* Try-On piece chooser (if needed) */}
        {tryonStep === 'piece' && tool === 'tryon' && (
          <motion.div className="fixed inset-0 z-[110] grid place-items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/30" onClick={() => setTryonStep('cloth')} />
            <div className="relative w-full max-w-md mx-3">
              <PieceTypeModal
                initial={pieceType || 'upper'}
                onCancel={() => setTryonStep('cloth')}
                onConfirm={(type) => { setPieceType(type); setTryonStep('options'); }}
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
function BackgroundAuras() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-24 -left-16 h-80 w-80 rounded-full" style={{ background: MINT }} />
      <div className="absolute top-24 -right-16 h-80 w-80 rounded-full" style={{ background: LEMON }} />
      <div className="absolute bottom-10 left-1/3 h-64 w-64 rounded-full" style={{ background: '#E8FFF4' }} />
      <div className="blur-3xl absolute inset-0 opacity-60" style={{ background: 'radial-gradient(60% 40% at 30% 0%, #D8FFEA 0%, transparent 60%), radial-gradient(50% 40% at 100% 10%, #FFF7B3 0%, transparent 55%)' }} />
    </div>
  );
}

function FileDrop({ label, file, localUrl, onPick, inputRef }) {
  return (
    <div className="min-h-[220px] grid place-items-center rounded-2xl border-2 border-dashed border-zinc-300/80 bg-white/60 hover:bg-white/70 transition cursor-pointer" onClick={() => inputRef.current?.click()}>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) await onPick(f); }} />
      {!localUrl ? (
        <div className="text-center text-zinc-700 text-sm">
          <div className="mx-auto mb-3 grid place-items-center size-10 rounded-full bg-white border border-zinc-200">⬆</div>
          {label}: Click to choose
        </div>
      ) : (
        <img src={localUrl} alt={label} className="max-w-full max-h-[45vh] object-contain rounded-xl" />
      )}
    </div>
  );
}

function PresetCard({ title, subtitle, onClick, preview, tag }) {
  const [broken, setBroken] = useState(false);
  const [loaded, setLoaded] = useState(false);
  if (broken) return null;
  return (
    <motion.button onClick={onClick} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="group relative rounded-2xl overflow-hidden border border-zinc-200 hover:border-zinc-300 bg-white/80 backdrop-blur shadow-sm transition text-left hover:shadow-md">
      <div className="relative w-full aspect-[4/3] bg-zinc-50/60">
        {!loaded && <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#D8FFEA] via-white to-[#FFF7B3]" />}
        <img src={preview} alt={title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" onLoad={() => setLoaded(true)} onError={() => setBroken(true)} />
        {tag && <span className="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full bg-zinc-800/80 text-white shadow">{tag}</span>}
        <div className="absolute top-2 right-2 rounded-full bg-white/90 backdrop-blur px-2 py-1 text-[11px] border border-white shadow-sm">Use preset</div>
      </div>
      <div className="p-3">
        <div className="font-semibold text-zinc-900">{title}</div>
        <div className="text-xs text-zinc-700">{subtitle}</div>
      </div>
    </motion.button>
  );
}

function QuickPresetCard({ title, onClick, active }) {
  return (
    <motion.button onClick={onClick} whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
      className={[
        'rounded-xl border px-3 py-2 text-sm text-left transition',
        active ? 'border-zinc-400 bg-white shadow-sm' : 'border-zinc-200 bg-white/80 hover:bg-white'
      ].join(' ')}
    >
      {title}
    </motion.button>
  );
}

function PresetGroup({ title, items, activeId, onSelect, getSubtitle }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white/70 p-3">
      <div className="mb-2 text-[12px] font-semibold text-zinc-700">{title}</div>
      <div className="grid gap-2">
        {items.map((it) => (
          <button
            key={it.id}
            onClick={() => onSelect(it.id)}
            className={[
              'w-full text-left rounded-xl border px-3 py-2 text-sm transition',
              activeId === it.id ? 'border-zinc-400 bg-white' : 'border-zinc-200 hover:bg-white/70'
            ].join(' ')}
          >
            <div className="font-semibold text-zinc-900">{it.label}</div>
            <div className="text-[11px] text-zinc-600">{getSubtitle ? getSubtitle(it) : ''}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function PieceChips({ value, onChange }) {
  const opts = [
    { id: 'upper', label: 'Upper (T-shirt/Shirt/Jacket)' },
    { id: 'lower', label: 'Lower (Pants/Jeans/Skirt)' },
    { id: 'dress', label: 'Full Dress' },
    { id: 'outfit', label: 'Full Outfit' },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {opts.map(o => (
        <Chip key={o.id} active={value === o.id} onClick={() => onChange(o.id)}>
          {o.label}
        </Chip>
      ))}
    </div>
  );
}

function TryOnStepper({ step, pieceType }) {
  const map = { cloth: 0, piece: 1, options: 2 };
  const idx = map[step] ?? 0;
  const steps = [
    { id: 'cloth', label: 'Upload clothing' },
    { id: 'piece', label: pieceType ? `Type: ${pieceType}` : 'Choose type' },
    { id: 'options', label: 'Select presets' },
  ];
  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-2">
        {steps.map((s, i) => {
          const done = i < idx; const active = i === idx;
          return (
            <div key={s.id} className="flex-1">
              <div className="flex items-center gap-2">
                <motion.div layout className={[
                  'size-6 rounded-full grid place-items-center border text-[11px] font-semibold',
                  done ? 'bg-zinc-900 text-white border-zinc-900' : active ? 'bg-white text-zinc-900 border-zinc-300' : 'bg-white text-zinc-700 border-zinc-200',
                ].join(' ')}>{done ? '✓' : i + 1}</motion.div>
                <div className={['text-xs sm:text-[13px]', done ? 'text-zinc-700' : active ? 'text-zinc-900' : 'text-zinc-700/80'].join(' ')}>{s.label}</div>
              </div>
              {i < steps.length - 1 && (
                <motion.div layout className="h-1 mt-2 rounded-full bg-zinc-200 overflow-hidden">
                  <motion.div initial={false} animate={{ width: i < idx ? '100%' : '0%' }} transition={{ type: 'spring', stiffness: 120, damping: 18 }} className="h-full bg-zinc-900" />
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
    idle: { label: 'Ready', color: 'bg-zinc-100 text-zinc-800 border-zinc-200' },
    processing: { label: 'Processing', color: 'bg-zinc-100 text-zinc-800 border-zinc-200' },
    ready: { label: 'Done', color: 'bg-zinc-100 text-zinc-800 border-zinc-200' },
    error: { label: 'Error', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  };
  const it = map[phase] || map.idle;
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${it.color}`}>
      <span className={`inline-block size-2 rounded-full ${phase === 'processing' ? 'bg-zinc-700 animate-pulse' : 'bg-zinc-700'}`} />
      {it.label}
    </span>
  );
}

function Chip({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        'px-3 py-1.5 rounded-full border text-xs transition',
        active ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white border-zinc-200 hover:bg-zinc-100'
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex items-center justify-between gap-3 text-xs text-zinc-800">
      <span className="min-w-28">{label}</span>
      <div className="flex-1">{children}</div>
    </label>
  );
}

function Color({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
      <input className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-1 text-zinc-900" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function Range({ value, onChange, min, max, step = 1 }) {
  return (
    <div className="flex items-center gap-2">
      <input type="range" value={value} min={min} max={max} step={step} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-zinc-900" />
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
    <div className="inline-flex rounded-xl border border-zinc-200 bg-white p-1">
      {tabs.map((t) => (
        <button key={t.id} onClick={() => setMode(t.id)} className={['px-3 py-1.5 text-xs rounded-lg transition', mode === t.id ? 'bg-zinc-900 text-white shadow' : 'text-zinc-900 hover:bg-zinc-100'].join(' ')}>
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
    { id: 'outfit', label: 'Full Outfit' },
  ];
  return (
    <div className="rounded-2xl bg-white p-4 sm:p-5 shadow-lg border border-zinc-200 space-y-3">
      <div className="text-sm font-semibold text-zinc-900">Choose clothing type</div>
      <div className="grid grid-cols-1 gap-2">
        {options.map((o) => (
          <button key={o.id} onClick={() => setActive(o.id)} className={['w-full text-left rounded-xl border px-3 py-2 text-sm transition', active === o.id ? 'border-zinc-400 bg-white' : 'border-zinc-200 hover:bg-white/70'].join(' ')}>
            {o.label}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-end gap-2 pt-1">
        <button className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs bg-white hover:bg-zinc-50 text-zinc-900" onClick={onCancel}>
          Cancel
        </button>
        <button className="rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white px-3 py-1.5 text-xs" onClick={() => onConfirm(active)}>
          Continue
        </button>
      </div>
    </div>
  );
}

/* ----- Icons (SVG) ----- */
function SparkleIcon(props) { return (<svg viewBox="0 0 24 24" className={props.className || ''} aria-hidden="true"><path d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z" fill="currentColor" /></svg>); }
function BoxIcon(props) { return (<svg viewBox="0 0 24 24" className={props.className || ''} aria-hidden="true"><path d="M12 2l8 4v12l-8 4-8-4V6l8-4zm0 2l-6 3 6 3 6-3-6-3zm-6 5v8l6 3V12l-6-3zm8 3v8l6-3V9l-6 3z" fill="currentColor" /></svg>); }
function PersonIcon(props) { return (<svg viewBox="0 0 24 24" className={props.className || ''} aria-hidden="true"><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-4.33 0-8 2.17-8 4.5V21h16v-2.5C20 16.17 16.33 14 12 14z" fill="currentColor" /></svg>); }
function ScissorsIcon(props) { return (<svg viewBox="0 0 24 24" className={props.className || ''} aria-hidden="true"><path d="M14.7 6.3a1 1 0 1 1 1.4 1.4L13.83 10l2.27 2.27a1 1 0 1 1-1.42 1.42L12.4 11.4l-2.3 2.3a3 3 0 1 1-1.41-1.41l2.3-2.3-2.3-2.3A3 3 0 1 1 10.1 6.3l2.3 2.3 2.3-2.3zM7 17a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0-8a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="currentColor" /></svg>); }
function RocketIcon(props) { return (<svg viewBox="0 0 24 24" className={props.className || ''} aria-hidden="true"><path d="M5 14s2-6 9-9c0 0 1.5 3.5-1 7 0 0 3.5-1 7-1-3 7-9 9-9 9 0-3-6-6-6-6z" fill="currentColor" /><circle cx="15" cy="9" r="1.5" fill="#fff" /></svg>); }
function SwapIcon(props) { return (<svg viewBox="0 0 24 24" className={props.className || ''} aria-hidden="true"><path d="M7 7h9l-2-2 1.4-1.4L20.8 7l-5.4 3.4L14 9l2-2H7V7zm10 10H8l2 2-1.4 1.4L3.2 17l5.4-3.4L10 15l-2 2h9v0z" fill="currentColor" /></svg>); }
function PlayIcon(props) { return (<svg viewBox="0 0 24 24" className={props.className || ''} aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>); }

/* -------------------------------------------------------
   Export helpers — safe (handles CORS fallback)
------------------------------------------------------- */
async function exportPngSafe(url) {
  try {
    const res = await fetch(url, { mode: 'cors' });
    const blob = await res.blob();
    const img = await createImageBitmap(blob);
    const canvas = document.createElement('canvas');
    canvas.width = img.width; canvas.height = img.height;
    const ctx = canvas.getContext('2d', { alpha: true });
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0);
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png'); a.download = 'studio-output.png';
    document.body.appendChild(a); a.click(); a.remove();
  } catch {
    const a = document.createElement('a');
    a.href = url; a.download = 'studio-output.png';
    document.body.appendChild(a); a.click(); a.remove();
  }
}

/* -------------------------------------------------------
   Enhance Customizer — MintLemon palette
------------------------------------------------------- */
function EnhanceCustomizer({ initial, onComplete }) {
  const [form, setForm] = useState({
    photographyStyle: initial?.photographyStyle || '',
    background: initial?.background || '',
    lighting: initial?.lighting || '',
    colorStyle: initial?.colorStyle || '',
    realism: initial?.realism || 'photorealistic',
    outputQuality: initial?.outputQuality || '4k',
  });
  const update = (k, v) => setForm((s) => ({ ...s, [k]: v }));
  return (
    <div className="rounded-2xl bg-white p-4 sm:p-5 shadow-lg border border-zinc-200 space-y-3">
      <div className="text-sm font-semibold text-zinc-900">Enhance Settings</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <label className="space-y-1">
          <span className="text-zinc-700">Style</span>
          <input value={form.photographyStyle} onChange={(e) => update('photographyStyle', e.target.value)} className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-1 text-zinc-900" placeholder="studio product photography, 50mm" />
        </label>
        <label className="space-y-1">
          <span className="text-zinc-700">Background</span>
          <input value={form.background} onChange={(e) => update('background', e.target.value)} className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-1 text-zinc-900" placeholder="white seamless" />
        </label>
        <label className="space-y-1">
          <span className="text-zinc-700">Lighting</span>
          <input value={form.lighting} onChange={(e) => update('lighting', e.target.value)} className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-1 text-zinc-900" placeholder="softbox, gentle reflections" />
        </label>
        <label className="space-y-1">
          <span className="text-zinc-700">Colors</span>
          <input value={form.colorStyle} onChange={(e) => update('colorStyle', e.target.value)} className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-1 text-zinc-900" placeholder="neutral whites, subtle grays" />
        </label>
        <label className="space-y-1">
          <span className="text-zinc-700">Realism</span>
          <input value={form.realism} onChange={(e) => update('realism', e.target.value)} className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-1 text-zinc-900" placeholder="photorealistic details" />
        </label>
        <label className="space-y-1">
          <span className="text-zinc-700">Output</span>
          <input value={form.outputQuality} onChange={(e) => update('outputQuality', e.target.value)} className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-1 text-zinc-900" placeholder="4k sharp" />
        </label>
      </div>
      <div className="flex items-center justify-end gap-2 pt-1">
        <button className="rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white px-3 py-1.5 text-xs" onClick={() => onComplete(form)}>
          Run
        </button>
      </div>
    </div>
  );
}
