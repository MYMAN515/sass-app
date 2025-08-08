// components/Navbar.jsx
'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import { motion, AnimatePresence } from 'framer-motion';
import { MoonIcon, SunIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/dashboard', label: 'Dashboard' },
];

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

  // لماذا: تمييز الرابط الحالي بصريًا
  const isActive = useCallback((href) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  }, [pathname]);

  // Theme init
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
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Session & user data
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        if (!mounted) return;

        setUser({ id: session.user.id, email: session.user.email, name: session.user.user_metadata?.name });
        const { data } = await supabase
          .from('Data')
          .select('name, credits, plan')
          .eq('user_id', session.user.id)
          .single();

        setPlan(data?.plan || 'Free');
        setCredits(data?.credits ?? 0);
        setUser((u) => ({ ...u, name: data?.name || u?.name || session.user.email }));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [supabase]);

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

  // اغلاق الدرج بالمفتاح ESC
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    if (menuOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <header
      className={[
        'fixed top-0 z-50 w-full transition-all duration-300',
        scrolled ? 'shadow-[0_10px_30px_-10px_rgba(0,0,0,.5)]' : '',
      ].join(' ')}
      aria-label="Primary"
    >
      <div
        className={[
          'mx-auto max-w-7xl px-4',
          'rounded-b-3xl border-b border-white/10',
          'backdrop-blur-xl',
          'bg-white/5 dark:bg-zinc-900/50',
        ].join(' ')}
        style={{
          boxShadow: scrolled ? 'inset 0 -1px 0 rgba(255,255,255,.06)' : 'none',
        }}
      >
        <nav className="h-16 flex items-center justify-between text-white">
          {/* Logo */}
          <Link href="/" className="group inline-flex items-center gap-2">
            <div className="grid place-items-center size-9 rounded-xl bg-gradient-to-br from-fuchsia-500 to-indigo-500 shadow-lg">
              <svg width="18" height="18" viewBox="0 0 24 24" className="text-white">
                <path d="M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" fill="currentColor" />
              </svg>
            </div>
            <span className="font-semibold tracking-tight">
              AI Studio
              <span className="ml-2 inline-block align-middle h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={[
                  'relative px-3 py-2 rounded-full text-sm font-medium transition',
                  'hover:bg-white/10',
                  isActive(l.href) ? 'text-white' : 'text-white/80',
                ].join(' ')}
              >
                <span className="relative">
                  {l.label}
                  {isActive(l.href) && (
                    <span className="absolute -bottom-1 left-0 right-0 mx-auto h-[2px] w-6 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500" />
                  )}
                </span>
              </Link>
            ))}

            <button
              onClick={toggleTheme}
              className="ml-1 inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 hover:bg-white/20 size-9 transition"
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {dark ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
            </button>

            {/* User/CTA */}
            {loading ? (
              <div className="ml-2 h-9 w-44 rounded-full bg-white/10 animate-pulse" />
            ) : user ? (
              <div className="ml-2 flex items-center gap-2">
                <span className="hidden lg:inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs">
                  <span className="inline-block size-2 rounded-full bg-emerald-400" />
                  Plan: <strong className="font-semibold">{plan}</strong>
                </span>
                <span className="hidden lg:inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs">
                  Credits: <strong className="font-semibold">{credits}</strong>
                </span>
                <Link
                  href="/enhance"
                  className="hidden lg:inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-fuchsia-600 hover:to-purple-700 px-4 py-2 text-sm font-semibold shadow-lg transition"
                >
                  🚀 Launch Studio
                </Link>
                <div
                  title={user.email}
                  className="ml-1 grid place-items-center size-9 rounded-full bg-white/10 border border-white/15 font-bold"
                >
                  {initials}
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs underline text-white/80 hover:text-white"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="ml-2 flex items-center gap-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-fuchsia-600 hover:to-purple-700 px-4 py-2 text-sm font-semibold shadow-lg transition"
                >
                  Sign in
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 hover:bg-white/20 size-10 transition"
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
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.aside
              className="fixed right-0 top-0 bottom-0 z-50 w-[84vw] max-w-sm bg-[#0f0a1f] text-white border-l border-white/10 shadow-2xl"
              role="dialog" aria-modal="true"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
                <div className="inline-flex items-center gap-2">
                  <div className="grid place-items-center size-9 rounded-xl bg-gradient-to-br from-fuchsia-500 to-indigo-500">
                    <svg width="18" height="18" viewBox="0 0 24 24" className="text-white">
                      <path d="M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" fill="currentColor" />
                    </svg>
                  </div>
                  <span className="font-semibold">AI Studio</span>
                </div>
                <button
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 hover:bg-white/20 size-10 transition"
                  onClick={() => setMenuOpen(false)} aria-label="Close menu"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="px-4 py-4 space-y-1">
                {LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className={[
                      'block rounded-xl px-3 py-3 text-sm font-medium transition',
                      isActive(l.href) ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/5',
                    ].join(' ')}
                  >
                    {l.label}
                  </Link>
                ))}

                <button
                  onClick={toggleTheme}
                  className="mt-2 inline-flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium border border-white/15 bg-white/5 hover:bg-white/10 transition"
                >
                  {dark ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
                  {dark ? 'Light Mode' : 'Dark Mode'}
                </button>

                <div className="pt-4">
                  {loading ? (
                    <div className="h-10 w-full rounded-xl bg-white/10 animate-pulse" />
                  ) : user ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="grid place-items-center size-9 rounded-full bg-white/10 border border-white/15 font-bold">
                          {initials}
                        </div>
                        <div className="text-sm font-medium truncate">{user.name || user.email}</div>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-2.5 py-1">
                          <span className="inline-block size-2 rounded-full bg-emerald-400" />
                          Plan: <strong className="font-semibold">{plan}</strong>
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-2.5 py-1">
                          Credits: <strong className="font-semibold">{credits}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <Link
                          href="/enhance"
                          onClick={() => setMenuOpen(false)}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-fuchsia-600 hover:to-purple-700 px-4 py-2 text-sm font-semibold shadow-lg transition"
                        >
                          🚀 Launch Studio
                        </Link>
                        <button
                          onClick={() => { setMenuOpen(false); handleLogout(); }}
                          className="text-xs underline text-white/80 hover:text-white"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setMenuOpen(false)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-fuchsia-600 hover:to-purple-700 px-4 py-2 text-sm font-semibold shadow-lg transition"
                    >
                      Sign in
                    </Link>
                  )}
                </div>
              </div>

              <div className="mt-auto p-4 text-xs text-white/50 border-t border-white/10">
                © {new Date().getFullYear()} AI Studio
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
