'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import Cookies from 'js-cookie';
import { motion, AnimatePresence } from 'framer-motion';

export default function VerifyEmailPage() {
  const router = useRouter();
  const supabase = createPagesBrowserClient();
  const [status, setStatus] = useState('Verifying…');
  const [error, setError] = useState('');

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes('access_token')) {
      setError('❌ Invalid verification link.');
      setStatus('');
      return;
    }

    const query = new URLSearchParams(hash.substring(1));
    const access_token = query.get('access_token');
    const refresh_token = query.get('refresh_token');

    const restoreSessionAndInsert = async () => {
      try {
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        if (sessionError || !data?.session) throw new Error('❌ Failed to verify session.');

        const user = data.session.user;
        const user_email = user.email || '';
        const user_name = user.user_metadata?.full_name || user.email || '';
        const user_id = user.id;

        Cookies.set('user', JSON.stringify({ email: user_email }), { expires: 7, path: '/' });

        const { error: insertError } = await supabase
          .from('Data')
          .upsert(
            [
              {
                user_id,
                name: user_name,
                email: user_email,
                password: '',
              },
            ],
            { onConflict: ['user_id'] }
          );

        if (insertError) console.error('❌ Insert error:', insertError.message);

        setStatus('✅ Email verified! Redirecting…');
        setTimeout(() => router.push('/dashboard'), 2000);
      } catch (err) {
        setError(err.message);
        setStatus('');
      }
    };

    restoreSessionAndInsert();
  }, [supabase, router]);

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-zinc-900 to-zinc-800 px-4">
      <div className="bg-zinc-850 p-6 rounded-2xl shadow-xl max-w-md w-full text-center">
        <AnimatePresence>
          {status && (
            <motion.p
              key="status"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-lg font-semibold text-green-400"
            >
              {status}
            </motion.p>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {error && (
            <motion.p
              key="error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-lg font-semibold text-red-500"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
