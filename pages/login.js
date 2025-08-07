'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import Cookies from 'js-cookie';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        Cookies.set('user', JSON.stringify({ email: session.user.email }), { expires: 7, path: '/' });
        router.replace('/dashboard');
      } else {
        setCheckingSession(false);
      }
    };
    checkSession();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          type: 'login',
        }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Login failed');

      // Store session info in cookies (optional)
      Cookies.set('user', JSON.stringify({ email: data.user.email }), { expires: 7, path: '/' });

      router.replace('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) return null;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-zinc-900">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-800 p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center text-zinc-800 dark:text-white">Welcome Back</h2>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <label className="block mb-2 text-sm text-zinc-700 dark:text-zinc-300">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
        />

        <label className="block mt-4 mb-2 text-sm text-zinc-700 dark:text-zinc-300">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full bg-purple-600 text-white py-2 rounded-xl hover:bg-purple-700 transition"
        >
          {loading ? 'Loading...' : 'Log In'}
        </button>
      </form>
    </div>
  );
}
