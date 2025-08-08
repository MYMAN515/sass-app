// components/HeroSection.jsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/** لماذا: واجهة جذابة وعملية تدفع المستخدم لاتخاذ قرار (CTA سريع + إثبات اجتماعي). */
export default function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden font-sans text-black dark:text-white">
      {/* ===== BG LAYERS ===== */}
      <BackgroundFX />

      {/* ===== TOP HERO ===== */}
      <div className="relative z-10 px-6 md:px-12 lg:px-20 pt-24 pb-16 lg:pt-28 lg:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-6xl"
        >
          {/* Badge + subtext */}
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-black/10 dark:border-white/15 bg-white/70 dark:bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-md">START-UP VIBES</span>
            <span className="text-xs text-zinc-600 dark:text-zinc-300">Modern • Fast • Conversion-driven</span>
          </div>

          <div className="grid items-center gap-10 lg:grid-cols-2">
            {/* Left copy */}
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight">
                <span className="bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent">Your product</span>,<br className="hidden md:block" /> reimagined by AI ✨
              </h1>

              <p className="mt-4 max-w-xl text-lg md:text-xl text-zinc-700 dark:text-zinc-300">
                Upload a photo → get a studio-grade result in seconds. No complex setup. No design skills.
              </p>

              {/* Micro commitments */}
              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                <span className="rounded-full bg-white/80 px-3 py-1 dark:bg-white/10">No credit card</span>
                <span className="rounded-full bg-white/80 px-3 py-1 dark:bg-white/10">Free starter credits</span>
                <span className="rounded-full bg-white/80 px-3 py-1 dark:bg-white/10">Cancel anytime</span>
              </div>

              {/* CTAs */}
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href="/dashboard"
                  className="group inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition hover:from-fuchsia-600 hover:to-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400"
                  aria-label="Get started for free"
                >
                  Get started free
                  <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 5l7 7-7 7M5 12h14"/></svg>
                </Link>
                <a
                  href="#demo"
                  className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white/60 px-5 py-3 text-base font-semibold text-zinc-900 backdrop-blur-md transition hover:bg-white dark:border-white/15 dark:bg-white/10 dark:text-white"
                >
                  See live demo
                </a>
              </div>

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
                defaultPercent={60}
                showLabels
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Mobile floating CTA */}
        <div className="md:hidden">
          <Link
            href="/dashboard"
            className="fixed bottom-4 right-4 z-50 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-indigo-700/20 transition hover:bg-fuchsia-600"
            aria-label="Try it now"
          >
            Try now <span aria-hidden>→</span>
          </Link>
        </div>

        {/* Scroll hint */}
        <div className="pointer-events-none mt-10 flex items-center justify-center text-xs text-zinc-500 dark:text-zinc-400">
          <span className="animate-bounce">Scroll to see how it works</span>
        </div>
      </div>

      {/* ===== VALUE PROPS ===== */}
      <ValueProps />

      {/* ===== HOW IT WORKS ===== */}
      <HowItWorks />
    </section>
  );
}

/* ----------------- Subcomponents ----------------- */

function BackgroundFX() {
  return (
    <div className="absolute inset-0 -z-20">
      {/* Light */}
      <div className="h-full w-full bg-[radial-gradient(75%_100%_at_50%_0%,#eef2ff_0%,#ffffff_35%,#fff5f7_100%)] dark:hidden" />
      {/* Dark */}
      <div className="hidden h-full w-full dark:block bg-[radial-gradient(120%_80%_at_60%_-10%,#3b1e82_0%,#0f0320_55%,#080312_100%)]" />
      {/* Grid */}
      <div className="pointer-events-none absolute inset-0 hidden dark:block opacity-25 [background-image:linear-gradient(to_right,rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.06)_1px,transparent_1px)] [background-size:24px_24px]" />
      {/* Noise (خفيف لعمق بصري) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-soft-light"
        style={{ backgroundImage: 'url("data:image/svg+xml;utf8,\
<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'1200\' height=\'600\'><filter id=\'n\'>\
<feTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/></filter>\
<rect width=\'100%\' height=\'100%\' filter=\'url(%23n)\' opacity=\'0.4\'/></svg>")' }}
      />
    </div>
  );
}

function TrustBar() {
  return (
    <div className="mt-8 flex flex-wrap items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
      <span className="font-medium">Trusted by 1,200+ stores</span>
      <span className="inline-block h-1 w-1 rounded-full bg-zinc-400" />
      <span>GDPR-friendly</span>
      <span className="inline-block h-1 w-1 rounded-full bg-zinc-400" />
      <span>Secure upload</span>
    </div>
  );
}

/** لماذا: سلايدر قابل للسحب + أسهم لوحة المفاتيح + مؤشر مرئي؛ يرفع إحساس التحكم والثقة. */
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
      <Image
        src={after.src}
        alt={after.alt}
        width={900}
        height={1200}
        priority
        className="h-auto w-full select-none object-cover"
      />
      {/* Before overlay clipped */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <Image
          src={before.src}
          alt={before.alt}
          width={900}
          height={1200}
          className="h-full w-full object-cover"
          priority={false}
        />
      </div>

      {/* Labels */}
      {showLabels && (
        <>
          <div className="pointer-events-none absolute left-3 top-3 select-none rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-zinc-800 shadow-sm dark:bg-black/60 dark:text-white">Before</div>
          <div className="pointer-events-none absolute right-3 top-3 select-none rounded-full bg-rose-500/90 px-2 py-1 text-[10px] font-semibold text-white shadow-sm">After</div>
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

      {/* Range fallback (تطمين قابلية الوصول) */}
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

function ValueProps() {
  return (
    <div className="relative z-10 bg-white px-6 py-16 text-zinc-900 dark:bg-zinc-900 dark:text-white md:px-12 lg:px-20">
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
            <div className="mb-3 text-3xl" aria-hidden>{icon}</div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{desc}</p>
          </motion.div>
        ))}
      </div>

      {/* KPIs */}
      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          ['+32%', 'Higher conversion'],
          ['90%', 'Time saved per shoot'],
          ['<15s', 'Average render'],
          ['99.9%', 'Uptime'],
        ].map(([kpi, label]) => (
          <div key={label} className="rounded-xl border border-black/10 bg-white p-4 text-center dark:border-white/10 dark:bg-zinc-800">
            <div className="text-2xl font-extrabold">{kpi}</div>
            <div className="text-xs text-zinc-600 dark:text-zinc-300">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HowItWorks() {
  return (
    <div className="relative z-10 bg-gradient-to-b from-[#0f0320] to-black px-6 py-20 text-white md:px-12 lg:px-20">
      <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">How it works</h2>
      <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
        {[
          { title: 'Upload', desc: 'Add your product photo', icon: '📤' },
          { title: 'Enhance', desc: 'AI-powered quality', icon: '⚙️' },
          { title: 'Download', desc: 'Get stunning results', icon: '📥' },
        ].map((step, idx) => (
          <div key={idx} className="relative rounded-xl border border-white/10 bg-white/5 px-6 py-8 text-center shadow-xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-fuchsia-600 text-2xl">{step.icon}</div>
            <h3 className="text-xl font-semibold">{step.title}</h3>
            <p className="mt-1 text-sm text-zinc-300">{step.desc}</p>
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
