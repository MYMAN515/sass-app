'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { MoonIcon, SunIcon, Bars3Icon } from '@heroicons/react/24/solid';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(false);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

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
    const cookieUser = Cookies.get('user');
    if (cookieUser) {
      try {
        const parsed = JSON.parse(cookieUser);
        setUser(parsed);
      } catch (err) {
        console.error('Invalid user cookie', err);
        Cookies.remove('user');
      }
    }
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    await fetch('/api/logout');
    Cookies.remove('user', { path: '/' });
    setUser(null);
    router.push('/');
  };

  const links = [
    { label: 'Home', href: '/' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Dashboard', href: '/dashboard' },
  ];

  return (
    <motion.header
      className={`fixed top-0 w-full z-50 transition-all px-4 py-3 backdrop-blur-md bg-zinc-900/80 text-white shadow-md`}
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <h1 className="text-lg font-bold text-white">AI Store Assistant</h1>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-6 text-sm">
          {links.map(({ label, href }) => (
            <Link key={href} href={href} className="hover:text-purple-400">
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop Right Side */}
        <div className="hidden md:flex items-center gap-3">
          <button onClick={toggleTheme} className="p-2 rounded-md bg-zinc-800">
            {dark ? <SunIcon className="w-4 h-4 text-yellow-300" /> : <MoonIcon className="w-4 h-4 text-purple-400" />}
          </button>
          {user && (
            <div className="text-sm text-zinc-200 flex gap-2 items-center">
              <span>{user.email}</span>
              <button onClick={handleLogout} className="text-purple-300 hover:underline">Log out</button>
            </div>
          )}
        </div>

        {/* Hamburger Menu */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden w-8 h-8 flex items-center justify-center rounded-md bg-zinc-800 text-purple-300"
          aria-label="Toggle menu"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="md:hidden mt-3 bg-zinc-800 rounded-xl px-4 py-4 space-y-4 text-white"
          >
            <div className="space-y-2">
              {links.map(({ label, href }) => (
                <Link key={href} href={href} className="block text-base font-medium hover:text-purple-300">
                  {label}
                </Link>
              ))}
            </div>
            <hr className="border-zinc-700" />
            <div className="flex items-center justify-between">
              <button onClick={toggleTheme} className="p-2 rounded-md bg-zinc-700">
                {dark ? <SunIcon className="w-5 h-5 text-yellow-300" /> : <MoonIcon className="w-5 h-5 text-purple-400" />}
              </button>
              {user && (
                <div className="text-sm">
                  <p className="mb-1 text-white text-xs sm:text-sm">{user.email}</p>
                  <button onClick={handleLogout} className="text-purple-300 hover:underline text-xs sm:text-sm">Log out</button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
