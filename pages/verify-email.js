'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '@/lib/supabaseClient';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Checking...');
  const [error, setError] = useState('');

  useEffect(() => {
    const hash = window.location.hash;

    if (!hash || !hash.includes('access_token')) {
      setStatus('No token found in URL.');
      return;
    }

    const params = new URLSearchParams(hash.substring(1));
    const access_token = params.get('access_token');

    const loginWithToken = async () => {
      try {
        const { data, error } = await supabase.auth.setSession({
          access_token,
          refresh_token: '', // can be empty
        });

        if (error) throw error;

        setStatus('Email verified! Redirecting...');
        setTimeout(() => router.replace('/dashboard'), 1500);
      } catch (err) {
        setStatus('');
        setError('Failed to verify email. Try logging in manually.');
      }
    };

    loginWithToken();
  }, [router]);

  return (
    <>
      <Head>
        <title>Email Verification</title>
      </Head>
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 via-indigo-800 to-purple-900 px-4 py-20">
        <div className="max-w-md w-full bg-black/80 text-white rounded-2xl p-8 shadow-xl text-center space-y-4">
          <h1 className="text-2xl font-bold">Email Verification</h1>
          <p>{status}</p>
          {error && <p className="text-red-400">{error}</p>}
        </div>
      </main>
    </>
  );
}
