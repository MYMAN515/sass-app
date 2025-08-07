// pages/index.js
'use client';

import { useState } from 'react';

export default function AuthPage() {
  const [authMode, setAuthMode] = useState('register'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const toggleMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
    setStatusMsg('');
    setEmail('');
    setConfirmEmail('');
    setPassword('');
    setName('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanConfirm = confirmEmail.trim().toLowerCase();

    if (!cleanEmail || !password || (authMode === 'register' && (!cleanConfirm || !name))) {
      return setStatusMsg('❌ Please fill in all fields.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return setStatusMsg(`❌ Email address "${cleanEmail}" is invalid`);
    }

    if (authMode === 'register') {
      if (cleanEmail !== cleanConfirm) {
        return setStatusMsg('❌ Emails do not match.');
      }

      if (password.length < 6) {
        return setStatusMsg('❌ Password must be at least 6 characters.');
      }
    }

    // ✅ Call our custom API instead of direct supabase
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: authMode,
          email: cleanEmail,
          password,
          name,
        }),
      });

      const result = await res.json();

      if (!result.success) {
        setStatusMsg(`❌ ${result.error}`);
      } else {
        if (authMode === 'register') {
          setStatusMsg('✅ Registered successfully! Please check your email.');
        } else {
          setStatusMsg('✅ Logged in successfully!');
          // Redirect to dashboard (if needed):
          window.location.href = '/dashboard';
        }
      }
    } catch (error) {
      setStatusMsg('❌ An unexpected error occurred.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center mb-6">
          {authMode === 'login' ? 'Log In to Your Account' : 'Register a New Account'}
        </h2>

        <form onSubmit={handleSubmit} noValidate>
          {authMode === 'register' && (
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">Full Name</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {authMode === 'register' && (
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1" htmlFor="confirmEmail">Confirm Email</label>
              <input
                id="confirmEmail"
                type="email"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                required
              />
            </div>
          )}

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-1" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-medium rounded-lg py-2 hover:bg-blue-700 transition"
          >
            {authMode === 'login' ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          {authMode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button onClick={toggleMode} className="text-blue-600 hover:underline">Register</button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button onClick={toggleMode} className="text-blue-600 hover:underline">Log in</button>
            </p>
          )}
        </div>

        {statusMsg && (
          <div className={`mt-4 text-center font-medium ${statusMsg.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
            {statusMsg}
          </div>
        )}
      </div>
    </div>
  );
}
