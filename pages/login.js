// pages/index.js  (for Next.js Pages Router)
// If using Next.js 13+ App Router, add "use client" at the top and export a default function component similarly.
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with anon public key (ensure env vars are set)
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function AuthPage() {
  // Form state
  const [authMode, setAuthMode] = useState('login');  // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');  // only used in register mode
  const [password, setPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState('');  // status message to user

  // Switch between Login and Register mode
  const toggleMode = () => {
    // reset state and messages when toggling
    setStatusMsg('');
    setEmail(''); setPassword(''); setConfirmEmail('');
    setAuthMode(authMode === 'login' ? 'register' : 'login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg('');  // clear previous messages

    // Basic validation
    if (!email || !password) {
      setStatusMsg('❌ Please fill in all required fields.');
      return;
    }
    // If registering, check confirm email and password length
    if (authMode === 'register') {
      const emailPattern = /\S+@\S+\.\S+/;
      if (!emailPattern.test(email)) {
        setStatusMsg('❌ Invalid email address.');
        return;
      }
      if (email !== confirmEmail) {
        setStatusMsg('❌ Emails do not match.');
        return;
      }
      if (password.length < 6) {
        setStatusMsg('❌ Password must be at least 6 characters.');
        return;
      }
      // Attempt to sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Store initial credits in user metadata
          data: { credits: 5 }
        }
      });
      if (error) {
        setStatusMsg(`❌ ${error.message}`);
      } else {
        // Sign-up successful
        setStatusMsg('✅ Registered!');  // or add further guidance like "You can now log in."
        // Optionally, you could automatically switch to login mode or redirect to app.
      }
    } else {
      // Attempt to log in the user
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setStatusMsg(`❌ ${error.message}`);  // e.g. "Invalid login credentials"
      } else {
        setStatusMsg('✅ Logged in successfully!');
        // TODO: Redirect to a protected page or reload as logged-in.
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center mb-6">
          {authMode === 'login' ? 'Log In to Your Account' : 'Register a New Account'}
        </h2>
        <form onSubmit={handleSubmit} noValidate>
          {/* Email field */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1" htmlFor="email">
              Email
            </label>
            <input 
              id="email" 
              type="email" 
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          {/* Confirm Email field (only in Register mode) */}
          {authMode === 'register' && (
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1" htmlFor="confirmEmail">
                Confirm Email
              </label>
              <input 
                id="confirmEmail" 
                type="email" 
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={confirmEmail} 
                onChange={(e) => setConfirmEmail(e.target.value)} 
                required 
              />
            </div>
          )}
          {/* Password field */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-1" htmlFor="password">
              Password
            </label>
            <input 
              id="password" 
              type="password" 
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              minLength={6}
            />
          </div>
          {/* Submit button */}
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white font-medium rounded-lg py-2 hover:bg-blue-700 transition-colors"
          >
            {authMode === 'login' ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        {/* Toggle link and status message */}
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
