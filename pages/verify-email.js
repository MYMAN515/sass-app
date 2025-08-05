'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '@/lib/supabaseClient';

export default function EmailConfirmationChecker() {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const interval = setInterval(async () => {
      setChecking(true);
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        const confirmed = session?.user?.email_confirmed_at;
        setConfirmed(!!confirmed);

        if (confirmed) {
          router.push('/dashboard');
        }
      } catch (err) {
        setError('Something went wrong while checking email status.');
      } finally {
        setChecking(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <>
      <Head>
        <title>Verifying Email - AI Assistant</title>
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-200 dark:from-zinc-900 dark:to-zinc-800 flex flex-col items-center justify-center px-4 text-center">
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-xl max-w-md w-full">
          <h1 className="text-2xl font-bold text-zinc-800 dark:text-white mb-4">
            Checking Email Verification...
          </h1>
          <p className="text-zinc-600 dark:text-zinc-300 mb-2">
            This page will redirect automatically once your email is confirmed.
          </p>
          {checking && <p className="text-purple-600 font-semibold">Verifying...</p>}
          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        </div>
      </main>
    </>
  );
}
