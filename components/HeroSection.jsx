'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

/**
 * MintLemon AI — Fintech‑style B2B SaaS Landing Page
 * Next.js (App Router) + TailwindCSS + Framer Motion
 *
 * Drop this file into: /app/page.jsx
 * Make sure Tailwind is set up and framer-motion is installed.
 *
 * Palette: mint (#D8FFEA / #CFFAE2) & lemon (#FFF7B3 / #FFF0A6)
 * Typeface: system UI (Inter recommended)
 */

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const float = {
  initial: { y: 0 },
  animate: { y: [0, -6, 0], transition: { repeat: Infinity, duration: 5 } },
}

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#F3FFF8] via-[#FFFCE8] to-white text-zinc-900">
      <BackgroundAuras />
      <Header />
      <Hero />
      <LogosStrip />
      <HowItWorks />
      <ProductDemo />
      <Pricing />
      <FAQ />
      <Footer />
      <MobileStickyCTA />
    </main>
  )
}

/* -------------------------- UI — HEADER -------------------------- */
function Header() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:py-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#B9F7D6] to-[#FFF39C] shadow-sm" />
          <span className="font-semibold tracking-tight">MintLemon AI</span>
        </div>
        <nav className="hidden items-center gap-6 text-sm text-zinc-700 md:flex">
          <a href="#features" className="hover:text-zinc-900">Features</a>
          <a href="#how" className="hover:text-zinc-900">How it works</a>
          <a href="#pricing" className="hover:text-zinc-900">Pricing</a>
          <a href="#faq" className="hover:text-zinc-900">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <button className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100">Log in</button>
          <a href="#pricing" className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800">Start free</a>
        </div>
      </div>
    </header>
  )
}

/* --------------------------- UI — HERO --------------------------- */
function Hero() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 pb-8 pt-12 sm:pt-16 md:pb-16 md:pt-24">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <motion.div {...fadeUp}>
          <motion.h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Enhance & Try‑On for Product Photos
          </motion.h1>
          <p className="mt-4 max-w-xl text-lg text-zinc-700">
            Make your product images look premium with AI enhancements, or place garments on studio‑ready models — in seconds.
          </p>
          <p className="mt-1 text-zinc-500">تعزيز الصور وتجربة الملابس افتراضياً بذكاء فائق وبسهولة.</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#demo" className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#CFFAE2] to-[#FFF0A6] px-5 py-3 font-medium text-zinc-900 shadow-sm transition hover:shadow-md">
              Try Enhance
              <svg className="h-4 w-4 transition group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </a>
            <a href="#demo" className="inline-flex items-center gap-2 rounded-2xl border border-zinc-300 bg-white px-5 py-3 font-medium shadow-sm transition hover:bg-zinc-50">
              Try Try‑On
            </a>
          </div>

          <div className="mt-6 flex items-center gap-4 text-sm text-zinc-600">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-3 py-1 shadow-sm">
              <ShieldIcon />
              <span>Secure & Private</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-3 py-1 shadow-sm">
              <ZapIcon />
              <span>Fast results</span>
            </div>
          </div>
        </motion.div>

        <motion.div className="relative" variants={float} initial="initial" animate="animate">
          <HeroDemos />
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

      <DemoCard title="Try‑On" subtitle="Garment → Model">
        <TryOnMock />
      </DemoCard>
    </div>
  )
}

/* ----------------------- UI — LOGOS STRIP ------------------------ */
function LogosStrip() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="rounded-3xl border border-zinc-200 bg-white/70 p-5 text-zinc-500 shadow-sm">
        <p className="mb-4 text-center text-xs uppercase tracking-wider">Trusted by product teams</p>
        <div className="grid grid-cols-2 place-items-center gap-6 sm:grid-cols-3 md:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-7 w-24 rounded-md bg-zinc-100" />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------ UI — HOW IT WORKS ---------------------- */
function HowItWorks() {
  const items = [
    {
      title: 'Upload',
      desc: 'Drop a product photo or a garment + choose Enhance or Try‑On.',
    },
    { title: 'Tune', desc: 'Pick style strength, background, and output size.' },
    { title: 'Export', desc: 'Download web‑ready images or push to your store.' },
  ]

  return (
    <section id="how" className="mx-auto max-w-7xl px-4 py-12 md:py-16">
      <motion.h2 {...fadeUp} className="text-center text-2xl font-semibold tracking-tight md:text-3xl">
        How it works
      </motion.h2>
      <p className="mx-auto mt-2 max-w-2xl text-center text-zinc-600">ثلاث خطوات بسيطة لنتائج احترافية.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {items.map((it, idx) => (
          <motion.div
            key={idx}
            className="rounded-2xl border border-zinc-200 bg-white/70 p-5 shadow-sm"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, delay: idx * 0.06 }}
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
    <section id="demo" className="mx-auto max-w-7xl px-4 py-12 md:py-16">
      <div className="grid gap-6 md:grid-cols-2">
        <DemoCard title="Product Enhance" subtitle="Before / After slider">
          <BeforeAfter
            beforeUrl="https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?q=80&w=1200&auto=format&fit=crop"
            afterUrl="https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=1200&auto=format&fit=crop"
          />
        </DemoCard>
        <DemoCard title="Try‑On" subtitle="Place garment on model">
          <TryOnMock />
        </DemoCard>
      </div>
    </section>
  )
}

/* ---------------------------- UI — PRICING ----------------------- */
function Pricing() {
  const tiers = [
    {
      name: 'Starter',
      price: '$19',
      blurb: '100 images / mo',
      features: ['Enhance & background clean', 'Basic Try‑On', 'Email support'],
      cta: 'Start free',
    },
    {
      name: 'Pro',
      price: '$69',
      blurb: '1,000 images / mo',
      features: ['Advanced Enhance (4x upscaler)', 'Pro Try‑On models', 'Priority support', 'API access'],
      cta: 'Go Pro',
      highlight: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      blurb: 'Unlimited seats',
      features: ['SLA & SSO', 'Private models', 'On‑prem or VPC'],
      cta: 'Talk to sales',
    },
  ]

  return (
    <section id="pricing" className="mx-auto max-w-7xl px-4 py-12 md:py-16">
      <motion.h2 {...fadeUp} className="text-center text-3xl font-semibold tracking-tight">Pricing</motion.h2>
      <p className="mx-auto mt-2 max-w-2xl text-center text-zinc-600">Simple plans that scale with your catalog.</p>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {tiers.map((t, idx) => (
          <motion.div
            key={t.name}
            className={[
              'relative rounded-3xl border p-6 shadow-sm',
              t.highlight
                ? 'border-zinc-900 bg-white'
                : 'border-zinc-200 bg-white/70',
            ].join(' ')}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.08 }}
          >
            {t.highlight && (
              <div className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-[#CFFAE2] to-[#FFF0A6] px-3 py-1 text-xs font-medium text-zinc-900 shadow-sm">
                Most popular
              </div>
            )}
            <div className="text-lg font-semibold">{t.name}</div>
            <div className="mt-1 flex items-end gap-1">
              <div className="text-3xl font-bold">{t.price}</div>
              <div className="text-sm text-zinc-500">{t.blurb}</div>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-zinc-700">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <CheckIcon />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <a
              href="#"
              className={[
                'mt-6 inline-flex w-full items-center justify-center rounded-2xl px-4 py-2 font-medium',
                t.highlight
                  ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                  : 'bg-gradient-to-r from-[#CFFAE2] to-[#FFF0A6] text-zinc-900 hover:shadow-md',
              ].join(' ')}
            >
              {t.cta}
            </a>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-zinc-600">
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-3 py-1 shadow-sm">
          <ShieldIcon /> GDPR ready
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-3 py-1 shadow-sm">
          <LockIcon /> Encrypted storage
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-3 py-1 shadow-sm">
          <ZapIcon /> Optimized inference
        </div>
      </div>
    </section>
  )
}

/* ------------------------------ UI — FAQ ------------------------- */
function FAQ() {
  const qa = [
    { q: 'Do you store my images?', a: 'You control retention. Choose 0–30 days or instant purge. Enterprise can bring its own storage (S3, GCS, Azure).' },
    { q: 'Can I use my own models?', a: 'Yes. Fine‑tune private Try‑On mannequins and enhancement styles on Pro+.' },
    { q: 'Is there an API?', a: 'Absolutely. REST & webhooks for bulk jobs and store pipelines.' },
  ]

  return (
    <section id="faq" className="mx-auto max-w-7xl px-4 py-12 md:py-16">
      <motion.h2 {...fadeUp} className="text-center text-3xl font-semibold tracking-tight">FAQ</motion.h2>
      <div className="mx-auto mt-6 grid max-w-4xl gap-4 md:grid-cols-3">
        {qa.map((item, idx) => (
          <motion.div
            key={item.q}
            className="rounded-2xl border border-zinc-200 bg-white/70 p-5 shadow-sm"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.06 }}
          >
            <div className="text-base font-semibold">{item.q}</div>
            <p className="mt-1 text-sm text-zinc-600">{item.a}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

/* ---------------------------- UI — FOOTER ------------------------ */
function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white/70">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-zinc-600 md:flex-row">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#B9F7D6] to-[#FFF39C]" />
          <span>© {new Date().getFullYear()} MintLemon AI</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-zinc-900">Security</a>
          <a href="#" className="hover:text-zinc-900">Privacy</a>
          <a href="#" className="hover:text-zinc-900">Terms</a>
        </div>
      </div>
    </footer>
  )
}

/* -------------------------- REUSABLE PIECES ---------------------- */
function DemoCard({ title, subtitle, children }) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white/70 p-4 shadow-sm md:p-5">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <div className="text-base font-semibold">{title}</div>
          <div className="text-xs text-zinc-500">{subtitle}</div>
        </div>
        <span className="inline-flex h-8 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-[#CFFAE2] to-[#FFF0A6] text-xs font-medium text-zinc-900"/>
      </div>
      {children}
    </div>
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
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: tab === 'before' ? 1 : 0 }}
        />
        <img
          src="https://images.unsplash.com/photo-1548883354-51e87a8514d4?q=80&w=1200&auto=format&fit=crop"
          alt="model with garment"
          className="absolute inset-0 h-full w-full object-cover"
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
          Try‑On
        </button>
      </div>
    </div>
  )
}

function MobileStickyCTA() {
  return (
    <div className="fixed inset-x-0 bottom-3 z-40 mx-auto block w-[92%] rounded-2xl border border-zinc-200 bg-white/90 p-2 shadow-md backdrop-blur md:hidden">
      <div className="flex items-center justify-between gap-2">
        <a href="#demo" className="flex-1 rounded-xl bg-gradient-to-r from-[#CFFAE2] to-[#FFF0A6] px-4 py-2 text-center font-medium text-zinc-900">Enhance</a>
        <a href="#demo" className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-center font-medium">Try‑On</a>
      </div>
    </div>
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
function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}
