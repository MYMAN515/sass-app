// /pages/dashboard.js
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import Layout from '@/components/Layout';
import EnhanceCustomizer from '@/components/EnhanceCustomizer';
import TryOnCustomizer from '@/components/TryOnCustomizer';
import { Download } from 'lucide-react';

/* ---------- utils ---------- */
const hexToRGBA = (hex, a = 1) => {
  const c = hex?.replace?.('#', '') || '';
  const v = c.length === 3 ? c.replace(/(.)/g, '$1$1') : c;
  if (!v) return `rgba(0,0,0,${a})`;
  const n = parseInt(v, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const fileToOptimizedDataURL = (file, maxSide = 1600, quality = 0.9) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

/* ---------- constants ---------- */
const STORAGE_BUCKET = 'img'; // تأكد أنه Public

/* ---------- studio ---------- */
const TOOLS = [
  { id: 'removeBg', label: 'Remove BG', emoji: '✂️', ready: true },
  { id: 'enhance',  label: 'Enhance',   emoji: '🚀', ready: true },
  { id: 'tryon',    label: 'Try-On',    emoji: '🧍‍♂️', ready: true },
];

export default function DashboardStudio() {
  const router = useRouter();
  const supabase = useMemo(() => createPagesBrowserClient(), []);

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState('Free');
  const [credits, setCredits] = useState(0);
  const [err, setErr] = useState('');

  // tools
  const [active, setActive] = useState('removeBg');
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState('idle'); // idle|processing|ready|error

  // images
  const [file, setFile] = useState(null);
  const [localUrl, setLocalUrl] = useState('');
  const [imageData, setImageData] = useState(''); // removeBg فقط
  const [resultUrl, setResultUrl] = useState('');

  // designer (removeBg فقط)
  const [bgMode, setBgMode] = useState('color'); // color|gradient|pattern
  const [color, setColor] = useState('#0b0b14');
  const [color2, setColor2] = useState('#221a42');
  const [angle, setAngle] = useState(45);
  const [radius, setRadius] = useState(22);
  const [padding, setPadding] = useState(22); // px نسبة للكانفس
  const [shadow, setShadow] = useState(true);
  const [patternOpacity, setPatternOpacity] = useState(0.08);

  // history
  const [history, setHistory] = useState([]);

  // modals
  const [showEnhance, setShowEnhance] = useState(false);
  const [showTryon, setShowTryon] = useState(false);

  // API response (للعرض/النسخ)
  const [apiResponse, setApiResponse] = useState(null);

  /* ---------- auth + workspace ---------- */
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;

      if (!session?.user) { router.replace('/login'); return; }
      setUser(session.user);

      try {
        const { data } = await supabase
          .from('Data')
          .select('plan, credits')
          .eq('email', session.user.email)
          .single();
        setPlan(data?.plan || 'Free');
        setCredits(typeof data?.credits === 'number' ? data.credits : 0);
      } catch {
        setErr('Failed to load workspace.');
      } finally { setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [supabase, router]);

  // credits refresh
  useEffect(() => {
    const h = async () => {
      if (!user?.email) return;
      const { data } = await supabase.from('Data').select('credits').eq('email', user.email).single();
      if (typeof data?.credits === 'number') setCredits(data.credits);
    };
    window.addEventListener('credits:refresh', h);
    return () => window.removeEventListener('credits:refresh', h);
  }, [supabase, user]);

  // drag & drop
  const dropRef = useRef(null);
  useEffect(() => {
    const el = dropRef.current; if (!el) return;
    const over = (e) => { e.preventDefault(); el.classList.add('ring-2','ring-fuchsia-500/60'); };
    const leave = () => el.classList.remove('ring-2','ring-fuchsia-500/60');
    const drop = async (e) => { e.preventDefault(); leave(); const f = e.dataTransfer.files?.[0]; if (f) await onPick(f); };
    el.addEventListener('dragover', over); el.addEventListener('dragleave', leave); el.addEventListener('drop', drop);
    return () => { el.removeEventListener('dragover', over); el.removeEventListener('dragleave', leave); el.removeEventListener('drop', drop); };
  }, []);

  // تغيير الأداة = رفع مستقل (نفضّي كل شي)
  const resetUploadState = useCallback(() => {
    setFile(null);
    setLocalUrl('');
    setImageData('');
    setResultUrl('');
    setPhase('idle');
    setErr('');
    setApiResponse(null);
  }, []);
  useEffect(() => { resetUploadState(); }, [active, resetUploadState]);

  const onPick = async (f) => {
    setFile(f);
    setLocalUrl(URL.createObjectURL(f));
    setResultUrl(''); setPhase('idle'); setErr(''); setApiResponse(null);
    setImageData(await fileToOptimizedDataURL(f, 1600, 0.9));
  };

  const bgStyle = useMemo(() => {
    if (bgMode === 'color') return { background: color };
    if (bgMode === 'gradient') return { background: `linear-gradient(${angle}deg, ${color}, ${color2})` };
    const svg = encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'>
        <defs><pattern id='p' width='24' height='24' patternUnits='userSpaceOnUse'>
          <path d='M0 12h24M12 0v24' stroke='${hexToRGBA(color, patternOpacity)}' stroke-width='1'/>
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
    boxShadow: shadow ? '0 20px 55px rgba(0,0,0,.25), 0 6px 18px rgba(0,0,0,.08)' : 'none',
    transition: 'all .25s ease',
  }), [bgStyle, radius, padding, shadow]);

  /* ---------- helpers ---------- */
  const uploadToStorage = useCallback(async () => {
    if (!file) throw new Error('no file');
    const ext = (file.name?.split('.').pop() || 'png').toLowerCase();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'image/*',
    });
    if (upErr) throw upErr;
    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    if (!data?.publicUrl) throw new Error('no public url');
    return data.publicUrl;
  }, [file, supabase, user]);

  const pickFirstUrl = (obj) => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    const keys = ['image', 'image_url', 'output', 'result', 'url'];
    for (const k of keys) {
      if (obj[k]) return Array.isArray(obj[k]) ? obj[k][0] : obj[k];
    }
    return '';
  };

  const buildEnhancePrompt = (f) =>
    [f?.photographyStyle, `background: ${f?.background}`, `lighting: ${f?.lighting}`, `colors: ${f?.colorStyle}`, f?.realism, `output: ${f?.outputQuality}`]
      .filter(Boolean).join(', ');

  /* ---------- actions ---------- */
  const runRemoveBg = useCallback(async () => {
    setBusy(true); setErr(''); setPhase('processing');
    try {
      const r = await fetch('/api/remove-bg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData }),
      });
      const j = await r.json();
      setApiResponse(j);
      if (!r.ok) throw new Error(j?.error || 'remove-bg failed');
      const out = pickFirstUrl(j);
      if (!out) throw new Error('No output from remove-bg');
      setResultUrl(out);
      setHistory((h) => [{ tool: 'removeBg', inputThumb: localUrl, outputUrl: out, ts: Date.now() }, ...h].slice(0, 8));
      setPhase('ready');
      window.dispatchEvent(new Event('credits:refresh'));
    } catch (e) {
      console.error(e); setPhase('error'); setErr('تعذر تنفيذ العملية.');
    } finally { setBusy(false); }
  }, [imageData, localUrl]);

  const runEnhance = useCallback(async (selections) => {
    setBusy(true); setErr(''); setPhase('processing');
    try {
      const imageUrl = await uploadToStorage();
      const prompt = buildEnhancePrompt(selections);
      const r = await fetch('/api/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, selections, prompt, plan, user_email: user.email }),
      });
      const j = await r.json();
      setApiResponse(j);
      if (!r.ok) throw new Error(j?.error || 'enhance failed');
      const out = pickFirstUrl(j);
      if (!out) throw new Error('No output from enhance');
      setResultUrl(out);
      setHistory((h) => [{ tool: 'enhance', inputThumb: localUrl, outputUrl: out, ts: Date.now() }, ...h].slice(0, 8));
      setPhase('ready');
      window.dispatchEvent(new Event('credits:refresh'));
    } catch (e) {
      console.error(e); setPhase('error'); setErr('تعذر تنفيذ العملية.');
    } finally { setBusy(false); }
  }, [uploadToStorage, plan, user, localUrl]);

  const runTryOn = useCallback(async (selections) => {
    setBusy(true); setErr(''); setPhase('processing');
    try {
      const imageUrl = await uploadToStorage();
      const r = await fetch('/api/tryon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, selections, plan, user_email: user.email }),
      });
      const j = await r.json();
      setApiResponse(j);
      if (!r.ok) throw new Error(j?.error || 'tryon failed');
      const out = pickFirstUrl(j);
      if (!out) throw new Error('No output from try-on');
      setResultUrl(out);
      setHistory((h) => [{ tool: 'tryon', inputThumb: localUrl, outputUrl: out, ts: Date.now() }, ...h].slice(0, 8));
      setPhase('ready');
      window.dispatchEvent(new Event('credits:refresh'));
    } catch (e) {
      console.error(e); setPhase('error'); setErr('تعذر تنفيذ العملية.');
    } finally { setBusy(false); }
  }, [uploadToStorage, plan, user, localUrl]);

  const handleRun = useCallback(() => {
    if (!file) { setErr('اختر صورة أولاً'); return; }
    if (active === 'removeBg') { runRemoveBg(); return; }
    if (active === 'enhance')  { setShowEnhance(true); return; }
    if (active === 'tryon')    { setShowTryon(true); return; }
  }, [active, file, runRemoveBg]);

  /* ---------- download composer (PNG مع تطبيق الإعدادات) ---------- */
  const composeAndDownload = useCallback(async () => {
    if (!resultUrl) return;

    // حمّل الصورة كـ Blob لتفادي مشاكل CORS في toDataURL
    const blob = await fetch(resultUrl, { cache: 'no-store' }).then(r => r.blob());

    // ImageBitmap إن توفر، وإلا HTMLImage من object URL
    let bmp, imgEl, w, h;
    if ('createImageBitmap' in window) {
      bmp = await createImageBitmap(blob);
      w = bmp.width; h = bmp.height;
    } else {
      imgEl = new Image();
      imgEl.src = URL.createObjectURL(blob);
      await new Promise((res, rej) => { imgEl.onload = res; imgEl.onerror = rej; });
      w = imgEl.naturalWidth; h = imgEl.naturalHeight;
    }

    // حجم ناتج منطقي (نحدّه 2048 عشان الأداء/الحجم)
    const maxSide = Math.min(2048, Math.max(w, h));
    const canvas = document.createElement('canvas');
    canvas.width = maxSide; canvas.height = maxSide;
    const ctx = canvas.getContext('2d');

    // خلفية/تصميم (نطبّقه فقط لو الأداة removeBg)
    if (active === 'removeBg') {
      if (bgMode === 'color') {
        ctx.fillStyle = color; ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (bgMode === 'gradient') {
        const rad = (angle * Math.PI) / 180, x = Math.cos(rad), y = Math.sin(rad);
        const g = ctx.createLinearGradient(
          canvas.width * (1 - x) / 2, canvas.height * (1 - y) / 2,
          canvas.width * (1 + x) / 2, canvas.height * (1 + y) / 2
        );
        g.addColorStop(0, color); g.addColorStop(1, color2);
        ctx.fillStyle = g; ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        // pattern grid
        ctx.fillStyle = color; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = hexToRGBA(color, patternOpacity); ctx.lineWidth = 1;
        for (let i = 0; i <= canvas.width; i += 24) {
          ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
        }
      }
    } else {
      // للأدوات الأخرى: خلفية شفافة PNG (لا نملأ شيء)
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // إعدادات الإطار/القص
    const pad = Math.round(canvas.width * (padding / 300)); // نفس منطق المعاينة
    const boxW = canvas.width - pad * 2;
    const boxH = canvas.height - pad * 2;
    const ratio = Math.min(boxW / w, boxH / h);
    const dw = Math.round(w * ratio);
    const dh = Math.round(h * ratio);
    const dx = Math.round((canvas.width - dw) / 2);
    const dy = Math.round((canvas.height - dh) / 2);

    // قص بزوايا دائرية للإطار بالكامل (يشمل الصورة)
    const r = Math.max(0, Math.min(radius, 64));
    const roundedRect = (x, y, w, h, rad) => {
      const rr = Math.min(rad, w/2, h/2);
      ctx.beginPath();
      ctx.moveTo(x + rr, y);
      ctx.arcTo(x + w, y, x + w, y + h, rr);
      ctx.arcTo(x + w, y + h, x, y + h, rr);
      ctx.arcTo(x, y + h, x, y, rr);
      ctx.arcTo(x, y, x + w, y, rr);
      ctx.closePath();
    };

    ctx.save();
    roundedRect(0, 0, canvas.width, canvas.height, r);
    ctx.clip();

    // ظل للصورة فقط (اختياري)
    if (active === 'removeBg' && shadow) {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.25)';
      ctx.shadowBlur = Math.round(canvas.width * 0.02);
      ctx.shadowOffsetX = Math.round(canvas.width * 0.005);
      ctx.shadowOffsetY = Math.round(canvas.width * 0.01);
      if (bmp) ctx.drawImage(bmp, dx, dy, dw, dh);
      else ctx.drawImage(imgEl, dx, dy, dw, dh);
      ctx.restore();
    } else {
      if (bmp) ctx.drawImage(bmp, dx, dy, dw, dh);
      else ctx.drawImage(imgEl, dx, dy, dw, dh);
    }

    ctx.restore();

    // نزّل كـ PNG
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `studio-output.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    // تنظيف
    if (imgEl?.src?.startsWith('blob:')) URL.revokeObjectURL(imgEl.src);
  }, [resultUrl, active, bgMode, color, color2, angle, patternOpacity, padding, radius, shadow]);

  /* ---------- UI ---------- */

  if (loading || !user) {
    return (
      <Layout title="Studio">
        <main className="min-h-screen bg-[#0b0519] text-white grid place-items-center">
          <div className="text-white/70">Loading your studio…</div>
        </main>
      </Layout>
    );
  }

  const initials = (() => {
    const n = user?.user_metadata?.name || user?.email || 'U';
    const p = n.split(' ').filter(Boolean);
    return ((p[0]?.[0] || n[0]) + (p[1]?.[0] || '')).toUpperCase();
  })();

  return (
    <Layout title="Studio">
      <main className="min-h-screen relative overflow-hidden bg-[radial-gradient(90%_80%_at_50%_-10%,#221a42_0%,#0b0b14_55%,#05060a_100%)] text-white">
        <BGFX />
        <TopBar userName={user.user_metadata?.name || user.email} plan={plan} credits={credits} initials={initials} />

        <section className="max-w-7xl mx-auto px-4 md:px-8 pb-16">
          {/* على الموبايل: الشبكة تتحول لعمود */}
          <div className="grid gap-6 md:grid-cols-[220px_1fr_340px]">
            {/* Tools */}
            <aside className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-3 h-fit">
              <div className="px-2 py-1 text-xs text-white/60">Tools</div>
              <div className="mt-2 space-y-1">
                {TOOLS.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setActive(t.id); setErr(''); setPhase('idle'); }}
                    className={[
                      'w-full text-left rounded-xl px-3 py-2 text-sm flex items-center gap-2 transition',
                      active === t.id ? 'bg-white text-black font-semibold' : 'border border-white/15 bg-white/10 hover:bg-white/15',
                    ].join(' ')}
                    title={t.label}
                  >
                    <span className="text-base">{t.emoji}</span>{t.label}
                  </button>
                ))}
              </div>
            </aside>

            {/* Canvas */}
            <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-3">
              <div className="flex items-center justify-between px-1 pb-2">
                <div className="text-sm font-semibold">{TOOLS.find(t => t.id === active)?.label}</div>
                <StepBadge phase={phase} />
              </div>

              {/* منطقة الرفع/المعاينة */}
              <div
                ref={dropRef}
                className="group relative grid place-items-center aspect-[16/10] rounded-xl border-2 border-dashed border-white/15 bg-white/5 hover:bg-white/[.08] transition cursor-pointer overflow-hidden"
                onClick={() => document.getElementById('file-input')?.click()}
                title="Drag & drop or click to upload"
              >
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => { const f = e.target.files?.[0]; if (f) await onPick(f); }}
                />
                {!localUrl && !resultUrl ? (
                  <div className="text-center text-white/70">
                    <div className="mx-auto mb-3 grid place-items-center size-12 rounded-full bg-white/10">⬆</div>
                    اسحب ملفًا هنا أو اضغط للاختيار
                  </div>
                ) : (
                  <div className="w-full h-full grid place-items-center p-2">
                    {/* عرض الصورة بالكامل بدون قص */}
                    <img
                      src={resultUrl || localUrl}
                      alt="preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  onClick={handleRun}
                  disabled={!file || busy}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold shadow transition disabled:opacity-50"
                >
                  {busy ? 'Processing…' : `Run ${TOOLS.find(t => t.id === active)?.label}`}
                </button>

                <button
                  onClick={composeAndDownload}
                  disabled={!resultUrl}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15 disabled:opacity-50"
                  title="Download PNG"
                >
                  <Download className="w-4 h-4" /> Download PNG
                </button>

                {err && <div className="text-xs text-rose-300">{err}</div>}
              </div>

              {/* Response (يتكيف مع الموبايل) */}
              {apiResponse && (
                <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-semibold text-white/80">Response</div>
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(JSON.stringify(apiResponse, null, 2));
                      }}
                      className="text-[11px] rounded-md border border-white/20 bg-white/10 px-2 py-1 hover:bg-white/15"
                    >
                      Copy JSON
                    </button>
                  </div>
                  <pre className="max-h-52 overflow-auto text-[11px] leading-5 whitespace-pre-wrap break-words text-white/80">
                    {JSON.stringify(apiResponse, null, 2)}
                  </pre>
                </div>
              )}
            </section>

            {/* Inspector */}
            <aside className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-3 h-fit">
              <div className="px-1 pb-2 text-sm font-semibold">Inspector</div>

              {active === 'removeBg' ? (
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
                    <Field label="Pattern opacity"><Range value={patternOpacity} onChange={setPatternOpacity} min={0} max={0.5} step={0.01} /></Field>
                  )}
                  <Field label="Radius"><Range value={radius} onChange={setRadius} min={0} max={64} /></Field>
                  <Field label="Padding"><Range value={padding} onChange={setPadding} min={0} max={64} /></Field>
                  <label className="mt-1 inline-flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={shadow} onChange={(e)=>setShadow(e.target.checked)} />
                    Shadow
                  </label>

                  {/* Final Preview */}
                  <div className="mt-4">
                    <div className="text-xs text-white/60 mb-2">Final Preview</div>
                    <div style={frameStyle} className="relative">
                      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg grid place-items-center">
                        {resultUrl ? (
                          <img src={resultUrl} alt="final" className="max-w-full max-h-full object-contain" />
                        ) : (
                          <div className="grid place-items-center h-full text-xs text-white/50">
                            — أزل الخلفية أولًا —
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // للأدوات الأخرى: عرض معاينة نهائية بسيطة
                <div className="space-y-3">
                  <div className="text-xs text-white/60">Final Preview</div>
                  <div className="rounded-xl border border-white/10 bg-white/10 p-2">
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-md grid place-items-center">
                      {resultUrl ? (
                        <img src={resultUrl} alt="final" className="max-w-full max-h-full object-contain" />
                      ) : (
                        <div className="grid place-items-center h-full text-xs text-white/50">
                          — شغّل الأداة أولًا —
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-[11px] text-white/60">
                    * إعدادات الخلفية/الإطار تنطبق على Remove BG فقط. التنزيل دائمًا PNG.
                  </div>
                </div>
              )}
            </aside>
          </div>

          {/* History */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-3">
            <div className="px-1 pb-2 text-sm font-semibold">History</div>
            {history.length === 0 ? (
              <div className="text-xs text-white/60 px-1 py-4">— No renders yet —</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {history.map((h, i) => (
                  <button
                    key={i}
                    onClick={() => setResultUrl(h.outputUrl)}
                    className="group relative rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition"
                  >
                    <img src={h.outputUrl || h.inputThumb} alt="hist" className="w-full h-28 object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 text-[10px] px-2 py-1 bg-black/40 backdrop-blur">
                      {h.tool} • {new Date(h.ts).toLocaleTimeString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ===== Modals ===== */}
        <AnimatePresence>
          {showEnhance && (
            <motion.div className="fixed inset-0 z-[100] grid place-items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="absolute inset-0 bg-black/60" onClick={()=>setShowEnhance(false)} />
              <div className="relative w-full max-w-3xl">
                <EnhanceCustomizer onChange={()=>{}} onComplete={(form) => { setShowEnhance(false); runEnhance(form); }} />
              </div>
            </motion.div>
          )}

          {showTryon && (
            <motion.div className="fixed inset-0 z-[100] grid place-items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="absolute inset-0 bg-black/60" onClick={()=>setShowTryon(false)} />
              <div className="relative w-full max-w-3xl">
                <TryOnCustomizer onChange={()=>{}} onComplete={(form) => { setShowTryon(false); runTryOn(form); }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* toast */}
        <AnimatePresence>
          {err && (
            <motion.div
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[120] rounded-xl border border-rose-400/30 bg-rose-500/10 text-rose-200 px-4 py-2 text-sm backdrop-blur"
            >
              {err}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </Layout>
  );
}

/* ---------- small UI ---------- */
function TopBar({ userName, plan, credits, initials }) {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-4 sm:px-6 py-3">
        <div className="flex items-center gap-3">
          <Logo />
          <div className="hidden sm:block">
            <div className="text-xs text-white/70">Workspace</div>
            <div className="text-base font-semibold tracking-tight">{userName}</div>
          </div>
          <span className="ml-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs">
            <span className="inline-block size-2 rounded-full bg-emerald-400" />
            Plan: <strong className="font-semibold">{plan}</strong>
          </span>
          <span className="ml-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs">
            Credits: <strong className="font-semibold">{credits}</strong>
          </span>
        </div>
        <div className="inline-flex items-center justify-center size-9 rounded-full bg-white/10 border border-white/15 font-bold">
          {initials}
        </div>
      </div>
    </div>
  );
}

function Logo() {
  return (
    <div className="inline-flex items-center gap-2">
      <div className="grid place-items-center size-9 rounded-xl bg-gradient-to-br from-fuchsia-500 to-indigo-500 shadow-lg">
        <svg width="18" height="18" viewBox="0 0 24 24" className="text-white">
          <path d="M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" fill="currentColor" />
        </svg>
      </div>
      <span className="font-semibold tracking-tight">AI Studio</span>
    </div>
  );
}

function BGFX() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0b0519] via-[#1c0c35] to-[#0e031a]" />
      <motion.div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-purple-600/40 blur-[120px]"
                  animate={{ y: [0, 20, 0], x: [0, 10, 0], opacity: [0.35, 0.5, 0.35] }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="pointer-events-none absolute -bottom-20 -right-20 w-[22rem] h-[22rem] rounded-full bg-fuchsia-600/30 blur-[140px]"
                  animate={{ y: [0, -15, 0], x: [0, -12, 0], opacity: [0.25, 0.45, 0.25] }}
                  transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} />
      <div className="pointer-events-none absolute inset-0 opacity-[.06]"
           style={{ backgroundImage:'linear-gradient(to right, rgba(255,255,255,.45) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.45) 1px, transparent 1px)', backgroundSize:'44px 44px' }} />
    </>
  );
}

function StepBadge({ phase }) {
  const map = { idle:{label:'Ready',color:'bg-white/10'}, processing:{label:'Processing',color:'bg-indigo-400/20'}, ready:{label:'Done',color:'bg-emerald-400/20'}, error:{label:'Error',color:'bg-rose-400/20'} };
  const it = map[phase] || map.idle;
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs ${it.color} border border-white/10`}>
      <span className={`inline-block size-2 rounded-full ${phase==='processing'?'bg-white animate-pulse':'bg-white/70'}`} />
      {it.label}
    </span>
  );
}

function ModeTabs({ mode, setMode }) {
  return (
    <div className="mb-1 flex flex-wrap gap-2">
      <Tab active={mode==='color'} onClick={()=>setMode('color')}>Color</Tab>
      <Tab active={mode==='gradient'} onClick={()=>setMode('gradient')}>Gradient</Tab>
      <Tab active={mode==='pattern'} onClick={()=>setMode('pattern')}>Pattern</Tab>
    </div>
  );
}
function Tab({ active, children, onClick }) {
  return <button onClick={onClick} type="button" className={['rounded-lg px-3 py-1.5 text-xs font-semibold transition', active?'bg-white text-black':'border border-white/15 bg-white/10 hover:bg-white/15'].join(' ')}>{children}</button>;
}
function Field({ label, children }) { return <label className="flex items-center justify-between gap-3 text-xs"><span className="min-w-28 text-white/70">{label}</span><div className="flex-1">{children}</div></label>; }
function Color({ value, onChange }) { return (<div className="flex items-center gap-2"><input type="color" value={value} onChange={(e)=>onChange(e.target.value)} /><input className="w-full rounded-lg border border-white/15 bg-white/10 px-2 py-1" value={value} onChange={(e)=>onChange(e.target.value)} /></div>); }
function Range({ value, onChange, min, max, step=1 }) { return (<div className="flex items-center gap-2"><input type="range" value={value} min={min} max={max} step={step} onChange={(e)=>onChange(Number(e.target.value))} className="w-full" /><span className="w-10 text-right">{typeof value==='number'?value:''}</span></div>); }
