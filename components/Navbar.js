'use client';

import Link from 'next/link';
<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { MoonIcon, SunIcon, Bars3Icon } from '@heroicons/react/24/solid';
=======
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { AnimatePresence, motion } from 'framer-motion';
import { MoonIcon, SunIcon, Bars3Icon } from '@heroicons/react/24/solid';
import { supabase } from '@/lib/supabaseClient';
>>>>>>> 292c6fba (New Front-end | Back-End|)

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(false);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
<<<<<<< HEAD
=======
  const [plan, setPlan] = useState(null);
  const [credits, setCredits] = useState(null);

>>>>>>> 292c6fba (New Front-end | Back-End|)
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

<<<<<<< HEAD
=======
  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.email) {
        const { data, error } = await supabase
          .from('Data')
          .select('Plan, credits')
          .eq('email', user.email)
          .single();
        if (!error && data) {
          setPlan(data.plan);
          setCredits(data.credits);
        }
      }
    };
    fetchUserData();
  }, [user]);

>>>>>>> 292c6fba (New Front-end | Back-End|)
  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    await fetch('/api/logout');
<<<<<<< HEAD
    Cookies.remove('user', { path: '/' });
=======
    Cookies.remove('user');
>>>>>>> 292c6fba (New Front-end | Back-End|)
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
<<<<<<< HEAD
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
=======
      className={`fixed top-0 w-full z-50 backdrop-blur-md bg-white/70 dark:bg-zinc-900/80 transition-all shadow-md ${scrolled ? 'border-b border-zinc-200 dark:border-zinc-700' : ''}`}
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-purple-600 dark:text-purple-400 hover:opacity-80 transition-all">
          AI Store Assistant
        </Link>

        <nav className="hidden md:flex gap-10 text-sm font-medium">
          {links.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={`transition-colors duration-300 hover:text-purple-500 ${router.pathname === href ? 'text-purple-600 dark:text-purple-400' : 'text-zinc-700 dark:text-zinc-300'}`}
            >
>>>>>>> 292c6fba (New Front-end | Back-End|)
              {label}
            </Link>
          ))}
        </nav>

<<<<<<< HEAD
        {/* Desktop Right Side */}
        <div className="hidden md:flex items-center gap-3">
          <button onClick={toggleTheme} className="p-2 rounded-md bg-zinc-800">
            {dark ? <SunIcon className="w-4 h-4 text-yellow-300" /> : <MoonIcon className="w-4 h-4 text-purple-400" />}
          </button>
          {user && (
            <div className="text-sm text-zinc-200 flex gap-2 items-center">
              <span>{user.email}</span>
              <button onClick={handleLogout} className="text-purple-300 hover:underline">Log out</button>
=======
        <div className="hidden md:flex items-center gap-5">
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition">
            {dark ? (
              <SunIcon className="w-5 h-5 text-yellow-400" />
            ) : (
              <MoonIcon className="w-5 h-5 text-purple-500" />
            )}
          </button>

          {user ? (
            <div className="flex flex-col items-end">
              <span className="text-sm font-semibold text-zinc-800 dark:text-white">{user.email}</span>
              <div className="flex gap-2 mt-1">
                <span className="bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-200 px-2 py-0.5 rounded-full text-xs">
                  {plan || 'Free Plan'}
                </span>
                <span className="bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-200 px-2 py-0.5 rounded-full text-xs">
                  {credits ?? 0} credits
                </span>
              </div>
              <button onClick={handleLogout} className="text-red-500 text-xs mt-1 hover:underline">
                Log out
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link href="/login" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                Login
              </Link>
              <Link href="/register" className="border border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                Register
              </Link>
>>>>>>> 292c6fba (New Front-end | Back-End|)
            </div>
          )}
        </div>

<<<<<<< HEAD
        {/* Hamburger Menu */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden w-8 h-8 flex items-center justify-center rounded-md bg-zinc-800 text-purple-300"
=======
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-lg bg-zinc-100 dark:bg-zinc-700 text-purple-500"
>>>>>>> 292c6fba (New Front-end | Back-End|)
          aria-label="Toggle menu"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
      </div>

<<<<<<< HEAD
      {/* Mobile Menu */}
=======
>>>>>>> 292c6fba (New Front-end | Back-End|)
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
<<<<<<< HEAD
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
=======
            className="md:hidden mx-4 mt-3 bg-white dark:bg-zinc-800 rounded-xl px-5 py-5 shadow-md space-y-4"
          >
            {links.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="block text-base font-medium text-zinc-700 dark:text-zinc-200 hover:text-purple-500 dark:hover:text-purple-400"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            <div className="flex items-center justify-between mt-4">
              <button onClick={toggleTheme} className="p-2 rounded-md bg-zinc-100 dark:bg-zinc-700">
                {dark ? <SunIcon className="w-5 h-5 text-yellow-400" /> : <MoonIcon className="w-5 h-5 text-purple-500" />}
              </button>
              {user ? (
                <div className="text-sm text-right">
                  <p className="text-xs font-semibold text-zinc-800 dark:text-white">{user.email}</p>
                  <p className="text-xs text-purple-500 mt-1">{plan || 'Free Plan'} • {credits ?? 0} credits</p>
                  <button onClick={handleLogout} className="text-red-500 hover:underline text-xs mt-1">
                    Log out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 w-full">
                  <Link href="/login" className="block text-center text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md">
                    Login
                  </Link>
                  <Link href="/register" className="block text-center text-sm font-medium border border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-4 py-2 rounded-md">
                    Register
                  </Link>
>>>>>>> 292c6fba (New Front-end | Back-End|)
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
