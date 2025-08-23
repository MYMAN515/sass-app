// components/HeroSection.jsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

export default function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden font-sans text-black dark:text-white">
      <BackgroundFX />
      <TopHero />
      <LogoMarquee />
      <ProofMetrics />
      <ValueProps />
      <HowItWorks />
      <HumorBreak />
      <TestimonialsTicker />
      <BottomCTA />
      <StickyMobileCTA />
    </section>
  );
}

/* -------------------------------- Top -------------------------------- */

function TopHero() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="relative z-10 px-6 md:px-12 lg:px-20 pt-24 pb-16 lg:pt-28 lg:pb-24">
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-6xl"
      >
        {/* Badge */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-violet-200/60 dark:border-white/15 bg-white/80 dark:bg-white/10 px-3 py-1 text-[11px] font-medium shadow-[0_1px_0_0_rgba(109,40,217,.10)] backdrop-blur-md">
            STARTUP SERIOUS • TASTEFULLY FUN
          </span>
          <span className="text-[11px] text-zinc-600 dark:text-zinc-300">Clarity • Speed • Conversion-first</span>
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* Copy */}
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight">
              Turn{' '}
              <span className="bg-[linear-gradient(120deg,#7c3aed_0%,#a855f7_35%,#c084fc_65%,#e879f9_100%)] bg-clip-text text-transparent">
                product photos
              </span>{' '}
              into sales—<span className="whitespace-nowrap">no studio needed.</span>
            </h1>

            <p className="mt-4 max-w-xl text-lg md:text-xl text-zinc-700 dark:text-zinc-300">
              Upload a photo → get on-brand, studio-grade shots and AI try-ons in seconds. It’s like hiring a photo team—minus the coffee drama.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
              <Chip>No credit card</Chip>
              <Chip>Free starter credits</Chip>
              <Chip>Cancel anytime</Chip>
            </div>

            <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center">
              <MagneticCTA href="/dashboard" ariaLabel="Get started for free">Get started free</MagneticCTA>
              <a
                href="#demo"
                className="inline-flex items-center justify-center rounded-xl border border-violet-200/70 bg-white/80 px-5 py-3 text-base font-semibold text-zinc-900 shadow-[0_6px_28px_-12px_rgba(109,40,217,.18)] backdrop-blur-md transition hover:bg-white dark:border-white/15 dark:bg-white/10 dark:text-white"
              >
                Watch 30s demo
              </a>
            </div>

            <EarlyEmailCapture />
            <TrustBar />
          </div>

          {/* Demo card */}
          <motion.div
            id="demo"
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative isolate mx-auto w-full max-w-xl overflow-hidden rounded-2xl border border-violet-200/70 bg-white/90 shadow-[0_22px_90px_-22px_rgba(124,58,237,.28)] ring-1 ring-white/80 backdrop-blur-md dark:border-white/10 dark:bg-white/5"
            aria-label="Before and after preview"
          >
            {/* halo */}
            <div aria-hidden className="pointer-events-none absolute -inset-2 rounded-[1.25rem] opacity-80 blur-xl"
                 style={{ background: 'radial-gradient(60% 60% at 70% 20%, rgba(168,85,247,.18), transparent 60%)' }} />
            <GradientRing />
            <CompareSlider
              before={{ src: '/demo-before.jpg', alt: 'Original product photo before enhancement' }}
              after={{ src: '/demo-after.jpg', alt: 'Enhanced product photo after AI processing' }}
              defaultPercent={62}
              showLabels
            />
            <CornerBadge />
          </motion.div>
        </div>

        <div className="pointer-events-none mt-10 flex items-center justify-center text-xs text-zinc-500 dark:text-zinc-400">
          <span className="motion-safe:animate-bounce">Scroll to see the magic ↓</span>
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------ Background -------------------------------- */

function BackgroundFX() {
  return (
    <div className="absolute inset-0 -z-20">
      {/* Light */}
      <div className="h-full w-full bg-[radial-gradient(75%_100%_at_50%_0%,#f8f6ff_0%,#ffffff_38%,#fbf7ff_100%)] dark:hidden" />
      {/* Light grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.1] dark:hidden [background-image:linear-gradient(to_right,rgba(109,40,217,.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(109,40,217,.08)_1px,transparent_1px)] [background-size:22px_22px]" />
      {/* Dark */}
      <div className="hidden h-full w-full dark:block bg-[radial-gradient(120%_80%_at_60%_-10%,#2a115b_0%,#0b0519_60%,#070312_100%)]" />
      <div className="pointer-events-none absolute inset-0 hidden dark:block opacity-[0.20] [background-image:linear-gradient(to_right,rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.05)_1px,transparent_1px)] [background-size:24px_24px]" />
      {/* noise */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-soft-light"
        style={{
          backgroundImage:
            'url("data:image/svg+xml;utf8,<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"1200\\" height=\\"600\\"><filter id=\\"n\\"><feTurbulence type=\\"fractalNoise\\" baseFrequency=\\"0.9\\" numOctaves=\\"4\\"/></filter><rect width=\\"100%\\" height=\\"100%\\" filter=\\"url(%23n)\\" opacity=\\"0.4\\"/></svg>")',
        }}
      />
      <AuroraBlobs />
      <FloatingShapes />
    </div>
  );
}

function AuroraBlobs() {
  const prefersReducedMotion = useReducedMotion();
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 0.55, scale: 1 }}
        transition={{ duration: 1.0 }}
        className="absolute -top-24 left-[-12%] h-[40rem] w-[40rem] rounded-full blur-3xl"
        style={{ background: 'conic-gradient(from 90deg, rgba(124,58,237,.28), rgba(168,85,247,.26), rgba(192,132,252,.24))', filter: 'blur(80px)' }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 0.45, scale: 1 }}
        transition={{ duration: 1.0, delay: 0.1 }}
        className="absolute -bottom-24 right-[-12%] h-[36rem] w-[36rem] rounded-full blur-3xl"
        style={{ background: 'conic-gradient(from 210deg, rgba(99,102,241,.22), rgba(124,58,237,.26), rgba(232,121,249,.22))', filter: 'blur(90px)' }}
      />
      {!prefersReducedMotion && (
        <motion.div
          aria-hidden
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 55, repeat: Infinity, ease: 'linear' }}
          className="absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 dark:border-white/5"
        />
      )}
    </div>
  );
}

function FloatingShapes() {
  const items = [
    { cx: 40, cy: 30, r: 14, opacity: 0.5 },
    { cx: 85, cy: 65, r: 10, opacity: 0.35 },
    { cx: 15, cy: 75, r: 8, opacity: 0.4 },
  ];
  return (
    <svg className="pointer-events-none absolute inset-0 -z-10 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
      {items.map((b, i) => (
        <motion.circle key={i} cx={b.cx} cy={b.cy} r={b.r} fill="url(#grad)" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: b.opacity, scale: 1 }} transition={{ duration: 1, delay: i * 0.2 }} />
      ))}
      <defs>
        <radialGradient id="grad">
          <stop offset="0%" stopColor="#cfb6ff" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/* -------------------------------- CTAs -------------------------------- */

function Chip({ children }) {
  return (
    <span className="rounded-full border border-violet-200/60 bg-white/85 px-3 py-1 text-zinc-700 shadow-[0_1px_0_0_rgba(109,40,217,.08)] dark:border-white/15 dark:bg-white/10 dark:text-zinc-300">
      {children}
    </span>
  );
}

function MagneticCTA({ href, children, ariaLabel }) {
  const [xy, setXy] = useState({ x: 0, y: 0 });
  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setXy({ x: (e.clientX - rect.left - rect.width / 2) / 6, y: (e.clientY - rect.top - rect.height / 2) / 6 });
  };
  const onLeave = () => setXy({ x: 0, y: 0 });

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="group inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-base font-semibold text-white shadow-[0_10px_40px_-12px_rgba(124,58,237,.45)] transition hover:from-fuchsia-600 hover:to-violet-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400"
      style={{ transform: `translate3d(${xy.x}px, ${xy.y}px, 0)` }}
    >
      {children}
      <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M13 5l7 7-7 7M5 12h14" />
      </svg>
    </Link>
  );
}

function EarlyEmailCapture() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle');
  const [msg, setMsg] = useState('');
  const onSubmit = (e) => {
    e.preventDefault();
    if (!/.+@.+\..+/.test(email)) { setState('error'); setMsg('Please enter a valid email.'); return; }
    setState('loading'); setMsg('');
    setTimeout(() => {
      setState('success'); setMsg('Invite reserved! Redirecting…');
      window.location.href = `/dashboard?email=${encodeURIComponent(email)}&source=hero-email`;
    }, 600);
  };
  return (
    <form onSubmit={onSubmit} className="mt-5 flex w-full max-w-xl gap-2" aria-live="polite">
      <div className="relative grow">
        <input
          type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your work email" inputMode="email" autoCapitalize="off" autoCorrect="off"
          className="w-full rounded-xl border border-violet-200/70 bg-white/85 px-4 py-3 text-sm outline-none shadow-[0_6px_28px_-14px_rgba(124,58,237,.18)] backdrop-blur placeholder:text-zinc-500 focus:ring-2 focus:ring-fuchsia-400 dark:border-white/15 dark:bg-white/10"
          aria-label="Work email"
        />
        <MailIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-70" />
      </div>
      <button type="submit" disabled={state === 'loading'} className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-100">
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

function CornerBadge() {
  return (
    <div className="pointer-events-none absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
      <SparkleIcon /> AI Enhanced
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
function GradientRing() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl"
         style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.55), 0 0 0 1px rgba(124,58,237,.18)', maskImage: 'radial-gradient(120% 120% at 50% 0%, rgba(0,0,0,.85), transparent 62%)' }} />
  );
}

/* --------------------------- Trust / Logos / KPIs --------------------------- */

function TrustBar() {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-zinc-600 dark:text-zinc-400">
      <span className="font-medium">Trusted by 1,200+ stores</span>
      <span className="inline-block h-1 w-1 rounded-full bg-zinc-400" />
      <span>GDPR-friendly</span>
      <span className="inline-block h-1 w-1 rounded-full bg-zinc-400" />
      <span>Secure uploads</span>
    </div>
  );
}

function LogoMarquee() {
  const prefersReducedMotion = useReducedMotion();
  const logos = ['brand-1.svg', 'brand-2.svg', 'brand-3.svg', 'brand-4.svg', 'brand-5.svg'];
  return (
    <div className="relative z-10 mx-auto mt-6 w-full max-w-7xl overflow-hidden px-6 py-6 md:px-12">
      <div className="mb-3 text-center text-[11px] uppercase tracking-widest text-zinc-500">POWERING TEAMS AT</div>
      <div className="[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className={`flex min-w-full items-center gap-10 opacity-80 hover:[animation-play-state:paused] ${prefersReducedMotion ? '' : 'animate-marquee'}`} style={prefersReducedMotion ? { animation: 'none' } : undefined}>
          {logos.concat(logos).map((src, i) => (
            <div key={i} className="relative h-8 w-28 opacity-100">
              <Image src={`/${src}`} alt="brand logo" fill className="object-contain" sizes="112px" />
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        .animate-marquee { animation: marquee 26s linear infinite; }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @media (prefers-reduced-motion: reduce) { .animate-marquee { animation: none; transform: none; } }
      `}</style>
    </div>
  );
}

function ProofMetrics() {
  const metrics = [
    { label: 'Higher conversion', to: 32, suffix: '%' },
    { label: 'Time saved per shoot', to: 90, suffix: '%' },
    { label: 'Avg render', to: 15, suffix: 's', reverse: true },
    { label: 'Uptime', to: 99.9, suffix: '%' },
  ];
  return (
    <div id="proof" className="relative z-10 mx-auto mt-4 max-w-7xl px-6 md:px-12">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {metrics.map((m, i) => <KPI key={i} label={m.label} to={m.to} suffix={m.suffix} reverse={m.reverse} />)}
      </div>
    </div>
  );
}

function KPI({ label, to, suffix = '', reverse = false }) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef(null);
  const [val, setVal] = useState(reverse ? to : 0);
  useEffect(() => {
    if (prefersReducedMotion) { setVal(to); return; }
    let frame; const el = ref.current; if (!el) return;
    let start = null; const duration = 1000;
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
    return () => { cancelAnimationFrame(frame); io.disconnect(); };
  }, [to, reverse, prefersReducedMotion]);

  return (
    <div ref={ref} className="rounded-xl border border-violet-200/70 bg-gradient-to-br from-white to-violet-50/40 p-4 text-center shadow-[0_10px_40px_-18px_rgba(124,58,237,.18)] dark:border-white/10 dark:bg-zinc-800">
      <div className="text-2xl font-extrabold">{val}{suffix}</div>
      <div className="text-xs text-zinc-600 dark:text-zinc-300">{label}</div>
    </div>
  );
}

/* ------------------------------ Compare Slider ------------------------------ */

function CompareSlider({ before, after, defaultPercent = 60, showLabels = true }) {
  const trackRef = useRef(null);
  const handleRef = useRef(null);
  const [pos, setPos] = useState(defaultPercent);
  const clamp = (v) => Math.max(0, Math.min(100, v));

  const moveToClientX = (clientX) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = clamp(((clientX - rect.left) / rect.width) * 100);
    setPos(x);
  };

  const onPointerDown = (e) => { e.preventDefault(); handleRef.current?.setPointerCapture?.(e.pointerId); moveToClientX(e.clientX); };
  const onPointerMove = (e) => { if (e.buttons !== 1) return; moveToClientX(e.clientX); };

  return (
    <div ref={trackRef} className="relative w-full overflow-hidden">
      {/* After */}
      <Image src={after.src} alt={after.alt} width={900} height={1200} priority className="h-auto w-full select-none object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
      {/* Before clipped */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <Image src={before.src} alt={before.alt} width={900} height={1200} className="h-full w-full object-cover" loading="lazy" sizes="(max-width: 1024px) 100vw, 50vw" />
      </div>

      {/* Labels */}
      {showLabels && (
        <>
          <div className="pointer-events-none absolute left-3 top-3 select-none rounded-full bg-white/95 px-2 py-1 text-[10px] font-semibold text-zinc-800 shadow-sm dark:bg-black/60 dark:text-white">Before</div>
          <div className="pointer-events-none absolute right-3 top-3 select-none rounded-full bg-fuchsia-500/90 px-2 py-1 text-[10px] font-semibold text-white shadow-sm">After</div>
        </>
      )}

      {/* Handle */}
      <div
        role="slider" aria-label="Compare before and after" aria-valuemin={0} aria-valuemax={100}
        aria-valuenow={Math.round(pos)} aria-valuetext={`${Math.round(pos)}% before`}
        tabIndex={0} ref={handleRef}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove}
        onKeyDown={(e) => { if (e.key === 'ArrowLeft') setPos((p) => clamp(p - 5)); if (e.key === 'ArrowRight') setPos((p) => clamp(p + 5)); if (e.key === 'Home') setPos(0); if (e.key === 'End') setPos(100); }}
        className="absolute top-0 cursor-ew-resize touch-none select-none"
        style={{ left: `calc(${pos}% - 1px)`, height: '100%' }}
      >
        {/* Rail line */}
        <div className="h-full w-0.5 bg-white/90 mix-blend-difference shadow-[0_0_0_1px_rgba(0,0,0,.2)]" />
        {/* Knob */}
        <div className="absolute top-1/2 -mt-4 -ml-[14px] left-[1px] h-8 w-8 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-[0_10px_28px_-8px_rgba(124,58,237,.6)] ring-2 ring-white/90 focus-visible:ring-4 focus-visible:ring-fuchsia-300/70 outline-none transition" />
      </div>

      {/* Accessible fallback (hidden visually) */}
      <input
        aria-label="Compare before and after"
        className="sr-only"
        type="range" min={0} max={100} value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
      />
    </div>
  );
}

/* ------------------------------- Features etc ------------------------------- */

function ValueProps() {
  return (
    <div id="features" className="relative z-10 bg-white px-6 py-16 text-zinc-900 dark:bg-zinc-900 dark:text-white md:px-12 lg:px-20">
      <motion.h2 initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.5 }} className="mx-auto mb-10 text-center text-3xl font-bold md:text-4xl">
        Designed to convert — and delight
      </motion.h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          { title: 'Image Enhancement', icon: '📷', desc: 'Studio quality at your fingertips.' },
          { title: 'AI Try-On', icon: '🧍‍♂️', desc: 'Preview products on real models.' },
          { title: 'Smart Descriptions', icon: '💡', desc: 'Auto-generate marketing copy.' },
        ].map(({ title, icon, desc }) => (
          <motion.div key={title} whileHover={{ y: -4 }} className="rounded-2xl border border-violet-200/70 bg-gradient-to-br from-white to-violet-50/40 p-6 shadow-[0_10px_40px_-18px_rgba(124,58,237,.18)] transition dark:border-white/10 dark:from-zinc-800 dark:to-zinc-800">
            <div className="mb-3 text-3xl" aria-hidden>{icon}</div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { title: 'Upload', desc: 'Add your product photo', icon: '📤' },
    { title: 'Enhance', desc: 'AI-powered quality', icon: '⚙️' },
    { title: 'Publish', desc: 'Export to your store', icon: '🚀' },
  ];
  return (
    <div id="how" className="relative z-10 bg-gradient-to-b from-[#f8f6ff] to-white px-6 py-20 text-zinc-900 dark:from-[#130a2b] dark:to-black dark:text-white md:px-12 lg:px-20">
      <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">How it works</h2>
      <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
        {steps.map((step, idx) => (
          <div key={idx} className="relative rounded-xl border border-violet-200/70 bg-white/85 px-6 py-8 text-center shadow-[0_18px_60px_-20px_rgba(124,58,237,.22)] backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-2xl text-white shadow-[0_10px_40px_-15px_rgba(124,58,237,.6)]">
              {step.icon}
            </div>
            <h3 className="text-xl font-semibold">{step.title}</h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{step.desc}</p>
            {idx < steps.length - 1 && (
              <svg className="pointer-events-none absolute right-[-18px] top-1/2 hidden -translate-y-1/2 md:block" width="36" height="2" viewBox="0 0 36 2" fill="none" aria-hidden>
                <path d="M0 1h36" stroke="currentColor" strokeOpacity="0.15" strokeDasharray="4 3" />
              </svg>
            )}
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link href="/dashboard" className="inline-flex items-center justify-center rounded-xl border border-violet-200/70 bg-white px-5 py-3 font-semibold text-zinc-900 shadow-[0_10px_40px_-18px_rgba(124,58,237,.18)] hover:bg-white/90">
          Start creating →
        </Link>
      </div>
    </div>
  );
}

/* ---------------------------- Fun / Ticker / CTA ---------------------------- */

function HumorBreak() {
  return (
    <div className="relative z-10 mx-auto max-w-5xl px-6 py-14 text-center md:px-12">
      <p className="text-lg text-zinc-700 dark:text-zinc-300">
        Pixel philosophy: <span className="font-semibold">beauty persuades</span>, speed convinces, and clarity closes. Also—yes—your coffee mug is now a fashion model.
      </p>
    </div>
  );
}

function TestimonialsTicker() {
  const prefersReducedMotion = useReducedMotion();
  const data = [
    '“CTR up 27% in 14 days.” — UrbanWear',
    '“Returns dropped 18% after try-on.” — SneakLab',
    '“Catalog refresh in a weekend.” — BloomBox',
    '“Consistent brand images = team peace.” — M.J.',
  ];
  return (
    <div className="relative z-10 mx-auto mb-2 mt-2 max-w-7xl overflow-hidden px-6 py-6 md:px-12">
      <div className="rounded-2xl border border-violet-200/70 bg-white/85 p-4 shadow-[0_12px_50px_-18px_rgba(124,58,237,.2)] backdrop-blur dark:border-white/10 dark:bg-white/5">
        <div className="relative [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <div className={`flex min-w-full items-center gap-10 ${prefersReducedMotion ? '' : 'animate-marquee2'}`} style={prefersReducedMotion ? { animation: 'none' } : undefined}>
            {data.concat(data).map((t, i) => (
              <div key={i} className="whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300">{t}</div>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        .animate-marquee2 { animation: marquee2 30s linear infinite; }
        @keyframes marquee2 { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @media (prefers-reduced-motion: reduce) { .animate-marquee2 { animation: none; } }
      `}</style>
    </div>
  );
}

function BottomCTA() {
  return (
    <div className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-10 text-center md:px-12">
      <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.5 }}
                  className="rounded-3xl border border-violet-200/70 bg-gradient-to-br from-white to-violet-50/40 p-8 shadow-[0_18px_70px_-20px_rgba(124,58,237,.22)] dark:border-white/10 dark:from-zinc-900 dark:to-zinc-900">
        <h3 className="text-2xl font-extrabold">Your competitors are already here.</h3>
        <p className="mt-2 text-zinc-600 dark:text-zinc-300">Join the beta, spend less time retouching, and more time selling. Limited invites this month.</p>
        <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <MagneticCTA href="/dashboard">Claim your invite</MagneticCTA>
          <Link href="#features" className="inline-flex items-center justify-center rounded-xl border border-violet-200/70 bg-white/90 px-5 py-3 text-sm font-semibold text-zinc-900 shadow-[0_10px_40px_-18px_rgba(124,58,237,.18)] backdrop-blur transition hover:bg-white">
            Explore features
          </Link>
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
        className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-50 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_50px_-15px_rgba(124,58,237,.48)] transition hover:from-fuchsia-600 hover:to-violet-600 backdrop-blur-xl"
        aria-label="Try it now"
      >
        Try now <span aria-hidden>→</span>
      </Link>
    </div>
  );
}
