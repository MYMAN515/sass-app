// pages/auth.js
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthPage() {
  const router = useRouter();

  // ✅ أنشئ عميل سوبر بيس مرة واحدة
  const supabase = useMemo(() => createPagesBrowserClient(), []);

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      <div className="pointer-events-none absolute inset-x-0 top-[-25rem] z-0 flex justify-center blur-3xl">
        <div className="h-[36rem] w-[36rem] rounded-full bg-gradient-to-br from-purple-500 via-fuchsia-500 to-sky-500 opacity-30" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-16 sm:px-8 lg:px-12">
        <div className="grid w-full gap-10 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_70px_-25px_rgba(59,130,246,0.3)] backdrop-blur-xl lg:grid-cols-[1.15fr,1fr] lg:p-10">
          <section className="hidden flex-col justify-between rounded-2xl bg-gradient-to-br from-slate-900/40 via-slate-900/20 to-slate-900/60 p-10 lg:flex">
            <div>
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-200">
                {isLogin ? 'Welcome back' : 'Join the community'}
              </span>
              <h2 className="mt-6 text-3xl font-semibold leading-tight text-white">
                {isLogin ? 'Sign in to pick up where you left off.' : 'Create an account to unlock premium creative tools.'}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-200/80">
                Manage your projects, collaborate with your team, and explore AI-powered features tailored for designers and creators.
              </p>
            </div>

            <ul className="mt-10 space-y-5 text-sm text-slate-100/90">
              {["Seamless syncing across devices", 'Advanced AI image tooling', 'Priority support from experts'].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-lg">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-12 text-xs text-slate-200/70">
              Need an enterprise plan?{' '}
              <a href="/pricing" className="font-semibold text-sky-300 hover:text-sky-200">
                Contact our sales team
              </a>
            </div>
          </section>

          <section className="flex flex-col justify-center gap-6 rounded-2xl bg-slate-950/60 p-6 shadow-inner shadow-black/10 sm:p-8">
            <div className="flex flex-col gap-4 text-center">
              <div className="inline-flex self-center rounded-full border border-white/10 bg-white/5 p-1 text-xs font-medium">
                <button
                  type="button"
                  className={`rounded-full px-4 py-2 transition ${
                    isLogin
                      ? 'bg-white text-slate-900 shadow'
                      : 'text-slate-200 hover:text-white'
                  }`}
                  onClick={() => {
                    setIsLogin(true);
                    setError('');
                    setSuccessMsg('');
                  }}
                >
                  Log In
                </button>
                <button
                  type="button"
                  className={`rounded-full px-4 py-2 transition ${
                    !isLogin
                      ? 'bg-white text-slate-900 shadow'
                      : 'text-slate-200 hover:text-white'
                  }`}
                  onClick={() => {
                    setIsLogin(false);
                    setError('');
                    setSuccessMsg('');
                  }}
                >
                  Register
                </button>
              </div>

              <div>
                <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                  {isLogin ? 'Welcome back!' : 'Create your account'}
                </h1>
                <p className="mt-2 text-sm text-slate-300">
                  {isLogin
                    ? 'Enter your credentials to access your dashboard.'
                    : 'Set up your profile to start creating stunning visuals.'}
                </p>
              </div>
            </div>

            <AnimatePresence>
              {successMsg && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
                  role="status"
                >
                  {successMsg}
                </motion.p>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
                  role="alert"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <label className="block text-left text-sm">
                  <span className="mb-2 block text-slate-200">Full name</span>
                  <input
                    type="text"
                    placeholder="Jane Doe"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder-slate-400 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </label>
              )}

              <label className="block text-left text-sm">
                <span className="mb-2 block text-slate-200">Email address</span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder-slate-400 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </label>

              <label className="block text-left text-sm">
                <span className="mb-2 block text-slate-200">Password</span>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-12 text-base text-white placeholder-slate-400 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-xs font-medium text-slate-300 hover:text-white"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </label>

              {!isLogin && (
                <label className="block text-left text-sm">
                  <span className="mb-2 block text-slate-200">Confirm password</span>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Repeat password"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-12 text-base text-white placeholder-slate-400 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-xs font-medium text-slate-300 hover:text-white"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                    >
                      {showConfirmPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </label>
              )}

              {!isLogin && (
                <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-left text-xs text-slate-300">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-white/20 bg-transparent accent-sky-400"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                  />
                  <span>
                    I agree to the
                    <a href="/privacy-terms" className="mx-1 font-semibold text-sky-300 hover:text-sky-200">
                      Privacy & Terms
                    </a>
                    of service.
                  </span>
                </label>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-sky-500 to-fuchsia-500 px-4 py-3 text-base font-semibold text-white shadow-lg transition focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="relative z-10">{loading ? 'Please wait…' : isLogin ? 'Log In' : 'Create account'}</span>
                <span className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-500 ease-out group-hover:translate-x-0" aria-hidden="true" />
              </button>
            </form>

            {isLogin && (
              <div className="text-right text-xs text-slate-400">
                <button
                  className="font-medium text-sky-300 hover:text-sky-200"
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
                  Forgot your password?
                </button>
              </div>
            )}

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <div className="h-px flex-1 bg-white/10" />
              <span>Or continue with</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white text-slate-900 px-4 py-3 font-semibold shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5" />
              Google
            </motion.button>

            {!isLogin && (
              <div className="text-center text-xs text-slate-400">
                Didn’t get the email?
                <button className="ml-1 font-semibold text-sky-300 hover:text-sky-200" onClick={handleResend}>
                  Resend verification
                </button>
              </div>
            )}

            <div className="text-center text-sm text-slate-400">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button
                className="ml-2 font-semibold text-sky-300 hover:text-sky-200"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setSuccessMsg('');
                }}
              >
                {isLogin ? 'Create one' : 'Log in'}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
