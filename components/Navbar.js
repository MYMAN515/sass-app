'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { AnimatePresence, motion } from 'framer-motion';
import { MoonIcon, SunIcon, Bars3Icon } from '@heroicons/react/24/solid';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(false);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [plan, setPlan] = useState(null);
  const [credits, setCredits] = useState(null);
  const supabase = createBrowserSupabaseClient();
  const router = useRouter();

  // Scroll effect
  useEffect(() => {
    const scrollHandler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', scrollHandler);
    return () => window.removeEventListener('scroll', scrollHandler);
  }, []);

  // Theme
  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark';
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggleTheme = () => {
    const isDark = !dark;
    setDark(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDark);
  };

  // ✅ Fetch user session and listen to auth changes (Google or email)
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        Cookies.set('user', JSON.stringify({ email: session.user.email }), { expires: 7 });

        const { data } = await supabase
          .from('Data')
          .select('plan, credits')
          .eq('user_id', session.user.id)
          .single();

        if (data) {
          setPlan(data.plan);
          setCredits(data.credits);
        }
      } else {
        setUser(null);
      }
    };

    fetchUser();

    // ✅ Auth listener to update navbar when session changes
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      fetchUser();
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    Cookies.remove('user');
    setUser(null);
    router.push('/');
  };

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition duration-300 ${scrolled ? 'bg-zinc-900/80 backdrop-blur' : 'bg-transparent'}`}>
      <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text">
          AI Store Assistant
        </Link>

        <div className="flex items-center space-x-4">
          <Link href="/pricing" className="text-sm font-medium hover:text-purple-400 transition">Pricing</Link>
          <Link href="/dashboard" className="text-sm font-medium hover:text-purple-400 transition">Dashboard</Link>

          <button onClick={toggleTheme} className="text-white">
            {dark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </button>

          {user ? (
            <button
              onClick={handleLogout}
              className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 rounded-xl transition"
            >
              Logout
            </button>
          ) : (
            <>
              <Link href="/login">
                <button className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 rounded-xl transition">Login</button>
              </Link>
              <Link href="/register">
                <button className="border border-purple-500 text-purple-500 text-sm px-4 py-2 rounded-xl transition hover:bg-purple-500 hover:text-white">Register</button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
