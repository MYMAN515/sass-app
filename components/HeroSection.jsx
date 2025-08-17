// components/HeroSection.jsx
'use client';

import Link from 'next/link';
import { motion, useAnimation, useMotionValue, useTransform, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/**
 * ──────────────────────────────────────────────────────────────────────────────
 *  "PORTAL: WEIRD MODE" — ultra-creative, mobile-first hero
 *  - Liquid goo portal (SVG goo filter + metaballs)
 *  - Conic rings + text ring orbit
 *  - Cursor-follow "eye" inside the portal
 *  - Tap to morph (circle ⇄ rounded-square) on mobile
 *  - Sticky mobile CTA
 *  - Reduced-motion aware
 * ──────────────────────────────────────────────────────────────────────────────
 */

export default function HeroSection() {
  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden bg-white text-zinc-900 dark:bg-[#07070b] dark:text-white">
      <Backdrop />
      <HeroCore />
      <StickyMobileCTA />
    </section>
  );
}

/* -------------------------------- Backdrop --------------------------------- */

function Backdrop() {
  return (
    <>
      <NoiseOverlay />
      <StarDust />
      <CornerGradients />
    </>
  );
}

function NoiseOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-20 opacity-[0.045] mix-blend-soft-light"
      style={{
        backgroundImage:
          'url("data:image/svg+xml;utf8,\
<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'1600\' height=\'900\'><filter id=\'n\'>\
<feTurbulence type=\'fractalNoise\' baseFrequency=\'0.95\' numOctaves=\'4\'/></filter>\
<rect width=\'100%\' height=\'100%\' filter=\'url(%23n)\' opacity=\'0.55\'/></svg>")',
      }}
    />
  );
}

function StarDust() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <svg className="h-full w-full opacity-40 dark:opacity-25" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        <defs>
          <radialGradient id="sd" cx="50%" cy="50%">
            <stop offset="0%" stopColor="white" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        {Array.from({ length: 36 }).map((_, i) => {
          const r = Math.random() * 0.6 + 0.15;
          const x = Math.random() * 100;
          const y = Math.random() * 100;
          const d = 8 + Math.random() * 18;
          return (
            <motion.circle
              key={i}
              cx={x}
              cy={y}
              r={r}
              fill="url(#sd)"
              initial={{ opacity: 0.2 }}
              animate={{ opacity: [0.1, 0.7, 0.1] }}
              transition={{ duration: d, repeat: Infinity, delay: Math.random() * 5 }}
            />
          );
        })}
      </svg>
    </div>
  );
}

function CornerGradients() {
  return (
    <>
      <div className="pointer-events-none absolute -left-32 -top-32 -z-10 h-[32rem] w-[32rem] rounded-full blur-3xl [background:conic-gradient(from_0deg,rgba(99,102,241,.28),rgba(236,72,153,.28),rgba(34,197,94,.28),rgba(59,130,246,.28),rgba(99,102,241,.28))]" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 -z-10 h-[28rem] w-[28rem] rounded-full blur-3xl [background:conic-gradient(from_180deg,rgba(34,197,94,.25),rgba(244,63,94,.25),rgba(168,85,247,.25),rgba(34,197,94,.25))]" />
    </>
  );
}

/* --------------------------------- Core ------------------------------------ */

function HeroCore() {
  const prefersReducedMotion = useReducedMotion();
  const wrapRef = useRef(null);

  // Parallax tilt
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotY = useTransform(mx, [-60, 60], [-8, 8]);
  const rotX = useTransform(my, [-60, 60], [8, -8]);

  const onMove = (e) => {
    const rect = wrapRef.current?.getBoundingClientRect?.();
    if (!rect) return;
    const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    mx.set(x * 60);
    my.set(y * 60);
  };

  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <div
      ref={wrapRef}
      onMouseMove={!prefersReducedMotion ? onMove : undefined}
      onMouseLeave={!prefersReducedMotion ? onLeave : undefined}
      className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col items-center justify-center px-5 pb-24 pt-28 sm:px-8 md:pt-24"
    >
      {/* Header / tagline */}
      <div className="mb-6 text-center text-[10px] tracking-[0.35em] text-zinc-600 dark:text-zinc-300">
        WEIRD • CLEAN • CONVERTS
      </div>

      <div className="flex w-full flex-col items-center gap-10 lg:flex-row">
        {/* Copy */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="order-2 max-w-xl text-center lg:order-1 lg:text-left"
        >
          <WeirdHeadline />
          <p className="mt-3 text-base text-zinc-700 dark:text-zinc-300 md:text-lg">
            Upload any photo. Our portal liquifies it into studio-grade shots and try-ons. It’s odd, bold, and built to sell.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row lg:items-start">
            <PrimaryCTA />
            <Link
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-xl border border-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              How it works →
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-zinc-600 dark:text-zinc-400 lg:justify-start">
            <Chip>Free starter credits</Chip>
            <Chip>No card required</Chip>
            <Chip>GDPR-friendly</Chip>
          </div>
        </motion.div>

        {/* Portal */}
        <motion.div
          style={!prefersReducedMotion ? { rotateY: rotY, rotateX: rotX } : undefined}
          className="order-1 mx-auto aspect-square w-[min(92vw,34rem)] max-w-none sm:w-[min(78vw,34rem)] lg:order-2"
          aria-label="Weird animated portal"
        >
          <PortalWeird />
        </motion.div>
      </div>
    </div>
  );
}

/* ------------------------------ Weird Headline ------------------------------ */

function WeirdHeadline() {
  // Chromatic aberration layers + subtle glitch
  return (
    <div className="relative">
      <h1 className="text-balance text-4xl font-extrabold leading-[1.04] tracking-tight md:text-5xl">
        Make <span className="bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent">strange</span> product
        visuals that sell.
      </h1>
      {/* RGB ghost layers (aria-hidden) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 select-none mix-blend-screen opacity-60"
      >
        <p className="text-balance translate-x-[1px] translate-y-[1px] text-4xl font-extrabold leading-[1.04] text-rose-500/60 md:text-5xl">
          Make strange product visuals that sell.
        </p>
        <p className="text-balance -translate-x-[1px] -translate-y-[1px] text-4xl font-extrabold leading-[1.04] text-indigo-500/60 md:text-5xl">
          Make strange product visuals that sell.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------- Portal Core -------------------------------- */

function PortalWeird() {
  const prefersReducedMotion = useReducedMotion();
  const ringAnim = useAnimation();
  const [morph, setMorph] = useState(false); // tap to morph for mobile

  useEffect(() => {
    if (prefersReducedMotion) return;
    ringAnim.start({
      rotate: 360,
      transition: { duration: 30, repeat: Infinity, ease: 'linear' },
    });
  }, [prefersReducedMotion, ringAnim]);

  return (
    <div
      role="button"
      aria-label="Tap to morph portal"
      onClick={() => setMorph((s) => !s)}
      className="group relative h-full w-full"
    >
      {/* Outer energy ring */}
      <motion.div
        aria-hidden
        animate={ringAnim}
        className="absolute inset-0 rounded-[50%] border border-white/25 shadow-[inset_0_0_70px_rgba(255,255,255,.15),0_0_120px_rgba(168,85,247,.28)]"
        style={{
          background:
            'conic-gradient(from_0deg,rgba(99,102,241,.45),rgba(236,72,153,.45),rgba(34,197,94,.45),rgba(59,130,246,.45),rgba(99,102,241,.45))',
        }}
      />

      {/* Morphing inner mask (circle <-> rounded square) */}
      <motion.div
        className="absolute inset-2 p-[3px]"
        animate={{ borderRadius: morph ? '28%' : '9999px' }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      >
        <div className="relative h-full w-full overflow-hidden bg-black/80">
          {/* Conic swirl */}
          <motion.div
            aria-hidden
            animate={!prefersReducedMotion ? { rotate: 360 } : { rotate: 0 }}
            transition={!prefersReducedMotion ? { duration: 60, repeat: Infinity, ease: 'linear' } : {}}
            className="absolute inset-0 opacity-40"
            style={{
              background:
                'conic-gradient(from_90deg_at_50%_50%,#a78bfa,#f472b6,#22c55e,#60a5fa,#a78bfa)',
              mixBlendMode: 'screen',
            }}
          />

          {/* Gooey metaballs */}
          <GooeyField intensity={morph ? 1.2 : 1} />

          {/* Text ring orbit */}
          <TextRing text="ENTER • THE • PORTAL • MAKE • STRANGE • SELL • " speed={morph ? 9 : 14} />

          {/* Cursor/Tap-follow eye */}
          <PortalEye />
        </div>
      </motion.div>

      {/* Orbiting CTA satellite */}
      <OrbitingCTA speed={morph ? 9 : 14} />
    </div>
  );
}

/* -------------------------------- Goo Field -------------------------------- */

function GooeyField({ intensity = 1 }) {
  const prefersReducedMotion = useReducedMotion();
  const blobs = [
    { size: 140, x: 16, y: 30, d: 7 },
    { size: 110, x: 68, y: 42, d: 9 },
    { size: 95, x: 42, y: 72, d: 6.5 },
    { size: 120, x: 80, y: 70, d: 11 },
  ];

  return (
    <div className="absolute inset-0" style={{ filter: 'url(#goo)' }}>
      <svg width="0" height="0" aria-hidden className="absolute">
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 18 -8"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      {blobs.map((b, i) => (
        <motion.div
          key={i}
          aria-hidden
          className="absolute rounded-full opacity-80"
          style={{
            width: b.size,
            height: b.size,
            left: `${b.x}%`,
            top: `${b.y}%`,
            background:
              'radial-gradient(circle at 30% 30%, rgba(255,255,255,.85), rgba(168,85,247,.6), rgba(236,72,153,.5), transparent 70%)',
            mixBlendMode: 'screen',
          }}
          animate={
            prefersReducedMotion
              ? {}
              : {
                  x: [0, 12 * intensity, -6 * intensity, 0],
                  y: [0, -10 * intensity, 8 * intensity, 0],
                  scale: [1, 1.08, 0.96, 1],
                }
          }
          transition={{
            duration: b.d + i,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.4,
          }}
        />
      ))}
    </div>
  );
}

/* -------------------------------- Text Ring -------------------------------- */

function TextRing({ text, radius = 46, speed = 14 }) {
  const prefersReducedMotion = useReducedMotion();
  const repeated = (text + ' ').repeat(10);

  return (
    <motion.svg
      viewBox="0 0 200 200"
      className="pointer-events-none absolute left-1/2 top-1/2 h-[40%] w-[40%] -translate-x-1/2 -translate-y-1/2"
      aria-hidden
      initial={false}
      animate={!prefersReducedMotion ? { rotate: 360 } : { rotate: 0 }}
      transition={!prefersReducedMotion ? { duration: speed, repeat: Infinity, ease: 'linear' } : {}}
    >
      <defs>
        <path id="circlePath" d={`M 100,100 m -${radius},0 a ${radius},${radius} 0 1,1 ${radius * 2},0 a ${radius},${radius} 0 1,1 -${radius * 2},0`} />
      </defs>
      <text fill="rgba(255,255,255,.85)" fontSize="9" fontWeight="700" letterSpacing="2px">
        <textPath href="#circlePath" startOffset="0%">
          {repeated}
        </textPath>
      </text>
    </motion.svg>
  );
}

/* --------------------------------- The Eye --------------------------------- */

function PortalEye() {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (prefersReducedMotion) return;
    const el = containerRef.current?.closest?.('[role="button"]');
    if (!el) return;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      setPos({ x, y });
    };
    el.addEventListener('mousemove', onMove);
    return () => el.removeEventListener('mousemove', onMove);
  }, [prefersReducedMotion]);

  const px = Math.max(-0.7, Math.min(0.7, pos.x));
  const py = Math.max(-0.7, Math.min(0.7, pos.y));

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0">
      {/* sclera */}
      <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/90 blur-[1px]" />
      {/* iris/pupil */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(circle at 50% 40%, #1f2937 0%, #000 40%, #000 70%)',
          boxShadow: '0 0 22px rgba(255,255,255,.25)',
        }}
        animate={{ x: px * 26, y: py * 26 }}
        transition={{ type: 'spring', stiffness: 120, damping: 12 }}
      />
      {/* highlight */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-[calc(50%-12px)] -translate-y-[calc(50%-12px)] rounded-full bg-white/70"
        animate={{ x: px * 16, y: py * 10 }}
        transition={{ type: 'spring', stiffness: 120, damping: 16 }}
      />
    </div>
  );
}

/* ------------------------------ Orbiting CTA -------------------------------- */

function OrbitingCTA({ speed = 14 }) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-1/2"
      initial={{ rotate: 0 }}
      animate={!prefersReducedMotion ? { rotate: 360 } : { rotate: 0 }}
      transition={!prefersReducedMotion ? { duration: speed, repeat: Infinity, ease: 'linear' } : {}}
      style={{ originX: 0.5, originY: 0.5 }}
    >
      <div className="pointer-events-auto relative -translate-x-1/2 -translate-y-[12.25rem] sm:-translate-y-[12.5rem] md:-translate-y-[13rem] lg:-translate-y-[12.5rem]">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/90 px-4 py-2 text-[12px] font-semibold text-zinc-900 shadow-sm transition hover:bg-white dark:border-white/20 dark:bg-white/10 dark:text-white"
          aria-label="Try it now"
        >
          Try it now <span aria-hidden>→</span>
        </Link>
      </div>
    </motion.div>
  );
}

/* --------------------------------- Buttons --------------------------------- */

function PrimaryCTA() {
  const [hover, setHover] = useState(false);
  return (
    <Link
      href="/dashboard"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="group inline-flex items-center justify-center rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-100"
      aria-label="Get started"
    >
      {hover ? 'Jump in →' : 'Enter the Portal'}
    </Link>
  );
}

function StickyMobileCTA() {
  return (
    <div className="lg:hidden">
      <Link
        href="/dashboard"
        className="fixed inset-x-4 bottom-5 z-50 flex items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-indigo-700/20 transition hover:bg-fuchsia-600"
        aria-label="Start now"
      >
        Start now →
      </Link>
    </div>
  );
}

/* --------------------------------- Bits ------------------------------------ */

function Chip({ children }) {
  return (
    <span className="rounded-full border border-zinc-300 bg-white px-3 py-1 dark:border-white/15 dark:bg-white/10">
      {children}
    </span>
  );
}
