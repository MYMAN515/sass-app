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
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(null);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ لتأخير التصيير حتى تحميل الجلسة

  const supabase = createBrowserSupabaseClient();
  const router = useRouter();

  // ✅ Dark mode setup
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

  // ✅ Scroll effect
  useEffect(() => {
    const scrollHandler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', scrollHandler);
    return () => window.removeEventListener('scroll', scrollHandler);
  }, []);

  // ✅ Fetch user session and data
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const { data, error } = await supabase
          .from('Data')
          .select('name, credits, plan')
          .eq('user_id', session.user.id)
          .single();

        if (data) {
          setUser({ name: data.name, email: session.user.email });
          setCredits(data.credits);
          setPlan(data.plan);
        } else {
          setUser(null);
          Cookies.remove('user');
        }
      } else {
        setUser(null);
        Cookies.remove('user');
      }

      setLoading(false); // ✅ تم تحميل كل شيء
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    Cookies.remove('user');
    router.push('/login');
  };

  if (loading) return null; // ✅ لا ترسم الـ Navbar قبل تحميل البيانات

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

          {/* User info */}
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{user.name || user.email}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-600">{plan || 'Free'}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500">{credits} credits</span>
              <button onClick={handleLogout} className="text-purple-400 text-sm underline ml-2">Logout</button>
            </div>
          ) : (
            <Link href="/login" className="text-sm font-medium">Login</Link>
          )}
        </div>
      </nav>
    </header>
  );
}
