'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';

/**
 * Fancy, unified dashboard (with full debugging)
 * Tools: Enhance, Try-On, Model Swap, Remove BG
 * Calls /api/ai (nano-banana) with { prompt, imageUrls|imageUrl, user_email, num_images }
 * Each input supports Upload-to-Supabase or direct URL
 * Batch outputs up to 3 images (API limit)
 */

/* -------------------------------------------------------
   Debug helpers
------------------------------------------------------- */
// فعّل/عطّل الديبَغ من هنا أو عبر .env: NEXT_PUBLIC_DEBUG=true
const DEBUG = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_DEBUG === 'true') || true;

const dbg = (...args) => {
  if (!DEBUG) return;
  try {
    // استخدام console.groupCollapsed لقراءة أسهل
    console.log('[AIStudio]', ...args);
  } catch {}
};

// عرض كتلة منظمة
const dbgGroup = (title, obj) => {
  if (!DEBUG) return;
  try {
    console.groupCollapsed(`🧪 ${title}`);
    console.log(obj);
    console.groupEnd();
  } catch {}
};

// أصل الموقع (محسّن لبيئات مختلفة)
const getSiteOrigin = () => {
  try {
    if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin;
  } catch {}
  const envUrl = process.env?.NEXT_PUBLIC_SITE_URL || process.env?.NEXT_PUBLIC_VERCEL_URL || '';
  if (!envUrl) return '';
  return envUrl.startsWith('http') ? envUrl : `https://${envUrl}`;
};

// يحوّل أي رابط إلى مطلق (http/https) إن كان نسبي
const toAbsoluteUrl = (u) => {
  if (!u || typeof u !== 'string') return '';
  if (/^https?:\/\//i.test(u)) return u;
  const origin = getSiteOrigin();
  try {
    const abs = new URL(u, origin || 'https://example.com').toString();
    return abs;
  } catch {
    return u;
  }
};

// فلترة/تحذير لأي رابط غير http/https
const ensureHttpList = (arr) => {
  const ok = [];
  for (const u of arr || []) {
    const abs = toAbsoluteUrl(u);
    if (!/^https?:\/\//i.test(abs)) {
      dbg('⚠️ Ignoring non-http URL:', u);
      continue;
    }
    ok.push(abs);
  }
  return ok;
};

/* -------------------------------------------------------
   Constants & helpers
------------------------------------------------------- */
const STORAGE_BUCKET = 'img';

const hexToRGBA = (hex, a = 1) => {
  const c = hex.replace('#', '');
  const v = c.length === 3 ? c.replace(/(.)/g, '$1$1') : c;
  const n = parseInt(v, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = (n) & 255;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const fileToDataURL = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

/** pick URLs from various API response shapes */
const pickUrls = (out) => {
  if (!out) return [];
  if (Array.isArray(out)) return out.filter(Boolean);

  const keys = ['variants', 'urls', 'output', 'images', 'result'];
  for (const k of keys) {
    if (Array.isArray(out[k])) return out[k].filter(Boolean);
    if (typeof out[k] === 'string') return [out[k]];
  }

  if (typeof out === 'string') return [out];
  const one = out.url || out.image || out.result;
  return one ? [one] : [];
};

function ModeTabs({ mode, setMode }) {
  const tabs = [
    { id: 'color', label: 'Color' },
    { id: 'gradient', label: 'Gradient' },
    { id: 'pattern', label: 'Pattern' },
  ];
  return (
    <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => setMode(t.id)}
          className={[
            'px-3 py-1.5 text-xs rounded-lg transition',
            mode === t.id ? 'bg-white text-zinc-900 shadow' : 'text-zinc-200 hover:bg-white/10',
          ].join(' ')}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* -------------------------------------------------------
   Presets & models (images live in /public)
------------------------------------------------------- */
const ENHANCE_PRESETS = [
  {
    id: 'atelier-white',
    title: 'Atelier White',
    subtitle: 'Soft studio • glossy rim',
    tag: 'Popular',
    config: {
      photographyStyle: 'studio product photography, 50mm prime, editorial minimal',
      background: 'white cyclorama, subtle falloff',
      lighting: 'big softbox + rim, soft reflections',
      colorStyle: 'neutral whites, pearl highlights',
      realism: 'hyperrealistic micro-textures',
      outputQuality: '4k ultra sharp'
    },
    preview: '/clean-studio.webp'
  },
  {
    id: 'desert-cinema',
    title: 'Desert Cinema',
    subtitle: 'Warm • cinematic',
    tag: 'Warm',
    config: {
      photographyStyle: 'cinematic product hero',
      background: 'warm beige backdrop',
      lighting: 'golden hour key, soft shadows',
      colorStyle: 'sand, amber, caramel',
      realism: 'photo-real',
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
      photographyStyle: 'editorial catalog, tasteful negative space',
      background: 'matte beige',
      lighting: 'directional key + fill',
      colorStyle: 'beige monochrome',
      realism: 'realistic',
      outputQuality: '4k print'
    },
    preview: '/editorial-beige.webp'
  },
  {
    id: 'noir-slate',
    title: 'Noir Slate',
    subtitle: 'Dark • specular',
    tag: 'High-contrast',
    config: {
      photographyStyle: 'hero product shot, luxury noir',
      background: 'charcoal slate, wet sheen',
      lighting: 'hard key + rim, controlled specular',
      colorStyle: 'cool slate, deep blacks',
      realism: 'high-fidelity',
      outputQuality: '4k'
    },
    preview: '/slate-contrast.webp'
  }
];

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
   Toast system
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
    <div className="fixed left-1/2 -translate-x-1/2 bottom-5 z-[120] w-[94vw] max-w-md space-y-2">
      <AnimatePresence initial={false}>
        {items.map((t) => (
          <motion.div
            key={t.id}
            initial={{ y: 16, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0, scale: 0.98 }}
            className="rounded-2xl border border-white/20 bg-gradient-to-br from-zinc-900/90 to-zinc-800/90 text-zinc-50 shadow-2xl backdrop-blur p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm">{t.msg}</div>
              <button className="text-xs text-zinc-300 hover:text-white" onClick={() => onClose(t.id)}>✕</button>
            </div>
            {typeof t.progress === 'number' && (
              <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-white/70 transition-all" style={{ width: `${clamp(t.progress,0,100)}%` }} />
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
  { id: 'enhance',  label: 'Enhance',   icon: RocketIcon },
  { id: 'removeBg', label: 'Remove BG', icon: ScissorsIcon },
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
  const [group, setGroup] = useState('product');
  const [tool, setTool]   = useState('enhance');
  const [plan, setPlan]   = useState('Free');

  // outputs
  const [resultUrls, setResultUrls] = useState([]); // array
  const [selectedOutput, setSelectedOutput] = useState('');

  // common
  const [phase, setPhase] = useState('idle'); // idle|processing|ready|error
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [history, setHistory] = useState([]);
  const [count, setCount] = useState(1); // desired outputs (API supports up to 3)

  // debug info (آخر طلب/استجابة)
  const [debugInfo, setDebugInfo] = useState(null);
  const [showDebug, setShowDebug] = useState(true);

  // enhance single input
  const [enhMode, setEnhMode] = useState('upload'); // upload|url
  const [enhFile, setEnhFile] = useState(null);
  const [enhLocal, setEnhLocal] = useState('');
  const [enhUrl, setEnhUrl] = useState('');
  const [pendingPreset, setPendingPreset] = useState(null);
  const [showEnhance, setShowEnhance] = useState(false);

  // removeBG single input
  const [rbFile, setRbFile] = useState(null);
  const [rbLocal, setRbLocal] = useState('');
  const [rbData, setRbData] = useState('');
  const [bgMode, setBgMode] = useState('gradient');
  const [color, setColor] = useState('#0b0b0f');
  const [color2, setColor2] = useState('#1b1032');
  const [angle, setAngle] = useState(35);
  const [radius, setRadius] = useState(20);
  const [padding, setPadding] = useState(22);
  const [shadow, setShadow] = useState(true);
  const [patternOpacity, setPatternOpacity] = useState(0.08);
  const [compare, setCompare] = useState(false);
  const [compareOpacity, setCompareOpacity] = useState(50);

  // swap two slots
  const [swapA, setSwapA] = useState({ mode: 'upload', file: null, url: '', local: '' });
  const [swapB, setSwapB] = useState({ mode: 'upload', file: null, url: '', local: '' });
  const [swapPrompt, setSwapPrompt] = useState('Clean composite, photorealistic.');

  // try-on
  const [tryCloth, setTryCloth] = useState({ mode: 'upload', file: null, url: '', local: '' });
  const [selectedModel, setSelectedModel] = useState(null);
  const [pieceType, setPieceType] = useState(null); // upper|lower|dress
  const [tryonStep, setTryonStep] = useState('cloth');
  const [showPieceType, setShowPieceType] = useState(false);

  // derived: do we have clothing?
  const hasCloth = useMemo(() => {
    return (tryCloth.mode === 'upload' && !!tryCloth.file) || (tryCloth.mode === 'url' && !!tryCloth.url?.trim());
  }, [tryCloth]);

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
      } catch {/* ignore */}
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [user, router, supabase]);

  /* ---------- auto-step for Try-On ---------- */
  useEffect(() => {
    if (tool !== 'tryon') return;
    if (hasCloth) {
      setTryonStep('piece');
      if (!pieceType) setShowPieceType(true); // open modal once clothing is ready
    }
  }, [tool, hasCloth, pieceType]);

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
            <path d='M0 12h24M12 0v24' stroke='${hexToRGBA('#ffffff', patternOpacity)}' stroke-width='1' opacity='0.25'/>
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
      boxShadow: shadow ? '0 24px 60px rgba(0,0,0,.25), 0 8px 22px rgba(0,0,0,.15)' : 'none',
      transition: 'all .25s ease'
    };
  }, [bgMode, color, color2, angle, radius, padding, shadow, patternOpacity]);

  /* ---------- storage ---------- */
  const uploadToStorage = useCallback(async (f) => {
    if (!f) throw new Error('no file');
    const ext = (f.name?.split('.').pop() || 'png').toLowerCase();
    const path = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    dbg('🗂️ Uploading to Supabase...', { path, type: f.type, size: f.size });
    const { error: upErr } = await supabase.storage.from(STORAGE_BUCKET).upload(path, f, {
      cacheControl: '3600', upsert: false, contentType: f.type || 'image/*',
    });
    if (upErr) { dbg('❌ Supabase upload error', upErr); throw upErr; }
    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    if (!data?.publicUrl) throw new Error('no public url');
    dbg('✅ Public URL', data.publicUrl);
    return data.publicUrl;
  }, [supabase, user]);

  const ensureUrl = useCallback(async (slot) => {
    if (slot.mode === 'url') {
      const abs = toAbsoluteUrl(slot.url?.trim());
      dbg('🔗 ensureUrl (direct):', { in: slot.url, abs });
      return abs;
    }
    if (!slot.file) return '';
    const url = await uploadToStorage(slot.file);
    const abs = toAbsoluteUrl(url);
    dbg('🔗 ensureUrl (uploaded):', { url, abs });
    return abs;
  }, [uploadToStorage]);

  /* ---------- prompt builders ---------- */
  const buildEnhancePrompt = (f) => [
    f?.photographyStyle && `${f.photographyStyle}`,
    f?.background && `background: ${f.background}`,
    f?.lighting && `lighting: ${f.lighting}`,
    f?.colorStyle && `colors: ${f.colorStyle}`,
    f?.realism,
    f?.outputQuality && `output: ${f.outputQuality}`,
  ].filter(Boolean).join(', ');

  const buildTryOnPrompt = (ptype) => {
    const region = ptype === 'upper' ? 'the TOP' : ptype === 'lower' ? 'the BOTTOM' : 'the FULL OUTFIT';
    return `Make the model wear the clothing naturally on ${region}. Match fabric, fit, drape, and perspective. Keep skin and hands realistic. Two slight variations per look if possible.`;
  };

  /* ---------- unified runners (all except Remove BG) ---------- */
  const callUnified = useCallback(async ({ mode, prompt, image_input, count = 1 }) => {
    const t = toasts.push(`${mode === 'enhance' ? 'Enhancing' : mode === 'tryon' ? 'Try-On' : 'Model Swap'}…`, { progress: 10 });
    let adv = 10; const iv = setInterval(() => { adv = Math.min(adv + 6, 88); t.update({ progress: adv }); }, 450);
    try {
      // تأكد أن كل الروابط http(s)
      const clean = ensureHttpList(image_input);
      if (clean.length === 0) throw new Error('No valid http(s) image URLs to send');

      // shape payload for /api/ai (nano-banana)
      const payload = {
        prompt,
        user_email: (user?.email || '').toLowerCase(),
        num_images: clamp(count, 1, 3),
        // حقل debug غير مستخدم في السيرفر، لكنه مفيد للفحص.
        _client_debug: { mode, siteOrigin: getSiteOrigin(), sentAt: new Date().toISOString(), imageCount: clean.length }
      };
      if (clean.length > 1) payload.imageUrls = clean;
      else payload.imageUrl = clean[0];

      dbgGroup('⬆️ /api/ai payload', payload);

      const r = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const txt = await r.text(); // نقرأ كنص أولًا لنحتفظ به في debug
      let j = {};
      try { j = JSON.parse(txt); } catch { j = { raw: txt }; }

      dbgGroup('⬇️ /api/ai response', { status: r.status, ok: r.ok, json: j });

      // حفظ معلومات الديبغ في الواجهة
      setDebugInfo({
        when: new Date().toLocaleString(),
        request: payload,
        input_urls: clean,
        response_status: r.status,
        response_ok: r.ok,
        response_json: j
      });

      if (!r.ok) throw new Error(j?.error || 'API error');

      const urls = pickUrls(j);
      if (!urls.length) throw new Error('No output URLs returned');

      setResultUrls(urls);
      setSelectedOutput(urls[0]);
      setHistory(h => [{ tool: mode, inputs: clean, outputs: urls, ts: Date.now() }, ...h].slice(0, 36));
      setPhase('ready');
      t.update({ progress: 100, msg: `${mode} ✓` });
      setTimeout(() => t.close(), 700);
    } catch (e) {
      dbg('❌ callUnified error', e);
      setPhase('error'); setErr(e?.message || 'Failed');
      t.update({ msg: `${mode} failed: ${e?.message || 'Error'}`, type: 'error' });
      setTimeout(() => t.close(), 1400);
    } finally {
      clearInterval(iv);
    }
  }, [toasts, user]);

  const runEnhance = useCallback(async (form) => {
    if (enhMode === 'upload' && !enhFile) { setErr('Upload an image first.'); return; }
    if (enhMode === 'url' && !enhUrl) { setErr('Enter an image URL.'); return; }
    setErr(''); setPhase('processing'); setBusy(true);
    try {
      const imageUrl = enhMode === 'url' ? toAbsoluteUrl(enhUrl.trim()) : await uploadToStorage(enhFile);
      const prompt = buildEnhancePrompt(form);
      dbgGroup('🎛️ Enhance params', { imageUrl, prompt });
      await callUnified({ mode: 'enhance', prompt, image_input: [imageUrl], count });
    } finally {
      setBusy(false);
    }
  }, [enhMode, enhFile, enhUrl, count, uploadToStorage, callUnified]);

  const runTryOn = useCallback(async () => {
    if (!selectedModel?.url) { setErr('Select a model.'); return; }
    if (!pieceType) { setErr('Choose clothing type.'); setShowPieceType(true); return; }
    if (tryCloth.mode === 'upload' && !tryCloth.file) { setErr('Upload the clothing image.'); return; }
    if (tryCloth.mode === 'url' && !tryCloth.url) { setErr('Enter clothing image URL.'); return; }

    setErr(''); setPhase('processing'); setBusy(true);
    try {
      const modelAbs = toAbsoluteUrl(selectedModel.url);
      const clothUrl = await ensureUrl(tryCloth);
      const prompt = buildTryOnPrompt(pieceType);

      // فحوصات ديبغ مهمة
      const origin = getSiteOrigin();
      dbgGroup('🧥 Try-On inputs', { origin, modelOriginal: selectedModel.url, modelAbs, clothUrl, pieceType, count });

      if (!/^https?:\/\//i.test(modelAbs)) throw new Error('Model image is not an http(s) URL');
      if (!/^https?:\/\//i.test(clothUrl)) throw new Error('Clothing image is not an http(s) URL');

      await callUnified({ mode: 'tryon', prompt, image_input: [modelAbs, clothUrl], count });
    } finally {
      setBusy(false);
    }
  }, [selectedModel, pieceType, tryCloth, count, ensureUrl, callUnified]);

  const runModelSwap = useCallback(async () => {
    if (swapA.mode === 'upload' && !swapA.file) { setErr('Provide Image A.'); return; }
    if (swapB.mode === 'upload' && !swapB.file) { setErr('Provide Image B.'); return; }
    if (swapA.mode === 'url' && !swapA.url) { setErr('Provide URL for A.'); return; }
    if (swapB.mode === 'url' && !swapB.url) { setErr('Provide URL for B.'); return; }

    setErr(''); setPhase('processing'); setBusy(true);
    try {
      const urlA = await ensureUrl(swapA);
      const urlB = await ensureUrl(swapB);
      dbgGroup('🔁 ModelSwap inputs', { urlA, urlB, prompt: swapPrompt, count });
      await callUnified({ mode: 'swap', prompt: swapPrompt, image_input: [urlA, urlB], count });
    } finally {
      setBusy(false);
    }
  }, [swapA, swapB, swapPrompt, count, ensureUrl, callUnified]);

  /* ---------- remove bg (kept separate) ---------- */
  const runRemoveBg = useCallback(async () => {
    if (!rbFile) { setErr('Pick an image first.'); return; }
    setBusy(true); setErr(''); setPhase('processing');
    const t = toasts.push('Removing background…', { progress: 8 });
    let adv = 8; const iv = setInterval(() => { adv = Math.min(adv + 6, 88); t.update({ progress: adv }); }, 450);
    try {
      dbgGroup('🧼 RemoveBG req', { hasData: !!rbData, local: rbLocal?.slice(0,60) });
      const r = await fetch('/api/remove-bg', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageData: rbData }) });
      const txt = await r.text();
      let j = {}; try { j = JSON.parse(txt); } catch { j = { raw: txt }; }
      dbgGroup('🧼 RemoveBG resp', { status: r.status, ok: r.ok, json: j });
      if (!r.ok) throw new Error(j?.error || 'remove-bg failed');
      const urls = pickUrls(j);
      if (!urls.length) throw new Error('No output from remove-bg');
      setResultUrls(urls); setSelectedOutput(urls[0]);
      setHistory(h => [{ tool: 'removeBg', inputs: [rbLocal], outputs: urls, ts: Date.now() }, ...h].slice(0, 36));
      setPhase('ready'); t.update({ progress: 100, msg: 'Background removed ✓' });
      setTimeout(() => t.close(), 700);
    } catch (e) {
      dbg('❌ removeBg error', e);
      setPhase('error'); setErr('Failed to process.');
      t.update({ msg: `Remove BG failed: ${e?.message || 'Error'}`, type: 'error' }); setTimeout(() => t.close(), 1400);
    } finally { clearInterval(iv); setBusy(false); }
  }, [rbFile, rbData, rbLocal, toasts]);

  /* ---------- UI helpers ---------- */
  const resetAll = () => {
    setResultUrls([]); setSelectedOutput(''); setErr(''); setPhase('idle'); setCompare(false);
    setEnhFile(null); setEnhLocal(''); setEnhUrl(''); setPendingPreset(null);
    setRbFile(null); setRbLocal(''); setRbData('');
    setSwapA({ mode: 'upload', file: null, url: '', local: '' });
    setSwapB({ mode: 'upload', file: null, url: '', local: '' });
    setTryCloth({ mode: 'upload', file: null, url: '', local: '' });
    setSelectedModel(null); setPieceType(null); setTryonStep('cloth');
  };

  const switchTool = (nextId) => {
    setTool(nextId); setErr(''); setPhase('idle'); setCompare(false);
    setResultUrls([]); setSelectedOutput('');
    setTryonStep(nextId==='tryon' ? 'cloth' : 'cloth');
  };

  if (loading || user === undefined) {
    return (
      <main className="min-h-screen grid place-items-center bg-gradient-to-b from-[#0b0b0f] to-[#140b22] text-zinc-300">
        <div className="rounded-2xl bg-white/5 backdrop-blur px-4 py-3 border border-white/10 shadow text-sm">Loading…</div>
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
    <main className="min-h-screen bg-[radial-gradient(60%_120%_at_50%_-10%,#2a1746_0%,#0b0b0f_55%)] text-zinc-50">
      <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5 md:gap-7 px-3 md:px-6 py-5 md:py-8">
        {/* Sidebar */}
        <aside className="rounded-3xl border border-white/10 bg-white/5 shadow-2xl sticky top-4 self-start h-fit overflow-hidden">
          <div className="px-4 py-4 flex items-center gap-3 border-b border-white/10 bg-gradient-to-r from-white/10 to-white/0">
            <div className="grid place-items-center size-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow">
              <SparkleIcon className="w-5 h-5" />
            </div>
            <div className="font-semibold tracking-tight">AI Studio</div>
          </div>

          <div className="px-4 py-3">
            <div className="text-[11px] font-semibold text-zinc-300/90 mb-1">Workspace</div>
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur">
              {GROUPS.map((g) => {
                const Active = group === g.id; const Icon = g.icon;
                return (
                  <button
                    key={g.id}
                    onClick={() => { setGroup(g.id); switchTool(g.id === 'product' ? 'enhance' : 'tryon'); }}
                    className={[
                      'inline-flex items-center gap-2 py-1.5 px-3 rounded-full text-sm transition',
                      Active ? 'bg-white/90 text-zinc-900 shadow' : 'text-zinc-200 hover:bg-white/10'
                    ].join(' ')}
                  >
                    <Icon className="size-4" /> {g.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-4 pb-4">
            <div className="text-[11px] font-semibold text-zinc-300/90 mb-1">Tools</div>
            <div className="space-y-1">
              {(group === 'product' ? PRODUCT_TOOLS : PEOPLE_TOOLS).map((t) => {
                const Active = tool === t.id; const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => switchTool(t.id)}
                    className={[
                      'w-full group flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm transition',
                      Active ? 'bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-violet-400/30' : 'hover:bg-white/5 border border-white/5'
                    ].join(' ')}
                  >
                    <Icon className={[ 'size-4', Active ? 'text-violet-300' : 'text-zinc-300 group-hover:text-zinc-100' ].join(' ')} />
                    <span className="truncate">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-4 py-4 border-t border-white/10 bg-white/[.02]">
            <div className="flex items-center gap-3">
              <div className="grid place-items-center size-10 rounded-full bg-white/10 text-white font-bold">{initials}</div>
              <div className="text-sm">
                <div className="font-medium leading-tight">{user.user_metadata?.name || user.email}</div>
                <div className="text-[11px] text-zinc-300/80">Plan: {plan}</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main column */}
        <section className="space-y-5 md:space-y-6">
          {/* Presets / Try-On Models */}
          <motion.div layout className="rounded-3xl border border-white/10 bg-white/[.06] backdrop-blur p-4 sm:p-5 md:p-6 shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
                  {group === 'product' ? 'Premium Presets' : (tool === 'tryon' ? 'Try-On Flow' : 'Model Swap')}
                </h1>
                <p className="text-zinc-300/90 text-xs sm:text-sm">
                  {group === 'product'
                    ? <>Pick a preset or open <span className="font-semibold">Customize</span>.</>
                    : tool === 'tryon'
                      ? <>Step 1: upload/paste clothing → Step 2: choose type → Step 3: pick a model → Run.</>
                      : <>Upload/URL for two images then run <span className="font-semibold">Model Swap</span>.</>}
                </p>
              </div>

              {group === 'product' && (
                <button
                  onClick={() => { setTool('enhance'); setPendingPreset(null); setShowEnhance(true); }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs sm:text-sm font-semibold hover:bg-white/20"
                >
                  ✨ Customize Enhance
                </button>
              )}

              {/* Outputs count */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-zinc-300/90">Outputs</span>
                <input
                  type="number" min={1} max={3} value={count}
                  onChange={(e)=>setCount(clamp(parseInt(e.target.value||'1',10),1,3))}
                  className="w-14 rounded-lg border border-white/15 bg-white/10 px-2 py-1 text-right"
                />
                <span className="text-zinc-400">(max 3)</span>
              </div>
            </div>

            {group === 'product' ? (
              <div className="mt-4">
                <div className="mb-2 text-[12px] font-semibold text-zinc-300">Enhance</div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {ENHANCE_PRESETS.map((p) => (
                    <PresetCard key={p.id} title={p.title} subtitle={p.subtitle} preview={p.preview} tag={p.tag}
                      onClick={() => { setTool('enhance'); setPendingPreset(p.config); setShowEnhance(true); }} />
                  ))}
                </div>
              </div>
            ) : tool === 'tryon' ? (
              <div className="mt-4">
                <TryOnStepper step={tryonStep} pieceType={pieceType} modelPicked={!!selectedModel} />
                {/* show models as soon as clothing exists */}
                {hasCloth ? (
                  <div className="mt-3">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-[12px] font-semibold text-zinc-300">Models</div>
                      <button
                        className="text-[11px] rounded-md border border-white/15 bg-white/10 px-2 py-1 hover:bg-white/20"
                        onClick={()=>setShowPieceType(true)}
                      >
                        {pieceType ? `Type: ${pieceType}` : 'Choose type'}
                      </button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {MODELS.map((m) => (
                        <ModelCard
                          key={m.id}
                          model={m}
                          active={selectedModel?.id === m.id}
                          onSelect={() => {
                            if (!pieceType) { setShowPieceType(true); return; }
                            setSelectedModel(m);
                            setTryonStep('model');
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 rounded-xl border border-white/10 p-4 text-xs text-zinc-300/90 bg-white/5">
                    Upload/paste clothing first, then choose type. Models will appear automatically.
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-2 text-xs text-zinc-300/90">Upload / paste two images below and write a short instruction.</div>
            )}
          </motion.div>

          {/* Workbench */}
          <div className="grid gap-4 md:gap-6 lg:grid-cols-[1fr_340px]">
            {/* Canvas Panel */}
            <section className="rounded-3xl border border-white/10 bg-white/[.06] shadow-xl relative">
              <div className="flex flex-wrap items-center justify-between gap-3 px-3 sm:px-4 md:px-5 pt-3 md:pt-4">
                <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur">
                  {(group === 'product' ? PRODUCT_TOOLS : PEOPLE_TOOLS).map((it) => {
                    const Active = tool === it.id; const Icon = it.icon;
                    return (
                      <button key={it.id} onClick={() => switchTool(it.id)}
                        className={['inline-flex items-center gap-2 py-1.5 px-3 rounded-full text-sm transition', Active ? 'bg-white text-zinc-900 shadow' : 'text-zinc-200 hover:bg-white/10'].join(' ')}>
                        <Icon className="size-4" />
                        <span>{it.label}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <StepBadge phase={phase} />
                  <button onClick={resetAll} className="text-xs px-2 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10">Reset</button>
                </div>
              </div>

              {/* Debug banner */}
              {DEBUG && debugInfo && showDebug && (
                <div className="mx-3 sm:mx-4 md:mx-5 mt-3 rounded-xl border border-amber-300/30 bg-amber-200/10 p-3 text-[11px] text-amber-100">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">Debug (last call) — {debugInfo.when}</div>
                    <button className="text-amber-200/80 hover:text-white" onClick={()=>setShowDebug(false)}>Hide</button>
                  </div>
                  <pre className="mt-2 whitespace-pre-wrap break-all max-h-56 overflow-auto">
{JSON.stringify({
  request: debugInfo.request,
  input_urls: debugInfo.input_urls,
  response_status: debugInfo.response_status,
  response_ok: debugInfo.response_ok,
  response_json: debugInfo.response_json
}, null, 2)}
                  </pre>
                </div>
              )}

              {/* Tool Work Areas */}
              <div className="m-3 sm:m-4 md:m-5">
                {tool === 'enhance' && (
                  <div className="grid gap-3">
                    <InputSlot label="Image" mode={enhMode} setMode={setEnhMode}
                      file={enhFile} setFile={(f)=>{ setEnhFile(f); setEnhLocal(f?URL.createObjectURL(f):''); }}
                      url={enhUrl} setUrl={setEnhUrl}
                      hint="Upload to Supabase or paste a public URL" />
                    {enhLocal && enhMode==='upload' && (
                      <Thumb src={enhLocal} />
                    )}
                  </div>
                )}

                {tool === 'removeBg' && (
                  <div className="grid gap-3">
                    <DropSimple label="Remove BG" file={rbFile} local={rbLocal}
                      onPick={async (f)=>{ setRbFile(f); setRbLocal(URL.createObjectURL(f)); setRbData(await fileToDataURL(f)); setResultUrls([]); setPhase('idle'); }} />
                  </div>
                )}

                {tool === 'modelSwap' && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <InputSlot label="Image A" mode={swapA.mode} setMode={(m)=>setSwapA(s=>({...s,mode:m}))}
                      file={swapA.file} setFile={(f)=>setSwapA(s=>({...s,file:f,local:f?URL.createObjectURL(f):''}))}
                      url={swapA.url} setUrl={(u)=>setSwapA(s=>({...s,url:u}))}
                    />
                    <InputSlot label="Image B" mode={swapB.mode} setMode={(m)=>setSwapB(s=>({...s,mode:m}))}
                      file={swapB.file} setFile={(f)=>setSwapB(s=>({...s,file:f,local:f?URL.createObjectURL(f):''}))}
                      url={swapB.url} setUrl={(u)=>setSwapB(s=>({...s,url:u}))}
                    />
                  </div>
                )}

                {tool === 'tryon' && (
                  <div className="grid gap-3">
                    <InputSlot label="Clothing" mode={tryCloth.mode} setMode={(m)=>setTryCloth(s=>({...s,mode:m}))}
                      file={tryCloth.file} setFile={(f)=>setTryCloth(s=>({...s,file:f,local:f?URL.createObjectURL(f):''}))}
                      url={tryCloth.url} setUrl={(u)=>setTryCloth(s=>({...s,url:u}))}
                      hint="Transparent PNG recommended" />

                    <div className="flex items-center gap-2">
                      <button onClick={()=>setShowPieceType(true)} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs hover:bg-white/10">{pieceType ? `Type: ${pieceType}` : 'Choose type'}</button>
                      {pieceType && <span className="text-xs text-zinc-300/90">Ready ✓</span>}
                    </div>

                    {tryCloth.local && tryCloth.mode==='upload' && (<Thumb src={tryCloth.local} />)}

                    {hasCloth && !pieceType && (
                      <div className="text-xs text-zinc-300/90">Choose clothing type to improve fit & placement.</div>
                    )}
                  </div>
                )}

                {/* Result preview */}
                {resultUrls.length > 0 && (
                  <div className="mt-4">
                    <div className="text-xs text-zinc-300/90 mb-2">Results</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                      {resultUrls.map((u, i) => (
                        <button key={i} onClick={()=>setSelectedOutput(u)} className={[
                          'group relative rounded-xl overflow-hidden border',
                          selectedOutput===u ? 'border-violet-400/50 ring-2 ring-violet-400/30' : 'border-white/10 hover:border-white/20'
                        ].join(' ')}>
                          <img src={u} alt={`out-${i}`} className="w-full h-36 object-cover" />
                          <div className="absolute bottom-0 left-0 right-0 text-[10px] px-2 py-1 bg-black/40 text-white backdrop-blur">#{i+1}</div>
                        </button>
                      ))}
                    </div>
                    {selectedOutput && (
                      <div className="mt-3 rounded-2xl overflow-hidden border border-white/10 bg-white/5 grid place-items-center p-2">
                        <img src={selectedOutput} alt="selected" className="max-w-full max-h-[62vh] object-contain" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 px-3 sm:px-4 md:px-5 pb-4 md:pb-5">
                <button
                  onClick={() => {
                    if (group==='product') {
                      if (tool==='removeBg') return runRemoveBg();
                      if (tool==='enhance') return setShowEnhance(true);
                    } else {
                      if (tool==='tryon') return runTryOn();
                      if (tool==='modelSwap') return runModelSwap();
                    }
                  }}
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-xl bg-white text-zinc-900 hover:bg-zinc-200 px-3 sm:px-4 py-2 text-sm font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {busy ? 'Processing…' : (<><PlayIcon className="size-4" /> Run</>)}
                </button>

                {selectedOutput && (
                  <>
                    <a href={selectedOutput} download className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 sm:px-4 py-2 text-sm font-semibold hover:bg-white/10">⬇ Download</a>
                    <button onClick={() => navigator.clipboard.writeText(selectedOutput).catch(()=>{})} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-2.5 py-2 text-xs font-semibold hover:bg-white/10">🔗 Copy URL</button>
                    {(tool === 'enhance' && enhLocal) || (tool === 'removeBg' && rbLocal) ? (
                      <>
                        <label className="mt-1 inline-flex items-center gap-2 text-xs"><input type="checkbox" checked={compare} onChange={(e)=>setCompare(e.target.checked)} />Compare</label>
                        {compare && (
                          <div className="flex items-center gap-2">
                            <input type="range" min={0} max={100} value={compareOpacity} onChange={(e)=>setCompareOpacity(Number(e.target.value))} />
                            <span className="text-xs w-8 text-right">{compareOpacity}%</span>
                          </div>
                        )}
                      </>
                    ) : null}
                  </>
                )}

                {!!err && <div className="text-xs text-rose-400">{err}</div>}
              </div>

              {/* busy overlay */}
              <AnimatePresence>
                {busy && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-0 rounded-3xl grid place-items-center bg-black/20">
                    <div className="text-xs px-3 py-2 rounded-lg bg-white/80 text-zinc-900 border shadow">Working…</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* Inspector */}
            <aside className="rounded-3xl border border-white/10 bg-white/[.06] shadow-xl p-4 md:pb-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Inspector</div>
                <span className="text-xs text-zinc-300/80">Tool: {tool}</span>
              </div>

              {/* Quick Debug Toggle */}
              {DEBUG && (
                <div className="mt-2">
                  <button onClick={()=>setShowDebug(v=>!v)} className="text-[11px] rounded-md border border-white/15 bg-white/10 px-2 py-1 hover:bg-white/20">
                    {showDebug ? 'Hide' : 'Show'} Debug Panel
                  </button>
                </div>
              )}

              {/* Enhance inspector */}
              {tool === 'enhance' && (
                <div className="space-y-2 text-xs text-zinc-300/90 mt-3">
                  <div>Choose a preset above or press <span className="font-semibold">Customize</span>.</div>
                  {selectedOutput && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-white/10 bg-white/5 grid place-items-center p-2">
                      <img src={selectedOutput} alt="final" className="max-w-full max-h-[38vh] object-contain" />
                    </div>
                  )}
                </div>
              )}

              {/* Remove BG inspector */}
              {tool === 'removeBg' && (
                <div className="space-y-3 mt-3">
                  <ModeTabs mode={bgMode} setMode={setBgMode} />
                  <Field label="Primary"><Color value={color} onChange={setColor} /></Field>
                  {bgMode === 'gradient' && (
                    <>
                      <Field label="Secondary"><Color value={color2} onChange={setColor2} /></Field>
                      <Field label="Angle"><Range value={angle} onChange={setAngle} min={0} max={360} /></Field>
                    </>
                  )}
                  {bgMode === 'pattern' && (
                    <Field label="Pattern opacity"><Range value={patternOpacity} onChange={setPatternOpacity} min={0} max={0.5} step={0.01} /></Field>
                  )}
                  <Field label="Radius"><Range value={radius} onChange={setRadius} min={0} max={48} /></Field>
                  <Field label="Padding"><Range value={padding} onChange={setPadding} min={0} max={64} /></Field>
                  <label className="mt-1 inline-flex items-center gap-2 text-xs"><input type="checkbox" checked={shadow} onChange={(e)=>setShadow(e.target.checked)} />Shadow</label>
                  <div className="mt-3">
                    <div className="text-xs text-zinc-300/90 mb-2">Final Preview</div>
                    <div style={frameStyle} className="relative rounded-xl overflow-hidden border border-white/10">
                      <div className="relative w-full min-h-[140px] sm:min-h-[160px] grid place-items-center">
                        {selectedOutput ? (
                          <img src={selectedOutput} alt="final" className="max-w-full max-h-[38vh] object-contain" />
                        ) : (
                          <div className="grid place-items-center h-[140px] text-xs text-zinc-400">— Run Remove BG first —</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Try-On inspector */}
              {tool === 'tryon' && (
                <div className="space-y-3 mt-3 text-xs">
                  <div className="rounded-lg border border-white/10 p-3">
                    <div className="text-zinc-300 mb-1">Clothing</div>
                    {tryCloth.local ? (
                      <img src={tryCloth.local} alt="cloth" className="w-full max-h-48 object-contain rounded-md border border-white/10 bg-white/5" />
                    ) : (
                      <div className="text-zinc-500">— Upload or paste clothing —</div>
                    )}
                  </div>
                  <div className="rounded-lg border border-white/10 p-3">
                    <div className="text-zinc-300 mb-1">Type</div>
                    <div className="flex items-center justify-between">
                      <div className="text-zinc-100">{pieceType ? pieceType : '—'}</div>
                      <button className="rounded-lg border border-white/10 px-2 py-1 text-[11px] bg-white/5" onClick={()=>setShowPieceType(true)}>Change</button>
                    </div>
                  </div>
                  <div className="rounded-lg border border-white/10 p-3">
                    <div className="text-zinc-300 mb-1">Selected Model</div>
                    {selectedModel ? (
                      <div className="flex items-center gap-2">
                        <img src={selectedModel.url} alt={selectedModel.name} className="w-10 h-10 rounded-md object-cover border border-white/10" />
                        <div>
                          <div className="font-semibold">{selectedModel.name}</div>
                          <div className="text-[11px] text-zinc-300/80">Pose: {selectedModel.pose}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-zinc-500">— Pick a model above —</div>
                    )}
                  </div>
                  {selectedOutput && (
                    <div className="rounded-lg border border-white/10 p-3">
                      <div className="text-zinc-300 mb-2">Result</div>
                      <img src={selectedOutput} alt="final" className="w-full max-h-64 object-contain rounded-md border border-white/10 bg-white/5" />
                    </div>
                  )}
                </div>
              )}

              {/* Model Swap inspector */}
              {tool === 'modelSwap' && (
                <div className="text-xs text-zinc-300/90 mt-3 space-y-3">
                  <div className="rounded-lg border border-white/10 p-3">
                    <div className="text-zinc-300 mb-1">Prompt</div>
                    <input value={swapPrompt} onChange={(e)=>setSwapPrompt(e.target.value)} placeholder="Describe the composite…"
                      className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm" />
                  </div>
                  {selectedOutput && (
                    <div className="rounded-lg border border-white/10 p-3">
                      <div className="text-zinc-300 mb-2">Result</div>
                      <img src={selectedOutput} alt="model-swap-result" className="w-full max-h-64 object-contain rounded-md border border-white/10 bg-white/5" />
                    </div>
                  )}
                </div>
              )}
            </aside>
          </div>

          {/* History */}
          <div className="rounded-3xl border border-white/10 bg-white/[.06] shadow-xl p-4 md:p-5">
            <div className="text-sm font-semibold mb-2">History</div>
            {history.length === 0 ? (
              <div className="text-xs text-zinc-300/80 px-1 py-4">— No renders yet —</div>
            ) : (
              <>
                <div className="mb-2"><button onClick={()=>setHistory([])} className="text-xs px-2 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10">Clear history</button></div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {history.map((h, i) => (
                    <button key={i} onClick={()=>{ setResultUrls(h.outputs); setSelectedOutput(h.outputs?.[0]||''); }} className="group relative rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition bg-white/5">
                      <img src={(h.outputs && h.outputs[0]) || (h.inputs && h.inputs[0])} alt="hist" className="w-full h-28 object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 text-[10px] px-2 py-1 bg-black/35 text-white backdrop-blur">{h.tool} • {new Date(h.ts).toLocaleTimeString()}</div>
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
          <motion.div className="fixed inset-0 z-[100] grid place-items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowEnhance(false)} />
            <div className="relative w-full max-w-3xl mx-3">
              <EnhanceCustomizer initial={pendingPreset || undefined}
                onComplete={(form) => { setShowEnhance(false); setPendingPreset(null); runEnhance(form); }} />
            </div>
          </motion.div>
        )}

        {showPieceType && (
          <motion.div className="fixed inset-0 z-[110] grid place-items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowPieceType(false)} />
            <div className="relative w-full max-w-md mx-3">
              <PieceTypeModal
                initial={pieceType || 'upper'}
                onCancel={() => setShowPieceType(false)}
                onConfirm={(type) => { setPieceType(type); setShowPieceType(false); setTryonStep('model'); }}
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
function DropSimple({ label, file, local, onPick }) {
  const inputRef = useRef(null);
  return (
    <div onClick={() => inputRef.current?.click()} className="min-h-[220px] grid place-items-center rounded-2xl border-2 border-dashed border-white/20 bg-white/5 hover:bg-white/10 transition cursor-pointer">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={async (e)=>{ const f = e.target.files?.[0]; if (f) await onPick(f); }} />
      {!local ? (
        <div className="text-center text-zinc-300 text-sm">
          <div className="mx-auto mb-3 grid place-items-center size-11 rounded-full bg-white/10 border border-white/15">⬆</div>
          {label}: Click to choose
        </div>
      ) : (
        <img src={local} alt={label} className="max-w-full max-h-[45vh] object-contain rounded-xl" />
      )}
    </div>
  );
}

function InputSlot({ label, mode, setMode, file, setFile, url, setUrl, hint }) {
  const inputRef = useRef(null);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-zinc-300">{label}</div>
        <div className="inline-flex rounded-md border border-white/10 bg-white/5 overflow-hidden">
          <button onClick={()=>setMode('upload')} className={[ 'px-2 py-1 text-[11px]', mode==='upload' ? 'bg-white text-zinc-900' : 'text-zinc-200 hover:bg-white/10' ].join(' ')}>Upload</button>
          <button onClick={()=>setMode('url')} className={[ 'px-2 py-1 text-[11px]', mode==='url' ? 'bg-white text-zinc-900' : 'text-zinc-200 hover:bg-white/10' ].join(' ')}>URL</button>
        </div>
      </div>

      {mode === 'upload' ? (
        <div onClick={() => inputRef.current?.click()} className="min-h-[160px] grid place-items-center rounded-xl border-2 border-dashed border-white/20 bg-white/5 hover:bg-white/10 transition cursor-pointer">
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e)=>{ const f = e.target.files?.[0]; if (f) setFile(f); }} />
          {!file ? (
            <div className="text-center text-zinc-300 text-xs">
              <div className="mx-auto mb-2 grid place-items-center size-10 rounded-full bg-white/10 border border-white/15">⬆</div>
              Drag & drop / Click
              {hint && <div className="mt-1 text-[10px] text-zinc-400">{hint}</div>}
            </div>
          ) : (
            <img src={URL.createObjectURL(file)} alt={label} className="max-w-full max-h-[32vh] object-contain rounded-lg" />
          )}
        </div>
      ) : (
        <input value={url} onChange={(e)=>setUrl(e.target.value)} placeholder="https://public-image.jpg"
               className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm" />
      )}
    </div>
  );
}

function PresetCard({ title, subtitle, onClick, preview, tag }) {
  const [broken, setBroken] = useState(false);
  const [loaded, setLoaded] = useState(false);
  if (broken) return null;
  return (
    <button onClick={onClick} className="group relative rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 bg-white/5 shadow transition text-left hover:shadow-2xl">
      <div className="relative w-full aspect-[4/3] bg-white/5">
        {!loaded && (<div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/10 via-white/5 to-white/10" />)}
        <img src={preview} alt={title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" onLoad={()=>setLoaded(true)} onError={()=>setBroken(true)} />
        {tag && (<span className="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full bg-black/50 text-white backdrop-blur shadow">{tag}</span>)}
        <div className="absolute top-2 right-2 rounded-full bg-white/90 backdrop-blur px-2 py-1 text-[11px] border border-white shadow-sm text-zinc-900">Use preset</div>
      </div>
      <div className="p-3">
        <div className="font-semibold">{title}</div>
        <div className="text-xs text-zinc-300/90">{subtitle}</div>
      </div>
    </button>
  );
}

function ModelCard({ model, active, onSelect }) {
  return (
    <button onClick={onSelect} className={[
      'group relative rounded-2xl overflow-hidden border bg-white/5 shadow transition',
      active ? 'border-violet-400/50 ring-2 ring-violet-400/30' : 'border-white/10 hover:border-white/20 hover:shadow-2xl',
    ].join(' ')} title={model.name}>
      <div className="relative w-full aspect-[4/5] bg-white/5">
        <img src={model.url} alt={model.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        <div className="absolute top-2 left-2 rounded-full bg-white/90 backdrop-blur px-2 py-1 text-[11px] border border-white shadow-sm text-zinc-900">{active ? 'Selected' : 'Use model'}</div>
      </div>
      <div className="p-3">
        <div className="font-semibold truncate">{model.name}</div>
        <div className="text-[11px] text-zinc-300/90">Pose: {model.pose}</div>
      </div>
    </button>
  );
}

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
          const done = i < idx; const active = i === idx;
          return (
            <div key={s.id} className="flex-1">
              <div className="flex items-center gap-2">
                <motion.div layout className={[
                  'size-6 rounded-full grid place-items-center border text-[11px] font-semibold',
                  done ? 'bg-emerald-500 text-white border-emerald-500'
                       : active ? 'bg-violet-600 text-white border-violet-600'
                                : 'bg-white/10 text-white border-white/20',
                ].join(' ')}>
                  {done ? '✓' : i + 1}
                </motion.div>
                <div className={[
                  'text-xs sm:text-[13px]',
                  done ? 'text-emerald-300' : active ? 'text-violet-300' : 'text-zinc-300/90',
                ].join(' ')}>{s.label}</div>
              </div>
              {i < steps.length - 1 && (
                <motion.div layout className="h-1 mt-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div initial={false} animate={{ width: i < idx ? '100%' : '0%' }} transition={{ type: 'spring', stiffness: 120, damping: 18 }} className="h-full bg-violet-400" />
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
    idle: { label: 'Ready', color: 'bg-white/10 text-white border-white/20' },
    processing: { label: 'Processing', color: 'bg-amber-200/20 text-amber-200 border-amber-200/30' },
    ready: { label: 'Done', color: 'bg-emerald-300/20 text-emerald-200 border-emerald-300/30' },
    error: { label: 'Error', color: 'bg-rose-300/20 text-rose-200 border-rose-300/30' },
  };
  const it = map[phase] || map.idle;
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${it.color}`}>
      <span className={`inline-block size-2 rounded-full ${phase === 'processing' ? 'bg-white animate-pulse' : 'bg-white'}`} />
      {it.label}
    </span>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex items-center justify-between gap-3 text-xs">
      <span className="min-w-28 text-zinc-300/90">{label}</span>
      <div className="flex-1">{children}</div>
    </label>
  );
}
function Color({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <input type="color" value={value} onChange={(e)=>onChange(e.target.value)} />
      <input className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1" value={value} onChange={(e)=>onChange(e.target.value)} />
    </div>
  );
}
function Range({ value, onChange, min, max, step = 1 }) {
  return (
    <div className="flex items-center gap-2">
      <input type="range" value={value} min={min} max={max} step={step} onChange={(e)=>onChange(Number(e.target.value))} className="w-full accent-violet-500" />
      <span className="w-10 text-right">{typeof value === 'number' ? value : ''}</span>
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
    <div className="rounded-2xl bg-white p-4 sm:p-5 shadow-2xl border space-y-3 text-zinc-900">
      <div className="text-sm font-semibold">Choose clothing type</div>
      <div className="grid grid-cols-1 gap-2">
        {options.map((o) => (
          <button key={o.id} onClick={()=>setActive(o.id)} className={[
            'w-full text-left rounded-xl border px-3 py-2 text-sm transition',
            active===o.id ? 'border-violet-400 bg-violet-50' : 'border-zinc-200 hover:bg-zinc-50',
          ].join(' ')}>
            {o.label}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-end gap-2 pt-1">
        <button className="rounded-lg border px-3 py-1.5 text-xs" onClick={onCancel}>Cancel</button>
        <button className="rounded-lg bg-zinc-900 text-white px-3 py-1.5 text-xs" onClick={()=>onConfirm(active)}>Continue</button>
      </div>
    </div>
  );
}

function EnhanceCustomizer({ initial, onComplete }) {
  return (
    <div className="rounded-2xl bg-white p-4 sm:p-5 shadow-2xl border space-y-3 text-zinc-900">
      <div className="text-sm font-semibold">Enhance Settings</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <label className="space-y-1"><span className="text-zinc-600">Style</span>
          <input defaultValue={initial?.photographyStyle || ''} className="w-full rounded-lg border px-2 py-1" placeholder="studio product photography, 50mm" id="enh-style" />
        </label>
        <label className="space-y-1"><span className="text-zinc-600">Background</span>
          <input defaultValue={initial?.background || ''} className="w-full rounded-lg border px-2 py-1" placeholder="white seamless" id="enh-bg" />
        </label>
        <label className="space-y-1"><span className="text-zinc-600">Lighting</span>
          <input defaultValue={initial?.lighting || ''} className="w-full rounded-lg border px-2 py-1" placeholder="softbox, gentle reflections" id="enh-light" />
        </label>
        <label className="space-y-1">
          <span className="text-zinc-600">Colors</span>
          <input
            defaultValue={initial?.colorStyle || ''}
            className="w-full rounded-lg border px-2 py-1"
            placeholder="neutral whites, subtle grays"
            id="enh-color"
          />
        </label>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          className="rounded-lg border px-3 py-1.5 text-xs"
          onClick={() => {
            const form = {
              photographyStyle: document.getElementById('enh-style')?.value || '',
              background: document.getElementById('enh-bg')?.value || '',
              lighting: document.getElementById('enh-light')?.value || '',
              colorStyle: document.getElementById('enh-color')?.value || '',
              realism: initial?.realism || 'photo-real',
              outputQuality: initial?.outputQuality || '4k',
            };
            onComplete(form);
          }}
        >
          Run
        </button>
      </div>
    </div>
  );
}

function Thumb({ src }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 grid place-items-center p-2">
      <img src={src} alt="thumb" className="max-w-full max-h-[38vh] object-contain" />
    </div>
  );
}

/* ----- Icons (SVG) ----- */
function SparkleIcon(props) { return (<svg viewBox="0 0 24 24" className={props.className || ''}><path d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z" fill="currentColor" /></svg>); }
function BoxIcon(props) { return (<svg viewBox="0 0 24 24" className={props.className || ''}><path d="M12 2l8 4v12l-8 4-8-4V6l8-4zm0 2l-6 3 6 3 6-3-6-3zm-6 5v8l6 3V12l-6-3zm8 3v8l6-3V9l-6 3z" fill="currentColor" /></svg>); }
function PersonIcon(props) { return (<svg viewBox="0 0 24 24" className={props.className || ''}><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-4.33 0-8 2.17-8 4.5V21h16v-2.5C20 16.17 16.33 14 12 14z" fill="currentColor" /></svg>); }
function ScissorsIcon(props) { return (<svg viewBox="0 0 24 24" className={props.className || ''}><path d="M14.7 6.3a1 1 0 1 1 1.4 1.4L13.83 10l2.27 2.27a1 1 0 1 1-1.42 1.42L12.4 11.4l-2.3 2.3a3 3 0 1 1-1.41-1.41l2.3-2.3-2.3-2.3A3 3 0 1 1 10.1 6.3l2.3 2.3 2.3-2.3zM7 17a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0-8a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="currentColor" /></svg>); }
function RocketIcon(props) { return (<svg viewBox="0 0 24 24" className={props.className || ''}><path d="M5 14s2-6 9-9c0 0 1.5 3.5-1 7 0 0 3.5-1 7-1-3 7-9 9-9 9 0-3-6-6-6-6z" fill="currentColor" /><circle cx="15" cy="9" r="1.5" fill="#fff" /></svg>); }
function SwapIcon(props) { return (<svg viewBox="0 0 24 24" className={props.className || ''}><path d="M7 7h9l-2-2 1.4-1.4L20.8 7l-5.4 3.4L14 9l2-2H7V7zm10 10H8l2 2-1.4 1.4L3.2 17l5.4-3.4L10 15l-2 2h9v0z" fill="currentColor" /></svg>); }
function PlayIcon(props) { return (<svg viewBox="0 0 24 24" className={props.className || ''}><path d="M8 5v14l11-7z" fill="currentColor" /></svg>); }
