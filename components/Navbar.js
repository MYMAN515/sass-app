// components/Navbar.jsx
'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import { motion, AnimatePresence } from 'framer-motion';
import { MoonIcon, SunIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/history', label: 'History' },
  { href: '/blog', label: 'Blog' },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [supabase] = useState(() => createPagesBrowserClient());

  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState('Free');
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const creditPulseRef = useRef(0); // لتوليد key مختلف عند التغيير للأنيميشن

  // لماذا: تمييز الرابط الحالي بصريًا
  const isActive = useCallback((href) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  }, [pathname]);

  // Theme init
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const doc = window.document?.documentElement;
    if (!doc) return;
    const stored = window.localStorage?.getItem('theme');
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false;
    const initialDark = stored ? stored === 'dark' : prefersDark;
    setDark(initialDark);
    doc.classList.toggle('dark', initialDark);
  }, []);

  const toggleTheme = () => {
    if (typeof window === 'undefined') return;
    const doc = window.document?.documentElement;
    if (!doc) return;
    const next = !dark;
    setDark(next);
    window.localStorage?.setItem('theme', next ? 'dark' : 'light');
    doc.classList.toggle('dark', next);
  };

  // Scroll FX
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // --- util: جلب بيانات المستخدم من جدول Data
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
              creditPulseRef.current += 1; // لتحديث key للأنيميشن
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
        // no-op
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  // Session & initial fetch + realtime
  useEffect(() => {
    let mounted = true;
    let channel;
    const cleanups = [];

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
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'Data',
            filter: `user_id=eq.${session.user.id}`,
          },
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
      cleanups.push(() => {
        if (channel) supabase.removeChannel(channel);
      });

      const onRefresh = () => syncUserData(session.user.id, session.user.email);
      window.addEventListener('credits:refresh', onRefresh);
      cleanups.push(() => window.removeEventListener('credits:refresh', onRefresh));
    })();

    return () => {
      mounted = false;
      cleanups.forEach((fn) => fn());
    };
  }, [supabase, syncUserData]);

  useEffect(() => {
    if (!menuOpen) return;
    setMenuOpen(false);
  }, [pathname, menuOpen]);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const body = document.body;
    if (!body || !menuOpen) return undefined;
    const previous = body.style.overflow;
    body.style.overflow = 'hidden';
    return () => {
      body.style.overflow = previous;
    };
  }, [menuOpen]);

  const initials = useMemo(() => {
    const n = user?.name || user?.email || '';
    const parts = n.split(' ').filter(Boolean);
    const first = parts[0]?.[0] || n[0] || 'U';
    const second = parts[1]?.[0] || '';
    return (first + second).toUpperCase();
  }, [user]);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (err) {
      console.error('Failed to call logout API', err);
    }

    await supabase.auth.signOut();
    Cookies.remove('user');
    setMenuOpen(false);
    router.push('/login');
  };

  // اغلاق الدرج بالمفتاح ESC
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    if (menuOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  // لون تنبيهي لو الكريدت قليل
  const lowCredits = !loading && user && credits <= 3 && plan !== 'Pro';

  return (
    <header
      className={[
        'fixed inset-x-0 top-0 z-50 w-full transition-all duration-500',
        scrolled
          ? 'border-b border-white/10 bg-zinc-950/70 backdrop-blur-xl shadow-[0_18px_45px_-20px_rgba(15,10,31,0.9)]'
          : 'bg-transparent',
      ].join(' ')}
      aria-label="Primary"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
        aria-hidden
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="relative flex h-20 items-center justify-between gap-4 text-white">
          <Link href="/" className="group inline-flex items-center gap-3">
            <span className="relative grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500 shadow-lg shadow-fuchsia-500/25">
              <span className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 transition group-hover:opacity-100" aria-hidden />
              <svg width="20" height="20" viewBox="0 0 24 24" className="relative text-white">
                <path d="M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" fill="currentColor" />
              </svg>
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-sm font-semibold uppercase tracking-[0.28em] text-white/60">AI Studio</span>
              <span className="text-lg font-semibold tracking-tight">Creative Suite</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            <ul className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={[
                      'relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
                      isActive(l.href)
                        ? 'bg-white/90 text-zinc-900 shadow-lg shadow-black/10'
                        : 'text-white/80 hover:text-white hover:bg-white/10',
                    ].join(' ')}
                  >
                    {l.label}
                    {isActive(l.href) && (
                      <span className="absolute -bottom-[9px] left-1/2 size-2 -translate-x-1/2 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="inline-flex size-10 items-center justify-center rounded-full border border-white/15 bg-white/10 backdrop-blur transition hover:bg-white/20"
                aria-label="Toggle theme"
                title="Toggle theme"
              >
                {dark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
              </button>

              {loading ? (
                <div className="h-11 w-48 rounded-full bg-white/10" />
              ) : user ? (
                <div className="flex items-center gap-3">
                  <div className="hidden xl:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium">
                    <span className="inline-block size-2 rounded-full bg-emerald-400" />
                    Plan <strong className="font-semibold">{plan}</strong>
                  </div>

                  <Link
                    href={lowCredits ? '/pricing' : '#'}
                    className={[
                      'hidden xl:inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition',
                      lowCredits
                        ? 'border-rose-400/40 bg-rose-400/20 text-rose-50 hover:bg-rose-400/30'
                        : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white',
                    ].join(' ')}
                    title={lowCredits ? 'Recharge credits' : 'Credits balance'}
                  >
                    Credits
                    <motion.span
                      key={creditPulseRef.current}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                      className="text-sm"
                      aria-live="polite"
                    >
                      {credits}
                    </motion.span>
                    {lowCredits && <span className="hidden md:inline">Low</span>}
                  </Link>

                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 px-5 py-2 text-sm font-semibold shadow-lg shadow-fuchsia-500/30 transition hover:shadow-fuchsia-500/40"
                  >
                    🚀 Launch Studio
                  </Link>

                  <div
                    title={user.email}
                    className="grid size-10 place-items-center rounded-full border border-white/15 bg-white/10 font-semibold uppercase text-white"
                  >
                    {initials}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-xs font-semibold text-white/70 transition hover:text-white"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 px-5 py-2 text-sm font-semibold shadow-lg shadow-fuchsia-500/30 transition hover:shadow-fuchsia-500/40"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={toggleTheme}
              className="inline-flex size-11 items-center justify-center rounded-full border border-white/15 bg-white/10 backdrop-blur transition hover:bg-white/20"
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {dark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>

            <button
              className="inline-flex size-11 items-center justify-center rounded-full border border-white/15 bg-white/10 backdrop-blur transition hover:bg-white/20"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              className="fixed inset-x-4 top-24 bottom-6 z-50 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#120b25] via-[#100a1f] to-[#090611] text-white shadow-[0_40px_90px_-30px_rgba(12,6,25,0.9)]"
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ type: 'spring', stiffness: 220, damping: 24 }}
            >
              <div className="relative flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
                  <div className="inline-flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500">
                      <svg width="18" height="18" viewBox="0 0 24 24" className="text-white">
                        <path d="M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" fill="currentColor" />
                      </svg>
                    </span>
                    <div className="leading-tight">
                      <div className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60">AI Studio</div>
                      <div className="text-base font-semibold">Creative Suite</div>
                    </div>
                  </div>
                  <button
                    className="inline-flex size-11 items-center justify-center rounded-full border border-white/15 bg-white/10 backdrop-blur transition hover:bg-white/20"
                    onClick={() => setMenuOpen(false)}
                    aria-label="Close menu"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 pb-6 pt-4">
                  <ul className="space-y-2">
                    {LINKS.map((l) => (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          onClick={() => setMenuOpen(false)}
                          className={[
                            'flex items-center justify-between rounded-2xl border px-4 py-4 text-base font-medium transition',
                            isActive(l.href)
                              ? 'border-white/20 bg-white/10 text-white'
                              : 'border-white/5 bg-white/5 text-white/80 hover:border-white/15 hover:bg-white/10 hover:text-white',
                          ].join(' ')}
                        >
                          <span>{l.label}</span>
                          {isActive(l.href) && (
                            <span className="size-2 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500" />
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={toggleTheme}
                    className="mt-6 flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
                  >
                    <span>{dark ? 'Switch to Light mode' : 'Switch to Dark mode'}</span>
                    {dark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
                  </button>

                  <div className="mt-6 space-y-4 rounded-3xl border border-white/10 bg-white/5 p-4">
                    {loading ? (
                      <div className="h-12 w-full rounded-2xl bg-white/10" />
                    ) : user ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="grid size-12 place-items-center rounded-full border border-white/15 bg-white/10 text-base font-semibold uppercase">
                            {initials}
                          </div>
                          <div>
                            <div className="text-sm font-semibold">{user.name || user.email}</div>
                            <div className="text-xs text-white/60">Signed in</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs font-medium">
                            <div className="flex items-center justify-between text-white/70">
                              <span>Current plan</span>
                              <span className="inline-block size-2 rounded-full bg-emerald-400" />
                            </div>
                            <div className="pt-2 text-base font-semibold">{plan}</div>
                          </div>
                          <Link
                            href={lowCredits ? '/pricing' : '#'}
                            onClick={() => setMenuOpen(false)}
                            className={[
                              'rounded-2xl border p-3 text-xs font-medium transition',
                              lowCredits
                                ? 'border-rose-400/40 bg-rose-400/20 text-rose-50 hover:bg-rose-400/30'
                                : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white',
                            ].join(' ')}
                          >
                            <div className="flex items-center justify-between text-white/70">
                              <span>Credits</span>
                              {lowCredits && (
                                <span className="rounded-full bg-rose-400/80 px-2 py-0.5 text-[11px] font-semibold text-rose-50">
                                  Low
                                </span>
                              )}
                            </div>
                            <motion.div
                              key={`mobile-${creditPulseRef.current}`}
                              initial={{ scale: 1.1 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 240, damping: 20 }}
                              className="pt-2 text-2xl font-semibold"
                            >
                              {credits}
                            </motion.div>
                          </Link>
                        </div>
                        <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                          <Link
                            href="/enhance"
                            onClick={() => setMenuOpen(false)}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 px-5 py-3 text-sm font-semibold shadow-lg shadow-fuchsia-500/30 transition hover:shadow-fuchsia-500/40"
                          >
                            🚀 Launch Studio
                          </Link>
                          <button
                            onClick={() => {
                              setMenuOpen(false);
                              handleLogout();
                            }}
                            className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
                          >
                            Logout
                          </button>
                        </div>
                      </div>
                    ) : (
                      <Link
                        href="/login"
                        onClick={() => setMenuOpen(false)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 px-5 py-3 text-sm font-semibold shadow-lg shadow-fuchsia-500/30 transition hover:shadow-fuchsia-500/40"
                      >
                        Sign in
                      </Link>
                    )}
                  </div>
                </div>

                <div className="border-t border-white/10 px-5 py-4 text-xs text-white/50">
                  © {new Date().getFullYear()} AI Studio. Crafted for visionaries.
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );

}
