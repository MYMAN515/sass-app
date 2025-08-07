'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

export default function AuthPage() {
  const router = useRouter();
  const [formType, setFormType] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = Cookies.get('user');
    if (user) {
      router.replace('/dashboard');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
          type: formType,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed');

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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {formType === 'login' ? 'Log In' : 'Register'}
        </h2>

        <form onSubmit={handleSubmit}>
          {formType === 'register' && (
            <>
              <label className="block mb-2 text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                className="w-full p-2 mb-4 border border-gray-300 rounded"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </>
          )}

          <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            className="w-full p-2 mb-4 border border-gray-300 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="block mb-2 text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            className="w-full p-2 mb-4 border border-gray-300 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
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

        <p className="mt-4 text-center text-sm">
          {formType === 'login' ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => setFormType('register')}
                className="text-blue-600 font-semibold underline"
              >
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setFormType('login')}
                className="text-blue-600 font-semibold underline"
              >
                Log In
              </button>
            </>
          )}
        </p>

        {error && (
          <p className="text-red-600 text-sm mt-4 text-center">❌ {error}</p>
        )}
      </div>
    </div>
  );
}
