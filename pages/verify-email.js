'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '@/lib/supabaseClient';
import Cookies from 'js-cookie';
import { Loader2, CheckCircle, AlertCircle, MailCheck } from 'lucide-react';

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
    const refresh_token = params.get('refresh_token');

    const loginWithToken = async () => {
      try {
        setStatus('verifying');

        const { data, error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (error) throw error;

        const user = data?.user || data?.session?.user;

        if (user?.email) {
          Cookies.set('user', JSON.stringify({ email: user.email }), {
            expires: 7,
            path: '/',
          });

          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);

          await supabase.from('Data').upsert({
            user_id: user.id,
            email: user.email,
            name: user.user_metadata?.name || '',
            Provider: user.app_metadata?.provider || 'email',
            created_at: new Date().toISOString(),
            credits: 10,
            plan: 'Free',
          });
        }

        setStatus('success');
        setTimeout(() => router.replace('/dashboard'), 1500);
      } catch (err) {
        console.error(err);
        setStatus('error');
        setError('❌ Failed to verify your email. Please try again.');
      }
    };

    loginWithToken();
  }, [router]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <>
            <Loader2 className="animate-spin h-8 w-8 text-white mx-auto" />
            <p>Checking...</p>
          </>
        );
      case 'waiting':
        return (
          <>
            <MailCheck className="h-8 w-8 text-green-400 mx-auto" />
            <p>✅ We sent a confirmation link to your email. Please check your inbox.</p>
          </>
        );
      case 'verifying':
        return (
          <>
            <Loader2 className="animate-spin h-8 w-8 text-yellow-300 mx-auto" />
            <p>⏳ Verifying your email...</p>
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
            <p>🎉 Email verified successfully! Redirecting...</p>
          </>
        );
      case 'error':
        return (
          <>
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
            <p className="text-red-400">{error}</p>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>Email Verification</title>
      </Head>
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-900 via-purple-900 to-indigo-900 px-4 py-20">
        <div className="max-w-md w-full bg-white/5 backdrop-blur-xl text-white rounded-2xl p-8 shadow-2xl text-center space-y-6 border border-white/10">
          <h1 className="text-3xl font-bold tracking-tight">Verify your Email</h1>
          {renderContent()}
        </div>
      </main>
    </>
  );
}
