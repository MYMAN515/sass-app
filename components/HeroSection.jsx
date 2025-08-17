// app/page.jsx
"use client";

import Link from "next/link";
import { motion, useAnimation, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import React from "react";

/**
 * NOVA WEAVE — Totally-new, ultra-weird, modern B2B landing
 * — No navbar/footer. Mobile-first. Heavy animations (respect reduced-motion).
 * — Pure SVG/Procedural visuals (no stock images at all).
 * — Goal: Understand in < 60s via 5 horizontal slides (snap-x):
 *   1) Intro  2) Upload  3) Enhance  4) Try‑On  5) Export
 * — Product: Enhance (retouch/upscale) + Try‑On (on-model preview) for catalogs.
 */

export default function Page() {
  const railRef = useRef(null);
  const toSlide = (index) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  };

  return (
    <main className="relative min-h-screen w-screen overflow-hidden bg-[#0B0F1A] text-white">
      <AuroraBackdrop />

      <Rail ref={railRef}>
        <SlideIntro onNext={() => toSlide(1)} />
        <SlideUpload onNext={() => toSlide(2)} />
        <SlideEnhance onNext={() => toSlide(3)} />
        <SlideTryOn onNext={() => toSlide(4)} />
        <SlideExport />
      </Rail>

      <StickyCTA />
      <GlobalStyles />
    </main>
  );
}

/* --------------------------------- RAIL ----------------------------------- */
const Rail = React.forwardRef(function Rail({ children }, ref) {
  return (
    <div ref={ref} className="flex h-[100svh] w-screen snap-x snap-mandatory overflow-x-auto overflow-y-hidden">
      {React.Children.map(children, (c, i) => (
        <section
          key={i}
          className="relative grid h-[100svh] w-[100svw] flex-none snap-start place-items-center px-5"
          aria-roledescription="slide"
        >
          {c}
        </section>
      ))}
    </div>
  );
});

/* ------------------------------- SLIDE: INTRO ------------------------------ */
function SlideIntro({ onNext }) {
  return (
    <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 md:grid-cols-2">
      <IntroCopy onNext={onNext} />
      <IntroVisual />
    </div>
  );
}

function IntroCopy({ onNext }) {
  return (
    <div className="relative z-10">
      <Badge>NOVA • WEAVE • B2B</Badge>
      <h1 className="mt-3 text-balance text-4xl font-extrabold leading-[1.04] tracking-tight md:text-6xl">
        AI visuals for catalogs — **no studios**
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-300 md:text-base">
        Two powers. One pipeline: <span className="font-semibold text-cyan-300">Enhance</span> product photos to crisp
        high‑res & <span className="font-semibold text-fuchsia-300">Try‑On</span> garments on models.
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <PrimaryCTA href="/dashboard">Start free</PrimaryCTA>
        <GhostCTA onClick={onNext}>See how (→)</GhostCTA>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-zinc-400">
        <Pill>No credit card</Pill>
        <Pill>High‑res exports</Pill>
        <Pill>API & SSO</Pill>
      </div>
    </div>
  );
}

function IntroVisual() {
  const prefersReducedMotion = useReducedMotion();
  const orbit = useAnimation();
  useEffect(() => {
    if (prefersReducedMotion) return;
    orbit.start({ rotate: 360, transition: { duration: 40, repeat: Infinity, ease: "linear" } });
  }, [prefersReducedMotion, orbit]);

  return (
    <div className="relative mx-auto w-[min(92vw,40rem)]">
      <motion.div
        aria-hidden
        animate={orbit}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
        style={{ background: "conic-gradient(from 0deg,#06b6d4,#a78bfa,#f472b6,#22d3ee,#06b6d4)" }}
      />

      <PipelineDiagram />
    </div>
  );
}

function PipelineDiagram() {
  return (
    <div className="relative aspect-square w-full rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-md">
      <div className="absolute inset-0 rounded-[2rem] ring-1 ring-white/10" />

      {/* nodes */}
      <Node x="18%" y="50%" label="Upload" hue="from-cyan-400 to-sky-400" />
      <Node x="50%" y="50%" label="Enhance" hue="from-emerald-400 to-lime-400" />
      <Node x="82%" y="50%" label="Try‑On" hue="from-fuchsia-400 to-rose-400" />

      <Beam x1="18%" y1="50%" x2="50%" y2="50%" gradient="linear-gradient(90deg,#22d3ee,#86efac)" />
      <Beam x1="50%" y1="50%" x2="82%" y2="50%" gradient="linear-gradient(90deg,#86efac,#f472b6)" />

      {/* export cloud */}
      <Cloud x="82%" y="18%" tags={["Shopify","TikTok","Meta","Woo"]} />
    </div>
  );
}

function Node({ x, y, label, hue }) {
  return (
    <div className="absolute" style={{ left: x, top: y, transform: "translate(-50%,-50%)" }}>
      <div className="rounded-2xl border border-white/10 bg-white/10 p-2 shadow-xl">
        <div className="relative aspect-[4/5] w-24 overflow-hidden rounded-xl bg-gradient-to-br from-white/5 to-white/0">
          <div className={["absolute inset-0 rounded-xl bg-gradient-to-r opacity-60", hue].join(" ")} aria-hidden />
        </div>
        <div className="mt-1 text-center text-[11px] font-semibold text-zinc-200">{label}</div>
      </div>
    </div>
  );
}

function Beam({ x1, y1, x2, y2, gradient }) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      aria-hidden
      className="absolute h-[6px] origin-left rounded-full"
      style={{ left: x1, top: y1, width: "34%", transform: "translate(-50%,-50%)", background: gradient, boxShadow: "0 0 22px rgba(0,0,0,.25)" }}
      animate={prefersReducedMotion ? { opacity: 0.7 } : { opacity: [0.4, 1, 0.4] }}
      transition={prefersReducedMotion ? {} : { duration: 3, repeat: Infinity, repeatType: "mirror" }}
    />
  );
}

function Cloud({ x, y, tags }) {
  return (
    <div className="absolute" style={{ left: x, top: y, transform: "translate(-50%,-50%)" }}>
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] text-zinc-200">
        {tags.map((t) => (
          <span key={t} className="rounded-full bg-white/10 px-2 py-0.5">{t}</span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------- SLIDE: UPLOAD ----------------------------- */
function SlideUpload({ onNext }) {
  return (
    <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 md:grid-cols-2">
      <UploadVisual />
      <div>
        <h2 className="text-3xl font-extrabold md:text-4xl">Upload</h2>
        <p className="mt-2 max-w-md text-sm text-zinc-300 md:text-base">Drop product shots or garment flats. We ingest folders, zips, or API feeds.</p>
        <div className="mt-4 flex gap-2 text-[11px] text-zinc-300">
          <Pill>S3</Pill><Pill>GDrive</Pill><Pill>ZIP</Pill><Pill>API</Pill>
        </div>
        <div className="mt-6"><GhostCTA onClick={onNext}>Next →</GhostCTA></div>
      </div>
    </div>
  );
}

function UploadVisual() {
  const prefersReducedMotion = useReducedMotion();
  return (
    <div className="relative mx-auto w-[min(92vw,40rem)] overflow-visible rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-md">
      <div className="absolute inset-0 rounded-[2rem] ring-1 ring-white/10" />
      <Funnel />
      <div className="relative z-10 grid grid-cols-3 gap-3">
        {[1,2,3,4,5,6].map((i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .3 }} transition={{ duration: .45, delay: i * .06 }} className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10 bg-white/5">
            <SVGDoc ariaLabel={`file ${i}`} />
            <div className={"pointer-events-none absolute inset-0 rounded-xl " + (prefersReducedMotion?"":"animate-hue")} style={{ background: "conic-gradient(from 0deg, rgba(34,211,238,.15), rgba(167,139,250,.15), rgba(244,114,182,.15), rgba(34,211,238,.15))", mixBlendMode:"color" }} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Funnel() {
  const prefersReducedMotion = useReducedMotion();
  const orbit = useAnimation();
  useEffect(() => {
    if (prefersReducedMotion) return;
    orbit.start({ rotate: 360, transition: { duration: 22, repeat: Infinity, ease: "linear" } });
  }, [prefersReducedMotion, orbit]);
  return (
    <motion.div aria-hidden animate={orbit} className="pointer-events-none absolute left-1/2 top-1/2 h-[86%] w-[86%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl" style={{ background: "conic-gradient(from 0deg,#22d3ee,#a78bfa,#f472b6,#22d3ee)" }} />
  );
}

function SVGDoc({ ariaLabel }) {
  return (
    <svg viewBox="0 0 80 60" className="absolute left-1/2 top-1/2 h-16 w-20 -translate-x-1/2 -translate-y-1/2" aria-label={ariaLabel}>
      <rect x="6" y="8" width="68" height="44" rx="8" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.15)" />
      <rect x="14" y="18" width="52" height="6" rx="3" fill="rgba(255,255,255,.25)" />
      <rect x="14" y="28" width="40" height="6" rx="3" fill="rgba(255,255,255,.18)" />
      <rect x="14" y="38" width="28" height="6" rx="3" fill="rgba(255,255,255,.12)" />
    </svg>
  );
}

/* ------------------------------ SLIDE: ENHANCE ----------------------------- */
function SlideEnhance({ onNext }) {
  return (
    <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 md:grid-cols-2">
      <EnhanceVisual />
      <div>
        <h2 className="text-3xl font-extrabold md:text-4xl">Enhance</h2>
        <p className="mt-2 max-w-md text-sm text-zinc-300 md:text-base">AI retouch & upscale to crisp high‑res. Color‑correct and lighting normalization.</p>
        <div className="mt-6"><GhostCTA onClick={onNext}>Next →</GhostCTA></div>
      </div>
    </div>
  );
}

function EnhanceVisual() {
  const prefersReducedMotion = useReducedMotion();
  const [p, setP] = useState(58);
  return (
    <div className="relative mx-auto w-[min(92vw,40rem)] overflow-visible rounded-[2rem] border border-white/10 bg-white/5 p-4 backdrop-blur-md">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl">
        {/* before (soft/blur) */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 800 450" aria-label="before">
          <defs>
            <filter id="soften"><feGaussianBlur stdDeviation="2.5" /></filter>
          </defs>
          <rect x="0" y="0" width="800" height="450" fill="#1b2333" />
          <g filter="url(#soften)">
            <rect x="160" y="120" width="480" height="210" rx="18" fill="#94a3b8" />
            <rect x="200" y="160" width="400" height="130" rx="12" fill="#475569" />
          </g>
        </svg>
        {/* after (sharp/bright) clipped */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 800 450" style={{ clipPath: `inset(0 ${(100 - p).toFixed(1)}% 0 0)` }} aria-label="after">
          <rect x="0" y="0" width="800" height="450" fill="#0f172a" />
          <rect x="160" y="120" width="480" height="210" rx="18" fill="#22d3ee" />
          <rect x="200" y="160" width="400" height="130" rx="12" fill="#a78bfa" />
          <circle cx="620" cy="140" r="8" fill="#f472b6" />
        </svg>
        {/* handle */}
        <motion.div className="absolute top-1/2 z-10 h-14 w-14 -translate-y-1/2 rounded-full border border-white/10 bg-white/10 shadow-md backdrop-blur" style={{ left: `${p}%`, transform: `translate(-50%, -50%)` }} initial={false} animate={prefersReducedMotion ? { scale: 1 } : { scale: [1, 1.06, 1] }} transition={{ duration: 2, repeat: prefersReducedMotion ? 0 : Infinity }}>
          <div className="absolute inset-0 grid place-items-center text-lg">↔</div>
        </motion.div>
        <input aria-label="Reveal" type="range" min={0} max={100} value={p} onChange={(e) => setP(Number(e.target.value))} className="absolute inset-x-4 bottom-3 z-20 h-1 cursor-ew-resize appearance-none rounded-full bg-white/10 [accent-color:#22d3ee]" />
      </div>
    </div>
  );
}

/* ------------------------------- SLIDE: TRY-ON ----------------------------- */
function SlideTryOn({ onNext }) {
  const [size, setSize] = useState("M");
  return (
    <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 md:grid-cols-2">
      <TryOnVisual size={size} />
      <div>
        <h2 className="text-3xl font-extrabold md:text-4xl">Try‑On</h2>
        <p className="mt-2 max-w-md text-sm text-zinc-300 md:text-base">Preview garments on models. Sizes & fit awareness with consistent lighting.</p>
        <div className="mt-4 flex gap-2">
          {["XS","S","M","L","XL"].map((s) => (
            <button key={s} onClick={() => setSize(s)} className={["rounded-full border px-3 py-1 text-xs font-semibold", size===s?"border-white/30 bg-white/10":"border-white/10 bg-white/5 hover:bg-white/10"].join(" ")}>{s}</button>
          ))}
        </div>
        <div className="mt-6"><GhostCTA onClick={onNext}>Next →</GhostCTA></div>
      </div>
    </div>
  );
}

function TryOnVisual({ size }) {
  const prefersReducedMotion = useReducedMotion();
  const pulse = useAnimation();
  useEffect(() => {
    if (prefersReducedMotion) return;
    pulse.start({ scale: [1, 1.02, 1], transition: { duration: 1.8, repeat: Infinity } });
  }, [prefersReducedMotion, pulse]);

  const scale = { XS: 0.9, S: 0.95, M: 1, L: 1.05, XL: 1.1 }[size] || 1;

  return (
    <div className="relative mx-auto w-[min(92vw,40rem)] overflow-visible rounded-[2rem] border border-white/10 bg-white/5 p-4 backdrop-blur-md">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
        <svg viewBox="0 0 600 450" className="absolute inset-0 h-full w-full" aria-label="mannequin">
          <defs>
            <linearGradient id="skin" x1="0" x2="1"><stop offset="0%" stopColor="#f5d0a6" /><stop offset="100%" stopColor="#f0a0a0" /></linearGradient>
            <filter id="innerShade"><feDropShadow dx="0" dy="0" stdDeviation="12" floodColor="#000" floodOpacity=".25" /></filter>
          </defs>
          <circle cx="300" cy="70" r="22" fill="url(#skin)" />
          <rect x="250" y="110" width="100" height="100" rx="20" fill="#cbd5e1" />
          <rect x="230" y="220" width="140" height="110" rx="28" fill="#cbd5e1" />
        </svg>
        <motion.div aria-hidden animate={pulse} className="absolute left-1/2 top-[45%] h-40 w-[48%] -translate-x-1/2 -translate-y-1/2 rounded-md" style={{ transform: `translate(-50%,-50%) scale(${scale})`, background: "linear-gradient(135deg,#22d3ee,#f472b6)" }} />
        <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-white/10" />
      </div>
    </div>
  );
}

/* ------------------------------- SLIDE: EXPORT ----------------------------- */
function SlideExport() {
  const cards = [
    { k: "×10", t: "Speed to Launch" },
    { k: "99.9%", t: "Consistency" },
    { k: "−70%", t: "Lower Cost" },
  ];
  return (
    <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 md:grid-cols-2">
      <ExportVisual />
      <div>
        <h2 className="text-3xl font-extrabold md:text-4xl">Export</h2>
        <p className="mt-2 max-w-md text-sm text-zinc-300 md:text-base">Publish‑ready assets for every channel. Bulk pipelines & API delivery.</p>
        <div className="mt-5 grid grid-cols-3 gap-3 text-center">
          {cards.map((c) => (
            <div key={c.t} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xl font-extrabold text-cyan-300">{c.k}</div>
              <div className="text-[11px] text-zinc-300">{c.t}</div>
            </div>
          ))}
        </div>
        <div className="mt-6"><PrimaryCTA href="/dashboard">Start free</PrimaryCTA></div>
      </div>
    </div>
  );
}

function ExportVisual() {
  const prefersReducedMotion = useReducedMotion();
  const orbit = useAnimation();
  useEffect(() => {
    if (prefersReducedMotion) return;
    orbit.start({ rotate: 360, transition: { duration: 26, repeat: Infinity, ease: "linear" } });
  }, [prefersReducedMotion, orbit]);

  return (
    <div className="relative mx-auto grid w-[min(92vw,40rem)] place-items-center overflow-visible rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-md">
      <motion.div aria-hidden animate={orbit} className="pointer-events-none absolute left-1/2 top-1/2 h-[84%] w-[84%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl" style={{ background: "conic-gradient(from 0deg,#22d3ee,#a78bfa,#f472b6,#22d3ee)" }} />
      <div className="relative grid grid-cols-3 gap-3">
        {["Shopify","TikTok Shop","Meta","Woo","Klaviyo","GA4"].map((t) => (
          <div key={t} className="relative h-14 w-32 rounded-xl border border-white/10 bg-white/5 text-center text-xs font-semibold text-zinc-200">
            <div className="absolute inset-0 grid place-items-center">{t}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------- SHARED UI ------------------------------- */
function Badge({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-zinc-200">
      {children}
    </span>
  );
}
function Pill({ children }) {
  return <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{children}</span>;
}
function PrimaryCTA({ href, children }) {
  return (
    <Link href={href} className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-400 px-5 py-3 text-sm font-semibold text-black shadow-[0_10px_24px_rgba(56,189,248,0.35)] transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
      {children}
      <span className="ml-1" aria-hidden>→</span>
    </Link>
  );
}
function GhostCTA({ href, children, onClick }) {
  const Comp = href ? "a" : "button";
  const props = href ? { href } : { onClick };
  return (
    <Comp {...props} className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20">
      {children}
    </Comp>
  );
}

/* --------------------------------- AURORA BG ------------------------------- */
function AuroraBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute -left-32 -top-32 h-[36rem] w-[36rem] rounded-full bg-[conic-gradient(at_30%_30%,#22d3ee_0%,#a78bfa_25%,#f472b6_55%,#22d3ee_85%)] opacity-30 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-[34rem] w-[34rem] rounded-full bg-[conic-gradient(at_70%_70%,#a78bfa_0%,#22d3ee_35%,#f472b6_70%,#a78bfa_100%)] opacity-30 blur-3xl" />
      <NoiseSkin />
    </div>
  );
}
function NoiseSkin() {
  return (
    <div aria-hidden className="absolute inset-0 opacity-[0.06] mix-blend-soft-light" style={{
      backgroundImage: 'url("data:image/svg+xml;utf8,\
<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'1600\' height=\'900\'><filter id=\'n\'>\
<feTurbulence type=\'fractalNoise\' baseFrequency=\'.95\' numOctaves=\'4\'/>\
</filter>\
<rect width=\'100%\' height=\'100%\' filter=\'url(%23n)\' opacity=\'.6\'/>\
</svg>")'
    }} />
  );
}

/* --------------------------------- STICKY CTA ------------------------------ */
function StickyCTA() {
  return (
    <div className="md:hidden">
      <Link href="/dashboard" className="fixed inset-x-4 bottom-4 z-50 flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 to-fuchsia-400 px-5 py-3 text-sm font-semibold text-black shadow-xl transition hover:brightness-110" aria-label="Start now">
        Start now →
      </Link>
    </div>
  );
}

/* --------------------------------- GLOBAL CSS ------------------------------ */
function GlobalStyles() {
  return (
    <style jsx global>{`
      @keyframes hue { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(360deg); } }
      .animate-hue { animation: hue 10s linear infinite; }
    `}</style>
  );
}
