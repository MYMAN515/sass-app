'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default function LoginPage() {
  const router = useRouter();
  const [formType, setFormType] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createBrowserSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        console.log('🔐 User already logged in:', session.user.email);
        router.replace('/dashboard');
      }
      setCheckingSession(false);
    };
    checkSession();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('🚀 Submitting form:', { formType, email, password, name });

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, type: formType }),
      });

      const data = await res.json();

      console.log('📦 API response:', data);

      if (!res.ok) throw new Error(data.error || 'Login/Registration failed');

      if (formType === 'register') {
        alert('✅ Registration successful. Please verify your email.');
      } else {
        Cookies.set('user', JSON.stringify({ email: data.user.email }), {
          expires: 7,
          path: '/',
        });
        router.replace('/dashboard');
      }
    } catch (err) {
      console.error('❌ Error:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) return null; // Prevents UI flashing while checking session

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black">
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-lg w-full max-w-md space-y-6">
        <h2 className="text-3xl font-extrabold text-center text-zinc-800 dark:text-white">
          {formType === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {formType === 'register' && (
            <div>
              <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">Full Name</label>
              <input
                type="text"
                className="w-full p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">Email</label>
            <input
              type="email"
              className="w-full p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-600 dark:text-zinc-300 mb-1">Password</label>
            <input
              type="password"
              className="w-full p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition"
          >
            {loading
              ? formType === 'login'
                ? 'Logging in...'
                : 'Registering...'
              : formType === 'login'
              ? 'Log In'
              : 'Register'}
          </button>
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

        <p className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
          {formType === 'login' ? (
            <>
              Don’t have an account?{' '}
              <button
                onClick={() => setFormType('register')}
                className="text-purple-600 dark:text-purple-400 font-semibold underline"
              >
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setFormType('login')}
                className="text-purple-600 dark:text-purple-400 font-semibold underline"
              >
                Log In
              </button>
            </>
          )}
        </p>

        {error && <p className="text-red-600 text-sm text-center">❌ {error}</p>}
      </div>
    </div>
  );
}
