'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        Cookies.set('user', JSON.stringify({ email: session.user.email }), { expires: 7 });
        router.replace('/dashboard');
      }
    };
    checkUser();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
    } else {
      Cookies.set('user', JSON.stringify({ email }), { expires: 7 });
      router.replace('/dashboard');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-900 text-white">
      <form onSubmit={handleLogin} className="bg-white/10 p-8 rounded-xl w-full max-w-md shadow-xl space-y-4">
        <h1 className="text-2xl font-bold text-center">Login</h1>
        <input
          className="w-full p-3 rounded bg-black/20 text-white placeholder-gray-300 focus:outline-none"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full p-3 rounded bg-black/20 text-white placeholder-gray-300 focus:outline-none"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-red-400">{error}</p>}
        <button type="submit" className="bg-indigo-600 w-full py-2 rounded hover:bg-indigo-700 transition">
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
