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
  { href: '/dashboard', label: 'Dashboard' },
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
    setMenuOpen(false);
  }, [pathname]);

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

  const desktopNav = (
    <div className="hidden md:flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-sm backdrop-blur">
      {LINKS.map((link) => {
        const active = isActive(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? 'page' : undefined}
            className="relative inline-flex items-center rounded-full px-3 py-1.5 font-medium text-white/80 transition hover:text-white"
          >
            {active && (
              <motion.span
                layoutId="navbar-active"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-fuchsia-500/60 to-purple-600/60"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative">{link.label}</span>
          </Link>
        );
      })}
    </div>
  );

  const desktopActions = (
    <div className="hidden md:flex items-center gap-3">
      <button
        onClick={toggleTheme}
        className="inline-flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10 hover:text-white"
        aria-label="Toggle theme"
      >
        {dark ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
      </button>

      {loading ? (
        <div className="h-10 w-48 rounded-full bg-white/10 animate-pulse" />
      ) : user ? (
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
            <span className="inline-block size-2 rounded-full bg-emerald-400" />
            Plan
            <strong className="font-semibold text-white">{plan}</strong>
          </div>

          <Link
            href={lowCredits ? '/pricing' : '/dashboard'}
            className={[
              'hidden lg:inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition',
              lowCredits
                ? 'border-rose-400/50 bg-rose-400/10 text-rose-100 hover:bg-rose-400/20'
                : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white',
            ].join(' ')}
            title={lowCredits ? 'Recharge credits' : 'View credits'}
          >
            Credits
            <motion.span
              key={creditPulseRef.current}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              className="font-semibold text-white"
              aria-live="polite"
            >
              {credits}
            </motion.span>
            {lowCredits && <span className="hidden md:inline">Low</span>}
          </Link>

          <Link
            href="/enhance"
            className="hidden lg:inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:shadow-purple-500/40"
          >
            🚀 Launch Studio
          </Link>

          <div
            title={user.email}
            className="grid size-10 place-items-center rounded-full border border-white/15 bg-white/10 font-semibold text-white"
          >
            {initials}
          </div>
          <button
            onClick={handleLogout}
            className="text-xs font-medium text-white/70 underline-offset-2 hover:text-white hover:underline"
          >
            Logout
          </button>
        </div>
      ) : (
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:shadow-purple-500/40"
        >
          Sign in
        </Link>
      )}
    </div>
  );

  return (
    <header
      className={[
        'fixed top-0 z-50 w-full transition-colors duration-500',
        scrolled ? 'backdrop-blur-xl bg-[#0b061c]/80 shadow-[0_12px_45px_-20px_rgba(0,0,0,0.65)]' : 'bg-transparent',
      ].join(' ')}
      aria-label="Primary"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 text-white md:h-20">
        <Link href="/" className="group inline-flex items-center gap-3 rounded-full bg-white/5 px-3 py-2 text-sm font-semibold tracking-tight text-white transition hover:bg-white/10">
          <span className="relative flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500 text-white shadow-lg shadow-fuchsia-500/40">
            <span className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 transition group-hover:opacity-100" />
            <svg width="18" height="18" viewBox="0 0 24 24" className="relative text-white">
              <path d="M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" fill="currentColor" />
            </svg>
          </span>
          <span className="flex items-center gap-2">
            AI Studio
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
        </Link>

        {desktopNav}
        {desktopActions}

        <button
          className="inline-flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10 md:hidden"
          onClick={() => setMenuOpen((value) => !value)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 right-0 z-50 flex w-[86vw] max-w-sm flex-col overflow-hidden border-l border-white/10 bg-[#0b061c] text-white shadow-2xl"
              role="dialog"
              aria-modal="true"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div className="inline-flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500 text-white shadow-lg shadow-fuchsia-500/40">
                    <svg width="18" height="18" viewBox="0 0 24 24" className="text-white">
                      <path d="M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" fill="currentColor" />
                    </svg>
                  </div>
                  <div className="text-sm font-semibold">AI Studio</div>
                </div>
                <button
                  className="inline-flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto px-5 py-6">
                <nav className="space-y-2 text-sm">
                  {LINKS.map((link) => {
                    const active = isActive(link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className={[
                          'flex items-center justify-between rounded-2xl border px-4 py-3 font-medium transition',
                          active
                            ? 'border-fuchsia-500/50 bg-fuchsia-500/10 text-white'
                            : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white',
                        ].join(' ')}
                      >
                        <span>{link.label}</span>
                        {active && <span className="text-xs uppercase tracking-wide text-fuchsia-200">Now</span>}
                      </Link>
                    );
                  })}
                </nav>

                <button
                  onClick={toggleTheme}
                  className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                  <span>{dark ? 'Switch to light mode' : 'Switch to dark mode'}</span>
                  {dark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
                </button>

                {loading ? (
                  <div className="h-12 w-full rounded-2xl bg-white/10 animate-pulse" />
                ) : user ? (
                  <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                    <div className="flex items-center gap-3">
                      <div className="grid size-11 place-items-center rounded-full border border-white/10 bg-white/10 text-base font-semibold text-white">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{user.name || user.email}</p>
                        <p className="truncate text-xs text-white/60">{user.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                        <span className="block text-white/50">Plan</span>
                        <span className="text-sm font-semibold text-white">{plan}</span>
                      </div>
                      <div className={[
                        'rounded-xl border px-3 py-2',
                        lowCredits
                          ? 'border-rose-400/50 bg-rose-400/10 text-rose-100'
                          : 'border-white/10 bg-white/5 text-white',
                      ].join(' ')}>
                        <span className="block text-white/50">Credits</span>
                        <motion.span
                          key={`mobile-${creditPulseRef.current}`}
                          initial={{ scale: 1.1 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                          className="text-sm font-semibold"
                        >
                          {credits}
                        </motion.span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                      <Link
                        href="/enhance"
                        onClick={() => setMenuOpen(false)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:shadow-purple-500/40"
                      >
                        🚀 Launch Studio
                      </Link>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex-1 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/70 transition hover:border-white/30 hover:text-white"
                      >
                        Logout
                      </button>
                      {lowCredits && (
                        <Link
                          href="/pricing"
                          onClick={() => setMenuOpen(false)}
                          className="w-full text-center text-xs font-semibold text-rose-200 underline"
                        >
                          Recharge credits
                        </Link>
                      )}
                    </div>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:shadow-purple-500/40"
                  >
                    Sign in
                  </Link>
                )}
              </div>

              <div className="border-t border-white/10 px-5 py-4 text-xs text-white/40">
                © {new Date().getFullYear()} AI Studio. Crafted with ✨
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
