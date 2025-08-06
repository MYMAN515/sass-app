// app/verify-email.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { supabase } from '@/lib/supabaseClient';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes('access_token')) {
      setStatus('waiting');
      return;
    }

    const params = new URLSearchParams(hash.substring(1));
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');

    const verifyUser = async () => {
      try {
        setStatus('verifying');

        const { data, error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        if (error) throw error;

        const user = data.user;
        Cookies.set('user', JSON.stringify({ email: user.email }), { expires: 7 });

        // Save to DB
        await supabase.from('Data').upsert({
          user_id: user.id,
          email: user.email,
          name: user.user_metadata?.name || '',
          Provider: 'email',
          created_at: new Date().toISOString(),
          credits: 10,
          plan: 'Free',
        });

        setStatus('success');
        setTimeout(() => router.replace('/dashboard'), 1500);
      } catch (err) {
        console.error(err);
        setError('❌ Failed to verify your email.');
        setStatus('error');
      }
    };

    verifyUser();
  }, [router]);

  const getMessage = () => {
    switch (status) {
      case 'waiting':
        return '✅ Check your email to confirm your account.';
      case 'verifying':
        return '⏳ Verifying your email...';
      case 'success':
        return '🎉 Verified! Redirecting...';
      case 'error':
        return error;
      default:
        return 'Loading...';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white text-center px-4">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-xl max-w-md w-full space-y-4">
        <h1 className="text-2xl font-bold">Email Verification</h1>
        <p>{getMessage()}</p>
      </div>
    </div>
  );
}
