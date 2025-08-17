// app/page.jsx
'use client';

import Link from 'next/link';
import { motion, useAnimation, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * WARDROBE COLLIDER — Duo Landing (Enhance + Try-On) — Weird, Bright, B2B, Mobile-first
 * - No uploads / zero-cost demo: abstract holograms, SVG mannequins, CSS gradients
 * - Two capabilities only: Enhance (product retouch/upscale) & Try-On (garment on model)
 * - Highly responsive: phones-first behaviors, sticky CTA, reduced motion friendly
 * - Color system: Apricot Sand (#FFF7ED) base, Tangerine CTA, Lime (Enhance), Fuchsia (Try-On), Sky accents
 * - Animations: orbit/collider ring, beam pulses, shimmer sweeps, SVG path draws — transform/opacity only
 */

export default function Page() {
  return (
    <main className="relative min-h-screen w-full bg-[#FFF7ED] text-zinc-900">
      <CornerGradients />
      <NoiseOverlay />
      <HeaderBar />

      <HeroCollider />

      <SectionDivider />

      <HowItWorks />

      <B2BBenefits />

      <LogosAndTrust />

      <BottomCTA />

      <StickyMobileCTA />
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*                                HEADER (lite)                               */
/* -------------------------------------------------------------------------- */
function HeaderBar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <header
      className={[
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled ? 'shadow-[0_10px_30px_-10px_rgba(249,115,22,.25)]' : '',
      ].join(' ')}
      aria-label="Primary"
    >
      <div className="h-[3px] w-full bg-gradient-to-r from-orange-400 via-fuchsia-400 to-lime-400 opacity-80" />
      <div
        className={[
          'mx-auto max-w-7xl px-4',
          'rounded-b-3xl border-b border-zinc-200/60',
          'backdrop-blur-xl',
          scrolled ? 'bg-white/80' : 'bg-white/60',
        ].join(' ')}
      >
        <nav className="flex h-16 items-center justify-between">
          <Link href="/" className="group inline-flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-indigo-500 shadow-lg">
              <svg width="18" height="18" viewBox="0 0 24 24" className="text-white">
                <path d="M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" fill="currentColor" />
              </svg>
            </div>
            <span className="font-semibold tracking-tight">Wardrobe Collider</span>
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            <a href="#how" className="rounded-full px-3 py-2 text-sm font-medium hover:bg-zinc-900/5">
              How it works
            </a>
            <a href="#benefits" className="rounded-full px-3 py-2 text-sm font-medium hover:bg-zinc-900/5">
              Benefits
            </a>
            <a href="#trust" className="rounded-full px-3 py-2 text-sm font-medium hover:bg-zinc-900/5">
              Trust
            </a>
            <Link
              href="/dashboard"
              className="ml-1 inline-flex items-center justify-center rounded-full bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(249,115,22,0.3)] transition hover:bg-orange-700"
            >
              Launch Studio
            </Link>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(249,115,22,0.3)] transition hover:bg-orange-700 md:hidden"
          >
            Start
          </Link>
        </nav>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/*                                HERO — COLLIDER                             */
/* -------------------------------------------------------------------------- */

function HeroCollider() {
  return (
    <section className="relative isolate mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-5 pb-20 pt-10 sm:px-6 md:grid-cols-2 md:px-10 lg:px-16">
      <HeroCopy />
      <ColliderScene />
    </section>
  );
}

function HeroCopy() {
  return (
    <div className="relative z-10">
      <Badge>WEIRD • BRIGHT • BUILT FOR COMMERCE</Badge>

      <h1 className="mt-3 text-balance text-4xl font-extrabold leading-[1.04] tracking-tight md:text-5xl">
        Two superpowers for your catalog:{' '}
        <span className="bg-gradient-to-r from-lime-500 via-orange-500 to-fuchsia-500 bg-clip-text text-transparent">
          Enhance
        </span>{' '}
        &{' '}
        <span className="bg-gradient-to-r from-fuchsia-500 via-orange-500 to-lime-500 bg-clip-text text-transparent">
          Try-On
        </span>
        .
      </h1>

      <p className="mt-3 max-w-xl text-base md:text-lg">
        No studios. No reshoots. Our AI retouches product photos to high-res and previews garments on models—ready for
        every channel.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <PrimaryCTA href="/dashboard">Start free</PrimaryCTA>
        <GhostCTA href="#how">30-sec tour</GhostCTA>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <Pill>No credit card</Pill>
        <Pill>High-res exports</Pill>
        <Pill>API for scale</Pill>
      </div>
    </div>
  );
}

function Badge({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3 py-1 text-[11px] font-semibold">
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
    <a
      href={href}
      className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold transition hover:bg-zinc-50"
    >
      {children}
    </a>
  );
}

/* ------------------------------ COLLIDER SCENE ----------------------------- */

function ColliderScene() {
  const prefersReducedMotion = useReducedMotion();

  // Mode toggles the dominant effect: 'enhance' or 'tryon'
  const [mode, setMode] = useState('enhance');

  // Auto cycle between modes unless reduced-motion
  useEffect(() => {
    if (prefersReducedMotion) return;
    const t = setInterval(() => setMode((m) => (m === 'enhance' ? 'tryon' : 'enhance')), 3600);
    return () => clearInterval(t);
  }, [prefersReducedMotion]);

  // Orbit animation controller for the collider ring
  const ringControls = useAnimation();
  useEffect(() => {
    if (prefersReducedMotion) return;
    ringControls.start({
      rotate: 360,
      transition: { duration: 40, repeat: Infinity, ease: 'linear' },
    });
  }, [prefersReducedMotion, ringControls]);

  // pulse color for the active mode
  const pulseColor =
    mode === 'enhance'
      ? 'shadow-[0_0_0_8px_rgba(163,230,53,.12)]'
      : 'shadow-[0_0_0_8px_rgba(244,114,182,.12)]';

  return (
    <div className="relative mx-auto w-[min(92vw,38rem)]">
      {/* Mode switcher chips (mobile-friendly) */}
      <div className="mb-3 flex items-center gap-2">
        <Chip active={mode === 'enhance'} color="bg-lime-500" onClick={() => setMode('enhance')}>
          Enhance
        </Chip>
        <Chip active={mode === 'tryon'} color="bg-fuchsia-500" onClick={() => setMode('tryon')}>
          Try-On
        </Chip>
      </div>

      <div
        className={[
          'relative aspect-square w-full rounded-3xl border border-orange-200 bg-white p-5',
          'shadow-[0_20px_60px_rgba(249,115,22,0.12)]',
        ].join(' ')}
      >
        {/* Collider ring + beams */}
        <motion.div
          aria-hidden
          animate={ringControls}
          className={[
            'absolute left-1/2 top-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full',
            'bg-[conic-gradient(from_0deg,#f97316,#22c55e,#38bdf8,#f472b6,#f97316)] opacity-70',
            'blur-xl',
          ].join(' ')}
        />

        {/* Inner plate */}
        <div
          className={[
            'absolute left-1/2 top-1/2 h-[52%] w-[52%] -translate-x-1/2 -translate-y-1/2 rounded-[2rem]',
            'bg-white/70 backdrop-blur-md ring-1 ring-zinc-200',
            pulseColor,
          ].join(' ')}
        />

        {/* ENTRY capsule (Product) */}
        <EntryCapsule />

        {/* ENHANCE outlet (top-right) */}
        <OutletCard
          id="enhance"
          title="Enhance"
          subtitle="Sharper • Brighter • Cleaner"
          colorClass="from-lime-400 to-emerald-400"
          boxClass="right-3 top-3"
          active={mode === 'enhance'}
        >
          <EnhancePreview active={mode === 'enhance'} />
        </OutletCard>

        {/* TRY-ON outlet (bottom-right) */}
        <OutletCard
          id="tryon"
          title="Try-On"
          subtitle="Realistic models • Sizes"
          colorClass="from-fuchsia-400 to-amber-400"
          boxClass="bottom-3 right-3"
          active={mode === 'tryon'}
        >
          <TryOnPreview active={mode === 'tryon'} />
        </OutletCard>

        {/* beam to enhance */}
        <Beam
          start={{ x: '54%', y: '46%' }}
          end={{ x: '86%', y: '18%' }}
          gradient="linear-gradient(90deg,#A3E635,#ffffff)"
          paused={prefersReducedMotion}
        />

        {/* beam to try-on */}
        <Beam
          start={{ x: '50%', y: '54%' }}
          end={{ x: '86%', y: '78%' }}
          gradient="linear-gradient(90deg,#F472B6,#ffffff)"
          paused={prefersReducedMotion}
        />
      </div>

      {/* Legend / micro help */}
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-zinc-600">
        <span className="inline-flex items-center gap-2">
          <Dot className="bg-lime-500" /> Enhance
        </span>
        <span className="inline-flex items-center gap-2">
          <Dot className="bg-fuchsia-500" /> Try-On
        </span>
        <span className="inline-flex items-center gap-1">•</span>
        <span className="">Auto-cycles. Tap a chip to focus.</span>
      </div>

      <StyleKeyframes />
    </div>
  );
}

function Chip({ active, color, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition',
        active
          ? 'border-zinc-300 bg-white shadow-sm'
          : 'border-zinc-200 bg-white/70 hover:bg-white',
      ].join(' ')}
    >
      <span className={`h-2 w-2 rounded-full ${color}`} aria-hidden />
      {children}
    </button>
  );
}

function Dot({ className = '' }) {
  return <span className={`inline-block h-2 w-2 rounded-full ${className}`} aria-hidden />;
}

function EntryCapsule() {
  const prefersReducedMotion = useReducedMotion();
  const controls = useAnimation();
  useEffect(() => {
    if (prefersReducedMotion) return;
    controls.start({
      y: [0, -4, 0],
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
    });
  }, [prefersReducedMotion, controls]);

  return (
    <motion.div
      animate={controls}
      className="absolute left-6 top-1/2 -translate-y-1/2 rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm"
      aria-label="Product entry"
    >
      <div className="relative h-24 w-32 rounded-xl border border-zinc-200 bg-gradient-to-br from-white to-orange-50">
        {/* abstract product box */}
        <div className="absolute inset-0 grid place-items-center">
          <svg width="80" height="60" viewBox="0 0 80 60">
            <rect x="10" y="16" width="60" height="28" rx="6" fill="#fde68a" />
            <rect x="16" y="22" width="48" height="16" rx="4" fill="#fb923c" />
          </svg>
        </div>
        {/* little shimmer */}
        <div className="pointer-events-none absolute inset-0 animate-shimmer bg-[linear-gradient(110deg,transparent,rgba(255,255,255,.6),transparent)] bg-[length:180%_100%]" />
      </div>
      <div className="mt-1 text-center text-[10px] text-zinc-500">Product (sample)</div>
    </motion.div>
  );
}

function Beam({ start, end, gradient, paused }) {
  const prefersReducedMotion = paused;
  return (
    <motion.div
      aria-hidden
      className="absolute h-1 origin-left"
      style={{
        left: start.x,
        top: start.y,
        width: '38%',
        transform: `translate(-50%,-50%)`,
        background: gradient,
        boxShadow: '0 0 18px rgba(0,0,0,0.08)',
        borderRadius: '8px',
      }}
      animate={
        prefersReducedMotion
          ? { opacity: 0.6 }
          : { opacity: [0.3, 0.85, 0.3] }
      }
      transition={
        prefersReducedMotion
          ? {}
          : { duration: 3.4, repeat: Infinity, repeatType: 'mirror' }
      }
    />
  );
}

function OutletCard({ id, title, subtitle, colorClass, boxClass, active, children }) {
  return (
    <div className={`pointer-events-auto absolute ${boxClass} z-[2]`}>
      <div
        className={[
          'relative w-[10.5rem] rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm transition',
          active ? 'ring-2 ring-offset-2 ring-offset-white ring-zinc-200' : '',
        ].join(' ')}
        role="group"
        aria-labelledby={`${id}-title`}
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-gradient-to-br from-white to-zinc-50">
          {children}
        </div>
      </div>
      <div className="mt-1 flex items-center gap-2 text-[11px] font-semibold">
        <span className={`inline-block h-2 w-2 rounded-full bg-gradient-to-r ${colorClass}`} aria-hidden />
        <span id={`${id}-title`}>{title}</span>
      </div>
      <div className="text-[10px] text-zinc-500">{subtitle}</div>
    </div>
  );
}

function EnhancePreview({ active }) {
  return (
    <>
      {/* base abstract product */}
      <div className="absolute inset-0 grid place-items-center">
        <svg width="96" height="72" viewBox="0 0 96 72" className="opacity-90">
          <rect x="10" y="18" width="76" height="36" rx="8" fill="#fde68a" />
          <rect x="18" y="26" width="60" height="20" rx="6" fill="#fb923c" />
        </svg>
      </div>
      {/* shimmer sweep for 'enhance' */}
      <div
        className={[
          'absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,.8),transparent)] bg-[length:200%_100%]',
          active ? 'animate-shimmer' : 'opacity-50',
        ].join(' ')}
      />
      {/* focus vignette */}
      <div className="pointer-events-none absolute inset-0 rounded-lg shadow-[inset_0_0_40px_rgba(0,0,0,0.15)]" />
    </>
  );
}

function TryOnPreview({ active }) {
  // flip garment opacity/scale
  const prefersReducedMotion = useReducedMotion();
  const [flip, setFlip] = useState(false);
  useEffect(() => {
    if (prefersReducedMotion) return;
    const t = setInterval(() => setFlip((f) => !f), 1600);
    return () => clearInterval(t);
  }, [prefersReducedMotion]);

  return (
    <>
      {/* mannequin */}
      <div className="absolute inset-0 grid place-items-center">
        <svg width="110" height="140" viewBox="0 0 110 140" className="opacity-90">
          <defs>
            <linearGradient id="skin" x1="0" x2="1">
              <stop offset="0%" stopColor="#fde68a" />
              <stop offset="100%" stopColor="#fca5a5" />
            </linearGradient>
          </defs>
          <circle cx="55" cy="20" r="12" fill="url(#skin)" />
          <rect x="30" y="36" width="50" height="44" rx="10" fill="#e5e7eb" />
          <rect x="22" y="82" width="66" height="34" rx="14" fill="#e5e7eb" />
        </svg>
      </div>
      {/* garment overlay */}
      <motion.div
        className="absolute left-1/2 top-[48%] h-24 w-[62%] -translate-x-1/2 -translate-y-1/2 rounded-md"
        animate={active ? { opacity: flip ? 0.95 : 0.7, scale: flip ? 1 : 0.98 } : { opacity: 0.7, scale: 1 }}
        transition={{ duration: 0.6 }}
        style={{ background: 'linear-gradient(135deg,#c084fc,#f472b6)' }}
      />
      {/* inner shadow */}
      <div className="pointer-events-none absolute inset-0 rounded-lg shadow-[inset_0_0_40px_rgba(0,0,0,0.12)]" />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                              SECTION: DIVIDER                               */
/* -------------------------------------------------------------------------- */

function SectionDivider() {
  return (
    <div className="mx-auto my-6 max-w-7xl px-5 sm:px-6 md:px-10 lg:px-16">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold">1 / 2</span>
          <div className="h-1.5 w-48 overflow-hidden rounded-full bg-white/70 ring-1 ring-zinc-200">
            <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-orange-400 via-fuchsia-400 to-lime-400" />
          </div>
        </div>
        <a
          href="#how"
          className="inline-flex items-center justify-center rounded-full bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white shadow-[0_8px_18px_rgba(249,115,22,0.3)] hover:bg-orange-700"
        >
          Continue →
        </a>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              HOW IT WORKS (2)                               */
/* -------------------------------------------------------------------------- */

function HowItWorks() {
  const steps = [
    {
      title: 'Enhance',
      hue: 'from-lime-400 to-emerald-400',
      copy: 'Auto retouch & upscale to high-res. Better lighting, color, and clarity — instantly.',
      bullets: ['High-res export', 'Color-correct', 'Fast previews'],
      icon: '✨',
    },
    {
      title: 'Try-On',
      hue: 'from-fuchsia-400 to-amber-400',
      copy: 'Realistic on-model previews for garments. Size and fit awareness with consistent lighting.',
      bullets: ['Multiple sizes', 'Skin-tone friendly', 'Export-ready'],
      icon: '🧍',
    },
  ];

  return (
    <section id="how" className="relative mx-auto max-w-7xl px-5 pb-14 pt-6 sm:px-6 md:px-10 lg:px-16">
      <h2 className="text-center text-3xl font-extrabold md:text-4xl">How it works</h2>
      <p className="mx-auto mt-2 max-w-2xl text-center text-zinc-700">
        Two clear paths. Same result: publish-ready visuals for every channel in minutes — no studio, no reshoots.
      </p>

      <div className="mx-auto mt-8 grid max-w-6xl gap-4 sm:grid-cols-2">
        {steps.map((s) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.45 }}
            className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br opacity-30 blur-2xl sm:h-36 sm:w-36" style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}>
              {/* gradient background hint, actual colors from class on child below */}
            </div>

            <div className="relative z-10">
              <div className={`mb-2 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-semibold ring-1 ring-zinc-200`}>
                <span className={`inline-block h-2 w-2 rounded-full bg-gradient-to-r ${s.hue}`} />
                {s.title}
              </div>
              <div className="text-2xl" aria-hidden>
                {s.icon}
              </div>
              <p className="mt-2 text-sm text-zinc-700">{s.copy}</p>
              <ul className="mt-3 space-y-1 text-sm">
                {s.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-orange-400" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            {/* decorative gradient ring per card */}
            <div className={`pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br ${s.hue} opacity-10`} aria-hidden />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                             B2B BENEFITS / PROOF                            */
/* -------------------------------------------------------------------------- */

function B2BBenefits() {
  const items = [
    {
      title: 'Speed to Launch',
      desc: 'Go from concept to publish-ready assets in minutes, not weeks.',
      kpi: 'x10',
    },
    {
      title: 'Consistency at Scale',
      desc: 'On-brand lighting, angles, and scenes across entire catalogs.',
      kpi: '99.9%',
    },
    {
      title: 'Lower Cost',
      desc: 'No studio bookings. No reshoots. Predictable, transparent pricing.',
      kpi: '-70%',
    },
    {
      title: 'API Ready',
      desc: 'Plug your workflow: DAM, PIM, Shopify, or internal tools.',
      kpi: 'REST',
    },
  ];

  return (
    <section id="benefits" className="relative mx-auto max-w-7xl px-5 pb-10 pt-6 sm:px-6 md:px-10 lg:px-16">
      <h2 className="text-center text-3xl font-extrabold md:text-4xl">Built for B2B teams</h2>
      <p className="mx-auto mt-2 max-w-2xl text-center text-zinc-700">
        For social-first brands, marketplaces, and agencies that need fast, consistent, on-brand visuals.
      </p>

      <div className="mx-auto mt-8 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => (
          <motion.div
            key={it.title}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45 }}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <div className="text-2xl font-extrabold">{it.kpi}</div>
            <div className="mt-1 text-lg font-semibold">{it.title}</div>
            <p className="mt-1 text-sm text-zinc-700">{it.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                               TRUST / LOGOS                                 */
/* -------------------------------------------------------------------------- */

function LogosAndTrust() {
  const logos = ['Shopify', 'TikTok Shop', 'Meta', 'Woo', 'Klaviyo', 'GA4'];
  return (
    <section id="trust" className="relative mx-auto max-w-7xl px-5 pb-8 pt-6 sm:px-6 md:px-10 lg:px-16">
      <div className="mb-3 text-center text-[11px] uppercase tracking-widest text-zinc-600">EXPORT-READY FOR</div>
      <div className="[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="animate-marquee flex min-w-full items-center gap-6 opacity-80 hover:[animation-play-state:paused]">
          {logos.concat(logos).map((name, i) => (
            <div
              key={`${name}-${i}`}
              className="relative h-8 w-32 rounded-xl border border-zinc-200 bg-white text-center text-xs font-semibold text-zinc-700 shadow-sm"
            >
              <div className="absolute inset-0 grid place-items-center">{name}</div>
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
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  BOTTOM CTA                                 */
/* -------------------------------------------------------------------------- */

function BottomCTA() {
  return (
    <section className="relative mx-auto max-w-6xl px-5 pb-24 pt-8 text-center sm:px-6 md:px-10">
      <div className="rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 to-fuchsia-50 p-8 shadow-[0_20px_60px_rgba(249,115,22,0.12)]">
        <h3 className="text-2xl font-extrabold">Ready to orbit your visuals?</h3>
        <p className="mx-auto mt-2 max-w-xl text-zinc-700">
          Enhance products and try garments on models without studios or reshoots. Faster launches, lower cost.
        </p>
        <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <PrimaryCTA href="/dashboard">Start free</PrimaryCTA>
          <a
            href="#how"
            className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold transition hover:bg-zinc-50"
          >
            See how it works
          </a>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                STICKY CTA (M)                               */
/* -------------------------------------------------------------------------- */

function StickyMobileCTA() {
  return (
    <div className="md:hidden">
      <Link
        href="/dashboard"
        className="fixed inset-x-4 bottom-4 z-50 flex items-center justify-center rounded-2xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-orange-500/30 transition hover:bg-orange-700"
        aria-label="Start now"
      >
        Start now →
      </Link>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   BACKDROP                                  */
/* -------------------------------------------------------------------------- */

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
<rect width=\'100%\' height=\'100%\' filter=\'url(%23n)\' opacity=\'0.6\'/></svg>")',
      }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                                 UTIL / STYLES                               */
/* -------------------------------------------------------------------------- */

function StyleKeyframes() {
  return (
    <style jsx>{`
      @keyframes shimmer {
        0% {
          background-position: -200% 0;
        }
        100% {
          background-position: 200% 0;
        }
      }
      .animate-shimmer {
        animation: shimmer 2.2s linear infinite;
      }
    `}</style>
  );
}
