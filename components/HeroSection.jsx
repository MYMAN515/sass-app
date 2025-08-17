// HeroSection.jsx
'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef } from 'react';

/**
 * B2B Landing — "COLOR FACTORY" concept
 * Weird (but clean), bright palette, mobile-first, explains Try-On & Enhance
 * - Hero = playful conveyor/factory line anim (no dark mode)
 * - One-to-many grid explaining "1 photo → many assets"
 * - Who it's for + How it works + Results
 * - Sticky mobile CTA
 *
 * Tailwind & Framer Motion required.
 */

export default function LandingPage() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#FFF7ED] text-zinc-900 selection:bg-lime-300 selection:text-zinc-900">
      <HeroWeirdFactory />
      <TrustLogos />
      <OneToManyGrid />
      <WhoFor />
      <HowItWorks />
      <Results />
      <BottomCTA />
      <Footer />
      <StickyMobileCTA />
    </main>
  );
}

/* ---------------------------------- HERO ----------------------------------- */

function HeroWeirdFactory() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative isolate w-full overflow-hidden px-5 pb-16 pt-24 sm:px-6 md:px-10 lg:px-16">
      {/* Corner candy gradients */}
      <div className="pointer-events-none absolute -left-28 -top-28 h-[28rem] w-[28rem] rounded-full bg-[conic-gradient(at_30%_30%,#f97316_0%,#fde047_25%,#22c55e_50%,#60a5fa_75%,#f97316_100%)] opacity-40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-[26rem] w-[26rem] rounded-full bg-[conic-gradient(at_70%_70%,#84cc16_0%,#22c55e_25%,#f472b6_55%,#f97316_80%,#84cc16_100%)] opacity-40 blur-3xl" />
      {/* Subtle speckles */}
      <Noise />

      <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-2">
        {/* Copy */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="order-2 md:order-1"
        >
          <Badge>WEIRD • BRIGHT • BUILT FOR E-COMMERCE</Badge>
          <h1 className="mt-3 text-balance text-4xl font-extrabold leading-[1.04] tracking-tight md:text-5xl">
            Turn <span className="bg-gradient-to-r from-rose-500 via-orange-500 to-lime-500 bg-clip-text text-transparent">one raw photo</span>{' '}
            into scroll-stopping images and real model try-ons.
          </h1>
          <p className="mt-3 max-w-xl text-base md:text-lg">
            Upload a product shot → get enhanced, on-brand backgrounds or place it on a realistic model. No studio. No retakes. All in seconds.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <PrimaryCTA href="/dashboard">Try a free demo</PrimaryCTA>
            <GhostCTA href="#how">How it works</GhostCTA>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <Pill>No credit card</Pill>
            <Pill>High-res exports</Pill>
            <Pill>API for scale</Pill>
          </div>
        </motion.div>

        {/* Weird factory line */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="order-1 md:order-2"
          aria-label="Animated factory preview for Enhance & Try-On"
        >
          <FactoryCard />
        </motion.div>
      </div>
    </section>
  );
}

function FactoryCard() {
  // Three colorful belts: Enhance, Backgrounds, Try-On
  return (
    <div className="relative mx-auto w-full max-w-[36rem] overflow-hidden rounded-3xl border border-orange-200 bg-white shadow-[0_20px_60px_rgba(249,115,22,0.12)]">
      <div className="border-b border-orange-100 px-5 py-3 text-sm font-semibold text-orange-700">Live Preview</div>

      {/* Track 1 — Enhance */}
      <Track
        title="Enhance"
        colorRing="from-orange-400 to-rose-400"
        chip="Sharper • Brighter • Cleaner"
        items={[{ t: 'RAW' }, { t: 'ENHANCED' }, { t: 'RAW' }, { t: 'ENHANCED' }]}
      />

      {/* Track 2 — Background Generator */}
      <Track
        title="Backgrounds"
        colorRing="from-lime-400 to-sky-400"
        chip="Studio • Lifestyle • Seasonal"
        items={[{ t: 'DESK' }, { t: 'BEACH' }, { t: 'URBAN' }, { t: 'FLATLAY' }]}
        reverse
      />

      {/* Track 3 — Try-On */}
      <Track
        title="Try-On"
        colorRing="from-fuchsia-400 to-amber-400"
        chip="Realistic models • Sizes"
        items={[{ t: 'XS' }, { t: 'M' }, { t: 'L' }, { t: 'XL' }]}
      />

      <div className="flex items-center justify-between border-t border-orange-100 px-5 py-3 text-xs">
        <span className="text-zinc-500">Demo renders are simulated.</span>
        <Link
          href="/dashboard"
          className="rounded-full bg-orange-500 px-3 py-1 font-semibold text-white transition hover:bg-orange-600"
        >
          Upload a photo →
        </Link>
      </div>
    </div>
  );
}

function Track({ title, colorRing, chip, items, reverse = false }) {
  const prefersReducedMotion = useReducedMotion();
  const speed = reverse ? 22 : 26;

  return (
    <div className="relative border-b border-orange-100 px-5 py-5 last:border-b-0">
      <div className="mb-3 flex items-center gap-2">
        <div className={`h-3 w-3 rounded-full bg-gradient-to-r ${colorRing}`} />
        <div className="text-sm font-semibold">{title}</div>
        <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] text-orange-700">{chip}</span>
      </div>

      <div className="relative overflow-hidden">
        <div className={`mask-fade pointer-events-none absolute inset-0`} aria-hidden />
        <motion.div
          className={`flex w-max items-center gap-3 ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'}`}
          style={{
            animationPlayState: prefersReducedMotion ? 'paused' : 'running',
            animationDuration: `${speed}s`,
          }}
        >
          {[...items, ...items, ...items].map((it, i) => (
            <div
              key={i}
              className="grid h-24 w-40 place-items-center rounded-2xl border border-zinc-200 bg-gradient-to-br from-white to-orange-50 text-xs font-bold shadow-sm"
            >
              <span className="rounded bg-zinc-900 px-2 py-1 text-white">{it.t}</span>
            </div>
          ))}
        </motion.div>
      </div>

      <style jsx>{`
        .animate-marquee {
          animation: marquee 26s linear infinite;
        }
        .animate-marquee-reverse {
          animation: marquee-rev 22s linear infinite;
        }
        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        @keyframes marquee-rev {
          from {
            transform: translateX(-50%);
          }
          to {
            transform: translateX(0);
          }
        }
        .mask-fade {
          -webkit-mask-image: linear-gradient(to right, transparent, black 12%, black 88%, transparent);
                  mask-image: linear-gradient(to right, transparent, black 12%, black 88%, transparent);
        }
      `}</style>
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

function Noise() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-soft-light"
      style={{
        backgroundImage:
          'url("data:image/svg+xml;utf8,\
<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'1600\' height=\'900\'><filter id=\'n\'>\
<feTurbulence type=\'fractalNoise\' baseFrequency=\'0.95\' numOctaves=\'4\'/></filter>\
<rect width=\'100%\' height=\'100%\' filter=\'url(%23n)\' opacity=\'0.6\'/></svg>")',
      }}
    />
  );
}

/* ------------------------------- TRUST LOGOS -------------------------------- */

function TrustLogos() {
  const logos = ['Shopify', 'Woo', 'BigCommerce', 'TikTok Shop', 'Meta Commerce', 'Magento'];
  return (
    <section className="mx-auto max-w-7xl px-5 py-8 sm:px-6 md:px-10">
      <div className="text-center text-[11px] uppercase tracking-[0.3em] text-zinc-500">Works with</div>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
        {logos.map((l) => (
          <div key={l} className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs">{l}</div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------ ONE → MANY GRID ----------------------------- */

function OneToManyGrid() {
  return (
    <section className="relative mx-auto max-w-7xl px-5 py-16 sm:px-6 md:px-10">
      <div className="grid items-start gap-8 md:grid-cols-[1.1fr_1.6fr]">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">One upload → infinite assets</h2>
          <p className="mt-3 max-w-md text-zinc-700">
            Start with a single product shot and generate enhanced packshots, lifestyle scenes, seasonal sets, and model try-ons—ready for
            your store, socials, and ads.
          </p>
          <ul className="mt-6 grid gap-3 text-sm">
            <li className="flex items-center gap-2">
              <Dot color="bg-lime-500" /> Enhance & color-correct automatically
            </li>
            <li className="flex items-center gap-2">
              <Dot color="bg-sky-500" /> Generate clean, on-brand backgrounds
            </li>
            <li className="flex items-center gap-2">
              <Dot color="bg-fuchsia-500" /> Place garments on realistic models
            </li>
            <li className="flex items-center gap-2">
              <Dot color="bg-orange-500" /> Export high-res for web & print
            </li>
          </ul>
          <div className="mt-7">
            <PrimaryCTA href="/dashboard">Upload a product photo</PrimaryCTA>
          </div>
        </div>

        {/* Mosaic (all CSS, no images) */}
        <div className="grid grid-cols-3 grid-rows-3 gap-3">
          {[
            'from-orange-200 to-orange-50',
            'from-lime-200 to-lime-50',
            'from-sky-200 to-sky-50',
            'from-fuchsia-200 to-pink-50',
            'from-amber-200 to-yellow-50',
            'from-teal-200 to-teal-50',
            'from-rose-200 to-rose-50',
            'from-violet-200 to-violet-50',
            'from-emerald-200 to-emerald-50',
          ].map((g, i) => (
            <div
              key={i}
              className={`aspect-square rounded-2xl border border-zinc-200 bg-gradient-to-br ${g} shadow-sm`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Dot({ color }) {
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} aria-hidden />;
}

/* -------------------------------- WHO FOR ----------------------------------- */

function WhoFor() {
  const chips = ['Social-first brands', 'DTC stores', 'Marketplaces', 'Agencies', 'Catalog teams', 'Photo-light ops'];
  return (
    <section className="mx-auto max-w-7xl px-5 py-14 sm:px-6 md:px-10">
      <h3 className="text-center text-2xl font-extrabold">Built for teams that move fast</h3>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        {chips.map((c) => (
          <span key={c} className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm">
            {c}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------- HOW IT WORKS ------------------------------- */

function HowItWorks() {
  const steps = [
    { title: 'Upload', desc: 'Drop your product or garment image.' },
    { title: 'Choose', desc: 'Pick Enhance, Backgrounds, or Try-On.' },
    { title: 'Preview', desc: 'See instant variations (sizes, scenes).' },
    { title: 'Publish', desc: 'Export high-res. API sync to your store.' },
  ];
  return (
    <section id="how" className="relative mx-auto max-w-7xl px-5 py-20 sm:px-6 md:px-10">
      <div className="rounded-3xl border border-lime-200 bg-gradient-to-br from-lime-50 to-amber-50 p-6 md:p-10">
        <h3 className="text-center text-3xl font-extrabold md:text-4xl">How it works</h3>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-white">{i + 1}</div>
              <div className="font-semibold">{s.title}</div>
              <div className="mt-1 text-sm text-zinc-600">{s.desc}</div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-center">
          <Link
            href="/dashboard"
            className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Start free →
          </Link>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- RESULTS ---------------------------------- */

function Results() {
  const cards = [
    { k: '↑ 28%', d: 'Conversion uplift from better visuals' },
    { k: '– 80%', d: 'Production time vs. manual photoshoots' },
    { k: '15s', d: 'Average render preview time' },
    { k: 'API', d: 'Sync to Shopify / Woo / custom' },
  ];
  return (
    <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-6 md:px-10">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map((c) => (
          <motion.div
            key={c.k}
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border border-zinc-200 bg-white p-5 text-center shadow-sm"
          >
            <div className="text-2xl font-extrabold">{c.k}</div>
            <div className="mt-1 text-xs text-zinc-600">{c.d}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------- BOTTOM CTA -------------------------------- */

function BottomCTA() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-6 md:px-10">
      <div className="rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 to-fuchsia-50 p-8 text-center shadow-[0_20px_60px_rgba(249,115,22,0.12)]">
        <h4 className="text-2xl font-extrabold">Ready to make weird, high-performing visuals?</h4>
        <p className="mx-auto mt-2 max-w-xl text-zinc-700">
          Join brands turning raw shots into studio-grade assets and realistic try-ons—without studios, models, or re-shoots.
        </p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <PrimaryCTA href="/dashboard">Try a free demo</PrimaryCTA>
          <GhostCTA href="#how">See how it works</GhostCTA>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- FOOTER ----------------------------------- */

function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white/70 px-5 py-8 text-sm sm:px-6 md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 sm:flex-row">
        <div className="text-zinc-600">© {new Date().getFullYear()} AI Store Assistant. All rights reserved.</div>
        <div className="flex items-center gap-4">
          <Link className="text-zinc-700 hover:underline" href="/terms">
            Terms
          </Link>
          <Link className="text-zinc-700 hover:underline" href="/privacy">
            Privacy
          </Link>
          <Link className="text-zinc-700 hover:underline" href="/contact">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}

/* ----------------------------- STICKY MOBILE CTA ---------------------------- */

function StickyMobileCTA() {
  return (
    <div className="lg:hidden">
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
