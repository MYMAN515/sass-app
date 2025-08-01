'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (form.password !== form.confirm) {
    setError('Passwords do not match');
    return;
  }

  setLoading(true);
  setError('');

  try {
    // ✅ Step 1: Sign up
    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (signUpError) throw new Error(signUpError.message);

    // ✅ Step 2: Immediately login to get access_token
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (loginError) throw new Error('Login failed after signup');

    const token = loginData?.session?.access_token;
    if (!token) throw new Error('Failed to get session token');

    // ✅ Step 3: Send to backend API
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');

    window.location.href = '/dashboard';
  } catch (err) {
    setError(err.message || 'Registration failed. Try again.');
  } finally {
    setLoading(false);
  }
};


  return (
    <>
      <Head>
        <title>Register - AI Store Assistant</title>
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-zinc-900 via-indigo-800 to-purple-900 flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-8 space-y-6 relative"
        >
          <button
            onClick={() => router.back()}
            className="absolute top-4 left-4 text-sm text-purple-600 dark:text-purple-300 hover:underline"
          >
            ← Back
          </button>

          <h2 className="text-3xl font-bold text-center text-zinc-900 dark:text-white">
            Create your account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="name"
              placeholder="Full Name"
              className="w-full px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={form.name}
              onChange={handleChange}
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={form.email}
              onChange={handleChange}
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={form.password}
              onChange={handleChange}
              required
            />
            <input
              name="confirm"
              type="password"
              placeholder="Confirm Password"
              className="w-full px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={form.confirm}
              onChange={handleChange}
              required
            />

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition"
            >
              {loading ? 'Creating...' : 'Register'}
            </motion.button>
          </form>

          <div className="flex items-center justify-center gap-2">
            <span className="h-px bg-zinc-300 dark:bg-zinc-700 w-1/4" />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              or continue with
            </span>
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

          <p className="text-sm text-center text-zinc-500 dark:text-zinc-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-purple-600 hover:underline dark:text-purple-300"
            >
              Login
            </Link>
          </p>
        </motion.div>
      </main>
    </>
  );
}
