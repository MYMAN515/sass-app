// app/page.jsx
"use client";

import Link from "next/link";
import { motion, useAnimation, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * WARDROBE COLLIDER — Hyper-Weird B2B Duo Landing (Navbar removed)
 * - Modes: Enhance (retouch/upscale) & Try-On (garment on mannequin)
 * - Mobile-first, responsive, reduced-motion friendly
 * - Visual explanations with pictures (placeholders), animated accents only on transform/opacity
 * - Bright surreal gradients, blob morphs, glitch-on-press, sticky mobile CTA
 */

export default function Page() {
  return (
    <main className="relative min-h-screen w-full overflow-clip bg-[#FFF7ED] text-zinc-900">
      <CornerGradients />
      <NoiseOverlay />

      <HeroCollider />

      <HowItWorks />

      <WeirdGallery />

      <B2BBenefits />

      <LogosAndTrust />

      <BottomCTA />

      <StickyMobileCTA />

      <StyleKeyframes />
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*                                HERO — COLLIDER                              */
/* -------------------------------------------------------------------------- */

function HeroCollider() {
  return (
    <section className="relative isolate mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-5 pb-16 pt-10 sm:px-6 md:grid-cols-2 md:px-10 lg:px-16">
      <HeroCopy />
      <ColliderScene />
    </section>
  );
}

function HeroCopy() {
  return (
    <div className="relative z-10">
      <Badge>WEIRD • BRIGHT • B2B • RESPONSIVE</Badge>

      <h1 className="mt-3 text-balance text-4xl font-extrabold leading-[1.04] tracking-tight md:text-5xl">
        Two superpowers for your catalog:{" "}
        <span className="bg-gradient-to-r from-lime-500 via-orange-500 to-fuchsia-500 bg-clip-text text-transparent">
          Enhance
        </span>{" "}
        &{" "}
        <span className="bg-gradient-to-r from-fuchsia-500 via-orange-500 to-lime-500 bg-clip-text text-transparent">
          Try-On
        </span>
        .
      </h1>

      <p className="mt-3 max-w-xl text-base md:text-lg">
        No studios. No reshoots. Our AI retouches product photos to high-res and previews garments on models — ready
        for every channel.
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
  const [mode, setMode] = useState("enhance");

  // Auto cycle between modes unless reduced-motion
  useEffect(() => {
    if (prefersReducedMotion) return;
    const t = setInterval(() => setMode((m) => (m === "enhance" ? "tryon" : "enhance")), 3600);
    return () => clearInterval(t);
  }, [prefersReducedMotion]);

  // Orbit animation controller for the collider ring
  const ringControls = useAnimation();
  useEffect(() => {
    if (prefersReducedMotion) return;
    ringControls.start({ rotate: 360, transition: { duration: 40, repeat: Infinity, ease: "linear" } });
  }, [prefersReducedMotion, ringControls]);

  const pulseColor =
    mode === "enhance"
      ? "shadow-[0_0_0_8px_rgba(163,230,53,.12)]"
      : "shadow-[0_0_0_8px_rgba(244,114,182,.12)]";

  return (
    <div className="relative mx-auto w-[min(92vw,38rem)]">
      {/* Mode switcher chips (mobile-friendly) */}
      <div className="mb-3 flex items-center gap-2">
        <Chip active={mode === "enhance"} color="bg-lime-500" onClick={() => setMode("enhance")}>
          Enhance
        </Chip>
        <Chip active={mode === "tryon"} color="bg-fuchsia-500" onClick={() => setMode("tryon")}>
          Try-On
        </Chip>
      </div>

      <div
        className={[
          "relative aspect-square w-full rounded-3xl border border-orange-200 bg-white p-5",
          "shadow-[0_20px_60px_rgba(249,115,22,0.12)]",
          "group",
        ].join(" ")}
      >
        {/* Collider ring + beams */}
        <motion.div
          aria-hidden
          animate={ringControls}
          className={[
            "absolute left-1/2 top-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full",
            "bg-[conic-gradient(from_0deg,#f97316,#22c55e,#38bdf8,#f472b6,#f97316)] opacity-70",
            "blur-xl",
          ].join(" ")}
        />

        {/* Inner plate */}
        <div
          className={[
            "absolute left-1/2 top-1/2 h-[52%] w-[52%] -translate-x-1/2 -translate-y-1/2 rounded-[2rem]",
            "bg-white/70 backdrop-blur-md ring-1 ring-zinc-200",
            pulseColor,
          ].join(" ")}
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
          active={mode === "enhance"}
        >
          <EnhancePreview active={mode === "enhance"} />
        </OutletCard>

        {/* TRY-ON outlet (bottom-right) */}
        <OutletCard
          id="tryon"
          title="Try-On"
          subtitle="Realistic models • Sizes"
          colorClass="from-fuchsia-400 to-amber-400"
          boxClass="bottom-3 right-3"
          active={mode === "tryon"}
        >
          <TryOnPreview active={mode === "tryon"} />
        </OutletCard>

        {/* beam to enhance */}
        <Beam
          start={{ x: "54%", y: "46%" }}
          end={{ x: "86%", y: "18%" }}
          gradient="linear-gradient(90deg,#A3E635,#ffffff)"
          paused={prefersReducedMotion}
        />

        {/* beam to try-on */}
        <Beam
          start={{ x: "50%", y: "54%" }}
          end={{ x: "86%", y: "78%" }}
          gradient="linear-gradient(90deg,#F472B6,#ffffff)"
          paused={prefersReducedMotion}
        />

        {/* Press & hold to glitch */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl [--g:0] group-active:[--g:1]">
          <div className="absolute inset-0 rounded-3xl opacity-0 blur-sm transition-opacity duration-150 group-active:opacity-100"
               style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.06), rgba(0,0,0,0.06) 1px, transparent 1px, transparent 3px)" }} />
        </div>
      </div>

      {/* Legend / micro help */}
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-zinc-600">
        <span className="inline-flex items-center gap-2">
          <Dot className="bg-lime-500" /> Enhance
        </span>
        <span className="inline-flex items-center gap-2">
          <Dot className="bg-fuchsia-500" /> Try-On
        </span>
        <span aria-hidden className="inline-flex items-center gap-1">•</span>
        <span className="">Auto-cycles. Tap a chip to focus.</span>
      </div>
    </div>
  );
}

function Chip({ active, color, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition",
        active ? "border-zinc-300 bg-white shadow-sm" : "border-zinc-200 bg-white/70 hover:bg-white",
      ].join(" ")}
    >
      <span className={["h-2 w-2 rounded-full", color].join(" ")} aria-hidden />
      {children}
    </button>
  );
}

function Dot({ className = "" }) {
  return <span className={["inline-block h-2 w-2 rounded-full", className].join(" ")} aria-hidden />;
}

function EntryCapsule() {
  const prefersReducedMotion = useReducedMotion();
  const controls = useAnimation();
  useEffect(() => {
    if (prefersReducedMotion) return;
    controls.start({ y: [0, -4, 0], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } });
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
  const dx = useMemo(() => 0, []);
  return (
    <motion.div
      aria-hidden
      className="absolute h-1 origin-left rounded-md"
      style={{
        left: start.x,
        top: start.y,
        width: "38%",
        transform: "translate(-50%,-50%)",
        background: gradient,
        boxShadow: "0 0 18px rgba(0,0,0,0.08)",
        borderRadius: "8px",
      }}
      animate={prefersReducedMotion ? { opacity: 0.6 } : { opacity: [0.3, 0.85, 0.3] }}
      transition={prefersReducedMotion ? {} : { duration: 3.4, repeat: Infinity, repeatType: "mirror" }}
    />
  );
}

function OutletCard({ id, title, subtitle, colorClass, boxClass, active, children }) {
  return (
    <div className={["pointer-events-auto absolute", boxClass, "z-[2]"].join(" ")}> 
      <div
        className={[
          "relative w-[10.5rem] rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm transition",
          active ? "ring-2 ring-zinc-200 ring-offset-2 ring-offset-white" : "",
        ].join(" ")}
        role="group"
        aria-labelledby={`${id}-title`}
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-gradient-to-br from-white to-zinc-50">
          {children}
        </div>
      </div>
      <div className="mt-1 flex items-center gap-2 text-[11px] font-semibold">
        <span className={["inline-block h-2 w-2 rounded-full bg-gradient-to-r", colorClass].join(" ")} aria-hidden />
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
          "absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,.8),transparent)] bg-[length:200%_100%]",
          active ? "animate-shimmer" : "opacity-50",
        ].join(" ")}
      />
      {/* focus vignette */}
      <div className="pointer-events-none absolute inset-0 rounded-lg shadow-[inset_0_0_40px_rgba(0,0,0,0.15)]" />
    </>
  );
}

function TryOnPreview({ active }) {
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
        style={{ background: "linear-gradient(135deg,#c084fc,#f472b6)" }}
      />
      {/* inner shadow */}
      <div className="pointer-events-none absolute inset-0 rounded-lg shadow-[inset_0_0_40px_rgba(0,0,0,0.12)]" />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                              HOW IT WORKS (with pics)                      */
/* -------------------------------------------------------------------------- */

function HowItWorks() {
  const steps = [
    {
      title: "Enhance",
      hue: "from-lime-400 to-emerald-400",
      copy: "Auto retouch & upscale to high-res. Better lighting, color, and clarity — instantly.",
      bullets: ["High-res export", "Color-correct", "Fast previews"],
      img: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1400&auto=format&fit=crop",
      icon: "✨",
    },
    {
      title: "Try-On",
      hue: "from-fuchsia-400 to-amber-400",
      copy: "Realistic on-model previews for garments. Size and fit awareness with consistent lighting.",
      bullets: ["Multiple sizes", "Skin-tone friendly", "Export-ready"],
      img: "https://images.unsplash.com/photo-1562158070-4b69b9a39a8a?q=80&w=1400&auto=format&fit=crop",
      icon: "🧍",
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
            {/* gradient background hint */}
            <div
              className="absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-30 blur-2xl sm:h-36 sm:w-36"
              style={{ backgroundImage: "linear-gradient(to bottom right, var(--tw-gradient-stops))" }}
            />

            <div className="relative z-10">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-semibold ring-1 ring-zinc-200">
                <span className={["inline-block h-2 w-2 rounded-full bg-gradient-to-r", s.hue].join(" ")} />
                {s.title}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
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
                <div>
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
                    <img src={s.img} alt={`${s.title} example`} className="h-full w-full object-cover" />
                    <div className="pointer-events-none absolute inset-0 rounded-2xl mix-blend-overlay" style={{ background: "radial-gradient(120px 80px at 80% 20%, rgba(255,255,255,0.5), transparent 60%)" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* decorative gradient ring per card */}
            <div className={["pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br opacity-10", s.hue].join(" ")} aria-hidden />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 WEIRD GALLERY                               */
/* -------------------------------------------------------------------------- */

function WeirdGallery() {
  const images = [
    "https://images.unsplash.com/photo-1608571428094-4813d4d9d94c?q=80&w=1400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1520975682031-5f1b1a3bb0de?q=80&w=1400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9b?q=80&w=1400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1610395219791-24f9f2c8b447?q=80&w=1400&auto=format&fit=crop",
  ];

  return (
    <section className="relative mx-auto max-w-7xl px-5 pb-12 pt-4 sm:px-6 md:px-10 lg:px-16">
      <div className="mb-4 flex items-end justify-between">
        <h3 className="text-2xl font-extrabold">Pictures explain the vibe</h3>
        <span className="text-xs text-zinc-600">Press & hold any tile to glitch</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {images.map((src, i) => (
          <motion.div
            key={src}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="group relative aspect-square overflow-hidden rounded-3xl border border-zinc-200 bg-white"
          >
            <img src={src} alt={`Sample ${i + 1}`} className="h-full w-full object-cover transition group-active:scale-[1.04]" />
            {/* surreal overlay */}
            <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
              <div className="absolute inset-0 animate-hue rounded-3xl mix-blend-color" style={{ background: "conic-gradient(from 0deg, rgba(249,115,22,.25), rgba(132,204,22,.25), rgba(99,102,241,.25), rgba(236,72,153,.25), rgba(249,115,22,.25))" }} />
            </div>
            {/* glitch on press */}
            <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 blur-[1px] transition group-active:opacity-100" style={{ background: "repeating-linear-gradient(0deg, rgba(255,255,255,0.25), rgba(255,255,255,0.25) 1px, transparent 1px, transparent 3px)" }} />
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
    { title: "Speed to Launch", desc: "From concept to publish-ready in minutes.", kpi: "×10" },
    { title: "Consistency at Scale", desc: "On-brand lighting and angles across catalogs.", kpi: "99.9%" },
    { title: "Lower Cost", desc: "No studios. No reshoots. Predictable pricing.", kpi: "−70%" },
    { title: "API Ready", desc: "Plug your DAM, PIM, Shopify, or internal tools.", kpi: "REST" },
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
  const logos = ["Shopify", "TikTok Shop", "Meta", "Woo", "Klaviyo", "GA4"];
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
        .animate-marquee { animation: marquee 26s linear infinite; }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
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
<rect width=\'100%\' height=\'100%\' filter=\'url(%23n)\' opacity=\'0.6\'/>\
</svg>")',
      }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                                 UTIL / STYLES                               */
/* -------------------------------------------------------------------------- */

function StyleKeyframes() {
  return (
    <style jsx global>{`
      @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      .animate-shimmer { animation: shimmer 2.2s linear infinite; }

      @keyframes hue { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(360deg); } }
      .animate-hue { animation: hue 8s linear infinite; }
    `}</style>
  );
}
