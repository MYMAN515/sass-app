// pages/auth.js
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthPage() {
  const router = useRouter();

  // ✅ أنشئ عميل سوبر بيس مرة واحدة
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agreed, setAgreed] = useState(false);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ لو فيه جلسة، ما نعرض صفحة الأوث
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      if (session?.user) {
        router.replace('/dashboard');
      }
    })();
    return () => { mounted = false; };
  }, [router, supabase]);

  // ✅ أي تغيير حالة أوث (تسجيل دخول من جوجل/تفعيل إيميل) ننقل للدashboard
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // (اختياري) إنشاء صف في جدول Data لو ما كان موجود
        try {
          await supabase.from('Data').upsert(
            { email: session.user.email, plan: 'Free' },
            { onConflict: 'email' }
          );
        } catch { /* تجاهل */ }
        router.replace('/dashboard');
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [router, supabase]);

  const normalizeError = (err) => {
    const code = err?.message?.toLowerCase?.() || '';
    if (code.includes('invalid login') || code.includes('invalid email or password')) {
      return 'Invalid email or password.';
    }
    if (code.includes('email not confirmed') || code.includes('not confirmed')) {
      return 'Email not confirmed. Please check your inbox.';
    }
    if (code.includes('password')) {
      return 'Password error. Please try again.';
    }
    return err?.message || 'Something went wrong. Please try again.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!isLogin && !agreed) {
      setError('You must agree to the terms and privacy policy.');
      return;
    }
    if (!isLogin && password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInErr) throw signInErr;

        // onAuthStateChange سيمسك التحويل — ولكن نحط fallback:
        router.replace('/dashboard');
      } else {
        const redirectTo =
          (typeof window !== 'undefined'
            ? `${window.location.origin}/auth/callback`
            : `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`);

        const { error: signUpErr } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { name: name.trim() },
            emailRedirectTo: redirectTo,
          },
        });
        if (signUpErr) throw signUpErr;

        setSuccessMsg('Confirmation email sent! Please check your inbox.');
        setPassword('');
        setConfirm('');
        setAgreed(false);
      }
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      const redirectTo =
        (typeof window !== 'undefined'
          ? `${window.location.origin}/auth/callback`
          : `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`);

      const { error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: { prompt: 'select_account' },
        },
      });
      if (oauthErr) throw oauthErr;
      // سيتم التحويل تلقائياً لجوجل ثم يعود إلى /auth/callback
    } catch (err) {
      setError(normalizeError(err));
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccessMsg('');
    try {
      const { error: resendErr } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
      });
      if (resendErr) throw resendErr;
      setSuccessMsg('Verification email re-sent. Please check your inbox.');
    } catch (err) {
      setError(normalizeError(err));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-800 text-white px-4 py-10">
      <div className="w-full max-w-md bg-zinc-900/70 border border-zinc-700 p-8 rounded-2xl shadow-2xl backdrop-blur">
        <h2 className="text-3xl font-bold mb-6 text-center">
          {isLogin ? 'Welcome Back' : 'Create Your Account'}
        </h2>

        <AnimatePresence>
          {successMsg && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-emerald-400 text-sm mb-4 text-center"
            >
              {successMsg}
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-red-400 text-sm mb-4 text-center"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={isLogin ? 'current-password' : 'new-password'}
          />
          {!isLogin && (
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
            />
          )}
          {!isLogin && (
            <label className="flex items-center text-sm text-gray-300 select-none">
              <input
                type="checkbox"
                className="mr-2 accent-purple-600"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              I agree to the <a href="/terms" className="underline mx-1">Terms</a> & <a href="/privacy" className="underline">Privacy</a>
            </label>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 transition-colors text-white p-3 rounded-xl mt-2 disabled:opacity-60"
          >
            {loading ? 'Please wait…' : isLogin ? 'Log In' : 'Register'}
          </button>
        </form>

        {isLogin && (
          <div className="text-right mt-2">
            <button
              className="text-xs text-zinc-300 hover:text-white underline"
              onClick={async () => {
                if (!email) return setError('Enter your email above first.');
                try {
                  const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                    redirectTo:
                      (typeof window !== 'undefined'
                        ? `${window.location.origin}/auth/callback`
                        : `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`),
                  });
                  if (resetErr) throw resetErr;
                  setSuccessMsg('Password reset email sent.');
                } catch (err) {
                  setError(normalizeError(err));
                }
              }}
            >
              Forgot password?
            </button>
          </div>
        )}

        <div className="flex items-center my-4">
          <div className="flex-grow h-px bg-zinc-700" />
          <span className="mx-3 text-gray-400 text-sm">OR</span>
          <div className="flex-grow h-px bg-zinc-700" />
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white text-black font-semibold rounded-xl px-4 py-3 flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition disabled:opacity-60"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </motion.button>

        {!isLogin && (
          <div className="text-center text-xs text-gray-400 mt-3">
            Didn’t get the email?{' '}
            <button className="text-purple-400 hover:underline" onClick={handleResend}>
              Resend verification
            </button>
          </div>
        )}

        <div className="text-center text-sm text-gray-400 mt-6">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            className="text-purple-400 hover:underline ml-1"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccessMsg('');
            }}
          >
            {isLogin ? 'Register' : 'Log In'}
          </button>
        </div>
      </div>
    </div>
  );
}
