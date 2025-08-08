// pages/pricing.jsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, ShieldCheck, Zap, BadgeCheck, ArrowRight,
  HelpCircle, ChevronDown, Check, X, Star
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Layout from '@/components/Layout';
import Link from 'next/link';

const PLANS = [
  {
    key: 'free',
    name: 'Free',
    tagline: 'Start testing in minutes',
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      '5 credits / month',
      'Basic image enhancement',
      'AI try-on (standard)',
      'Community support',
    ],
    cta: 'Start for Free',
    icon: '⭐',
    popular: false,
  },
  {
    key: 'pro',
    name: 'Pro',
    tagline: 'For growing brands',
    priceMonthly: 20,
    priceYearly: 16,
    features: [
      'Unlimited* credits',
      'Advanced enhancement (HD)',
      'AI try-on (premium)',
      'Priority rendering',
      'Email support',
    ],
    note: '*Fair use applies',
    cta: 'Upgrade to Pro',
    icon: '🚀',
    popular: true,
    highlight: 'Best Value',
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    tagline: 'Scale with confidence',
    priceMonthly: null,
    priceYearly: null,
    features: [
      'Unlimited team seats',
      'Custom models & SLAs',
      'Dedicated account manager',
      'SAML SSO & SOC2 reports',
      'Premium support',
    ],
    cta: 'Contact Sales',
    icon: '💼',
    popular: false,
  },
];

const FAQS = [
  {
    q: 'How do credits work?',
    a: 'Each generation consumes credits based on resolution and features. Pro includes virtually unlimited usage under fair use; spikes may require enterprise terms.',
  },
  { q: 'Can I cancel anytime?', a: 'Yes. Your plan remains active until the end of the billing period. No hidden fees.' },
  { q: 'Do you offer refunds?', a: 'We offer a 7-day money-back guarantee if the product fails to deliver as promised. Just contact support with your order details.' },
  { q: 'Is my data secure?', a: 'Yes. Data is encrypted at rest and in transit. Temporary files auto-expire. Enterprise can request custom retention.' },
  { q: 'What’s included in Pro vs Free?', a: 'Pro unlocks advanced enhancement quality, premium try-on, priority queues, and email support. See the comparison below.' },
];

export default function PricingPage() {
  const [billing, setBilling] = useState('monthly');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const observe = () => setIsDark(document.documentElement.classList.contains('dark'));
    observe();
    const mo = new MutationObserver(observe);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, []);

  const savingsLabel = useMemo(() => 'Save 20% (2 months free)', []);
  const bgClass = isDark
    ? 'bg-[#0b0519] text-white'
    : 'bg-gradient-to-b from-[#f3f4ff] to-[#fff0f6] text-zinc-900';

  return (
    <Layout title="Pricing">
      <main className={`min-h-screen ${bgClass}`}>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-[120px]" />
            <div className="absolute -bottom-24 -right-24 h-[22rem] w-[22rem] rounded-full bg-indigo-500/20 blur-[140px]" />
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.5) 1px, transparent 1px)',
                backgroundSize: '44px 44px',
              }}
            />
          </div>

          <div className="mx-auto max-w-6xl px-6 pt-24 pb-10 text-center">
            <motion.h1
              className="text-4xl md:text-5xl font-extrabold tracking-tight"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Pricing that scales with your brand
            </motion.h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600 dark:text-zinc-300">
              Start free. Upgrade when you’re ready. Cancel anytime. Zero hassle.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs">
              <Badge icon={<ShieldCheck className="h-4 w-4" />} text="7-day money-back guarantee" />
              <Badge icon={<Zap className="h-4 w-4" />} text="Fast priority queues (Pro)" />
              <Badge icon={<BadgeCheck className="h-4 w-4" />} text="Secure & GDPR-aware" />
            </div>

            {/* Toggle Billing */}
            <div className="mt-8 flex items-center justify-center">
              <BillingToggle billing={billing} onChange={setBilling} savings={savingsLabel} />
            </div>

            {/* Reviews + Verified logos */}
            <div className="mt-8 space-y-6">
              <ReviewsStrip />
              <VerifiedBrands />
            </div>
          </div>
        </section>

        {/* Plans */}
        <section className="mx-auto max-w-6xl px-6 pb-12">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {PLANS.map((plan, idx) => (
              <PlanCard key={plan.key} plan={plan} billing={billing} delay={idx * 0.06} />
            ))}
          </div>
          <MobileStickyCta />
        </section>

        {/* Comparison */}
        <section className="mx-auto max-w-6xl px-6 py-12">
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
            <table className="min-w-[720px] w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="px-4 py-3">Feature</th>
                  <th className="px-4 py-3">Free</th>
                  <th className="px-4 py-3">Pro</th>
                  <th className="px-4 py-3">Enterprise</th>
                </tr>
              </thead>
              <tbody className="[&>tr:nth-child(even)]:bg-white/30 dark:[&>tr:nth-child(even)]:bg-white/5">
                {[
                  ['Credits', '5 / mo', 'Unlimited*', 'Unlimited'],
                  ['Image Enhancement', 'Basic', 'Advanced (HD)', 'Custom Pipeline'],
                  ['AI Try-On', 'Standard', 'Premium', 'Custom Models'],
                  ['Priority Rendering', <Xmark key="x1" />, <Checkmark key="c1" />, <Checkmark key="c2" />],
                  ['Support', 'Community', 'Email', 'Dedicated (SLA)'],
                  ['Security', 'Std. Encryption', 'Std. Encryption', 'SAML SSO, SOC2'],
                ].map(([label, free, pro, ent], i) => (
                  <tr key={i} className="border-t border-white/10">
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{label}</td>
                    <td className="px-4 py-3">{typeof free === 'string' ? free : free}</td>
                    <td className="px-4 py-3">{typeof pro === 'string' ? pro : pro}</td>
                    <td className="px-4 py-3">{typeof ent === 'string' ? ent : ent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">*Fair use policy applies.</div>
        </section>

        {/* FAQs */}
        <section className="mx-auto max-w-6xl px-6 py-12">
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
        </section>
      </main>
    </Layout>
  );
}

/* ---------------- Components ---------------- */

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

function ReviewsStrip() {
  // لماذا: تعزيز الثقة قبل رؤية الأسعار.
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/40 px-4 py-3 text-sm backdrop-blur dark:bg-white/5">
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < 4 ? 'text-amber-400' : 'text-amber-400/70'}`}
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
  // لماذا: إثبات اجتماعي “Verified by brands”
  const brands = [
    { name: 'Zara', mono: true },
    { name: 'ASOS', mono: true },
    { name: 'Farfetch', mono: true },
    { name: 'Shopify Plus', mono: true },
    { name: 'Noon', mono: true },
  ];
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-2 text-xs font-semibold text-white/80 text-center">
        Verified by brands
      </div>
      <div className="grid grid-cols-3 place-items-center gap-3 sm:grid-cols-5">
        {brands.map((b) => (
          <BrandMark key={b.name} label={b.name} />
        ))}
      </div>
    </div>
  );
}

function BrandMark({ label }) {
  return (
    <div className="group relative inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs text-white/80 transition hover:bg-white/15">
      <svg width="18" height="18" viewBox="0 0 24 24" className="text-white/80">
        <path d="M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" fill="currentColor" />
      </svg>
      <span>{label}</span>
      <span className="pointer-events-none absolute inset-0 -z-10 rounded-xl opacity-0 group-hover:opacity-10 bg-gradient-to-r from-fuchsia-500 to-indigo-500 transition" />
    </div>
  );
}

function PlanCard({ plan, billing, delay = 0 }) {
  const isPro = plan.key === 'pro';
  const price =
    plan.priceMonthly == null
      ? null
      : billing === 'monthly'
      ? plan.priceMonthly
      : plan.priceYearly;

  const priceLabel =
    price == null ? 'Custom' : `$${price}${billing === 'yearly' && plan.priceMonthly ? ' /mo' : ''}`;

  const subLabel =
    plan.key === 'enterprise'
      ? 'Tailored to your org'
      : billing === 'yearly' && plan.priceMonthly
      ? `Billed annually — $${(plan.priceMonthly * 12 * 0.8).toFixed(0)}/yr`
      : '/month';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay }}
      className={[
        'relative flex h-full flex-col justify-between rounded-3xl border p-8 text-center shadow-xl transition-all',
        'border-white/10 bg-white/50 backdrop-blur dark:bg-white/5',
        isPro ? 'ring-2 ring-fuchsia-500/40' : '',
      ].join(' ')}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-200">
            <Zap className="h-3.5 w-3.5" /> {plan.highlight || 'Popular'}
          </span>
        </div>
      )}

      <div>
        <div className="text-4xl mb-3">{plan.icon}</div>
        <h3 className="text-2xl font-semibold">{plan.name}</h3>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{plan.tagline}</p>

        <div className="mt-5">
          <div className="text-4xl font-extrabold tracking-tight">{priceLabel}</div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">{subLabel}</div>
        </div>

        <ul className="mt-6 space-y-3 text-sm">
          {plan.features.map((f) => (
            <li key={f} className="flex items-center justify-center gap-2">
              <CheckCircle className="h-4 w-4 text-purple-500" />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {plan.note && (
          <div className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">{plan.note}</div>
        )}
      </div>

      <div className="mt-8">
        <Button
          className={[
            'w-full rounded-xl px-4 py-2 text-base font-semibold shadow-md transition-transform',
            isPro
              ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-fuchsia-600 hover:to-indigo-600 text-white'
              : 'bg-white text-zinc-900 hover:scale-[1.02] dark:bg-white/10 dark:text-white',
          ].join(' ')}
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
