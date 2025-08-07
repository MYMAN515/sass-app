'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import Cookies from 'js-cookie';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  // ✅ تابع التحقق من الجلسة بعد التفعيل من الإيميل أو تسجيل الدخول
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        router.replace('/'); // أو dashboard حسب ما تريد
      }
    });

    // ✅ راقب التغيير بالحالة (بدون polling)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          Cookies.set('user', JSON.stringify({ email: session.user.email }), { expires: 7 });
          router.replace('/home'); // أو dashboard
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe?.();
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      // سيتم التوجيه تلقائيًا في onAuthStateChange
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-900 text-white">
      <div className="w-full max-w-md bg-zinc-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Welcome Back</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            className="w-full mb-3 p-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full mb-4 p-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white p-2 rounded"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}
