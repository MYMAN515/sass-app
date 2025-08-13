// /pages/dashboard.js
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';

/* ───────────────────────── helpers ───────────────────────── */
const hexToRGBA = (hex, a = 1) => {
  const c = hex.replace('#', '');
  const v = c.length === 3 ? c.replace(/(.)/g, '$1$1') : c;
  const n = parseInt(v, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = (n) & 255;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};
const fileToDataURL = (file) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

const STORAGE_BUCKET = 'img';

/* ───────────────── Presets (images live in /public) ───────────────── */
const ENHANCE_PRESETS = [
  {
    id: 'clean-studio',
    title: 'Clean Studio',
    subtitle: 'Soft light • white sweep',
    tag: 'Popular',
    config: {
      photographyStyle: 'studio product photography, 50mm prime',
      background: 'white seamless backdrop',
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
      realism: 'photo-real textures',
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

const TRYON_PRESETS = [
  {
    id: 'streetwear',
    title: 'Streetwear',
    subtitle: 'Urban • moody',
    tag: 'Model',
    config: { style: 'streetwear fit', setting: 'urban alley, textured wall', lighting: 'overcast soft', mood: 'cool, editorial' },
    preview: '/streetwear.webp'
  },
  {
    id: 'ecom-mannequin',
    title: 'E-Com Mannequin',
    subtitle: 'Plain white',
    tag: 'Catalog',
    config: { style: 'ecommerce mannequin front', setting: 'white cyclorama', lighting: 'soft studio', mood: 'catalog clean' },
    preview: '/ecom-mannequin.webp'
  },
  {
    id: 'lifestyle',
    title: 'Lifestyle',
    subtitle: 'Sunlit room',
    tag: 'Natural',
    config: { style: 'lifestyle casual', setting: 'sunlit apartment, wood floor', lighting: 'window soft', mood: 'fresh & bright' },
    preview: '/lifestyle.webp'
  },
  {
    id: 'outdoor',
    title: 'Outdoor',
    subtitle: 'Park • daylight',
    tag: 'Daylight',
    config: { style: 'outdoor casual', setting: 'green park, path & trees', lighting: 'midday diffuse', mood: 'open & vibrant' },
    preview: '/outdoor.webp'
  }
];

/* ───────────────────────── Tools ───────────────────────── */
const TOOLS = [
  { id: 'studio', label: 'Studio', icon: SparklesIcon },         // Enhance + Remove BG together
  { id: 'tryon', label: 'Try-On', icon: PersonIcon },
  { id: 'modelSwap', label: 'Model Swap', icon: CubeIcon }
];

export default function Dashboard() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const router = useRouter();

  /* ───────── state ───────── */
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState('Free');
  const [credits, setCredits] = useState(0);
  const [err, setErr] = useState('');

  const [active, setActive] = useState('studio');
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState('idle'); // idle|processing|ready|error

  // file/results
  const [file, setFile] = useState(null);
  const [localUrl, setLocalUrl] = useState('');
  const [imageData, setImageData] = useState(''); // for remove-bg
  const [resultUrl, setResultUrl] = useState('');

  // Studio toggles
  const [applyEnhance, setApplyEnhance] = useState(true);
  const [applyRemoveBg, setApplyRemoveBg] = useState(true);
  const [pendingEnhancePreset, setPendingEnhancePreset] = useState(null);

  // Try-On
  const [pendingTryOnPreset, setPendingTryOnPreset] = useState(null);

  // Model Swap (two images)
  const [swapImage1, setSwapImage1] = useState(null);
  const [swapImage2, setSwapImage2] = useState(null);
  const [swapPreview1, setSwapPreview1] = useState('');
  const [swapPreview2, setSwapPreview2] = useState('');
  const [swapPrompt, setSwapPrompt] = useState('Blend the two concepts into a coherent, photo-realistic composition.');

  // removeBg presentation controls
  const [bgMode, setBgMode] = useState('color'); // color|gradient|pattern
  const [color, setColor] = useState('#ffffff');
  const [color2, setColor2] = useState('#f1f5f9');
  const [angle, setAngle] = useState(35);
  const [radius, setRadius] = useState(18);
  const [padding, setPadding] = useState(20);
  const [shadow, setShadow] = useState(true);
  const [patternOpacity, setPatternOpacity] = useState(0.06);

  // misc
  const [history, setHistory] = useState([]);
  const [apiResponse, setApiResponse] = useState(null);
  const [respOpen, setRespOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  // compare overlay
  const [compare, setCompare] = useState(false);
  const [compareOpacity, setCompareOpacity] = useState(50);

  const dropRef = useRef(null);
  const fileInputRef = useRef(null);

  /* ───────── auth & profile ───────── */
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (user === undefined) return;
      if (!user) { router.replace('/login'); return; }

      try {
        const { data } = await supabase
          .from('Data')
          .select('plan, credits')
          .eq('user_id', user.id)
          .single();

        if (!mounted) return;
        setPlan(data?.plan || 'Free');
        setCredits(typeof data?.credits === 'number' ? data.credits : 0);
      } catch {/* ignore */}

      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [user, router, supabase]);

  // credits live refresh event
  useEffect(() => {
    const h = async () => {
      if (!user?.id) return;
      const { data } = await supabase.from('Data').select('credits').eq('user_id', user.id).single();
      if (typeof data?.credits === 'number') setCredits(data.credits);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('credits:refresh', h);
      return () => window.removeEventListener('credits:refresh', h);
    }
  }, [supabase, user]);

  /* ───────── drag & drop + paste ───────── */
  useEffect(() => {
    const el = dropRef.current; if (!el) return;
    const over  = (e) => { e.preventDefault(); el.classList.add('ring-2','ring-indigo-400'); };
    const leave = () => el.classList.remove('ring-2','ring-indigo-400');
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
  }, []);

  /* ───────── keyboard ───────── */
  const handleRun = useCallback(() => {
    if (active === 'studio') {
      if (!file) { setErr('Pick an image first'); return; }
      return runStudio();
    }
    if (active === 'tryon') {
      if (!file) { setErr('Pick an image first'); return; }
      return setShowTryOn(true);
    }
    if (active === 'modelSwap') {
      if (!swapImage1 || !swapImage2) { setErr('Pick two images for model swap'); return; }
      return runModelSwap();
    }
  }, [active, file, swapImage1, swapImage2]); // eslint-disable-line

  useEffect(() => {
    const handler = (e) => {
      if (e.target && ['INPUT','TEXTAREA','SELECT','BUTTON'].includes(e.target.tagName)) return;
      if (e.key === 'r' || e.key === 'R') { e.preventDefault(); handleRun(); }
      if (e.key >= '1' && e.key <= '3') {
        const index = Number(e.key) - 1;
        setActive(TOOLS[index]?.id || 'studio');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleRun]);

  /* ───────── reset on tool switch ───────── */
  useEffect(() => {
    setPhase('idle'); setErr(''); setApiResponse(null); setResultUrl('');
    if (active !== 'studio') { setApplyEnhance(false); setApplyRemoveBg(false); }
  }, [active]);

  const onPick = async (f) => {
    setFile(f);
    setLocalUrl(URL.createObjectURL(f));
    setResultUrl(''); setPhase('idle'); setErr(''); setApiResponse(null);
    setImageData(await fileToDataURL(f));
  };

  /* ───────── style helpers (remove-bg frame) ───────── */
  const bgStyle = useMemo(() => {
    if (bgMode === 'color') return { background: color };
    if (bgMode === 'gradient') return { background: `linear-gradient(${angle}deg, ${color}, ${color2})` };
    const svg = encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'>
        <defs><pattern id='p' width='24' height='24' patternUnits='userSpaceOnUse'>
          <path d='M0 12h24M12 0v24' stroke='${hexToRGBA('#000000', patternOpacity)}' stroke-width='1' opacity='0.2'/>
        </pattern></defs>
        <rect width='100%' height='100%' fill='${color}'/>
        <rect width='100%' height='100%' fill='url(#p)'/>
      </svg>`
    );
    return { backgroundColor: color, backgroundImage: `url("data:image/svg+xml;utf8,${svg}")`, backgroundSize: '24px 24px' };
  }, [bgMode, color, color2, angle, patternOpacity]);

  const frameStyle = useMemo(() => ({
    ...bgStyle,
    borderRadius: `${radius}px`,
    padding: `${padding}px`,
    boxShadow: shadow ? '0 18px 50px rgba(0,0,0,.12), 0 6px 18px rgba(0,0,0,.06)' : 'none',
    transition: 'all .25s ease',
  }), [bgStyle, radius, padding, shadow]);

  /* ───────── prompt builders ───────── */
  const buildEnhancePrompt = (f) =>
    [f?.photographyStyle, `background: ${f?.background}`, `lighting: ${f?.lighting}`, `colors: ${f?.colorStyle}`, f?.realism, `output: ${f?.outputQuality}`]
      .filter(Boolean).join(', ');
  const generateDynamicPrompt = (selections) => `dynamic: ${JSON.stringify(selections)}`;
  const generateTryOnNegativePrompt = () => 'lowres, artifacts, deformed';
  const pickFirstUrl = (obj) => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    const keys = ['image', 'image_url', 'output', 'result', 'url'];
    for (const k of keys) if (obj[k]) return Array.isArray(obj[k]) ? obj[k][0] : obj[k];
    return '';
  };

  /* ───────── storage ───────── */
  const uploadToStorage = useCallback(async (f) => {
    const ext = (f.name?.split('.').pop() || 'png').toLowerCase();
    const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, f, {
      cacheControl: '3600', upsert: false, contentType: f.type || 'image/*',
    });
    if (error) throw error;
    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    if (!data?.publicUrl) throw new Error('no public url');
    return data.publicUrl;
  }, [supabase, user]);

  /* ───────── actions ───────── */
  // Studio: Remove BG (optional) → Enhance (optional)
  const runStudio = useCallback(async () => {
    setBusy(true); setErr(''); setPhase('processing');
    try {
      let workingUrl = null;

      if (applyRemoveBg) {
        const r = await fetch('/api/remove-bg', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageData })
        });
        const j = await r.json(); setApiResponse(j);
        if (!r.ok) throw new Error(j?.error || 'remove-bg failed');
        workingUrl = pickFirstUrl(j);
        if (!workingUrl) throw new Error('No output from remove-bg');
      } else {
        // just upload source to storage
        workingUrl = await uploadToStorage(file);
      }

      if (applyEnhance) {
        const prompt = buildEnhancePrompt(pendingEnhancePreset || ENHANCE_PRESETS[0].config);
        const r2 = await fetch('/api/enhance', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: workingUrl, selections: pendingEnhancePreset, prompt, plan, user_email: user.email })
        });
        const j2 = await r2.json(); setApiResponse(j2);
        if (!r2.ok) throw new Error(j2?.error || 'enhance failed');
        workingUrl = pickFirstUrl(j2);
        if (!workingUrl) throw new Error('No output from enhance');
      }

      setResultUrl(workingUrl);
      setHistory(h => [{ tool:'studio', inputThumb: localUrl, outputUrl: workingUrl, ts: Date.now() }, ...h].slice(0,24));
      setPhase('ready');
      window.dispatchEvent(new Event('credits:refresh'));
    } catch (e) {
      console.error(e); setPhase('error'); setErr('Failed to process. Please try again.');
    } finally { setBusy(false); }
  }, [applyRemoveBg, applyEnhance, imageData, pendingEnhancePreset, plan, user, localUrl, file, uploadToStorage]);

  // Try-On
  const [showTryOn, setShowTryOn] = useState(false);
  const runTryOn = useCallback(async (selections) => {
    setBusy(true); setErr(''); setPhase('processing');
    try {
      const imageUrl = await uploadToStorage(file);
      const prompt = generateDynamicPrompt(selections);
      const negativePrompt = generateTryOnNegativePrompt();
      const r = await fetch('/api/tryon', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, prompt, negativePrompt, plan, user_email: user.email })
      });
      const j = await r.json(); setApiResponse(j);
      if (!r.ok) throw new Error(j?.error || 'tryon failed');
      const out = pickFirstUrl(j); if (!out) throw new Error('No output from try-on');
      setResultUrl(out);
      setHistory(h => [{ tool:'tryon', inputThumb: localUrl, outputUrl: out, ts: Date.now() }, ...h].slice(0,24));
      setPhase('ready'); window.dispatchEvent(new Event('credits:refresh'));
    } catch (e) {
      console.error(e); setPhase('error'); setErr('Failed to process. Please try again.');
    } finally { setBusy(false); }
  }, [uploadToStorage, plan, user, localUrl, file]);

  // Model Swap (2 images + prompt → /api/model)
  const runModelSwap = useCallback(async () => {
    setBusy(true); setErr(''); setPhase('processing');
    try {
      const [url1, url2] = await Promise.all([uploadToStorage(swapImage1), uploadToStorage(swapImage2)]);
      const r = await fetch('/api/model', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image1: url1,
          image2: url2,
          prompt: swapPrompt,
          plan,
          user_email: user.email
        })
      });
      const j = await r.json(); setApiResponse(j);
      if (!r.ok) throw new Error(j?.error || 'model-swap failed');
      const out = pickFirstUrl(j); if (!out) throw new Error('No output from model-swap');
      setResultUrl(out);
      setHistory(h => [{ tool:'modelSwap', inputThumb: url1, outputUrl: out, ts: Date.now() }, ...h].slice(0,24));
      setPhase('ready'); window.dispatchEvent(new Event('credits:refresh'));
    } catch (e) {
      console.error(e); setPhase('error'); setErr('Failed to process. Please try again.');
    } finally { setBusy(false); }
  }, [swapImage1, swapImage2, swapPrompt, uploadToStorage, plan, user]);

  /* ───────── downloads & misc ───────── */
  const downloadDataUrl = (dataUrl, name = 'studio-output.png') => {
    const a = document.createElement('a'); a.href = dataUrl; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
  };
  const downloadRemoveBgPng = async () => {
    if (!resultUrl) return;
    const blob = await fetch(resultUrl, { cache: 'no-store' }).then(r => r.blob());
    const bmp  = await createImageBitmap(blob);

    const padPx = Math.round(Math.max(bmp.width, bmp.height) * (padding / 300));
    const cw = bmp.width  + padPx * 2;
    const ch = bmp.height + padPx * 2;

    const canvas = document.createElement('canvas'); canvas.width = cw; canvas.height = ch;
    const ctx = canvas.getContext('2d', { alpha: true });
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';

    if (bgMode === 'color') {
      ctx.fillStyle = color; ctx.fillRect(0,0,cw,ch);
    } else if (bgMode === 'gradient') {
      const rad = (angle * Math.PI)/180, x = Math.cos(rad), y = Math.sin(rad);
      const g = ctx.createLinearGradient(cw*(1-x)/2, ch*(1-y)/2, cw*(1+x)/2, ch*(1+y)/2);
      g.addColorStop(0, color); g.addColorStop(1, color2);
      ctx.fillStyle = g; ctx.fillRect(0,0,cw,ch);
    } else {
      ctx.fillStyle = color; ctx.fillRect(0,0,cw,ch);
      ctx.strokeStyle = hexToRGBA('#000000', patternOpacity); ctx.lineWidth = 1;
      for (let i = 0; i <= Math.max(cw, ch); i += 24) {
        ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,ch); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(cw,i); ctx.stroke();
      }
    }

    if (radius > 0) {
      const r = radius;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(r,0); ctx.arcTo(cw,0,cw,ch,r); ctx.arcTo(cw,ch,0,ch,r);
      ctx.arcTo(0,ch,0,0,r); ctx.arcTo(0,0,cw,0,r); ctx.closePath(); ctx.clip();
    }

    ctx.drawImage(bmp, padPx, padPx);

    if (shadow) {
      ctx.globalCompositeOperation = 'destination-over';
      ctx.shadowColor = 'rgba(0,0,0,.18)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 14;
      ctx.fillStyle = '#0000'; ctx.fillRect(20,20,cw-40,ch-40);
      ctx.globalCompositeOperation = 'source-over';
    }

    downloadDataUrl(canvas.toDataURL('image/png'), 'studio-output.png');
  };
  const downloadResultAsPng = async () => {
    if (!resultUrl) return;
    const img = await fetch(resultUrl).then(r => r.blob()).then(createImageBitmap);
    const canvas = document.createElement('canvas'); canvas.width = img.width; canvas.height = img.height;
    const ctx = canvas.getContext('2d', { alpha: true });
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0);
    downloadDataUrl(canvas.toDataURL('image/png'), 'studio-output.png');
  };

  const copyUrl = async () => {
    if (!resultUrl) return;
    try { await navigator.clipboard.writeText(resultUrl); setErr('Link copied'); setTimeout(()=>setErr(''),1500); } catch {}
  };

  const resetAll = () => {
    setFile(null); setLocalUrl(''); setResultUrl(''); setImageData('');
    setSwapImage1(null); setSwapImage2(null); setSwapPreview1(''); setSwapPreview2('');
    setErr(''); setPhase('idle'); setApiResponse(null); setCompare(false);
  };

  /* ───────── UI ───────── */
  if (loading || user === undefined) {
    return (
      <main className="min-h-screen grid place-items-center bg-gradient-to-b from-slate-50 to-slate-100 text-slate-600">
        <div className="rounded-2xl bg-white/80 backdrop-blur px-4 py-3 border shadow-sm text-sm">Loading your studio…</div>
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
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900">
      {(plan === 'Free' || credits <= 0) && (
        <div className="fixed top-4 right-4 z-10">
          <button
            onClick={() => router.push('/')}
            className="rounded-full border border-slate-300 bg-white/90 hover:bg-white px-4 py-2 text-sm font-semibold shadow-sm backdrop-blur"
            title="Back to Home"
          >
            ⬅ Home
          </button>
        </div>
      )}

      <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 md:gap-6 px-3 md:px-6 py-4 md:py-6">
        {/* ───── Left Sidebar ───── */}
        <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm sticky top-3 md:top-4 self-start h-fit">
          <div className="px-4 py-4 flex items-center gap-3 border-b border-slate-200">
            <div className="grid place-items-center size-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z"/></svg>
            </div>
            <div className="font-semibold tracking-tight">AI Studio</div>
          </div>

          <Group title="Tools" defaultOpen>
            {TOOLS.map(t => (
              <SideItem key={t.id} label={t.label} icon={t.icon} active={active === t.id} onClick={() => setActive(t.id)} />
            ))}
          </Group>

          <div className="mt-2 px-4 py-3 border-t border-slate-200">
            <div className="flex items-center gap-3">
              <div className="grid place-items-center size-10 rounded-full bg-slate-100 text-slate-700 font-bold">{initials}</div>
              <div className="text-sm">
                <div className="font-medium leading-tight">{user.user_metadata?.name || user.email}</div>
              </div>
            </div>
          </div>
        </aside>

        {/* ───── Main Column ───── */}
        <section className="space-y-5 md:space-y-6">

          {/* Presets + Customize */}
          {active !== 'modelSwap' && (
            <div className="rounded-2xl md:rounded-3xl border border-slate-200 bg-white/90 backdrop-blur p-4 sm:p-5 md:p-6 shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Quick Presets</h1>
                  <p className="text-slate-600 text-xs sm:text-sm">Pick a preset, or open <span className="font-semibold">Customize</span> to fine-tune.</p>
                </div>
                {active === 'studio' ? (
                  <button
                    onClick={() => { setPendingEnhancePreset(null); setApplyEnhance(true); setApplyRemoveBg(true); }}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs sm:text-sm font-semibold hover:bg-slate-50"
                  >
                    ✨ Default: Enhance + Remove BG
                  </button>
                ) : (
                  <button
                    onClick={() => { setPendingTryOnPreset(null); setShowTryOn(true); }}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs sm:text-sm font-semibold hover:bg-slate-50"
                  >
                    🧍 Customize Try-On
                  </button>
                )}
              </div>

              {active === 'studio' && (
                <div className="mt-4">
                  <div className="mb-2 text-[12px] font-semibold text-slate-700">Enhance</div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {ENHANCE_PRESETS.map(p => (
                      <PresetCard
                        key={p.id}
                        title={p.title}
                        subtitle={p.subtitle}
                        preview={p.preview}
                        tag={p.tag}
                        onClick={() => { setPendingEnhancePreset(p.config); setApplyEnhance(true); }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {active === 'tryon' && (
                <div className="mt-4">
                  <div className="mb-2 text-[12px] font-semibold text-slate-700">Try-On</div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {TRYON_PRESETS.map(p => (
                      <PresetCard
                        key={p.id}
                        title={p.title}
                        subtitle={p.subtitle}
                        preview={p.preview}
                        tag={p.tag}
                        onClick={() => { setPendingTryOnPreset(p.config); setShowTryOn(true); }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Workbench */}
          <div className="grid gap-4 md:gap-6 lg:grid-cols-[1fr_360px]">
            {/* Canvas Panel */}
            <section className="rounded-2xl md:rounded-3xl border border-slate-200 bg-white shadow-sm relative">
              {/* header */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-3 sm:px-4 md:px-5 pt-3 md:pt-4">
                <Segmented items={TOOLS} value={active} onChange={setActive} />
                <div className="flex items-center gap-2">
                  <StepBadge phase={phase} />
                  <button onClick={resetAll} className="text-xs px-2 py-1 rounded-lg border bg-white hover:bg-slate-50">Reset</button>
                </div>
              </div>

              {/* dropzone / model swap area */}
              {active !== 'modelSwap' ? (
                <div
                  ref={dropRef}
                  className="m-3 sm:m-4 md:m-5 min-h-[240px] sm:min-h-[300px] md:min-h-[360px] grid place-items-center rounded-2xl border-2 border-dashed border-slate-300/80 bg-slate-50 hover:bg-slate-100 transition cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  title="Drag & drop / Click / Paste (Ctrl+V)"
                >
                  <input
                    ref={fileInputRef}
                    type="file" accept="image/*" className="hidden"
                    onChange={async (e) => { const f = e.target.files?.[0]; if (f) await onPick(f); }}
                  />
                  {!localUrl && !resultUrl ? (
                    <div className="text-center text-slate-500 text-sm">
                      <div className="mx-auto mb-3 grid place-items-center size-10 sm:size-12 rounded-full bg-white border border-slate-200">⬆</div>
                      Drag & drop an image here, click to choose, or paste (Ctrl+V)
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
              ) : (
                <div className="m-3 sm:m-4 md:m-5">
                  <div className="mb-3 flex flex-col sm:flex-row gap-3">
                    <SwapPicker
                      title="Input Image 1"
                      file={swapImage1}
                      preview={swapPreview1}
                      onPick={async (f) => { setSwapImage1(f); setSwapPreview1(URL.createObjectURL(f)); }}
                    />
                    <SwapPicker
                      title="Input Image 2"
                      file={swapImage2}
                      preview={swapPreview2}
                      onPick={async (f) => { setSwapImage2(f); setSwapPreview2(URL.createObjectURL(f)); }}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs text-slate-600">Prompt</label>
                    <input
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                      value={swapPrompt}
                      onChange={(e)=>setSwapPrompt(e.target.value)}
                      placeholder="Describe how to merge both images…"
                    />
                  </div>
                </div>
              )}

              {/* actions */}
              <div className="flex flex-wrap items-center gap-2 px-3 sm:px-4 md:px-5 pb-4 md:pb-5">
                <button
                  onClick={handleRun}
                  disabled={(active!=='modelSwap' && !file) || (active==='modelSwap' && (!swapImage1 || !swapImage2)) || busy}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3 sm:px-4 py-2 text-sm font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {busy ? 'Processing…' : (<><PlayIcon className="size-4" />Run {TOOLS.find(t => t.id === active)?.label}</>)}
                </button>

                {resultUrl && (
                  <>
                    <button
                      onClick={active === 'studio' && applyRemoveBg ? downloadRemoveBgPng : downloadResultAsPng}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 sm:px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                    >
                      ⬇ Download PNG
                    </button>
                    <button
                      onClick={() => setExportOpen(true)}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 sm:px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                    >
                      🧰 Export
                    </button>
                    <button
                      onClick={copyUrl}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-xs font-semibold hover:bg-slate-50"
                    >
                      🔗 Copy URL
                    </button>
                    <a
                      href={resultUrl} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-xs font-semibold hover:bg-slate-50"
                    >
                      ↗ Open
                    </a>
                    {localUrl && active!=='modelSwap' && (
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

              {/* API response */}
              {apiResponse && (
                <div className="px-3 sm:px-4 md:px-5 pb-4 md:pb-5">
                  <button
                    onClick={() => setRespOpen(v => !v)}
                    className="w-full text-left rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold hover:bg-slate-100"
                  >
                    {respOpen ? 'Hide' : 'Show'} Response
                  </button>
                  <AnimatePresence initial={false}>
                    {respOpen && (
                      <motion.pre
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-2 max-h-[40vh] overflow-auto text-[11px] leading-5 whitespace-pre-wrap rounded-xl border border-slate-200 bg-white p-3"
                      >
{JSON.stringify(apiResponse, null, 2)}
                      </motion.pre>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </section>

            {/* Inspector */}
            <aside className="rounded-2xl md:rounded-3xl border border-slate-200 bg-white shadow-sm p-4 md:p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900">Inspector</div>
                <span className="text-xs text-slate-500">Mode: {TOOLS.find(t=>t.id===active)?.label}</span>
              </div>

              {active === 'studio' && (
                <div className="space-y-3 mt-3">
                  <div className="grid grid-cols-2 gap-2">
                    <label className="inline-flex items-center gap-2 text-xs">
                      <input type="checkbox" checked={applyRemoveBg} onChange={(e)=>setApplyRemoveBg(e.target.checked)} />
                      Remove Background
                    </label>
                    <label className="inline-flex items-center gap-2 text-xs">
                      <input type="checkbox" checked={applyEnhance} onChange={(e)=>setApplyEnhance(e.target.checked)} />
                      Apply Enhance
                    </label>
                  </div>

                  {/* Remove-BG frame styling */}
                  {applyRemoveBg && (
                    <>
                      <ModeTabs mode={bgMode} setMode={setBgMode} />
                      <Field label="Primary"><Color value={color} onChange={setColor} /></Field>
                      {bgMode === 'gradient' && (
                        <>
                          <Field label="Secondary"><Color value={color2} onChange={setColor2} /></Field>
                          <Field label="Angle"><Range value={angle} onChange={setAngle} min={0} max={360} /></Field>
                        </>
                      )}
                      {bgMode === 'pattern' && (
                        <Field label="Pattern opacity">
                          <Range value={patternOpacity} onChange={setPatternOpacity} min={0} max={0.5} step={0.01} />
                        </Field>
                      )}
                      <Field label="Corner radius"><Range value={radius} onChange={setRadius} min={0} max={48} /></Field>
                      <Field label="Padding"><Range value={padding} onChange={setPadding} min={0} max={64} /></Field>
                      <label className="mt-1 inline-flex items-center gap-2 text-xs text-slate-700">
                        <input type="checkbox" checked={shadow} onChange={(e)=>setShadow(e.target.checked)} />
                        Shadow
                      </label>
                    </>
                  )}

                  {/* Final Preview */}
                  <div className="mt-2">
                    <div className="text-xs text-slate-500 mb-2">Final preview</div>
                    <div style={applyRemoveBg ? frameStyle : {}} className="relative rounded-xl overflow-hidden border border-slate-200">
                      <div className="relative w-full min-h-[140px] sm:min-h-[160px] grid place-items-center">
                        {resultUrl ? (
                          <img src={resultUrl} alt="final" className="max-w-full max-h-[38vh] object-contain" />
                        ) : (
                          <div className="grid place-items-center h-[140px] text-xs text-slate-400">— Run Studio first —</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {active === 'tryon' && (
                <div className="space-y-2 text-xs text-slate-600 mt-3">
                  <div>Pick a Try-On preset above or click Run to open Customize.</div>
                  {resultUrl && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                      <div className="relative w-full min-h-[140px] grid place-items-center">
                        <img src={resultUrl} alt="final" className="max-w-full max-h-[38vh] object-contain" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {active === 'modelSwap' && (
                <div className="space-y-3 text-xs text-slate-600 mt-3">
                  <p>Upload two images, write a short prompt, then run Model Swap.</p>
                  {resultUrl && (
                    <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
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
          <div className="rounded-2xl md:rounded-3xl border border-slate-200 bg-white shadow-sm p-4 md:p-5">
            <div className="text-sm font-semibold text-slate-900 mb-2">History</div>
            {history.length === 0 ? (
              <div className="text-xs text-slate-500 px-1 py-4">— No renders yet —</div>
            ) : (
              <>
                <div className="mb-2">
                  <button onClick={()=>setHistory([])} className="text-xs px-2 py-1 rounded-lg border bg-white hover:bg-slate-50">
                    Clear history
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {history.map((h, i) => (
                    <button key={i} onClick={() => setResultUrl(h.outputUrl)}
                      className="group relative rounded-xl overflow-hidden border border-slate-200 hover:border-slate-300 transition bg-slate-50">
                      <img src={h.outputUrl || h.inputThumb} alt="hist" className="w-full h-28 object-cover" />
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
        {showTryOn && (
          <motion.div className="fixed inset-0 z-[100] grid place-items-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/55" onClick={()=>setShowTryOn(false)} />
            <div className="relative w-full max-w-3xl mx-3">
              <TryOnCustomizer
                initial={pendingTryOnPreset || undefined}
                onChange={()=>{}}
                onComplete={(form) => { setShowTryOn(false); setPendingTryOnPreset(null); runTryOn(form); }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export Drawer */}
      <ExportDrawer open={exportOpen} onClose={() => setExportOpen(false)} cutoutUrl={resultUrl} defaultName="asset" />
    </main>
  );
}

/* ───────────────── Sidebar bits ───────────────── */
function Group({ title, children, defaultOpen=false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="px-2 py-2 border-b border-slate-200/70">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between text-sm px-2 py-1.5 rounded-lg hover:bg-slate-50"
      >
        <span className="flex items-center gap-2">
          {title === 'Tools' ? <WandIcon className="size-4 text-slate-500" /> : <PersonIcon className="size-4 text-slate-500" />}
          <span className="font-semibold">{title}</span>
        </span>
        <span className="text-xs text-slate-500">{open ? '▾' : '▸'}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="pl-7 pr-1 pt-1 space-y-1"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
function SideItem({ label, icon:Icon, active=false, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        'w-full group flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm transition',
        active
          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
          : 'text-slate-700 hover:bg-slate-100 border border-transparent'
      ].join(' ')}
    >
      <Icon className={['size-4', active ? 'text-indigo-600' : 'text-slate-500 group-hover:text-slate-700'].join(' ')} />
      <span className="truncate">{label}</span>
    </button>
  );
}

/* ───────────────── UI bits ───────────────── */
function Segmented({ items, value, onChange }) {
  return (
    <div className="inline-flex rounded-full border border-slate-300 bg-white p-1">
      {items.map((it) => {
        const Active = value === it.id;
        const Icon = it.icon;
        return (
          <button
            key={it.id}
            onClick={() => onChange(it.id)}
            className={[
              'inline-flex items-center gap-2 py-1.5 px-3 rounded-full text-sm transition',
              Active ? 'bg-slate-900 text-white shadow' : 'text-slate-700 hover:bg-slate-100'
            ].join(' ')}
          >
            <Icon className="size-4" />
            <span>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function PresetCard({ title, subtitle, onClick, preview, tag }) {
  const [broken, setBroken] = useState(false);
  const [loaded, setLoaded] = useState(false);
  if (broken) return null;

  return (
    <button onClick={onClick}
      className="group relative rounded-2xl overflow-hidden border border-slate-200 hover:border-slate-300 bg-white shadow-sm transition text-left hover:shadow-md">
      <div className="relative w-full aspect-[4/3] bg-slate-100">
        {!loaded && <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100" />}
        <img
          src={preview}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setBroken(true)}
        />
        {tag && (
          <span className="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full bg-slate-900/80 text-white shadow">
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

function StepBadge({ phase }) {
  const map = {
    idle:{label:'Ready',color:'bg-slate-200 text-slate-700 border-slate-300'},
    processing:{label:'Processing',color:'bg-amber-200 text-amber-900 border-amber-300'},
    ready:{label:'Done',color:'bg-emerald-200 text-emerald-900 border-emerald-300'},
    error:{label:'Error',color:'bg-rose-200 text-rose-900 border-rose-300'},
  };
  const it = map[phase] || map.idle;
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${it.color}`}>
      <span className={`inline-block size-2 rounded-full ${phase==='processing'?'bg-slate-700 animate-pulse':'bg-slate-600'}`} />
      {it.label}
    </span>
  );
}

/* ───────── controls ───────── */
function Field({ label, children }) {
  return (
    <label className="flex items-center justify-between gap-3 text-xs text-slate-700">
      <span className="min-w-28">{label}</span>
      <div className="flex-1">{children}</div>
    </label>
  );
}
function Color({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <input type="color" value={value} onChange={(e)=>onChange(e.target.value)} />
      <input className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1"
        value={value} onChange={(e)=>onChange(e.target.value)} />
    </div>
  );
}
function Range({ value, onChange, min, max, step=1 }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e)=>onChange(Number(e.target.value))}
        className="w-full accent-indigo-600"
      />
      <span className="w-10 text-right">{typeof value==='number'?value:''}</span>
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
    <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => setMode(t.id)}
          className={[
            'px-3 py-1.5 text-xs rounded-lg transition',
            mode === t.id ? 'bg-white shadow text-slate-900' : 'text-slate-600 hover:bg-white'
          ].join(' ')}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* ───────── Model Swap pickers ───────── */
function SwapPicker({ title, file, preview, onPick }) {
  const inputRef = useRef(null);
  return (
    <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-3">
      <div className="text-xs font-semibold mb-2">{title}</div>
      <div
        className="relative h-44 rounded-xl border-2 border-dashed border-slate-300/80 bg-slate-50 hover:bg-slate-100 grid place-items-center cursor-pointer"
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file" accept="image/*" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onPick(f); }}
        />
        {preview ? (
          <img src={preview} alt="pick" className="absolute inset-0 w-full h-full object-contain rounded-xl" />
        ) : (
          <div className="text-slate-500 text-xs">Click to choose</div>
        )}
      </div>
    </div>
  );
}

/* ───────── simple Customize modals ───────── */
function TryOnCustomizer({ initial, onChange, onComplete }) {
  return (
    <div className="rounded-2xl bg-white p-4 sm:p-5 shadow border space-y-3">
      <div className="text-sm font-semibold">Try-On Settings</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <label className="space-y-1">
          <span className="text-slate-600">Style</span>
          <input defaultValue={initial?.style || ''} onChange={()=>{}} className="w-full rounded-lg border px-2 py-1" placeholder="streetwear fit" />
        </label>
        <label className="space-y-1">
          <span className="text-slate-600">Setting</span>
          <input defaultValue={initial?.setting || ''} onChange={()=>{}} className="w-full rounded-lg border px-2 py-1" placeholder="urban alley" />
        </label>
      </div>
      <div className="flex items-center justify-end gap-2 pt-1">
        <button className="rounded-lg border px-3 py-1.5 text-xs" onClick={()=>onComplete(initial || {})}>Run</button>
      </div>
    </div>
  );
}

function ExportDrawer({ open, onClose, cutoutUrl, defaultName }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[120]">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl p-4">
        <div className="font-semibold mb-2">Export</div>
        {cutoutUrl ? <img src={cutoutUrl} alt="export" className="w-full rounded-lg border" /> : <div className="text-xs text-slate-500">No image</div>}
        <button className="mt-4 rounded-lg border px-3 py-2" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

/* ───────── icons (clean, modern SVG) ───────── */
function SparklesIcon(props){return(<svg viewBox="0 0 24 24" className={props.className||''}><path d="M5 11l2-5 2 5 5 2-5 2-2 5-2-5-5-2 5-2zm11-6l1-3 1 3 3 1-3 1-1 3-1-3-3-1 3-1zm1 9l1-2 1 2 2 1-2 1-1 2-1-2-2-1 2-1z" fill="currentColor"/></svg>);}
function PersonIcon(props){return(<svg viewBox="0 0 24 24" className={props.className||''}><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-4.33 0-8 2.17-8 4.5V21h16v-2.5C20 16.17 16.33 14 12 14z" fill="currentColor"/></svg>);}
function CubeIcon(props){return(<svg viewBox="0 0 24 24" className={props.className||''}><path d="M12 2l8 4v12l-8 4-8-4V6l8-4zm0 2.2L6.5 6.3 12 8.8 17.5 6.3 12 4.2zM6 7.8V18l6 3V10.8L6 7.8zm12 0l-6 3V21l6-3V7.8z" fill="currentColor"/></svg>);}
function WandIcon(props){return(<svg viewBox="0 0 24 24" className={props.className||''}><path d="M2 20l10-10 2 2L4 22H2zM14 2l2 2-2 2-2-2 2-2z" fill="currentColor"/></svg>);}
function PlayIcon(props){return(<svg viewBox="0 0 24 24" className={props.className||''}><path d="M8 5v14l11-7z" fill="currentColor"/></svg>);}
