// components/HeroSection.jsx
'use client'

import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

/**
 * HeroSection — v3 (from scratch)
 * - Ultra-clean fintech vibes (Tabby/Tamara inspired) with richer aurora gradients
 * - No stock models. Preview is abstract/synthetic
 * - <img> only (no Next/Image)
 * - Fully responsive, mobile-first
 * - Framer Motion for tasteful micro-interactions
 *
 * Optional font tip (use in your layout):
 *   import { Geist, Geist_Mono } from 'next/font/google'
 *   export const geistSans = Geist({ subsets: ['latin'] })
 *   <body className={`${geistSans.className}`}>...</body>
 */

const ease = [0.22, 1, 0.36, 1]

export default function HeroSection() {
  return (
    <section className="relative isolate w-full overflow-hidden bg-gradient-to-b from-[#F3FFF8] via-[#FFFCE8] to-white">
      <AuroraFX />
      <Header />
      <HeroCore />
      <HeroFooterChips />
    </section>
  )
}

/* -------------------------------- HEADER ------------------------------- */
function Header() {
  return (
    <header className="relative z-20 w-full px-4 sm:px-6 md:px-10 xl:px-16 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-[#CFFAE2] to-[#FFF0A6] shadow-sm">
            <span className="text-[10px] font-black tracking-widest text-zinc-900">AI</span>
          </div>
          <div className="text-xl font-bold tracking-tight text-zinc-900">Studio</div>
        </div>
        <nav className="flex gap-2 overflow-x-auto text-sm text-zinc-800">
          <a href="#tryon" className="rounded-lg px-3 py-1.5 hover:bg-white/70">Try‑On</a>
          <a href="#enhance" className="rounded-lg px-3 py-1.5 hover:bg-white/70">Enhance</a>
          <a href="#pricing" className="rounded-lg px-3 py-1.5 hover:bg-white/70">Pricing</a>
          <a href="#docs" className="rounded-lg px-3 py-1.5 hover:bg-white/70">Docs</a>
        </nav>
      </div>
    </header>
  )
}

/* ------------------------------- HERO CORE ------------------------------ */
function HeroCore() {
  const rm = useReducedMotion()
  return (
    <div className="relative z-10 w-full px-4 sm:px-6 md:px-10 xl:px-16 pb-12 pt-10 sm:pt-16 md:pb-16 md:pt-24">
      <div className="grid items-center gap-10 md:grid-cols-2">
        {/* LEFT copy */}
        <div>
          <motion.div
            initial={rm ? { opacity: 1 } : { opacity: 0, y: 16 }}
            animate={rm ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
          >
            <NewBadge />
            <h1 className="mt-3 text-balance text-4xl font-black leading-[1.05] tracking-tight text-zinc-900 sm:text-5xl md:text-6xl">
              <span className="bg-gradient-to-r from-emerald-600 via-lime-500 to-amber-500 bg-clip-text text-transparent">Instant AI Try‑On</span>{' '}
              — no stock models
            </h1>
            <p className="mt-4 max-w-[75ch] text-lg text-zinc-700">
              Upload a garment, describe the model you want, and get a photo‑real result in seconds.
              Zero stock libraries, full control, enterprise‑ready.
            </p>
            <p className="mt-1 text-[15px] text-zinc-600">
              جرّب الذكاء الاصطناعي لتوليد موديل واقعي 100% حسب وصفك — بدون أي مودلز جاهزين.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="#start"
                className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-lime-400 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.99]"
              >
                Start free
                <svg className="size-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
              </a>
              <a
                href="#demo"
                className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white/70 px-4 py-2.5 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-white"
              >
                Live demo
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </a>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-zinc-700">
              <Chip icon={<ShieldIcon />}>SSO & policy controls</Chip>
              <Chip icon={<LockIcon />}>Encrypted at rest</Chip>
              <Chip icon={<ZapIcon />}>4× Upscale</Chip>
            </div>
          </motion.div>
        </div>

        {/* RIGHT preview */}
        <motion.div
          className="relative"
          initial={rm ? { opacity: 1 } : { opacity: 0, scale: 0.98 }}
          animate={rm ? { opacity: 1 } : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease, delay: 0.05 }}
        >
          <PreviewCard />
        </motion.div>
      </div>
    </div>
  )
}

function NewBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
      <span className="inline-grid size-4 place-items-center rounded-full bg-emerald-600 text-white">★</span>
      New: AI model builder (no stock models)
    </div>
  )
}

/* ------------------------------- PREVIEW ------------------------------- */
function PreviewCard() {
  const rm = useReducedMotion()
  const [tone, setTone] = useState('Medium')
  const [bg, setBg] = useState('Clean studio')

  const toneFill = {
    Porcelain: '#F2E7DB',
    Light: '#EDD8C7',
    Medium: '#D9B69A',
    Olive: '#C99E7F',
    Tan: '#B88163',
    Deep: '#8D563A',
  }[tone]

  const bgGrad = {
    'Clean studio': ['#F3FFF8', '#FFFFFF'],
    'Editorial beige': ['#F6EEE2', '#FFF7EA'],
    'Streetwear concrete': ['#F3F3F3', '#E8E8E8'],
    'Lifestyle home': ['#F3FFF8', '#FFFCE8'],
    'Desert tones': ['#FCE9CC', '#FFF3D1'],
  }[bg]

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white/70 p-4 shadow-sm md:p-5">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <div className="text-base font-semibold text-zinc-900">Synthetic preview</div>
          <div className="text-xs text-zinc-500">Abstract mannequin — result depends on your spec</div>
        </div>
        <span className="inline-flex h-8 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-[#CFFAE2] to-[#FFF0A6] text-xs font-medium text-zinc-900" />
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-zinc-100">
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${bgGrad[0]}, ${bgGrad[1]})` }} />
        {/* aurora ring */}
        {!rm && (
          <motion.div
            className="pointer-events-none absolute -left-24 -top-24 size-64 rounded-full opacity-60 blur-2xl"
            style={{ background: 'conic-gradient(from 90deg, #9AE6B4, #FDE68A, #60A5FA, #9AE6B4)' }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
          />
        )}

        {/* mannequin */}
        <div className="relative z-10 grid h-72 place-items-center md:h-[26rem]">
          <svg viewBox="0 0 220 360" className="h-[78%] w-auto drop-shadow-sm">
            <defs>
              <filter id="sblur"><feGaussianBlur stdDeviation="0.4" /></filter>
              <linearGradient id="garment" x1="0" x2="1"><stop offset="0%" stopColor="#86EFAC" /><stop offset="100%" stopColor="#FDE68A" /></linearGradient>
            </defs>
            <g fill={toneFill} filter="url(#sblur)">
              <circle cx="110" cy="48" r="26" />
              <rect x="92" y="74" width="36" height="70" rx="18" />
              <rect x="62" y="140" width="96" height="96" rx="24" />
              <rect x="70" y="236" width="24" height="74" rx="12" />
              <rect x="126" y="236" width="24" height="74" rx="12" />
            </g>
            {/* garment placeholder */}
            <path d="M75 145 h70 v55 q0 12 -12 12 h-46 q-12 0 -12 -12 z" fill="url(#garment)" opacity=".9" />
          </svg>
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between p-3">
          <span className="rounded-lg bg-white/85 px-2 py-1 text-[10px] font-semibold text-zinc-900">No stock models</span>
          <span className="rounded-lg bg-white/85 px-2 py-1 text-[10px] font-semibold text-zinc-900">{bg}</span>
        </div>
      </div>

      {/* mini controls */}
      <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
        <MiniSelect label="Tone" value={tone} onChange={setTone} options={["Porcelain","Light","Medium","Olive","Tan","Deep"]} />
        <MiniSelect label="Background" value={bg} onChange={setBg} options={["Clean studio","Editorial beige","Streetwear concrete","Lifestyle home","Desert tones"]} />
        <div className="hidden md:block" />
      </div>
    </div>
  )
}

function MiniSelect({ label, value, options, onChange }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white/70 px-2 py-1.5 text-xs">
      <span className="min-w-16 text-zinc-600">{label}</span>
      <div className="flex flex-wrap gap-1">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`rounded-lg px-2 py-1 ${o === value ? 'bg-white text-zinc-900 shadow-sm' : 'bg-white/50 text-zinc-600 hover:bg-white'}`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  )
}

/* -------------------------- FOOTER CHIPS -------------------------- */
function HeroFooterChips() {
  return (
    <div className="relative z-10 w-full px-4 sm:px-6 md:px-10 xl:px-16 pb-10">
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        <BadgeCard title="Enhance" desc="Background clean, lighting fix, 4× upscale" />
        <BadgeCard title="Try‑On" desc="Describe a model; get a photo‑real result" />
        <BadgeCard title="Enterprise" desc="SSO, audit logs, BYO storage" />
      </div>
    </div>
  )
}

function BadgeCard({ title, desc }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white/70 p-4 shadow-sm">
      <div className="mb-1 flex items-center gap-2">
        <span className="inline-grid size-6 place-items-center rounded-md bg-gradient-to-br from-[#CFFAE2] to-[#FFF0A6] text-[12px] font-bold text-zinc-900">✓</span>
        <div className="text-sm font-semibold text-zinc-900">{title}</div>
      </div>
      <p className="text-xs text-zinc-600">{desc}</p>
    </div>
  )
}

/* ------------------------------ AURORA FX ------------------------------ */
function AuroraFX() {
  const rm = useReducedMotion()
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* soft base auras */}
      <div className="absolute -top-32 -left-20 h-80 w-80 rounded-full bg-[#D8FFEA] blur-3xl" />
      <div className="absolute top-24 -right-24 h-80 w-80 rounded-full bg-[#FFF7B3] blur-3xl" />
      <div className="absolute bottom-10 left-1/3 h-64 w-64 rounded-full bg-[#E8FFF4] blur-3xl" />

      {/* animated aurora ribbons */}
      {!rm && (
        <>
          <motion.div
            className="absolute left-1/2 top-[-120px] h-[520px] w-[520px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
            style={{ background: 'radial-gradient(closest-side, #9AE6B4 0%, transparent 70%)' }}
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute right-[-160px] top-[20%] h-[460px] w-[460px] rounded-full opacity-35 blur-3xl"
            style={{ background: 'radial-gradient(closest-side, #FDE68A 0%, transparent 70%)' }}
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute left-[-120px] bottom-[8%] h-[460px] w-[460px] rounded-full opacity-30 blur-3xl"
            style={{ background: 'radial-gradient(closest-side, #BFDBFE 0%, transparent 70%)' }}
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      )}
    </div>
  )
}

/* ------------------------------ REUSABLE ------------------------------ */
function Chip({ icon, children }) {
  return (
    <motion.div
      className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-3 py-1 shadow-sm"
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease }}
    >
      {icon}
      <span className="whitespace-nowrap text-sm text-zinc-800">{children}</span>
    </motion.div>
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}
function ZapIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h7l-1 8 11-12h-7l1-8z" />
    </svg>
  )
}
function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}
