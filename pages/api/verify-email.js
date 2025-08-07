'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import Cookies from 'js-cookie';
import { motion, AnimatePresence } from 'framer-motion';

export default function VerifyEmailPage() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Verifying your email…');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      const hash = window.location.hash;
      if (!hash.includes('access_token')) {
        setIsError(true);
        setMessage('❌ Verification link is invalid or expired.');
        setStatus('done');
        return;
      }

      const query = new URLSearchParams(hash.substring(1));
      const access_token = query.get('access_token');
      const refresh_token = query.get('refresh_token');

      try {
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (sessionError || !data?.session) {
          throw new Error('❌ Unable to confirm your session. Please log in again.');
        }

        const user = data.session.user;
        const user_email = user.email || '';
        const user_name = user.user_metadata?.full_name || user.email || 'Anonymous';
        const user_id = user.id;

        Cookies.set('user', JSON.stringify({ email: user_email }), { expires: 7, path: '/' });

        const { error: upsertError } = await supabase
          .from('Data')
          .upsert(
            [
              {
                user_id,
                name: user_name,
                email: user_email,
                password: null,
              },
            ],
            { onConflict: ['user_id'] }
          );

        if (upsertError) {
          console.error('❌ Database upsert error:', upsertError.message);
        }

        setIsError(false);
        setMessage('✅ Email verified! Redirecting…');
        setStatus('success');
        setTimeout(() => router.replace('/dashboard'), 2000);
      } catch (err) {
        setIsError(true);
        setMessage(err.message || '❌ Something went wrong during verification.');
        setStatus('done');
      }
    };

    verifyEmail();
  }, [supabase, router]);

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-zinc-900 to-zinc-800 px-4">
      <div className="bg-zinc-850 p-6 rounded-2xl shadow-xl max-w-md w-full text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={message}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`text-lg font-semibold ${isError ? 'text-red-500' : 'text-green-400'}`}
          >
            {message}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
