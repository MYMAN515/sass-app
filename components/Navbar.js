'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { AnimatePresence, motion } from 'framer-motion';
import { MoonIcon, SunIcon, Bars3Icon } from '@heroicons/react/24/solid';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState(null);

  const supabase = createBrowserSupabaseClient();
  const router = useRouter();

  // Dark mode toggle
  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark';
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggleTheme = () => {
    const newDark = !dark;
    setDark(newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newDark);
  };

  // Handle scroll shadow
  useEffect(() => {
    const scrollHandler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', scrollHandler);
    return () => window.removeEventListener('scroll', scrollHandler);
  }, []);

  // Fetch user from Supabase Data table
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const { data, error } = await supabase
          .from('Data')
          .select('name')
          .eq('user_id', session.user.id)
          .single();

        if (data) {
          setUserName(data.name);
        } else {
          setUserName(null);
          Cookies.remove('user'); // clear stale cookie if any
        }
      } else {
        setUserName(null);
        Cookies.remove('user');
      }
    };

    fetchUserData();
  }, []);

  // Logout handler
  const handleLogout = async () => {
    await supabase.auth.signOut();
    Cookies.remove('user');
    router.push('/login');
  };

  return (
    <header className={`fixed top-0 z-50 w-full transition-all ${scrolled ? 'shadow-md bg-black/70' : 'bg-transparent'}`}>
      <nav className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center text-white">
        <Link href="/" className="text-lg font-bold text-purple-400">AI Store Assistant</Link>

        <div className="flex items-center gap-6">
          <Link href="/" className="font-medium">Home</Link>
          <Link href="/pricing" className="font-medium">Pricing</Link>

          {/* Theme toggle */}
          <button onClick={toggleTheme} className="focus:outline-none">
            {dark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
          </button>

          {/* Auth status */}
          {userName ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{userName}</span>
              <button onClick={handleLogout} className="text-purple-400 text-sm underline">Log out</button>
            </div>
          ) : (
            <Link href="/login" className="text-sm font-medium">Login</Link>
          )}
        </div>
      </nav>
    </header>
  );
}
