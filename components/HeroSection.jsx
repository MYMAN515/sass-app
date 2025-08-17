// app/page.jsx
"use client";

import Link from "next/link";
import { motion, useAnimation, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * HOLOGRID REEL — Ultra-Weird, Modern, Image-First B2B Landing (from scratch)
 * — No navbar/footer. Mobile-first. High motion (but reduced-motion friendly).
 * — Goal: User understands in < 60s via images + micro captions.
 * — Features shown only with visuals: Upload → Enhance → Try‑On → Export.
 */

export default function Page() {
  return (
    <main className="relative min-h-screen w-full overflow-clip bg-[#FFFCF6] text-zinc-900">
      <Backdrop />

      <SnapRail>
        <HeroFrame />
        <UploadFrame />
        <EnhanceFrame />
        <TryOnFrame />
        <ExportFrame />
      </SnapRail>

      <StickyMobileCTA />
      <GlobalStyles />
      <SvgDefs />
    </main>
  );
}

/* ------------------------------- SNAP CONTAINER ---------------------------- */
function SnapRail({ children }) {
  return (
    <div className="snap-y snap-mandatory h-[100svh] overflow-y-scroll [&>*]:snap-start">
      {children}
    </div>
  );
}

/* ----------------------------------- HERO --------------------------------- */
function HeroFrame() {
  return (
    <section className="relative grid h-[100svh] place-items-center px-5">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <CornerBursts />
        <NoiseOverlay />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-3xl text-center"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3 py-1 text-[11px] font-semibold">
          WEIRD • MODERN • B2B
        </div>
        <h1 className="mt-4 text-balance text-4xl font-extrabold leading-[1.04] tracking-tight md:text-6xl">
          AI visuals for catalogs — explained by pictures
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-zinc-700 md:text-base">
          Enhance to high‑res and try garments on models. No studio. No reshoots. Built for teams.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <PrimaryCTA href="/dashboard">Start free</PrimaryCTA>
          <GhostCTA href="#upload">See the reel</GhostCTA>
        </div>
        <ScrollHint />
      </motion.div>

      <GooHalo />
    </section>
  );
}

/* --------------------------------- UPLOAD ---------------------------------- */
function UploadFrame() {
  const prefersReducedMotion = useReducedMotion();
  const orbit = useAnimation();
  useEffect(() => {
    if (prefersReducedMotion) return;
    orbit.start({ rotate: 360, transition: { duration: 30, repeat: Infinity, ease: "linear" } });
  }, [prefersReducedMotion, orbit]);

  return (
    <section id="upload" className="relative grid h-[100svh] place-items-center px-5">
      <FrameCaption icon="📤" title="Upload shots" subtitle="Drop product photos or garment flats." />

      {/* Orbital stack of images */}
      <div className="relative h-[56svh] w-[min(92vw,50rem)]">
        <motion.div
          aria-hidden
          animate={orbit}
          className="pointer-events-none absolute left-1/2 top-1/2 h-[82%] w-[82%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl"
          style={{ background: "conic-gradient(from 0deg,#f97316,#22c55e,#38bdf8,#f472b6,#f97316)" }}
        />

        <StackedImg idx={1} src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1400&auto=format&fit=crop" x="12%" y="18%" r={-6} />
        <StackedImg idx={2} src="https://images.unsplash.com/photo-1562158070-4b69b9a39a8a?q=80&w=1400&auto=format&fit=crop" x="70%" y="30%" r={8} />
        <StackedImg idx={3} src="https://images.unsplash.com/photo-1610395219791-24f9f2c8b447?q=80&w=1400&auto=format&fit=crop" x="38%" y="68%" r={4} />

        <div className="pointer-events-none absolute inset-0 rounded-[2rem] ring-1 ring-zinc-200" />
      </div>
    </section>
  );
}

function StackedImg({ idx, src, x, y, r = 0 }) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: idx * 0.08 }}
      className="absolute"
      style={{ left: x, top: y, transform: `translate(-50%,-50%) rotate(${r}deg)` }}
    >
      <div className="group relative h-44 w-60 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm md:h-56 md:w-72">
        <img src={src} alt={`Upload sample ${idx}`} className="h-full w-full object-cover transition group-active:scale-[1.04]" />
        <div className={"pointer-events-none absolute inset-0 rounded-2xl " + (prefersReducedMotion ? "" : "animate-hue")} style={{ background: "conic-gradient(from 0deg, rgba(249,115,22,.18), rgba(132,204,22,.18), rgba(99,102,241,.18), rgba(236,72,153,.18), rgba(249,115,22,.18))", mixBlendMode: "color" }} />
        <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 blur-[1px] transition group-active:opacity-100" style={{ background: "repeating-linear-gradient(0deg, rgba(255,255,255,0.3), rgba(255,255,255,0.3) 1px, transparent 1px, transparent 3px)" }} />
      </div>
    </motion.div>
  );
}

/* -------------------------------- ENHANCE ---------------------------------- */
function EnhanceFrame() {
  return (
    <section className="relative grid h-[100svh] place-items-center px-5">
      <FrameCaption icon="✨" title="Enhance" subtitle="AI retouch + upscale to crisp high‑res." />
      <div className="relative w-[min(92vw,52rem)]">
        <ImageRevealSlider
          before="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1400&auto=format&fit=crop"
          after="https://images.unsplash.com/photo-1520975682031-5f1b1a3bb0de?q=80&w=1400&auto=format&fit=crop"
        />
      </div>
    </section>
  );
}

function ImageRevealSlider({ before, after }) {
  const prefersReducedMotion = useReducedMotion();
  const [p, setP] = useState(60);
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-zinc-200 bg-white p-3 shadow-[0_20px_60px_rgba(249,115,22,0.12)]">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl">
        <img src={before} alt="Before" className="absolute inset-0 h-full w-full object-cover" />
        <img
          src={after}
          alt="After"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ clipPath: `inset(0 ${(100 - p).toFixed(1)}% 0 0)` }}
        />
        <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-zinc-200" />

        {/* handle */}
        <motion.div
          className="absolute top-1/2 z-10 h-16 w-16 -translate-y-1/2 rounded-full border border-zinc-200 bg-white shadow-md"
          style={{ left: `${p}%`, transform: `translate(-50%, -50%)` }}
          initial={false}
          animate={prefersReducedMotion ? { scale: 1 } : { scale: [1, 1.04, 1] }}
          transition={prefersReducedMotion ? {} : { duration: 2, repeat: Infinity }}
        >
          <div className="absolute inset-0 grid place-items-center text-xl">↔</div>
        </motion.div>

        <input
          aria-label="Reveal"
          type="range"
          min={0}
          max={100}
          value={p}
          onChange={(e) => setP(Number(e.target.value))}
          className="absolute inset-x-4 bottom-4 z-20 h-1 cursor-ew-resize appearance-none rounded-full bg-zinc-200 [accent-color:#f97316]"
        />
      </div>
    </div>
  );
}

/* --------------------------------- TRY-ON ---------------------------------- */
function TryOnFrame() {
  const prefersReducedMotion = useReducedMotion();
  const [flip, setFlip] = useState(false);
  useEffect(() => {
    if (prefersReducedMotion) return;
    const t = setInterval(() => setFlip((f) => !f), 1600);
    return () => clearInterval(t);
  }, [prefersReducedMotion]);

  return (
    <section className="relative grid h-[100svh] place-items-center px-5">
      <FrameCaption icon="🧍" title="Try‑On" subtitle="Preview garments on models in sizes." />

      <div className="relative grid w-[min(92vw,52rem)] grid-cols-1 items-center gap-4 md:grid-cols-[1.1fr_.9fr]">
        {/* visual mannequin */}
        <div className="relative overflow-hidden rounded-[2rem] border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
            <div className="absolute inset-0 grid place-items-center">
              <svg width="140" height="180" viewBox="0 0 140 180" className="opacity-90" aria-hidden>
                <defs>
                  <linearGradient id="skin3" x1="0" x2="1">
                    <stop offset="0%" stopColor="#fde68a" />
                    <stop offset="100%" stopColor="#fca5a5" />
                  </linearGradient>
                </defs>
                <circle cx="70" cy="26" r="14" fill="url(#skin3)" />
                <rect x="40" y="46" width="60" height="56" rx="12" fill="#e5e7eb" />
                <rect x="30" y="104" width="80" height="44" rx="16" fill="#e5e7eb" />
              </svg>
            </div>
            <motion.div
              className="absolute left-1/2 top-[48%] h-32 w-[62%] -translate-x-1/2 -translate-y-1/2 rounded-md"
              animate={{ opacity: flip ? 0.96 : 0.72, scale: flip ? 1 : 0.98 }}
              transition={{ duration: 0.6 }}
              style={{ background: "linear-gradient(135deg,#c084fc,#f472b6)" }}
            />
            <div className="pointer-events-none absolute inset-0 rounded-xl shadow-[inset_0_0_44px_rgba(0,0,0,0.12)]" />
          </div>
        </div>

        {/* copy tiles */}
        <div className="grid gap-3">
          {["Pick size", "Skin‑tone friendly", "Consistent lighting"].map((t, i) => (
            <motion.div
              key={t}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm shadow-sm"
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-fuchsia-500" /> {t}
              </div>
            </motion.div>
          ))}
          <div className="pt-1">
            <PrimaryCTA href="/dashboard">Start free</PrimaryCTA>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- EXPORT --------------------------------- */
function ExportFrame() {
  const channels = ["Shopify", "TikTok Shop", "Meta", "Woo", "Klaviyo", "GA4"];
  return (
    <section className="relative grid h-[100svh] place-items-center px-5">
      <FrameCaption icon="🚀" title="Export" subtitle="Publish‑ready assets & API delivery." />

      <div className="mx-auto w-[min(92vw,56rem)]">
        <div className="relative overflow-hidden rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-[0_20px_60px_rgba(249,115,22,0.12)]">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {channels.map((c, i) => (
              <motion.div
                key={c}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: i * 0.04 }}
                className="relative h-14 rounded-xl border border-zinc-200 bg-zinc-50 text-center text-xs font-semibold text-zinc-700 shadow-sm"
              >
                <div className="absolute inset-0 grid place-items-center">{c}</div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[
              { kpi: "×10", t: "Speed to Launch" },
              { kpi: "99.9%", t: "Consistency" },
              { kpi: "−70%", t: "Lower Cost" },
            ].map((it, i) => (
              <motion.div
                key={it.t}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: i * 0.05 }}
                className="rounded-2xl border border-zinc-200 bg-white p-5 text-center"
              >
                <div className="text-2xl font-extrabold">{it.kpi}</div>
                <div className="text-sm text-zinc-700">{it.t}</div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center">
          <PrimaryCTA href="/dashboard">Start free</PrimaryCTA>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- SHARED BITS ------------------------------- */
function FrameCaption({ icon, title, subtitle }) {
  return (
    <div className="pointer-events-none absolute top-8 z-10 mx-auto w-full max-w-4xl px-5 text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-semibold shadow-sm">
        <span aria-hidden>{icon}</span> {title}
      </div>
      <div className="mt-2 text-xs text-zinc-600 md:text-sm">{subtitle}</div>
    </div>
  );
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
function ScrollHint() {
  return (
    <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-600">
      <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400" /> Scroll / Swipe
    </div>
  );
}

/* -------------------------------- BACKDROP --------------------------------- */
function Backdrop() {
  return (
    <>
      <CornerBursts />
      <NoiseOverlay />
      <GooField />
    </>
  );
}
function CornerBursts() {
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
function GooField() {
  const prefersReducedMotion = useReducedMotion();
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      {[
        ["18%","28%","from-emerald-300 to-lime-300",0],
        ["76%","22%","from-fuchsia-300 to-rose-300",6],
        ["24%","78%","from-sky-300 to-indigo-300",12],
      ].map(([x,y,grad,d],i)=> (
        <div key={i} className={["absolute h-40 w-40 rounded-full blur-2xl bg-gradient-to-br",grad, prefersReducedMotion?"opacity-25":"animate-blob"].join(" ")} style={{ left:x, top:y, transform:"translate(-50%,-50%)", animationDelay:`${d}s` }} />
      ))}
    </div>
  );
}
function GooHalo() {
  const prefersReducedMotion = useReducedMotion();
  const orbit = useAnimation();
  useEffect(() => {
    if (prefersReducedMotion) return;
    orbit.start({ rotate: 360, transition: { duration: 38, repeat: Infinity, ease: "linear" } });
  }, [prefersReducedMotion, orbit]);
  return (
    <motion.div aria-hidden animate={orbit} className="pointer-events-none absolute left-1/2 top-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl" style={{ background: "conic-gradient(from 0deg,#f97316,#22c55e,#38bdf8,#f472b6,#f97316)" }} />
  );
}

/* --------------------------------- STICKY CTA ------------------------------ */
function StickyMobileCTA() {
  return (
    <div className="md:hidden">
      <Link href="/dashboard" className="fixed inset-x-4 bottom-4 z-50 flex items-center justify-center rounded-2xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-orange-500/30 transition hover:bg-orange-700" aria-label="Start now">
        Start now →
      </Link>
    </div>
  );
}

/* -------------------------------- UTIL/STYLE ------------------------------- */
function GlobalStyles() {
  return (
    <style jsx global>{`
      @keyframes hue { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(360deg); } }
      .animate-hue { animation: hue 8s linear infinite; }

      @keyframes blob { 0%, 100% { transform: translate(0,0) scale(1); } 33%{ transform: translate(10px,-18px) scale(1.06);} 66%{ transform: translate(-12px,10px) scale(0.96);} }
      .animate-blob { animation: blob 18s ease-in-out infinite; }
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

