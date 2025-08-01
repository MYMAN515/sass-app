import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { MoonIcon, SunIcon } from '@heroicons/react/24/solid';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Theme setup
  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark';
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  // Detect scroll to shrink navbar
  useEffect(() => {
    const scrollHandler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', scrollHandler);
    return () => window.removeEventListener('scroll', scrollHandler);
  }, []);

  // ✅ Get user from cookie
  useEffect(() => {
    const cookieUser = Cookies.get('user');
    if (cookieUser) {
      try {
        const parsed = JSON.parse(cookieUser); // cookie is now clean JSON
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
  Cookies.remove('user', { path: '/' }); // Redundant but safe
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
      className={`fixed top-0 w-full z-50 backdrop-blur bg-white/70 dark:bg-zinc-900/70 shadow-sm transition-all ${
        scrolled ? 'py-2' : 'py-4'
      }`}
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6">
        <Link href="/" className="text-xl font-bold text-purple-600 dark:text-purple-300">
          AI Store Assistant
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {links.map(({ label, href }) => (
            <Link key={href} href={href} className="relative group">
              <span
                className={`text-gray-700 dark:text-gray-300 ${
                  router.pathname === href ? 'font-semibold text-purple-600 dark:text-purple-400' : ''
                }`}
              >
                {label}
              </span>
              {router.pathname === href && (
                <motion.span
                  layoutId="underline"
                  className="absolute left-0 -bottom-1 h-0.5 w-full bg-purple-500"
                />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800">
            {dark ? (
              <SunIcon className="w-5 h-5 text-yellow-300" />
            ) : (
              <MoonIcon className="w-5 h-5 text-purple-600" />
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <span>{user.email}</span>
              <button
                onClick={handleLogout}
                className="text-purple-500 hover:underline font-medium ml-2"
              >
                Log out
              </button>
            </div>
          ) : (
            <>
              <Link href="/register">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 rounded-full bg-zinc-200 hover:bg-zinc-300 text-sm dark:bg-zinc-800 dark:hover:bg-zinc-700"
                >
                  Register
                </motion.button>
              </Link>
              <Link href="/login">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm shadow"
                >
                  Login
                </motion.button>
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}
