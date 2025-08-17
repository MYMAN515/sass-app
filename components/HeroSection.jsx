// components/HeroSection.jsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useAnimation, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * Weird AF • Bright, playful, undeniably B2B
 * - Non-dark palette (pastels & candy gradients)
 * - Instantly clear value prop (Enhance + Try-On for products)
 * - Heavy micro-interactions: magnets, parallax, marquee, blobs, stickers
 * - Meme-friendly copy, but conversion-first CTAs
 * - No navbar / no footer
 */

export default function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden font-sans text-zinc-900">
      <BackgroundWhimsy />
      <TopBlock />
      <LogosMarquee />
      <ProofPills />
      <ComicHowItWorks />
      <MemeTicker />
      <BottomBlock />
      <StickyMobileCTA />
    </section>
  );
}

/* ============================================================================
   TOP BLOCK — loud, weird, crystal clear
============================================================================ */

function TopBlock() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="relative z-10 px-6 pt-24 pb-16 md:px-10 lg:px-20 lg:pt-28 lg:pb-20">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.1fr,1fr]"
      >
        {/* Left — copy */}
        <div>
          <BadgeRow />
          <WigglyTitle />

          <p className="mt-4 max-w-xl text-lg md:text-xl text-zinc-600">
            Upload a product photo → get studio-grade images and virtual try-ons in seconds.
            Weirdly simple. Dangerously effective.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-[12px] text-zinc-600">
            <Pill>Free starter credits</Pill>
            <Dot />
            <Pill>No studio needed</Pill>
            <Dot />
            <Pill>GDPR-friendly</Pill>
          </div>

          <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center">
            <MagnetCTA href="/dashboard" ariaLabel="Open the dashboard">
              Get started free
            </MagnetCTA>
            <GhostCTA href="#live-demo">Watch 30s demo</GhostCTA>
          </div>

          <EarlyEmailCapture />

          <div className="mt-4 flex items-center gap-3 text-xs text-zinc-500">
            <span className="font-medium">Trusted by 1,200+ stores</span>
            <Dot />
            <span>Avg render 15s</span>
            <Dot />
            <span>99.9% uptime</span>
          </div>
        </div>

        {/* Right — interactive visual */}
        <motion.div
          id="live-demo"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative isolate mx-auto w-full max-w-[520px]"
        >
          <TiltCard>
            <CompareSlider
              before={{ src: '/demo-before.jpg', alt: 'Before AI — raw product photo' }}
              after={{ src: '/demo-after.jpg', alt: 'After AI — enhanced studio photo' }}
              defaultPercent={64}
              showLabels
            />
          </TiltCard>

          {/* Stickers / floating labels */}
          {!prefersReducedMotion && (
            <>
              <FloatSticker className="left-[-16px] top-[-14px] rotate-[-6deg] bg-amber-300">
                no more photoshoots
              </FloatSticker>
              <FloatSticker className="right-[-18px] top-[18%] rotate-[7deg] bg-emerald-300">
                try-on ready
              </FloatSticker>
              <FloatSticker className="left-[10%] bottom-[-20px] rotate-[3deg] bg-pink-300">
                meme-friendly ✅
              </FloatSticker>
            </>
          )}

          <CornerBadge>AI Enhanced</CornerBadge>
        </motion.div>
      </motion.div>

      <div className="pointer-events-none mt-10 flex items-center justify-center text-xs text-zinc-500">
        <span className="animate-bounce">Scroll to see the weird ↓</span>
      </div>
    </div>
  );
}

function BadgeRow() {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="rounded-full border border-zinc-200 bg-white/90 px-3 py-1 text-[11px] font-semibold shadow-sm">
        B2B serious • delightfully weird
      </span>
      <span className="text-[11px] text-zinc-500">Clarity • Speed • Conversion-first</span>
    </div>
  );
}

function WigglyTitle() {
  const words = ['photos', 'listings', 'ads', 'sales'];
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % words.length), 1900);
    return () => clearInterval(t);
  }, []);

  return (
    <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
      Turn{' '}
      <span className="bg-[linear-gradient(120deg,#22d3ee,40%,#f472b6_60%,#f59e0b)] bg-clip-text text-transparent">
        product {words[i]}
      </span>{' '}
      into revenue — <span className="whitespace-nowrap">no studio needed.</span>
      <span
        aria-hidden
        className="ml-2 inline-block rotate-1 select-none rounded-md bg-lime-200 px-2 py-1 text-[16px] font-black leading-none shadow"
      >
        🚀💅
      </span>
    </h1>
  );
}

/* ============================================================================
   VISUAL FX
============================================================================ */

function BackgroundWhimsy() {
  const prefersReducedMotion = useReducedMotion();
  return (
    <div className="absolute inset-0 -z-20">
      {/* Soft candy gradient (non-dark!) */}
      <div className="h-full w-full bg-[radial-gradient(75%_100%_at_50%_0%,#fff7ed_0%,#fdf4ff_42%,#ecfeff_70%)]" />
      {/* Subtle grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] [background-size:28px_28px]" />
      {/* Blobs */}
      <BlobCloud />
      {/* Confetti aura */}
      {!prefersReducedMotion && <ConfettiAura />}
    </div>
  );
}

function BlobCloud() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 0.65, scale: 1 }}
        transition={{ duration: 1.2 }}
        className="absolute -top-28 -left-20 h-[42rem] w-[42rem] rounded-full blur-3xl"
        style={{ background: 'conic-gradient(from 120deg, #93c5fd33, #f472b633, #34d39933, #f59e0b33)' }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 0.55, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.15 }}
        className="absolute -bottom-24 -right-10 h-[36rem] w-[36rem] rounded-full blur-3xl"
        style={{ background: 'conic-gradient(from 260deg, #22d3ee33, #a78bfa33, #f472b633)' }}
      />
    </div>
  );
}

function ConfettiAura() {
  const bits = new Array(24).fill(0).map((_, i) => i);
  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      {bits.map((b) => (
        <motion.span
          key={b}
          initial={{ opacity: 0, y: 10, rotate: 0 }}
          animate={{ opacity: [0, 1, 0], y: [-10, -30, -60], rotate: [0, 15, -10, 20] }}
          transition={{ duration: 7, delay: b * 0.12, repeat: Infinity }}
          className="absolute text-xl"
          style={{
            left: `${(b * 37) % 100}%`,
            top: `${(b * 19) % 100}%`,
          }}
        >
          {['✨', '🫧', '🧃', '🦄', '⭐️'][b % 5]}
        </motion.span>
      ))}
    </div>
  );
}

/* ============================================================================
   CTAs & small UI
============================================================================ */

function Pill({ children }) {
  return <span className="rounded-full bg-white/90 px-3 py-1">{children}</span>;
}
function Dot() {
  return <span className="mx-1 inline-block h-1 w-1 rounded-full bg-zinc-400" />;
}

function MagnetCTA({ href, children, ariaLabel }) {
  const [xy, setXy] = useState({ x: 0, y: 0 });
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setXy({ x: (e.clientX - r.left - r.width / 2) / 6, y: (e.clientY - r.top - r.height / 2) / 6 });
  };
  const onLeave = () => setXy({ x: 0, y: 0 });

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="group inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-pink-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-pink-500/20 transition hover:from-pink-500 hover:to-amber-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
      style={{ transform: `translate3d(${xy.x}px, ${xy.y}px, 0)` }}
    >
      {children}
      <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M13 5l7 7-7 7M5 12h14" />
      </svg>
    </Link>
  );
}

function GhostCTA({ href, children }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white/70 px-6 py-3 text-base font-semibold text-zinc-900 backdrop-blur transition hover:bg-white"
    >
      {children}
    </Link>
  );
}

function EarlyEmailCapture() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle'); // idle | loading | success | error
  const [msg, setMsg] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!/.+@.+\..+/.test(email)) {
      setState('error');
      setMsg('Please enter a valid email.');
      return;
    }
    setState('loading');
    setMsg('');
    setTimeout(() => {
      setState('success');
      setMsg('Invite reserved! Redirecting…');
      window.location.href = `/dashboard?email=${encodeURIComponent(email)}&source=hero-email`;
    }, 500);
  };

  return (
    <form onSubmit={onSubmit} className="mt-6 flex w-full max-w-xl gap-2" aria-live="polite">
      <div className="relative grow">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your work email"
          className="w-full rounded-2xl border border-zinc-200 bg-white/90 px-4 py-3 text-sm outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-pink-400"
          aria-label="Work email"
        />
        <MailIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-60" />
      </div>
      <button
        type="submit"
        disabled={state === 'loading'}
        className="inline-flex items-center justify-center rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
      >
        {state === 'loading' ? 'Reserving…' : 'Get beta invite'}
      </button>
      {msg && <div className={`ml-2 self-center text-xs ${state === 'error' ? 'text-rose-600' : 'text-emerald-600'}`}>{msg}</div>}
    </form>
  );
}

function MailIcon(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...props} aria-hidden>
      <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/* ============================================================================
   INTERACTIVE DEMO
============================================================================ */

function TiltCard({ children }) {
  const ref = useRef(null);
  const [t, setT] = useState({ x: 0, y: 0 });
  const onMove = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const rx = ((e.clientX - r.left) / r.width) * 2 - 1;
    const ry = ((e.clientY - r.top) / r.height) * 2 - 1;
    setT({ x: ry * 6, y: rx * 6 });
  };
  const onLeave = () => setT({ x: 0, y: 0 });

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative rounded-3xl border border-zinc-200 bg-white/80 p-2 shadow-2xl backdrop-blur"
      style={{ transform: `perspective(900px) rotateX(${t.x}deg) rotateY(${t.y}deg)` }}
    >
      {children}
    </div>
  );
}

function CompareSlider({ before, after, defaultPercent = 60, showLabels = true }) {
  const trackRef = useRef(null);
  const [pos, setPos] = useState(defaultPercent);
  const clamp = (v) => Math.max(0, Math.min(100, v));

  const moveToClientX = (clientX) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = clamp(((clientX - rect.left) / rect.width) * 100);
    setPos(x);
  };

  const onPointerDown = (e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    moveToClientX(e.clientX);
  };

  const onPointerMove = (e) => {
    if (!(e.buttons & 1)) return;
    moveToClientX(e.clientX);
  };

  return (
    <div ref={trackRef} className="relative w-full overflow-hidden rounded-2xl">
      {/* After (base) */}
      <Image src={after.src} alt={after.alt} width={900} height={1200} priority className="h-auto w-full select-none object-cover" />
      {/* Before overlay clipped */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <Image src={before.src} alt={before.alt} width={900} height={1200} className="h-full w-full object-cover" priority={false} />
      </div>

      {/* Labels */}
      {showLabels && (
        <>
          <div className="pointer-events-none absolute left-3 top-3 select-none rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-zinc-800 shadow-sm">
            Before
          </div>
          <div className="pointer-events-none absolute right-3 top-3 select-none rounded-full bg-pink-500/90 px-2 py-1 text-[10px] font-semibold text-white shadow-sm">
            After
          </div>
        </>
      )}

      {/* Handle/rail */}
      <div
        role="slider"
        aria-label="Compare before and after"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') setPos((p) => clamp(p - 5));
          if (e.key === 'ArrowRight') setPos((p) => clamp(p + 5));
        }}
        className="absolute top-0 cursor-ew-resize"
        style={{ left: `calc(${pos}% - 1px)`, height: '100%' }}
      >
        <div className="h-full w-0.5 bg-white/90 mix-blend-difference shadow-[0_0_0_1px_rgba(0,0,0,.2)]" />
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-zinc-900/80 px-2 py-1 text-xs text-white shadow">
          Drag
        </div>
      </div>

      {/* Range fallback */}
      <div className="absolute inset-x-0 bottom-0 z-10 m-0 flex items-center gap-2 bg-gradient-to-t from-black/10 to-transparent px-4 pb-3 pt-10">
        <input
          aria-label="Compare before and after"
          className="h-1 w-full cursor-ew-resize appearance-none rounded-full bg-zinc-300 outline-none accent-pink-600"
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
        />
      </div>
    </div>
  );
}

function FloatSticker({ children, className = '' }) {
  return (
    <motion.div
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: [0, -6, 0], opacity: 1 }}
      transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
      className={`pointer-events-none absolute z-20 select-none rounded-xl px-3 py-2 text-[11px] font-extrabold text-zinc-900 shadow ${className}`}
      style={{ boxShadow: '0 6px 20px rgba(0,0,0,.08)' }}
    >
      {children}
    </motion.div>
  );
}

function CornerBadge({ children }) {
  return (
    <div className="pointer-events-none absolute right-3 top-3 z-20 flex items-center gap-1 rounded-full bg-zinc-900/80 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur">
      <SparkleIcon /> {children}
    </div>
  );
}
function SparkleIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 2l1.6 4.4L18 8l-4.4 1.6L12 14l-1.6-4.4L6 8l4.4-1.6L12 2z" stroke="currentColor" strokeWidth="1.2" fill="currentColor" opacity="0.9" />
    </svg>
  );
}

/* ============================================================================
   LOGOS MARQUEE
============================================================================ */

function LogosMarquee() {
  const logos = ['brand-1.svg', 'brand-2.svg', 'brand-3.svg', 'brand-4.svg', 'brand-5.svg'];
  return (
    <div className="relative z-10 mx-auto mt-6 w-full max-w-7xl overflow-hidden px-6 py-6 md:px-10">
      <div className="mb-3 text-center text-[11px] uppercase tracking-[0.2em] text-zinc-500">POWERING TEAMS AT</div>
      <div className="[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="animate-marquee flex min-w-full items-center gap-10 opacity-70 hover:[animation-play-state:paused]">
          {logos.concat(logos).map((src, i) => (
            <div key={i} className="relative h-8 w-28 opacity-80">
              <Image src={`/${src}`} alt="brand logo" fill className="object-contain" />
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        .animate-marquee { animation: marquee 26s linear infinite; }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      `}</style>
    </div>
  );
}

/* ============================================================================
   PROOF PILLS
============================================================================ */

function ProofPills() {
  const metrics = [
    { label: 'Higher conversion', to: 32, suffix: '%' },
    { label: 'Time saved per shoot', to: 90, suffix: '%' },
    { label: 'Avg render', to: 15, suffix: 's', reverse: true },
    { label: 'Uptime', to: 99.9, suffix: '%' },
  ];
  return (
    <div className="relative z-10 mx-auto mt-2 max-w-7xl px-6 md:px-10">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {metrics.map((m, i) => (
          <KPI key={i} label={m.label} to={m.to} suffix={m.suffix} reverse={m.reverse} />
        ))}
      </div>
    </div>
  );
}

function KPI({ label, to, suffix = '', reverse = false }) {
  const ref = useRef(null);
  const [val, setVal] = useState(reverse ? to : 0);
  useEffect(() => {
    let frame;
    const el = ref.current;
    if (!el) return;
    let start = null;
    const duration = 1000;
    const startVal = reverse ? to : 0;
    const endVal = reverse ? (to <= 15 ? to : 0) : to;
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Number((startVal + (endVal - startVal) * eased).toFixed(1)));
      if (p < 1) frame = requestAnimationFrame(step);
    };
    const io = new IntersectionObserver((ents) => ents.forEach((e) => e.isIntersecting && requestAnimationFrame(step)), { threshold: 0.5 });
    io.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
    };
  }, [to, reverse]);

  return (
    <div
      ref={ref}
      className="rounded-2xl border border-zinc-200 bg-white p-4 text-center shadow-sm"
      style={{ boxShadow: '0 8px 30px rgba(0,0,0,.06)' }}
    >
      <div className="text-2xl font-extrabold">{val}{suffix}</div>
      <div className="text-xs text-zinc-600">{label}</div>
    </div>
  );
}

/* ============================================================================
   HOW IT WORKS — comic panels (weird & clear)
============================================================================ */

function ComicHowItWorks() {
  const steps = [
    { title: '1) Upload', desc: 'Drop a product photo (png/jpg)', icon: '📤' },
    { title: '2) Enhance & Try-On', desc: 'AI does the heavy lifting', icon: '⚙️' },
    { title: '3) Publish', desc: 'Export to your store/CMS', icon: '🚀' },
  ];
  return (
    <div className="relative z-10 mt-10 bg-gradient-to-b from-[#fff7ed] to-[#fdf4ff] px-6 py-16 md:px-10 lg:px-20">
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5 }}
        className="mx-auto mb-10 text-center text-3xl font-extrabold md:text-4xl"
      >
        The 30-second workflow (your team will actually use)
      </motion.h2>

      <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
        {steps.map((s, idx) => (
          <motion.div
            key={s.title}
            whileHover={{ rotate: idx === 1 ? 1.5 : -1.5, y: -4, scale: 1.01 }}
            className="relative rounded-3xl border border-zinc-200 bg-white p-6 shadow-lg"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-400 text-2xl">{s.icon}</div>
            <h3 className="text-xl font-semibold">{s.title}</h3>
            <p className="mt-1 text-sm text-zinc-600">{s.desc}</p>
            {idx < steps.length - 1 && (
              <svg className="pointer-events-none absolute right-[-18px] top-1/2 hidden -translate-y-1/2 md:block" width="36" height="2" viewBox="0 0 36 2" fill="none" aria-hidden>
                <path d="M0 1h36" stroke="currentColor" strokeOpacity="0.25" strokeDasharray="4 3" />
              </svg>
            )}
            <CornerDoodle />
          </motion.div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-2xl bg-zinc-900 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-zinc-800"
        >
          Start creating →
        </Link>
      </div>
    </div>
  );
}

function CornerDoodle() {
  return (
    <svg className="pointer-events-none absolute -left-2 -top-2 h-10 w-10 opacity-70" viewBox="0 0 80 80" fill="none" aria-hidden>
      <path d="M10 30 C20 10, 40 10, 50 30" stroke="#f472b6" strokeWidth="4" strokeLinecap="round" />
      <path d="M20 45 C35 25, 55 25, 65 45" stroke="#22d3ee" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

/* ============================================================================
   MEME TICKER
============================================================================ */

function MemeTicker() {
  const data = [
    '“Our mug shot sold out.” — Some Store 😂',
    '“Goodbye chaotic photoshoots.” — Ops Team 🧹',
    '“CTR up 27%.” — UrbanWear 📈',
    '“Try-on crushed returns.” — SneakLab 🧠',
    '“Brand visuals = peace.” — M.J. 🧘‍♀️',
  ];
  return (
    <div className="relative z-10 mx-auto mb-2 mt-2 max-w-7xl overflow-hidden px-6 py-6 md:px-10">
      <div className="rounded-3xl border border-zinc-200 bg-white/80 p-4 backdrop-blur">
        <div className="relative [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <div className="animate-marquee2 flex min-w-full items-center gap-10">
            {data.concat(data).map((t, i) => (
              <div key={i} className="whitespace-nowrap text-sm text-zinc-700">
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        .animate-marquee2 { animation: marquee2 30s linear infinite; }
        @keyframes marquee2 { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      `}</style>
    </div>
  );
}

/* ============================================================================
   BOTTOM CTA
============================================================================ */

function BottomBlock() {
  return (
    <div className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-10 text-center md:px-10">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5 }}
        className="rounded-3xl border border-zinc-200 bg-gradient-to-br from-white to-[#fff7ed] p-8 shadow-xl"
      >
        <h3 className="text-2xl font-extrabold">Your competitors are already here.</h3>
        <p className="mt-2 text-zinc-600">
          Join the beta, spend less time retouching, and more time selling. Limited invites this month.
        </p>
        <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <MagnetCTA href="/dashboard">Claim your invite</MagnetCTA>
          <GhostCTA href="#features">Explore features</GhostCTA>
        </div>
      </motion.div>
    </div>
  );
}

function StickyMobileCTA() {
  return (
    <div className="md:hidden">
      <Link
        href="/dashboard"
        className="fixed bottom-4 right-4 z-[60] inline-flex items-center gap-2 rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-cyan-700/20 transition hover:bg-pink-500"
        aria-label="Try it now"
      >
        Try now <span aria-hidden>→</span>
      </Link>
    </div>
  );
}
