// app/remove-bg-studio/page.jsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

/* ===== Helpers ===== */
const hexToRGBA = (hex, a = 1) => {
  const c = hex.replace('#', '');
  const v = c.length === 3 ? c.replace(/(.)/g, '$1$1') : c;
  const int = parseInt(v, 16);
  const r = (int >> 16) & 255, g = (int >> 8) & 255, b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export default function RemoveBgStudioPage() {
  const supabase = createClientComponentClient();
  const [file, setFile] = useState(null);
  const [localUrl, setLocalUrl] = useState('');
  const [publicUrl, setPublicUrl] = useState('');
  const [outUrl, setOutUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState('idle'); // idle|upload|processing|ready|error
  const [msg, setMsg] = useState('');

  // BG designer
  const [mode, setMode] = useState('color'); // color | gradient | pattern
  const [color, setColor] = useState('#0b0b14');
  const [color2, setColor2] = useState('#221a42');
  const [angle, setAngle] = useState(45);
  const [radius, setRadius] = useState(28);
  const [padding, setPadding] = useState(24);
  const [shadow, setShadow] = useState(true);
  const [patternOpacity, setPatternOpacity] = useState(0.08);
  const [engine, setEngine] = useState('best'); // best|fast

  const dropRef = useRef(null);

  /* ===== Background CSS ===== */
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
    boxShadow: shadow ? '0 14px 40px rgba(0,0,0,.2), 0 4px 14px rgba(0,0,0,.08)' : 'none',
    transition: 'all .25s ease'
  }), [bgStyle, radius, padding, shadow]);

  /* ===== Drag & Drop ===== */
  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;
    const over = (e) => { e.preventDefault(); el.classList.add('ring-2','ring-fuchsia-500/60'); };
    const leave = () => el.classList.remove('ring-2','ring-fuchsia-500/60');
    const drop = (e) => {
      e.preventDefault(); leave();
      const f = e.dataTransfer.files?.[0]; if (f) onPick(f);
    };
    el.addEventListener('dragover', over);
    el.addEventListener('dragleave', leave);
    el.addEventListener('drop', drop);
    return () => {
      el.removeEventListener('dragover', over);
      el.removeEventListener('dragleave', leave);
      el.removeEventListener('drop', drop);
    };
  }, []);

  /* ===== Handlers ===== */
  const onPick = (f) => {
    setFile(f);
    setLocalUrl(URL.createObjectURL(f));
    setOutUrl('');
    setMsg('');
    setPhase('idle');
  };

  const uploadToSupabase = async () => {
    try {
      setPhase('upload');
      const fileName = `${Date.now()}-${file.name}`;
      // NOTE: تأكد أن عندك bucket باسم uploads ومفعل Public
      const { data, error } = await supabase.storage.from('uploads').upload(fileName, file, { cacheControl: '3600' });
      if (error) throw error;
      const { data: pub } = supabase.storage.from('uploads').getPublicUrl(data.path);
      setPublicUrl(pub.publicUrl);
      return pub.publicUrl;
    } catch (e) {
      setMsg('فشل الرفع إلى Supabase Storage. تأكد أن الباكت "uploads" موجود ومسموح عام.');
      throw e;
    }
  };

  const callRemoveBg = async (imageUrl) => {
    setPhase('processing');
    const res = await fetch('/api/remove-bg', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl, user_email: '' /* يُملأ في API من الجلسة */, engine })
    });
    const j = await res.json();
    if (!res.ok) throw new Error(j.error || 'failed');
    return j.image;
  };

  const composeAndDownload = async (finalUrl) => {
    // نركّب الخلفية المختارة مع صورة PNG الشفافة وننزّل الناتج
    const img = await fetch(finalUrl, { cache: 'no-store' }).then(r => r.blob());
    const bmp = await createImageBitmap(img);
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

    // رسم المنتج
    const pad = Math.round(size * (padding / 300));
    const w = size - pad * 2, h = size - pad * 2;
    const ratio = Math.min(w / bmp.width, h / bmp.height);
    const dw = bmp.width * ratio, dh = bmp.height * ratio;
    const dx = (size - dw) / 2, dy = (size - dh) / 2;
    ctx.drawImage(bmp, dx, dy, dw, dh);

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a'); a.href = url; a.download = 'product.png'; a.click();
  };

  const run = async () => {
    if (!file) { setMsg('اختر صورة أولًا'); return; }
    setBusy(true); setMsg('');
    try {
      const url = await uploadToSupabase();           // 1) رفع
      const cut = await callRemoveBg(url);            // 2) إزالة الخلفية (API)
      setOutUrl(cut); setPhase('ready');
      // نزّل مباشرة بعد ثانية (اختياري)
      await sleep(300);
    } catch (e) {
      setPhase('error');
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  /* ===== UI ===== */
  return (
    <main className="min-h-[100svh] bg-[radial-gradient(90%_80%_at_50%_-10%,#221a42_0%,#0b0b14_55%,#05060a_100%)] text-white">
      {/* Top */}
      <div className="mx-auto max-w-6xl px-6 pt-24 pb-8">
        <motion.h1
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .5 }}
          className="text-3xl md:text-4xl font-extrabold tracking-tight"
        >
          ✂️ Remove BG <span className="text-fuchsia-400">Studio</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .05 }}
          className="mt-2 text-sm text-white/70 max-w-2xl"
        >
          ارفع صورة، أزل الخلفية خلال ثوانٍ، واختر خلفية أنيقة (لون/جراديانت/نمط). تجربة سريعة، عصرية، ومناسبة للموبايل.
        </motion.p>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left: Uploader & Preview */}
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .4 }}>
            <div
              ref={dropRef}
              className="relative rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-lg"
            >
              <label className="block text-sm mb-2 font-medium">Upload</label>

              <div className="grid grid-cols-1 gap-3">
                <label
                  className="group relative grid place-items-center aspect-video rounded-xl border-2 border-dashed border-white/15 bg-white/5 hover:bg-white/[.08] transition cursor-pointer"
                  title="Drag & drop or click to upload"
                >
                  <input type="file" accept="image/*" className="hidden"
                         onChange={(e) => { const f = e.target.files?.[0]; if (f) onPick(f); }} />
                  {!localUrl ? (
                    <div className="text-center text-white/70">
                      <div className="mx-auto mb-3 grid place-items-center size-12 rounded-full bg-white/10">⬆</div>
                      اسحب ملفًا هنا أو اضغط للاختيار
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      <Image src={localUrl} alt="preview" fill className="object-contain rounded-lg" />
                    </div>
                  )}
                </label>

                <div className="flex flex-wrap items-center gap-2">
                  <select value={engine} onChange={(e)=>setEngine(e.target.value)}
                          className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm">
                    <option value="best">Best (851-labs)</option>
                    <option value="fast">Fast (lucataco)</option>
                  </select>

                  <button
                    onClick={run}
                    disabled={!file || busy}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold shadow transition disabled:opacity-50"
                  >
                    {busy ? 'Processing…' : 'Remove Background'}
                  </button>

                  <AnimatePresence>
                    {phase === 'processing' && (
                      <motion.span
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="text-xs text-white/70"
                      >
                        شغال… تقريبًا 3–6 ثوانٍ
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                {msg && <div className="text-xs text-rose-300">{msg}</div>}
              </div>

              {/* After */}
              <div className="mt-4">
                <label className="block text-sm mb-2 font-medium">Result (Transparent)</label>
                <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-white/5">
                  {outUrl ? (
                    <Image src={outUrl} alt="cutout" fill className="object-contain" />
                  ) : (
                    <div className="grid place-items-center h-full text-xs text-white/50">— لا توجد نتيجة بعد —</div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Background Designer + Final Compose */}
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .4 }}>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-lg">
              <label className="block text-sm mb-2 font-medium">Background & Layout</label>

              {/* Mode tabs */}
              <div className="mb-3 flex flex-wrap gap-2">
                <Tab active={mode==='color'} onClick={()=>setMode('color')}>Color</Tab>
                <Tab active={mode==='gradient'} onClick={()=>setMode('gradient')}>Gradient</Tab>
                <Tab active={mode==='pattern'} onClick={()=>setMode('pattern')}>Pattern</Tab>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Primary">
                  <Color value={color} onChange={setColor} />
                </Field>
                {mode === 'gradient' && (
                  <>
                    <Field label="Secondary">
                      <Color value={color2} onChange={setColor2} />
                    </Field>
                    <Field label="Angle">
                      <Range value={angle} onChange={setAngle} min={0} max={360} />
                    </Field>
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
                    {outUrl ? (
                      <Image src={outUrl} alt="final" fill className="object-contain" />
                    ) : (
                      <div className="grid place-items-center h-full text-xs text-white/50">— أزل الخلفية أولًا —</div>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    disabled={!outUrl}
                    onClick={() => composeAndDownload(outUrl)}
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

      {/* tiny grid overlay (dark theme depth) */}
      <div className="pointer-events-none fixed inset-0 opacity-[.04] hidden dark:block"
           style={{ backgroundImage: 'linear-gradient(to right, rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.7) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
    </main>
  );
}

/* ===== Tiny UI atoms ===== */
function Tab({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
        active ? 'bg-white text-black' : 'border border-white/15 bg-white/10 hover:bg-white/15'
      ].join(' ')}
      type="button"
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
function Range({ value, onChange, min, max, step = 1 }) {
  return (
    <div className="flex items-center gap-2">
      <input type="range" value={value} min={min} max={max} step={step}
             onChange={(e)=>onChange(Number(e.target.value))} className="w-full" />
      <span className="w-10 text-right">{typeof value === 'number' ? value : ''}</span>
    </div>
  );
}
