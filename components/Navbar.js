'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { MoonIcon, SunIcon } from '@heroicons/react/24/solid';
import { MenuIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(false);
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const supabase = createPagesBrowserClient();

  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark';
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  useEffect(() => {
    const scrollHandler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', scrollHandler);
    return () => window.removeEventListener('scroll', scrollHandler);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const { data } = await supabase.from('Data').select('credits').eq('user_id', session.user.id).single();
        if (data) setCredits(data.credits);
      }
    };
    fetchUser();
  }, [supabase]);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    setUser(null);
    setCredits(null);
    router.push('/');
  };

  const links = [
    { label: 'Home', href: '/' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Dashboard', href: '/dashboard' },
  ];

  return (
    <motion.header
      className={`fixed top-0 w-full z-50 backdrop-blur bg-white/70 dark:bg-zinc-900/70 shadow-sm transition-all ${
        scrolled ? 'py-2' : 'py-4'
      }`}
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 md:px-6">
        <Link href="/" className="text-lg md:text-xl font-bold text-purple-600 dark:text-purple-300">
          AI Store Assistant
        </Link>

        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800"
          >
            {menuOpen ? <XMarkIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {links.map(({ label, href }) => (
            <Link key={href} href={href} className={`text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 ${router.pathname === href ? 'font-semibold text-purple-600 dark:text-purple-400' : ''}`}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <button onClick={toggleTheme} className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800">
            {dark ? <SunIcon className="w-5 h-5 text-yellow-300" /> : <MoonIcon className="w-5 h-5 text-purple-600" />}
          </button>

          {user ? (
            <div className="flex flex-col items-end gap-0 text-sm text-gray-600 dark:text-gray-300">
              <span>{user.user_metadata?.name || user.email}</span>
              {credits !== null && <span className="text-xs text-gray-400">Credits: {credits}</span>}
              <button onClick={handleLogout} className="text-purple-500 hover:underline text-xs mt-1">
                Log out
              </button>
            </div>
          ) : (
            <>
              <Link href="/register">
                <motion.button whileTap={{ scale: 0.95 }} className="px-4 py-2 rounded-full bg-zinc-200 hover:bg-zinc-300 text-sm dark:bg-zinc-800 dark:hover:bg-zinc-700">
                  Register
                </motion.button>
              </Link>
              <Link href="/login">
                <motion.button whileTap={{ scale: 0.95 }} className="px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm shadow">
                  Login
                </motion.button>
              </Link>
            </>
          )}
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden px-6 pb-4">
          <nav className="flex flex-col gap-4 mt-4 text-sm">
            {links.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={`text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 ${router.pathname === href ? 'font-semibold text-purple-600 dark:text-purple-400' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            {user ? (
              <>
                <span className="text-xs mt-2 text-gray-500">{user.user_metadata?.name || user.email}</span>
                {credits !== null && <span className="text-xs text-gray-400">Credits: {credits}</span>}
                <button onClick={handleLogout} className="text-purple-500 hover:underline text-sm mt-2">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/register" onClick={() => setMenuOpen(false)}>
                  <span className="text-sm">Register</span>
                </Link>
                <Link href="/login" onClick={() => setMenuOpen(false)}>
                  <span className="text-sm">Login</span>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </motion.header>
  );
}
