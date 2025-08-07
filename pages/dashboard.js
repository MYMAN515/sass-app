// pages/dashboard.js
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import Layout from '@/components/Layout';

/**
 * Dashboard with modern startup aesthetics:
 * - Glassy cards, animated blobs, subtle 3D hover, gradient CTAs.
 * - Session guard + plan badge + sign-out.
 * - Keyboard-accessible feature cards via <Link>.
 * Why: unify UX, reduce friction, and present a polished "studio" feel.
 */

const FEATURES = [
  {
    title: 'Enhance Studio',
    icon: '/icons/enhance.png',
    description: 'Make your product photos look cinematic using AI enhancements.',
    href: '/enhance',
    cta: 'Enhance Now',
  },
  {
    title: 'Try-on Experience',
    icon: '/icons/tryon.png',
    description: 'Visualize products directly on models using virtual try-on.',
    href: '/tryon',
    cta: 'Try Now',
  },
];

export default function Dashboard() {
  const router = useRouter();
  const [supabase] = useState(() => createBrowserSupabaseClient());
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState('Free');
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data: { session }, error: sessErr } = await supabase.auth.getSession();
        if (sessErr || !session) {
          router.replace('/login');
          return;
        }
        if (!mounted) return;
        setUser(session.user);

        // Optional plan fetch (safe fallback)
        const { data: userRow } = await supabase
          .from('Data')
          .select('plan')
          .eq('email', session.user.email)
          .single();
        setPlan(userRow?.plan || 'Free');
      } catch (e) {
        setError('Failed to load your workspace.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [router, supabase]);

  const initials = useMemo(() => {
    if (!user?.email) return 'U';
    const n = user.user_metadata?.name || user.email;
    const parts = n.split(' ').filter(Boolean);
    const first = parts[0]?.[0] || n[0];
    const second = parts[1]?.[0] || '';
    return (first + second).toUpperCase();
  }, [user]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  if (loading) {
    return (
      <Layout title="Dashboard">
        <main className="min-h-screen relative overflow-hidden bg-[#0b0519]">
          <BackgroundFX />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 py-16">
            <TopBarSkeleton />
            <CardsSkeleton />
          </div>
        </main>
      </Layout>
    );
  }

  if (!user) return null;

  return (
    <Layout title="Dashboard">
      <main className="min-h-screen relative overflow-hidden bg-[#0b0519] text-white">
        <BackgroundFX />

        {/* Top Bar */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 pt-6">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-4 sm:px-6 py-3">
            <div className="flex items-center gap-3">
              <LogoMark />
              <div className="hidden sm:block">
                <div className="text-sm text-white/70">Workspace</div>
                <div className="text-base font-semibold tracking-tight">
                  {user.user_metadata?.name || user.email}
                </div>
              </div>
              <span className="ml-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs">
                <span className="inline-block size-2 rounded-full bg-emerald-400" />
                Plan: <strong className="font-semibold">{plan}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/enhance"
                className="hidden sm:inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-fuchsia-600 hover:to-purple-700 px-4 py-2 text-sm font-semibold shadow-lg transition"
              >
                🚀 Launch Studio
              </Link>
              <button
                onClick={handleSignOut}
                className="rounded-full border border-white/15 bg-white/5 hover:bg-white/10 px-3 py-2 text-sm font-medium transition"
                aria-label="Sign out"
                title="Sign out"
              >
                Sign out
              </button>
              <div
                aria-hidden
                className="ml-1 size-9 rounded-full bg-white/10 border border-white/15 grid place-items-center font-bold"
                title={user.email}
              >
                {initials}
              </div>
            </div>
          </div>
        </div>

        {/* Hero */}
        <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 pt-10 sm:pt-14">
          <motion.h1
            className="text-center text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4"
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Create. Enhance. <span className="bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">Ship</span>.
          </motion.h1>
          <motion.p
            className="text-center max-w-2xl mx-auto text-white/70"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            AI studio for next-gen e-commerce visuals. Faster iteration, consistent looks, and brand-ready assets.
          </motion.p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/enhance"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-fuchsia-600 hover:to-purple-700 px-6 py-3 text-sm font-semibold shadow-xl transition"
            >
              Start Enhancing
            </Link>
            <Link
              href="/tryon"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 px-6 py-3 text-sm font-semibold transition"
            >
              Try-On Models
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {FEATURES.map((f, i) => (
                <FeatureCard key={f.title} feature={f} delay={i * 0.05} />
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* Footer mini */}
        <footer className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 pb-12">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-6 py-4 flex items-center justify-between text-sm text-white/70">
            <span>© {new Date().getFullYear()} AI Store Studio</span>
            <div className="flex items-center gap-4">
              <Link className="hover:text-white transition" href="/privacy">Privacy</Link>
              <Link className="hover:text-white transition" href="/terms">Terms</Link>
            </div>
          </div>
        </footer>

        {/* Error toast */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-xl border border-red-400/30 bg-red-500/10 text-red-200 px-4 py-2 text-sm backdrop-blur"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </Layout>
  );
}

/* ---------- Components ---------- */

function BackgroundFX() {
  // Why: layered FX keep it “modern” without heavy deps.
  return (
    <>
      {/* gradient base */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0b0519] via-[#1c0c35] to-[#0e031a]" />
      {/* animated blobs */}
      <motion.div
        className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-purple-600/40 blur-[120px]"
        animate={{ y: [0, 20, 0], x: [0, 10, 0], opacity: [0.35, 0.5, 0.35] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-20 -right-20 w-[22rem] h-[22rem] rounded-full bg-fuchsia-600/30 blur-[140px]"
        animate={{ y: [0, -15, 0], x: [0, -12, 0], opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,.45) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.45) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />
      {/* noise */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-soft-light"
        style={{ backgroundImage: 'url("data:image/svg+xml;utf8,\
<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'1200\' height=\'600\'><filter id=\'n\'>\
<feTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/></filter>\
<rect width=\'100%\' height=\'100%\' filter=\'url(%23n)\' opacity=\'0.4\'/></svg>")' }}
      />
    </>
  );
}

function LogoMark() {
  return (
    <div className="inline-flex items-center gap-2">
      <div className="grid place-items-center size-9 rounded-xl bg-gradient-to-br from-fuchsia-500 to-indigo-500 shadow-lg">
        <svg width="18" height="18" viewBox="0 0 24 24" className="text-white">
          <path
            d="M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <span className="font-semibold tracking-tight">AI Studio</span>
    </div>
  );
}

function FeatureCard({ feature, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      whileHover={{ y: -4 }}
      className="group relative"
    >
      <Link
        href={feature.href}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500 rounded-3xl"
        aria-label={feature.title}
      >
        <div className="relative h-full bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 text-center shadow-xl transition-all duration-300 overflow-hidden">
          <ParallaxHover>
            <div className="relative mb-5 flex items-center justify-center">
              <div className="p-3 rounded-2xl border border-white/10 bg-white/10">
                <img src={feature.icon} alt={feature.title} className="w-16 h-16" />
              </div>
              <div className="absolute top-1/2 left-1/2 w-28 h-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-fuchsia-500 via-purple-600 to-indigo-500 blur-3xl opacity-10 group-hover:opacity-30 transition duration-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3 tracking-wide">{feature.title}</h3>
            <p className="text-white/70 text-sm leading-relaxed mb-6">{feature.description}</p>
            <span className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-fuchsia-600 hover:to-purple-700 text-white font-semibold py-2 px-6 rounded-full text-sm shadow-lg transition">
              {feature.cta} <ArrowIcon />
            </span>
          </ParallaxHover>
          <CardShine />
        </div>
      </Link>
    </motion.div>
  );
}

function ParallaxHover({ children }) {
  // Why: micro-interaction to feel “alive” without heavy libs.
  const [t, setT] = useState({ rX: 0, rY: 0, tx: 0, ty: 0 });
  return (
    <div
      onMouseMove={(e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 2 - 1;
        const y = ((e.clientY - top) / height) * 2 - 1;
        setT({ rX: y * -6, rY: x * 6, tx: x * 6, ty: y * 6 });
      }}
      onMouseLeave={() => setT({ rX: 0, rY: 0, tx: 0, ty: 0 })}
      style={{
        transform: `perspective(900px) rotateX(${t.rX}deg) rotateY(${t.rY}deg) translate3d(${t.tx}px, ${t.ty}px, 0)`,
        transformStyle: 'preserve-3d',
        transition: 'transform .2s ease',
      }}
    >
      {children}
    </div>
  );
}

function CardShine() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition bg-gradient-to-tr from-white to-transparent" />
      <div className="absolute -inset-[1px] rounded-3xl border border-white/10" />
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" className="inline-block">
      <path fill="currentColor" d="M5 12h12m0 0-5-5m5 5-5 5" />
    </svg>
  );
}

/* ---------- Skeletons ---------- */

function TopBarSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-6 py-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-white/10" />
          <div className="hidden sm:block">
            <div className="h-3 w-24 bg-white/10 rounded" />
            <div className="h-4 w-40 mt-2 bg-white/10 rounded" />
          </div>
          <div className="ml-2 h-6 w-28 bg-white/10 rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-32 bg-white/10 rounded-full" />
          <div className="h-9 w-20 bg-white/10 rounded-full" />
          <div className="size-9 rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  );
}

function CardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-64 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md animate-pulse" />
      ))}
    </div>
  );
}
