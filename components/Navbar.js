'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { MoonIcon, SunIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(null);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserSupabaseClient();
  const router = useRouter();

  // Dark mode setup
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

  // Scroll shadow effect
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Fetch user info from Supabase
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from('Data')
          .select('name, credits, plan')
          .eq('user_id', session.user.id)
          .single();

        if (data) {
          setUser({ name: data.name || session.user.email });
          setCredits(data.credits || 0);
          setPlan(data.plan || 'Free');
        }
      }
      setLoading(false);
    };
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    Cookies.remove('user');
    router.push('/login');
  };

  if (loading) return null;

  return (
    <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'shadow-md bg-black/80' : 'bg-transparent'}`}>
      <nav className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center text-white">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-purple-400">
          AI Assistant
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="hover:text-purple-400">Home</Link>
          <Link href="/pricing" className="hover:text-purple-400">Pricing</Link>
          <Link href="/dashboard" className="hover:text-purple-400">Dashboard</Link>

          <button onClick={toggleTheme}>
            {dark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm">{user.name}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-600">{plan}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500">{credits} credits</span>
              <button onClick={handleLogout} className="text-sm underline text-purple-300 ml-2">Logout</button>
            </div>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="text-sm font-medium hover:text-purple-300"
            >
              Login
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-black/90 text-white px-6 py-4 space-y-4">
          <Link href="/" onClick={() => setMenuOpen(false)} className="block">Home</Link>
          <Link href="/pricing" onClick={() => setMenuOpen(false)} className="block">Pricing</Link>
          <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="block">Dashboard</Link>

          <button onClick={toggleTheme} className="block">
            {dark ? 'Light Mode' : 'Dark Mode'}
          </button>

          {user ? (
            <div className="space-y-2">
              <div>{user.name}</div>
              <div className="text-xs bg-purple-600 inline-block px-2 py-0.5 rounded">{plan}</div>
              <div className="text-xs bg-green-500 inline-block px-2 py-0.5 rounded">{credits} credits</div>
              <button onClick={handleLogout} className="text-purple-400 underline">Logout</button>
            </div>
          ) : (
            <button
              onClick={() => {
                setMenuOpen(false);
                router.push('/login');
              }}
              className="block text-purple-400"
            >
              Login
            </button>
          )}
        </div>
      )}
    </header>
  );
}
