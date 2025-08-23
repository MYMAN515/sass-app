// components/HeroSection.jsx
'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * HeroSection — Enhance + Try-On (single section)
 * - English only
 * - WebP assets (no Next/Image)
 * - Heavy animations (Framer Motion) but respects reduced motion
 * - Mobile-first responsive
 * - No stock models (Try-On preview is synthetic/abstract)
 *
 * Expected local assets (all .webp):
 * /ba/perfume-before.webp  /ba/perfume-after.webp
 * (You can swap with your own WebP pairs.)
 */

const ease = [0.22, 1, 0.36, 1];

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative isolate w-full overflow-hidden bg-gradient-to-b from-[#F3FFF8] via-[#FFFCE8] to-white text-zinc-900"
    >
      <AuroraFX />
      <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-10 sm:px-6 sm:pt-14 md:px-10 md:pb-16 md:pt-20 xl:px-16">
        <TopBadge />
        <ContentTwoCol />
        <FeatureChips />
      </div>
    </section>
  );
}

/* --------------------------- Subcomponents --------------------------- */

function TopBadge() {
  return (
    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
      <span className="inline-grid size-4 place-items-center rounded-full bg-emerald-600 text-white">★</span>
      New: Enhance + AI Try-On
    </div>
  );
}

function ContentTwoCol() {
  const rm = useReducedMotion();
  return (
    <div className="grid items-center gap-10 md:grid-cols-2">
      {/* LEFT: copy + CTAs */}
      <motion.div
        initial={rm ? { opacity: 1 } : { opacity: 0, y: 16 }}
        animate={rm ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease }}
      >
        <h1 className="text-balance text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
          <span className="bg-gradient-to-r from-emerald-600 via-lime-500 to-amber-500 bg-clip-text text-transparent">
            Make products irresistible
          </span>
        </h1>
        <p className="mt-4 max-w-[72ch] text-lg text-zinc-700">
          Two services — <strong>Enhance</strong> for studio-perfect product shots,
          and <strong>AI Try-On</strong> that generates a photo-real model per request.
          No stock libraries. Privacy-first. Enterprise-ready.
        </p>
        <p className="mt-1 text-[15px] text-zinc-600">
          Upload, describe, export. Background clean, color balance, 4× upscaling, and fully controllable model specs.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a
            href="#enhance"
            className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-lime-400 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.99]"
          >
            Get started
            <svg
              className="size-4 transition-transform group-hover:translate-x-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="M12 5l7 7-7 7" />
            </svg>
          </a>
          <a
            href="#tryon"
            className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white/70 px-4 py-2.5 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-white"
          >
            Live demo
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </a>
        </div>
      </motion.div>

      {/* RIGHT: dual demos (Enhance + Try-On) */}
      <MotionCard delay={0.05}>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <div className="text-base font-semibold">Dual services</div>
            <div className="text-xs text-zinc-500">Enhance + AI Try-On (synthetic preview)</div>
          </div>
          <span className="inline-flex h-8 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-[#CFFAE2] to-[#FFF0A6] text-xs font-medium text-zinc-900" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Enhance: Before/After slider */}
          <DemoCard title="Enhance" subtitle="Before / After slider">
            <BeforeAfter
              beforeUrl="/ba/perfume-before.webp"
              afterUrl="/ba/perfume-after.webp"
            />
          </DemoCard>

          {/* Try-On: abstract synthetic mannequin (no stock models) */}
          <DemoCard title="Try-On" subtitle="AI-generated model (no stock)">
            <TryOnMini />
          </DemoCard>
        </div>
      </MotionCard>
    </div>
  );
}

function FeatureChips() {
  const rm = useReducedMotion();
  return (
    <motion.div
      className="mt-6 flex flex-wrap items-center gap-3 text-sm text-zinc-700"
      initial={rm ? {} : { opacity: 0 }}
      whileInView={rm ? {} : { opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease }}
    >
      <Chip icon={<ShieldIcon />}>SSO & policy controls</Chip>
      <Chip icon={<LockIcon />}>Encrypted at rest</Chip>
      <Chip icon={<ZapIcon />}>4× Upscale</Chip>
    </motion.div>
  );
}

/* ------------------------------ Cards ------------------------------ */

function MotionCard({ children, delay = 0 }) {
  const rm = useReducedMotion();
  return (
    <motion.div
      className="relative rounded-3xl border border-zinc-200 bg-white/70 p-4 shadow-sm md:p-5"
      initial={rm ? { opacity: 1 } : { opacity: 0, scale: 0.98 }}
      animate={rm ? { opacity: 1 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease, delay }}
    >
      {!rm && (
        <motion.div
          className="pointer-events-none absolute -right-3 -top-3 rounded-2xl border border-zinc-200 bg-white/80 px-3 py-2 text-xs shadow-sm"
          initial={{ y: 0 }}
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
        >
          Live
        </motion.div>
      )}
      {children}
    </motion.div>
  );
}

function DemoCard({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white/70 p-4 shadow-sm">
      <div className="mb-2">
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-zinc-500">{subtitle}</div>
      </div>
      {children}
    </div>
  );
}

/* ----------------------- Enhance: Before/After ---------------------- */

function BeforeAfter({ beforeUrl, afterUrl }) {
  const [pos, setPos] = useState(55);
  return (
    <div className="relative h-56 w-full overflow-hidden rounded-2xl md:h-64">
      <img src={beforeUrl} alt="before" className="absolute inset-0 h-full w-full object-cover" />
      <img
        src={afterUrl}
        alt="after"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      />
      {/* divider */}
      <div
        className="pointer-events-none absolute inset-y-0 my-2 w-[2px] rounded bg-white/80 shadow"
        style={{ left: `${pos}%` }}
      />
      {/* slider */}
      <input
        aria-label="Reveal enhanced image"
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(parseInt(e.target.value))}
        className="absolute bottom-3 left-1/2 w-[92%] -translate-x-1/2 cursor-pointer appearance-none rounded-full bg-white/80 p-1 shadow [accent-color:#86EFAC]"
      />
    </div>
  );
}

/* ------------------------ Try-On: Synthetic Mini ----------------------- */

function TryOnMini() {
  const rm = useReducedMotion();
  const [tone, setTone] = useState('Medium');
  const [bg, setBg] = useState('Clean studio');

  const toneFill = {
    Porcelain: '#F2E7DB',
    Light: '#EDD8C7',
    Medium: '#D9B69A',
    Olive: '#C99E7F',
    Tan: '#B88163',
    Deep: '#8D563A',
  }[tone];

  const bgGrad = {
    'Clean studio': ['#F3FFF8', '#FFFFFF'],
    'Editorial beige': ['#F6EEE2', '#FFF7EA'],
    'Streetwear concrete': ['#F3F3F3', '#E8E8E8'],
    'Lifestyle home': ['#F3FFF8', '#FFFCE8'],
    'Desert tones': ['#FCE9CC', '#FFF3D1'],
  }[bg];

  return (
    <div className="rounded-xl border border-zinc-200 bg-white/70 p-3">
      <div className="relative overflow-hidden rounded-2xl border border-zinc-100">
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(180deg, ${bgGrad[0]}, ${bgGrad[1]})` }}
        />
        {/* animated aurora ring */}
        {!rm && (
          <motion.div
            className="pointer-events-none absolute -left-20 -top-20 size-56 rounded-full opacity-60 blur-2xl"
            style={{
              background:
                'conic-gradient(from 90deg, #9AE6B4, #FDE68A, #60A5FA, #9AE6B4)',
            }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 18, ease: 'linear' }}
          />
        )}

        {/* abstract mannequin */}
        <div className="relative z-10 grid h-56 place-items-center md:h-60">
          <svg viewBox="0 0 220 360" className="h-[78%] w-auto drop-shadow-sm">
            <defs>
              <filter id="sblur">
                <feGaussianBlur stdDeviation="0.4" />
              </filter>
              <linearGradient id="garment" x1="0" x2="1">
                <stop offset="0%" stopColor="#86EFAC" />
                <stop offset="100%" stopColor="#FDE68A" />
              </linearGradient>
            </defs>
            <g fill={toneFill} filter="url(#sblur)">
              <circle cx="110" cy="48" r="26" />
              <rect x="92" y="74" width="36" height="70" rx="18" />
              <rect x="62" y="140" width="96" height="96" rx="24" />
              <rect x="70" y="236" width="24" height="74" rx="12" />
              <rect x="126" y="236" width="24" height="74" rx="12" />
            </g>
            {/* garment placeholder */}
            <path
              d="M75 145 h70 v55 q0 12 -12 12 h-46 q-12 0 -12 -12 z"
              fill="url(#garment)"
              opacity=".9"
            />
          </svg>
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between p-2">
          <span className="rounded-lg bg-white/85 px-2 py-1 text-[10px] font-semibold text-zinc-900">
            No stock models
          </span>
          <span className="rounded-lg bg-white/85 px-2 py-1 text-[10px] font-semibold text-zinc-900">
            {bg}
          </span>
        </div>
      </div>

      {/* tiny controls */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <MiniSelect
          label="Tone"
          value={tone}
          onChange={setTone}
          options={['Porcelain', 'Light', 'Medium', 'Olive', 'Tan', 'Deep']}
        />
        <MiniSelect
          label="Background"
          value={bg}
          onChange={setBg}
          options={[
            'Clean studio',
            'Editorial beige',
            'Streetwear concrete',
            'Lifestyle home',
            'Desert tones',
          ]}
        />
      </div>
    </div>
  );
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
            className={`rounded-lg px-2 py-1 ${
              o === value
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'bg-white/50 text-zinc-600 hover:bg-white'
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ FX + UI ------------------------------ */

function Chip({ icon, children }) {
  const rm = useReducedMotion();
  return (
    <motion.div
      className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-3 py-1 shadow-sm"
      initial={rm ? { opacity: 1 } : { opacity: 0, y: 8 }}
      whileInView={rm ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease }}
    >
      {icon}
      <span className="whitespace-nowrap text-sm text-zinc-800">{children}</span>
    </motion.div>
  );
}

function AuroraFX() {
  const rm = useReducedMotion();
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* soft base auras */}
      <div className="absolute -top-32 -left-20 h-80 w-80 rounded-full bg-[#D8FFEA] blur-3xl" />
      <div className="absolute top-24 -right-24 h-80 w-80 rounded-full bg-[#FFF7B3] blur-3xl" />
      <div className="absolute bottom-10 left-1/3 h-64 w-64 rounded-full bg-[#E8FFF4] blur-3xl" />
      {/* animated ribbons */}
      {!rm && (
        <>
          <motion.div
            className="absolute left-1/2 top-[-120px] h-[520px] w-[520px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
            style={{
              background: 'radial-gradient(closest-side, #9AE6B4 0%, transparent 70%)',
            }}
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute right-[-160px] top-[20%] h-[460px] w-[460px] rounded-full opacity-35 blur-3xl"
            style={{
              background: 'radial-gradient(closest-side, #FDE68A 0%, transparent 70%)',
            }}
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute left-[-120px] bottom-[8%] h-[460px] w-[460px] rounded-full opacity-30 blur-3xl"
            style={{
              background: 'radial-gradient(closest-side, #BFDBFE 0%, transparent 70%)',
            }}
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      )}
    </div>
  );
}

/* ------------------------------ Icons ------------------------------ */

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function ZapIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M13 2L3 14h7l-1 8 11-12h-7l1-8z" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
