// components/RemoveBgStudio.jsx
'use client';
import { useMemo, useRef, useState } from 'react';
import Image from 'next/image';

export default function RemoveBgStudio() {
  const [engine, setEngine] = useState('best'); // best (851-labs) | fast (lucataco)
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [beforeUrl, setBeforeUrl] = useState('');
  const [afterUrl, setAfterUrl] = useState('');

  // خلفية العرض (CSS فقط)
  const [mode, setMode] = useState('color'); // color | gradient | pattern
  const [color, setColor] = useState('#f7f7f9');
  const [color2, setColor2] = useState('#ffffff'); // للـgradient
  const [angle, setAngle] = useState(45);
  const [radius, setRadius] = useState(24);
  const [padding, setPadding] = useState(24);
  const [shadow, setShadow] = useState(true);
  const [patternOpacity, setPatternOpacity] = useState(0.12);

  const inputRef = useRef(null);

  const onSelect = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setBeforeUrl(URL.createObjectURL(f));
    setAfterUrl('');
    setError('');
  };

  const removeBg = async () => {
    if (!file) {
      setError('ارفع صورة أولاً.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('engine', engine);
      form.append('background', 'rgba'); // نحتاج ناتج شفاف
      form.append('threshold', '0');

      const res = await fetch('/api/remove-bg', { method: 'POST', body: form });
      if (!res.ok) throw new Error('فشل الطلب');

      const json = await res.json();
      const out = Array.isArray(json.outputUrl) ? json.outputUrl[0] : json.outputUrl;
      setAfterUrl(out);
    } catch (e) {
      setError('صار خطأ أثناء الإزالة. جرّب صورة ثانية.');
    } finally {
      setBusy(false);
    }
  };

  // ستايل خلفية إطار المعاينة
  const bgStyle = useMemo(() => {
    if (mode === 'color') return { background: color };
    if (mode === 'gradient') return { background: `linear-gradient(${angle}deg, ${color}, ${color2})` };
    // pattern SVG
    const svg = encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'>
        <defs>
          <pattern id='p' width='24' height='24' patternUnits='userSpaceOnUse'>
            <path d='M0 12h24M12 0v24' stroke='${hexToRGBA(color, patternOpacity)}' stroke-width='1'/>
          </pattern>
        </defs>
        <rect width='100%' height='100%' fill='${color}'/>
        <rect width='100%' height='100%' fill='url(#p)'/>
      </svg>`
    );
    return {
      backgroundColor: color,
      backgroundImage: `url("data:image/svg+xml;utf8,${svg}")`,
      backgroundSize: '24px 24px',
    };
  }, [mode, color, color2, angle, patternOpacity]);

  const containerStyle = {
    ...bgStyle,
    borderRadius: `${radius}px`,
    padding: `${padding}px`,
    boxShadow: shadow ? '0 12px 30px rgba(0,0,0,.12), 0 4px 12px rgba(0,0,0,.06)' : 'none',
    transition: 'all .25s ease',
  };

  return (
    <div className="relative mx-auto w-full max-w-5xl rounded-3xl border border-black/10 bg-white/70 p-6 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-white/5">
      <h2 className="mb-2 text-xl font-bold">Remove Background + Style</h2>
      <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-300">
        ارفع صورة المنتج، شغّل الإزالة، ثم اختر خلفية (لون/جراديانت/نقشة) — كلّه بنفس الصفحة.
      </p>

      {/* صف الإعدادات */}
      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-black/10 bg-white/80 p-3 text-sm dark:border-white/15 dark:bg-white/10">
          <div className="mb-2 font-medium">اختيار الصورة</div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-semibold dark:border-white/15 dark:bg-white/10"
              onClick={() => inputRef.current?.click()}
            >
              اختر ملف
            </button>
            <span className="line-clamp-1 text-xs opacity-70">{file?.name || 'لا يوجد ملف'}</span>
          </div>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onSelect} />
        </div>

        <div className="rounded-xl border border-black/10 bg-white/80 p-3 text-sm dark:border-white/15 dark:bg-white/10">
          <div className="mb-2 font-medium">المحرّك</div>
          <select
            value={engine}
            onChange={(e) => setEngine(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-white px-2 py-1 dark:border-white/15 dark:bg-white/10"
          >
            <option value="best">Best (851-labs)</option>
            <option value="fast">Fast (lucataco)</option>
          </select>
          <button
            type="button"
            disabled={!file || busy}
            onClick={removeBg}
            className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {busy ? 'جاري الإزالة…' : 'إزالة الخلفية'}
          </button>
          {error && <div className="mt-2 text-xs text-rose-600">{error}</div>}
        </div>

        <div className="rounded-xl border border-black/10 bg-white/80 p-3 text-sm dark:border-white/15 dark:bg-white/10">
          <div className="mb-2 font-medium">وضع الخلفية</div>
          <div className="mb-2 flex flex-wrap gap-2">
            <Tab checked={mode === 'color'} onClick={() => setMode('color')}>Color</Tab>
            <Tab checked={mode === 'gradient'} onClick={() => setMode('gradient')}>Gradient</Tab>
            <Tab checked={mode === 'pattern'} onClick={() => setMode('pattern')}>Pattern</Tab>
          </div>

          {/* خيارات اللون/الجراديانت/النقشة */}
          <div className="space-y-2">
            <ColorRow label="Primary" value={color} onChange={setColor} />
            {mode === 'gradient' && (
              <>
                <ColorRow label="Secondary" value={color2} onChange={setColor2} />
                <RangeRow label="Angle" value={angle} onChange={setAngle} min={0} max={360} />
              </>
            )}
            {mode === 'pattern' && (
              <RangeRow label="Pattern opacity" value={patternOpacity} onChange={setPatternOpacity} min={0} max={0.5} step={0.01} />
            )}
            <div className="mt-2 grid grid-cols-3 gap-2">
              <RangeRow label="Radius" value={radius} onChange={setRadius} min={0} max={48} />
              <RangeRow label="Padding" value={padding} onChange={setPadding} min={0} max={64} />
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={shadow} onChange={(e) => setShadow(e.target.checked)} />
                Shadow
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* المعاينة: قبل / بعد (بعد مع خلفية CSS) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card title="قبل">
          <AspectBox>
            {beforeUrl ? (
              <Image src={beforeUrl} alt="Original" fill className="object-contain" />
            ) : (
              <Empty />
            )}
          </AspectBox>
        </Card>

        <Card title="بعد (مع الخلفية المختارة)">
          <div style={containerStyle} className="relative">
            <AspectBox>
              {afterUrl ? (
                <Image src={afterUrl} alt="Result" fill className="object-contain" />
              ) : (
                <Empty text="أزِل الخلفية أولًا" />
              )}
            </AspectBox>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------------- UI atoms ---------------- */
function Card({ title, children }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white/70 p-3 dark:border-white/10 dark:bg-white/10">
      <div className="mb-2 text-xs text-zinc-500">{title}</div>
      {children}
    </div>
  );
}
function AspectBox({ children }) {
  return <div className="relative aspect-square w-full overflow-hidden rounded-lg">{children}</div>;
}
function Empty({ text = 'ارفع صورة لإظهار المعاينة' }) {
  return <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500 dark:text-zinc-300">{text}</div>;
}
function Tab({ checked, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
        checked ? 'bg-zinc-900 text-white dark:bg-white dark:text-black' : 'border border-black/10 bg-white/70 dark:border-white/15 dark:bg-white/10'
      }`}
    >
      {children}
    </button>
  );
}
function ColorRow({ label, value, onChange }) {
  return (
    <label className="flex items-center gap-2 text-xs">
      <span className="min-w-[64px] opacity-70">{label}</span>
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-28 rounded border border-black/10 bg-white/70 px-2 py-1 dark:border-white/15 dark:bg-white/10"
      />
    </label>
  );
}
function RangeRow({ label, value, onChange, min, max, step = 1 }) {
  return (
    <label className="flex items-center gap-2 text-xs">
      <span className="min-w-[64px] opacity-70">{label}</span>
      <input type="range" value={value} min={min} max={max} step={step} onChange={(e) => onChange(Number(e.target.value))} />
      <span className="w-10 text-right opacity-70">{value}</span>
    </label>
  );
}

/* --------------- helpers --------------- */
function hexToRGBA(hex, alpha = 1) {
  const c = hex.replace('#', '');
  const v = c.length === 3 ? c.replace(/(.)/g, '$1$1') : c;
  const int = parseInt(v, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
