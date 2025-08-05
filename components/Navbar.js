'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';
import Cookies from 'js-cookie';
import { MoonIcon, SunIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isDark, setIsDark] = useState(false);
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState(null);
  const [credits, setCredits] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  // Respect system preference on first load
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    const dark = savedTheme ? savedTheme === 'dark' : prefersDark;
    document.documentElement.classList.toggle('dark', dark);
    setIsDark(dark);
  }, []);

  // Scroll header effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Get user from cookies
  useEffect(() => {
    const raw = Cookies.get('user');
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        Cookies.remove('user');
      }
    }
  }, []);

  // Get credits and plan
  useEffect(() => {
    const getData = async () => {
      if (user?.email) {
        const { data, error } = await supabase
          .from('Data')
          .select('plan, credits')
          .eq('email', user.email)
          .single();

        if (!error && data) {
          setPlan(data.plan);
          setCredits(data.credits);
        }
      }
    };
    getData();
  }, [user]);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

const handleLogout = async () => {
  await fetch('/api/logout');
  await supabase.auth.signOut(); // 🧠 مهم لتسجيل الخروج من Supabase
  router.push('/login'); // ✅ توجيه بعد تسجيل الخروج
};

  const links = [
    { label: 'Home', href: '/' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Dashboard', href: '/dashboard' },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`fixed top-0 z-50 w-full transition-all ${
          scrolled
            ? 'backdrop-blur bg-white/80 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-700'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-4 md:px-8">
          <Link
            href="/"
            className="text-2xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-transparent bg-clip-text"
          >
            AI Store Assistant
          </Link>

          <nav className="hidden md:flex gap-6 text-sm font-semibold">
            {links.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={`transition-colors ${
                  router.pathname === href
                    ? 'text-purple-600 dark:text-purple-400'
                    : 'text-zinc-700 dark:text-zinc-300 hover:text-purple-500'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <SunIcon className="w-5 h-5 text-yellow-300" />
              ) : (
                <MoonIcon className="w-5 h-5 text-purple-500" />
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-3 bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-xl shadow-inner">
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{user.email}</span>
                <span className="bg-purple-600 text-white text-xs font-semibold px-2 py-1 rounded-full">{plan || 'Free'}</span>
                <span className="bg-emerald-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                  {credits ?? 0} credits
                </span>
                <button
                  onClick={handleLogout}
                  className="text-xs text-red-500 hover:underline font-medium ml-2"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Link
                  href="/login"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="border border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg bg-zinc-100 dark:bg-zinc-700 text-purple-500"
            aria-label="Toggle menu"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
<AnimatePresence>
  {menuOpen && (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.95 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={() => setMenuOpen(false)}
      />
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -10, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 shadow-md p-6 rounded-b-2xl"
      >
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-bold text-zinc-800 dark:text-zinc-100">Menu</span>
          <button onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <XMarkIcon className="w-6 h-6 text-zinc-600 dark:text-zinc-300" />
          </button>
        </div>
        <ul className="flex flex-col gap-4 text-zinc-800 dark:text-zinc-100 font-medium mb-6">
          {links.map(({ label, href }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setMenuOpen(false)}
                className="block py-1"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile Auth Section */}
        <div className="flex flex-col gap-3">
          {user ? (
            <div className="flex flex-col gap-2 p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 shadow-inner text-sm">
              <span className="font-medium text-zinc-800 dark:text-zinc-100">{user.email}</span>
              <div className="flex gap-2 flex-wrap">
                <span className="bg-purple-600 text-white text-xs font-semibold px-2 py-1 rounded-full">{plan || 'Free'}</span>
                <span className="bg-emerald-600 text-white text-xs font-semibold px-2 py-1 rounded-full">{credits ?? 0} credits</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-red-500 text-xs font-medium hover:underline text-left mt-2"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-semibold text-center"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                className="border border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold text-center"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </motion.nav>
    </>
  )}
</AnimatePresence>
    </>
  );
}
