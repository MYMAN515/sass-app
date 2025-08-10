// components/HeroSection.jsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/**
 * AI Product Imagery Landing — Startup-serious with playful wit
 * - Clear value prop above the fold
 * - Email capture, scarcity cue, strong CTAs
 * - Rich animations (respects prefers-reduced-motion)
 * - Micro-interactions, SVG decor, parallax, marquee, count-up KPIs
 * - All-in-one component for quick drop-in
 */

export default function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden font-sans text-black dark:text-white">
      <BackgroundFX />
      <NavStrip />
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

/* ------------------------------ Top Section -------------------------------- */

function TopHero() {
  return (
    <div className="relative z-10 px-6 md:px-12 lg:px-20 pt-24 pb-16 lg:pt-28 lg:pb-24">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-6xl"
      >
        {/* Badge + subtext */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-black/10 dark:border-white/15 bg-white/70 dark:bg-white/10 px-3 py-1 text-[11px] font-medium backdrop-blur-md">SERIOUS STARTUP • LIGHT SENSE OF HUMOR</span>
          <span className="text-[11px] text-zinc-600 dark:text-zinc-300">Clarity • Speed • Conversion-first</span>
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* Left copy */}
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight">
              Make <span className="bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent">product photos</span> that sell—<span className="whitespace-nowrap">without the studio.</span>
            </h1>

            <p className="mt-4 max-w-xl text-lg md:text-xl text-zinc-700 dark:text-zinc-300">
              Upload a photo. Get on-brand, studio-grade shots and AI try-ons in seconds. Your mug, your shoes—your empire. (Yes, even that hoodie.)
            </p>

            {/* Psychological micro-commitments */}
            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
              <span className="rounded-full bg-white/80 px-3 py-1 dark:bg-white/10">No credit card</span>
              <span className="rounded-full bg-white/80 px-3 py-1 dark:bg-white/10">Free starter credits</span>
              <span className="rounded-full bg-white/80 px-3 py-1 dark:bg-white/10">Cancel anytime</span>
            </div>

            {/* CTAs + Email capture */}
            <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center">
              <MagneticCTA href="/dashboard" ariaLabel="Get started for free">
                Get started free
              </MagneticCTA>
              <a
                href="#demo"
                className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white/60 px-5 py-3 text-base font-semibold text-zinc-900 backdrop-blur-md transition hover:bg-white dark:border-white/15 dark:bg-white/10 dark:text-white"
              >
                See live demo
              </a>
            </div>

            <EarlyEmailCapture />

            {/* Trust bar */}
            <TrustBar />
          </div>

          {/* Right: Interactive Compare */}
          <motion.div
            id="demo"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative isolate mx-auto w-full max-w-xl overflow-hidden rounded-2xl border border-black/10 bg-white/70 shadow-2xl backdrop-blur-md dark:border-white/10 dark:bg-white/5"
            aria-label="Before and after preview"
          >
            <CompareSlider
              before={{ src: '/demo-before.jpg', alt: 'Original product photo before enhancement' }}
              after={{ src: '/demo-after.jpg', alt: 'Enhanced product photo after AI processing' }}
              defaultPercent={62}
              showLabels
            />
            <CornerBadge />
          </motion.div>
        </div>

        {/* Scroll hint */}
        <div className="pointer-events-none mt-10 flex items-center justify-center text-xs text-zinc-500 dark:text-zinc-400">
          <span className="animate-bounce">Scroll to see the magic ↓</span>
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------- Navigation --------------------------------- */

function NavStrip() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`sticky top-0 z-40 w-full transition-all ${
        scrolled
          ? 'backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-black/40 border-b border-black/5 dark:border-white/10'
          : ''
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 md:px-8">
        <Link href="/" className="group inline-flex items-center gap-2" aria-label="Home">
          <Logo />
          <span className="font-semibold tracking-tight">AIStore Assistant</span>
          <span className="ml-2 rounded-full border border-black/10 bg-white/70 px-2 py-0.5 text-[10px] text-zinc-600 backdrop-blur dark:border-white/15 dark:bg-white/10 dark:text-zinc-300">
            Beta
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#how">How it works</NavLink>
          <NavLink href="#proof">Results</NavLink>
          <NavLink href="#faq">FAQ</NavLink>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-lg border border-black/10 px-3 py-1.5 text-sm font-medium hover:bg-white dark:border-white/15 dark:hover:bg-white/10 md:inline-block"
          >
            Sign in
          </Link>
          <MagneticCTA href="/dashboard">Start free</MagneticCTA>
        </div>
      </nav>
    </div>
  );
}

function NavLink({ href, children }) {
  return (
    <a href={href} className="text-sm text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white">
      {children}
    </a>
  );
}

function Logo() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden>
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#f43f5e" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="8" stroke="url(#g)" strokeWidth="2" />
      <path d="M10 22c3-6 9-6 12 0" stroke="url(#g)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2" fill="url(#g)" />
      <circle cx="20" cy="12" r="2" fill="url(#g)" />
    </svg>
  );
}

/* -------------------------------- Background -------------------------------- */

function BackgroundFX() {
  return (
    <div className="absolute inset-0 -z-20">
      {/* Light */}
      <div className="h-full w-full bg-[radial-gradient(75%_100%_at_50%_0%,#eef2ff_0%,#ffffff_35%,#fff5f7_100%)] dark:hidden" />
      {/* Dark */}
      <div className="hidden h-full w-full dark:block bg-[radial-gradient(120%_80%_at_60%_-10%,#3b1e82_0%,#0f0320_55%,#080312_100%)]" />
      {/* Grid */}
      <div className="pointer-events-none absolute inset-0 hidden dark:block opacity-25 [background-image:linear-gradient(to_right,rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.06)_1px,transparent_1px)] [background-size:24px_24px]" />
      {/* Noise */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-soft-light"
        style={{
          backgroundImage:
            'url("data:image/svg+xml;utf8,\
<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'1200\' height=\'600\'><filter id=\'n\'>\
<feTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/></filter>\
<rect width=\'100%\' height=\'100%\' filter=\'url(%23n)\' opacity=\'0.4\'/></svg>")',
        }}
      />
      {/* Aurora blobs */}
      <AuroraBlobs />
      {/* Floating SVGs */}
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
        animate={{ opacity: 0.6, scale: 1 }}
        transition={{ duration: 1.2 }}
        className="absolute -top-24 left-[-10%] h-[40rem] w-[40rem] rounded-full blur-3xl"
        style={{
          background: 'conic-gradient(from 90deg, rgba(99,102,241,.35), rgba(236,72,153,.35), rgba(244,63,94,.35))',
          filter: 'blur(80px)',
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 0.55, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.1 }}
        className="absolute -bottom-24 right-[-10%] h-[36rem] w-[36rem] rounded-full blur-3xl"
        style={{
          background: 'conic-gradient(from 200deg, rgba(34,197,94,.35), rgba(59,130,246,.35), rgba(236,72,153,.35))',
          filter: 'blur(90px)',
        }}
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
        <motion.circle
          key={i}
          cx={b.cx}
          cy={b.cy}
          r={b.r}
          fill="url(#grad)"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: b.opacity, scale: 1 }}
          transition={{ duration: 1, delay: i * 0.2 }}
        />
      ))}
      <defs>
        <radialGradient id="grad">
          <stop offset="0%" stopColor="#f0abfc" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/* ---------------------------------- CTAs ------------------------------------ */

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
      className="group inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition hover:from-fuchsia-600 hover:to-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400"
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
    // Fake async, then hard-redirect to keep friction low
    setTimeout(() => {
      setState('success');
      setMsg('Invite reserved! Redirecting…');
      window.location.href = `/dashboard?email=${encodeURIComponent(email)}&source=hero-email`;
    }, 600);
  };

  return (
    <form onSubmit={onSubmit} className="mt-5 flex w-full max-w-xl gap-2" aria-live="polite">
      <div className="relative grow">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your work email"
          className="w-full rounded-xl border border-black/10 bg-white/70 px-4 py-3 text-sm outline-none backdrop-blur placeholder:text-zinc-500 focus:ring-2 focus:ring-fuchsia-400 dark:border-white/15 dark:bg-white/10"
          aria-label="Work email"
        />
        <SVGMail className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-70" />
      </div>
      <button
        type="submit"
        disabled={state === 'loading'}
        className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-100"
      >
        {state === 'loading' ? 'Reserving…' : 'Get beta invite'}
      </button>
      {msg && (
        <div className={`ml-2 self-center text-xs ${state === 'error' ? 'text-rose-600' : 'text-emerald-600'}`}>{msg}</div>
      )}
    </form>
  );
}

function SVGMail(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...props} aria-hidden>
      <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function CornerBadge() {
  return (
    <div className="pointer-events-none absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
      <SparkleIcon /> AI Enhanced
    </div>
  );
}

function SparkleIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2l1.6 4.4L18 8l-4.4 1.6L12 14l-1.6-4.4L6 8l4.4-1.6L12 2z"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="currentColor"
        opacity="0.9"
      />
    </svg>
  );
}

/* --------------------------------- Trust Bar -------------------------------- */

function TrustBar() {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
      <span className="font-medium">Trusted by 1,200+ stores</span>
      <span className="inline-block h-1 w-1 rounded-full bg-zinc-400" />
      <span>GDPR-friendly</span>
      <span className="inline-block h-1 w-1 rounded-full bg-zinc-400" />
      <span>Secure uploads</span>
    </div>
  );
}

/* ----------------------------- Compare Slider ------------------------------- */

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
    <div ref={trackRef} className="relative w-full overflow-hidden">
      {/* After (base) */}
      <Image src={after.src} alt={after.alt} width={900} height={1200} priority className="h-auto w-full select-none object-cover" />
      {/* Before overlay clipped */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <Image src={before.src} alt={before.alt} width={900} height={1200} className="h-full w-full object-cover" priority={false} />
      </div>

      {/* Labels */}
      {showLabels && (
        <>
          <div className="pointer-events-none absolute left-3 top-3 select-none rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-zinc-800 shadow-sm dark:bg-black/60 dark:text-white">
            Before
          </div>
          <div className="pointer-events-none absolute right-3 top-3 select-none rounded-full bg-rose-500/90 px-2 py-1 text-[10px] font-semibold text-white shadow-sm">
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
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-2 py-1 text-xs text-white">Drag</div>
      </div>

      {/* Range fallback */}
      <div className="absolute inset-x-0 bottom-0 z-10 m-0 flex items-center gap-2 bg-gradient-to-t from-black/15 to-transparent px-4 pb-4 pt-10">
        <input
          aria-label="Compare before and after"
          className="h-1 w-full cursor-ew-resize appearance-none rounded-full bg-zinc-300 outline-none accent-fuchsia-600 dark:bg-zinc-700"
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

/* ----------------------------- Logos Marquee -------------------------------- */

function LogoMarquee() {
  const logos = ['brand-1.svg', 'brand-2.svg', 'brand-3.svg', 'brand-4.svg', 'brand-5.svg'];
  return (
    <div className="relative z-10 mx-auto mt-6 w-full max-w-7xl overflow-hidden px-6 py-6 md:px-12">
      <div className="mb-3 text-center text-[11px] uppercase tracking-widest text-zinc-500">POWERING TEAMS AT</div>
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
        .animate-marquee {
          animation: marquee 26s linear infinite;
        }
        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}

/* ------------------------------- Proof Metrics ------------------------------ */

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
    const endVal = reverse ? (to <= 15 ? to : 0) : to; // small gag for "15s avg" staying honest
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Number((startVal + (endVal - startVal) * eased).toFixed(1)));
      if (p < 1) frame = requestAnimationFrame(step);
    };
    const io = new IntersectionObserver(
      (ents) => ents.forEach((e) => e.isIntersecting && requestAnimationFrame(step)),
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
    };
  }, [to, reverse]);

  return (
    <div
      ref={ref}
      className="rounded-xl border border-black/10 bg-white p-4 text-center dark:border-white/10 dark:bg-zinc-800"
    >
      <div className="text-2xl font-extrabold">
        {val}
        {suffix}
      </div>
      <div className="text-xs text-zinc-600 dark:text-zinc-300">{label}</div>
    </div>
  );
}

/* --------------------------------- Features -------------------------------- */

function ValueProps() {
  return (
    <div id="features" className="relative z-10 bg-white px-6 py-16 text-zinc-900 dark:bg-zinc-900 dark:text-white md:px-12 lg:px-20">
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5 }}
        className="mx-auto mb-10 text-center text-3xl font-bold md:text-4xl"
      >
        Designed to convert — and delight
      </motion.h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          { title: 'Image Enhancement', icon: '📷', desc: 'Studio quality at your fingertips.' },
          { title: 'AI Try-On', icon: '🧍‍♂️', desc: 'Preview products on real models.' },
          { title: 'Smart Descriptions', icon: '💡', desc: 'Auto-generate marketing copy.' },
        ].map(({ title, icon, desc }) => (
          <motion.div
            key={title}
            whileHover={{ y: -4 }}
            className="rounded-2xl border border-black/10 bg-gradient-to-br from-white to-zinc-50 p-6 shadow-md transition dark:border-white/10 dark:from-zinc-800 dark:to-zinc-800"
          >
            <div className="mb-3 text-3xl" aria-hidden>
              {icon}
            </div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------- How It Works ------------------------------- */

function HowItWorks() {
  const steps = [
    { title: 'Upload', desc: 'Add your product photo', icon: '📤' },
    { title: 'Enhance', desc: 'AI-powered quality', icon: '⚙️' },
    { title: 'Publish', desc: 'Export to your store', icon: '🚀' },
  ];

  return (
    <div id="how" className="relative z-10 bg-gradient-to-b from-[#0f0320] to-black px-6 py-20 text-white md:px-12 lg:px-20">
      <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">How it works</h2>
      <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
        {steps.map((step, idx) => (
          <div key={idx} className="relative rounded-xl border border-white/10 bg-white/5 px-6 py-8 text-center shadow-xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-fuchsia-600 text-2xl">{step.icon}</div>
            <h3 className="text-xl font-semibold">{step.title}</h3>
            <p className="mt-1 text-sm text-zinc-300">{step.desc}</p>

            {/* Connector line (SVG) */}
            {idx < steps.length - 1 && (
              <svg className="pointer-events-none absolute right-[-18px] top-1/2 hidden -translate-y-1/2 md:block" width="36" height="2" viewBox="0 0 36 2" fill="none" aria-hidden>
                <path d="M0 1h36" stroke="white" strokeOpacity="0.25" strokeDasharray="4 3" />
              </svg>
            )}
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link href="/dashboard" className="inline-flex items-center justify-center rounded-xl bg-white/90 px-5 py-3 font-semibold text-zinc-900 hover:bg-white">
          Start creating →
        </Link>
      </div>
    </div>
  );
}

/* -------------------------------- Fun Section ------------------------------- */

function HumorBreak() {
  return (
    <div className="relative z-10 mx-auto max-w-5xl px-6 py-14 text-center md:px-12">
      <p className="text-lg text-zinc-700 dark:text-zinc-300">
        Philosophy of pixels: <span className="font-semibold">beauty persuades</span>, speed convinces, and clarity closes. Also, your coffee mug deserves a modeling career.
      </p>
    </div>
  );
}

/* ------------------------------ Testimonials Ticker ------------------------- */

function TestimonialsTicker() {
  const data = [
    '“CTR up 27% in 2 weeks.” — UrbanWear',
    '“Returns dropped 18% after try-on.” — SneakLab',
    '“We shipped a catalog update in a weekend.” — BloomBox',
    '“Finally consistent brand images. Sanity restored.” — M.J.',
  ];
  return (
    <div className="relative z-10 mx-auto mb-2 mt-2 max-w-7xl overflow-hidden px-6 py-6 md:px-12">
      <div className="rounded-2xl border border-black/10 bg-white/70 p-4 backdrop-blur dark:border-white/10 dark:bg-white/5">
        <div className="relative [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <div className="animate-marquee2 flex min-w-full items-center gap-10">
            {data.concat(data).map((t, i) => (
              <div key={i} className="whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300">
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        .animate-marquee2 {
          animation: marquee2 30s linear infinite;
        }
        @keyframes marquee2 {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}

/* --------------------------------- Bottom CTA ------------------------------- */

function BottomCTA() {
  return (
    <div className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-10 text-center md:px-12">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5 }}
        className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-zinc-50 p-8 shadow-xl dark:border-white/10 dark:from-zinc-900 dark:to-zinc-900"
      >
        <h3 className="text-2xl font-extrabold">Your competitors are already here.</h3>
        <p className="mt-2 text-zinc-600 dark:text-zinc-300">
          Join the beta, spend less time retouching, and more time selling. Limited invites this month.
        </p>
        <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <MagneticCTA href="/dashboard">Claim your invite</MagneticCTA>
          <Link
            href="#features"
            className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white/60 px-5 py-3 text-sm font-semibold text-zinc-900 backdrop-blur transition hover:bg-white dark:border-white/15 dark:bg-white/10 dark:text-white"
          >
            Explore features
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------ Sticky Mobile CTA --------------------------- */

function StickyMobileCTA() {
  return (
    <div className="md:hidden">
      <Link
        href="/dashboard"
        className="fixed bottom-4 right-4 z-50 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-indigo-700/20 transition hover:bg-fuchsia-600"
        aria-label="Try it now"
      >
        Try now <span aria-hidden>→</span>
      </Link>
    </div>
  );
}

/* --------------------------------- Utilities -------------------------------- */

function NavDividerDot() {
  return <span className="inline-block h-1 w-1 rounded-full bg-zinc-400" />;
}
function NavSpacer() {
  return <span className="mx-2 opacity-40">•</span>;
}

/* ------------------------------- Helper Components -------------------------- */

function SVGDivider() {
  return (
    <svg width="100%" height="16" viewBox="0 0 800 16" fill="none" aria-hidden>
      <path d="M0 8h800" stroke="currentColor" strokeOpacity="0.06" strokeWidth="2" />
    </svg>
  );
}
