// /app/pricing/page.jsx
'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

/**
 * Pricing — MintLemon (full-width, responsive)
 * - No API/Webhooks claims (clearly marked)
 * - Credit-based plans you can actually sell now
 * - Annual toggle (20% OFF) + "Most popular" highlight
 * - Feature comparison + credit usage breakdown + FAQs
 * - Pure <img> (no Next/Image)
 */

export const metadata = {
  title: 'Pricing — MintLemon AI',
  description:
    'Simple, credit-based plans for AI enhancement & virtual try-on. Shared models. No API/webhooks.',
  openGraph: {
    title: 'MintLemon AI Pricing',
    description: 'Credit-based plans for teams. Shared models. No API/webhooks.',
    type: 'website',
  },
};

const ease = [0.22, 1, 0.36, 1];

export default function PricingPage() {
  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-[#F3FFF8] via-[#FFFCE8] to-white text-zinc-900">
      <BackgroundAuras />

      <TopHero />
      <NoApiNotice />

      <Plans />
      <CreditExplainer />
      <FeatureMatrix />
      <FAQ />
    </main>
  );
}

/* ---------------------------- HERO ---------------------------- */
function TopHero() {
  return (
    <section className="w-full px-4 sm:px-6 md:px-10 xl:px-16 pt-12 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className="flex flex-col items-start gap-3"
      >
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Pricing that scales with your catalog
        </h1>
        <p className="max-w-[70ch] text-zinc-700">
          Credit-based plans for AI enhancement and virtual try-on using high-quality shared models.
          No engineering required — upload, tune, export.
        </p>
      </motion.div>
    </section>
  );
}

/* ------------------------ NO API NOTICE ----------------------- */
function NoApiNotice() {
  return (
    <section className="w-full px-4 sm:px-6 md:px-10 xl:px-16 pb-4">
      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 text-amber-900 px-4 py-3 text-sm shadow-sm">
        <div className="flex items-start gap-2">
          <InfoIcon className="mt-0.5 h-4 w-4" />
          <span>
            Uses <strong>shared models</strong>. <strong>No API or webhooks</strong> at this time — all workflows run inside the web app.
          </span>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------- PLANS --------------------------- */
const RAW_PLANS = [
  {
    name: 'Starter',
    monthly: 19,
    credits: 200,
    blurb: 'For small shoots & trials',
    features: [
      'Enhance & background clean',
      'Basic Try-On (shared models)',
      'Batch up to 10 images',
      'Standard queue',
      '7-day storage',
      'Email support',
    ],
    badge: null,
    sku: 'starter',
  },
  {
    name: 'Pro',
    monthly: 69,
    credits: 1200,
    blurb: 'For growing catalogs',
    features: [
      'Everything in Starter',
      '4× Upscaler included',
      'Try-On: standard & studio looks',
      'Batch up to 50 images',
      'Priority queue',
      '30-day storage',
    ],
    badge: 'Most popular',
    highlight: true,
    sku: 'pro',
  },
  {
    name: 'Team',
    monthly: 149,
    credits: 3000,
    blurb: 'For content teams',
    features: [
      'Everything in Pro',
      '3 seats included',
      'Brand presets (BG & crops)',
      'Batch up to 150 images',
      '60-day storage',
      'Priority email support',
    ],
    badge: null,
    sku: 'team',
  },
];

function Plans() {
  const [annual, setAnnual] = useState(false);
  const multiplier = annual ? 12 * 0.8 : 1; // 20% off yearly
  const priceLabel = annual ? 'year' : 'month';

  const plans = useMemo(
    () =>
      RAW_PLANS.map((p) => ({
        ...p,
        price: Math.round(p.monthly * multiplier),
      })),
    [multiplier]
  );

  return (
    <section className="w-full px-4 sm:px-6 md:px-10 xl:px-16 py-8">
      {/* Toggle */}
      <div className="mb-5 flex items-center gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-2 py-1 shadow-sm">
          <button
            onClick={() => setAnnual(false)}
            className={`rounded-full px-3 py-1 text-sm ${!annual ? 'bg-zinc-900 text-white' : 'text-zinc-700 hover:bg-zinc-100'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`rounded-full px-3 py-1 text-sm ${annual ? 'bg-zinc-900 text-white' : 'text-zinc-700 hover:bg-zinc-100'}`}
          >
            Yearly
          </button>
        </div>
        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
          Save 20% on yearly
        </span>
      </div>

      {/* Cards */}
      <div className="grid gap-5 md:grid-cols-3">
        {plans.map((t, idx) => (
          <motion.div
            key={t.name}
            className={[
              'relative rounded-3xl border p-6 shadow-sm',
              t.highlight ? 'border-zinc-900 bg-white' : 'border-zinc-200 bg-white/70',
            ].join(' ')}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.06, ease }}
          >
            {t.badge && (
              <div className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-[#CFFAE2] to-[#FFF0A6] px-3 py-1 text-xs font-medium text-zinc-900 shadow-sm">
                {t.badge}
              </div>
            )}
            <div className="text-lg font-semibold">{t.name}</div>
            <div className="mt-1 flex items-end gap-1">
              <div className="text-3xl font-bold">${t.price}</div>
              <div className="text-sm text-zinc-500">/ {priceLabel}</div>
            </div>
            <div className="mt-1 text-sm text-zinc-600">{t.credits.toLocaleString()} credits / {priceLabel}</div>
            <ul className="mt-4 space-y-2 text-sm text-zinc-700">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <CheckIcon className="mt-0.5 h-4 w-4 text-emerald-600" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <a
              href={`/checkout?plan=${t.sku}&interval=${annual ? 'year' : 'month'}`}
              className={[
                'mt-6 inline-flex w-full items-center justify-center rounded-2xl px-4 py-2 font-medium',
                t.highlight ? 'bg-zinc-900 text-white hover:bg-zinc-800' : 'bg-gradient-to-r from-[#CFFAE2] to-[#FFF0A6] text-zinc-900 hover:shadow-md',
              ].join(' ')}
            >
              Get started
            </a>
            <p className="mt-2 text-xs text-zinc-500">Cancel anytime. VAT may apply.</p>
          </motion.div>
        ))}
      </div>

      {/* Top-ups */}
      <div className="mt-6">
        <div className="text-sm font-semibold text-zinc-900">Need more credits?</div>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <TopUpCard credits={500} price={29} sku="topup-500" />
          <TopUpCard credits={2500} price={129} sku="topup-2500" />
        </div>
      </div>
    </section>
  );
}

function TopUpCard({ credits, price, sku }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white/70 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-sm text-zinc-700">
          <span className="font-semibold">{credits.toLocaleString()} credits</span>
          <span className="text-zinc-500"> — one-time</span>
        </div>
        <a
          href={`/checkout?sku=${sku}`}
          className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Buy ${price}
        </a>
      </div>
    </div>
  );
}

/* ---------------------- CREDIT EXPLAINER ----------------------- */
function CreditExplainer() {
  const items = [
    { title: 'Enhance (cleanup, tone, crop)', cost: '1 credit / image' },
    { title: '4× Upscale', cost: '+1 credit / image' },
    { title: 'Virtual Try-On (shared models)', cost: '3 credits / output' },
    { title: 'Exports (JPG/PNG, web-ready)', cost: 'Included' },
    { title: 'Storage', cost: 'Based on plan' },
  ];
  return (
    <section className="w-full px-4 sm:px-6 md:px-10 xl:px-16 pt-4 pb-8">
      <div className="rounded-3xl border border-zinc-200 bg-white/70 p-5 shadow-sm">
        <div className="mb-3 text-lg font-semibold">How credits work</div>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {items.map((it, i) => (
            <div key={it.title} className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-3">
              <div className="text-sm text-zinc-800">{it.title}</div>
              <div className="text-xs font-medium text-zinc-600">{it.cost}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-zinc-500">
          Credits reset at the start of each billing cycle. Unused credits do not roll over.
        </p>
      </div>
    </section>
  );
}

/* ----------------------- FEATURE MATRIX ------------------------ */
function FeatureMatrix() {
  const rows = [
    { label: 'Enhance & background clean', s: true, p: true, t: true },
    { label: '4× Upscaler', s: false, p: true, t: true },
    { label: 'Virtual Try-On (shared models)', s: true, p: true, t: true },
    { label: 'Brand presets (BG & crops)', s: false, p: false, t: true },
    { label: 'Batch size limit', s: '10', p: '50', t: '150' },
    { label: 'Storage retention', s: '7 days', p: '30 days', t: '60 days' },
    { label: 'Seats included', s: '1', p: '1', t: '3' },
    { label: 'Priority queue', s: false, p: true, t: true },
    { label: 'Support', s: 'Email', p: 'Email', t: 'Priority email' },
    { label: 'Private models / fine-tunes', s: false, p: false, t: false },
    { label: 'API / Webhooks', s: false, p: false, t: false },
  ];
  return (
    <section className="w-full px-4 sm:px-6 md:px-10 xl:px-16 py-8">
      <div className="rounded-3xl border border-zinc-200 bg-white/70 p-5 shadow-sm">
        <div className="mb-4 text-lg font-semibold">Compare plans</div>
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-sm">
            <thead className="text-left text-zinc-600">
              <tr>
                <th className="py-2 pr-4">Feature</th>
                <th className="py-2 pr-4">Starter</th>
                <th className="py-2 pr-4">Pro</th>
                <th className="py-2">Team</th>
              </tr>
            </thead>
            <tbody className="text-zinc-800">
              {rows.map((r, idx) => (
                <tr key={r.label} className="border-t border-zinc-200/70">
                  <td className="py-3 pr-4">{r.label}</td>
                  <td className="py-3 pr-4">{renderCell(r.s)}</td>
                  <td className="py-3 pr-4">{renderCell(r.p)}</td>
                  <td className="py-3">{renderCell(r.t)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-zinc-500">
          All plans run on shared models. Commercial usage allowed for outputs you generate.
        </p>
      </div>
    </section>
  );
}

function renderCell(v) {
  if (v === true) return <CheckIcon className="h-4 w-4 text-emerald-600" />;
  if (v === false) return <MinusIcon className="h-4 w-4 text-zinc-400" />;
  return <span className="text-zinc-700">{v}</span>;
}

/* ------------------------------ FAQ ---------------------------- */
function FAQ() {
  const qa = [
    {
      q: 'Can I use this commercially?',
      a: 'Yes. You own the outputs you generate and can use them for your store, ads, and socials.',
    },
    {
      q: 'Do you store my images?',
      a: 'You control retention based on your plan. You can also delete jobs anytime from History.',
    },
    {
      q: 'Do you provide an API?',
      a: 'Not right now. All workflows run inside the web app. If you need automation, we recommend using batches from the dashboard.',
    },
    {
      q: 'What happens if I run out of credits?',
      a: 'You can purchase one-time top-ups anytime. Your plan credits will refresh at the next cycle.',
    },
    {
      q: 'Refunds?',
      a: 'If you experience a billing issue or defective outputs, contact support and we’ll make it right.',
    },
  ];

  return (
    <section className="w-full px-4 sm:px-6 md:px-10 xl:px-16 py-12 md:py-16">
      <motion.h2
        className="text-center text-3xl font-semibold tracking-tight"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease }}
      >
        FAQ
      </motion.h2>
      <div className="mx-auto mt-6 grid gap-4 md:grid-cols-2">
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
            <p className="mt-1 text-sm text-zinc-700">{item.a}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* -------------------------- DECORATION ------------------------- */
function BackgroundAuras() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-20 -left-16 h-72 w-72 rounded-full bg-[#D8FFEA] blur-3xl" />
      <div className="absolute top-24 -right-16 h-72 w-72 rounded-full bg-[#FFF7B3] blur-3xl" />
      <div className="absolute bottom-10 left-1/3 h-56 w-56 rounded-full bg-[#E8FFF4] blur-3xl" />
    </div>
  );
}

/* ----------------------------- ICONS --------------------------- */
function CheckIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
function MinusIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
    </svg>
  );
}
function InfoIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}
