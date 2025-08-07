'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import Cookies from 'js-cookie';

export default function GoogleAuthCallback() {
  const supabase = createBrowserSupabaseClient();
  const router = useRouter();
  const [status, setStatus] = useState('⏳ Logging you in with Google...');

  useEffect(() => {
    const hash = window.location.hash;

    if (!hash.includes('access_token')) {
      router.replace('/auth-failed?reason=missing_hash');
      return;
    }

    const query = new URLSearchParams(hash.substring(1));
    const access_token = query.get('access_token');
    const refresh_token = query.get('refresh_token');

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

      Cookies.set('user', JSON.stringify({ email: user_email }), {
        expires: 7,
        path: '/',
      });

      const { error: insertError } = await supabase
        .from('Data')
        .upsert([
          {
            id: user_id,
            name: user_name,
            email: user_email,
            password: '',
            plan: 'Free',
            credits: 5,
          },
        ], { onConflict: ['id'] });

      if (insertError) {
        console.error('❌ Insert error:', insertError.message);
      }

      router.replace('/dashboard');
    };

    finalizeAuth();
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-xl font-semibold">{status}</p>
    </div>
  );
}
