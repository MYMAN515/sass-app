// pages/auth.js
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

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
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-gradient-to-br from-[#09090b] via-zinc-900 to-[#111827] px-4 py-16 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 right-10 h-64 w-64 rounded-full bg-purple-600/30 blur-3xl" />
        <div className="absolute bottom-0 left-10 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.04),_transparent_45%)]" />
      </div>

      <div className="relative mx-auto w-full max-w-5xl rounded-3xl border border-white/5 bg-zinc-900/70 shadow-2xl backdrop-blur-xl">
        <div className="grid gap-0 lg:grid-cols-[1.05fr,1fr]">
          <div className="hidden flex-col justify-between border-b border-white/5 bg-gradient-to-br from-zinc-900/80 via-zinc-900/40 to-zinc-900/20 p-10 lg:flex">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-zinc-400">Powered by AI</p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight">
                {isLogin ? 'Log in to continue crafting stunning visuals.' : 'Create an account and transform your creative workflow.'}
              </h1>
              <p className="mt-4 max-w-sm text-base text-zinc-300">
                Access our suite of AI-assisted tools, collaborate with your team, and stay in sync with your projects from a single dashboard.
              </p>
            </div>

            <div className="space-y-4">
              {["Smart background removal", "Realtime collaboration", "Secure cloud storage"].map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                    ✓
                  </span>
                  <p className="text-sm text-zinc-200">{feature}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-white/5 bg-black/40 p-4">
              <p className="text-sm text-zinc-300">
                “Everything about this platform feels effortless. The new dashboard gives us a bird’s eye view of all campaigns in seconds.”
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full border border-white/10 bg-zinc-800" />
                <div>
                  <p className="text-sm font-medium text-white">Avery Collins</p>
                  <p className="text-xs text-zinc-400">Creative Director, Boldframe</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center p-8 sm:p-12">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-zinc-400">Account Access</p>
                  <h2 className="mt-2 text-3xl font-semibold text-white">
                    {isLogin ? 'Welcome back' : 'Create your account'}
                  </h2>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs text-zinc-300">
                  <span className="font-semibold text-purple-300">Beta</span> Access
                </div>
              </div>

              <LayoutGroup>
                <div className="flex rounded-full border border-white/10 bg-black/40 p-1 text-sm font-medium text-zinc-400">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(true);
                      setError('');
                      setSuccessMsg('');
                    }}
                    className={`relative flex w-1/2 items-center justify-center gap-2 rounded-full px-4 py-2 transition ${
                      isLogin ? 'text-white' : ''
                    }`}
                  >
                    {isLogin && (
                      <motion.span
                        layoutId="auth-toggle"
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/80 to-purple-600/80 shadow-lg"
                        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
                      />
                    )}
                    <span className="relative">Log in</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(false);
                      setError('');
                      setSuccessMsg('');
                    }}
                    className={`relative flex w-1/2 items-center justify-center gap-2 rounded-full px-4 py-2 transition ${
                      !isLogin ? 'text-white' : ''
                    }`}
                  >
                    {!isLogin && (
                      <motion.span
                        layoutId="auth-toggle"
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/80 to-purple-600/80 shadow-lg"
                        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
                      />
                    )}
                    <span className="relative">Register</span>
                  </button>
                </div>
              </LayoutGroup>

              <AnimatePresence>
                {successMsg && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
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
                    className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <label className="block text-sm">
                    <span className="mb-1 block text-xs uppercase tracking-wide text-zinc-400">Full name</span>
                    <input
                      type="text"
                      placeholder="Avery Collins"
                      className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/70"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </label>
                )}

                <label className="block text-sm">
                  <span className="mb-1 block text-xs uppercase tracking-wide text-zinc-400">Email address</span>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/70"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </label>

                <label className="block text-sm">
                  <span className="mb-1 block text-xs uppercase tracking-wide text-zinc-400">Password</span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/70"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                  />
                </label>

                {!isLogin && (
                  <label className="block text-sm">
                    <span className="mb-1 block text-xs uppercase tracking-wide text-zinc-400">Confirm password</span>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/70"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                  </label>
                )}

                {!isLogin && (
                  <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-xs text-zinc-300">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-purple-500"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                    />
                    <span>
                      I agree to the{' '}
                      <a href="/terms" className="text-purple-300 underline-offset-2 hover:underline">
                        Terms
                      </a>{' '}
                      &{' '}
                      <a href="/privacy" className="text-purple-300 underline-offset-2 hover:underline">
                        Privacy Policy
                      </a>
                    </span>
                  </label>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-500 px-4 py-3 text-base font-semibold text-white shadow-lg transition focus:outline-none focus:ring-2 focus:ring-purple-400/80 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="absolute inset-0 translate-y-full bg-white/10 transition-transform duration-500 group-hover:translate-y-0" />
                  <span className="relative">{loading ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'}</span>
                </button>
              </form>

              {isLogin && (
                <div className="flex justify-end text-xs text-zinc-400">
                  <button
                    className="rounded-full px-3 py-2 text-purple-300 transition hover:text-purple-200"
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

              <div className="relative py-2">
                <div className="flex items-center gap-3">
                  <span className="h-px flex-1 bg-white/10" />
                  <span className="text-xs uppercase tracking-[0.4em] text-zinc-500">Or</span>
                  <span className="h-px flex-1 bg-white/10" />
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/90 px-4 py-3 text-base font-semibold text-zinc-900 shadow-lg transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5" />
                Continue with Google
              </motion.button>

              {!isLogin && (
                <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-xs text-zinc-300">
                  Didn’t get the email?{' '}
                  <button className="text-purple-300 underline-offset-2 hover:underline" onClick={handleResend}>
                    Resend verification
                  </button>
                </div>
              )}

              <div className="text-center text-sm text-zinc-400">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                <button
                  className="text-purple-300 underline-offset-4 hover:underline"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                    setSuccessMsg('');
                  }}
                >
                  {isLogin ? 'Register' : 'Log in'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
