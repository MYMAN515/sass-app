// app/remove-bg-studio/page.jsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';

/* ---------------- Helpers ---------------- */
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const hexToRGBA = (hex, a = 1) => {
  const c = hex.replace('#', '');
  const v = c.length === 3 ? c.replace(/(.)/g, '$1$1') : c;
  const n = parseInt(v, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

/* ====================================================== */
/* =============== Remove BG Studio (Page) ============== */
/* ====================================================== */
export default function RemoveBgStudioPage() {
  const [supabase] = useState(()=>createBrowserSupabaseClient());

  // Auth
  const [sessionEmail, setSessionEmail] = useState('');
  const [authChecked, setAuthChecked] = useState(false);

  // File & URLs
  const [file, setFile] = useState(null);
  const [localUrl, setLocalUrl] = useState('');
  const [publicUrl, setPublicUrl] = useState('');
  const [cutoutUrl, setCutoutUrl] = useState('');

  // UI state
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState('idle'); // idle | upload | processing | ready | error
  const [msg, setMsg] = useState('');

  // BG Designer
  const [mode, setMode] = useState('color'); // color | gradient | pattern
  const [color, setColor] = useState('#0b0b14');
  const [color2, setColor2] = useState('#221a42'); // gradient second
  const [angle, setAngle] = useState(45);
  const [radius, setRadius] = useState(28);
  const [padding, setPadding] = useState(24);
  const [shadow, setShadow] = useState(true);
  const [patternOpacity, setPatternOpacity] = useState(0.08);

  // DnD
  const dropRef = useRef(null);

  /* ---------- Session ---------- */
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) setSessionEmail(session.user.email);
      setAuthChecked(true);
    })();
  }, [supabase]);

  /* ---------- Drag & Drop ---------- */
  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;
    const over = (e) => { e.preventDefault(); el.classList.add('ring-2','ring-fuchsia-500/60'); };
    const leave = () => el.classList.remove('ring-2','ring-fuchsia-500/60');
    const drop = (e) => { e.preventDefault(); leave(); const f = e.dataTransfer.files?.[0]; if (f) onPick(f); };
    el.addEventListener('dragover', over);
    el.addEventListener('dragleave', leave);
    el.addEventListener('drop', drop);
    return () => { el.removeEventListener('dragover', over); el.removeEventListener('dragleave', leave); el.removeEventListener('drop', drop); };
  }, []);

  /* ---------- Background CSS ---------- */
  const bgStyle = useMemo(() => {
    if (mode === 'color') return { background: color };
    if (mode === 'gradient') return { background: `linear-gradient(${angle}deg, ${color}, ${color2})` };
    // pattern SVG
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
  }, [mode, color, color2, angle, patternOpacity]);

  const containerStyle = useMemo(() => ({
    ...bgStyle,
    borderRadius: `${radius}px`,
    padding: `${padding}px`,
    boxShadow: shadow ? '0 18px 50px rgba(0,0,0,.25), 0 6px 18px rgba(0,0,0,.08)' : 'none',
    transition: 'all .25s ease'
  }), [bgStyle, radius, padding, shadow]);

  /* ---------- Handlers ---------- */
  const onPick = (f) => {
    setFile(f);
    setLocalUrl(URL.createObjectURL(f));
    setPublicUrl('');
    setCutoutUrl('');
    setPhase('idle');
    setMsg('');
  };

  const uploadToSupabase = async () => {
    setPhase('upload');
    try {
      const fileName = `${Date.now()}-${file.name}`;
      // NOTE: bucket "img" يجب أن يكون موجود + Public
      const { data, error } = await supabase.storage.from('img').upload(fileName, file, { upsert: true, cacheControl: '3600' });
      if (error) throw error;
      const { data: pub } = supabase.storage.from('img').getPublicUrl(data.path);
      setPublicUrl(pub.publicUrl);
      return pub.publicUrl;
    } catch (e) {
      console.error(e);
      setMsg('فشل رفع الملف إلى Supabase Storage. تأكد أن الباكت "img" موجود ومتاح للعامة.');
      throw e;
    }
  };

  const callRemoveBg = async (imageUrl) => {
    setPhase('processing');
    const r = await fetch('/api/remove-bg', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // الـ API سيستخرج الإيميل من الجلسة ويخصم الكريدت عند النجاح
      body: JSON.stringify({ imageUrl })
    });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error || 'failed');
    return Array.isArray(j.image) ? j.image[0] : j.image;
  };

  const run = async () => {
    if (!file) { setMsg('اختر صورة أولًا'); return; }
    if (!sessionEmail && authChecked) { setMsg('سجّل دخولك أولًا.'); return; }
    setBusy(true); setMsg('');
    try {
      const url = publicUrl || await uploadToSupabase(); // ارفع إذا ما عندنا URL عام
      const cut = await callRemoveBg(url);               // إزالة الخلفية
      setCutoutUrl(cut);
      setPhase('ready');
      // بلّغ النافبار يحدّث الرصيد (لو مركّب الـ listener)
      window.dispatchEvent(new Event('credits:refresh'));
    } catch (e) {
      console.error(e);
      setPhase('error');
      setMsg('تعذر إكمال العملية. جرّب صورة أخرى لاحقًا.');
    } finally {
      setBusy(false);
    }
  };

  const composeAndDownload = async () => {
    if (!cutoutUrl) return;
    // دمج الخلفية المخصصة مع صورة المنتج (شفافة) وتصدير PNG
    const blob = await fetch(cutoutUrl, { cache: 'no-store' }).then(r => r.blob());
    const bmp = await createImageBitmap(blob);
    const size = Math.max(bmp.width, bmp.height);
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');

    // خلفية
    if (mode === 'color') {
      ctx.fillStyle = color; ctx.fillRect(0, 0, size, size);
    } else if (mode === 'gradient') {
      const rad = (angle * Math.PI) / 180;
      const x = Math.cos(rad), y = Math.sin(rad);
      const g = ctx.createLinearGradient(size*(1-x)/2, size*(1-y)/2, size*(1+x)/2, size*(1+y)/2);
      g.addColorStop(0, color); g.addColorStop(1, color2);
      ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
    } else {
      ctx.fillStyle = color; ctx.fillRect(0, 0, size, size);
      ctx.strokeStyle = hexToRGBA(color, patternOpacity); ctx.lineWidth = 1;
      for (let i = 0; i <= size; i += 24) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, size); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(size, i); ctx.stroke();
      }
    }

    // رسم المنتج داخل مساحة padded مع الحفاظ على التناسب
    const pad = Math.round(size * (padding / 300));
    const boxW = size - pad * 2, boxH = size - pad * 2;
    const ratio = Math.min(boxW / bmp.width, boxH / bmp.height);
    const dw = bmp.width * ratio, dh = bmp.height * ratio;
    const dx = (size - dw) / 2, dy = (size - dh) / 2;
    ctx.drawImage(bmp, dx, dy, dw, dh);

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a'); a.href = url; a.download = 'product.png'; a.click();
  };

  /* ---------- UI ---------- */
  return (
    <main className="min-h-[100svh] bg-[radial-gradient(90%_80%_at_50%_-10%,#221a42_0%,#0b0b14_55%,#05060a_100%)] text-white">
      {/* Header */}
      <div className="mx-auto max-w-6xl px-6 pt-24 pb-8">
        <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5 }}
          className="text-3xl md:text-4xl font-extrabold tracking-tight">
          ✂️ Remove BG <span className="text-fuchsia-400">Studio</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .05 }}
          className="mt-2 text-sm text-white/70 max-w-2xl">
          ارفع صورة، أزل الخلفية خلال ثوانٍ، واختر خلفية (لون/جراديانت/نمط) ثم نزّل النتيجة — تجربة سريعة وحديثة.
        </motion.p>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left: Upload & Result */}
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .4 }}>
            <div className="relative rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-lg">
              <div className="mb-3 flex items-center justify-between">
                <label className="block text-sm font-medium">Upload</label>
                <StepBadge phase={phase} />
              </div>

              {/* Dropzone */}
              <div
                ref={dropRef}
                className="group relative grid place-items-center aspect-video rounded-xl border-2 border-dashed border-white/15 bg-white/5 hover:bg-white/[.08] transition cursor-pointer"
                title="Drag & drop or click to upload"
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <input id="file-input" type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) onPick(f); }} />
                {!localUrl ? (
                  <div className="text-center text-white/70">
                    <div className="mx-auto mb-3 grid place-items-center size-12 rounded-full bg-white/10">⬆</div>
                    اسحب ملفًا هنا أو اضغط للاختيار
                  </div>
                ) : (
                  <img src={localUrl} alt="preview" className="w-full h-full object-contain rounded-lg" />
                )}
              </div>

              {/* Controls */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-2.5 py-1 text-xs">
                  Model: <strong className="font-semibold">851-labs / background-remover</strong>
                </span>
                <button
                  onClick={run}
                  disabled={!file || busy}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold shadow transition disabled:opacity-50"
                >
                  {busy ? 'Processing…' : 'Remove Background'}
                </button>
                <AnimatePresence>
                  {phase === 'processing' && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-xs text-white/70">جاري المعالجة…</motion.span>
                  )}
                </AnimatePresence>
              </div>

              {msg && <div className="mt-2 text-xs text-rose-300">{msg}</div>}

              {/* Result (transparent) */}
              <div className="mt-4">
                <label className="block text-sm mb-2 font-medium">Result (Transparent)</label>
                <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-white/5">
                  {cutoutUrl ? (
                    <img src={cutoutUrl} alt="cutout" className="w-full h-full object-contain" />
                  ) : (
                    <div className="grid place-items-center h-full text-xs text-white/50">— لا توجد نتيجة بعد —</div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Designer & Download */}
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .4 }}>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-lg">
              <label className="block text-sm mb-2 font-medium">Background & Layout</label>

              {/* Modes */}
              <div className="mb-3 flex flex-wrap gap-2">
                <Tab active={mode==='color'} onClick={()=>setMode('color')}>Color</Tab>
                <Tab active={mode==='gradient'} onClick={()=>setMode('gradient')}>Gradient</Tab>
                <Tab active={mode==='pattern'} onClick={()=>setMode('pattern')}>Pattern</Tab>
              </div>

              {/* Controls */}
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Primary"><Color value={color} onChange={setColor} /></Field>
                {mode === 'gradient' && (
                  <>
                    <Field label="Secondary"><Color value={color2} onChange={setColor2} /></Field>
                    <Field label="Angle"><Range value={angle} onChange={setAngle} min={0} max={360} /></Field>
                  </>
                )}
                {mode === 'pattern' && (
                  <Field label="Pattern opacity">
                    <Range value={patternOpacity} onChange={setPatternOpacity} min={0} max={0.5} step={0.01} />
                  </Field>
                )}
                <Field label="Radius"><Range value={radius} onChange={setRadius} min={0} max={48} /></Field>
                <Field label="Padding"><Range value={padding} onChange={setPadding} min={0} max={64} /></Field>
                <label className="mt-1 inline-flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={shadow} onChange={(e)=>setShadow(e.target.checked)} />
                  Shadow
                </label>
              </div>

              {/* Final preview with BG */}
              <div className="mt-4">
                <label className="block text-sm mb-2 font-medium">Final Preview</label>
                <div style={containerStyle} className="relative">
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                    {cutoutUrl ? (
                      <img src={cutoutUrl} alt="final" className="w-full h-full object-contain" />
                    ) : (
                      <div className="grid place-items-center h-full text-xs text-white/50">— أزل الخلفية أولًا —</div>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    disabled={!cutoutUrl}
                    onClick={composeAndDownload}
                    className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15 disabled:opacity-50"
                  >
                    Download PNG
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* background grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[.04] hidden dark:block"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.7) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
    </main>
  );
}

/* ---------------- Tiny UI atoms ---------------- */
function StepBadge({ phase }) {
  const map = {
    idle: { label: 'Ready', color: 'bg-white/10' },
    upload: { label: 'Uploading', color: 'bg-amber-400/20' },
    processing: { label: 'Processing', color: 'bg-indigo-400/20' },
    ready: { label: 'Done', color: 'bg-emerald-400/20' },
    error: { label: 'Error', color: 'bg-rose-400/20' },
  };
  const item = map[phase] || map.idle;
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs ${item.color} border border-white/10`}>
      <Dot phase={phase} />
      {item.label}
    </span>
  );
}
function Dot({ phase }) {
  const pulse = phase === 'processing' || phase === 'upload';
  return (
    <span className={`inline-block size-2 rounded-full ${pulse ? 'bg-white animate-pulse' : 'bg-white/70'}`} />
  );
}
function Tab({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={[
        'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
        active ? 'bg-white text-black' : 'border border-white/15 bg-white/10 hover:bg-white/15'
      ].join(' ')}
    >
      {children}
    </button>
  );
}
function Field({ label, children }) {
  return (
    <label className="flex items-center justify-between gap-3 text-xs">
      <span className="min-w-28 text-white/70">{label}</span>
      <div className="flex-1">{children}</div>
    </label>
  );
}
function Color({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <input type="color" value={value} onChange={(e)=>onChange(e.target.value)} />
      <input
        className="w-full rounded-lg border border-white/15 bg-white/10 px-2 py-1"
        value={value} onChange={(e)=>onChange(e.target.value)}
      />
    </div>
  );
}
function Range({ value, onChange, min, max, step=1 }) {
  return (
    <div className="flex items-center gap-2">
      <input type="range" value={value} min={min} max={max} step={step}
        onChange={(e)=>onChange(Number(e.target.value))} className="w-full" />
      <span className="w-10 text-right">{typeof value === 'number' ? value : ''}</span>
    </div>
  );
}
