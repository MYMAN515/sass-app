// ✅ STEP 1: /login page with no redirect unless login happens
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import Cookies from 'js-cookie';
import { motion } from 'framer-motion';

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
      else router.push('/dashboard');
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        },
      });
      if (error) setError(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });
    if (error) setError(error.message);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-800 text-white px-4">
      <div className="w-full max-w-md bg-zinc-850 p-8 rounded-2xl shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 text-center">
          {isLogin ? 'Welcome Back' : 'Create Your Account'}
        </h2>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              className="w-full p-3 rounded bg-zinc-700 placeholder-gray-300"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded bg-zinc-700 placeholder-gray-300"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded bg-zinc-700 placeholder-gray-300"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {!isLogin && (
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full p-3 rounded bg-zinc-700 placeholder-gray-300"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          )}
          {!isLogin && (
            <label className="flex items-center text-sm text-gray-300">
              <input type="checkbox" className="mr-2" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              I agree to the <a href="/terms" className="underline mx-1">Terms</a> & <a href="/privacy" className="underline">Privacy</a>
            </label>
          )}
          <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 transition-colors text-white p-3 rounded-xl mt-2">
            {isLogin ? 'Log In' : 'Register'}
          </button>
        </form>

        <div className="flex items-center my-4">
          <div className="flex-grow h-px bg-zinc-600"></div>
          <span className="mx-3 text-gray-400 text-sm">OR</span>
          <div className="flex-grow h-px bg-zinc-600"></div>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={handleGoogleLogin}
          className="w-full bg-white text-black font-semibold rounded-xl px-4 py-3 flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </motion.button>

        <div className="text-center text-sm text-gray-400 mt-6">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button className="text-purple-400 hover:underline ml-1" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Register' : 'Log In'}
          </button>
        </div>
      </div>
    </div>
  );
}
