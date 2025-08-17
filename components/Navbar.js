// components/Navbar.jsx
'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import { motion, AnimatePresence } from 'framer-motion';
import { MoonIcon, SunIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';

/**
 * MintLemon Navbar — matches hero (mint/lemon, glassy, fintech)
 * - Sticky, translucent, soft shadow on scroll
 * - Active link: mint→lemon underline
 * - Primary CTA: dark pill (matches hero), secondary: bordered white
 * - Mobile drawer with the same palette and soft cards
 * - Brand fixed to AIStore (logo + name) on desktop & mobile
 */

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/history', label: 'History' },
  { href: '/blog', label: 'Blog' },
];

// --- Brand (AIStore) ---
function Brand({ className = '' }) {
  return (
    <Link
      href="/"
      aria-label="AIStore Home"
      className={`group inline-flex items-center gap-2 ${className}`}
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-indigo-500 shadow-sm">
        <svg width="18" height="18" viewBox="0 0 24 24" className="text-white">
          <path d="M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" fill="currentColor" />
        </svg>
      </span>
      <span className="font-semibold tracking-tight text-zinc-900 dark:text-white whitespace-nowrap">
        AIStore
      </span>
    </Link>
  );
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [supabase] = useState(() => createBrowserSupabaseClient());

  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState('Free');
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const creditPulseRef = useRef(0);

  const isActive = useCallback(
    (href) => (href === '/' ? pathname === '/' : pathname?.startsWith(href)),
    [pathname]
  );

  // Theme init (respect stored/system)
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDark = stored ? stored === 'dark' : prefersDark;
    setDark(initialDark);
    document.documentElement.classList.toggle('dark', initialDark);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', next);
  };

  // Scroll FX
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const syncUserData = useCallback(
    async (uid, fallbackEmail) => {
      try {
        const { data, error } = await supabase
          .from('Data')
          .select('name, credits, plan, email')
          .eq('user_id', uid)
          .single();

        if (!error && data) {
          setPlan(data?.plan || 'Free');
          setCredits((prev) => {
            if (typeof data?.credits === 'number' && data.credits !== prev) {
              creditPulseRef.current += 1;
            }
            return data?.credits ?? 0;
          });
          setUser((u) => ({
            ...(u || {}),
            name: data?.name || u?.name || fallbackEmail,
            email: data?.email || fallbackEmail,
            id: uid,
          }));
        }
      } catch (_e) {
        // ignore
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  // Session + realtime
  useEffect(() => {
    let mounted = true;
    let channel;

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;

      if (!session?.user) {
        setLoading(false);
        return;
      }

      setUser({
        id: session.user.id,
        email: session.user.email,
        name: session.user.user_metadata?.name || session.user.email,
      });

      await syncUserData(session.user.id, session.user.email);

      channel = supabase
        .channel('public:Data:credits')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'Data', filter: `user_id=eq.${session.user.id}` },
          (payload) => {
            const newCredits = payload.new?.credits;
            const newPlan = payload.new?.plan;
            if (typeof newCredits === 'number') {
              setCredits((prev) => {
                if (newCredits !== prev) creditPulseRef.current += 1;
                return newCredits;
              });
            }
            if (newPlan) setPlan(newPlan);
          }
        )
        .subscribe();

      const onRefresh = () => syncUserData(session.user.id, session.user.email);
      window.addEventListener('credits:refresh', onRefresh);

      return () => {
        mounted = false;
        window.removeEventListener('credits:refresh', onRefresh);
        if (channel) supabase.removeChannel(channel);
      };
    })();

    return () => { /* noop */ };
  }, [supabase, syncUserData]);

  const initials = useMemo(() => {
    const n = user?.name || user?.email || '';
    const parts = n.split(' ').filter(Boolean);
    const first = parts[0]?.[0] || n[0] || 'U';
    const second = parts[1]?.[0] || '';
    return (first + second).toUpperCase();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    Cookies.remove('user');
    router.push('/login');
  };

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
    if (menuOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const lowCredits = !loading && user && credits <= 3 && plan !== 'Pro';

  return (
    <header
      className={[
        'fixed top-0 z-50 w-full transition-all duration-300',
        scrolled ? 'shadow-[0_10px_30px_-10px_rgba(16,185,129,0.18)]' : '',
      ].join(' ')}
      aria-label="Primary"
    >
      {/* mint→lemon top hairline */}
      <div className="h-[3px] w-full bg-gradient-to-r from-[#CFFAE2] via-[#E9FFD7] to-[#FFF0A6] opacity-90" />

      <div
        className={[
          'mx-auto max-w-7xl px-4',
          'rounded-b-3xl border-b',
          'backdrop-blur-xl',
          scrolled
            ? 'bg-white/85 border-zinc-200/70 dark:bg-zinc-900/75 dark:border-white/10'
            : 'bg-white/65 border-zinc-200/60 dark:bg-zinc-900/55 dark:border-white/10',
        ].join(' ')}
        style={{ boxShadow: scrolled ? 'inset 0 -1px 0 rgba(0,0,0,.04)' : 'none' }}
      >
        <nav className="h-16 flex items-center justify-between">
          {/* Brand fixed (logo + name) */}
          <Brand className="shrink-0" />

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isActive(l.href) ? 'page' : undefined}
                className={[
                  'relative px-3 py-2 rounded-full text-sm font-medium transition',
                  'hover:bg-zinc-900/5 dark:hover:bg-white/10',
                  isActive(l.href) ? 'text-zinc-900 dark:text-white' : 'text-zinc-700 dark:text-white/80',
                ].join(' ')}
              >
                <span className="relative">
                  {l.label}
                  {isActive(l.href) && (
                    <span className="absolute -bottom-1 left-0 right-0 mx-auto h-[2px] w-7 rounded-full bg-gradient-to-r from-[#CFFAE2] to-[#FFF0A6]" />
                  )}
                </span>
              </Link>
            ))}

            {/* Theme */}
            <button
              onClick={toggleTheme}
              className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300/70 bg-white/70 text-zinc-700 hover:bg-white dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 transition"
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {dark ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
            </button>

            {/* User / CTAs */}
            {loading ? (
              <div className="ml-2 h-9 w-52 rounded-full bg-zinc-200/70 dark:bg-white/10 animate-pulse" />
            ) : user ? (
              <div className="ml-2 flex items-center gap-2">
                <span className="hidden lg:inline-flex items-center gap-2 rounded-full border border-zinc-300/70 bg-white/70 px-3 py-1 text-xs text-zinc-700 dark:border-white/15 dark:bg-white/10 dark:text-white">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                  Plan: <strong className="font-semibold">{plan}</strong>
                </span>

                <Link
                  href={lowCredits ? '/pricing' : '#'}
                  className={[
                    'hidden lg:inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition',
                    lowCredits
                      ? 'border-amber-300/60 bg-amber-200/30 text-amber-800 hover:bg-amber-200/50 dark:text-amber-200'
                      : 'border-zinc-300/70 bg-white/70 text-zinc-700 hover:bg-white dark:border-white/15 dark:bg-white/10 dark:text-white',
                  ].join(' ')}
                  title={lowCredits ? 'Recharge credits' : 'Credits'}
                >
                  Credits:{' '}
                  <motion.strong
                    key={creditPulseRef.current}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                    className="font-semibold"
                    aria-live="polite"
                  >
                    {credits}
                  </motion.strong>
                  {lowCredits && <span className="ml-1 hidden md:inline">— Low</span>}
                </Link>

                <Link
                  href="/enhance"
                  className="hidden lg:inline-flex items-center gap-2 rounded-full bg-zinc-900 hover:bg-zinc-800 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(0,0,0,0.18)] transition whitespace-nowrap"
                >
                  Book a demo
                </Link>

                <Link
                  href="/contact"
                  className="hidden lg:inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white hover:bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-900 transition whitespace-nowrap"
                >
                  Talk to sales
                </Link>

                <div
                  title={user?.email}
                  className="ml-1 grid place-items-center h-9 w-9 rounded-full bg-white text-zinc-900 border border-zinc-300/70 font-bold dark:bg-white/10 dark:text-white dark:border-white/15"
                >
                  {initials}
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs underline text-zinc-600 hover:text-zinc-900 dark:text-white/80 dark:hover:text-white"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="ml-2 flex items-center gap-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-full bg-zinc-900 hover:bg-zinc-800 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(0,0,0,0.18)] transition whitespace-nowrap"
                >
                  Sign in
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white hover:bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-900 transition whitespace-nowrap"
                >
                  Talk to sales
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-full border border-zinc-300/70 bg-white/70 text-zinc-700 hover:bg-white dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 transition"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>
        </nav>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.aside
              className="fixed right-0 top-0 bottom-0 z-50 w-[84vw] max-w-sm border-l border-zinc-200 shadow-2xl dark:border-white/10"
              role="dialog"
              aria-modal="true"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            >
              {/* Drawer Body */}
              <div className="bg-gradient-to-b from-[#F3FFF8] to-[#FFFCE8] h-full text-zinc-900 dark:bg-[linear-gradient(to_bottom,#0b0f14,#0b0f14)] dark:text-white flex flex-col">
                {/* Drawer Header with Brand */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-200/80 dark:border-white/10">
                  <Brand />
                  <button
                    className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-zinc-300/70 bg-white/70 text-zinc-700 hover:bg-white dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 transition"
                    onClick={() => setMenuOpen(false)}
                    aria-label="Close menu"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Drawer Content */}
                <div className="px-4 py-4 space-y-1 overflow-y-auto">
                  {LINKS.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setMenuOpen(false)}
                      className={[
                        'block rounded-2xl px-3 py-3 text-sm font-medium transition',
                        isActive(l.href)
                          ? 'bg-white text-zinc-900 shadow-sm dark:bg白/10 dark:text-white' // harmless if dark
                          : 'text-zinc-700 hover:bg-white/70 dark:text-white/80 dark:hover:bg-white/5',
                      ].join(' ')}
                    >
                      {l.label}
                    </Link>
                  ))}

                  <div className="pt-3 flex items-center gap-2">
                    <button
                      onClick={toggleTheme}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-medium border border-zinc-300/70 bg-white/70 text-zinc-700 hover:bg-white transition dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                    >
                      {dark ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
                      {dark ? 'Light Mode' : 'Dark Mode'}
                    </button>
                    {!loading && !user && (
                      <Link
                        href="/login"
                        onClick={() => setMenuOpen(false)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 px-4 py-3 text-sm font-semibold text-white transition"
                      >
                        Sign in
                      </Link>
                    )}
                  </div>

                  <div className="pt-4">
                    {loading ? (
                      <div className="h-10 w-full rounded-2xl bg-white/60 dark:bg-white/10 animate-pulse" />
                    ) : user ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="grid place-items-center h-9 w-9 rounded-full bg-white text-zinc-900 border border-zinc-300/70 font-bold dark:bg-white/10 dark:text-white dark:border-white/15">
                            {initials}
                          </div>
                          <div className="text-sm font-medium truncate">{user.name || user.email}</div>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-300/70 bg-white/70 px-2.5 py-1 text-zinc-700 dark:border-white/15 dark:bg-white/10 dark:text-white">
                            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                            Plan: <strong className="font-semibold">{plan}</strong>
                          </span>
                          <span
                            className={[
                              'inline-flex items-center gap-2 rounded-full px-2.5 py-1 border',
                              lowCredits
                                ? 'border-amber-300/60 bg-amber-200/35 text-amber-800 dark:text-amber-200'
                                : 'border-zinc-300/70 bg-white/70 text-zinc-700 dark:border-white/15 dark:bg-white/10 dark:text-white',
                            ].join(' ')}
                          >
                            Credits:{' '}
                            <motion.strong
                              key={`m-${creditPulseRef.current}`}
                              initial={{ scale: 1.15 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 240, damping: 20 }}
                              className="font-semibold"
                            >
                              {credits}
                            </motion.strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <Link
                            href="/enhance"
                            onClick={() => setMenuOpen(false)}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 px-4 py-3 text-sm font-semibold text-white transition"
                          >
                            Book a demo
                          </Link>
                          <Link
                            href="/contact"
                            onClick={() => setMenuOpen(false)}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-zinc-300 bg-white hover:bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-900 transition"
                          >
                            Talk to sales
                          </Link>
                          <button
                            onClick={() => {
                              setMenuOpen(false);
                              handleLogout();
                            }}
                            className="text-xs underline text-zinc-600 hover:text-zinc-900 dark:text-white/80 dark:hover:text-white"
                          >
                            Logout
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="mt-auto p-4 text-xs text-zinc-500 border-t border-zinc-200/70 dark:text-white/50 dark:border-white/10">
                  © {new Date().getFullYear()} AIStore
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
