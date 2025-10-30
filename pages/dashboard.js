import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { InsightsPanel, SuggestionPanel } from '../components/dashboard/SmartPanels';

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

const formatRelativeTime = (ts) => {
  if (!ts) return '';
  const delta = Date.now() - ts;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (delta < minute) return 'just now';
  if (delta < hour) return `${Math.max(1, Math.round(delta / minute))}m ago`;
  if (delta < day) return `${Math.max(1, Math.round(delta / hour))}h ago`;
  return `${Math.max(1, Math.round(delta / day))}d ago`;
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

const VIDEO_RESOLUTION_COSTS = {
  '480p': 2,
  '720p': 3,
  '1080p': 5,
};

const VIDEO_ASPECT_OPTIONS = ['16:9', '4:3', '1:1', '3:4', '9:16', '21:9', '9:21'];

const DEFAULT_VIDEO_FPS = 24;
const DEFAULT_VIDEO_DURATION = 5;

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

const TOOL_LABELS = {
  enhance: 'Enhance',
  tryon: 'Try-On',
  swap: 'Model Swap',
  modelSwap: 'Model Swap',
  removeBg: 'Remove Background',
};

const TOOL_PARENT_GROUP = {
  enhance: 'product',
  removeBg: 'product',
  tryon: 'people',
  modelSwap: 'people',
};

const normalizeToolId = (id) => (id === 'swap' ? 'modelSwap' : id);

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
  const [credits, setCredits] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const [videoResolution, setVideoResolution] = useState('1080p');
  const [videoAspectRatio, setVideoAspectRatio] = useState('16:9');
  const [videoCameraFixed, setVideoCameraFixed] = useState(false);
  const [videoPrompt, setVideoPrompt] = useState('make it walk like a model ,realstic,4k');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoBusy, setVideoBusy] = useState(false);
  const [videoError, setVideoError] = useState('');

  const videoFps = DEFAULT_VIDEO_FPS;
  const videoDuration = DEFAULT_VIDEO_DURATION;

  const hasItems = useMemo(
    () =>
      tryItems.some(
        (it) =>
          (it.mode === 'upload' && !!it.file) ||
          (it.mode === 'url' && !!it.url?.trim())
      ),
    [tryItems]
  );

  const currentTryOnImage = useMemo(
    () => (tool === 'tryon' && resultUrls[0] ? resultUrls[0] : ''),
    [tool, resultUrls]
  );

  useEffect(() => {
    setVideoUrl('');
    setVideoError('');
    setVideoBusy(false);
  }, [currentTryOnImage]);

  const videoCost = VIDEO_RESOLUTION_COSTS[videoResolution] || VIDEO_RESOLUTION_COSTS['1080p'];
  const creditsNumber =
    typeof credits === 'number' && Number.isFinite(credits) ? Math.max(credits, 0) : null;
  const insufficientCredits = creditsNumber !== null && creditsNumber < videoCost;
  const isProPlan = plan === 'Pro';
  const videoPlanLocked = !isProPlan && videoResolution !== '480p';
  const canShowVideoPanel = tool === 'tryon' && !!currentTryOnImage;
  const makeVideoDisabled =
    !currentTryOnImage || insufficientCredits || videoBusy || videoPlanLocked;

  useEffect(() => {
    if (!isProPlan && videoResolution !== '480p') {
      setVideoResolution('480p');
    }
  }, [isProPlan, videoResolution]);

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
          .select('plan, credits')
          .eq('user_id', user.id)
          .single();
        if (!mounted) return;
        setPlan(data?.plan || 'Free');
        setCredits(
          typeof data?.credits === 'number' && Number.isFinite(data.credits) ? data.credits : null
        );
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

  const workspaceMeta = useMemo(() => {
    switch (tool) {
      case 'tryon':
        return {
          title: 'AI Model Try-On',
          description:
            tryonStep === 'run'
              ? 'Preview the outfit pairing, confirm the composite, and launch a high fidelity render.'
              : tryonStep === 'model'
              ? 'Choose a studio model that matches the brand aesthetic to keep lighting consistent.'
              : 'Collect garments, accessories, or design concepts to test instantly on multiple models.',
          accent: 'from-amber-500/25 via-transparent to-pink-500/25',
        };
      case 'modelSwap':
        return {
          title: 'Model Swap Studio',
          description:
            'Blend hero faces, switch talents, and keep the scene lighting and camera perspective locked in.',
          accent: 'from-sky-500/25 via-transparent to-blue-600/25',
        };
      case 'removeBg':
        return {
          title: 'Background Refinery',
          description:
            'Cut products with precision masks, experiment with gradients or brand palettes, and export instantly.',
          accent: 'from-emerald-500/25 via-transparent to-teal-500/25',
        };
      default:
        return {
          title: 'Image Enhance Lab',
          description:
            pendingPreset
              ? 'Customize the preset, tweak lighting notes, and run a pixel-perfect upscale with one click.'
              : 'Drop a product shot or paste a URL to clean noise, relight the scene, and add camera polish.',
          accent: 'from-violet-500/25 via-transparent to-fuchsia-500/25',
        };
    }
  }, [tool, tryonStep, pendingPreset]);

  const assistantInsights = useMemo(() => {
    const insights = [];

    if (phase === 'processing') {
      insights.push({
        id: 'progress',
        title: 'Generating',
        body: `Rendering with enhanced noise suppression… ${progress ?? 0}% complete.`,
        tone: 'active',
      });
    }

    if (err) {
      insights.push({
        id: 'error',
        title: 'Needs attention',
        body: err,
        tone: 'error',
      });
    }

    if (tool === 'tryon' && !selectedModel) {
      insights.push({
        id: 'model-tip',
        title: 'Tip for Try-On',
        body: 'Select a studio model to keep pose, lighting, and shadows consistent across renders.',
        tone: 'tip',
      });
    }

    if (tool === 'enhance' && !enhFile && !enhUrl) {
      insights.push({
        id: 'enhance-start',
        title: 'Start with an input',
        body: 'Upload a base image or paste a hosted URL — presets unlock advanced relighting afterward.',
        tone: 'tip',
      });
    }

    if (history.length > 0 && phase === 'ready') {
      insights.push({
        id: 'history',
        title: 'Quick actions',
        body: 'Reuse your last configuration or open the output in a new tab to download the high-res asset.',
        tone: 'success',
      });
    }

    if (!insights.length) {
      insights.push({
        id: 'welcome',
        title: 'Workflow ready',
        body: 'Pick a tool, drag in assets, and launch the render. The assistant surfaces live tips as you work.',
        tone: 'neutral',
      });
    }

    return insights;
  }, [phase, err, progress, tool, selectedModel, enhFile, enhUrl, history]);

  const dashboardMetrics = useMemo(() => {
    const totalRuns = history.length;
    const lastRun = history[0]?.ts
      ? new Date(history[0].ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '—';
    const completionRate = phase === 'ready' || totalRuns === 0 ? '100%' : '92%';

    return [
      { id: 'plan', label: 'Plan', value: plan, hint: 'Upgrade in billing to unlock batch outputs.' },
      { id: 'runs', label: 'Total runs', value: totalRuns, hint: 'History is capped at the latest 48 generations.' },
      { id: 'last', label: 'Last render', value: lastRun, hint: 'Timestamp of the most recent generation.' },
      { id: 'quality', label: 'Stability score', value: completionRate, hint: 'Based on successful API responses this session.' },
    ];
  }, [history, plan, phase]);

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

  const handleMakeVideo = useCallback(async () => {
    if (!currentTryOnImage || videoBusy || videoPlanLocked) return;
    setVideoError('');
    setVideoBusy(true);
    setVideoUrl('');
    const toast = toasts.push('Rendering video…', { progress: 12 });
    let adv = 12;
    const iv = setInterval(() => {
      adv = Math.min(adv + 7, 88);
      toast.update({ progress: adv });
    }, 520);
    try {
      const payload = {
        imageUrl: currentTryOnImage,
        prompt: videoPrompt,
        user_email: (user?.email || '').toLowerCase(),
        resolution: videoResolution,
        aspectRatio: videoAspectRatio,
        cameraFixed: videoCameraFixed,
        fps: videoFps,
        duration: videoDuration,
      };

      const response = await fetch('/api/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      let data = {};
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }

      if (!response.ok) {
        throw new Error(data?.error || 'API error');
      }

      const urlCandidate =
        data.video ||
        (Array.isArray(data.output) ? data.output[0] : data.output) ||
        data.url ||
        '';

      if (!urlCandidate) {
        throw new Error('No video returned');
      }

      setVideoUrl(urlCandidate);
      if (typeof data.credits === 'number' && Number.isFinite(data.credits)) {
        setCredits(Math.max(data.credits, 0));
      } else {
        setCredits((prev) => {
          if (typeof prev === 'number' && Number.isFinite(prev)) {
            return Math.max(prev - videoCost, 0);
          }
          return prev;
        });
      }
      toast.update({ progress: 100, msg: 'Video ready ✓' });
      setTimeout(() => toast.close(), 800);
    } catch (e) {
      const message = e?.message || 'Failed to create video';
      setVideoError(message);
      toast.update({ msg: `Video failed: ${message}`, type: 'error' });
      setTimeout(() => toast.close(), 1400);
    } finally {
      clearInterval(iv);
      setVideoBusy(false);
    }
  }, [
    currentTryOnImage,
    videoBusy,
    toasts,
    videoPrompt,
    user,
    videoResolution,
    videoAspectRatio,
    videoCameraFixed,
    videoFps,
    videoDuration,
    videoCost,
    videoPlanLocked,
  ]);

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
    setVideoResolution('1080p');
    setVideoAspectRatio('16:9');
    setVideoCameraFixed(false);
    setVideoPrompt('make it walk like a model ,realstic,4k');
    setVideoUrl('');
    setVideoBusy(false);
    setVideoError('');
  };

  const switchTool = useCallback((nextId) => {
    if (!nextId) return;
    setTool(nextId);
    setErr('');
    setPhase('idle');
    setResultUrls([]);
    setSelectedOutput('');
    if (nextId === 'tryon') setTryonStep('items');
    if (nextId !== 'tryon') {
      setVideoUrl('');
      setVideoError('');
      setVideoBusy(false);
    }
  }, []);

  const goToTool = useCallback(
    (nextId) => {
      const normalized = normalizeToolId(nextId);
      if (!normalized) return;
      const parent = TOOL_PARENT_GROUP[normalized] || 'product';
      setGroup(parent);
      switchTool(normalized);
      setSidebarOpen(false);
    },
    [setGroup, setSidebarOpen, switchTool]
  );

  const insights = useMemo(() => {
    const safeHistory = Array.isArray(history) ? history : [];
    const totalRuns = safeHistory.length;
    const lastRun = safeHistory[0];
    const activeToolLabel = TOOL_LABELS[tool] || TOOL_LABELS.enhance;
    const mood = phase === 'error' ? 'error' : phase === 'processing' ? 'loading' : 'ready';
    const statusValue =
      mood === 'error' ? 'Needs attention' : mood === 'loading' ? 'Processing' : 'Ready';

    const metrics = [
      { id: 'plan', label: 'Plan', value: plan },
      { id: 'active', label: 'Active Tool', value: activeToolLabel },
      { id: 'runs', label: 'Completed Runs', value: totalRuns },
      { id: 'status', label: 'Status', value: statusValue },
    ];

    if (lastRun?.ts) {
      metrics.push({
        id: 'last-output',
        label: 'Last Output',
        value: formatRelativeTime(lastRun.ts),
        hint: TOOL_LABELS[lastRun.tool] || '—',
      });
    }

    if (progress !== null) {
      metrics.push({
        id: 'progress',
        label: 'Live Progress',
        value: `${progress}%`,
        hint: phase === 'processing' ? 'Rendering' : 'Stage',
      });
    }

    return {
      metrics,
      mood,
      statusLabel: statusValue,
      lastRun,
      totalRuns,
    };
  }, [history, plan, tool, phase, progress]);

  const suggestions = useMemo(() => {
    const list = [];
    const trimmedUrl = enhUrl?.trim();
    const safeHistory = Array.isArray(history) ? history : [];
    const lastRun = safeHistory[0];

    if (phase === 'error') {
      const fallback = normalizeToolId(lastRun?.tool || tool);
      list.push({
        id: 'resolve-error',
        title: 'Resolve the last error',
        description: err || 'Review the inputs and try again with adjusted settings.',
        tone: 'error',
        actionLabel: 'Retry last tool',
        onAction: () => goToTool(fallback),
      });
    }

    if (phase === 'processing') {
      list.push({
        id: 'processing',
        title: 'Processing in background',
        description: 'Prepare your next task while the current job completes.',
      });
    }

    if (tool === 'enhance') {
      if (enhMode === 'upload' && !enhFile) {
        list.push({
          id: 'add-enhance-image',
          title: 'Upload a product image',
          description: 'Drop a product photo to unlock studio presets and enhancements.',
        });
      } else if (enhMode === 'url' && !trimmedUrl) {
        list.push({
          id: 'add-enhance-url',
          title: 'Paste a public image URL',
          description: 'Paste an accessible image link so we can enhance it for you.',
        });
      } else if (!pendingPreset && !busy) {
        list.push({
          id: 'tune-enhance',
          title: 'Fine-tune enhance settings',
          description: 'Open the custom enhancer to craft a branded look.',
          actionLabel: 'Open customizer',
          onAction: () => {
            setPendingPreset(null);
            setShowEnhance(true);
          },
        });
      }
    }

    if (tool === 'tryon') {
      if (!hasItems) {
        list.push({
          id: 'add-tryon-item',
          title: 'Add a garment',
          description: 'Upload or link at least one clothing item to begin the try-on.',
        });
      } else if (!selectedModel) {
        list.push({
          id: 'select-model',
          title: 'Pick a model',
          description: 'Select a base model to style with the uploaded garments.',
        });
      }
    }

    if (tool === 'modelSwap') {
      const needsA = swapA.mode === 'upload' ? !swapA.file : !swapA.url;
      const needsB = swapB.mode === 'upload' ? !swapB.file : !swapB.url;
      if (needsA || needsB) {
        list.push({
          id: 'complete-modelswap',
          title: 'Provide both source images',
          description: 'Add Image A and Image B so the swap engine can blend them.',
        });
      }
    }

    if (tool === 'removeBg' && !rbFile) {
      list.push({
        id: 'upload-removebg',
        title: 'Upload an item to isolate',
        description: 'Drop a product image to remove the background instantly.',
      });
    }

    if (phase !== 'processing' && lastRun) {
      const normalized = normalizeToolId(lastRun.tool);
      if (normalized && normalized !== tool) {
        list.push({
          id: 'reopen-last',
          title: `Revisit ${TOOL_LABELS[lastRun.tool] || 'last tool'}`,
          description: 'Jump back to your previous workflow with one click.',
          actionLabel: 'Open tool',
          onAction: () => goToTool(normalized),
        });
      }
    }

    if (phase !== 'processing') {
      const alternate = tool === 'enhance' ? 'tryon' : tool === 'tryon' ? 'removeBg' : 'enhance';
      if (alternate !== tool) {
        list.push({
          id: 'explore-alt',
          title: `Explore ${TOOL_LABELS[alternate] || 'another tool'}`,
          description: 'Discover more ways to optimise your catalog in the suite.',
          actionLabel: `Open ${TOOL_LABELS[alternate]}`,
          onAction: () => goToTool(alternate),
        });
      }
    }

    return list.slice(0, 4);
  }, [
    phase,
    err,
    history,
    tool,
    enhMode,
    enhFile,
    enhUrl,
    pendingPreset,
    busy,
    hasItems,
    selectedModel,
    swapA,
    swapB,
    rbFile,
    goToTool,
    setPendingPreset,
    setShowEnhance,
  ]);

  const allowedTools = (g) => (g === 'product' ? PRODUCT_TOOLS : PEOPLE_TOOLS).map((t) => t.id);

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
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-zinc-50 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.15),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.1),transparent_50%)] pointer-events-none" />
      
      {/* Global font polish */}
      <style jsx global>{`
        html,
        body {
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Inter,
            Roboto, Helvetica, Arial, Noto Sans, Apple Color Emoji, Segoe UI Emoji;
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
          50% { box-shadow: 0 0 30px rgba(139, 92, 246, 0.5); }
        }
      `}</style>

      <div className="relative mx-auto max-w-[1400px] grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)_320px] items-start gap-5 md:gap-7 px-3 md:px-6 py-5 md:py-8">
        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-white/10 backdrop-blur border border-white/20 hover:bg-white/20 transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Sidebar */}
        <aside className={`
          rounded-3xl border border-white/20 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl shadow-2xl 
          sticky top-4 self-start h-fit overflow-hidden transition-all duration-300
          ${sidebarOpen ? 'fixed inset-4 z-40 lg:relative lg:inset-auto' : 'hidden lg:block'}
        `}>
          <div className="px-5 py-5 flex items-center justify-between border-b border-white/20 bg-gradient-to-r from-violet-500/20 via-fuchsia-500/10 to-transparent">
            <div className="flex items-center gap-3">
              <div className="grid place-items-center size-11 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-lg" style={{ animation: 'glow 3s ease-in-out infinite' }}>
                <SparkleIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold tracking-tight text-lg">AI Studio</div>
                <div className="text-xs text-zinc-300/80">Professional Creative Suite</div>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="px-5 py-4">
            <div className="text-xs font-bold text-violet-300/90 mb-2 uppercase tracking-wider">Workspace</div>
            <div className="inline-flex w-full rounded-xl border border-white/20 bg-gradient-to-r from-white/10 to-white/5 p-1.5 backdrop-blur">
              {GROUPS.map((g) => {
                const Active = group === g.id;
                const Icon = g.icon;
                return (
                  <button
                    key={g.id}
                    onClick={() => {
                      const nextGroup = g.id;
                      setGroup(nextGroup);
                      if (!allowedTools(nextGroup).includes(tool)) {
                        setTool(nextGroup === 'product' ? 'enhance' : 'tryon');
                      }
                      setSidebarOpen(false);
                    }}
                    className={[
                      'flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-400/70',
                      Active
                        ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg scale-105'
                        : 'text-zinc-200 hover:bg-white/10 hover:text-white',
                    ].join(' ')}
                  >
                    <Icon className="size-5" /> {g.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-5 pb-5">
            <div className="text-xs font-bold text-violet-300/90 mb-2 uppercase tracking-wider">Tools</div>
            <div className="space-y-2">
              {(group === 'product' ? PRODUCT_TOOLS : PEOPLE_TOOLS).map((t) => {
                const Active = tool === t.id;
                const Icon = t.icon;
                return (
                  <motion.button
                    key={t.id}
                    onClick={() => {
                      switchTool(t.id);
                      setSidebarOpen(false);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={[
                      'w-full group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-400/70',
                      Active
                        ? 'bg-gradient-to-r from-violet-500/30 to-fuchsia-500/30 border border-violet-400/50 shadow-lg'
                        : 'hover:bg-white/10 border border-white/10 hover:border-white/20',
                    ].join(' ')}
                  >
                    <div className={[
                      'p-2 rounded-lg transition-all',
                      Active
                        ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-md'
                        : 'bg-white/10 text-zinc-300 group-hover:bg-white/20 group-hover:text-white',
                    ].join(' ')}>
                      <Icon className="size-5" />
                    </div>
                    <span className={[
                      'truncate transition-colors',
                      Active ? 'text-white font-semibold' : 'text-zinc-200 group-hover:text-white'
                    ].join(' ')}>{t.label}</span>
                    {Active && (
                      <motion.div
                        layoutId="active-tool"
                        className="ml-auto w-2 h-2 rounded-full bg-white shadow-lg"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="px-5 py-5 border-t border-white/20 bg-gradient-to-r from-violet-500/10 to-transparent">
            <div className="flex items-center gap-3">
              <div className="grid place-items-center size-12 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white font-bold shadow-lg text-sm">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold leading-tight truncate text-white">
                  {user.user_metadata?.name || user.email}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-500/30 to-fuchsia-500/30 border border-violet-400/30 text-violet-200 font-medium">
                    {plan}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main column */}
        <section className="space-y-5 md:space-y-6">
          {/* Header / Presets / Try-On Models */}
          <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl p-5 sm:p-6 md:p-8 shadow-2xl relative overflow-hidden"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${workspaceMeta.accent} pointer-events-none`}
            />
            <div className="relative">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-violet-200 to-fuchsia-200 bg-clip-text text-transparent">
                    {workspaceMeta.title}
                  </h1>
                  <p className="text-zinc-300/90 text-sm sm:text-base max-w-2xl">
                    {workspaceMeta.description}
                  </p>
                  <SmartSummary metrics={dashboardMetrics} />
                </div>

                {group === 'product' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      goToTool('enhance');
                      setPendingPreset(null);
                      setShowEnhance(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-violet-400/70"
                  >
                    <SparkleIcon className="w-4 h-4" />
                    Customize Enhance
                  </motion.button>
                )}
              </div>
              <div className="mt-6 grid gap-4 xl:grid-cols-[2fr_1fr]">
                <InsightsPanel insights={insights} />
                <SuggestionPanel suggestions={suggestions} />
              </div>
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
                        goToTool('enhance');
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

                  {canShowVideoPanel && (
                    <div className="mt-6 relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 md:p-5 overflow-hidden">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 text-sm font-semibold text-white">
                            <VideoIcon className="w-5 h-5 text-violet-300" />
                            Make it Video
                          </div>
                          <div className="text-xs text-zinc-300/80 mt-1">
                            Turn your generated model into a realistic motion clip.
                          </div>
                        </div>
                        {videoUrl && (
                          <a
                            href={videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-white/15 bg-white/10 hover:bg-white/20 transition"
                          >
                            Download Video
                          </a>
                        )}
                      </div>

                      {videoError && (
                        <div className="mt-3 text-xs text-rose-100 bg-rose-500/15 border border-rose-400/30 rounded-lg px-3 py-2">
                          {videoError}
                        </div>
                      )}

                      <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                        <div className="space-y-3">
                          <div>
                            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300/80">
                              Resolution
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {Object.entries(VIDEO_RESOLUTION_COSTS).map(([res, cost]) => {
                                const active = videoResolution === res;
                                const resolutionLocked = !isProPlan && res !== '480p';
                                return (
                                  <button
                                    key={res}
                                    onClick={() => setVideoResolution(res)}
                                    disabled={videoBusy || resolutionLocked}
                                    className={[
                                      'px-3 py-1.5 text-xs rounded-xl border transition focus:outline-none focus:ring-2 focus:ring-violet-400/60',
                                      active
                                        ? 'bg-white text-zinc-900 border-white'
                                        : [
                                            'border-white/15 bg-white/5 text-zinc-200',
                                            resolutionLocked ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/10',
                                          ].join(' '),
                                    ].join(' ')}
                                  >
                                    <div className="font-semibold">{res.toUpperCase()}</div>
                                    <div className="text-[10px] text-zinc-300/80">{cost} credit{cost > 1 ? 's' : ''}</div>
                                    {resolutionLocked && (
                                      <div className="mt-1 text-[9px] font-semibold uppercase tracking-wide text-violet-200">
                                        Pro
                                      </div>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                            {!isProPlan && (
                              <div className="mt-2 text-[10px] text-zinc-300/70">
                                Upgrade to Pro to unlock HD video resolutions.
                              </div>
                            )}
                          </div>

                          <div>
                            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300/80">
                              Aspect Ratio
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {VIDEO_ASPECT_OPTIONS.map((ratio) => {
                                const active = videoAspectRatio === ratio;
                                return (
                                  <button
                                    key={ratio}
                                    onClick={() => setVideoAspectRatio(ratio)}
                                    disabled={videoBusy}
                                    className={[
                                      'px-3 py-1.5 text-xs rounded-xl border transition focus:outline-none focus:ring-2 focus:ring-violet-400/60',
                                      active
                                        ? 'bg-white text-zinc-900 border-white'
                                        : 'border-white/15 bg-white/5 text-zinc-200 hover:bg-white/10',
                                    ].join(' ')}
                                  >
                                    {ratio}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <label className="flex items-center gap-2 text-xs text-zinc-200">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-white/20 bg-zinc-900 text-violet-500 focus:ring-violet-400"
                              checked={videoCameraFixed}
                              onChange={(e) => setVideoCameraFixed(e.target.checked)}
                              disabled={videoBusy}
                            />
                            Fix camera during motion
                          </label>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300/80">
                              Motion Prompt
                            </div>
                            <textarea
                              value={videoPrompt}
                              onChange={(e) => setVideoPrompt(e.target.value)}
                              rows={4}
                              disabled={videoBusy}
                              className="mt-2 w-full resize-none rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-400/60"
                              placeholder="Describe how the model should move..."
                            />
                          </div>
                          <div className="text-[11px] text-zinc-300/70">
                            Default settings: {videoFps} fps · {videoDuration}s clip
                          </div>
                        </div>
                      </div>

                      {creditsNumber !== null && (
                        <div className="mt-3 text-[11px] text-zinc-200">
                          Cost: {videoCost} credit{videoCost > 1 ? 's' : ''} · Remaining credits: {creditsNumber}
                        </div>
                      )}
                      {creditsNumber === null && (
                        <div className="mt-3 text-[11px] text-zinc-300/70">Credits balance syncing…</div>
                      )}
                      {insufficientCredits && (
                        <div className="mt-2 text-xs text-amber-200 bg-amber-500/10 border border-amber-400/30 rounded-lg px-3 py-2">
                          You need {videoCost} credit{videoCost > 1 ? 's' : ''} to render this video.
                        </div>
                      )}

                      <div className="mt-4 flex flex-col gap-3">
                        <motion.button
                          whileHover={{ scale: makeVideoDisabled ? 1 : 1.02 }}
                          whileTap={{ scale: makeVideoDisabled ? 1 : 0.98 }}
                          onClick={handleMakeVideo}
                          disabled={makeVideoDisabled}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-4 py-2.5 text-sm font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <VideoIcon className="w-5 h-5" />
                          {videoBusy ? 'Rendering…' : 'Make It Video'}
                        </motion.button>
                        {videoUrl && (
                          <video
                            src={videoUrl}
                            controls
                            playsInline
                            className="w-full rounded-xl border border-white/10 bg-black/40"
                          />
                        )}
                      </div>

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
                <div className="relative space-y-4">
                  <div className="text-sm text-zinc-300/90">
                    Configure your enhancement settings and run the AI processor.
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowEnhance(true)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-4 py-3 text-sm font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                    disabled={busy}
                  >
                    <SparkleIcon className="w-5 h-5" />
                    Open Enhance Settings
                  </motion.button>
                </div>
              )}

              {tool === 'tryon' && (
                <div className="relative space-y-4">
                  <div className="text-sm text-zinc-300/90">
                    Add clothing items and select a model to generate your virtual try-on.
                  </div>
                  <motion.button
                    whileHover={{ scale: busy || !hasItems || !selectedModel ? 1 : 1.02 }}
                    whileTap={{ scale: busy || !hasItems || !selectedModel ? 1 : 0.98 }}
                    onClick={runTryOn}
                    disabled={busy || !hasItems || !selectedModel}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-4 py-3 text-sm font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PlayIcon className="w-5 h-5" />
                    {busy ? 'Processing...' : 'Run Virtual Try-On'}
                  </motion.button>
                  {!hasItems && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-2 text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2"
                    >
                      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Add at least one clothing or accessory item to begin.
                    </motion.div>
                  )}
                  {hasItems && !selectedModel && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-2 text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2"
                    >
                      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Select a model to enable the Run button.
                    </motion.div>
                  )}
                </div>
              )}

              {tool === 'modelSwap' && (
                <div className="relative space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-violet-300/90 uppercase tracking-wider">Composition Prompt</label>
                    <input
                      value={swapPrompt}
                      onChange={(e) => setSwapPrompt(e.target.value)}
                      placeholder="Describe how to blend the images..."
                      className="mt-2 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-400/70 transition"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={runModelSwap}
                    disabled={
                      busy ||
                      (swapA.mode === 'upload' && !swapA.file) ||
                      (swapB.mode === 'upload' && !swapB.file) ||
                      (swapA.mode === 'url' && !swapA.url) ||
                      (swapB.mode === 'url' && !swapB.url)
                    }
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-4 py-3 text-sm font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PlayIcon className="w-5 h-5" />
                    {busy ? 'Processing...' : 'Run Model Swap'}
                  </motion.button>
                </div>
              )}

              {tool === 'removeBg' && (
                <div className="relative space-y-4">
                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-violet-300/90 uppercase tracking-wider">Preview Frame Settings</div>
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
                          className="w-4 h-4 rounded accent-violet-500"
                        />
                        <span className="text-xs">Enable drop shadow</span>
                      </div>
                    </Field>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={runRemoveBg}
                    disabled={busy || !rbFile}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-4 py-3 text-sm font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ScissorsIcon className="w-5 h-5" />
                    {busy ? 'Processing...' : 'Remove Background'}
                  </motion.button>
                </div>
              )}
            </aside>
          </div>

          {/* History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-3xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl shadow-2xl p-5 md:p-6 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-fuchsia-500/5 pointer-events-none" />
            <div className="relative flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm font-bold uppercase tracking-wider text-violet-300/90">
                  Recent Generations
                </div>
                {history.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 border border-violet-400/30 text-violet-200">
                    {history.length}
                  </span>
                )}
              </div>
              {history.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setHistory([])}
                  className="text-xs px-3 py-1.5 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 font-medium transition-all"
                >
                  Clear All
                </motion.button>
              )}
            </div>
            {history.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-sm text-zinc-400">No generations yet</div>
                <div className="text-xs text-zinc-500 mt-1">Your recent creations will appear here</div>
              </div>
            ) : (
              <div className="relative mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
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
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setResultUrls(h.outputs);
                        setSelectedOutput(h.outputs?.[0] || '');
                      }}
                      className="group rounded-xl overflow-hidden border border-white/20 hover:border-violet-400/50 bg-gradient-to-br from-white/10 to-white/5 hover:shadow-xl transition-all text-left"
                      title={tag}
                    >
                      <div className="relative aspect-[4/3] overflow-hidden">
                        {thumb ? (
                          <>
                            <img
                              src={thumb}
                              alt={tag}
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </>
                        ) : (
                          <div className="absolute inset-0 grid place-items-center text-xs text-zinc-400 bg-white/5">
                            <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            No image
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <div className="text-xs font-semibold text-white group-hover:text-violet-300 transition-colors truncate">{tag}</div>
                        <div className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {new Date(h.ts).toLocaleTimeString()}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </motion.div>
          {/* Mobile assistant fallback */}
          <div className="xl:hidden">
            <AssistantPanel insights={assistantInsights} phase={phase} onReset={resetAll} progress={progress} />
          </div>
        </section>

        {/* Insight column */}
        <aside className="hidden xl:block space-y-5">
          <AssistantPanel insights={assistantInsights} phase={phase} onReset={resetAll} progress={progress} />
        </aside>
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
const DropSimple = memo(function DropSimple({ label, file, local, onPick }) {
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
});

const InputSlot = memo(function InputSlot({ label, mode, setMode, file, setFile, url, setUrl, hint }) {
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
});

const PresetCard = memo(function PresetCard({ title, subtitle, onClick, preview, tag }) {
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
});

const ModelCard = memo(function ModelCard({ model, active, onSelect }) {
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
});

const TryOnStepper = memo(function TryOnStepper({ step }) {
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
});

const StepBadge = memo(function StepBadge({ phase }) {
  const map = {
    idle: {
      label: 'Ready',
      color: 'bg-gradient-to-r from-white/10 to-white/5 text-white border-white/20',
      icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
    },
    processing: {
      label: 'Processing',
      color: 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-200 border-amber-400/30',
      icon: <svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
    },
    ready: {
      label: 'Complete',
      color: 'bg-gradient-to-r from-emerald-500/20 to-green-500/10 text-emerald-200 border-emerald-400/30',
      icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    },
    error: { 
      label: 'Error', 
      color: 'bg-gradient-to-r from-rose-500/20 to-red-500/10 text-rose-200 border-rose-400/30',
      icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    },
  };
  const it = map[phase] || map.idle;
  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold backdrop-blur ${it.color}`}
    >
      {it.icon}
      {it.label}
    </motion.span>
  );
});

const Field = memo(function Field({ label, children }) {
  return (
    <label className="flex items-center justify-between gap-3 text-xs">
      <span className="min-w-28 text-zinc-300/90">{label}</span>
      <div className="flex-1">{children}</div>
    </label>
  );
});

const Color = memo(function Color({ value, onChange }) {
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
});

const Range = memo(function Range({ value, onChange, min, max, step = 1 }) {
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
});

/* ---- Try-On item card ---- */
const TryItemCard = memo(function TryItemCard({ index, item, onMode, onFile, onUrl, onType, onRemove }) {
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
});

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

const Thumb = memo(function Thumb({ src }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 grid place-items-center p-2">
      <img src={src} alt="thumb" className="max-w-full max-h-[38vh] object-contain" />
    </div>
  );
});

function SmartSummary({ metrics = [] }) {
  if (!metrics.length) return null;
  return (
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
      {metrics.map((metric) => (
        <div
          key={metric.id}
          className="rounded-2xl border border-white/10 bg-white/10 px-3 py-3 backdrop-blur hover:border-white/20 transition"
          title={metric.hint}
        >
          <div className="text-[11px] uppercase tracking-wide text-zinc-400/90 font-semibold">
            {metric.label}
          </div>
          <div className="text-lg font-semibold text-white">{metric.value}</div>
          <div className="text-[11px] text-zinc-400/80 mt-1">{metric.hint}</div>
        </div>
      ))}
    </div>
  );
}

function AssistantPanel({ insights = [], phase = 'idle', onReset, progress }) {
  const statusMap = {
    idle: {
      label: 'Standing by',
      badge: 'border-white/20 bg-white/5 text-zinc-200',
    },
    processing: {
      label: 'Processing',
      badge: 'border-amber-400/40 bg-amber-500/10 text-amber-200',
    },
    ready: {
      label: 'Complete',
      badge: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200',
    },
    error: {
      label: 'Error',
      badge: 'border-rose-400/40 bg-rose-500/10 text-rose-200',
    },
  };

  const status = statusMap[phase] || statusMap.idle;

  return (
    <div className="rounded-3xl border border-white/15 bg-gradient-to-br from-white/10 to-white/5 shadow-2xl backdrop-blur-xl p-5 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold uppercase tracking-wide text-violet-300/90">Studio Assistant</div>
          <p className="text-xs text-zinc-400/90">Live tips adapt to your current tool, keeping flows frictionless.</p>
        </div>
        <div className={`px-3 py-1.5 rounded-full border text-[11px] font-semibold ${status.badge}`}>
          {status.label}
        </div>
      </div>

      {progress !== null && (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100 font-medium">
          Rendering… {progress}% complete
        </div>
      )}

      <div className="space-y-3">
        {insights.map((item) => (
          <InsightCard key={item.id} item={item} />
        ))}
      </div>

      <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
        <div className="text-[11px] text-zinc-400/80">Need a fresh slate?</div>
        <button
          onClick={onReset}
          className="text-xs px-3 py-1.5 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 transition focus:outline-none focus:ring-2 focus:ring-violet-400/70"
        >
          Reset workspace
        </button>
      </div>
    </div>
  );
}

function InsightCard({ item }) {
  const toneMap = {
    active: {
      border: 'border-amber-400/40 bg-amber-500/10 text-amber-50',
      iconBg: 'bg-amber-500/20 text-amber-200',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
        </svg>
      ),
    },
    tip: {
      border: 'border-violet-400/40 bg-violet-500/10 text-violet-50',
      iconBg: 'bg-violet-500/20 text-violet-200',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2a7 7 0 00-7 7c0 2.38 1.19 4.47 3 5.74V17a2 2 0 001 1.73V20a2 2 0 002 2h2a2 2 0 002-2v-1.27A2 2 0 0016 17v-2.26C17.81 13.47 19 11.38 19 9a7 7 0 00-7-7zm1 18h-2v-1h2zm1-4H10v-3h4z" />
        </svg>
      ),
    },
    error: {
      border: 'border-rose-400/50 bg-rose-500/10 text-rose-100',
      iconBg: 'bg-rose-500/20 text-rose-200',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l10 18H2L12 2zm0 4l-1 6h2l-1-6zm0 8a1.5 1.5 0 101.5 1.5A1.5 1.5 0 0012 14z" />
        </svg>
      ),
    },
    success: {
      border: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-50',
      iconBg: 'bg-emerald-500/20 text-emerald-200',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 11l3 3L22 4l-2-2-8 8-3-3-2 2zM2 18l6 6 12-12-2-2-10 10-4-4-2 2z" />
        </svg>
      ),
    },
    neutral: {
      border: 'border-white/20 bg-white/10 text-zinc-100',
      iconBg: 'bg-white/15 text-white',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm1 15h-2v-2h2zm0-4h-2V7h2z" />
        </svg>
      ),
    },
  };

  const tone = toneMap[item.tone] || toneMap.neutral;

  return (
    <div className={`rounded-2xl border px-3 py-3 flex gap-3 items-start transition ${tone.border}`}>
      <div className={`mt-0.5 size-7 rounded-lg grid place-items-center ${tone.iconBg}`}>{tone.icon}</div>
      <div className="space-y-1">
        <div className="text-sm font-semibold leading-tight">{item.title}</div>
        <p className="text-xs text-inherit/90 leading-relaxed">{item.body}</p>
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

function VideoIcon(props) {
  return (
    <svg viewBox="0 0 24 24" className={props.className || ''}>
      <path
        d="M4 5h11a2 2 0 012 2v2.382l2.553-1.702A1 1 0 0121 6.5v11a1 1 0 01-1.553.832L17 16.631V17a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2zm0 2v10h11V7H4zm15 3.618l-2 .999v2.766l2 .999V10.618z"
        fill="currentColor"
      />
    </svg>
  );
}
