import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Head from 'next/head';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (form.password !== form.confirm) {
    setError('Passwords do not match');
    return;
  }

  setLoading(true);
  setError('');

  try {
    // Register
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    // Auto-login after successful registration
    const loginRes = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
      }),
    });

    const loginData = await loginRes.json();

    if (!loginRes.ok) {
      throw new Error(loginData.error || 'Auto login failed');
    }

    // ✅ Redirect to protected dashboard
    window.location.href = '/dashboard';
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
      <div className="min-h-screen bg-white dark:bg-zinc-900 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white dark:bg-zinc-800 p-8 rounded-xl shadow-xl"
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
            Create an Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="name"
              placeholder="Full Name"
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-transparent text-gray-900 dark:text-white"
              value={form.name}
              onChange={handleChange}
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-transparent text-gray-900 dark:text-white"
              value={form.email}
              onChange={handleChange}
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-transparent text-gray-900 dark:text-white"
              value={form.password}
              onChange={handleChange}
              required
            />
            <input
              name="confirm"
              type="password"
              placeholder="Confirm Password"
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-transparent text-gray-900 dark:text-white"
              value={form.confirm}
              onChange={handleChange}
              required
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-semibold"
            >
              {loading ? 'Creating...' : 'Register'}
            </motion.button>
          </form>

          <p className="text-sm text-center mt-4 text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="text-purple-600 hover:underline dark:text-purple-400">
              Login
            </Link>
          </p>
        </motion.div>
      </div>
    </>
  );
}
