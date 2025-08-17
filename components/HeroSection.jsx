// components/HeroPrismSection.jsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useAnimation, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/**
 * PRISM LAB — Hero Section (Weird, bright, B2B, mobile-first)
 * - Left: copy (badge, headline, sub, CTAs, micro‑trust)
 * - Right: interactive prism scene (InputCard → Prism → 3 Output Kits)
 * - Beams with subtle pulses; idle prism rotation; reduced-motion aware
 * - Input supports click + drag/drop (with preview)
 * - Mobile: stacked, chips swipe, sticky CTA
 */

export default function HeroPrismSection() {
  return (
    <section className="relative isolate w-full overflow-hidden bg-[#FFF7ED] text-zinc-900">
      <CornerGradients />
      <NoiseOverlay />

      <div className="mx-auto grid min-h-[88svh] max-w-7xl items-center gap-10 px-5 pb-24 pt-24 sm:px-6 md:grid-cols-2 md:px-10 lg:px-16">
        <HeroCopy />
        <PrismScene />
      </div>

      <StickyMobileCTA />
    </section>
  );
}

/* -------------------------------- Backdrop --------------------------------- */
function CornerGradients() {
  return (
    <>
      <div className="pointer-events-none absolute -left-28 -top-28 h-[28rem] w-[28rem] rounded-full bg-[conic-gradient(at_30%_30%,#f97316_0%,#fde047_25%,#22c55e_50%,#60a5fa_75%,#f97316_100%)] opacity-40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-[26rem] w-[26rem] rounded-full bg-[conic-gradient(at_70%_70%,#84cc16_0%,#22c55e_25%,#f472b6_55%,#f97316_80%,#84cc16_100%)] opacity-40 blur-3xl" />
    </>
  );
}

function NoiseOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-soft-light"
      style={{
        backgroundImage:
          'url("data:image/svg+xml;utf8,\
<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'1600\' height=\'900\'><filter id=\'n\'>\
<feTurbulence type=\'fractalNoise\' baseFrequency=\'0.95\' numOctaves=\'4\'/>\
</filter>\
<rect width=\'100%\' height=\'100%\' filter=\'url(%23n)\' opacity=\'0.6\'/>\
</svg>")',
      }}
    />
  );
}

/* --------------------------------- Copy ------------------------------------ */
function HeroCopy() {
  return (
    <div>
      <Badge>WEIRD • BRIGHT • BUILT FOR COMMERCE</Badge>

      <h1 className="mt-3 text-balance text-4xl font-extrabold leading-[1.04] tracking-tight md:text-5xl">
        Turn <span className="bg-gradient-to-r from-rose-500 via-orange-500 to-lime-500 bg-clip-text text-transparent">one product photo</span>{' '}
        into enhance, scenes, and on‑model try‑ons.
      </h1>

      <p className="mt-3 max-w-xl text-base md:text-lg">
        Upload a product shot → get high‑res enhancements, on‑brand backgrounds, and realistic try‑ons. No studio, no reshoots, all AI.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <PrimaryCTA href="/dashboard">Try a free demo</PrimaryCTA>
        <GhostCTA href="#how">How it works</GhostCTA>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <Pill>No credit card</Pill>
        <Pill>High‑res exports</Pill>
        <Pill>API for scale</Pill>
      </div>
    </div>
  );
}

function Badge({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3 py-1 text-[11px] font-medium">
      {children}
    </span>
  );
}

function Pill({ children }) {
  return <span className="rounded-full border border-zinc-200 bg-white px-3 py-1">{children}</span>;
}

function PrimaryCTA({ href, children }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(249,115,22,0.3)] transition hover:bg-orange-700"
    >
      {children}
      <span className="ml-1" aria-hidden>
        →
      </span>
    </Link>
  );
}

function GhostCTA({ href, children }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold transition hover:bg-zinc-50"
    >
      {children}
    </Link>
  );
}

/* ------------------------------- Prism Scene -------------------------------- */
function PrismScene() {
  const prefersReducedMotion = useReducedMotion();
  const [dragOver, setDragOver] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [ingest, setIngest] = useState(false); // hover/tap to slide input into prism
  const prismControls = useAnimation();

  useEffect(() => {
    if (prefersReducedMotion) return;
    prismControls.start({ rotate: 360, transition: { duration: 48, repeat: Infinity, ease: 'linear' } });
  }, [prefersReducedMotion, prismControls]);

  // cleanup object URL
  useEffect(() => () => fileUrl && URL.revokeObjectURL(fileUrl), [fileUrl]);

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) {
      const url = URL.createObjectURL(f);
      setFileUrl(url);
      setIngest(true);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  return (
    <div
      className="relative mx-auto aspect-[4/3] w-[min(92vw,38rem)] sm:w-[min(78vw,38rem)]"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onMouseEnter={() => setIngest(true)}
      onMouseLeave={() => setIngest(false)}
    >
      {/* Input card */}
      <InputCard fileUrl={fileUrl} setFileUrl={setFileUrl} active={dragOver || ingest} />

      {/* Prism core */}
      <motion.div
        aria-hidden
        animate={prismControls}
        className="absolute left-1/2 top-1/2 h-[12rem] w-[12rem] -translate-x-1/2 -translate-y-1/2"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="relative h-full w-full">
          {/* Glass triangle (clip-path) */}
          <div
            className="absolute inset-0 rotate-[8deg] rounded-md shadow-[0_20px_60px_rgba(0,0,0,0.08)]"
            style={{
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.35) 100%), conic-gradient(from 0deg, #f97316, #22c55e, #38bdf8, #f472b6, #f97316)',
              mixBlendMode: 'screen',
              border: '1px solid rgba(255,255,255,0.6)',
              backdropFilter: 'blur(4px)',
            }}
          />
          {/* Inner highlight */}
          <div
            className="absolute inset-[18%]"
            style={{
              clipPath: 'polygon(50% 0%, 8% 100%, 92% 100%)',
              background: 'radial-gradient(circle at 50% 30%, rgba(255,255,255,.9), rgba(255,255,255,0) 60%)',
              opacity: 0.7,
            }}
          />
        </div>
      </motion.div>

      {/* Beams + Output kits */}
      <Beam
        id="enhance"
        colorFrom="#A3E635"
        colorTo="#ffffff"
        start={{ x: '52%', y: '53%' }}
        endBoxClass="right-0 top-4"
      >
        <OutputKitEnhance fileUrl={fileUrl} />
      </Beam>

      <Beam
        id="backgrounds"
        colorFrom="#38BDF8"
        colorTo="#ffffff"
        start={{ x: '53%', y: '50%' }}
        endBoxClass="right-0 top-1/2 -translate-y-1/2"
      >
        <OutputKitBackgrounds fileUrl={fileUrl} />
      </Beam>

      <Beam
        id="tryon"
        colorFrom="#F472B6"
        colorTo="#ffffff"
        start={{ x: '54%', y: '47%' }}
        endBoxClass="right-0 bottom-4"
      >
        <OutputKitTryOn fileUrl={fileUrl} />
      </Beam>

      <StyleKeyframes />
    </div>
  );
}

/* --------------------------------- Input ----------------------------------- */
function InputCard({ fileUrl, setFileUrl, active }) {
  const inputRef = useRef(null);
  const [msg, setMsg] = useState('');

  const onPick = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setMsg('Uploading…');
      const url = URL.createObjectURL(f);
      setFileUrl(url);
      setTimeout(() => setMsg('Ready!'), 400);
    }
  };

  return (
    <motion.button
      type="button"
      onClick={() => inputRef.current?.click()}
      whileHover={{ x: 10 }}
      className={`group absolute left-2 top-1/2 -translate-y-1/2 rounded-2xl border ${
        active ? 'border-orange-400 bg-white' : 'border-zinc-200 bg-white/90'
      } p-3 shadow-sm backdrop-blur-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400`}
      style={{ width: '9.5rem' }}
      aria-label="Upload a product image"
      aria-describedby="input-hint"
    >
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
      <div id="input-hint" className="sr-only">
        Click to upload or drag and drop. Supported: images.
      </div>

      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-zinc-200 bg-gradient-to-br from-white to-orange-50">
        {fileUrl ? (
          <Image src={fileUrl} alt="Uploaded product preview" fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-xs text-zinc-600">
            <span className="mb-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-orange-700">📷</span>
            Drop / Click
          </div>
        )}
        {/* shimmer on hover */}
        <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
          <div className="absolute -inset-1 animate-shimmer bg-[linear-gradient(110deg,transparent,rgba(255,255,255,.7),transparent)] bg-[length:200%_100%]" />
        </div>
      </div>
      <div className="mt-2 text-center text-[10px] text-zinc-500" aria-live="polite">
        {msg || 'PNG/JPG • High-res recommended'}
      </div>
    </motion.button>
  );
}

/* ---------------------------------- Beam ----------------------------------- */
function Beam({ id, colorFrom, colorTo, start, endBoxClass, children }) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <div className={`pointer-events-none absolute ${endBoxClass} z-[2]`}>
      {/* Output kit box (children supplies content) */}
      <div className="pointer-events-auto relative mr-2 rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm">
        {children}
      </div>

      {/* Beam graphic from prism to kit */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute right-full top-1/2 -z-10 h-1 w-[16rem] -translate-y-1/2 origin-right"
        animate={prefersReducedMotion ? { opacity: 0.6 } : { opacity: [0.35, 0.8, 0.35] }}
        transition={prefersReducedMotion ? {} : { duration: 4 + Math.random() * 2, repeat: Infinity }}
        style={{
          background: `linear-gradient(90deg, ${colorFrom}, ${colorTo})`,
          boxShadow: `0 0 18px ${colorFrom}66`,
        }}
      />
    </div>
  );
}

/* ------------------------------ Output Kits -------------------------------- */
function KitShell({ title, chipColor, tooltip, children }) {
  return (
    <div className="relative w-[9.5rem]">
      <div className="rounded-xl border border-zinc-200 bg-white p-2">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-gradient-to-br from-white to-zinc-50">
          {children}
        </div>
      </div>
      <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold">
        <span className={`inline-block h-2 w-2 rounded-full ${chipColor}`} aria-hidden />
        {title}
      </div>
      <div className="text-[10px] text-zinc-500">{tooltip}</div>
    </div>
  );
}

function OutputKitEnhance({ fileUrl }) {
  return (
    <KitShell title="Enhance" chipColor="bg-lime-500" tooltip="Sharper • Brighter • Cleaner">
      {/* base image or placeholder */}
      {fileUrl ? (
        <Image src={fileUrl} alt="Enhanced preview" fill className="object-cover" />
      ) : (
        <PlaceholderPattern />
      )}
      {/* shimmer sweep */}
      <div className="absolute inset-0 animate-shimmer bg-[linear-gradient(110deg,transparent,rgba(255,255,255,.6),transparent)] bg-[length:180%_100%] opacity-70" />
      {/* focus vignette */}
      <div className="pointer-events-none absolute inset-0 rounded-lg shadow-[inset_0_0_40px_rgba(0,0,0,0.2)]" />
    </KitShell>
  );
}

function OutputKitBackgrounds({ fileUrl }) {
  const [idx, setIdx] = useState(0);
  const scenes = [
    'linear-gradient(135deg, #e0f2fe, #fef9c3)', // sky → lemon
    'linear-gradient(135deg, #fde68a, #fbcfe8)', // amber → pink
    'linear-gradient(135deg, #bbf7d0, #dbeafe)', // green → blue
  ];
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % scenes.length), 2200);
    return () => clearInterval(t);
  }, []);
  return (
    <KitShell title="Backgrounds" chipColor="bg-sky-500" tooltip="Studio • Lifestyle • Seasonal">
      <div className="absolute inset-0" style={{ background: scenes[idx] }} />
      {fileUrl ? (
        <div className="absolute inset-0 grid place-items-center">
          <div className="relative aspect-[4/5] w-[70%] overflow-hidden rounded-lg border border-white/60 shadow-lg">
            <Image src={fileUrl} alt="On scene" fill className="object-cover" />
          </div>
        </div>
      ) : (
        <CenterIcon>🏝️</CenterIcon>
      )}
      <div className="pointer-events-none absolute inset-0 rounded-lg shadow-[inset_0_0_40px_rgba(0,0,0,0.12)]" />
    </KitShell>
  );
}

function OutputKitTryOn({ fileUrl }) {
  const [flip, setFlip] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setFlip((f) => !f), 1800);
    return () => clearInterval(t);
  }, []);
  return (
    <KitShell title="Try‑On" chipColor="bg-fuchsia-500" tooltip="Realistic models • Sizes">
      {/* mannequin */}
      <div className="absolute inset-0 grid place-items-center">
        <svg width="96" height="120" viewBox="0 0 96 120" className="opacity-80">
          <defs>
            <linearGradient id="skin" x1="0" x2="1">
              <stop offset="0%" stopColor="#fde68a" />
              <stop offset="100%" stopColor="#fca5a5" />
            </linearGradient>
          </defs>
          <circle cx="48" cy="20" r="12" fill="url(#skin)" />
          <rect x="28" y="36" width="40" height="40" rx="8" fill="#e5e7eb" />
          <rect x="18" y="76" width="60" height="30" rx="12" fill="#e5e7eb" />
        </svg>
      </div>
      {/* garment overlay */}
      {fileUrl ? (
        <div className="absolute left-1/2 top-[44%] h-20 w-[56%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-md border border-white/60 shadow">
          <Image src={fileUrl} alt="Garment overlay" fill className="object-cover" />
        </div>
      ) : (
        <motion.div
          className="absolute left-1/2 top-[44%] h-20 w-[56%] -translate-x-1/2 -translate-y-1/2 rounded-md"
          animate={{ opacity: flip ? 0.9 : 0.5, scale: flip ? 1 : 0.96 }}
          transition={{ duration: 0.6 }}
          style={{ background: 'linear-gradient(135deg,#c084fc,#f472b6)' }}
        />
      )}
      <div className="pointer-events-none absolute inset-0 rounded-lg shadow-[inset_0_0_40px_rgba(0,0,0,0.15)]" />
    </KitShell>
  );
}

/* ------------------------------- Utilities --------------------------------- */
function PlaceholderPattern() {
  return (
    <div className="absolute inset-0 grid place-items-center text-2xl">🧺</div>
  );
}

function CenterIcon({ children }) {
  return <div className="absolute inset-0 grid place-items-center text-2xl">{children}</div>; }

function StyleKeyframes() {
  return (
    <style jsx>{`
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      .animate-shimmer { animation: shimmer 2.2s linear infinite; }
    `}</style>
  );
}

/* --------------------------- Sticky Mobile CTA ----------------------------- */
function StickyMobileCTA() {
  return (
    <div className="md:hidden">
      <Link
        href="/dashboard"
        className="fixed inset-x-4 bottom-5 z-50 flex items-center justify-center rounded-2xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-orange-500/30 transition hover:bg-orange-700"
        aria-label="Start now"
      >
        Start now →
      </Link>
    </div>
  );
}
