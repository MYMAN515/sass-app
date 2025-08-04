'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) router.replace('/dashboard');
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
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
        {/* زر الرجوع */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 text-sm text-purple-600 dark:text-purple-300 hover:underline"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-extrabold text-center text-zinc-900 dark:text-white">
          Login to AI Store Assistant
        </h1>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
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

        {/* Divider */}
        <div className="flex items-center justify-center gap-2">
          <span className="h-px bg-zinc-300 dark:bg-zinc-700 w-1/4" />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">or continue with</span>
          <span className="h-px bg-zinc-300 dark:bg-zinc-700 w-1/4" />
        </div>

        {/* Google Login */}
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
<<<<<<< HEAD
}
=======
}
>>>>>>> 292c6fba (New Front-end | Back-End|)
