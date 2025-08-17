// File: app/tryone-landing/page.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";

/**
 * TryOne Cloud Studio — Cute/Weird Pastel B2B Landing (RTL)
 * — Light theme, Off‑White background, high‑contrast Ink text.
 * — Mobile-first, accessible, gently animated (respects reduced-motion).
 * — Sections: Header/Nav, Hero (Before/After + Upload), Trust Bar, How it Works,
 *   ROI Dial, Use Cases Tabs, Features Grid, Pricing Sticker Book,
 *   Integrations & Security, FAQ with mini-demos, Final CTA.
 *
 * Notes:
 * - TailwindCSS required.
 * - Fonts recommended (global): Cairo/IBM Plex Sans Arabic for Arabic, Inter for Latin.
 * - All visuals are inline SVG/gradients; no external images.
 * - RTL by default; adjust container `dir` if your app sets LTR globally.
 */

export default function TryOneLandingPage() {
  return (
    <main dir="rtl" className="relative min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <GlobalStyles />
      <Header />
      <Hero />
      <TrustBar />
      <HowItWorks />
      <ROICalculator />
      <UseCases />
      <FeaturesGrid />
      <Pricing />
      <IntegrationsSecurity />
      <FAQ />
      <FinalCTA />
      <MobileStickyCTA />
    </main>
  );
}

/* --------------------------------- Header --------------------------------- */
function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[color:rgba(31,41,55,.08)]/50 bg-[var(--bg)]/80 backdrop-blur supports-[backdrop-filter]:bg-[var(--bg)]/70">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <LogoMark />
          <span className="text-sm font-bold tracking-tight">TryOne Cloud Studio</span>
        </div>
        <nav className="hidden items-center gap-4 text-sm sm:flex">
          <a href="#how" className="hover:opacity-80">كيف يشتغل؟</a>
          <a href="#roi" className="hover:opacity-80">العائد</a>
          <a href="#features" className="hover:opacity-80">المميزات</a>
          <a href="#pricing" className="hover:opacity-80">الأسعار</a>
          <a href="#faq" className="hover:opacity-80">الأسئلة</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="rounded-2xl bg-[var(--lav)] px-4 py-2 text-sm font-bold text-[var(--ink)] shadow-[0_8px_24px_rgba(200,182,255,.35)] transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lav)]"
            aria-label="جرّب الآن"
          >
            جرّب الآن
          </Link>
        </div>
      </div>
    </header>
  );
}

function LogoMark() {
  return (
    <div aria-hidden className="grid h-8 w-8 place-items-center rounded-xl bg-[var(--mint)] shadow-sm">
      <svg viewBox="0 0 40 40" className="h-6 w-6">
        <defs>
          <linearGradient id="g" x1="0" x2="1">
            <stop offset="0%" stopColor="#BFE6FF" />
            <stop offset="100%" stopColor="#FFDCCB" />
          </linearGradient>
        </defs>
        <rect x="6" y="6" width="28" height="28" rx="8" fill="url(#g)" />
        <path d="M12 20h16M20 12v16" stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

/* ---------------------------------- Hero ---------------------------------- */
function Hero() {
  const prefersReducedMotion = useReducedMotion();
  return (
    <section className="relative mx-auto max-w-7xl px-4 pt-8 sm:px-6">
      <div className="grid items-center gap-8 md:grid-cols-2">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[color:rgba(31,41,55,.08)] bg-white/70 px-3 py-1 text-[11px] font-semibold">Try‑On في 3 ثواني</div>
          <h1 className="mt-3 text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
            منتجك… <span className="underline decoration-[var(--lav)] decoration-4 underline-offset-4">يلبس نفسه!</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-7 sm:text-base">
            جرّب <strong>Try‑On & Enhance</strong> لمنتجاتك خلال ثوانٍ — صور واقعية بدون جلسات تصوير. منصة للمتاجر والوكالات.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <a href="#demo" className="inline-flex items-center justify-center rounded-xl bg-[var(--sky)] px-5 py-3 text-sm font-semibold text-[var(--ink)] shadow-[0_10px_24px_rgba(191,230,255,.45)] transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sky)]">
              جرّب صورة عيّنة
              <span className="mr-1" aria-hidden>↗</span>
            </a>
            <Link href="/signup" className="inline-flex items-center justify-center rounded-xl border border-[color:rgba(31,41,55,.08)] bg-white/70 px-5 py-3 text-sm font-semibold transition hover:bg-white">
              ابدأ مجاناً
            </Link>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
            <Badge>بدون كرت ائتمان</Badge>
            <Badge>تصدير عالي الدقة</Badge>
            <Badge>API & SSO</Badge>
          </div>
          <div className="mt-4 text-xs opacity-80">
            خفّض وقت الإخراج حتى <strong>×10</strong> ووفّر تكلفة التصوير حتى <strong>−70%</strong>.
          </div>
        </div>

        <div id="demo" className="relative">
          <HeroStudio />
          {!prefersReducedMotion && (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -inset-3 -z-10 rounded-3xl opacity-70 blur-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ duration: 0.6 }}
              style={{ background: "conic-gradient(from 0deg, var(--lav), var(--sky), var(--peach), var(--mint), var(--lav))" }}
            />
          )}
        </div>
      </div>

      {/* hint to scroll */}
      <div className="mt-8 grid place-items-center">
        <div className="flex items-center gap-2 text-xs opacity-70">
          <span>فيه أشياء مهمّة تحت</span>
          <span aria-hidden>↓</span>
        </div>
      </div>
    </section>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[color:rgba(31,41,55,.08)] bg-white/70 px-3 py-1">
      {children}
    </span>
  );
}

/* ----------------------------- Hero: Studio UI ---------------------------- */
function HeroStudio() {
  const [before, setBefore] = useState<string | null>(null);
  const [after, setAfter] = useState<string | null>(null);
  const [pos, setPos] = useState(58); // reveal % for after image
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  // handle tap-to-swap on mobile
  const onTapSwap = () => {
    if (!isMobile) return;
    setPos((p) => (p > 50 ? 0 : 100));
  };

  // simple enhancement simulation: we reuse same image but brighten/contrast on the after side
  const AfterLayer = () => (
    <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }} aria-hidden>
      <ImageOrIllustration src={after ?? before} enhanced />
    </div>
  );

  return (
    <div className="relative mx-auto w-[min(92vw,40rem)] rounded-3xl border border-[color:rgba(31,41,55,.08)] bg-white p-4 shadow-sm" onClick={onTapSwap}>
      <DropUpload onChange={(fileUrl) => { setBefore(fileUrl); setAfter(fileUrl); }} />

      <div className="relative mt-3 aspect-[16/10] w-full overflow-hidden rounded-2xl bg-[linear-gradient(120deg,var(--butter),white)]">
        {/* before */}
        <ImageOrIllustration src={before} />
        {/* after clipped */}
        <AfterLayer />

        {/* slider handle */}
        <motion.button
          type="button"
          aria-label="حرّك للمقارنة"
          className="absolute top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-[color:rgba(31,41,55,.12)] bg-white text-sm font-bold shadow-md"
          style={{ right: `${100 - pos}%`, transform: "translate(50%,-50%)" }}
          initial={false}
          animate={prefersReducedMotion ? { scale: 1 } : { scale: [1, 1.06, 1] }}
          transition={{ duration: 1.8, repeat: prefersReducedMotion ? 0 : Infinity }}
        >
          ↔
        </motion.button>

        <input
          aria-label="Reveal after"
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          className="absolute inset-x-4 bottom-3 z-20 h-1 cursor-ew-resize appearance-none rounded-full bg-[color:rgba(31,41,55,.08)] [accent-color:var(--lav)]"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] opacity-80">
        <span className="rounded-full bg-[var(--mint)]/60 px-2 py-0.5">Tap بالموبايل للتبديل</span>
        <span className="rounded-full bg-[var(--peach)]/60 px-2 py-0.5">أو اسحب السلايدر</span>
      </div>
    </div>
  );
}

function ImageOrIllustration({ src, enhanced = false }: { src: string | null | undefined; enhanced?: boolean }) {
  if (!src) {
    return (
      <svg viewBox="0 0 800 500" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="ph" x1="0" x2="1">
            <stop offset="0%" stopColor="#C8B6FF" />
            <stop offset="100%" stopColor="#BFE6FF" />
          </linearGradient>
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2"/>
            <feColorMatrix type="saturate" values="0.1"/>
            <feBlend mode="multiply" in2="SourceGraphic"/>
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="url(#ph)" />
        <g opacity=".9" filter="url(#grain)">
          <rect x="160" y="120" width="480" height="260" rx="24" fill="white" />
          <rect x="210" y="165" width="380" height="14" rx="7" fill="#E5E7EB" />
          <rect x="210" y="195" width="320" height="10" rx="5" fill="#E5E7EB" />
          <rect x="210" y="300" width="220" height="10" rx="5" fill="#E5E7EB" />
        </g>
      </svg>
    );
  }
  return (
    <img
      src={src}
      alt="معاينة المنتج"
      className={`absolute inset-0 h-full w-full object-cover ${enhanced ? "contrast-[1.2] brightness-[1.1] saturate-[1.05]" : "blur-[.2px]"}`}
      draggable={false}
    />
  );
}

function DropUpload({ onChange }: { onChange: (dataUrl: string) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const onPick = () => inputRef.current?.click();

  const onFile = async (f: File) => {
    if (!f || !f.type.startsWith("image/")) return;
    setBusy(true);
    const reader = new FileReader();
    reader.onload = () => {
      setBusy(false);
      onChange(String(reader.result));
    };
    reader.readAsDataURL(f);
  };

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="inline-flex items-center gap-2 rounded-xl border border-[color:rgba(31,41,55,.08)] bg-white px-3 py-2 text-xs">
        <button onClick={onPick} className="rounded-lg bg-[var(--butter)] px-3 py-1 font-semibold shadow-sm transition hover:brightness-105">
          ارفع صورة
        </button>
        <span className="opacity-70">أو اختر عينة ↓</span>
        <SamplePicker onSelect={onChange} />
      </div>
      <div className="text-[11px] opacity-70">ينبّهك بنبضة لطيفة عند الاكتمال</div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
      <AnimatePresence>
        {busy && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
            className="rounded-full bg-[var(--mint)] px-3 py-1 text-[11px] font-semibold"
            aria-live="polite"
          >
            جاري المعالجة…
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SamplePicker({ onSelect }: { onSelect: (url: string) => void }) {
  // three SVG samples rendered to data URLs lazily
  const samples = useMemo(() => [sampleSVG(1), sampleSVG(2), sampleSVG(3)], []);
  return (
    <div className="flex items-center gap-1">
      {samples.map((s, i) => (
        <button
          key={i}
          onClick={() => onSelect(s)}
          aria-label={`اختر عينة ${i + 1}`}
          title="اختر عينة"
          className="h-8 w-8 overflow-hidden rounded-lg border border-[color:rgba(31,41,55,.08)] bg-white"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s} alt="" className="h-full w-full object-cover" />
        </button>
      ))}
    </div>
  );
}

function sampleSVG(i: number) {
  const bg = ["#FFF4C2", "#FFDCCB", "#CFF6E4"][i - 1] ?? "#BFE6FF";
  const accent = ["#C8B6FF", "#BFE6FF", "#FFDCCB"][i - 1] ?? "#C8B6FF";
  const svg = `
  <svg xmlns='http://www.w3.org/2000/svg' width='240' height='160'>
    <defs>
      <linearGradient id='g' x1='0' x2='1'>
        <stop offset='0%' stop-color='${bg}' />
        <stop offset='100%' stop-color='white' />
      </linearGradient>
    </defs>
    <rect width='100%' height='100%' fill='url(#g)'/>
    <rect x='24' y='28' width='192' height='104' rx='16' fill='${accent}'/>
    <circle cx='70' cy='80' r='28' fill='#fff' opacity='.8'/>
    <rect x='110' y='60' width='80' height='12' rx='6' fill='#fff' opacity='.9'/>
    <rect x='110' y='82' width='64' height='10' rx='5' fill='#fff' opacity='.7'/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function useIsMobile() {
  const [m, setM] = useState(false);
  useEffect(() => {
    const q = window.matchMedia("(max-width: 640px)");
    const update = () => setM(q.matches);
    update();
    q.addEventListener("change", update);
    return () => q.removeEventListener("change", update);
  }, []);
  return m;
}

/* ------------------------------ Visual Proof ------------------------------ */
function TrustBar() {
  const prefersReducedMotion = useReducedMotion();
  const metrics = [
    { k: "×10", t: "سرعة الإخراج" },
    { k: "−70%", t: "تكلفة أقل" },
    { k: "100k+", t: "SKUs معالجة" },
  ];
  const logos = ["Shopify", "Woo", "BigCommerce", "Bynder", "Akeneo", "S3"];
  return (
    <section className="mx-auto mt-8 max-w-7xl px-4 sm:px-6">
      <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-[color:rgba(31,41,55,.08)] bg-white p-3 sm:flex-row">
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          {logos.map((l) => (
            <span key={l} className="rounded-full bg-[var(--mint)]/60 px-2 py-0.5" title="Integration">
              {l}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-4">
          {metrics.map((m) => (
            <motion.div
              key={m.t}
              className="rounded-xl bg-white px-3 py-2 text-center shadow-sm"
              initial={false}
              animate={prefersReducedMotion ? { scale: 1 } : { scale: [1, 1.04, 1] }}
              transition={{ duration: 0.6, repeat: prefersReducedMotion ? 0 : Infinity }}
            >
              <div className="text-sm font-extrabold">{m.k}</div>
              <div className="text-[11px] opacity-70">{m.t}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ How It Works ------------------------------ */
function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h2 className="mb-4 text-2xl font-extrabold">كيف يشتغل؟</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { t: "ارفع المنتج", d: "صور المنتج أو ملفات FLAT/Packshot", c: "#FFF4C2" },
          { t: "اختر موديل/ستايل", d: "قوالب موديل وتوزيع إضاءة متسق", c: "#CFF6E4" },
          { t: "جاهز للنشر", d: "مخرجات متسقة لكل القنوات", c: "#FFDCCB" },
        ].map((card, i) => (
          <ComicPanel key={i} {...card} index={i} />
        ))}
      </div>
    </section>
  );
}

function ComicPanel({ t, d, c, index }: { t: string; d: string; c: string; index: number }) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      className="group relative overflow-hidden rounded-2xl border border-[color:rgba(31,41,55,.08)] bg-white p-4 shadow-sm"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.45, delay: index * 0.05 }}
    >
      <div className="aspect-[4/3] w-full overflow-hidden rounded-xl" style={{ background: c }}>
        <MiniGif index={index} />
      </div>
      <div className="mt-3">
        <div className="text-base font-bold">{t}</div>
        <div className="text-sm opacity-80">{d}</div>
      </div>
    </motion.div>
  );
}

function MiniGif({ index }: { index: number }) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <div className="relative h-full w-full">
      <motion.div
        aria-hidden
        className="absolute inset-6 rounded-xl bg-white/60"
        initial={false}
        animate={prefersReducedMotion ? { opacity: 1 } : { opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 0.9, repeat: prefersReducedMotion ? 0 : Infinity }}
      />
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-16 w-24 -translate-x-1/2 -translate-y-1/2 rounded-lg"
        style={{ background: "linear-gradient(135deg, var(--lav), var(--sky))" }}
        initial={{ rotate: 0 }}
        animate={prefersReducedMotion ? { rotate: 0 } : { rotate: [0, 6, 0] }}
        transition={{ duration: 0.7, repeat: prefersReducedMotion ? 0 : Infinity }}
      />
    </div>
  );
}

/* ------------------------------- ROI Dial -------------------------------- */
function ROICalculator() {
  const [skus, setSkus] = useState(250);
  const [mins, setMins] = useState(25);
  const [cost, setCost] = useState(20);

  const traditional = useMemo(() => {
    const minutes = skus * mins;
    const costTotal = skus * cost;
    return { minutes, costTotal };
  }, [skus, mins, cost]);

  const ai = useMemo(() => {
    const seconds = skus * 3; // 3s per try-on
    const minutes = Math.ceil(seconds / 60) + 5; // overhead
    const costPerSku = Math.max(1, Math.round(cost * 0.3));
    const costTotal = skus * costPerSku;
    return { minutes, costTotal };
  }, [skus, cost]);

  const timeSave = Math.max(0, (traditional.minutes - ai.minutes) / traditional.minutes);
  const costSave = Math.max(0, (traditional.costTotal - ai.costTotal) / traditional.costTotal);
  const avgSave = Math.round(((timeSave + costSave) / 2) * 100);

  return (
    <section id="roi" className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid items-center gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-[color:rgba(31,41,55,.08)] bg-white p-5 shadow-sm">
          <h3 className="text-lg font-extrabold">حاسبة ROI</h3>
          <div className="mt-4 grid gap-4">
            <Slider label="عدد المنتجات" value={skus} min={10} max={5000} step={10} onChange={setSkus} />
            <Slider label="وقت التصوير (دقيقة/منتج)" value={mins} min={2} max={60} step={1} onChange={setMins} />
            <Slider label="تكلفة التصوير (للمنتج)" value={cost} min={5} max={200} step={1} onChange={setCost} prefix="$" />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 text-center text-sm">
            <div className="rounded-xl bg-[var(--butter)]/60 p-3">
              <div className="text-xs opacity-70">تقليدي</div>
              <div className="font-bold">{traditional.minutes.toLocaleString()} د</div>
              <div className="font-bold">${traditional.costTotal.toLocaleString()}</div>
            </div>
            <div className="rounded-xl bg-[var(--mint)]/60 p-3">
              <div className="text-xs opacity-70">AI Studio</div>
              <div className="font-bold">{ai.minutes.toLocaleString()} د</div>
              <div className="font-bold">${ai.costTotal.toLocaleString()}</div>
            </div>
          </div>
        </div>
        <div className="grid place-items-center">
          <Gauge percent={avgSave} />
          <div className="mt-3 text-center text-sm">
            توفير متوسّط <strong>{avgSave}%</strong> (وقت + تكلفة)
          </div>
        </div>
      </div>
    </section>
  );
}

function Slider({ label, value, min, max, step, onChange, prefix }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; prefix?: string; }) {
  return (
    <label className="grid gap-1 text-sm">
      <div className="flex items-center justify-between">
        <span>{label}</span>
        <span className="tabular-nums font-semibold">{prefix ?? ""}{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full appearance-none rounded-full bg-[color:rgba(31,41,55,.08)] [accent-color:var(--lav)]"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
      />
    </label>
  );
}

function Gauge({ percent }: { percent: number }) {
  const p = Math.max(0, Math.min(100, percent));
  const r = 120; // radius
  const c = Math.PI * r; // half circle length (we'll render 180deg)
  const dash = (p / 100) * c;
  return (
    <svg viewBox="0 0 300 180" className="w-[min(92vw,28rem)]">
      <defs>
        <linearGradient id="gg" x1="0" x2="1">
          <stop offset="0%" stopColor="#CFF6E4" />
          <stop offset="100%" stopColor="#C8B6FF" />
        </linearGradient>
      </defs>
      <g transform="translate(150,160)">
        <path d={arcPath(r)} fill="none" stroke="#E5E7EB" strokeWidth={18} strokeLinecap="round" />
        <path d={arcPath(r)} fill="none" stroke="url(#gg)" strokeDasharray={`${dash} ${c}`} strokeWidth={18} strokeLinecap="round" />
        <text x="0" y="-20" textAnchor="middle" className="fill-[var(--ink)] text-3xl font-extrabold">{p}%</text>
        <text x="0" y="0" textAnchor="middle" className="fill-[var(--ink)] text-sm opacity-70">توفير</text>
      </g>
    </svg>
  );
}

function arcPath(r: number) {
  // semicircle from left to right
  const start = `${-r},0`;
  const end = `${r},0`;
  return `M ${start} A ${r} ${r} 0 0 1 ${end}`;
}

/* ------------------------------ Use Cases Tabs ---------------------------- */
function UseCases() {
  const tabs = [
    { k: "Retail", c: "var(--butter)", benefits: ["تنميط الإضاءة", "موديلات ثابتة", "تخفيض المرتجعات"] },
    { k: "Marketplaces", c: "var(--sky)", benefits: ["مطابقة متطلبات القنوات", "قصّ تلقائي", "مقاسات متّسقة"] },
    { k: "Agencies", c: "var(--lav)", benefits: ["تعاون الفريق", "قوالب علامة", "تسليم بالجملة"] },
    { k: "SMB", c: "var(--mint)", benefits: ["سهولة البدء", "تكلفة منخفضة", "نتائج سريعة"] },
  ] as const;
  const [active, setActive] = useState(0);
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-3 text-2xl font-extrabold">Use Cases</div>
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((t, i) => (
          <button
            key={t.k}
            onClick={() => setActive(i)}
            className={`rounded-full border px-3 py-1 text-sm font-semibold ${active === i ? "bg-white border-[color:rgba(31,41,55,.18)]" : "bg-white/60 border-[color:rgba(31,41,55,.08)] hover:bg-white"}`}
            style={{ backgroundColor: active === i ? "#fff" : "rgba(255,255,255,0.7)" }}
            aria-pressed={active === i}
          >
            {t.k}
          </button>
        ))}
      </div>
      <div className="mt-4 grid items-center gap-6 md:grid-cols-2">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-[color:rgba(31,41,55,.08)]" style={{ background: `linear-gradient(120deg, ${tabs[active].c}, white)` }}>
          <BeforeAfterMini />
        </div>
        <ul className="grid gap-2 text-sm">
          <li className="opacity-70">وش يفيدك فعلاً:</li>
          {tabs[active].benefits.map((b) => (
            <li key={b} className="flex items-center gap-2">
              <span aria-hidden>✔</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function BeforeAfterMini() {
  const [p, setP] = useState(60);
  return (
    <div className="relative h-full w-full">
      <svg viewBox="0 0 800 500" className="absolute inset-0 h-full w-full">
        <rect width="100%" height="100%" fill="#fff" />
        <rect x="140" y="100" width="520" height="300" rx="20" fill="#E5E7EB" />
      </svg>
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - p}% 0 0)` }}>
        <svg viewBox="0 0 800 500" className="absolute inset-0 h-full w-full">
          <rect width="100%" height="100%" fill="#fff" />
          <rect x="140" y="100" width="520" height="300" rx="20" fill="#C8B6FF" />
          <circle cx="560" cy="140" r="10" fill="#FFDCCB" />
        </svg>
      </div>
      <input aria-label="Reveal" type="range" min={0} max={100} value={p} onChange={(e) => setP(Number(e.target.value))} className="absolute inset-x-4 bottom-3 z-20 h-1 appearance-none rounded-full bg-[color:rgba(31,41,55,.08)] [accent-color:var(--lav)]" />
    </div>
  );
}

/* ---------------------------- Features (Stickers) ------------------------- */
function FeaturesGrid() {
  const items = [
    { t: "Try‑On", e: "🧍‍♀️", snap: "Model: Studio • Light: Soft" },
    { t: "Model Swap", e: "🔁", snap: "Swap: 3 Models" },
    { t: "Fabric‑Preserve", e: "🧵", snap: "Detail: Keep Weave" },
    { t: "Short Videos", e: "🎞️", snap: "Motion: 3–5s" },
    { t: "API", e: "🔌", snap: "Bulk: /v1/batch" },
    { t: "PIM/DAM", e: "🧰", snap: "Akeneo • Bynder" },
    { t: "SSO", e: "🔐", snap: "Okta • Azure AD" },
    { t: "Webhooks", e: "📣", snap: "Delivery: S3+CDN" },
  ];
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h3 className="mb-4 text-2xl font-extrabold">مميزات كأنها ملصقات مخبرية</h3>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {items.map((it) => (
          <div key={it.t} className="group relative overflow-hidden rounded-2xl border border-[color:rgba(31,41,55,.08)] bg-white p-4 shadow-sm transition hover:shadow-md">
            <div className="text-3xl" aria-hidden>{it.e}</div>
            <div className="mt-2 text-sm font-bold">{it.t}</div>
            <div className="text-xs opacity-70">حلول واقعية بدون جلسات تصوير</div>
            <div className="pointer-events-none absolute inset-x-3 bottom-3 hidden rounded-xl border border-dashed border-[color:rgba(31,41,55,.18)] bg-[var(--mint)]/40 px-2 py-1 text-[11px] text-[var(--ink)] shadow-sm group-hover:block">
              Setting Snapshot: {it.snap}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* --------------------------------- Pricing -------------------------------- */
function Pricing() {
  const plans = [
    { name: "Starter", price: "$0", tag: "🚀", perks: ["100 صورة/شهر", "علامة مائية خفيفة", "تصدير Web"], bg: "var(--butter)" },
    { name: "Team", price: "$199", tag: "🎯", perks: ["2k صورة/شهر", "بلا علامة", "API/SSO"], bg: "var(--lav)" },
    { name: "Enterprise", price: "تواصل", tag: "🏢", perks: ["غير محدود", "SLA & SSO", "أمن متقدم"], bg: "var(--mint)" },
  ];
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h3 className="mb-3 text-2xl font-extrabold">Pricing — Sticker Book</h3>
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((p) => (
          <div key={p.name} className="relative overflow-hidden rounded-3xl border border-[color:rgba(31,41,55,.08)] bg-white shadow-sm">
            <div className="p-5" style={{ background: `linear-gradient(120deg, ${p.bg}, white)` }}>
              <div className="text-3xl" aria-hidden>{p.tag}</div>
              <div className="mt-1 text-lg font-bold">{p.name}</div>
              <div className="text-2xl font-extrabold">{p.price}</div>
            </div>
            <ul className="grid gap-2 p-5 text-sm">
              {p.perks.map((k) => (
                <li key={k} className="flex items-center gap-2"><span aria-hidden>✔</span>{k}</li>
              ))}
            </ul>
            <div className="px-5 pb-5">
              <Link href="/contact" className="inline-flex items-center justify-center rounded-xl border border-[color:rgba(31,41,55,.18)] bg-white px-4 py-2 text-sm font-bold hover:bg-[var(--mint)]/40">اطلب خطة شركتك</Link>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-2xl border border-[color:rgba(31,41,55,.08)] bg-white p-4 text-sm">
        ما الذي تدفعه فعلاً؟ — التصوير التقليدي: معدات + استوديو + أشخاص + وقت. الذكاء الاصطناعي: اشتراك + دقائق معالجة.
      </div>
    </section>
  );
}

/* ------------------------- Integrations & Security ------------------------- */
function IntegrationsSecurity() {
  const ints = ["Shopify", "Woo", "BigCommerce", "Klaviyo", "GA4", "Bynder", "Akeneo", "S3"];
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-[color:rgba(31,41,55,.08)] bg-white p-5 shadow-sm">
          <h4 className="text-lg font-extrabold">Integrations</h4>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            {ints.map((i) => (
              <span key={i} className="rounded-full border border-[color:rgba(31,41,55,.12)] bg-white px-3 py-1" title="كيف يندمج معنا؟">
                {i}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-[color:rgba(31,41,55,.08)] bg-white p-5 shadow-sm">
          <h4 className="text-lg font-extrabold">الأمان والخصوصية</h4>
          <ul className="mt-3 grid gap-2 text-sm">
            <li>🔒 بياناتك مُشفّرة أثناء النقل والتخزين.</li>
            <li>🛡️ عزل حسابات صارم وصلاحيات دقيقة (RBAC).</li>
            <li>🧹 حذف عند الطلب واحتفاظ محدود.</li>
            <li>📜 سجلات تدقيق واكتشاف شذوذ.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------- FAQ ---------------------------------- */
function FAQ() {
  const items = [
    { q: "هل يحتاج تدريب مخصص؟", a: "لا. ارفع صورك وابدأ — قوالب جاهزة وموديلات متعددة.", k: "🧵" },
    { q: "ما دقة الصور المخرجة؟", a: "حتى 4K+ للقنوات الرئيسية، مع قصّ وتظبيط تلقائي.", k: "🧩" },
    { q: "هل يدعم دفعات كبيرة؟", a: "نعم. معالجة جماعية + API + Webhooks للتسليم.", k: "📦" },
    { q: "ماذا عن حقوق الخصوصية؟", a: "الصور تُستخدم فقط للمعالجة ثم تُحذف حسب سياسة الحساب.", k: "🔐" },
  ];
  return (
    <section id="faq" className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h3 className="mb-4 text-2xl font-extrabold">أسئلة شائعة</h3>
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((it, i) => (
          <details key={i} className="group rounded-2xl border border-[color:rgba(31,41,55,.08)] bg-white p-4 open:shadow-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold">
              <span className="flex items-center gap-2"><span aria-hidden>{it.k}</span>{it.q}</span>
              <span className="text-base" aria-hidden>＋</span>
            </summary>
            <div className="mt-3 grid gap-2 text-sm">
              <div className="min-h-20 rounded-xl bg-[var(--sky)]/40 p-3 text-[11px] opacity-80">Mini‑Demo GIF Placeholder</div>
              <p>{it.a}</p>
              <a href="#demo" className="text-sm font-semibold underline underline-offset-4">شاهد العينة</a>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

/* --------------------------------- Final CTA ------------------------------- */
function FinalCTA() {
  return (
    <section className="mx-auto mb-24 max-w-7xl px-4 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl border border-[color:rgba(31,41,55,.08)] bg-white p-6">
        <div className="grid items-center gap-6 md:grid-cols-[1.2fr_.8fr]">
          <div>
            <div className="text-2xl font-extrabold">جاهز تبدأ التجربة الآن؟</div>
            <p className="mt-2 text-sm opacity-80">بدون كرت ائتمان. ارفع صورة وجرب Try‑On مباشرة.</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Link href="/signup" className="rounded-2xl bg-[var(--peach)] px-5 py-3 text-sm font-bold text-[var(--ink)] shadow-[0_10px_24px_rgba(255,220,203,.45)] transition hover:brightness-110">ابدأ التجربة الآن</Link>
              <Link href="/quality-guide.pdf" className="rounded-2xl border border-[color:rgba(31,41,55,.18)] bg-white px-5 py-3 text-sm font-bold">حمّل دليل الجودة</Link>
            </div>
          </div>
          <div className="relative h-48 w-full">
            <HandArt />
          </div>
        </div>
      </div>
    </section>
  );
}

function HandArt() {
  return (
    <svg viewBox="0 0 400 220" className="absolute inset-0 h-full w-full">
      <defs>
        <linearGradient id="skin" x1="0" x2="1">
          <stop offset="0%" stopColor="#FFDCCB" />
          <stop offset="100%" stopColor="#FFF4C2" />
        </linearGradient>
      </defs>
      <path d="M30 140 C 90 130, 120 120, 180 140 C 220 155, 240 160, 280 150 C 300 145, 320 150, 330 165 C 340 180, 330 195, 315 195 L 60 195 Z" fill="url(#skin)" stroke="#E5E7EB" />
      <circle cx="310" cy="170" r="14" fill="#C8B6FF" />
      <rect x="290" y="150" width="80" height="32" rx="16" fill="#CFF6E4" />
    </svg>
  );
}

/* ------------------------------ Mobile CTA bar ----------------------------- */
function MobileStickyCTA() {
  return (
    <div className="sm:hidden">
      <Link
        href="/signup"
        className="fixed inset-x-4 bottom-4 z-50 flex items-center justify-center rounded-2xl bg-[var(--lav)] px-5 py-3 text-sm font-bold text-[var(--ink)] shadow-xl transition hover:brightness-110"
        aria-label="جرّب الآن"
      >
        جرّب الآن
      </Link>
    </div>
  );
}

/* --------------------------------- Helpers -------------------------------- */
function GlobalStyles() {
  return (
    <style jsx global>{`
      :root{
        --bg:#FCFCFF; --ink:#1F2937; --lav:#C8B6FF; --sky:#BFE6FF; --mint:#CFF6E4; --peach:#FFDCCB; --butter:#FFF4C2;
      }
      html{ color-scheme: only light; }
      body{ font-family: Cairo, "IBM Plex Sans Arabic", Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji"; }
      /* accessible focus */
      :focus-visible{ outline: 2px solid var(--lav); outline-offset: 2px; }
    `}</style>
  );
}
