'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '@/lib/supabaseClient';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Verifying...');
  const [error, setError] = useState('');

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1));
    const access_token = params.get('access_token');
    const type = params.get('type'); // usually "signup"

    const autoSignIn = async () => {
      try {
        if (!access_token) {
          setStatus('No token found in URL.');
          return;
        }

        // ✅ تسجيل الجلسة يدويًا باستخدام التوكن
        const { data, error } = await supabase.auth.setSession({
          access_token,
          refresh_token: '', // لا يوجد refresh_token في الرابط، لكن مسموح تمريره كـ ''
        });

        if (error) {
          throw error;
        }

        setStatus('Email verified successfully! Redirecting...');
        setTimeout(() => {
          router.replace('/dashboard');
        }, 1500);
      } catch (err) {
        console.error(err);
        setError('Failed to verify your email. Please try logging in manually.');
        setStatus('');
      }
    };

    autoSignIn();
  }, [router]);

  return (
    <>
      <Head>
        <title>Verifying Email - AI Store Assistant</title>
      </Head>
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 via-indigo-800 to-purple-900 px-4 py-20">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-2xl p-8 shadow-2xl text-center space-y-4">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Email Verification</h1>
          <p className="text-zinc-600 dark:text-zinc-400">{status}</p>
          {error && <p className="text-red-500">{error}</p>}
        </div>
      </main>
    </>
  );
}
