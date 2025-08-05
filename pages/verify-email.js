'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '@/lib/supabaseClient';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const interval = setInterval(async () => {
      setChecking(true);
      try {
        // 🔁 تأكد من تحديث الجلسة أولًا
        await supabase.auth.refreshSession();

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        const emailConfirmed = session?.user?.email_confirmed_at;
        if (emailConfirmed) {
          clearInterval(interval);
          setConfirmed(true);
          setTimeout(() => router.push('/dashboard'), 1500); // ⏳ بعد 1.5 ثانية للانتقال
        } else {
          setConfirmed(false);
        }
      } catch (err) {
        setError('Something went wrong while checking email verification.');
        clearInterval(interval);
      } finally {
        setChecking(false);
      }
    }, 4000); // ⏳ كل 4 ثواني

    return () => clearInterval(interval);
  }, [router]);

  return (
    <>
      <Head>
        <title>Verify Email - AI Store Assistant</title>
      </Head>
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 via-indigo-800 to-purple-900 px-4 py-20">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-2xl p-8 shadow-2xl text-center space-y-4">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            {confirmed ? 'Email Verified 🎉' : 'Waiting for Email Confirmation...'}
          </h1>

          <p className="text-zinc-600 dark:text-zinc-400">
            {confirmed
              ? 'Redirecting you to your dashboard...'
              : 'Please check your email and click the confirmation link. This page will auto-update.'}
          </p>

          {checking && !confirmed && (
            <p className="text-purple-600 font-medium">Checking status...</p>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="mt-6">
            <p className="text-xs text-zinc-400">
              Didn’t receive the email? Check your spam folder or try signing up again.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
