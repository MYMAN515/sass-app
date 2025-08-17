// /components/MintLemonLanding.jsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/**
 * Mint–Lemon B2B Landing (Tabby/Tamara vibe)
 * - Light-only (لا dark)
 * - Clear value prop
 * - Micro-interactions + smooth scroll animations
 * - Responsive: mobile-first + desktop
 */

export default function MintLemonLanding() {
  return (
    <div className="relative min-h-screen w-full bg-white text-zinc-900">
      <TopBar />
      <Hero />
      <LogosMarquee />
      <KPIStats />
      <FeatureGrid />
      <HowItWorks />
      <Integrations />
      <TestimonialTicker />
      <FinalCTA />
      <SiteFooter />
    </div>
  );
}

/* -------------------------------- Navigation -------------------------------- */

function TopBar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/60 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <LogoMint />
          <span className="text-sm font-extrabold tracking-tight">Mint AI Studio</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-zinc-600 md:flex">
          <Link href="#features" className="hover:text-zinc-900">Features</Link>
          <Link href="#how" className="hover:text-zinc-900">How it works</Link>
          <Link href="#integrations" className="hover:text-zinc-900">Integrations</Link>
          <Link href="#pricing" className="hover:text-zinc-900">Pricing</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 md:inline-flex"
          >
            Log in
          </Link>
          <PrimaryCTA href="/dashboard">Launch Studio</PrimaryCTA>
        </div>
      </div>
    </header>
  );
}

function LogoMint() {
  return (
    <span
      aria-hidden
      className="inline-grid h-6 w-6 place-items-center rounded-lg bg-gradient-to-br from-emerald-300 to-amber-200 text-xs font-black text-zinc-900 shadow"
    >
      +
    </span>
  );
}

/* ----------------------------------- Hero ----------------------------------- */

function Hero() {
  const prefersReducedMotion = useReducedMotion();
  return (
    <section
      className="
        relative isolate overflow-hidden
        bg-[radial-gradient(80%_70%_at_30%_0%,#BFF7E140_0%,#FFFFFF_50%),radial-gradient(70%_60%_at_80%_20%,#FFF6B340_0%,#FFFFFF_50%)]
      "
    >
      {/* background grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] [background-size:28px_28px]" />

      {/* blobs */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 0.7, scale: 1 }}
        transition={{ duration: 1.2 }}
        className="pointer-events-none absolute -left-24 -top-24 h-[36rem] w-[36rem] rounded-full blur-3xl"
        style={{ background: 'conic-gradient(from 120deg,#A7F3D0AA,#FDE68AAA,#BAE6FD99,#E9D5FF99)' }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 0.55, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.1 }}
        className="pointer-events-none absolute -right-16 bottom-[-10rem] h-[28rem] w-[28rem] rounded-full blur-3xl"
        style={{ background: 'conic-gradient(from 240deg,#FFF6B3AA,#BFF7E199,#FDE68A99)' }}
      />

      {/* content */}
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 pt-16 pb-12 sm:px-6 md:pt-20 lg:grid-cols-[1.1fr,1fr] lg:px-8 lg:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-semibold shadow-sm">
              Conversion-first • cute & modern
            </span>
            <span className="text-[11px] text-zinc-500">Clarity • Speed • Security</span>
          </div>

          <CandyTitle />

          <p className="mt-4 max-w-xl text-lg text-zinc-600">
            Upload a product photo → get studio-grade images and virtual try-ons in seconds.
            Mint-fresh visuals. Lemon-squeezy workflow.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-[12px] text-zinc-600">
            <Pill>Free starter credits</Pill>
            <Dot />
            <Pill>No studio needed</Pill>
            <Dot />
            <Pill>GDPR-friendly</Pill>
          </div>

          <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center">
            <PrimaryCTA href="/dashboard">Get started free</PrimaryCTA>
            <GhostCTA href="#demo">Watch 30s demo</GhostCTA>
          </div>

          <EmailCapture />
          <TrustRow />
        </motion.div>

        <motion.div
          id="demo"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative isolate mx-auto w-full max-w-[520px]"
        >
          <TiltCard>
            <CompareSlider
              before={{ src: '/demo-before.jpg', alt: 'Before — raw product photo' }}
              after={{ src: '/demo-after.jpg', alt: 'After — AI enhanced studio' }}
              defaultPercent={62}
              showLabels
            />
          </TiltCard>

          {!prefersReducedMotion && (
            <>
              <FloatSticker className="left-[-16px] top-[-14px] rotate-[-6deg] bg-[#FFF6B3]">
                no more photoshoots
              </FloatSticker>
              <FloatSticker className="right-[-18px] top-[18%] rotate-[7deg] bg-[#BFF7E1]">
                try-on ready
              </FloatSticker>
            </>
          )}

          <CornerBadge>AI Enhanced</CornerBadge>
        </motion.div>
      </div>
    </section>
  );
}

function CandyTitle() {
  const words = ['photos', 'listings', 'ads', 'sales'];
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % words.length), 1700);
    return () => clearInterval(t);
  }, []);
  return (
    <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
      Turn{' '}
      <span className="bg-[linear-gradient(120deg,#22d3ee,40%,#f59e0b_60%,#10b981)] bg-clip-text text-transparent">
        product {words[i]}
      </span>{' '}
      into revenue — <span className="whitespace-nowrap">no studio needed.</span>
    </h1>
  );
}

/* ---------------------------------- Pieces ---------------------------------- */

function Pill({ children }) { return <span className="rounded-full bg-white px-3 py-1">{children}</span>; }
function Dot() { return <span className="mx-1 inline-block h-1 w-1 rounded-full bg-zinc-400" />; }

function PrimaryCTA({ href, children }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-400 to-amber-300 px-6 py-3 text-base font-semibold text-zinc-900 shadow-[0_8px_30px_rgba(16,185,129,.25)] transition hover:from-amber-300 hover:to-emerald-400"
      aria-label="Get started"
    >
      {children}
      <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M13 5l7 7-7 7M5 12h14" />
      </svg>
    </Link>
  );
}
function GhostCTA({ href, children }) {
  return (
    <Link href={href} className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-6 py-3 text-base font-semibold text-zinc-900">
      {children}
    </Link>
  );
}

function EmailCapture() {
  const [email, setEmail] = useState(''); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState('');
  const submit = (e) => {
    e.preventDefault();
    if (!/.+@.+\..+/.test(email)) { setMsg('Please use a valid email'); return; }
    setBusy(true); setMsg('');
    setTimeout(() => {
      window.location.href = `/dashboard?email=${encodeURIComponent(email)}&source=hero`;
    }, 400);
  };
  return (
    <form onSubmit={submit} className="mt-6 flex w-full max-w-xl gap-2" aria-live="polite">
      <input
        className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-emerald-300"
        placeholder="Enter your work email"
        value={email} onChange={(e)=>setEmail(e.target.value)}
        aria-label="Work email"
      />
      <button disabled={busy} className="rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60">
        Get beta invite
      </button>
      {msg && <span className="self-center text-xs text-rose-600">{msg}</span>}
    </form>
  );
}

function TrustRow() {
  return (
    <div className="mt-4 flex items-center gap-3 text-xs text-zinc-500">
      <span className="font-medium">Trusted by 1,200+ stores</span>
      <Dot /><span>Avg render 15s</span>
      <Dot /><span>99.9% uptime</span>
    </div>
  );
}

/* ------------------------------- Marquee logos ------------------------------ */

function LogosMarquee() {
  const logos = ['brand-1.svg','brand-2.svg','brand-3.svg','brand-4.svg','brand-5.svg'];
  return (
    <div className="mx-auto w-full max-w-7xl overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-3 text-center text-[11px] uppercase tracking-[0.2em] text-zinc-500">POWERING TEAMS AT</div>
      <div className="[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="animate-marquee flex min-w-full items-center gap-10 opacity-70 hover:[animation-play-state:paused]">
          {logos.concat(logos).map((src, i) => (
            <div key={i} className="relative h-8 w-28 opacity-80">
              <Image src={`/${src}`} alt="brand logo" fill className="object-contain" />
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        .animate-marquee { animation: marquee 26s linear infinite; }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      `}</style>
    </div>
  );
}

/* ---------------------------------- KPIs ----------------------------------- */

function KPIStats() {
  const list = [
    { label: 'Higher conversion', val: 32, suffix: '%' },
    { label: 'Time saved per shoot', val: 90, suffix: '%' },
    { label: 'Avg render', val: 15, suffix: 's' },
    { label: 'Uptime', val: 99.9, suffix: '%' },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {list.map((k, i) => <KPI key={i} {...k} />)}
      </div>
    </section>
  );
}
function KPI({ label, val, suffix }) {
  const ref = useRef(null); const [n, setN] = useState(0);
  useEffect(() => {
    let f; let s = null; const d = 900; const step = (t)=>{ if(s==null) s=t; const p=Math.min((t-s)/d,1); setN(Number((val*p).toFixed(1))); if(p<1) f=requestAnimationFrame(step); };
    const io = new IntersectionObserver(ents => ents.forEach(e => e.isIntersecting && requestAnimationFrame(step)), { threshold: .6 });
    if (ref.current) io.observe(ref.current); return ()=>{ cancelAnimationFrame(f); io.disconnect(); };
  }, [val]);
  return (
    <div ref={ref} className="rounded-2xl border border-zinc-200 bg-white p-4 text-center shadow-sm" style={{ boxShadow: '0 8px 30px rgba(0,0,0,.06)' }}>
      <div className="text-2xl font-extrabold">{n}{suffix}</div>
      <div className="text-xs text-zinc-600">{label}</div>
    </div>
  );
}

/* -------------------------------- Features ---------------------------------- */

function FeatureGrid() {
  const features = [
    { t: 'Image Enhancement', d: 'Studio quality at your fingertips.', i: '📷' },
    { t: 'AI Try-On', d: 'Preview products on real models.', i: '🧍' },
    { t: 'Smart Descriptions', d: 'On-brand copy auto-generated.', i: '💡' },
    { t: 'Batch Export', d: 'Push to Shopify & co. in one go.', i: '📦' },
    { t: 'Brand Profiles', d: 'Fonts, colors & presets once.', i: '🎨' },
    { t: 'Enterprise Security', d: 'GDPR, SSO, signed URLs.', i: '🛡️' },
  ];
  return (
    <section id="features" className="bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FFF2_100%)] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center text-3xl font-extrabold md:text-4xl"
        >
          Designed to convert — and delight
        </motion.h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <motion.div
              key={f.t}
              whileHover={{ y: -4, scale: 1.01 }}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-md"
            >
              <div className="mb-3 text-3xl" aria-hidden>{f.i}</div>
              <h3 className="text-lg font-semibold">{f.t}</h3>
              <p className="mt-1 text-sm text-zinc-600">{f.d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ How it works -------------------------------- */

function HowItWorks() {
  const steps = [
    { t: 'Upload', d: 'Drop a product photo (png/jpg)', i: '📤' },
    { t: 'Enhance & Try-On', d: 'AI does the heavy lifting', i: '⚙️' },
    { t: 'Publish', d: 'Export to your store/CMS', i: '🚀' },
  ];
  return (
    <section id="how" className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-10 text-center text-3xl font-extrabold md:text-4xl">How it works</h2>
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {steps.map((s, idx) => (
            <motion.div
              key={s.t}
              whileHover={{ rotate: idx === 1 ? 1.3 : -1.3, y: -4, scale: 1.01 }}
              className="relative rounded-3xl border border-zinc-200 bg-white p-6 shadow-lg"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-300 text-2xl">{s.i}</div>
              <h3 className="text-xl font-semibold">{s.t}</h3>
              <p className="mt-1 text-sm text-zinc-600">{s.d}</p>
              {idx < steps.length - 1 && (
                <svg className="pointer-events-none absolute right-[-18px] top-1/2 hidden -translate-y-1/2 md:block" width="36" height="2" viewBox="0 0 36 2" fill="none" aria-hidden>
                  <path d="M0 1h36" stroke="currentColor" strokeOpacity="0.25" strokeDasharray="4 3" />
                </svg>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- Integrations ------------------------------- */

function Integrations() {
  const items = [
    { name: 'Shopify', logo: '/shopify.svg' },
    { name: 'BigCommerce', logo: '/bigcommerce.svg' },
    { name: 'S3', logo: '/s3.svg' },
    { name: 'GCS', logo: '/gcs.svg' },
    { name: 'Zapier', logo: '/zapier.svg' },
    { name: 'Make', logo: '/make.svg' },
  ];
  return (
    <section id="integrations" className="bg-[linear-gradient(180deg,#FFFFFF_0%,#FDFCEB_100%)] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-3xl font-extrabold md:text-4xl">Integrates with your stack</h2>
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {items.map((it) => (
            <div key={it.name} className="relative h-16 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
              {/* استخدم صورك في /public أو استبدل بـ <span> */}
              <div className="grid h-full w-full place-items-center text-sm text-zinc-600">{it.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Testimonials ------------------------------- */

function TestimonialTicker() {
  const data = [
    '“CTR up 27% in 14 days.” — UrbanWear',
    '“Returns down 18% after try-on.” — SneakLab',
    '“Catalog refresh in a weekend.” — BloomBox',
    '“Consistent brand images = team peace.” — M.J.',
  ];
  return (
    <section className="mx-auto mb-2 mt-2 max-w-7xl overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-zinc-200 bg-white/80 p-4 backdrop-blur">
        <div className="relative [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <div className="animate-marquee2 flex min-w-full items-center gap-10">
            {data.concat(data).map((t, i) => (
              <div key={i} className="whitespace-nowrap text-sm text-zinc-700">{t}</div>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        .animate-marquee2 { animation: marquee2 30s linear infinite; }
        @keyframes marquee2 { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      `}</style>
    </section>
  );
}

/* --------------------------------- Final CTA -------------------------------- */

function FinalCTA() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-4 pb-24 pt-10 text-center sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5 }}
        className="rounded-3xl border border-zinc-200 bg-gradient-to-br from-white to-[#FDFCEB] p-8 shadow-xl"
      >
        <h3 className="text-2xl font-extrabold">Your competitors are already here.</h3>
        <p className="mt-2 text-zinc-600">Join the beta, spend less time retouching, and more time selling.</p>
        <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <PrimaryCTA href="/dashboard">Claim your invite</PrimaryCTA>
          <GhostCTA href="#features">Explore features</GhostCTA>
        </div>
      </motion.div>
    </section>
  );
}

/* ---------------------------------- Footer ---------------------------------- */

function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200/70 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <LogoMint /><span className="text-sm font-bold">Mint AI Studio</span>
          </div>
          <p className="text-sm text-zinc-600">AI visuals for modern commerce.</p>
        </div>
        <div className="text-sm text-zinc-600">
          <div className="font-semibold text-zinc-900">Product</div>
          <ul className="mt-2 space-y-1">
            <li><Link href="#features" className="hover:text-zinc-900">Features</Link></li>
            <li><Link href="#integrations" className="hover:text-zinc-900">Integrations</Link></li>
            <li><Link href="#pricing" className="hover:text-zinc-900">Pricing</Link></li>
          </ul>
        </div>
        <div className="text-sm text-zinc-600">
          <div className="font-semibold text-zinc-900">Company</div>
          <ul className="mt-2 space-y-1">
            <li><Link href="/blog" className="hover:text-zinc-900">Blog</Link></li>
            <li><Link href="/privacy" className="hover:text-zinc-900">Privacy</Link></li>
            <li><Link href="/terms" className="hover:text-zinc-900">Terms</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-zinc-200 py-4 text-center text-xs text-zinc-500">© {new Date().getFullYear()} Mint AI Studio</div>
    </footer>
  );
}

/* ------------------------- Interactive helpers (Hero) ----------------------- */

function TiltCard({ children }) {
  const ref = useRef(null);
  const [t, setT] = useState({ x: 0, y: 0 });
  const onMove = (e) => {
    const r = ref.current?.getBoundingClientRect(); if (!r) return;
    const rx = ((e.clientX - r.left) / r.width) * 2 - 1;
    const ry = ((e.clientY - r.top) / r.height) * 2 - 1;
    setT({ x: ry * 6, y: rx * 6 });
  };
  const onLeave = () => setT({ x: 0, y: 0 });
  return (
    <div
      ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      className="relative rounded-3xl border border-zinc-200 bg-white/90 p-2 shadow-2xl backdrop-blur"
      style={{ transform: `perspective(900px) rotateX(${t.x}deg) rotateY(${t.y}deg)` }}
    >
      {children}
    </div>
  );
}

function CompareSlider({ before, after, defaultPercent = 60, showLabels = true }) {
  const ref = useRef(null); const [pos, setPos] = useState(defaultPercent);
  const clamp = (v) => Math.max(0, Math.min(100, v));
  const move = (x) => { const r = ref.current?.getBoundingClientRect(); if(!r) return; setPos(clamp(((x - r.left) / r.width) * 100)); };
  return (
    <div ref={ref} className="relative w-full overflow-hidden rounded-2xl">
      <Image src={after.src} alt={after.alt} width={900} height={1200} className="h-auto w-full object-cover" priority />
      <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <Image src={before.src} alt={before.alt} width={900} height={1200} className="h-full w-full object-cover" />
      </div>
      {showLabels && (
        <>
          <div className="pointer-events-none absolute left-3 top-3 select-none rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-zinc-800 shadow">Before</div>
          <div className="pointer-events-none absolute right-3 top-3 select-none rounded-full bg-emerald-400 px-2 py-1 text-[10px] font-semibold text-zinc-900 shadow">After</div>
        </>
      )}
      <div
        role="slider" aria-label="Compare before and after" tabIndex={0}
        className="absolute top-0 cursor-ew-resize" style={{ left:`calc(${pos}% - 1px)`, height:'100%' }}
        onPointerDown={(e)=>{e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId); move(e.clientX);}}
        onPointerMove={(e)=>{ if(!(e.buttons&1)) return; move(e.clientX); }}
        onKeyDown={(e)=>{ if(e.key==='ArrowLeft') setPos(p=>clamp(p-5)); if(e.key==='ArrowRight') setPos(p=>clamp(p+5)); }}
      >
        <div className="h-full w-0.5 bg-white shadow-[0_0_0_1px_rgba(0,0,0,.08)]" />
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-zinc-900/80 px-2 py-1 text-xs text-white shadow">Drag</div>
      </div>
      <div className="absolute inset-x-0 bottom-0 z-10 m-0 flex items-center gap-2 bg-gradient-to-t from-black/10 to-transparent px-4 pb-3 pt-10">
        <input className="h-1 w-full appearance-none rounded-full bg-zinc-300 outline-none accent-emerald-400" type="range" min={0} max={100} value={pos} onChange={(e)=>setPos(Number(e.target.value))}/>
      </div>
    </div>
  );
}

function FloatSticker({ children, className = '' }) {
  return (
    <motion.div
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: [0, -6, 0], opacity: 1 }}
      transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
      className={`pointer-events-none absolute z-20 select-none rounded-xl px-3 py-2 text-[11px] font-extrabold text-zinc-900 shadow ${className}`}
      style={{ boxShadow: '0 6px 20px rgba(0,0,0,.08)' }}
    >
      {children}
    </motion.div>
  );
}
function CornerBadge({ children }) {
  return (
    <div className="pointer-events-none absolute right-3 top-3 z-20 flex items-center gap-1 rounded-full bg-zinc-900/80 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 2l1.6 4.4L18 8l-4.4 1.6L12 14l-1.6-4.4L6 8l4.4-1.6L12 2z" stroke="currentColor" strokeWidth="1.2" fill="currentColor" opacity="0.9" />
      </svg> {children}
    </div>
  );
}
