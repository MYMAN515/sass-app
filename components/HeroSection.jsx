// app/page.jsx
"use client";

import Link from "next/link";
import { motion, useAnimation, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

/**
 * MIRAGE FORGE — Super-Weird B2B Landing (from scratch)
 * Goal: shockingly modern, very weird visuals, yet clear value in < 1 minute.
 * What it is: AI visuals for catalogs — Enhance (retouch/upscale) + Try‑On (on-model preview) for B2B teams.
 * Constraints: no navbar/footer, mobile-first, accessible, reduced-motion friendly.
 */

export default function Page() {
  return (
    <main className="relative min-h-screen w-full overflow-clip bg-[#FFFDF7] text-zinc-900">
      <BackStage />

      <HeroPortal />
      <OneMinuteExplainer />
      <FeatureShowcase />
      <ProofOfValue />
      <TrustMarquee />
      <FinalCTA />
      <StickyMobileCTA />

      <GlobalStyles />
      <SvgDefs />
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*                                      HERO                                   */
/* -------------------------------------------------------------------------- */

function HeroPortal() {
  return (
    <section className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-5 pb-14 pt-10 sm:px-6 md:grid-cols-2 md:px-10 lg:px-16">
      <div className="relative z-10">
        <Badge>AI VISUALS • B2B • RESPONSIVE</Badge>
        <h1 className="mt-3 text-balance text-4xl font-extrabold leading-[1.04] tracking-tight md:text-5xl">
          Mirage Forge
          <span className="ml-2 inline-block align-middle text-base font-semibold text-orange-500">β</span>
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-700 md:text-base">
          Enhance products to crisp high‑res and preview garments on models — without studios or reshoots. Made for
          catalogs, marketplaces, and agencies.
        </p>

        <ul className="mt-4 grid max-w-md grid-cols-1 gap-2 text-sm">
          <li className="flex items-center gap-2"><Dot className="bg-emerald-500" /> Retouch, upscale, color‑correct</li>
          <li className="flex items-center gap-2"><Dot className="bg-fuchsia-500" /> On‑model try‑on in multiple sizes</li>
          <li className="flex items-center gap-2"><Dot className="bg-orange-500" /> API & bulk pipelines for teams</li>
        </ul>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <PrimaryCTA href="/dashboard">Start free</PrimaryCTA>
          <GhostCTA href="#explainer">60‑sec explainer</GhostCTA>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-600">
          <Pill>No credit card</Pill>
          <Pill>High‑res exports</Pill>
          <Pill>SLA & SSO</Pill>
        </div>
      </div>

      <PortalScene />
    </section>
  );
}

function PortalScene() {
  const prefersReducedMotion = useReducedMotion();
  const orbit = useAnimation();
  useEffect(() => {
    if (prefersReducedMotion) return;
    orbit.start({ rotate: 360, transition: { duration: 40, repeat: Infinity, ease: "linear" } });
  }, [prefersReducedMotion, orbit]);

  return (
    <div className="relative mx-auto w-[min(92vw,40rem)]">
      <div
        className="relative aspect-square w-full overflow-visible rounded-[2rem] border border-zinc-200 bg-white/80 p-4 shadow-[0_30px_80px_rgba(249,115,22,0.12)] backdrop-blur-md"
        style={{ filter: "url(#goo)" }}
        aria-label="Visual portal"
      >
        {/* spinning conic halo */}
        <motion.div
          aria-hidden
          animate={orbit}
          className="pointer-events-none absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl"
          style={{ background: "conic-gradient(from 0deg,#f97316,#22c55e,#38bdf8,#f472b6,#f97316)" }}
        />

        {/* core plate */}
        <div className="absolute left-1/2 top-1/2 h-[56%] w-[56%] -translate-x-1/2 -translate-y-1/2 rounded-[1.8rem] bg-white/80 ring-1 ring-zinc-200" />

        {/* goo blobs */}
        <GooBlob className="left-[18%] top-[38%] from-emerald-300 to-lime-300" delay={0} />
        <GooBlob className="right-[16%] top-[28%] from-fuchsia-300 to-rose-300" delay={6} />
        <GooBlob className="left-[30%] bottom-[18%] from-sky-300 to-indigo-300" delay={12} />

        {/* tokens (enhance / try-on) */}
        <Token label="Enhance" hue="from-lime-400 to-emerald-400" x="12%" y="12%" />
        <Token label="Try‑On" hue="from-fuchsia-400 to-amber-400" x="76%" y="70%" />

        {/* product plate sample */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm">
          <div className="relative h-24 w-32 rounded-xl border border-zinc-200 bg-gradient-to-br from-white to-orange-50">
            <div className="absolute inset-0 grid place-items-center" aria-hidden>
              <svg width="80" height="60" viewBox="0 0 80 60">
                <rect x="10" y="16" width="60" height="28" rx="6" fill="#fde68a" />
                <rect x="16" y="22" width="48" height="16" rx="4" fill="#fb923c" />
              </svg>
            </div>
            <div className="pointer-events-none absolute inset-0 animate-shimmer bg-[linear-gradient(110deg,transparent,rgba(255,255,255,.6),transparent)] bg-[length:180%_100%]" />
          </div>
          <div className="mt-1 text-center text-[10px] text-zinc-500">Product (sample)</div>
        </div>

        {/* beams */}
        <Beam x1="48%" y1="48%" x2="86%" y2="20%" gradient="linear-gradient(90deg,#A3E635,#ffffff)" />
        <Beam x1="50%" y1="52%" x2="83%" y2="78%" gradient="linear-gradient(90deg,#F472B6,#ffffff)" />

        {/* press to glitch hint */}
        <div className="pointer-events-none absolute inset-0 rounded-[2rem] opacity-0 blur-[1px] transition group-active:opacity-100" style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.06), rgba(0,0,0,0.06) 1px, transparent 1px, transparent 3px)" }} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-zinc-600">
        <span className="inline-flex items-center gap-2"><Dot className="bg-lime-500" /> Enhance</span>
        <span className="inline-flex items-center gap-2"><Dot className="bg-fuchsia-500" /> Try‑On</span>
        <span aria-hidden className="inline-flex items-center gap-1">•</span>
        <span>Tap & hold portal for micro‑glitch.</span>
      </div>
    </div>
  );
}

function GooBlob({ className = "", delay = 0 }) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <div
      aria-hidden
      className={["absolute h-40 w-40 rounded-full blur-2xl bg-gradient-to-br", className, prefersReducedMotion ? "opacity-30" : "animate-blob"].join(" ")}
      style={{ animationDelay: `${delay}s` }}
    />
  );
}

function Token({ label, hue, x, y }) {
  return (
    <div
      className="absolute"
      style={{ left: x, top: y, transform: "translate(-50%, -50%)" }}
    >
      <div className="rounded-xl border border-zinc-200 bg-white p-2 shadow-sm">
        <div className="relative aspect-[4/5] w-24 overflow-hidden rounded-lg bg-gradient-to-br from-white to-zinc-50">
          <div className={["absolute inset-0 rounded-lg bg-gradient-to-r opacity-50", hue].join(" ")} aria-hidden />
        </div>
        <div className="mt-1 flex items-center gap-2 text-[11px] font-semibold">
          <span className={["inline-block h-2 w-2 rounded-full bg-gradient-to-r", hue].join(" ")} aria-hidden />
          {label}
        </div>
      </div>
    </div>
  );
}

function Beam({ x1, y1, x2, y2, gradient }) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      aria-hidden
      className="absolute h-1 origin-left rounded-md"
      style={{ left: x1, top: y1, width: "38%", transform: "translate(-50%,-50%)", background: gradient, boxShadow: "0 0 18px rgba(0,0,0,0.08)" }}
      animate={prefersReducedMotion ? { opacity: 0.6 } : { opacity: [0.3, 0.85, 0.3] }}
      transition={prefersReducedMotion ? {} : { duration: 3.4, repeat: Infinity, repeatType: "mirror" }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                              60-SECOND EXPLAINER                            */
/* -------------------------------------------------------------------------- */

function OneMinuteExplainer() {
  const steps = [
    { h: "Upload", p: "Drop product shots or garment flats.", icon: "📤" },
    { h: "Enhance", p: "AI retouch + upscale to crisp high‑res.", icon: "✨" },
    { h: "Try‑On", p: "Preview garments on models in sizes.", icon: "🧍" },
    { h: "Export", p: "Publish‑ready assets & API delivery.", icon: "🚀" },
  ];
  const prefersReducedMotion = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % steps.length), prefersReducedMotion ? 4000 : 6000);
    return () => clearInterval(t);
  }, [prefersReducedMotion, steps.length]);

  return (
    <section id="explainer" className="relative mx-auto max-w-6xl px-5 pb-12 pt-4 sm:px-6 md:px-10 lg:px-16">
      <div className="mx-auto grid gap-4 md:grid-cols-[1fr_1fr]">
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"
          aria-live="polite"
        >
          <div className="mb-3 inline-flex items-center gap-2 text-[12px] font-semibold">
            <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-white">{i + 1}/4</span>
            <span className="text-zinc-600">60‑sec explainer</span>
          </div>
          <div className="text-2xl font-extrabold leading-tight">
            {steps[i].icon} {steps[i].h}
          </div>
          <p className="mt-1 text-zinc-700">{steps[i].p}</p>
          <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-zinc-100">
            <motion.div
              key={`bar-${i}`}
              className="h-full w-full origin-left bg-gradient-to-r from-orange-400 via-fuchsia-400 to-lime-400"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: prefersReducedMotion ? 3.6 : 5.6, ease: "linear" }}
            />
          </div>
        </motion.div>

        <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-2 text-[12px] font-semibold text-zinc-600">Why teams pick Mirage Forge</div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><Dot className="bg-emerald-500" /> 10× faster launches</li>
            <li className="flex items-center gap-2"><Dot className="bg-fuchsia-500" /> 99.9% consistency at scale</li>
            <li className="flex items-center gap-2"><Dot className="bg-orange-500" /> −70% cost vs. reshoots</li>
            <li className="flex items-center gap-2"><Dot className="bg-sky-500" /> API & SSO, SOC2 path</li>
          </ul>
          <div className="mt-5 grid grid-cols-2 gap-3 text-[11px] text-zinc-600 md:grid-cols-4">
            {[
              "Marketplaces",
              "Social Commerce",
              "D2C Brands",
              "Agencies",
            ].map((t) => (
              <div key={t} className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-center">{t}</div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                               FEATURE SHOWCASE                              */
/* -------------------------------------------------------------------------- */

function FeatureShowcase() {
  const [mode, setMode] = useState("enhance");
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative mx-auto max-w-7xl px-5 pb-12 pt-4 sm:px-6 md:px-10 lg:px-16">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-extrabold md:text-3xl">What it actually does</h2>
        <div className="flex items-center gap-2">
          <ModeChip active={mode === "enhance"} onClick={() => setMode("enhance")} label="Enhance" dot="bg-lime-500" />
          <ModeChip active={mode === "tryon"} onClick={() => setMode("tryon")} label="Try‑On" dot="bg-fuchsia-500" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Visual */}
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm"
        >
          {mode === "enhance" ? <EnhanceVisual /> : <TryOnVisual />}
        </motion.div>

        {/* Copy */}
        <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          {mode === "enhance" ? (
            <>
              <h3 className="text-xl font-extrabold">Enhance</h3>
              <p className="mt-1 text-sm text-zinc-700">Auto retouch & upscale to high‑res. Better lighting, color, and clarity.</p>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="flex items-center gap-2"><Dot className="bg-emerald-500" /> High‑res export</li>
                <li className="flex items-center gap-2"><Dot className="bg-orange-500" /> Color‑correct</li>
                <li className="flex items-center gap-2"><Dot className="bg-sky-500" /> Fast previews</li>
              </ul>
            </>
          ) : (
            <>
              <h3 className="text-xl font-extrabold">Try‑On</h3>
              <p className="mt-1 text-sm text-zinc-700">Realistic on‑model previews for garments. Size & fit awareness.</p>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="flex items-center gap-2"><Dot className="bg-fuchsia-500" /> Multiple sizes</li>
                <li className="flex items-center gap-2"><Dot className="bg-amber-500" /> Skin‑tone friendly</li>
                <li className="flex items-center gap-2"><Dot className="bg-emerald-500" /> Export‑ready</li>
              </ul>
            </>
          )}
          <div className="mt-5">
            <PrimaryCTA href="/dashboard">Start free</PrimaryCTA>
          </div>
        </div>
      </div>
    </section>
  );
}

function ModeChip({ active, onClick, label, dot }) {
  return (
    <button
      onClick={onClick}
      className={[
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition",
        active ? "border-zinc-300 bg-white shadow-sm" : "border-zinc-200 bg-white/70 hover:bg-white",
      ].join(" ")}
    >
      <span className={["h-2 w-2 rounded-full", dot].join(" ")} aria-hidden />
      {label}
    </button>
  );
}

function EnhanceVisual() {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
      <img
        src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1400&auto=format&fit=crop"
        alt="Sample product before/after"
        className="h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/0 via-white/0 to-white/0" />
      <div className="pointer-events-none absolute inset-0 animate-hue mix-blend-color" style={{ background: "conic-gradient(from 0deg, rgba(249,115,22,.12), rgba(132,204,22,.12), rgba(99,102,241,.12), rgba(236,72,153,.12), rgba(249,115,22,.12))" }} />
      <div className="pointer-events-none absolute inset-0 animate-shimmer bg-[linear-gradient(110deg,transparent,rgba(255,255,255,.6),transparent)] bg-[length:200%_100%]" />
    </div>
  );
}

function TryOnVisual() {
  const prefersReducedMotion = useReducedMotion();
  const [flip, setFlip] = useState(false);
  useEffect(() => {
    if (prefersReducedMotion) return;
    const t = setInterval(() => setFlip((f) => !f), 1600);
    return () => clearInterval(t);
  }, [prefersReducedMotion]);

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
      <div className="absolute inset-0 grid place-items-center">
        <svg width="120" height="160" viewBox="0 0 120 160" className="opacity-90" aria-hidden>
          <defs>
            <linearGradient id="skin2" x1="0" x2="1">
              <stop offset="0%" stopColor="#fde68a" /><stop offset="100%" stopColor="#fca5a5" />
            </linearGradient>
          </defs>
          <circle cx="60" cy="24" r="12" fill="url(#skin2)" />
          <rect x="35" y="42" width="50" height="48" rx="10" fill="#e5e7eb" />
          <rect x="26" y="92" width="68" height="38" rx="14" fill="#e5e7eb" />
        </svg>
      </div>
      <motion.div
        className="absolute left-1/2 top-[48%] h-28 w-[62%] -translate-x-1/2 -translate-y-1/2 rounded-md"
        animate={{ opacity: flip ? 0.95 : 0.7, scale: flip ? 1 : 0.98 }}
        transition={{ duration: 0.6 }}
        style={{ background: "linear-gradient(135deg,#c084fc,#f472b6)" }}
      />
      <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_0_44px_rgba(0,0,0,0.12)]" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  PROOF / B2B                                */
/* -------------------------------------------------------------------------- */

function ProofOfValue() {
  const items = [
    { kpi: "×10", title: "Speed to Launch", desc: "From concept to publish‑ready in minutes." },
    { kpi: "99.9%", title: "Consistency at Scale", desc: "On‑brand lighting & angles across catalogs." },
    { kpi: "−70%", title: "Lower Cost", desc: "No studios. No reshoots. Predictable pricing." },
    { kpi: "REST", title: "API Ready", desc: "Plug your DAM, PIM, Shopify, or internal tools." },
  ];

  return (
    <section className="relative mx-auto max-w-7xl px-5 pb-10 pt-6 sm:px-6 md:px-10 lg:px-16">
      <h2 className="text-center text-3xl font-extrabold md:text-4xl">Built for B2B teams</h2>
      <p className="mx-auto mt-2 max-w-2xl text-center text-zinc-700">
        For social‑first brands, marketplaces, and agencies that need fast, consistent, on‑brand visuals.
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
/*                                   TRUST / LOGOS                             */
/* -------------------------------------------------------------------------- */

function TrustMarquee() {
  const logos = ["Shopify", "TikTok Shop", "Meta", "Woo", "Klaviyo", "GA4"];
  return (
    <section className="relative mx-auto max-w-7xl px-5 pb-8 pt-6 sm:px-6 md:px-10 lg:px-16">
      <div className="mb-3 text-center text-[11px] uppercase tracking-widest text-zinc-600">EXPORT‑READY FOR</div>
      <div className="[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="animate-marquee flex min-w-full items-center gap-6 opacity-80 hover:[animation-play-state:paused]">
          {logos.concat(logos).map((name, i) => (
            <div key={`${name}-${i}`} className="relative h-8 w-32 rounded-xl border border-zinc-200 bg-white text-center text-xs font-semibold text-zinc-700 shadow-sm">
              <div className="absolute inset-0 grid place-items-center">{name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                     CTA                                     */
/* -------------------------------------------------------------------------- */

function FinalCTA() {
  return (
    <section className="relative mx-auto max-w-6xl px-5 pb-24 pt-8 text-center sm:px-6 md:px-10">
      <div className="rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 to-fuchsia-50 p-8 shadow-[0_20px_60px_rgba(249,115,22,0.12)]">
        <h3 className="text-2xl font-extrabold">Ready to orbit your visuals?</h3>
        <p className="mx-auto mt-2 max-w-xl text-zinc-700">
          Enhance products and try garments on models without studios or reshoots. Faster launches, lower cost.
        </p>
        <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <PrimaryCTA href="/dashboard">Start free</PrimaryCTA>
          <a href="#explainer" className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold transition hover:bg-zinc-50">
            See the 60‑sec tour
          </a>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 STICKY CTA (M)                              */
/* -------------------------------------------------------------------------- */

function StickyMobileCTA() {
  return (
    <div className="md:hidden">
      <Link href="/dashboard" className="fixed inset-x-4 bottom-4 z-50 flex items-center justify-center rounded-2xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-orange-500/30 transition hover:bg-orange-700" aria-label="Start now">
        Start now →
      </Link>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  SHARED UI                                  */
/* -------------------------------------------------------------------------- */

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
    <Link href={href} className="inline-flex items-center justify-center rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(249,115,22,0.3)] transition hover:bg-orange-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300">
      {children}
      <span className="ml-1" aria-hidden>→</span>
    </Link>
  );
}
function GhostCTA({ href, children }) {
  return (
    <a href={href} className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold transition hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300">
      {children}
    </a>
  );
}
function Dot({ className = "" }) {
  return <span className={["inline-block h-2 w-2 rounded-full", className].join(" ")} aria-hidden />;
}

/* -------------------------------------------------------------------------- */
/*                                    BACKSTAGE                                */
/* -------------------------------------------------------------------------- */

function BackStage() {
  return (
    <>
      <CornerGradients />
      <NoiseOverlay />
    </>
  );
}

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
/*                                  GLOBAL CSS                                 */
/* -------------------------------------------------------------------------- */

function GlobalStyles() {
  return (
    <style jsx global>{`
      @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      .animate-shimmer { animation: shimmer 2.2s linear infinite; }

      @keyframes hue { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(360deg); } }
      .animate-hue { animation: hue 8s linear infinite; }

      @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      .animate-marquee { animation: marquee 26s linear infinite; }

      @keyframes blob {
        0%, 100% { transform: translate(0,0) scale(1); }
        33%      { transform: translate(10px,-18px) scale(1.06); }
        66%      { transform: translate(-12px,10px) scale(0.96); }
      }
      .animate-blob { animation: blob 16s ease-in-out infinite; }
    `}</style>
  );
}

function SvgDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
      <defs>
        <filter id="goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -8" result="goo" />
          <feBlend in="SourceGraphic" in2="goo" />
        </filter>
      </defs>
    </svg>
  );
}
