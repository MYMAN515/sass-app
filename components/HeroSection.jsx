// components/HeroSection.jsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useAnimation, useMotionValue, useTransform, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/**
 * Portal Hero — Minimal, weird, and striking:
 * - Central "portal" (animated conic gradient) reveals a moving scene inside a circular mask.
 * - Mouse moves warp the portal subtly (parallax).
 * - CTA orbits around the portal like a satellite.
 * - Works great in dark & light. Respect reduced motion.
 */

export default function HeroSection() {
  return (
    <section className="relative min-h-[92vh] w-full overflow-hidden bg-white text-zinc-900 dark:bg-[#0a0a0f] dark:text-white">
      <BackgroundNoise />
      <StarField />
      <HeroCore />
    </section>
  );
}

/* ----------------------------- CORE LAYOUT ---------------------------------- */

function HeroCore() {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef(null);

  // Track mouse for parallax
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rot = useTransform(mx, [-50, 50], [-6, 6]);
  const tilt = useTransform(my, [-50, 50], [6, -6]);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    mx.set(x * 50);
    my.set(y * 50);
  };

  const handleMouseLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={!prefersReducedMotion ? handleMouseMove : undefined}
      onMouseLeave={!prefersReducedMotion ? handleMouseLeave : undefined}
      className="relative z-10 mx-auto flex min-h-[92vh] max-w-7xl flex-col items-center justify-center px-6 py-16 md:px-10"
    >
      {/* Tagline */}
      <div className="mb-5 text-[10px] tracking-[0.25em] text-zinc-600 dark:text-zinc-300">
        ENTER • THE • WEIRD • BUT • BEAUTIFUL
      </div>

      <div className="relative flex w-full flex-col items-center gap-8 lg:flex-row lg:items-center">
        {/* Left copy */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="order-2 max-w-xl text-center lg:order-1 lg:text-left"
        >
          <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight md:text-5xl">
            Step through the <span className="bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent">Portal</span> to better product visuals.
          </h1>
          <p className="mt-3 text-base text-zinc-700 dark:text-zinc-300 md:text-lg">
            Drop any image. Watch it warp into studio-grade shots and try-ons. No sets, no stress—just results that feel a little unreal.
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
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400">
            <Chip>Free starter credits</Chip>
            <Chip>No card required</Chip>
            <Chip>GDPR-friendly</Chip>
          </div>
        </motion.div>

        {/* Portal */}
        <motion.div
          style={!prefersReducedMotion ? { rotateY: rot, rotateX: tilt } : undefined}
          className="order-1 mx-auto aspect-square w-[min(82vw,34rem)] max-w-none lg:order-2"
          aria-label="Animated portal preview"
        >
          <Portal />
        </motion.div>
      </div>
    </div>
  );
}

/* ----------------------------- PORTAL VISUAL -------------------------------- */

function Portal() {
  const prefersReducedMotion = useReducedMotion();
  const ringControls = useAnimation();

  useEffect(() => {
    if (prefersReducedMotion) return;
    ringControls.start({
      rotate: 360,
      transition: { duration: 36, repeat: Infinity, ease: 'linear' },
    });
  }, [prefersReducedMotion, ringControls]);

  return (
    <div className="relative h-full w-full">
      {/* Outer glow */}
      <motion.div
        aria-hidden
        animate={!prefersReducedMotion ? { opacity: [0.7, 1, 0.7] } : { opacity: 0.9 }}
        transition={!prefersReducedMotion ? { duration: 6, repeat: Infinity } : {}}
        className="absolute inset-0 rounded-full blur-2xl"
        style={{
          background:
            'conic-gradient(from 0deg, rgba(99,102,241,.55), rgba(244,63,94,.55), rgba(236,72,153,.55), rgba(34,197,94,.55), rgba(99,102,241,.55))',
          filter: 'blur(40px)',
        }}
      />

      {/* Core ring */}
      <motion.div
        aria-hidden
        animate={ringControls}
        className="absolute inset-0 rounded-full border border-white/20 dark:border-white/10"
        style={{
          boxShadow:
            'inset 0 0 60px rgba(255,255,255,.12), inset 0 0 180px rgba(255,255,255,.06), 0 0 120px rgba(99,102,241,.25)',
        }}
      />

      {/* Inner scene masked by circle */}
      <div className="absolute inset-3 rounded-full p-[2px]">
        <div className="relative h-full w-full overflow-hidden rounded-full bg-black/80">
          {/* Animated conic swirl overlay */}
          <motion.div
            aria-hidden
            animate={!prefersReducedMotion ? { rotate: 360 } : { rotate: 0 }}
            transition={!prefersReducedMotion ? { duration: 60, repeat: Infinity, ease: 'linear' } : {}}
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                'conic-gradient(from 90deg at 50% 50%, #a78bfa, #f472b6, #22c55e, #60a5fa, #a78bfa)',
              mixBlendMode: 'screen',
            }}
          />

          {/* Moving scene (replace with your own assets) */}
          <motion.div
            initial={{ scale: 1.05 }}
            animate={!prefersReducedMotion ? { scale: [1.05, 1.1, 1.05], x: [0, -10, 0], y: [0, 6, 0] } : { scale: 1.06 }}
            transition={!prefersReducedMotion ? { duration: 16, repeat: Infinity } : {}}
            className="absolute inset-0"
          >
            <Image
              src="/portal-scene.jpg"
              alt="Portal scene preview"
              fill
              priority
              className="object-cover opacity-90"
            />
          </motion.div>

          {/* Scanline gloss */}
          <motion.div
            aria-hidden
            className="absolute inset-0"
            animate={!prefersReducedMotion ? { backgroundPosition: ['0% 0%', '0% 100%'] } : {}}
            transition={!prefersReducedMotion ? { duration: 5, repeat: Infinity, ease: 'easeInOut' } : {}}
            style={{
              backgroundImage:
                'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,.15) 15%, transparent 30%)',
              backgroundSize: '100% 400%',
              mixBlendMode: 'soft-light',
            }}
          />

          {/* Orbiting CTA */}
          <OrbitingCTA />
        </div>
      </div>

      {/* Subtle inner shadow for depth */}
      <div className="absolute inset-0 rounded-full shadow-[inset_0_0_40px_rgba(0,0,0,.65)]" aria-hidden />
    </div>
  );
}

/* ------------------------------- CTA ELEMENTS ------------------------------- */

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

function OrbitingCTA() {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      aria-hidden
      className="absolute left-1/2 top-1/2"
      initial={{ rotate: 0 }}
      animate={!prefersReducedMotion ? { rotate: 360 } : { rotate: 0 }}
      transition={!prefersReducedMotion ? { duration: 14, repeat: Infinity, ease: 'linear' } : {}}
      style={{ originX: 0.5, originY: 0.5 }}
    >
      <div className="relative -translate-x-1/2 -translate-y-[12.5rem]">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/90 px-4 py-2 text-[12px] font-semibold text-zinc-900 shadow-sm transition hover:bg-white dark:border-white/20 dark:bg-white/10 dark:text-white"
        >
          Try it now <span aria-hidden>→</span>
        </Link>
      </div>
    </motion.div>
  );
}

/* ----------------------------- SMALL COMPONENTS ----------------------------- */

function Chip({ children }) {
  return (
    <span className="rounded-full border border-zinc-300 bg-white px-3 py-1 dark:border-white/15 dark:bg-white/10">
      {children}
    </span>
  );
}

/* ------------------------------ ATMOSPHERICS -------------------------------- */

function StarField() {
  // subtle moving dots to enhance "spacey" vibe
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <svg className="h-full w-full opacity-40 dark:opacity-25" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        <defs>
          <radialGradient id="s" cx="50%" cy="50%">
            <stop offset="0%" stopColor="white" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        {[...Array(28)].map((_, i) => {
          const r = Math.random() * 0.5 + 0.15;
          const x = Math.random() * 100;
          const y = Math.random() * 100;
          const d = 10 + Math.random() * 20;
          return (
            <motion.circle
              key={i}
              cx={x}
              cy={y}
              r={r}
              fill="url(#s)"
              initial={{ opacity: 0.4 }}
              animate={{ opacity: [0.15, 0.6, 0.15] }}
              transition={{ duration: d, repeat: Infinity, delay: Math.random() * 5 }}
            />
          );
        })}
      </svg>
    </div>
  );
}

function BackgroundNoise() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-20 opacity-[0.04] mix-blend-soft-light"
      style={{
        backgroundImage:
          'url("data:image/svg+xml;utf8,\
<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'1600\' height=\'900\'><filter id=\'n\'>\
<feTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/></filter>\
<rect width=\'100%\' height=\'100%\' filter=\'url(%23n)\' opacity=\'0.5\'/></svg>")',
      }}
    />
  );
}

/* ------------------------------- A11Y NOTES ---------------------------------
- Respect reduced motion via useReducedMotion.
- Portal image: put your own visual at /public/portal-scene.jpg
- Minimal DOM for performance; all effects are GPU-friendly (transforms/opacity).
------------------------------------------------------------------------------- */
