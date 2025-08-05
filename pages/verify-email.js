'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '@/lib/supabaseClient';
import Cookies from 'js-cookie';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const hash = window.location.hash;

    if (!hash || !hash.includes('access_token')) {
      setStatus('waiting');
      return;
    }

    const params = new URLSearchParams(hash.substring(1));
    const access_token = params.get('access_token');
    const type = params.get('type'); // optional: can be "signup"

    const loginWithToken = async () => {
      try {
        setStatus('verifying');

        const { data, error } = await supabase.auth.setSession({
          access_token,
          refresh_token: '', // optional
        });

        if (error) throw error;

        const user = data?.user || data?.session?.user;
        if (user?.email) {
          Cookies.set('user', JSON.stringify({ email: user.email }), {
            expires: 7,
            path: '/',
          });
        }

        setStatus('success');
        setTimeout(() => router.replace('/dashboard'), 1500);
      } catch (err) {
        setStatus('error');
        setError('Failed to verify email. Please try again.');
      }
    };

    loginWithToken();
  }, [router]);

  const getMessage = () => {
    switch (status) {
      case 'waiting':
        return 'We sent a confirmation link to your email. Please check your inbox.';
      case 'verifying':
        return 'Verifying your email...';
      case 'success':
        return '✅ Email verified successfully! Redirecting...';
      case 'error':
        return error;
      case 'loading':
      default:
        return 'Checking...';
    }
  };

  return (
    <>
      <Head>
        <title>Email Verification</title>
      </Head>
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 via-indigo-800 to-purple-900 px-4 py-20">
        <div className="max-w-md w-full bg-black/80 text-white rounded-2xl p-8 shadow-xl text-center space-y-4">
          <h1 className="text-2xl font-bold">Email Verification</h1>
          <p>{getMessage()}</p>
        </div>
      </main>
    </>
  );
}
