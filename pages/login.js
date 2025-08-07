import { useState } from 'react';

export default function AuthPage() {
  const [mode, setMode] = useState('login'); // login or register
  const [status, setStatus] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const validateEmail = (email) => {
    const regex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    return regex.test(email);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('⏳ Processing...');

    if (!validateEmail(form.email)) {
      setStatus('❌ Invalid email format (e.g. user@example.com)');
      return;
    }

    const body = {
      ...form,
      action: mode,
    };

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.error) {
        setStatus('❌ ' + data.error);
      } else {
        setStatus('✅ ' + (mode === 'login' ? 'Logged in successfully!' : 'Registered successfully!'));
      }
    } catch (err) {
      console.error('Network error:', err);
      setStatus('❌ Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D0D2B] text-white">
      <div className="bg-[#151538] p-8 rounded-md w-full max-w-md shadow-lg border border-white/10">
        <h1 className="text-2xl font-semibold mb-6 text-center">
          {mode === 'login' ? 'Login' : 'Register'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full Name"
              required
              className="w-full p-3 rounded bg-white text-black"
            />
          )}
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            required
            className="w-full p-3 rounded bg-white text-black"
          />
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            required
            className="w-full p-3 rounded bg-white text-black"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 transition text-white p-3 rounded font-semibold"
          >
            {mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>

        {status && (
          <p className={`mt-4 text-sm ${status.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>
            {status}
          </p>
        )}

        <button
          className="mt-6 block mx-auto text-sm text-blue-400 hover:underline"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login');
            setStatus('');
          }}
        >
          {mode === 'login' ? 'Switch to Register' : 'Switch to Login'}
        </button>
      </div>
    </div>
  );
}
