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
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark';
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  useEffect(() => {
    const scrollHandler = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', scrollHandler);
    return () => window.removeEventListener('scroll', scrollHandler);
  }, []);

  const toggleTheme = () => {
    const newTheme = !dark;
    setDark(newTheme);
    document.documentElement.classList.toggle('dark', newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user;

      if (!currentUser) {
        Cookies.remove('user');
        setUser(null);
        return;
      }

      const { data, error } = await supabase
        .from('Data')
        .select('name')
        .eq('id', currentUser.id)
        .single();

      if (!data || error) {
        Cookies.remove('user');
        setUser(null);
        return;
      }

      setUser({ name: data.name });
    };

    checkUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    Cookies.remove('user');
    router.refresh();
    router.push('/');
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black shadow-md' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/">
          <span className="text-xl font-bold text-purple-300">AI Store Assistant</span>
        </Link>

        <div className="flex items-center space-x-4">
          <Link href="/" className="text-white hover:text-purple-300">Home</Link>
          <Link href="/pricing" className="text-white hover:text-purple-300">Pricing</Link>

          <button onClick={toggleTheme} className="text-white">
            {dark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
          </button>

          {user ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-white">{user.name}</span>
              <button onClick={handleLogout} className="text-purple-400 hover:underline text-sm">Log out</button>
            </div>
          ) : (
            <Link href="/login" className="text-white hover:text-purple-300">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
