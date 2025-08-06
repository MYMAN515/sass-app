'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { MoonIcon, SunIcon, Bars3Icon } from '@heroicons/react/24/solid';

export default function Navbar() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(false);

  // 🌙 Theme toggle
  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark';
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggleDarkMode = () => {
    const newTheme = !dark;
    setDark(newTheme);
    document.documentElement.classList.toggle('dark', newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  // ✅ Check session and update user state
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log("🔍 Navbar Session:", session);
      if (session?.user) {
        setUser(session.user);
        Cookies.set('user', JSON.stringify({ email: session.user.email }), { expires: 7, path: '/' });
      } else {
        setUser(null);
        Cookies.remove('user');
      }
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🟡 Auth State Changed:", event);
      if (session?.user) {
        setUser(session.user);
        Cookies.set('user', JSON.stringify({ email: session.user.email }), { expires: 7, path: '/' });
      } else {
        setUser(null);
        Cookies.remove('user');
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [supabase]);

  // ⛔ Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    Cookies.remove('user');
    router.push('/');
  };

  return (
    <nav className="fixed w-full z-50 bg-zinc-950 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
          AI Store Assistant
        </Link>

        <div className="flex items-center space-x-4">
          <Link href="/pricing" className="hover:text-purple-400">Pricing</Link>
          <Link href="/dashboard" className="hover:text-purple-400">Dashboard</Link>

          {/* 🌙 Theme toggle */}
          <button onClick={toggleDarkMode}>
            {dark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </button>

          {/* 🔁 Conditional buttons */}
          {user ? (
            <>
              <span className="text-sm text-purple-400 hidden sm:inline">{user.email}</span>
              <button
                onClick={handleLogout}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg text-sm">
                Login
              </Link>
              <Link href="/register" className="border border-purple-400 hover:bg-purple-700 text-purple-300 hover:text-white px-3 py-1 rounded-lg text-sm">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
