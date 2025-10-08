// pages/pricing.jsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, ShieldCheck, Zap, BadgeCheck, ArrowRight,
  HelpCircle, ChevronDown, Check, X, Star,
  Users, Database, Film, Gauge, Globe,
  Sparkles, LineChart, Crown
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Layout from '@/components/Layout';
import Link from 'next/link';

/* =========================
   Currency + Helpers
========================= */

// Simple FX approximations for UI only (not for billing/Stripe)
const CURRENCIES = {
  USD: { label: 'USD $', rate: 1, symbol: '$' },
  AED: { label: 'AED د.إ', rate: 3.67, symbol: 'د.إ' },
  MYR: { label: 'MYR RM', rate: 4.6, symbol: 'RM' },
};

function formatMoney(amountUSD, currency = 'USD') {
  const { rate, symbol } = CURRENCIES[currency] || CURRENCIES.USD;
  const value = amountUSD == null ? null : amountUSD * rate;
  if (value == null) return 'Custom';
  const fixed = value < 1000 ? value.toFixed(0) : Math.round(value).toLocaleString();
  return `${symbol}${fixed}`;
}

/* =========================
   Plans & Pay-as-you-go
========================= */

const BASE_PLANS = [
  {
    key: 'free',
    name: 'Free',
    tagline: 'Start testing in minutes',
    monthlyUSD: 0,
    popular: false,
    icon: '⭐',
    features: [
      '5 credits / month',
      'Basic image enhancement',
      'AI try-on (standard)',
      'Community support',
    ],
    cta: 'Start for Free',
  },
  {
    key: 'starter',
    name: 'Starter',
    tagline: 'For solo creators',
    monthlyUSD: 10,
    popular: false,
    icon: '🌱',
    features: [
      '200 credits / month',
      'Enhancement HD (up to 2k)',
      'Try-on (standard)',
      'Basic queue',
      'Email support',
    ],
    cta: 'Choose Starter',
  },
  {
    key: 'pro',
    name: 'Pro',
    tagline: 'For growing brands',
    monthlyUSD: 20,
    popular: true,
    highlight: 'Best Value',
    icon: '🚀',
    features: [
      'Unlimited* credits',
      'Advanced enhancement (up to 4k)',
      'AI try-on (premium)',
      'Priority rendering',
      'Email support',
      'Batch processing',
      'API access',
    ],
    note: '*Fair use applies',
    cta: 'Upgrade to Pro',
  },
  {
    key: 'business',
    name: 'Business',
    tagline: 'Teams & workflows',
    monthlyUSD: 49,
    popular: false,
    icon: '🏢',
    features: [
      'Unlimited* credits',
      '4k + Upscale 2×/4×',
      'Premium try-on + model swap',
      'Priority+ queue',
      'Team seats included (3)',
      'Brand kit & shared library',
      'API + Webhooks',
    ],
    note: '*Fair use applies',
    cta: 'Choose Business',
  },
  {
    key: 'agency',
    name: 'Agency',
    tagline: 'High-volume & clients',
    monthlyUSD: 99,
    popular: false,
    icon: '👑',
    features: [
      'Unlimited* credits',
      '4k/8k pipelines + Upscale',
      'Short videos from results',
      'Priority Max queue',
      'Client workspaces',
      'SLA response targets',
      'Dedicated manager (email)',
    ],
    note: '*Fair use applies',
    cta: 'Choose Agency',
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    tagline: 'Scale with confidence',
    monthlyUSD: null, // custom
    popular: false,
    icon: '💼',
    features: [
      'Unlimited team seats',
      'Custom models & SLAs',
      'SAML SSO & SOC 2 reports',
      'VPC/On-prem options',
      'Dedicated account manager',
      'Premium 24/7 support',
    ],
    cta: 'Contact Sales',
  },
];

// PAYG credit packs (one-time top-ups)
const PAYG_PACKS = [
  { key: 'p200',  name: 'Starter Pack',    credits: 200,  priceUSD: 9 },
  { key: 'p500',  name: 'Creator Pack',    credits: 500,  priceUSD: 19 },
  { key: 'p1500', name: 'Growth Pack',     credits: 1500, priceUSD: 49 },
  { key: 'p5000', name: 'Scale Pack',      credits: 5000, priceUSD: 129 },
];

// Add-ons (monthly)
const ADDONS = [
  { key: 'seat',     name: 'Extra Team Seat', desc: 'Per additional seat',         priceUSD: 8,   icon: <Users className="h-4 w-4" /> },
  { key: 'storage',  name: 'Extra Storage 100GB', desc: 'Expand asset library',    priceUSD: 5,   icon: <Database className="h-4 w-4" /> },
  { key: 'video',    name: 'Video Minutes +100', desc: 'Short videos from results',priceUSD: 10,  icon: <Film className="h-4 w-4" /> },
  { key: 'priority', name: 'Priority Booster',    desc: 'Skip queues more often',  priceUSD: 15,  icon: <Gauge className="h-4 w-4" /> },
];

const HERO_HIGHLIGHTS = [
  {
    key: 'quality',
    icon: Sparkles,
    title: 'Studio-grade quality',
    desc: 'Photorealistic lighting, textures, and garments rendered in seconds.',
  },
  {
    key: 'conversion',
    icon: LineChart,
    title: 'Boosted conversions',
    desc: 'Teams report 23% higher add-to-cart rates after rolling out premium visuals.',
  },
  {
    key: 'control',
    icon: Crown,
    title: 'Creative control',
    desc: 'Dial in poses, lighting presets, and brand kits without leaving the browser.',
  },
];

const HERO_STATS = [
  { key: 'teams', value: '4.8★', label: 'Average rating across 1,200+ creative teams' },
  { key: 'speed', value: '6×', label: 'Faster approvals versus manual retouching' },
  { key: 'roi', value: '20%', label: 'Savings with annual billing on Pro & above' },
];

/* =========================
   FAQ
========================= */
const FAQS = [
  {
    q: 'How do credits work?',
    a: 'Each generation consumes credits based on resolution and features. Pro/Business/Agency include effectively unlimited usage under a fair-use policy. Heavy spikes may require Enterprise terms.',
  },
  { q: 'Can I cancel anytime?', a: 'Yes. Your plan remains active until the end of the billing period. No hidden fees.' },
  { q: 'Do you offer refunds?', a: 'We offer a 7-day money-back guarantee if the product fails to deliver as promised. Contact support with your order details.' },
  { q: 'Is my data secure?', a: 'Data is encrypted at rest and in transit. Temporary files auto-expire. Enterprise can request custom retention, SSO, and SOC 2 reports.' },
  { q: 'What’s the fair use policy?', a: 'Unlimited means no hard cap for normal usage. We monitor abuse and extreme spikes. For sustained high volume, we recommend Agency or Enterprise.' },
  { q: 'Do you offer discounts?', a: 'Yes: students/NGOs eligible for 20% off with verification. Annual billing saves 20% vs monthly.' },
];

/* =========================
   Component
========================= */

export default function PricingPage() {
  const [billing, setBilling] = useState('monthly'); // monthly | yearly
  const [currency, setCurrency] = useState('USD');   // USD | AED | MYR
  const [isDark, setIsDark] = useState(false);

  // Estimator state
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [seatCount, setSeatCount] = useState(1); // extra seats beyond included
  const [addonKeys, setAddonKeys] = useState({ storage: false, video: false, priority: false });

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (!root) return;
    const observe = () => setIsDark(root.classList.contains('dark'));
    observe();
    const mo = new MutationObserver(observe);
    mo.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, []);

  const savingsLabel = useMemo(() => 'Save 20% (2 months free)', []);

  const bgClass = isDark
    ? 'bg-[#0b0519] text-white'
    : 'bg-gradient-to-b from-[#f3f4ff] to-[#fff0f6] text-zinc-900';

  // Derived plans with displayed pricing (monthly vs yearly)
  const plans = useMemo(() => {
    return BASE_PLANS.map((p) => {
      const monthlyUSD = p.monthlyUSD;
      const yearlyUSD = monthlyUSD == null ? null : Math.round(monthlyUSD * 12 * 0.8); // 20% off annual
      return {
        ...p,
        displayUSD: billing === 'monthly' ? monthlyUSD : yearlyUSD,
        subLabel:
          p.key === 'enterprise'
            ? 'Tailored to your org'
            : billing === 'yearly' && monthlyUSD != null
            ? `Billed annually — ${formatMoney(yearlyUSD, currency)}/yr`
            : '/month',
      };
    });
  }, [billing, currency]);

  const proPlan = useMemo(() => plans.find((p) => p?.key === 'pro'), [plans]);
  const businessPlan = useMemo(() => plans.find((p) => p?.key === 'business'), [plans]);

  // Estimator calc
  const estimator = useMemo(() => {
    const plan = BASE_PLANS.find((p) => p.key === selectedPlan);
    const baseMonthlyUSD = plan?.monthlyUSD ?? 0;
    const billedUSD = billing === 'monthly' ? baseMonthlyUSD : baseMonthlyUSD * 0.8; // per month equivalent

    // ✅ JS-safe lookups (no TS non-null assertion)
    const seatAddonUSD = ((ADDONS.find(a => a.key === 'seat')?.priceUSD ?? 0) * Math.max(0, seatCount));
    const storageUSD   = addonKeys.storage  ? (ADDONS.find(a => a.key === 'storage')?.priceUSD  ?? 0) : 0;
    const videoUSD     = addonKeys.video    ? (ADDONS.find(a => a.key === 'video')?.priceUSD    ?? 0) : 0;
    const priorityUSD  = addonKeys.priority ? (ADDONS.find(a => a.key === 'priority')?.priceUSD ?? 0) : 0;

    const monthlyTotalUSD = billedUSD + seatAddonUSD + storageUSD + videoUSD + priorityUSD;
    const currencyLabel = CURRENCIES[currency]?.label || 'USD $';
    const perMonth = formatMoney(monthlyTotalUSD, currency);
    const perYear  = formatMoney(monthlyTotalUSD * 12, currency);
    return { perMonth, perYear, currencyLabel, baseMonthlyUSD: billedUSD };
  }, [selectedPlan, billing, seatCount, addonKeys, currency]);

  return (
    <Layout title="Pricing">
      <main className={`min-h-screen ${bgClass}`}>
        {/* Hero */}
        <section className="relative overflow-hidden pb-16 pt-24">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-fuchsia-500/25 blur-[140px]" />
            <div className="absolute -bottom-32 -right-24 h-[26rem] w-[26rem] rounded-full bg-indigo-500/25 blur-[160px]" />
            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage:
                  'radial-gradient(circle at top left, rgba(236,72,153,.2), transparent 45%), radial-gradient(circle at bottom right, rgba(37,99,235,.2), transparent 35%)',
              }}
            />
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,420px)] lg:items-center">
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-left"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white/90">
                  AI visuals loved by top ecommerce teams
                </div>
                <motion.h1
                  className="mt-4 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                >
                  Pricing engineered to beat the brief—and the competition
                </motion.h1>
                <motion.p
                  className="mt-4 max-w-2xl text-base text-zinc-600 dark:text-zinc-300 sm:text-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  Launch hyper-real product imagery, AI try-ons, and campaign-ready edits in one workflow. Start free, then scale with plans built for modern merchandisers and agencies.
                </motion.p>

                <div className="mt-6 flex flex-wrap items-center gap-3 text-xs">
                  <Badge icon={<ShieldCheck className="h-4 w-4" />} text="7-day money-back guarantee" />
                  <Badge icon={<Zap className="h-4 w-4" />} text="Priority rendering on Pro+" />
                  <Badge icon={<BadgeCheck className="h-4 w-4" />} text="SOC2-ready infrastructure" />
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {HERO_HIGHLIGHTS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.key}
                        className="rounded-2xl border border-white/15 bg-white/60 p-4 shadow-sm backdrop-blur dark:bg-white/5"
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-fuchsia-500 text-white shadow-lg">
                            <Icon className="h-5 w-5" />
                          </span>
                          <div>
                            <div className="text-sm font-semibold">{item.title}</div>
                            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">{item.desc}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <BillingToggle billing={billing} onChange={setBilling} savings={savingsLabel} />
                  <CurrencyToggle currency={currency} onChange={setCurrency} />
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {HERO_STATS.map((stat) => (
                    <div
                      key={stat.key}
                      className="rounded-2xl border border-white/15 bg-white/50 p-4 text-left backdrop-blur dark:bg-white/5"
                    >
                      <div className="text-2xl font-bold text-zinc-900 dark:text-white">{stat.value}</div>
                      <p className="mt-1 text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <ReviewsStrip />
                  <VerifiedBrands />
                </div>
              </motion.div>

              <HeroPlanSpotlight
                plan={proPlan}
                secondaryPlan={businessPlan}
                billing={billing}
                currency={currency}
                onChoosePlan={() => setSelectedPlan('pro')}
              />
            </div>
          </div>
        </section>

        {/* Plans */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-12">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 xl:grid-cols-4">
            {plans
              .filter(p => ['free','starter','pro','business'].includes(p.key))
              .map((plan, idx) => (
                <PlanCard
                  key={plan.key}
                  plan={plan}
                  billing={billing}
                  currency={currency}
                  delay={idx * 0.06}
                  onSelectPlan={setSelectedPlan}
                />
              ))}
            {/* Agency */}
            <PlanCard
              key="agency"
              plan={plans.find(p=>p.key==='agency')}
              billing={billing}
              currency={currency}
              delay={0.3}
              onSelectPlan={setSelectedPlan}
            />
            {/* Enterprise */}
            <PlanCard
              key="enterprise"
              plan={plans.find(p=>p.key==='enterprise')}
              billing={billing}
              currency={currency}
              delay={0.36}
              onSelectPlan={setSelectedPlan}
            />
          </div>
          <MobileStickyCta />
        </section>

        {/* Pay-as-you-go */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
          <motion.h2
            className="text-center text-2xl md:text-3xl font-bold"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5 }}
          >
            Need more credits now? Pay-as-you-go packs
          </motion.h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PAYG_PACKS.map((p, i) => (
              <motion.div
                key={p.key}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="rounded-2xl border border-white/10 bg-white/60 p-5 text-center shadow backdrop-blur dark:bg-white/5"
              >
                <div className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">{p.name}</div>
                <div className="mt-2 text-3xl font-extrabold">{formatMoney(p.priceUSD, currency)}</div>
                <div className="mt-1 text-xs text-zinc-500">{p.credits.toLocaleString()} credits</div>
                <div className="mt-4">
                  <Button className="w-full rounded-xl px-4 py-2 text-sm font-semibold bg-white text-zinc-900 dark:bg-white/10 dark:text-white">
                    Buy Pack
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">
            One-time purchase • Credits never expire • Applied instantly to your account
          </div>
        </section>

        {/* Add-ons + Estimator */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
          <motion.h2
            className="text-center text-2xl md:text-3xl font-bold"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5 }}
          >
            Add-ons & Simple Estimator
          </motion.h2>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Add-ons */}
            <div className="rounded-2xl border border-white/10 bg-white/50 p-5 backdrop-blur dark:bg-white/5">
              <div className="text-sm font-semibold mb-3">Monthly add-ons</div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Seat selector */}
                <div className="rounded-xl border border-white/10 bg-white/70 p-4 dark:bg-white/10">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-fuchsia-400" />
                    <div className="font-semibold text-sm">Extra Team Seats</div>
                  </div>
                  <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">Per additional seat</p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold">
                      {formatMoney(ADDONS.find(a=>a.key==='seat')?.priceUSD ?? 0, currency)}/seat
                    </span>
                    <div className="inline-flex items-center rounded-lg border border-white/15 bg-white/50 p-1 backdrop-blur dark:bg-white/10">
                      <button
                        className="px-2 py-1 text-sm"
                        onClick={() => setSeatCount((v) => Math.max(0, v - 1))}
                        aria-label="Decrease seats"
                      >−</button>
                      <span className="px-3 py-1 text-sm min-w-[2ch] text-center">{seatCount}</span>
                      <button
                        className="px-2 py-1 text-sm"
                        onClick={() => setSeatCount((v) => Math.min(99, v + 1))}
                        aria-label="Increase seats"
                      >+</button>
                    </div>
                  </div>
                </div>

                {/* Toggle add-ons */}
                {ADDONS.filter(a => a.key !== 'seat').map((a) => (
                  <label
                    key={a.key}
                    className="cursor-pointer rounded-xl border border-white/10 bg-white/70 p-4 dark:bg-white/10 flex items-start gap-3"
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5"
                      checked={addonKeys[a.key] || false}
                      onChange={(e) => setAddonKeys((s) => ({ ...s, [a.key]: e.target.checked }))}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {a.icon}
                          <div className="font-semibold text-sm">{a.name}</div>
                        </div>
                        <div className="text-sm font-semibold">{formatMoney(a.priceUSD, currency)}/mo</div>
                      </div>
                      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">{a.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="mt-3 text-[11px] text-zinc-500 dark:text-zinc-400">
                * Add-ons are billed with your subscription. Change or cancel anytime.
              </div>
            </div>

            {/* Estimator */}
            <div className="rounded-2xl border border-white/10 bg-white/60 p-5 backdrop-blur dark:bg-white/5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Estimate your monthly cost</div>
                <div className="text-xs text-zinc-500 flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5" /> {CURRENCIES[currency].label}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="text-xs">
                  <div className="mb-1 text-zinc-600 dark:text-zinc-300">Plan</div>
                  <select
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                    className="w-full rounded-lg border border-white/15 bg-white/80 px-3 py-2 text-sm dark:bg-white/10"
                  >
                    {BASE_PLANS.filter(p=>p.monthlyUSD!=null).map((p) => (
                      <option key={p.key} value={p.key}>{p.name}</option>
                    ))}
                  </select>
                </label>
                <label className="text-xs">
                  <div className="mb-1 text-zinc-600 dark:text-zinc-300">Billing</div>
                  <select
                    value={billing}
                    onChange={(e) => setBilling(e.target.value)}
                    className="w-full rounded-lg border border-white/15 bg-white/80 px-3 py-2 text-sm dark:bg-white/10"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly (save 20%)</option>
                  </select>
                </label>
              </div>

              <div className="mt-4 rounded-xl border border-white/10 bg-white/70 p-4 text-sm dark:bg-white/10">
                <div className="flex items-center justify-between">
                  <span>Estimated total <span className="text-xs text-zinc-500">(incl. add-ons)</span></span>
                  <span className="font-extrabold">{estimator.perMonth} /mo</span>
                </div>
                <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
                  Or {estimator.perYear} per year (billed annually)
                </div>
                <div className="mt-4">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-fuchsia-600 hover:to-indigo-600"
                  >
                    Continue to Checkout <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                Estimates are for reference; actual billing uses your provider currency at checkout.
              </div>
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
          <motion.h2
            className="text-center text-2xl md:text-3xl font-bold"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5 }}
          >
            What’s included — at a glance
          </motion.h2>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-white/40 p-1 backdrop-blur dark:bg-white/5">
            <table className="min-w-[900px] w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="px-4 py-3">Feature</th>
                  <th className="px-4 py-3">Free</th>
                  <th className="px-4 py-3">Starter</th>
                  <th className="px-4 py-3">Pro</th>
                  <th className="px-4 py-3">Business</th>
                  <th className="px-4 py-3">Agency</th>
                  <th className="px-4 py-3">Enterprise</th>
                </tr>
              </thead>
              <tbody className="[&>tr:nth-child(even)]:bg-white/30 dark:[&>tr:nth-child(even)]:bg-white/5">
                {[
                  ['Credits', '5/mo', '200/mo', 'Unlimited*', 'Unlimited*', 'Unlimited*', 'Unlimited'],
                  ['Max Resolution', '1080p', '2k', '4k', '4k + Upscale', '8k + Upscale', 'Custom'],
                  ['AI Try-On', 'Standard', 'Standard', 'Premium', 'Premium', 'Premium+', 'Custom'],
                  ['Model Swap', <Xmark />, <Xmark />, <Checkmark />, <Checkmark />, <Checkmark />, <Checkmark />],
                  ['Short Videos', <Xmark />, <Xmark />, <Checkmark />, <Checkmark />, <Checkmark />, <Checkmark />],
                  ['Batch Processing', <Xmark />, <Xmark />, <Checkmark />, <Checkmark />, <Checkmark />, <Checkmark />],
                  ['API Access', <Xmark />, <Xmark />, <Checkmark />, <Checkmark />, <Checkmark />, <Checkmark />],
                  ['Webhooks', <Xmark />, <Xmark />, <Xmark />, <Checkmark />, <Checkmark />, <Checkmark />],
                  ['Brand Kit', <Xmark />, <Xmark />, <Checkmark />, <Checkmark />, <Checkmark />, <Checkmark />],
                  ['Team Seats Included', '—', '—', '—', '3', '5', 'Unlimited'],
                  ['Support', 'Community', 'Email', 'Email', 'Priority email', 'Priority+', 'Premium 24/7'],
                  ['Security', 'Std. Encryption', 'Std. Encryption', 'Std. Encryption', 'SSO (add-on)', 'SSO (add-on)', 'SAML SSO, SOC2'],
                ].map(([label, free, starter, pro, biz, ag, ent], i) => (
                  <tr key={i} className="border-t border-white/10">
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{label}</td>
                    <td className="px-4 py-3">{typeof free === 'string' ? free : free}</td>
                    <td className="px-4 py-3">{typeof starter === 'string' ? starter : starter}</td>
                    <td className="px-4 py-3">{typeof pro === 'string' ? pro : pro}</td>
                    <td className="px-4 py-3">{typeof biz === 'string' ? biz : biz}</td>
                    <td className="px-4 py-3">{typeof ag === 'string' ? ag : ag}</td>
                    <td className="px-4 py-3">{typeof ent === 'string' ? ent : ent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            *Fair use policy applies. See SLA for Business/Agency/Enterprise.
          </div>
        </section>

        {/* FAQs */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
          <motion.h2
            className="text-center text-2xl md:text-3xl font-bold"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5 }}
          >
            Frequently asked questions
          </motion.h2>

          <div className="mx-auto mt-6 grid max-w-3xl grid-cols-1 gap-3">
            {FAQS.map((item, idx) => (
              <FaqItem key={idx} q={item.q} a={item.a} />
            ))}
          </div>

          {/* Final guarantee */}
          <div className="mx-auto mt-10 flex max-w-3xl flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/40 p-6 text-center backdrop-blur dark:bg-white/5">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              7-day money-back guarantee
            </div>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              Try Pro completely risk-free. If it’s not a fit, get a refund within 7 days.
            </p>
            <Link
              href="/dashboard"
              className="mt-1 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-fuchsia-600 hover:to-indigo-600"
            >
              Upgrade now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Legal notes */}
          <div className="mx-auto mt-6 max-w-3xl text-center text-[11px] text-zinc-500 dark:text-zinc-400">
            Prices shown are indicative for {CURRENCIES[currency].label}. Final charges may vary at checkout. Unlimited usage is subject to fair-use policy and anti-abuse safeguards.
          </div>
        </section>
      </main>
    </Layout>
  );
}

/* =========================
   UI Components
========================= */

function BillingToggle({ billing, onChange, savings }) {
  return (
    <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/50 p-1 backdrop-blur dark:bg-white/5">
      <button
        className={`relative rounded-xl px-4 py-2 text-sm font-semibold transition ${billing === 'monthly' ? 'text-white' : 'text-white/70 hover:text-white'}`}
        onClick={() => onChange('monthly')}
        aria-pressed={billing === 'monthly'}
      >
        Monthly
        {billing === 'monthly' && (
          <motion.span layoutId="billing-pill" className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 shadow-[0_10px_30px_-10px_rgba(236,72,153,.45)]" />
        )}
      </button>
      <button
        className={`relative rounded-xl px-4 py-2 text-sm font-semibold transition ${billing === 'yearly' ? 'text-white' : 'text-white/70 hover:text-white'}`}
        onClick={() => onChange('yearly')}
        aria-pressed={billing === 'yearly'}
      >
        Yearly <span className="ml-1 rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">{savings}</span>
        {billing === 'yearly' && (
          <motion.span layoutId="billing-pill" className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 shadow-[0_10px_30px_-10px_rgba(236,72,153,.45)]" />
        )}
      </button>
    </div>
  );
}

function CurrencyToggle({ currency, onChange }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/50 p-1 backdrop-blur dark:bg-white/5">
      {Object.keys(CURRENCIES).map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={[
            'relative rounded-xl px-3 py-2 text-xs font-semibold transition',
            currency === c ? 'text-white' : 'text-white/70 hover:text-white'
          ].join(' ')}
          aria-pressed={currency === c}
        >
          {CURRENCIES[c].label}
          {currency === c && (
            <motion.span layoutId="currency-pill" className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 shadow-[0_10px_30px_-10px_rgba(37,99,235,.45)]" />
          )}
        </button>
      ))}
    </div>
  );
}

function ReviewsStrip() {
  return (
    <div className="flex w-full max-w-md flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/40 px-4 py-3 text-sm backdrop-blur dark:bg-white/5">
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < 5 ? 'text-amber-400' : 'text-amber-400/70'}`}
            fill="currentColor"
          />
        ))}
      </div>
      <div className="text-zinc-700 dark:text-zinc-300">
        <span className="font-semibold">4.9/5</span> based on <span className="font-semibold">1,200+</span> verified reviews
      </div>
      <div className="flex items-center gap-2 text-[11px] text-white/80">
        <span className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5">Trustpilot</span>
        <span className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5">G2</span>
        <span className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5">Capterra</span>
      </div>
    </div>
  );
}

function VerifiedBrands() {
  const brands = [
    { name: 'Zara' }, { name: 'ASOS' }, { name: 'Farfetch' }, { name: 'Shopify Plus' }, { name: 'Noon' },
  ];
  return (
    <div className="flex w-full max-w-xl flex-col gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-xs text-white/80 backdrop-blur dark:bg-white/5">
      <div className="font-semibold uppercase tracking-wide text-[11px] text-white/80">Verified by brands</div>
      <div className="grid grid-cols-3 place-items-center gap-2 sm:grid-cols-5">
        {brands.map((b) => (
          <BrandMark key={b.name} label={b.name} />
        ))}
      </div>
    </div>
  );
}

function BrandMark({ label }) {
  return (
    <div className="group relative inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/30 px-3 py-2 text-xs text-zinc-700 transition hover:bg-white/50 dark:border-white/10 dark:bg-white/10 dark:text-white/80">
      <svg width="18" height="18" viewBox="0 0 24 24" className="text-purple-600 dark:text-white/80">
        <path d="M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" fill="currentColor" />
      </svg>
      <span>{label}</span>
      <span className="pointer-events-none absolute inset-0 -z-10 rounded-xl opacity-0 group-hover:opacity-10 bg-gradient-to-r from-fuchsia-500 to-indigo-500 transition" />
    </div>
  );
}

function HeroPlanSpotlight({ plan, secondaryPlan, billing, currency, onChoosePlan }) {
  if (!plan) return null;

  const monthlyPrice = plan.monthlyUSD == null ? null : formatMoney(plan.monthlyUSD, currency);
  const yearlyPrice = plan.monthlyUSD == null ? null : formatMoney(Math.round((plan.monthlyUSD || 0) * 12 * 0.8), currency);

  let primaryPrice = 'Custom pricing';
  let secondaryLine = 'Let’s design a plan together.';

  if (plan.monthlyUSD != null) {
    if (billing === 'yearly') {
      primaryPrice = `${yearlyPrice}/yr`;
      secondaryLine = `${monthlyPrice}/mo equivalent • Save 20% annually`;
    } else {
      primaryPrice = `${monthlyPrice}/mo`;
      secondaryLine = `${yearlyPrice}/yr when billed annually (save 20%)`;
    }
  }

  const secondaryLabel = secondaryPlan?.monthlyUSD != null
    ? `${formatMoney(secondaryPlan.monthlyUSD, currency)}/mo`
    : 'Custom';

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.6 }}
      className="relative isolate flex flex-col gap-6 overflow-hidden rounded-[2rem] border border-white/15 bg-gradient-to-br from-white via-white/85 to-white/60 p-8 text-zinc-900 shadow-2xl backdrop-blur dark:from-white/10 dark:via-white/5 dark:to-white/5 dark:text-white"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(236,72,153,0.25),transparent_55%),radial-gradient(circle_at_bottom,rgba(37,99,235,0.2),transparent_55%)]" />
      <div className="pointer-events-none absolute -top-24 right-0 -z-10 h-48 w-48 rounded-full bg-white/40 blur-3xl dark:bg-white/10" />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-4xl" aria-hidden>{plan.icon}</span>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-600 dark:text-fuchsia-200">
              Recommended
            </div>
            <h3 className="text-2xl font-bold">{plan.name} plan</h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300 max-w-[18rem]">{plan.tagline}</p>
          </div>
        </div>
        {plan.highlight && (
          <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-purple-700 dark:text-fuchsia-200">
            <Zap className="h-3.5 w-3.5" /> {plan.highlight}
          </span>
        )}
      </div>

      <div>
        <div className="text-4xl font-black tracking-tight">{primaryPrice}</div>
        <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">{secondaryLine}</div>
      </div>

      <ul className="grid gap-3">
        {plan.features.slice(0, 5).map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm">
            <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-500">
              <CheckCircle className="h-3.5 w-3.5" />
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-3">
        <Button onClick={onChoosePlan} className="w-full text-base">
          Upgrade to {plan.name}
        </Button>
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-purple-700 underline-offset-4 hover:underline dark:text-fuchsia-200"
        >
          Explore the workspace
        </Link>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Cancel anytime. No usage penalties. VAT handled automatically.</p>
      </div>

      {secondaryPlan && (
        <div className="rounded-2xl border border-white/20 bg-white/50 p-4 text-sm backdrop-blur dark:bg-white/10">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold">Need more seats?</div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{secondaryPlan.name} • {secondaryPlan.tagline}</p>
            </div>
            <div className="text-right text-xs text-zinc-500 dark:text-zinc-300">
              <div className="font-semibold text-zinc-900 dark:text-white">{secondaryLabel}</div>
              <div>Priority+ queue</div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function PlanCard({ plan, billing, currency, delay = 0, onSelectPlan }) {
  if (!plan) return null;
  const { displayUSD, monthlyUSD } = plan;
  const priceLabel = displayUSD == null ? 'Custom' : `${formatMoney(displayUSD, currency)}${billing === 'yearly' && monthlyUSD != null ? ' /mo' : ''}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay }}
      className={[
        'relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/15 bg-white/70 p-8 text-left shadow-xl transition-all backdrop-blur',
        plan.popular
          ? 'ring-2 ring-offset-2 ring-fuchsia-400/50 ring-offset-white dark:ring-offset-transparent'
          : 'hover:-translate-y-1',
        'dark:bg-white/5',
      ].join(' ')}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(236,72,153,0.18),transparent_60%),radial-gradient(circle_at_bottom,rgba(37,99,235,0.18),transparent_55%)]" />
      {plan.popular && (
        <div className="absolute right-6 top-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/50 bg-white/70 px-3 py-1 text-xs font-bold text-amber-500 shadow-sm dark:bg-white/10 dark:text-amber-200">
            <Zap className="h-3.5 w-3.5" /> {plan.highlight || 'Popular'}
          </span>
        </div>
      )}

      <div className="flex flex-col gap-6">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-500 text-2xl text-white shadow-lg">
            {plan.icon}
          </span>
          <div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">{plan.name}</h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{plan.tagline}</p>
          </div>
        </div>

        <div>
          <div className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">{priceLabel}</div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">{plan.subLabel}</div>
        </div>

        <ul className="grid gap-3 text-sm">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/15 text-purple-600">
                <CheckCircle className="h-3.5 w-3.5" />
              </span>
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {plan.note && (
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400">{plan.note}</div>
        )}
      </div>

      <div className="mt-6">
        <Button
          variant={plan.popular ? 'primary' : 'secondary'}
          className="block w-full text-base"
          onClick={() => onSelectPlan?.(plan.key)}
        >
          {plan.cta}
        </Button>
        {plan.key === 'enterprise' && (
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            Or email <a className="underline" href="mailto:sales@aistore.app">sales@aistore.app</a>
          </p>
        )}
      </div>
    </motion.div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/40 backdrop-blur dark:bg-white/5">
      <button
        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div className="flex items-start gap-2">
          <HelpCircle className="mt-0.5 h-4 w-4 text-fuchsia-400" />
          <span className="font-semibold">{q}</span>
        </div>
        <ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="px-4 pb-4 text-sm text-zinc-700 dark:text-zinc-300"
          >
            {a}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Badge({ icon, text }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/90">
      {icon}
      {text}
    </span>
  );
}

function Checkmark() {
  return <Check className="h-4 w-4 text-emerald-400" aria-label="Included" />;
}
function Xmark() {
  return <X className="h-4 w-4 text-rose-400" aria-label="Not included" />;
}

function MobileStickyCta() {
  return (
    <div className="md:hidden fixed inset-x-4 bottom-4 z-40">
      <div className="rounded-2xl border border-white/10 bg-white/80 p-3 shadow-2xl backdrop-blur dark:bg-white/10">
        <div className="mb-2 text-center text-xs text-zinc-700 dark:text-zinc-300">
          Upgrade to Pro — <span className="font-semibold">Save 20% annually</span>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-fuchsia-600 hover:to-indigo-600"
        >
          Get Pro now <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
