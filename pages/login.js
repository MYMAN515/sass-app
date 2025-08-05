'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) router.replace('/dashboard');
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      Cookies.set('user', JSON.stringify(data.user), { expires: 7, path: '/' });
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-indigo-900 to-purple-950 flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl shadow-xl p-10 space-y-6 relative backdrop-blur-md"
      >
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 text-sm text-purple-400 hover:underline"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-extrabold text-center text-white tracking-tight">
          Welcome Back 👋
        </h1>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-3 rounded-xl bg-zinc-800 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-1">Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl bg-zinc-800 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Login'}
          </button>

          {error && (
            <p className="text-red-500 text-center font-medium mt-2 text-sm">{error}</p>
          )}
        </form>

        <div className="flex items-center justify-center gap-2">
          <span className="h-px bg-zinc-700 w-1/4" />
          <span className="text-xs text-zinc-500">or continue with</span>
          <span className="h-px bg-zinc-700 w-1/4" />
        </div>

        <button
          onClick={() => (window.location.href = '/api/login-with-google')}
          className="w-full flex items-center justify-center gap-3 bg-white dark:bg-zinc-800 border border-zinc-700 hover:shadow-md transition py-3 rounded-xl"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5"
          />
          <span className="text-sm font-medium text-zinc-800 dark:text-white">
            Sign in with Google
          </span>
        </button>
      </motion.div>
    </main>
  );
}
