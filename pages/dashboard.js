// /pages/dashboard.js
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';

import Layout from '@/components/Layout';
import EnhanceCustomizer from '@/components/EnhanceCustomizer';
import TryOnCustomizer from '@/components/TryOnCustomizer';
import generateDynamicPrompt, { generateTryOnNegativePrompt } from '@/lib/generateDynamicPrompt';
import ExportDrawer from '@/components/ExportDrawer';

/* ---------------- helpers ---------------- */
const hexToRGBA = (hex, a = 1) => {
  const c = hex.replace('#', '');
  const v = c.length === 3 ? c.replace(/(.)/g, '$1$1') : c;
  const n = parseInt(v, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = (n) & 255;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};
const fileToDataURLOriginal = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const STORAGE_BUCKET = 'img';

/* ---------------- Presets ---------------- */
const ENHANCE_PRESETS = [
  {
    id: 'clean-studio',
    title: 'Clean Studio',
    subtitle: 'Soft light, white sweep',
    config: {
      photographyStyle: 'studio product photography, 50mm',
      background: 'white seamless',
      lighting: 'softbox, gentle reflections',
      colorStyle: 'neutral whites, subtle grays',
      realism: 'hyperrealistic details',
      outputQuality: '4k sharp',
    },
    gradient: 'from-slate-100 via-white to-slate-100',
  },
  {
    id: 'desert-tones',
    title: 'Desert Tones',
    subtitle: 'Warm, cinematic',
    config: {
      photographyStyle: 'cinematic product shot',
      background: 'warm beige backdrop',
      lighting: 'golden hour, soft shadows',
      colorStyle: 'sand, beige, amber',
      realism: 'photo-real, crisp textures',
      outputQuality: '4k',
    },
    gradient: 'from-amber-200 via-orange-100 to-rose-100',
  },
  {
    id: 'editorial-beige',
    title: 'Editorial Beige',
    subtitle: 'Minimal, magazine look',
    config: {
      photographyStyle: 'editorial catalog',
      background: 'matte beige',
      lighting: 'directional key + fill',
      colorStyle: 'beige monochrome',
      realism: 'realistic',
      outputQuality: '4k print',
    },
    gradient: 'from-amber-50 via-rose-50 to-amber-50',
  },
];

const TRYON_PRESETS = [
  {
    id: 'streetwear',
    title: 'Streetwear',
    subtitle: 'Urban, moody',
    config: {
      style: 'streetwear fit',
      setting: 'urban alley',
      lighting: 'overcast soft',
      mood: 'cool, editorial',
    },
    gradient: 'from-slate-200 via-slate-100 to-slate-200',
  },
  {
    id: 'ecom-mannequin',
    title: 'E-Com Mannequin',
    subtitle: 'Plain backdrop',
    config: {
      style: 'ecommerce mannequin front',
      setting: 'white cyclorama',
      lighting: 'soft studio',
      mood: 'catalog clean',
    },
    gradient: 'from-white via-slate-50 to-white',
  },
  {
    id: 'lifestyle',
    title: 'Lifestyle',
    subtitle: 'Bright apartment',
    config: {
      style: 'lifestyle casual',
      setting: 'sunlit room',
      lighting: 'window soft',
      mood: 'fresh & bright',
    },
    gradient: 'from-emerald-50 via-teal-50 to-cyan-50',
  },
];

/* ---------------- Tools ---------------- */
const TOOLS = [
  { id: 'removeBg', label: 'Remove BG', icon: ScissorsIcon },
  { id: 'enhance', label: 'Enhance', icon: RocketIcon },
  { id: 'tryon', label: 'Try-On', icon: PersonIcon },
  { id: 'modelSwap', label: 'Model Swap', icon: CubeIcon },
];

export default function DashboardStudio() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const router = useRouter();

  /* ---------- state ---------- */
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState('Free');
  const [credits, setCredits] = useState(0);
  const [err, setErr] = useState('');

  const [active, setActive] = useState('enhance'); // default
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState('idle'); // idle|processing|ready|error

  // file/results
  const [file, setFile] = useState(null);
  const [localUrl, setLocalUrl] = useState('');
  const [imageData, setImageData] = useState(''); // removeBg only
  const [resultUrl, setResultUrl] = useState('');

  // removeBg inspector
  const [bgMode, setBgMode] = useState('color');   // color | gradient | pattern
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

  // presets → pass to popups
  const [pendingEnhancePreset, setPendingEnhancePreset] = useState(null);
  const [pendingTryOnPreset, setPendingTryOnPreset] = useState(null);

  // backend model (from API, NOT hardcoded here)
  const [models, setModels] = useState([]); // [{id,name,tags,desc,recommendFor}]
  const [backendModel, setBackendModel] = useState('');

  // compare overlay
  const [compare, setCompare] = useState(false);
  const [compareOpacity, setCompareOpacity] = useState(50);

  const dropRef = useRef(null);
  const fileInputRef = useRef(null);

  /* ---------- auth & workspace ---------- */
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (user === undefined) return;
      if (!user) { router.replace('/login'); return; }

      // 1) fetch plan/credits/model from Supabase once (single client via hook)
      try {
        const { data } = await supabase
          .from('Data')
          .select('plan, credits, model_backend')
          .eq('email', user.email)
          .single();

        if (!mounted) return;

        setPlan(data?.plan || 'Free');
        setCredits(typeof data?.credits === 'number' ? data.credits : 0);
        setBackendModel(data?.model_backend || '');
      } catch {
        // ignore – keep defaults
      }

      // 2) fetch model options from your API (no constants here)
      try {
        const res = await fetch('/api/models', { cache: 'no-store' });
        if (res.ok) {
          const arr = await res.json();
          if (Array.isArray(arr)) setModels(arr);
          if (!backendModel && Array.isArray(arr) && arr[0]?.id) setBackendModel(arr[0].id);
        }
      } catch {/* ignore */}

      if (mounted) setLoading(false);
    })();
    return () => { mounted = false; };
  }, [user, router, supabase]);

  // credits live refresh (optional)
  useEffect(() => {
    const h = async () => {
      if (!user?.email) return;
      const { data } = await supabase.from('Data').select('credits').eq('email', user.email).single();
      if (typeof data?.credits === 'number') setCredits(data.credits);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('credits:refresh', h);
      return () => window.removeEventListener('credits:refresh', h);
    }
  }, [supabase, user]);

  /* ---------- drag & drop + paste ---------- */
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

  /* ---------- keyboard shortcuts ---------- */
  useEffect(() => {
    const handler = (e) => {
      if (e.target && ['INPUT','TEXTAREA'].includes(e.target.tagName)) return;
      if (e.key === 'r' || e.key === 'R') { e.preventDefault(); handleRun(); }
      if (e.key >= '1' && e.key <= '4') {
        const index = Number(e.key) - 1;
        setActive(TOOLS[index]?.id || 'enhance');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleRun]);

  /* ---------- reset on tool switch ---------- */
  useEffect(() => {
    setPhase('idle'); setErr(''); setApiResponse(null);
    // لا نمسح الملف عند التنقل بين الأدوات باستثناء modelSwap
    if (active === 'modelSwap') return;
    setResultUrl('');
    setImageData('');
  }, [active]);

  const onPick = async (f) => {
    setFile(f);
    setLocalUrl(URL.createObjectURL(f));
    setResultUrl(''); setPhase('idle'); setErr(''); setApiResponse(null);
    if (active === 'removeBg') setImageData(await fileToDataURLOriginal(f));
  };

  /* ---------- styles ---------- */
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

  /* ---------- prompts ---------- */
  const pickFirstUrl = (obj) => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    const keys = ['image', 'image_url', 'output', 'result', 'url'];
    for (const k of keys) if (obj[k]) return Array.isArray(obj[k]) ? obj[k][0] : obj[k];
    return '';
  };
  const buildEnhancePrompt = (f) =>
    [f?.photographyStyle, `background: ${f?.background}`, `lighting: ${f?.lighting}`, `colors: ${f?.colorStyle}`, f?.realism, `output: ${f?.outputQuality}`]
      .filter(Boolean).join(', ');

  /* ---------- storage ---------- */
  const uploadToStorage = useCallback(async () => {
    if (!file) throw new Error('no file');
    const ext = (file.name?.split('.').pop() || 'png').toLowerCase();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
      cacheControl: '3600', upsert: false, contentType: file.type || 'image/*',
    });
    if (upErr) throw upErr;
    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    if (!data?.publicUrl) throw new Error('no public url');
    return data.publicUrl;
  }, [file, supabase, user]);

  /* ---------- actions ---------- */
  const runRemoveBg = useCallback(async () => {
    setBusy(true); setErr(''); setPhase('processing');
    try {
      const r = await fetch('/api/remove-bg', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData, backendModel }),
      });
      const j = await r.json(); setApiResponse(j);
      if (!r.ok) throw new Error(j?.error || 'remove-bg failed');
      const out = pickFirstUrl(j); if (!out) throw new Error('No output from remove-bg');
      setResultUrl(out);
      setHistory(h => [{ tool:'removeBg', inputThumb: localUrl, outputUrl: out, ts: Date.now() }, ...h].slice(0,18));
      setPhase('ready');
      window.dispatchEvent(new Event('credits:refresh'));
    } catch (e) {
      console.error(e); setPhase('error'); setErr('تعذر تنفيذ العملية.');
    } finally { setBusy(false); }
  }, [imageData, localUrl, backendModel]);

  const runEnhance = useCallback(async (selections) => {
    setBusy(true); setErr(''); setPhase('processing');
    try {
      const imageUrl = await uploadToStorage();
      const prompt = buildEnhancePrompt(selections);
      const r = await fetch('/api/enhance', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, selections, prompt, plan, user_email: user.email, backendModel }),
      });
      const j = await r.json(); setApiResponse(j);
      if (!r.ok) throw new Error(j?.error || 'enhance failed');
      const out = pickFirstUrl(j); if (!out) throw new Error('No output from enhance');
      setResultUrl(out);
      setHistory(h => [{ tool:'enhance', inputThumb: localUrl, outputUrl: out, ts: Date.now() }, ...h].slice(0,18));
      setPhase('ready'); window.dispatchEvent(new Event('credits:refresh'));
    } catch (e) {
      console.error(e); setPhase('error'); setErr('تعذر تنفيذ العملية.');
    } finally { setBusy(false); }
  }, [uploadToStorage, plan, user, localUrl, backendModel]);

  const runTryOn = useCallback(async (selections) => {
    setBusy(true); setErr(''); setPhase('processing');
    try {
      const imageUrl = await uploadToStorage();
      const prompt = generateDynamicPrompt(selections);
      const negativePrompt = generateTryOnNegativePrompt();
      const r = await fetch('/api/tryon', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, prompt, negativePrompt, plan, user_email: user.email, backendModel }),
      });
      const j = await r.json(); setApiResponse(j);
      if (!r.ok) throw new Error(j?.error || 'tryon failed');
      const out = pickFirstUrl(j); if (!out) throw new Error('No output from try-on');
      setResultUrl(out);
      setHistory(h => [{ tool:'tryon', inputThumb: localUrl, outputUrl: out, ts: Date.now() }, ...h].slice(0,18));
      setPhase('ready'); window.dispatchEvent(new Event('credits:refresh'));
    } catch (e) {
      console.error(e); setPhase('error'); setErr('تعذر تنفيذ العملية.');
    } finally { setBusy(false); }
  }, [uploadToStorage, plan, user, localUrl, backendModel]);

  const handleRun = useCallback(() => {
    if (active !== 'modelSwap' && !file) { setErr('اختر صورة أولاً'); return; }
    if (active === 'removeBg') return runRemoveBg();
    if (active === 'enhance')  return setShowEnhance(true);
    if (active === 'tryon')    return setShowTryOn(true);
  }, [active, file, runRemoveBg]);

  /* ---------- modals ---------- */
  const [showEnhance, setShowEnhance] = useState(false);
  const [showTryOn, setShowTryOn] = useState(false);

  /* ---------- download helpers ---------- */
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
    try { await navigator.clipboard.writeText(resultUrl); setErr('✔ تم نسخ الرابط'); setTimeout(()=>setErr(''),1500); } catch {}
  };

  const resetAll = () => {
    setFile(null); setLocalUrl(''); setResultUrl(''); setImageData(''); setErr(''); setPhase('idle'); setApiResponse(null); setCompare(false);
  };

  /* ---------- UI ---------- */
  if (loading || user === undefined) {
    return (
      <Layout title="Studio">
        <main className="min-h-screen grid place-items-center bg-slate-50 text-slate-600">
          <div className="text-sm">Loading your studio…</div>
        </main>
      </Layout>
    );
  }
  if (!user) return null;

  const initials = (() => {
    const n = user?.user_metadata?.name || user?.email || 'U';
    const p = n.split(' ').filter(Boolean);
    return ((p[0]?.[0] || n[0]) + (p[1]?.[0] || '')).toUpperCase();
  })();

  /* ---------- Model Swap (panel from API) ---------- */
  const ModelSwapPanel = () => (
    <div className="grid gap-3 sm:grid-cols-2">
      {models?.length ? models.map((b) => {
        const selected = backendModel === b.id;
        return (
          <button
            key={b.id}
            onClick={async () => {
              setBackendModel(b.id);
              try {
                await supabase.from('Data').update({ model_backend: b.id }).eq('email', user.email);
              } catch {}
            }}
            className={[
              'text-left rounded-xl border p-4 transition shadow-sm',
              selected ? 'border-indigo-500 ring-1 ring-indigo-300 bg-indigo-50' : 'border-slate-200 hover:bg-slate-50'
            ].join(' ')}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-semibold">{b.name}</div>
                {b.desc && <div className="text-xs text-slate-600">{b.desc}</div>}
              </div>
              {selected && <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-600 text-white">Active</span>}
            </div>
            {Array.isArray(b.tags) && b.tags.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                {b.tags.map(t => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">{t}</span>
                ))}
              </div>
            )}
            {Array.isArray(b.recommendFor) && (
              <div className="mt-2 text-[11px] text-slate-500">
                Recommended: {b.recommendFor.join(', ')}
              </div>
            )}
          </button>
        );
      }) : (
        <div className="text-xs text-slate-500">No models from API.</div>
      )}
    </div>
  );

  /* ---------- View ---------- */
  return (
    <Layout title="Studio">
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 px-4 md:px-6 py-6">
          {/* ===== Left Sidebar ===== */}
          <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm sticky top-4 self-start h-fit">
            <div className="px-4 py-4 flex items-center gap-3 border-b border-slate-200">
              <div className="grid place-items-center size-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow">
                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z"/></svg>
              </div>
              <div className="font-semibold tracking-tight">AI Studio</div>
            </div>

            {/* Tools group */}
            <Group title="Tools" defaultOpen>
              {TOOLS.map(t => (
                <SideItem
                  key={t.id}
                  label={t.label}
                  icon={t.icon}
                  active={active === t.id}
                  onClick={() => setActive(t.id)}
                />
              ))}
            </Group>

            {/* Models group */}
            <Group title="Models" defaultOpen>
              <SideItem
                label="Model Swap"
                icon={CubeIcon}
                active={active === 'modelSwap'}
                onClick={() => setActive('modelSwap')}
              />
              <SideItem
                label="History"
                icon={ListIcon}
                onClick={() => document.getElementById('history-anchor')?.scrollIntoView({ behavior:'smooth' })}
              />
            </Group>

            <div className="mt-2 px-4 py-3 border-t border-slate-200">
              <div className="flex items-center gap-3">
                <div className="grid place-items-center size-10 rounded-full bg-slate-100 text-slate-700 font-bold">{initials}</div>
                <div className="text-sm">
                  <div className="font-medium leading-tight">{user.user_metadata?.name || user.email}</div>
                  <div className="text-xs text-slate-500">Plan: <span className="font-medium">{plan}</span></div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-100 px-3 py-2 text-xs">
                <span className="text-slate-600">Credits</span>
                <span className="font-semibold">{credits}</span>
              </div>
            </div>
          </aside>

          {/* ===== Main Column ===== */}
          <section className="space-y-6">
            {/* Presets row */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Quick Presets</h1>
                  <p className="text-slate-600 text-sm">اختر إعداد جاهز — يفتح لك النافذة مع القيم المعبأة.</p>
                </div>
                <div className="text-xs rounded-full border px-3 py-1 bg-slate-50">
                  Current Model: <span className="font-semibold">{models.find(m=>m.id===backendModel)?.name || backendModel || '—'}</span>
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-2 text-[12px] font-semibold text-slate-700">Enhance</div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {ENHANCE_PRESETS.map(p => (
                    <PresetCard
                      key={p.id}
                      title={p.title}
                      subtitle={p.subtitle}
                      gradient={p.gradient}
                      onClick={() => { setActive('enhance'); setPendingEnhancePreset(p.config); setShowEnhance(true); }}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-2 text-[12px] font-semibold text-slate-700">Try-On</div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {TRYON_PRESETS.map(p => (
                    <PresetCard
                      key={p.id}
                      title={p.title}
                      subtitle={p.subtitle}
                      gradient={p.gradient}
                      onClick={() => { setActive('tryon'); setPendingTryOnPreset(p.config); setShowTryOn(true); }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Workbench */}
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
              {/* Canvas Panel */}
              <section className="rounded-3xl border border-slate-200 bg-white shadow-sm relative">
                {/* header */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 md:px-5 pt-4">
                  <Segmented items={TOOLS} value={active} onChange={setActive} />
                  <div className="flex items-center gap-2">
                    <StepBadge phase={phase} />
                    <button onClick={resetAll} className="text-xs px-2 py-1 rounded-lg border bg-white hover:bg-slate-50">Reset</button>
                  </div>
                </div>

                {/* dropzone / model swap content */}
                {active !== 'modelSwap' ? (
                  <div
                    ref={dropRef}
                    className="m-4 md:m-5 min-h-[280px] md:min-h-[360px] grid place-items-center rounded-2xl border-2 border-dashed border-slate-300/80 bg-slate-50 hover:bg-slate-100 transition cursor-pointer"
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
                        <div className="mx-auto mb-3 grid place-items-center size-12 rounded-full bg-white border border-slate-200">⬆</div>
                        Drag & drop an image here, click to choose, or paste (Ctrl+V)
                      </div>
                    ) : (
                      <div className="relative w-full h-full grid place-items-center p-3">
                        {/* compare overlay */}
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
                          />
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="m-4 md:m-5">
                    <div className="mb-2 text-sm font-semibold">Swap Backend Model</div>
                    <ModelSwapPanel />
                  </div>
                )}

                {/* actions */}
                <div className="flex flex-wrap items-center gap-2 px-4 md:px-5 pb-5">
                  {active !== 'modelSwap' && (
                    <button
                      onClick={handleRun}
                      disabled={!file || busy}
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm font-semibold shadow-sm transition disabled:opacity-50"
                    >
                      {busy ? 'Processing…' : (<><PlayIcon className="size-4" />Run {TOOLS.find(t => t.id === active)?.label}</>)}
                    </button>
                  )}

                  {resultUrl && active !== 'modelSwap' && (
                    <>
                      <button
                        onClick={active === 'removeBg' ? downloadRemoveBgPng : downloadResultAsPng}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                      >
                        ⬇ Download PNG
                      </button>
                      <button
                        onClick={() => setExportOpen(true)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                      >
                        🧰 Export
                      </button>
                      <button
                        onClick={copyUrl}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold hover:bg-slate-50"
                      >
                        🔗 Copy URL
                      </button>
                      <a
                        href={resultUrl} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold hover:bg-slate-50"
                      >
                        ↗ Open
                      </a>
                      {localUrl && (
                        <>
                          <label className="inline-flex items-center gap-2 text-xs ml-2">
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
                      className="pointer-events-none absolute inset-0 rounded-3xl grid place-items-center bg-white/60"
                    >
                      <div className="text-xs px-3 py-2 rounded-lg bg-white border shadow">Working…</div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* API response (collapsible) */}
                {apiResponse && (
                  <div className="px-4 md:px-5 pb-5">
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
              <aside className="rounded-3xl border border-slate-200 bg-white shadow-sm p-4 md:p-5">
                <div className="text-sm font-semibold text-slate-900 mb-3">Inspector</div>

                {active === 'removeBg' && (
                  <div className="space-y-3">
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

                    <Field label="Radius"><Range value={radius} onChange={setRadius} min={0} max={48} /></Field>
                    <Field label="Padding"><Range value={padding} onChange={setPadding} min={0} max={64} /></Field>

                    <label className="mt-1 inline-flex items-center gap-2 text-xs text-slate-700">
                      <input type="checkbox" checked={shadow} onChange={(e)=>setShadow(e.target.checked)} />
                      Shadow
                    </label>

                    <div className="mt-4">
                      <div className="text-xs text-slate-500 mb-2">Final Preview</div>
                      <div style={frameStyle} className="relative rounded-xl overflow-hidden border border-slate-200">
                        <div className="relative w-full min-h-[160px] grid place-items-center">
                          {resultUrl ? (
                            <img src={resultUrl} alt="final" className="max-w-full max-h-[40vh] object-contain" />
                          ) : (
                            <div className="grid place-items-center h-[160px] text-xs text-slate-400">— Run Remove BG first —</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {active === 'enhance' && (
                  <div className="space-y-2 text-xs text-slate-600">
                    <div>اضغط <span className="font-semibold">Run</span> لفتح نافذة الإعدادات — أو اختر Preset من الأعلى.</div>
                    <div className="mt-3 text-[11px] text-slate-500">Model: {models.find(m=>m.id===backendModel)?.name || backendModel || '—'}</div>
                    {resultUrl && (
                      <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                        <div className="relative w-full min-h-[160px] grid place-items-center">
                          <img src={resultUrl} alt="final" className="max-w-full max-h-[40vh] object-contain" />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {active === 'tryon' && (
                  <div className="space-y-2 text-xs text-slate-600">
                    <div>اختر Preset من قسم Try-On أو اضغط <span className="font-semibold">Run</span>.</div>
                    <div className="mt-3 text-[11px] text-slate-500">Model: {models.find(m=>m.id===backendModel)?.name || backendModel || '—'}</div>
                    {resultUrl && (
                      <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                        <div className="relative w-full min-h-[160px] grid place-items-center">
                          <img src={resultUrl} alt="final" className="max-w-full max-h-[40vh] object-contain" />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {active === 'modelSwap' && (
                  <div className="text-xs text-slate-600">
                    اختر الـ Backend المناسب — يتم الحفظ تلقائيًا على حسابك.
                  </div>
                )}
              </aside>
            </div>

            {/* History */}
            <div id="history-anchor" className="rounded-3xl border border-slate-200 bg-white shadow-sm p-4 md:p-5">
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

        {/* ===== Modals ===== */}
        <AnimatePresence>
          {showEnhance && (
            <motion.div className="fixed inset-0 z-[100] grid place-items-center"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="absolute inset-0 bg-black/55" onClick={()=>setShowEnhance(false)} />
              <div className="relative w-full max-w-3xl">
                <EnhanceCustomizer
                  initial={pendingEnhancePreset || undefined}
                  onChange={()=>{}}
                  onComplete={(form) => { setShowEnhance(false); setPendingEnhancePreset(null); runEnhance(form); }}
                />
              </div>
            </motion.div>
          )}
          {showTryOn && (
            <motion.div className="fixed inset-0 z-[100] grid place-items-center"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="absolute inset-0 bg-black/55" onClick={()=>setShowTryOn(false)} />
              <div className="relative w-full max-w-3xl">
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
        <ExportDrawer
          open={exportOpen}
          onClose={() => setExportOpen(false)}
          cutoutUrl={resultUrl}
          defaultName="asset"
        />
      </main>
    </Layout>
  );
}

/* ================== Sidebar bits ================== */
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

/* ================== UI bits ================== */
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

function PresetCard({ title, subtitle, onClick, gradient }) {
  return (
    <button onClick={onClick}
      className="group relative rounded-2xl overflow-hidden border border-slate-200 hover:border-slate-300 bg-white shadow-sm transition text-left">
      <div className={`h-36 w-full bg-gradient-to-br ${gradient}`} />
      <div className="p-3">
        <div className="font-semibold">{title}</div>
        <div className="text-xs text-slate-500">{subtitle}</div>
      </div>
      <div className="absolute top-3 right-3 rounded-full bg-white/80 backdrop-blur px-2 py-1 text-[11px] border border-white shadow-sm">
        Use preset
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

/* ---------- form controls ---------- */
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

/* ---------- removeBG mode tabs ---------- */
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

/* ---------- icons ---------- */
function ScissorsIcon(props){return(<svg viewBox="0 0 24 24" className={props.className||''}><path d="M14.7 6.3a1 1 0 1 1 1.4 1.4L13.83 10l2.27 2.27a1 1 0 1 1-1.42 1.42L12.4 11.4l-2.3 2.3a3 3 0 1 1-1.41-1.41l2.3-2.3-2.3-2.3A3 3 0 1 1 10.1 6.3l2.3 2.3 2.3-2.3zM7 17a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0-8a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="currentColor"/></svg>);}
function RocketIcon(props){return(<svg viewBox="0 0 24 24" className={props.className||''}><path d="M5 14s2-6 9-9c0 0 1.5 3.5-1 7 0 0 3.5-1 7-1-3 7-9 9-9 9 0-3-6-6-6-6z" fill="currentColor"/><circle cx="15" cy="9" r="1.5" fill="#fff"/></svg>);}
function PersonIcon(props){return(<svg viewBox="0 0 24 24" className={props.className||''}><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-4.33 0-8 2.17-8 4.5V21h16v-2.5C20 16.17 16.33 14 12 14z" fill="currentColor"/></svg>);}
function CubeIcon(props){return(<svg viewBox="0 0 24 24" className={props.className||''}><path d="M12 2l8 4v12l-8 4-8-4V6l8-4zm0 2.18L6 6.09v.1l6 3 6-3v-.1l-6-1.91zM6 8.4V18l6 3V11.4L6 8.4zm12 0l-6 3V21l6-3V8.4z" fill="currentColor"/></svg>);}
function ImageIcon(props){return(<svg viewBox="0 0 24 24" className={props.className||''}><path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14h18zM5 5h14v10l-4-4-3 3-4-4-3 3V5z" fill="currentColor"/></svg>);}
function GalleryIcon(props){return(<svg viewBox="0 0 24 24" className={props.className||''}><path d="M3 5h7v7H3zM14 5h7v7h-7zM3 16h7v7H3zM14 16h7v7h-7z" transform="scale(.9) translate(1, -2)" fill="currentColor"/></svg>);}
function CodeIcon(props){return(<svg viewBox="0 0 24 24" className={props.className||''}><path d="M8 17l-5-5 5-5 1.5 1.5L6 12l-3.5 3.5L8 17zm8-10l5 5-5 5-1.5-1.5L18 12l-3.5-3.5L16 7z" fill="currentColor"/></svg>);}
function ListIcon(props){return(<svg viewBox="0 0 24 24" className={props.className||''}><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" fill="currentColor"/></svg>);}
function StarIcon(props){return(<svg viewBox="0 0 24 24" className={props.className||''}><path d="M12 2l3.1 6.3 6.9 1-5 4.8 1.2 6.9L12 18l-6.2 3 1.2-6.9-5-4.8 6.9-1L12 2z" fill="currentColor"/></svg>);}
function PlayIcon(props){return(<svg viewBox="0 0 24 24" className={props.className||''}><path d="M8 5v14l11-7z" fill="currentColor"/></svg>);}
function WandIcon(props){return(<svg viewBox="0 0 24 24" className={props.className||''}><path d="M2 20l10-10 2 2L4 22H2zM14 2l2 2-2 2-2-2 2-2z" fill="currentColor"/></svg>);}
