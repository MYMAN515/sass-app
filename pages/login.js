'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // ✅ Prevent already logged-in users from accessing /login
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        router.replace('/dashboard');
      }
    };
    checkSession();
  }, [router, supabase]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) throw new Error(loginError.message);

      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-900 via-indigo-800 to-purple-900 flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-8 space-y-6 relative"
      >
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 text-sm text-purple-600 dark:text-purple-300 hover:underline"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-extrabold text-center text-zinc-900 dark:text-white">
          Welcome Back <span className="inline-block animate-wiggle">👋</span>
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition"
          >
            Login
          </button>
          {error && (
            <p className="text-red-500 text-center font-medium mt-2">{error}</p>
          )}
        </form>

        <div className="flex items-center justify-center gap-2">
          <span className="h-px bg-zinc-300 dark:bg-zinc-700 w-1/4" />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">or continue with</span>
          <span className="h-px bg-zinc-300 dark:bg-zinc-700 w-1/4" />
        </div>

        <button
          onClick={() => (window.location.href = '/api/login-with-google')}
          className="w-full flex items-center justify-center gap-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 hover:shadow-md transition py-3 rounded-xl"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5"
          />
          <span className="text-sm font-medium text-zinc-700 dark:text-white">
            Sign in with Google
          </span>
        </button>
      </motion.div>
    </main>
  );
}
