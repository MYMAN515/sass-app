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
    agree: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }

    if (!form.agree) {
      setError('You must agree to the Privacy Policy and Terms');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/verify-email`,
          data: {
            name: form.name,
          },
        },
      });

      if (signUpError) throw new Error(signUpError.message);

      // ✅ تم التسجيل بنجاح، التوجيه لصفحة التحقق من الإيميل
      router.push('/verify-email');
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
              className="w-full px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white"
              value={form.name}
              onChange={handleChange}
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white"
              value={form.email}
              onChange={handleChange}
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white"
              value={form.password}
              onChange={handleChange}
              required
            />
            <input
              name="confirm"
              type="password"
              placeholder="Confirm Password"
              className="w-full px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white"
              value={form.confirm}
              onChange={handleChange}
              required
            />

            {/* ✅ Privacy & Terms checkbox */}
            <div className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                name="agree"
                checked={form.agree}
                onChange={handleChange}
                className="mt-1 accent-purple-600"
                required
              />
              <label className="text-zinc-600 dark:text-zinc-300">
                I agree to the{' '}
                <a href="/privacy" target="_blank" className="text-purple-500 hover:underline">
                  Privacy Policy
                </a>{' '}
                and{' '}
                <a href="/terms" target="_blank" className="text-purple-500 hover:underline">
                  Terms of Service
                </a>
              </label>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !form.agree}
              className={`w-full py-3 rounded-xl font-semibold transition ${
                !form.agree
                  ? 'bg-zinc-400 cursor-not-allowed text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {loading ? 'Creating...' : 'Register'}
            </motion.button>
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

          <p className="text-sm text-center text-zinc-500 dark:text-zinc-400">
            Already have an account?{' '}
            <Link href="/login" className="text-purple-600 hover:underline dark:text-purple-300">
              Login
            </Link>
          </p>
        </motion.div>
      </main>
    </>
  );
}
