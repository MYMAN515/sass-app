'use client'

import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

/**
 * MintLemon AI — Full-width, responsive landing
 * - <img> only (no Next/Image)
 * - Removed all "Book a demo / Talk to sales" buttons
 * - Removed mobile sticky CTA
 * - Containers are FULL WIDTH (no max-w center)
 * - Header links are visible on mobile (scrollable row)
 */

export const metadata = {
  title: 'MintLemon AI — Product Enhance & Virtual Try-On for Teams',
  description:
    'B2B AI pipelines for product photo enhancement and virtual try-on. Secure and scalable workflows.',
  openGraph: {
    title: 'MintLemon AI — Enhance & Try-On',
    description:
      'B2B AI pipelines for product photo enhancement and virtual try-on.',
    type: 'website',
  },
}

const ease = [0.22, 1, 0.36, 1]

export default function Page() {
  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-[#F3FFF8] via-[#FFFCE8] to-white text-zinc-900">
      <BackgroundAuras />
      <Header />
      <Hero />
      <LogosStrip />
      <HowItWorks />
      <ProductDemo />
      <FAQ />
      {/* Sticky CTA removed as requested */}
    </main>
  )
}



/* --------------------------- UI — HERO --------------------------- */
function Hero() {
  const rm = useReducedMotion()
  return (
    <section className="relative w-full px-4 sm:px-6 md:px-10 xl:px-16 pb-10 pt-12 sm:pt-16 md:pb-16 md:pt-24">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <motion.div
          initial={rm ? { opacity: 1 } : { opacity: 0, y: 18 }}
          animate={rm ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
        >
          <motion.h1
            className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
            initial={rm ? { opacity: 1 } : { opacity: 0, y: 10 }}
            animate={rm ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.05 }}
          >
            AI Enhance & Virtual Try-On — built for teams
          </motion.h1>

          <p className="mt-4 max-w-[70ch] text-lg text-zinc-700">
            Premium product images in seconds. Clean backgrounds, upscale, and place garments on studio-ready models — with audit logs and SSO.
          </p>
          <p className="mt-1 text-zinc-600">
            منصّة للفرق: تعزيز الصور وتجربة الملابس افتراضياً مع خصوصية عالية وتكامل مؤسسي.
          </p>

          {/* No hero buttons per request */}

          <motion.div
            className="mt-6 flex flex-wrap items-center gap-3 text-sm text-zinc-700"
            initial={rm ? {} : { opacity: 0 }}
            whileInView={rm ? {} : { opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
          >
            <Chip icon={<ShieldIcon />}>SSO & SOC-style controls</Chip>
            <Chip icon={<LockIcon />}>Encrypted at rest</Chip>
            <Chip icon={<ZapIcon />}>Optimized inference</Chip>
          </motion.div>
        </motion.div>

        <motion.div
          className="relative"
          initial={rm ? { opacity: 1 } : { opacity: 0, scale: 0.98 }}
          animate={rm ? { opacity: 1 } : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease, delay: 0.05 }}
        >
          <HeroDemos />
          {!rm && (
            <>
              <motion.div
                className="absolute -right-4 -top-4 rounded-2xl border border-zinc-200 bg-white/80 px-3 py-2 text-xs shadow-sm"
                initial={{ y: 0 }}
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
              >
                4× Upscale
              </motion.div>
              <motion.div
                className="absolute -left-4 bottom-6 rounded-2xl border border-zinc-200 bg-white/80 px-3 py-2 text-xs shadow-sm"
                initial={{ y: 0 }}
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
              >
                Background Clean
              </motion.div>
            </>
          )}
        </motion.div>
      </div>
    </section>
  )
}

function HeroDemos() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <DemoCard title="Enhance" subtitle="Before / After">
        <BeforeAfter
          beforeUrl="https://images.unsplash.com/photo-1516762689617-e1cffcef479d?q=80&w=1200&auto=format&fit=crop"
          afterUrl="https://images.unsplash.com/photo-1585386959984-a41552231608?q=80&w=1200&auto=format&fit=crop"
        />
      </DemoCard>

      <DemoCard title="Try-On" subtitle="Garment → Model">
        <TryOnMock />
      </DemoCard>
    </div>
  )
}

/* ----------------------- UI — LOGOS STRIP ------------------------ */
function LogosStrip() {
  return (
    <section className="w-full px-4 sm:px-6 md:px-10 xl:px-16 py-10">
      <div className="rounded-3xl border border-zinc-200 bg-white/70 p-5 text-zinc-500 shadow-sm">
        <p className="mb-4 text-center text-xs uppercase tracking-wider">Trusted by product teams</p>
        <div className="grid grid-cols-2 place-items-center gap-6 sm:grid-cols-3 md:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="h-7 w-24 rounded-md bg-zinc-100"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05, ease }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------ UI — HOW IT WORKS ---------------------- */
function HowItWorks() {
  const steps = [
    { title: 'Upload', desc: 'Drop a product photo or a garment + choose Enhance or Try-On.' },
    { title: 'Tune', desc: 'Pick style strength, background, and output size.' },
    { title: 'Export', desc: 'Download web-ready images or push to your store.' },
  ]

  return (
    <section id="how" className="w-full px-4 sm:px-6 md:px-10 xl:px-16 py-12 md:py-16">
      <motion.h2
        id="features"
        className="text-center text-2xl font-semibold tracking-tight md:text-3xl"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease }}
      >
        How it works
      </motion.h2>
      <p className="mx-auto mt-2 max-w-[70ch] text-center text-zinc-600">
        ثلاث خطوات بسيطة لنتائج احترافية.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {steps.map((it, idx) => (
          <motion.div
            key={it.title}
            className="rounded-2xl border border-zinc-200 bg-white/70 p-5 shadow-sm"
            initial={{ opacity: 0, y: 16, rotate: -0.3 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.55, delay: idx * 0.07, ease }}
          >
            <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#CFFAE2] to-[#FFF0A6] font-semibold text-zinc-900">
              {idx + 1}
            </div>
            <div className="text-lg font-medium">{it.title}</div>
            <p className="mt-1 text-sm text-zinc-600">{it.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

/* ------------------------- UI — PRODUCT DEMO --------------------- */
function ProductDemo() {
  return (
    <section id="demo" className="w-full px-4 sm:px-6 md:px-10 xl:px-16 py-12 md:py-16">
      <div className="grid gap-6 md:grid-cols-2">
        <DemoCard title="Product Enhance" subtitle="Before / After slider">
          <BeforeAfter
            beforeUrl="/demo-before.jpg"
            afterUrl="/demo-after.jpg"
          />
        </DemoCard>
        <DemoCard title="Try-On" subtitle="Place garment on model">
          <TryOnMock />
        </DemoCard>
      </div>
    </section>
  )
}

/* ------------------------------ UI — FAQ ------------------------- */
function FAQ() {
  const qa = [
    { q: 'Do you store my images?', a: 'You control retention. Choose 0–30 days or instant purge. Enterprise can bring its own storage (S3, GCS, Azure).' },
    { q: 'Can I use my own models?', a: 'Yes. Fine-tune private Try-On mannequins and enhancement styles on Pro+.' },
    { q: 'Is there an API?', a: 'Absolutely. REST & webhooks for bulk jobs and store pipelines.' },
  ]

  return (
    <section id="faq" className="w-full px-4 sm:px-6 md:px-10 xl:px-16 py-12 md:py-16">
      <motion.h2
        className="text-center text-3xl font-semibold tracking-tight"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease }}
      >
        FAQ
      </motion.h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {qa.map((item, idx) => (
          <motion.div
            key={item.q}
            className="rounded-2xl border border-zinc-200 bg-white/70 p-5 shadow-sm"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.06, ease }}
          >
            <div className="text-base font-semibold">{item.q}</div>
            <p className="mt-1 text-sm text-zinc-600">{item.a}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

/* -------------------------- REUSABLE PIECES ---------------------- */
function DemoCard({ title, subtitle, children }) {
  return (
    <motion.div
      className="rounded-3xl border border-zinc-200 bg-white/70 p-4 shadow-sm md:p-5"
      initial={{ opacity: 0, y: 14, scale: 0.99 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease }}
    >
      <div className="mb-3 flex items-end justify-between">
        <div>
          <div className="text-base font-semibold">{title}</div>
          <div className="text-xs text-zinc-500">{subtitle}</div>
        </div>
        <span className="inline-flex h-8 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-[#CFFAE2] to-[#FFF0A6] text-xs font-medium text-zinc-900"/>
      </div>
      {children}
    </motion.div>
  )
}

function BeforeAfter({ beforeUrl, afterUrl }) {
  const [pos, setPos] = useState(55)
  return (
    <div className="relative h-56 w-full overflow-hidden rounded-2xl md:h-64">
      <img src={beforeUrl} alt="before" className="absolute inset-0 h-full w-full object-cover" />
      <img
        src={afterUrl}
        alt="after"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 left-[var(--pos,%)] my-2 w-[2px] rounded bg-white/80 shadow"
        style={{ left: `${pos}%` }}
      />
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
  )
}

function TryOnMock() {
  const [tab, setTab] = useState('before')
  return (
    <div>
      <div className="relative h-56 w-full overflow-hidden rounded-2xl border border-zinc-100 bg-zinc-50 md:h-64">
        <img
          src="https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1200&auto=format&fit=crop"
          alt="model"
          className="absolute inset-0 h-full w-full object-cover transition-opacity"
          style={{ opacity: tab === 'before' ? 1 : 0 }}
        />
        <img
          src="https://images.unsplash.com/photo-1548883354-51e87a8514d4?q=80&w=1200&auto=format&fit=crop"
          alt="model with garment"
          className="absolute inset-0 h-full w-full object-cover transition-opacity"
          style={{ opacity: tab === 'after' ? 1 : 0 }}
        />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => setTab('before')}
          className={`rounded-xl border px-3 py-1.5 text-sm ${tab === 'before' ? 'border-zinc-900 bg-white' : 'border-zinc-200 bg-white/70'}`}
        >
          Before
        </button>
        <button
          onClick={() => setTab('after')}
          className={`rounded-xl border px-3 py-1.5 text-sm ${tab === 'after' ? 'border-zinc-900 bg-white' : 'border-zinc-200 bg-white/70'}`}
        >
          Try-On
        </button>
      </div>
    </div>
  )
}

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
      <span className="whitespace-nowrap">{children}</span>
    </motion.div>
  )
}

function BackgroundAuras() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-20 -left-16 h-72 w-72 rounded-full bg-[#D8FFEA] blur-3xl" />
      <div className="absolute top-24 -right-16 h-72 w-72 rounded-full bg-[#FFF7B3] blur-3xl" />
      <div className="absolute bottom-10 left-1/3 h-56 w-56 rounded-full bg-[#E8FFF4] blur-3xl" />
    </div>
  )
}

/* ------------------------------ ICONS ---------------------------- */
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
