// pages/auth/callback.js
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import Cookies from 'js-cookie';

export default function GoogleAuthCallback() {
  const supabase = createBrowserSupabaseClient();
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;

    if (!hash) {
      router.replace('/auth-failed?reason=missing_hash');
      return;
    }

    const params = new URLSearchParams(hash.substring(1));
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');

    if (!access_token || !refresh_token) {
      router.replace('/auth-failed?reason=missing_tokens');
      return;
    }

    const finalizeAuth = async () => {
      const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (error || !data?.session) {
        router.replace('/auth-failed?reason=invalid_session');
        return;
      }

      const user = data.session.user;
      const user_email = user.email || '';
      const user_name = user.user_metadata?.full_name || user.email || '';
      const user_id = user.id;

      // Save cookie
      Cookies.set('user', JSON.stringify({ email: user_email }), {
        expires: 7,
        path: '/',
      });

      // Insert into "Data" table if not exists
      await supabase
        .from('Data')
        .upsert(
          [
            {
              id: user_id,
              name: user_name,
              email: user_email,
              password: '', // empty because it's OAuth
            },
          ],
          { onConflict: ['id'] }
        );

      router.replace('/dashboard');
    };

    finalizeAuth();
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen bg-zinc-900 text-white">
      <p className="text-xl font-semibold">⏳ Logging you in with Google...</p>
    </div>
  );
}
