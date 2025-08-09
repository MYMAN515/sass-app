'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/**
 * Supercharged Landing Page — built for conversion and clarity
 * - Clear value prop above the fold
 * - Psychological triggers: social proof, authority, risk-reversal, micro-commitments
 * - Micro-interactions + smooth motion (respects prefers-reduced-motion)
 * - Accessible & responsive; works great on mobile
 * - Minimal deps: Next.js + Tailwind + Framer Motion
 *
 * Drop this as components/LandingPage.jsx and render it in pages/index.js or app/page.js.
 */
export default function LandingPage() {
  return (
    <main className="relative min-h-screen w-full overflow-x-clip bg-white text-zinc-900 dark:bg-black dark:text-white">
      <BackgroundFX />
      <SkipToContent />
      <Navbar />
      <Hero />
      <LogoMarquee />
      <Showcase />
      <ValueProps />
      <HowItWorks />
      <Benefits />
      <Testimonials />
      <Pricing />
      <FAQ />
      <StickyCTA />
      <Footer />
    </main>
  );
}

/* -------------------------------- BG & Layout -------------------------------- */
function BackgroundFX() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      {/* Light gradient */}
      <div className="h-full w-full bg-[radial-gradient(90%_80%_at_50%_0%,#eef2ff_0%,#ffffff_35%,#fff5f7_100%)] dark:hidden" />
      {/* Dark gradient + grid */}
      <div className="hidden h-full w-full dark:block">
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_60%_-10%,#3b1e82_0%,#0f0320_55%,#080312_100%)]" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.06)_1px,transparent_1px)] [background-size:22px_22px]" />
      </div>
      {/* Soft noise for visual depth */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-soft-light"
        style={{
          backgroundImage:
            "url('data:image/svg+xml;utf8,\n<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'1200\' height=\'600\'><filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/></filter><rect width=\'100%\' height=\'100%\' filter=\'url(%23n)\' opacity=\'0.4\'/></svg>')",
        }}
      />
      {/* Aurora blobs (animated) */}
      <AuroraBlobs />
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
          background:
            'conic-gradient(from 90deg, rgba(99,102,241,.35), rgba(236,72,153,.35), rgba(244,63,94,.35))',
          filter: 'blur(80px)'
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 0.55, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.1 }}
        className="absolute -bottom-24 right-[-10%] h-[36rem] w-[36rem] rounded-full blur-3xl"
        style={{
          background:
            'conic-gradient(from 200deg, rgba(34,197,94,.35), rgba(59,130,246,.35), rgba(236,72,153,.35))',
          filter: 'blur(90px)'
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

function SkipToContent() {
  return (
    <a
      href="#content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-black focus:px-4 focus:py-2 focus:text-white"
    >
      Skip to content
    </a>
  );
}

/* ----------------------------------- Nav ------------------------------------ */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className={`sticky top-0 z-40 w-full transition-all ${
      scrolled ? 'backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-black/40 border-b border-black/5 dark:border-white/10' : ''
    }`}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 md:px-8">
        <Link href="/" className="group inline-flex items-center gap-2" aria-label="AIStore Assistant Home">
          <Logo />
          <span className="font-semibold tracking-tight">AIStore Assistant</span>
          <span className="ml-2 rounded-full border border-black/10 bg-white/70 px-2 py-0.5 text-[10px] text-zinc-600 backdrop-blur dark:border-white/15 dark:bg-white/10 dark:text-zinc-300">Beta</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#how">How it works</NavLink>
          <NavLink href="#pricing">Pricing</NavLink>
          <NavLink href="#faq">FAQ</NavLink>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-lg border border-black/10 px-3 py-1.5 text-sm font-medium hover:bg-white dark:border-white/15 dark:hover:bg-white/10 md:inline-block"
          >
            Sign in
          </Link>
          <MagneticCTA href="/dashboard">Get started free</MagneticCTA>
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

/* ---------------------------------- Hero ------------------------------------ */
function Hero() {
  return (
    <section id="content" className="relative mx-auto max-w-7xl px-6 pt-16 md:px-8 lg:pt-24">
      {/* Badge & microcopy */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 flex flex-wrap items-center gap-2"
      >
        <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-medium backdrop-blur dark:border-white/15 dark:bg-white/10">
          BUILT FOR E‑COMMERCE TEAMS
        </span>
        <span className="text-xs text-zinc-600 dark:text-zinc-300">Modern • Fast • Conversion‑driven</span>
      </motion.div>

      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight md:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent">
              Studio‑grade product photos & try‑ons
            </span>{' '}
            in seconds
          </h1>
          <p className="mt-4 max-w-xl text-lg text-zinc-700 dark:text-zinc-300">
            Upload a product photo → get polished, on‑brand imagery and AI try‑ons. No lighting kits. No design team. Just results.
          </p>

          {/* Trust cues */}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
            <span className="rounded-full bg-white/80 px-3 py-1 dark:bg-white/10">No credit card</span>
            <span className="rounded-full bg-white/80 px-3 py-1 dark:bg-white/10">Free starter credits</span>
            <span className="rounded-full bg-white/80 px-3 py-1 dark:bg-white/10">GDPR‑friendly</span>
          </div>

          {/* CTAs */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <MagneticCTA href="/dashboard" ariaLabel="Get started for free">
              Get started free
            </MagneticCTA>
            <a
              href="#demo"
              className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white/60 px-5 py-3 text-base font-semibold text-zinc-900 backdrop-blur-md transition hover:bg-white dark:border-white/15 dark:bg-white/10 dark:text-white"
            >
              Watch 30s demo
            </a>
          </div>

          <TrustBar />
        </div>

        {/* Interactive preview */}
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
        </motion.div>
      </div>

      {/* Scroll hint */}
      <div className="pointer-events-none mt-10 flex items-center justify-center text-xs text-zinc-500 dark:text-zinc-400">
        <span className="animate-bounce">Scroll to see how it works</span>
      </div>
    </section>
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

function TrustBar() {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
      <span className="font-medium">Trusted by 1,200+ stores</span>
      <span className="inline-block h-1 w-1 rounded-full bg-zinc-400" />
      <span>Secure uploads</span>
      <span className="inline-block h-1 w-1 rounded-full bg-zinc-400" />
      <span>Human‑in‑the‑loop QA</span>
    </div>
  );
}

/* ------------------------------- Logo Marquee ------------------------------- */
function LogoMarquee() {
  const logos = ['brand-1.svg', 'brand-2.svg', 'brand-3.svg', 'brand-4.svg', 'brand-5.svg'];
  return (
    <div className="relative mx-auto mt-10 w-full max-w-7xl overflow-hidden px-6 py-6 md:px-8">
      <div className="mb-4 text-center text-xs uppercase tracking-widest text-zinc-500">
        POWERING TEAMS AT
      </div>
      <div className="[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="animate-marquee flex min-w-full items-center gap-10 opacity-70 hover:[animation-play-state:paused]">
          {logos.concat(logos).map((src, i) => (
            <div key={i} className="relative h-8 w-28 opacity-80">
              <Image src={`/${src}`} alt="brand" fill className="object-contain" />
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        .animate-marquee { animation: marquee 30s linear infinite; }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      `}</style>
    </div>
  );
}

/* -------------------------------- Showcase --------------------------------- */
function Showcase() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-10 pt-4 md:px-8 lg:pb-20">
      <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-black/10 bg-gradient-to-br from-white to-zinc-50 p-6 shadow-md dark:border-white/10 dark:from-zinc-900 dark:to-zinc-900"
        >
          <h3 className="text-xl font-semibold">What you get</h3>
          <ul className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
            <li>• Clean, on‑brand product shots</li>
            <li>• Realistic AI try‑ons on diverse models</li>
            <li>• Auto‑generated descriptions and SEO tags</li>
            <li>• One‑click export for Shopify & Woo</li>
          </ul>
          <div className="mt-4 text-sm text-zinc-500">No retakes. No studio rentals. No waiting.</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-900"
        >
          <div className="grid grid-cols-2 gap-4">
            {['/grid-1.jpg', '/grid-2.jpg', '/grid-3.jpg', '/grid-4.jpg'].map((src, i) => (
              <motion.div key={i} whileHover={{ y: -4 }} className="relative h-40 w-full overflow-hidden rounded-xl">
                <Image src={src} alt="result" fill className="object-cover" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* --------------------------------- Features -------------------------------- */
function ValueProps() {
  const cards = [
    { title: 'Image Enhancement', icon: '📷', desc: 'Studio quality at your fingertips.' },
    { title: 'AI Try‑On', icon: '🧍‍♂️', desc: 'Preview products on real models.' },
    { title: 'Smart Descriptions', icon: '💡', desc: 'Auto‑generate marketing copy.' },
  ];
  const kpis = [
    ['+32%', 'Higher conversion'],
    ['90%', 'Time saved per shoot'],
    ['<15s', 'Average render'],
    ['99.9%', 'Uptime'],
  ];

  return (
    <section id="features" className="relative mx-auto max-w-7xl px-6 py-16 md:px-8">
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
        {cards.map(({ title, icon, desc }) => (
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

      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        {kpis.map(([kpi, label]) => (
          <div key={label} className="rounded-xl border border-black/10 bg-white p-4 text-center dark:border-white/10 dark:bg-zinc-800">
            <div className="text-2xl font-extrabold">{kpi}</div>
            <div className="text-xs text-zinc-600 dark:text-zinc-300">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------- How it Works ------------------------------- */
function HowItWorks() {
  const steps = [
    { title: 'Upload', desc: 'Add your product photo', icon: '📤' },
    { title: 'Enhance', desc: 'AI‑powered quality', icon: '⚙️' },
    { title: 'Publish', desc: 'Export to your store', icon: '🚀' },
  ];

  return (
    <section id="how" className="relative bg-gradient-to-b from-[#0f0320] to-black px-6 py-20 text-white md:px-8">
      <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">How it works</h2>
      <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
        {steps.map((step, idx) => (
          <div key={idx} className="relative rounded-xl border border-white/10 bg-white/5 px-6 py-8 text-center shadow-xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-fuchsia-600 text-2xl">
              {step.icon}
            </div>
            <h3 className="text-xl font-semibold">{step.title}</h3>
            <p className="mt-1 text-sm text-zinc-300">{step.desc}</p>
            {idx < steps.length - 1 && (
              <div className="pointer-events-none absolute right-[-18px] top-1/2 hidden h-px w-9 -translate-y-1/2 bg-white/20 md:block" />
            )}
          </div>
        ))}
      </div>
      <div className="mt-10 text-center">
        <Link href="/dashboard" className="inline-flex items-center justify-center rounded-xl bg-white/90 px-5 py-3 font-semibold text-zinc-900 hover:bg-white">
          Start creating →
        </Link>
      </div>
    </section>
  );
}

/* --------------------------------- Benefits -------------------------------- */
function Benefits() {
  const items = [
    {
      pain: 'Hiring photographers & retouching is slow and expensive.',
      gain: 'Generate studio‑grade results in under 15 seconds with consistent lighting and angles.',
    },
    {
      pain: 'Models and shoots rarely match your brand diversity goals.',
      gain: 'AI try‑on with diverse body types and skin tones that reflect your audience.',
    },
    {
      pain: 'Copywriting and metadata take hours per product.',
      gain: 'Instant descriptions, tags, and alt text optimized for SEO and accessibility.',
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 md:px-8">
      <h2 className="mb-6 text-center text-3xl font-bold md:text-4xl">Why teams switch to AIStore</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((it, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className="rounded-2xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-900"
          >
            <h3 className="text-sm font-semibold text-rose-600">The Problem</h3>
            <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{it.pain}</p>
            <div className="my-4 h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent dark:via-white/10" />
            <h3 className="text-sm font-semibold text-emerald-600">The Win</h3>
            <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{it.gain}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------- Testimonials ------------------------------- */
function Testimonials() {
  const data = [
    {
      quote:
        'We went from ad‑hoc shoots to a consistent brand look in days. CTR up 27% and our team stopped fighting lighting.',
      name: 'Sarah M.',
      role: 'E‑commerce Lead, UrbanWear',
      avatar: '/avatar-1.png',
    },
    {
      quote: 'Try‑on sold it. Returns dropped and PDP time‑on‑page doubled. Unreal.',
      name: 'Jamal R.',
      role: 'Founder, SneakLab',
      avatar: '/avatar-2.png',
    },
    {
      quote: 'The copy generator shipped our catalog update in a weekend. Massive time saver.',
      name: 'Cecilia P.',
      role: 'Head of Growth, BloomBox',
      avatar: '/avatar-3.png',
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 md:px-8">
      <h2 className="mb-8 text-center text-3xl font-bold md:text-4xl">Loved by modern stores</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {data.map((t, i) => (
          <motion.figure
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className="rounded-2xl border border-black/10 bg-gradient-to-br from-white to-zinc-50 p-6 shadow-sm dark:border-white/10 dark:from-zinc-900 dark:to-zinc-900"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-full">
                <Image src={t.avatar} alt="avatar" fill className="object-cover" />
              </div>
              <div>
                <div className="text-sm font-semibold">{t.name}</div>
                <div className="text-xs text-zinc-500">{t.role}</div>
              </div>
            </div>
            <blockquote className="text-sm text-zinc-700 dark:text-zinc-300">“{t.quote}”</blockquote>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------- Pricing --------------------------------- */
function Pricing() {
  const tiers = [
    {
      name: 'Free',
      price: '$0',
      tagline: 'Kick the tires',
      features: ['20 credits', 'Basic enhancement', 'Watermarked exports'],
      cta: { label: 'Start free', href: '/dashboard' },
      popular: false,
    },
    {
      name: 'Pro',
      price: '$19/mo',
      tagline: 'For growing stores',
      features: ['500 credits', 'AI Try‑On access', 'HD exports', 'Shopify/Woo export'],
      cta: { label: 'Go Pro', href: '/dashboard' },
      popular: true,
    },
    {
      name: 'Business',
      price: 'Custom',
      tagline: 'High volume & SLA',
      features: ['Unlimited seats', 'SLA & SSO', 'API access', 'Priority support'],
      cta: { label: 'Talk to sales', href: '/contact' },
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="relative mx-auto max-w-7xl px-6 py-20 md:px-8">
      <h2 className="mb-10 text-center text-3xl font-bold md:text-4xl">Simple pricing, real results</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {tiers.map((t) => (
          <motion.div
            key={t.name}
            whileHover={{ y: -4 }}
            className={`relative rounded-2xl border p-6 transition ${
              t.popular
                ? 'border-fuchsia-300/40 bg-gradient-to-br from-white to-fuchsia-50 shadow-lg dark:from-zinc-900 dark:to-zinc-900'
                : 'border-black/10 bg-white dark:border-white/10 dark:bg-zinc-900'
            }`}
          >
            {t.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-3 py-1 text-xs font-semibold text-white">
                Most popular
              </div>
            )}
            <div className="text-sm text-zinc-500">{t.tagline}</div>
            <div className="mt-1 text-2xl font-extrabold">{t.name}</div>
            <div className="mt-1 text-3xl font-extrabold">{t.price}</div>
            <ul className="mt-4 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
              {t.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span aria-hidden>✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href={t.cta.href}
              className={`mt-6 inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold ${
                t.popular
                  ? 'bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white hover:from-fuchsia-600 hover:to-indigo-600'
                  : 'border border-black/10 bg-white hover:bg-zinc-50 dark:border-white/15 dark:bg-transparent dark:hover:bg-white/10'
              }`}
            >
              {t.cta.label}
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------ FAQ ----------------------------------- */
function FAQ() {
  const faqs = [
    {
      q: 'Do I need design skills or studio gear?',
      a: 'No. Upload your product photo and we handle lighting, background, and cleanup. You can tweak outputs with simple controls.',
    },
    { q: 'What about privacy?', a: 'We process uploads securely and never sell your data. You control what is public or private.' },
    {
      q: 'Can I cancel anytime?',
      a: 'Yes. Pro is month‑to‑month. Free plan stays free with limited credits to keep experimenting.',
    },
  ];

  return (
    <section id="faq" className="mx-auto max-w-4xl px-6 pb-24 md:px-8">
      <h2 className="mb-6 text-center text-3xl font-bold md:text-4xl">Questions, answered</h2>
      <div className="divide-y divide-black/10 rounded-2xl border border-black/10 bg-white dark:divide-white/10 dark:border-white/10 dark:bg-zinc-900">
        {faqs.map((f, i) => (
          <details key={i} className="group px-6 py-4 open:bg-zinc-50 dark:open:bg-white/5">
            <summary className="flex cursor-pointer list-none items-center justify-between py-2 text-sm font-semibold">
              <span>{f.q}</span>
              <span className="transition group-open:rotate-45">＋</span>
            </summary>
            <p className="pb-2 text-sm text-zinc-700 dark:text-zinc-300">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/* --------------------------------- Sticky CTA -------------------------------- */
function StickyCTA() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 mb-safe md:hidden">
      <div className="m-3 rounded-2xl border border-black/10 bg-white/90 p-3 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-black/40">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm">
            <div className="font-semibold">Create your first image free</div>
            <div className="text-xs text-zinc-600 dark:text-zinc-300">No card. 15 seconds average.</div>
          </div>
          <Link href="/dashboard" className="rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-3 py-2 text-sm font-semibold text-white">
            Try now
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- Footer ---------------------------------- */
function Footer() {
  return (
    <footer className="mt-10 border-t border-black/10 bg-gradient-to-b from-transparent to-black/5 px-6 py-10 text-sm text-zinc-600 dark:border-white/10 dark:to-white/5 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-2">
          <Logo />
          <span>AIStore Assistant</span>
          <span className="mx-3 inline-block h-1 w-1 rounded-full bg-zinc-400" />
          <span className="text-xs">© {new Date().getFullYear()} All rights reserved.</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-zinc-900 dark:hover:text-white">Privacy</a>
          <a href="#" className="hover:text-zinc-900 dark:hover:text-white">Terms</a>
          <a href="mailto:support@aistoreassistant.app" className="hover:text-zinc-900 dark:hover:text-white">Contact</a>
        </div>
      </div>
    </footer>
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
      {/* Before clipped */}
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
