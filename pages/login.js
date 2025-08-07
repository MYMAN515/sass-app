'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import Cookies from 'js-cookie';
import { motion } from 'framer-motion';
import { MailIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/solid';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) router.replace('/');
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        Cookies.set('user', JSON.stringify({ email: session.user.email }), { expires: 7 });
        router.replace('/');
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe?.();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin && !agreed) {
      setError('You must agree to the terms and privacy policy.');
      return;
    }

    if (!isLogin && password !== confirm) {
      setError("Passwords don't match");
      return;
    }

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
      if (error) setError(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-800 text-white px-4">
      <motion.div
        className="w-full max-w-md bg-zinc-850 p-8 rounded-3xl shadow-2xl border border-zinc-700"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-extrabold mb-6 text-center tracking-tight">
          {isLogin ? 'Welcome Back 👋' : 'Join the Future 🚀'}
        </h2>

        {error && (
          <motion.p
            className="text-red-500 text-sm mb-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <UserIcon className="absolute left-3 top-3 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                placeholder="Full Name"
                className="w-full p-3 pl-10 rounded-xl bg-zinc-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="relative">
            <MailIcon className="absolute left-3 top-3 w-5 h-5 text-zinc-400" />
            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 pl-10 rounded-xl bg-zinc-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <LockClosedIcon className="absolute left-3 top-3 w-5 h-5 text-zinc-400" />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 pl-10 rounded-xl bg-zinc-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {!isLogin && (
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-3 w-5 h-5 text-zinc-400" />
              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full p-3 pl-10 rounded-xl bg-zinc-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>
          )}

          {!isLogin && (
            <label className="flex items-center text-sm text-gray-300 mt-1">
              <input
                type="checkbox"
                className="mr-2 accent-purple-600"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              I agree to the <a href="/terms" className="underline mx-1">Terms</a> & <a href="/privacy" className="underline">Privacy</a>
            </label>
          )}

          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 transition-colors text-white p-3 rounded-xl mt-2 font-semibold tracking-wide"
          >
            {isLogin ? 'Log In' : 'Create Account'}
          </motion.button>
        </form>

        <div className="text-center text-sm text-gray-400 mt-6">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            className="text-purple-400 hover:underline ml-1 font-medium"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Register' : 'Log In'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
