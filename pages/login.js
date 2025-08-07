import { useState } from 'react';

export default function AuthPage() {
  const [mode, setMode] = useState('login'); // 'login' أو 'register'
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Loading...');

    const formData = {};
    new FormData(e.target).forEach((v, k) => formData[k] = v);
    formData.action = mode;

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    }).then(r => r.json());

    if (res.error) setStatus('❌ ' + res.error);
    else setStatus('✅ ' + (mode === 'login' ? 'Logged in!' : 'Registered!'));
  };

  return (
    <div className="container mx-auto max-w-md mt-24 p-6 border rounded">
      <h1 className="text-2xl font-bold mb-4">{mode === 'login' ? 'Login' : 'Register'}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && <input name="name" placeholder="Name" required className="w-full border p-2" />}
        <input name="email" type="email" placeholder="Email" required className="w-full border p-2" />
        <input name="password" type="password" placeholder="Password" required className="w-full border p-2" />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
          {mode === 'login' ? 'Login' : 'Register'}
        </button>
      </form>
      <p className="mt-4">{status}</p>
      <button className="mt-3 text-blue-500 underline" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
        Switch to {mode === 'login' ? 'Register' : 'Login'}
      </button>
    </div>
  );
}
