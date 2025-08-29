import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';

/**
 * Unified AI Studio Dashboard (pages/dashboard.js)
 * - Tools: Enhance, Try-On (multi-items), Model Swap, Remove BG
 * - Upload to Supabase or paste URL
 * - Sends to /api/ai (nano-banana) with { prompt, imageUrl|imageUrls, user_email, num_images }
 * - Max outputs: 1 (count=1)
 * - NOTE: Pages Router page (no "use client" pragma needed)
 */

/* -------------------------------------------------------
   Debug helpers (disabled by default)
------------------------------------------------------- */
const DEBUG =
  (typeof process !== 'undefined' &&
    process.env?.NEXT_PUBLIC_DEBUG === 'true') || false;

const dbg = (...args) => {
  if (!DEBUG) return;
  try {
    console.log('[AIStudio]', ...args);
  } catch {}
};

const dbgGroup = (title, obj) => {
  if (!DEBUG) return;
  try {
    console.groupCollapsed(`🧪 ${title}`);
    console.log(obj);
    console.groupEnd();
  } catch {}
};

const getSiteOrigin = () => {
  try {
    if (typeof window !== 'undefined' && window.location?.origin)
      return window.location.origin;
  } catch {}
  const envUrl =
    process.env?.NEXT_PUBLIC_SITE_URL ||
    process.env?.NEXT_PUBLIC_VERCEL_URL ||
    '';
  if (!envUrl) return '';
  return envUrl.startsWith('http') ? envUrl : `https://${envUrl}`;
};

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
const MAX_ITEMS = 4;

const hexToRGBA = (hex, a = 1) => {
  const c = hex.replace('#', '');
  const v = c.length === 3 ? c.replace(/(.)/g, '$1$1') : c;
  const n = parseInt(v, 16);
  const r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const fileToDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2);

/** pick URLs from various API response shapes */
const pickUrls = (out) => {
  if (!out) return [];
  if (Array.isArray(out)) return out.filter(Boolean);

  const keys = ['variants', 'urls', 'output', 'images', 'result', 'image'];
  for (const k of keys) {
    if (Array.isArray(out[k])) return out[k].filter(Boolean);
    if (typeof out[k] === 'string') return [out[k]];
  }

  if (typeof out === 'string') return [out];
  const one = out.url || out.image || out.result;
  return one ? [one] : [];
};

/* -------------------------------------------------------
   Small UI
------------------------------------------------------- */
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
            'px-3 py-1.5 text-xs rounded-lg transition focus:outline-none focus:ring-2 focus:ring-violet-400/70',
            mode === t.id
              ? 'bg-white text-zinc-900 shadow'
              : 'text-zinc-200 hover:bg-white/10',
          ].join(' ')}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* -------------------------------------------------------
   Presets & models
------------------------------------------------------- */
const ENHANCE_PRESETS = [
  {
    id: 'atelier-white',
    title: 'Atelier White',
    subtitle: 'Soft studio • glossy rim',
    tag: 'Popular',
    config: {
      photographyStyle:
        'studio product photography, 50mm prime, editorial minimal',
      background: 'white cyclorama, subtle falloff',
      lighting: 'big softbox + rim, soft reflections',
      colorStyle: 'neutral whites, pearl highlights',
      realism: 'hyperrealistic micro-textures',
      outputQuality: '4k ultra sharp',
    },
    preview: '/clean-studio.webp',
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
      photographyStyle: 'editorial catalog, tasteful negative space',
      background: 'matte beige',
      lighting: 'directional key + fill',
      colorStyle: 'beige monochrome',
      realism: 'realistic',
      outputQuality: '4k print',
    },
    preview: '/editorial-beige.webp',
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
      outputQuality: '4k',
    },
    preview: '/slate-contrast.webp',
  },
];

const MODELS = [
  { id: 'm01', name: 'Ava — Studio Front', pose: 'front', url: 'https://www.aistoreassistant.app/models/m01.webp' },
  { id: 'm02', name: 'Maya — Side Pose', pose: 'side', url: '/models/m02.webp' },
  { id: 'm03', name: 'Lina — Half Body', pose: 'half', url: '/models/m03.webp' },
  { id: 'm04', name: 'Zoe — Studio 3/4', pose: '34', url: '/models/m04.webp' },
  { id: 'm05', name: 'Noah — Casual Front', pose: 'front', url: '/models/m05.webp' },
  { id: 'm06', name: 'Omar — Studio Side', pose: 'side', url: '/models/m06.webp' },
  { id: 'm07', name: 'Yara — Full Body', pose: 'full', url: 'https://www.aistoreassistant.app/models/m07.webp' },
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
    const item = {
      id,
      msg,
      type: opts.type || 'info',
      progress: opts.progress ?? null,
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
              <button
                className="text-xs text-zinc-300 hover:text-white"
                onClick={() => onClose(t.id)}
              >
                ✕
              </button>
            </div>
            {typeof t.progress === 'number' && (
              <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-white/70 transition-all"
                  style={{ width: `${clamp(t.progress, 0, 100)}%` }}
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
  { id: 'people', label: 'People', icon: PersonIcon },
];

const PRODUCT_TOOLS = [
  { id: 'enhance', label: 'Enhance', icon: RocketIcon },
  { id: 'removeBg', label: 'Remove BG', icon: ScissorsIcon },
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

  /* ---------- app state ---------- */
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState('product');
  const [tool, setTool] = useState('enhance');
  const [plan, setPlan] = useState('Free');

  // outputs
  const [resultUrls, setResultUrls] = useState([]); // array
  const [selectedOutput, setSelectedOutput] = useState('');

  // common
  const [phase, setPhase] = useState('idle'); // idle|processing|ready|error
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [history, setHistory] = useState([]);
  const [count] = useState(1); // ثابت = مخرج واحد
  const [progress, setProgress] = useState(null); // null | 0..100

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

  // swap two slots
  const [swapA, setSwapA] = useState({
    mode: 'upload',
    file: null,
    url: '',
    local: '',
  });
  const [swapB, setSwapB] = useState({
    mode: 'upload',
    file: null,
    url: '',
    local: '',
  });
  const [swapPrompt, setSwapPrompt] = useState(
    'Clean composite, photorealistic.'
  );

  // try-on multi-items
  const [tryItems, setTryItems] = useState([
    {
      id: uid(),
      mode: 'upload', // upload|url
      file: null,
      url: '',
      local: '',
      type: 'upper', // upper|lower|dress|hat|accessory
      autoRemoveBg: false, // UI فقط الآن
    },
  ]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [tryonStep, setTryonStep] = useState('items'); // items|model|run

  const hasItems = useMemo(
    () =>
      tryItems.some(
        (it) =>
          (it.mode === 'upload' && !!it.file) ||
          (it.mode === 'url' && !!it.url?.trim())
      ),
    [tryItems]
  );

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
      } catch {
        /* ignore */
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [user, router, supabase]);

  /* ---------- auto-step for Try-On ---------- */
  useEffect(() => {
    if (tool !== 'tryon') return;
    if (!hasItems) setTryonStep('items');
    else if (!selectedModel) setTryonStep('model');
    else setTryonStep('run');
  }, [tool, hasItems, selectedModel]);

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
            <path d='M0 12h24M12 0v24' stroke='${hexToRGBA(
              '#ffffff',
              patternOpacity
            )}' stroke-width='1' opacity='0.25'/>
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
      borderRadius: `${radius}px`,
      padding: `${padding}px`,
      boxShadow: shadow
        ? '0 24px 60px rgba(0,0,0,.25), 0 8px 22px rgba(0,0,0,.15)'
        : 'none',
      transition: 'all .25s ease',
    };
  }, [bgMode, color, color2, angle, radius, padding, shadow, patternOpacity]);

  /* ---------- storage ---------- */
  const uploadToStorage = useCallback(
    async (f) => {
      if (!f) throw new Error('no file');
      const ext = (f.name?.split('.').pop() || 'png').toLowerCase();
      const path = `${user.id}/${Date.now()}_${Math.random()
        .toString(36)
        .slice(2)}.${ext}`;
      dbg('🗂️ Uploading to Supabase...', { path, type: f.type, size: f.size });
      const { error: upErr } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, f, {
          cacheControl: '3600',
          upsert: false,
          contentType: f.type || 'image/*',
        });
      if (upErr) {
        dbg('❌ Supabase upload error', upErr);
        throw upErr;
      }
      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      if (!data?.publicUrl) throw new Error('no public url');
      dbg('✅ Public URL', data.publicUrl);
      return data.publicUrl;
    },
    [supabase, user]
  );

  const ensureUrl = useCallback(
    async (slot) => {
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
    },
    [uploadToStorage]
  );

  const ensureUrlItem = useCallback(async (item) => {
    return ensureUrl(item);
  }, [ensureUrl]);

  /* ---------- prompt builders ---------- */
  /* ---------- prompt builders ---------- */
const buildEnhancePrompt = (f) =>
  [
    f?.photographyStyle && `${f.photographyStyle}`,
    f?.background && `background: ${f.background}`,
    f?.lighting && `lighting: ${f.lighting}`,
    f?.colorStyle && `colors: ${f.colorStyle}`,
    f?.realism,
    f?.outputQuality && `output: ${f.outputQuality}`,
  ]
    .filter(Boolean)
    .join(', ');

// دالة واحدة فقط — لا تكررها مرة ثانية
const labelForType = (t = 'upper') =>
  t === 'upper' ? 'TOP'
  : t === 'lower' ? 'BOTTOM'
  : t === 'dress' ? 'FULL OUTFIT'
  : t === 'hat'   ? 'HAT'
  : 'ACCESSORY';

// برومبت try-on المحسّن (يمنع التكرار ويستبدل اللبس القديم ويحافظ على الجودة)
const buildTryOnPrompt = (items = []) => {
  const ready = items.filter(
    it => (it.mode === 'upload' && it.file) || (it.mode === 'url' && it.url?.trim())
  );
  if (ready.length === 0) {
    return "Apply try-on to the existing model image. Output one photorealistic image only.";
  }

  const identityPolicy =
    "Use the same person, face, body, pose, camera, framing and background; do not generate a new person.";
  const deDupePolicy =
    "Output exactly one image with one person; do not duplicate, mirror or add extra bodies, faces or limbs.";
  const replacePolicy =
    "If the model already wears an item in the same region, REPLACE it with the provided one (no double layering). For jackets/outerwear, place on top only if provided. If a hat is provided, remove any previous hat.";
  const layeringPolicy =
    "Layering order: DRESS replaces TOP and BOTTOM; TOP sits on torso; BOTTOM on hips/legs; HAT on head above hair with a soft shadow; ACCESSORIES placed naturally with correct scale.";
  const fitPolicy =
    "Align fit and drape to anatomy and pose; match neckline/shoulders/waist/hips; respect occlusions with arms, hands and hair; realistic wrinkles and thickness; clean edges without halos.";
  const colorLightPolicy =
    "Preserve garment color/texture; match scene lighting and shadows; no color shifts.";
  const qualityPolicy =
    "High-fidelity photorealistic output (~4k), sharp and clean; no artifacts, no watermarks, no extra text.";
  const backgroundPolicy =
    "Do not change or blur the background; minimal reframing only if needed.";

  if (ready.length === 1) {
    const region = labelForType(ready[0].type);
    return [
      `Dress the model with the provided ${region}.`,
      identityPolicy,
      deDupePolicy,
      replacePolicy,
      layeringPolicy,
      fitPolicy,
      colorLightPolicy,
      qualityPolicy,
      backgroundPolicy,
      "Output exactly one photorealistic image."
    ].join(' ');
  }

  const counts = ready.reduce((m, it) => {
    const k = it.type || 'accessory';
    m[k] = (m[k] || 0) + 1;
    return m;
  }, {});
  const parts = Object.entries(counts)
    .map(([k, v]) => `${v}× ${labelForType(k)}`)
    .join(', ');

  return [
    `Compose all provided items on the SAME model in a single output (${parts}).`,
    identityPolicy,
    deDupePolicy,
    layeringPolicy,
    replacePolicy,
    "If multiple items target the same region, use the LAST provided item as the visible garment; do not show duplicates.",
    fitPolicy,
    colorLightPolicy,
    qualityPolicy,
    backgroundPolicy,
    "Output exactly one photorealistic image."
  ].join(' ');
};


  /* ---------- unified runners (all except Remove BG) ---------- */
  const callUnified = useCallback(
    async ({ mode, prompt, image_input, count = 1 }) => {
      const t = toasts.push(
        `${mode === 'enhance' ? 'Enhancing' : mode === 'tryon' ? 'Try-On' : 'Model Swap'}…`,
        { progress: 10 }
      );
      let adv = 10;
      setProgress(10);
      const iv = setInterval(() => {
        adv = Math.min(adv + 6, 88);
        t.update({ progress: adv });
        setProgress(adv);
      }, 450);
      try {
        const clean = ensureHttpList(image_input);
        if (clean.length === 0) throw new Error('No valid http(s) image URLs to send');

        const payload = {
          prompt,
          user_email: (user?.email || '').toLowerCase(),
          num_images: clamp(count, 1, 1), // ثابت: صورة واحدة
          _client_debug: {
            mode,
            siteOrigin: getSiteOrigin(),
            sentAt: new Date().toISOString(),
            imageCount: clean.length,
          },
        };
        if (clean.length > 1) payload.imageUrls = clean;
        else payload.imageUrl = clean[0];

        dbgGroup('⬆️ /api/ai payload', payload);

        const r = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const txt = await r.text();
        let j = {};
        try {
          j = JSON.parse(txt);
        } catch {
          j = { raw: txt };
        }

        dbgGroup('⬇️ /api/ai response', { status: r.status, ok: r.ok, json: j });

        if (!r.ok) throw new Error(j?.error || 'API error');

        const urls = pickUrls(j);
        if (!urls.length) throw new Error('No output URLs returned');

        setResultUrls(urls);
        setSelectedOutput(urls[0]);
        setHistory((h) =>
          [{ tool: mode, inputs: clean, outputs: urls, ts: Date.now() }, ...h].slice(0, 48)
        );
        setPhase('ready');
        t.update({ progress: 100, msg: `${mode} ✓` });
        setProgress(100);
        setTimeout(() => t.close(), 600);
      } catch (e) {
        dbg('❌ callUnified error', e);
        setPhase('error');
        setErr(e?.message || 'Failed');
        t.update({ msg: `${mode} failed: ${e?.message || 'Error'}`, type: 'error' });
        setTimeout(() => t.close(), 1400);
      } finally {
        clearInterval(iv);
        setTimeout(() => setProgress(null), 500);
      }
    },
    [toasts, user]
  );

  const runEnhance = useCallback(
    async (form) => {
      if (enhMode === 'upload' && !enhFile) {
        setErr('Upload an image first.');
        return;
      }
      if (enhMode === 'url' && !enhUrl) {
        setErr('Enter an image URL.');
        return;
      }
      setErr('');
      setPhase('processing');
      setBusy(true);
      try {
        const imageUrl =
          enhMode === 'url' ? toAbsoluteUrl(enhUrl.trim()) : await uploadToStorage(enhFile);
        const prompt = buildEnhancePrompt(form);
        dbgGroup('🎛️ Enhance params', { imageUrl, prompt });
        await callUnified({ mode: 'enhance', prompt, image_input: [imageUrl], count });
      } finally {
        setBusy(false);
      }
    },
    [enhMode, enhFile, enhUrl, count, uploadToStorage, callUnified]
  );

  const runTryOn = useCallback(async () => {
    if (!selectedModel?.url) {
      setErr('Select a model.');
      return;
    }
    const ready = tryItems.filter(
      (it) =>
        (it.mode === 'upload' && it.file) || (it.mode === 'url' && it.url?.trim())
    );
    if (ready.length === 0) {
      setErr('Add at least one item.');
      return;
    }

    setErr('');
    setPhase('processing');
    setBusy(true);
    try {
      const modelAbs = toAbsoluteUrl(selectedModel.url);
      const itemUrls = [];
      for (const it of ready) {
        const u = await ensureUrlItem(it);
        if (u) itemUrls.push(u);
      }

      const prompt = buildTryOnPrompt(ready);

      const origin = getSiteOrigin();
      dbgGroup('🧥 Try-On inputs', {
        origin,
        modelOriginal: selectedModel.url,
        modelAbs,
        itemCount: itemUrls.length,
        count,
      });

      if (!/^https?:\/\//i.test(modelAbs))
        throw new Error('Model image is not an http(s) URL');

      const image_input = [modelAbs, ...itemUrls];

      await callUnified({
        mode: 'tryon',
        prompt,
        image_input,
        count,
      });
    } finally {
      setBusy(false);
    }
  }, [selectedModel, tryItems, count, ensureUrlItem, callUnified]);

  const runModelSwap = useCallback(async () => {
    if (swapA.mode === 'upload' && !swapA.file) {
      setErr('Provide Image A.');
      return;
    }
    if (swapB.mode === 'upload' && !swapB.file) {
      setErr('Provide Image B.');
      return;
    }
    if (swapA.mode === 'url' && !swapA.url) {
      setErr('Provide URL for A.');
      return;
    }
    if (swapB.mode === 'url' && !swapB.url) {
      setErr('Provide URL for B.');
      return;
    }

    setErr('');
    setPhase('processing');
    setBusy(true);
    try {
      const urlA = await ensureUrl(swapA);
      const urlB = await ensureUrl(swapB);
      dbgGroup('🔁 ModelSwap inputs', { urlA, urlB, prompt: swapPrompt, count });
      await callUnified({
        mode: 'swap',
        prompt: swapPrompt,
        image_input: [urlA, urlB],
        count,
      });
    } finally {
      setBusy(false);
    }
  }, [swapA, swapB, swapPrompt, count, ensureUrl, callUnified]);

  /* ---------- remove bg (kept separate) ---------- */
  const runRemoveBg = useCallback(async () => {
    if (!rbFile) {
      setErr('Pick an image first.');
      return;
    }
    setBusy(true);
    setErr('');
    setPhase('processing');
    const t = toasts.push('Removing background…', { progress: 8 });
    let adv = 8;
    const iv = setInterval(() => {
      adv = Math.min(adv + 6, 88);
      t.update({ progress: adv });
      setProgress(adv);
    }, 450);
    try {
      dbgGroup('🧼 RemoveBG req', { hasData: !!rbData, local: rbLocal?.slice(0, 60) });
      const r = await fetch('/api/remove-bg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData: rbData }),
      });
      const txt = await r.text();
      let j = {};
      try {
        j = JSON.parse(txt);
      } catch {
        j = { raw: txt };
      }
      dbgGroup('🧼 RemoveBG resp', { status: r.status, ok: r.ok, json: j });
      if (!r.ok) throw new Error(j?.error || 'remove-bg failed');
      const urls = pickUrls(j);
      if (!urls.length) throw new Error('No output from remove-bg');
      setResultUrls(urls);
      setSelectedOutput(urls[0]);
      setHistory((h) =>
        [{ tool: 'removeBg', inputs: [rbLocal], outputs: urls, ts: Date.now() }, ...h].slice(
          0,
          48
        )
      );
      setPhase('ready');
      t.update({ progress: 100, msg: 'Background removed ✓' });
      setProgress(100);
      setTimeout(() => t.close(), 600);
    } catch (e) {
      dbg('❌ removeBg error', e);
      setPhase('error');
      setErr('Failed to process.');
      t.update({ msg: `Remove BG failed: ${e?.message || 'Error'}`, type: 'error' });
      setTimeout(() => t.close(), 1400);
    } finally {
      clearInterval(iv);
      setTimeout(() => setProgress(null), 500);
      setBusy(false);
    }
  }, [rbFile, rbData, rbLocal, toasts]);

  /* ---------- UI helpers ---------- */
  const resetAll = () => {
    setResultUrls([]);
    setSelectedOutput('');
    setErr('');
    setPhase('idle');
    setEnhFile(null);
    setEnhLocal('');
    setEnhUrl('');
    setPendingPreset(null);
    setRbFile(null);
    setRbLocal('');
    setRbData('');
    setSwapA({ mode: 'upload', file: null, url: '', local: '' });
    setSwapB({ mode: 'upload', file: null, url: '', local: '' });
    setTryItems([
      { id: uid(), mode: 'upload', file: null, url: '', local: '', type: 'upper', autoRemoveBg: false },
    ]);
    setSelectedModel(null);
    setTryonStep('items');
    setProgress(null);
  };

  const switchTool = (nextId) => {
    setTool(nextId);
    setErr('');
    setPhase('idle');
    setResultUrls([]);
    setSelectedOutput('');
    if (nextId === 'tryon') setTryonStep('items');
  };

  const allowedTools = (g) => (g === 'product' ? PRODUCT_TOOLS : PEOPLE_TOOLS).map(t => t.id);

  if (loading || user === undefined) {
    return (
      <main className="min-h-screen grid place-items-center bg-gradient-to-b from-[#0b0b0f] to-[#140b22] text-zinc-300">
        <div className="rounded-2xl bg-white/5 backdrop-blur px-4 py-3 border border-white/10 shadow text-sm">
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
    <main className="min-h-screen bg-[radial-gradient(60%_120%_at_50%_-10%,#2a1746_0%,#0b0b0f_55%)] text-zinc-50">
      {/* Global font polish */}
      <style jsx global>{`
        html,
        body {
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Inter,
            Roboto, Helvetica, Arial, Noto Sans, Apple Color Emoji, Segoe UI Emoji;
        }
      `}</style>

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
                const Active = group === g.id;
                const Icon = g.icon;
                return (
                  <button
                    key={g.id}
                    onClick={() => {
                      const nextGroup = g.id;
                      setGroup(nextGroup);
                      // لا تغيّر الأداة تلقائيًا إلا إذا لم تكن ضمن المجموعة الجديدة
                      if (!allowedTools(nextGroup).includes(tool)) {
                        setTool(nextGroup === 'product' ? 'enhance' : 'tryon');
                      }
                    }}
                    className={[
                      'inline-flex items-center gap-2 py-1.5 px-3 rounded-full text-sm transition focus:outline-none focus:ring-2 focus:ring-violet-400/70',
                      Active
                        ? 'bg-white/90 text-zinc-900 shadow'
                        : 'text-zinc-200 hover:bg-white/10',
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
                const Active = tool === t.id;
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => switchTool(t.id)}
                    className={[
                      'w-full group flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-violet-400/70',
                      Active
                        ? 'bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-violet-400/30'
                        : 'hover:bg-white/5 border border-white/5',
                    ].join(' ')}
                  >
                    <Icon
                      className={[
                        'size-4',
                        Active
                          ? 'text-violet-300'
                          : 'text-zinc-300 group-hover:text-zinc-100',
                      ].join(' ')}
                    />
                    <span className="truncate">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-4 py-4 border-t border-white/10 bg-white/[.02]">
            <div className="flex items-center gap-3">
              <div className="grid place-items-center size-10 rounded-full bg-white/10 text-white font-bold">
                {initials}
              </div>
              <div className="text-sm">
                <div className="font-medium leading-tight">
                  {user.user_metadata?.name || user.email}
                </div>
                <div className="text-[11px] text-zinc-300/80">Plan: {plan}</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main column */}
        <section className="space-y-5 md:space-y-6">
          {/* Header / Presets / Try-On Models */}
          <motion.div
            layout
            className="rounded-3xl border border-white/10 bg-white/[.06] backdrop-blur p-4 sm:p-5 md:p-6 shadow-xl"
          >
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
                  {group === 'product'
                    ? 'Premium Presets'
                    : tool === 'tryon'
                    ? 'AI Studio — Try-On'
                    : 'Model Swap'}
                </h1>
                <p className="text-zinc-300/90 text-xs sm:text-sm">
                  {group === 'product' ? (
                    <>
                      Pick a preset or open <span className="font-semibold">Customize</span>.
                    </>
                  ) : tool === 'tryon' ? (
                    <>Step 1: items → Step 2: model → Step 3: run.</>
                  ) : (
                    <>
                      Upload/URL for two images then run{' '}
                      <span className="font-semibold">Model Swap</span>.
                    </>
                  )}
                </p>
              </div>

              {group === 'product' && (
                <button
                  onClick={() => {
                    setTool('enhance');
                    setPendingPreset(null);
                    setShowEnhance(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs sm:text-sm font-semibold hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-violet-400/70"
                >
                  ✨ Customize Enhance
                </button>
              )}
            </div>

            {group === 'product' ? (
              <div className="mt-4">
                <div className="mb-2 text-[12px] font-semibold text-zinc-300">Enhance</div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {ENHANCE_PRESETS.map((p) => (
                    <PresetCard
                      key={p.id}
                      title={p.title}
                      subtitle={p.subtitle}
                      preview={p.preview}
                      tag={p.tag}
                      onClick={() => {
                        setTool('enhance');
                        setPendingPreset(p.config);
                        setShowEnhance(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : tool === 'tryon' ? (
              <div className="mt-4">
                <TryOnStepper step={tryonStep} />
                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-[12px] font-semibold text-zinc-300">
                      Clothing & Accessories (multi)
                    </div>
                    <button
                      onClick={() =>
                        setTryItems((s) =>
                          s.length >= MAX_ITEMS
                            ? s
                            : [
                                ...s,
                                {
                                  id: uid(),
                                  mode: 'upload',
                                  file: null,
                                  url: '',
                                  local: '',
                                  type: 'upper',
                                  autoRemoveBg: false,
                                },
                              ]
                        )
                      }
                      disabled={tryItems.length >= MAX_ITEMS}
                      className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-2.5 py-1.5 text-[11px] hover:bg-white/20 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-violet-400/70"
                      title="Add another item"
                    >
                      + Add Item
                    </button>
                  </div>

                  <div className="grid gap-3">
                    {tryItems.map((it, idx) => (
                      <TryItemCard
                        key={it.id}
                        index={idx}
                        item={it}
                        onMode={(m) =>
                          setTryItems((s) =>
                            s.map((x) => (x.id === it.id ? { ...x, mode: m } : x))
                          )
                        }
                        onFile={(f) =>
                          setTryItems((s) =>
                            s.map((x) =>
                              x.id === it.id
                                ? {
                                    ...x,
                                    file: f,
                                    local: f ? URL.createObjectURL(f) : '',
                                    url: '',
                                  }
                                : x
                            )
                          )
                        }
                        onUrl={(u) =>
                          setTryItems((s) =>
                            s.map((x) => (x.id === it.id ? { ...x, url: u } : x))
                          )
                        }
                        onType={(t) =>
                          setTryItems((s) =>
                            s.map((x) => (x.id === it.id ? { ...x, type: t } : x))
                          )
                        }
                        onRemove={() =>
                          setTryItems((s) => s.filter((x) => x.id !== it.id))
                        }
                      />
                    ))}
                  </div>

                  <div className="mt-2 text-xs text-zinc-300/90">
                    All items will be composited onto the same model in a single output.
                  </div>

                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-[12px] font-semibold text-zinc-300">Model</div>
                    </div>
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
                </div>
              </div>
            ) : (
              <div className="mt-2 text-xs text-zinc-300/90">
                Upload / paste two images below and write a short instruction.
              </div>
            )}
          </motion.div>

          {/* Workbench */}
          <div className="grid gap-4 md:gap-6 lg:grid-cols-[1fr_360px]">
            {/* Canvas Panel */}
            <section className="rounded-3xl border border-white/10 bg-white/[.06] shadow-xl relative">
              {/* Top bar: status + reset (بدون تكرار الأدوات) */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-3 sm:px-4 md:px-5 pt-3 md:pt-4">
                <div className="text-sm font-medium">
                  <StepBadge phase={phase} />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={resetAll}
                    className="text-xs px-2 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-violet-400/70"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Tool Work Areas */}
              <div className="m-3 sm:m-4 md:m-5">
                {tool === 'enhance' && (
                  <div className="grid gap-3">
                    <InputSlot
                      label="Image"
                      mode={enhMode}
                      setMode={setEnhMode}
                      file={enhFile}
                      setFile={(f) => {
                        setEnhFile(f);
                        setEnhLocal(f ? URL.createObjectURL(f) : '');
                      }}
                      url={enhUrl}
                      setUrl={setEnhUrl}
                      hint="Upload to Supabase or paste a public URL"
                    />
                    {enhLocal && enhMode === 'upload' && <Thumb src={enhLocal} />}
                  </div>
                )}

                {tool === 'removeBg' && (
                  <div className="grid gap-3">
                    <DropSimple
                      label="Remove BG"
                      file={rbFile}
                      local={rbLocal}
                      onPick={async (f) => {
                        setRbFile(f);
                        setRbLocal(URL.createObjectURL(f));
                        setRbData(await fileToDataURL(f));
                        setResultUrls([]);
                        setPhase('idle');
                      }}
                    />
                    <div className="text-[11px] text-zinc-300/80">
                      <span className="font-semibold">Note:</span> Preview frame does not affect the final output file.
                    </div>
                  </div>
                )}

                {tool === 'modelSwap' && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <InputSlot
                      label="Image A"
                      mode={swapA.mode}
                      setMode={(m) => setSwapA((s) => ({ ...s, mode: m }))}
                      file={swapA.file}
                      setFile={(f) =>
                        setSwapA((s) => ({
                          ...s,
                          file: f,
                          local: f ? URL.createObjectURL(f) : '',
                        }))
                      }
                      url={swapA.url}
                      setUrl={(u) => setSwapA((s) => ({ ...s, url: u }))}
                    />
                    <InputSlot
                      label="Image B"
                      mode={swapB.mode}
                      setMode={(m) => setSwapB((s) => ({ ...s, mode: m }))}
                      file={swapB.file}
                      setFile={(f) =>
                        setSwapB((s) => ({
                          ...s,
                          file: f,
                          local: f ? URL.createObjectURL(f) : '',
                        }))
                      }
                      url={swapB.url}
                      setUrl={(u) => setSwapB((s) => ({ ...s, url: u }))}
                    />
                  </div>
                )}

                {tool === 'tryon' && (
                  <div className="grid gap-3">
                    {/* Nothing here، تمَّت إدارة العناصر والموديلات في البطاقة أعلاه */}
                  </div>
                )}

                {/* Result preview (single) */}
                <div className="mt-4">
                  <div className="text-xs text-zinc-300/90 mb-2">Result</div>
                  <div
                    className="rounded-2xl overflow-hidden border border-white/10 grid place-items-center relative"
                    style={frameStyle}
                  >
                    {progress !== null && (
                      <div className="absolute inset-0 grid place-items-center bg-black/50">
                        <div className="text-3xl font-bold">{progress}%</div>
                      </div>
                    )}
                    {resultUrls[0] ? (
                      <img
                        src={resultUrls[0]}
                        alt="result"
                        className="max-w-full max-h-[62vh] object-contain rounded-xl"
                      />
                    ) : (
                      <div className="text-xs text-zinc-300/70 py-16">— No result yet —</div>
                    )}
                  </div>

                  {/* Output toolbar */}
                  {resultUrls[0] && (
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => window.open(resultUrls[0], '_blank')}
                        className="text-xs px-2 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10"
                      >
                        Open
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(resultUrls[0]);
                        }}
                        className="text-xs px-2 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10"
                      >
                        Copy Link
                      </button>
                      <a
                        href={resultUrls[0]}
                        download
                        className="text-xs px-2 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10"
                      >
                        Download
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Run button pinned to inspector (we also add here for desktop flow) */}
            </section>

            {/* Inspector */}
            <aside className="rounded-3xl border border-white/10 bg-white/[.06] shadow-xl p-4 md:p-5 h-fit">
              <div className="text-sm font-semibold mb-3">Inspector</div>

              {err && (
                <div className="mb-3 rounded-lg border border-rose-300/30 bg-rose-300/10 text-rose-100 text-xs px-3 py-2">
                  {err}
                </div>
              )}

              {tool === 'enhance' && (
                <div className="space-y-3">
                  <div className="text-xs text-zinc-300/90">
                    Open Enhance settings then run.
                  </div>
                  <button
                    onClick={() => setShowEnhance(true)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-white text-zinc-900 px-3 py-2 text-sm font-semibold hover:bg-white/90"
                    disabled={busy}
                  >
                    ✨ Open Enhance Settings
                  </button>
                </div>
              )}

              {tool === 'tryon' && (
                <div className="space-y-3">
                  <div className="text-xs text-zinc-300/90">
                    Add items and pick a model, then Run.
                  </div>
                  <button
                    onClick={runTryOn}
                    disabled={busy || !hasItems || !selectedModel}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-3 py-2 text-sm font-semibold disabled:opacity-50"
                  >
                    <PlayIcon className="w-4 h-4" /> Run Try-On (Combine)
                  </button>
                  {!hasItems && (
                    <div className="text-[11px] text-amber-200/90">
                      Add at least one clothing/accessory item.
                    </div>
                  )}
                  {hasItems && !selectedModel && (
                    <div className="text-[11px] text-amber-200/90">
                      Select a model to enable Run.
                    </div>
                  )}
                </div>
              )}

              {tool === 'modelSwap' && (
                <div className="space-y-3">
                  <label className="text-xs text-zinc-300/90">Prompt</label>
                  <input
                    value={swapPrompt}
                    onChange={(e) => setSwapPrompt(e.target.value)}
                    placeholder="Describe the composite…"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                  />
                  <button
                    onClick={runModelSwap}
                    disabled={
                      busy ||
                      (swapA.mode === 'upload' && !swapA.file) ||
                      (swapB.mode === 'upload' && !swapB.file) ||
                      (swapA.mode === 'url' && !swapA.url) ||
                      (swapB.mode === 'url' && !swapB.url)
                    }
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-white text-zinc-900 px-3 py-2 text-sm font-semibold disabled:opacity-50"
                  >
                    <PlayIcon className="w-4 h-4" /> Run Model Swap
                  </button>
                </div>
              )}

              {tool === 'removeBg' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-xs text-zinc-300/90">Preview frame</div>
                    <ModeTabs mode={bgMode} setMode={setBgMode} />
                    {bgMode === 'color' && (
                      <Field label="Color">
                        <Color value={color} onChange={setColor} />
                      </Field>
                    )}
                    {bgMode === 'gradient' && (
                      <>
                        <Field label="From">
                          <Color value={color} onChange={setColor} />
                        </Field>
                        <Field label="To">
                          <Color value={color2} onChange={setColor2} />
                        </Field>
                        <Field label="Angle">
                          <Range value={angle} onChange={setAngle} min={0} max={360} />
                        </Field>
                      </>
                    )}
                    {bgMode === 'pattern' && (
                      <>
                        <Field label="Base Color">
                          <Color value={color} onChange={setColor} />
                        </Field>
                        <Field label="Pattern Opacity">
                          <Range
                            value={Math.round(patternOpacity * 100)}
                            onChange={(v) => setPatternOpacity(v / 100)}
                            min={0}
                            max={100}
                          />
                        </Field>
                      </>
                    )}
                    <Field label="Corner Radius">
                      <Range value={radius} onChange={setRadius} min={0} max={40} />
                    </Field>
                    <Field label="Padding">
                      <Range value={padding} onChange={setPadding} min={0} max={60} />
                    </Field>
                    <Field label="Shadow">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={shadow}
                          onChange={(e) => setShadow(e.target.checked)}
                        />
                        <span className="text-xs">Enable</span>
                      </div>
                    </Field>
                  </div>

                  <button
                    onClick={runRemoveBg}
                    disabled={busy || !rbFile}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-white text-zinc-900 px-3 py-2 text-sm font-semibold disabled:opacity-50"
                  >
                    <ScissorsIcon className="w-4 h-4" /> Remove Background
                  </button>
                </div>
              )}
            </aside>
          </div>

          {/* History */}
          <div className="rounded-3xl border border-white/10 bg-white/[.06] shadow-xl p-4 md:p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">History</div>
              {history.length > 0 && (
                <button
                  onClick={() => setHistory([])}
                  className="text-xs px-2 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10"
                >
                  Clear
                </button>
              )}
            </div>
            {history.length === 0 ? (
              <div className="text-xs text-zinc-300/80 px-1 py-4">— No renders yet —</div>
            ) : (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {history.map((h, i) => {
                  const thumb = h.outputs?.[0];
                  const tag =
                    h.tool === 'tryon'
                      ? `Try-On (${Math.max((h.inputs?.length || 1) - 1, 0)} items)`
                      : h.tool === 'swap'
                      ? 'Model Swap'
                      : h.tool === 'removeBg'
                      ? 'Remove BG'
                      : 'Enhance';
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setResultUrls(h.outputs);
                        setSelectedOutput(h.outputs?.[0] || '');
                      }}
                      className="group rounded-xl overflow-hidden border border-white/10 bg-white/5 hover:bg-white/10 text-left"
                      title={tag}
                    >
                      <div className="relative aspect-[4/3]">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={tag}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 grid place-items-center text-[11px] text-zinc-300/80">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <div className="text-[11px] font-medium">{tag}</div>
                        <div className="text-[10px] text-zinc-400">
                          {new Date(h.ts).toLocaleTimeString()}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
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
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowEnhance(false)} />
            <div className="relative w-full max-w-3xl mx-3">
              <EnhanceCustomizer
                initial={pendingPreset || undefined}
                onComplete={(form) => {
                  setShowEnhance(false);
                  setPendingPreset(null);
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
   Reusable UI widgets
------------------------------------------------------- */
function DropSimple({ label, file, local, onPick }) {
  const inputRef = useRef(null);
  return (
    <div
      onClick={() => inputRef.current?.click()}
      className="min-h-[220px] grid place-items-center rounded-2xl border-2 border-dashed border-white/20 bg-white/5 hover:bg-white/10 transition cursor-pointer"
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
      {!local ? (
        <div className="text-center text-zinc-300 text-sm">
          <div className="mx-auto mb-3 grid place-items-center size-11 rounded-full bg-white/10 border border-white/15">
            ⬆
          </div>
          {label}: Click to choose
        </div>
      ) : (
        <img
          src={local}
          alt={label}
          className="max-w-full max-h-[45vh] object-contain rounded-xl"
        />
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
          <button
            onClick={() => setMode('upload')}
            className={[
              'px-2 py-1 text-[11px] focus:outline-none focus:ring-2 focus:ring-violet-400/70',
              mode === 'upload' ? 'bg-white text-zinc-900' : 'text-zinc-200 hover:bg-white/10',
            ].join(' ')}
          >
            Upload
          </button>
          <button
            onClick={() => setMode('url')}
            className={[
              'px-2 py-1 text-[11px] focus:outline-none focus:ring-2 focus:ring-violet-400/70',
              mode === 'url' ? 'bg-white text-zinc-900' : 'text-zinc-200 hover:bg-white/10',
            ].join(' ')}
          >
            URL
          </button>
        </div>
      </div>

      {mode === 'upload' ? (
        <div
          onClick={() => inputRef.current?.click()}
          className="min-h-[160px] grid place-items-center rounded-xl border-2 border-dashed border-white/20 bg-white/5 hover:bg-white/10 transition cursor-pointer"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setFile(f);
            }}
          />
          {!file ? (
            <div className="text-center text-zinc-300 text-xs">
              <div className="mx-auto mb-2 grid place-items-center size-10 rounded-full bg-white/10 border border-white/15">
                ⬆
              </div>
              Drag & drop / Click
              {hint && <div className="mt-1 text-[10px] text-zinc-400">{hint}</div>}
            </div>
          ) : (
            <img
              src={URL.createObjectURL(file)}
              alt={label}
              className="max-w-full max-h-[32vh] object-contain rounded-lg"
            />
          )}
        </div>
      ) : (
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://public-image.jpg"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/70"
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
      className="group relative rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 bg-white/5 shadow transition text-left hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-violet-400/70"
    >
      <div className="relative w-full aspect-[4/3] bg-white/5">
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/10 via-white/5 to-white/10" />
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
          <span className="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full bg-black/50 text-white backdrop-blur shadow">
            {tag}
          </span>
        )}
        <div className="absolute top-2 right-2 rounded-full bg-white/90 backdrop-blur px-2 py-1 text-[11px] border border-white shadow-sm text-zinc-900">
          Use preset
        </div>
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
    <button
      onClick={onSelect}
      className={[
        'group relative rounded-2xl overflow-hidden border bg-white/5 shadow transition focus:outline-none focus:ring-2 focus:ring-violet-400/70',
        active
          ? 'border-violet-400/50 ring-2 ring-violet-400/30'
          : 'border-white/10 hover:border-white/20 hover:shadow-2xl',
      ].join(' ')}
      title={model.name}
    >
      <div className="relative w-full aspect-[4/5] bg-white/5">
        <img
          src={model.url}
          alt={model.name}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-2 left-2 rounded-full bg-white/90 backdrop-blur px-2 py-1 text-[11px] border border-white shadow-sm text-zinc-900">
          {active ? 'Selected' : 'Use model'}
        </div>
      </div>
      <div className="p-3">
        <div className="font-semibold truncate">{model.name}</div>
        <div className="text-[11px] text-zinc-300/90">Pose: {model.pose}</div>
      </div>
    </button>
  );
}

function TryOnStepper({ step }) {
  const steps = [
    { id: 'items', label: 'Items' },
    { id: 'model', label: 'Model' },
    { id: 'run', label: 'Run' },
  ];
  const idx = steps.findIndex((s) => s.id === step);
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
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'bg-white/10 text-white border-white/20',
                  ].join(' ')}
                >
                  {done ? '✓' : i + 1}
                </motion.div>
                <div
                  className={[
                    'text-xs sm:text-[13px]',
                    done
                      ? 'text-emerald-300'
                      : active
                      ? 'text-violet-300'
                      : 'text-zinc-300/90',
                  ].join(' ')}
                >
                  {s.label}
                </div>
              </div>
              {i < steps.length - 1 && (
                <motion.div
                  layout
                  className="h-1 mt-2 rounded-full bg-white/10 overflow-hidden"
                >
                  <motion.div
                    initial={false}
                    animate={{ width: i < idx ? '100%' : '0%' }}
                    transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                    className="h-full bg-violet-400"
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
    idle: { label: 'Ready', color: 'bg-white/10 text-white border-white/20' },
    processing: {
      label: 'Processing',
      color: 'bg-amber-200/20 text-amber-200 border-amber-200/30',
    },
    ready: {
      label: 'Done',
      color: 'bg-emerald-300/20 text-emerald-200 border-emerald-300/30',
    },
    error: { label: 'Error', color: 'bg-rose-300/20 text-rose-200 border-rose-300/30' },
  };
  const it = map[phase] || map.idle;
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${it.color}`}
    >
      <span
        className={`inline-block size-2 rounded-full ${
          phase === 'processing' ? 'bg-white animate-pulse' : 'bg-white'
        }`}
      />
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
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
      <input
        className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1"
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
        className="w-full accent-violet-500"
      />
      <span className="w-10 text-right">{typeof value === 'number' ? value : ''}</span>
    </div>
  );
}

/* ---- Try-On item card ---- */
function TryItemCard({ index, item, onMode, onFile, onUrl, onType, onRemove }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-zinc-300">Item {index + 1}</div>
        <button
          onClick={onRemove}
          className="text-[11px] px-2 py-1 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-violet-400/70"
        >
          Remove
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_220px]">
        <InputSlot
          label="Image"
          mode={item.mode}
          setMode={onMode}
          file={item.file}
          setFile={onFile}
          url={item.url}
          setUrl={onUrl}
          hint="Transparent PNG recommended"
        />
        <div className="grid gap-2 content-start">
          <label className="text-[11px] text-zinc-300/90">Type</label>
          <select
            value={item.type}
            onChange={(e) => onType(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/70"
          >
            <option value="upper">Upper</option>
            <option value="lower">Lower</option>
            <option value="dress">Dress</option>
            <option value="hat">Hat</option>
            <option value="accessory">Accessory</option>
          </select>
          <div className="text-[11px] text-zinc-400">
            All items are layered automatically; you can add up to {MAX_ITEMS}.
          </div>
        </div>
      </div>
    </div>
  );
}

function EnhanceCustomizer({ initial, onComplete }) {
  return (
    <div className="rounded-2xl bg-white p-4 sm:p-5 shadow-2xl border space-y-3 text-zinc-900">
      <div className="text-sm font-semibold">Enhance Settings</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <label className="space-y-1">
          <span className="text-zinc-600">Style</span>
          <input
            defaultValue={initial?.photographyStyle || ''}
            className="w-full rounded-lg border px-2 py-1"
            placeholder="studio product photography, 50mm"
            id="enh-style"
          />
        </label>
        <label className="space-y-1">
          <span className="text-zinc-600">Background</span>
          <input
            defaultValue={initial?.background || ''}
            className="w-full rounded-lg border px-2 py-1"
            placeholder="white seamless"
            id="enh-bg"
          />
        </label>
        <label className="space-y-1">
          <span className="text-zinc-600">Lighting</span>
          <input
            defaultValue={initial?.lighting || ''}
            className="w-full rounded-lg border px-2 py-1"
            placeholder="softbox, gentle reflections"
            id="enh-light"
          />
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
      <path
        d="M7 7h9l-2-2 1.4-1.4L20.8 7l-5.4 3.4L14 9l2-2H7V7zm10 10H8l2 2-1.4 1.4L3.2 17l5.4-3.4L10 15l-2 2h9v0z"
        fill="currentColor"
      />
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
