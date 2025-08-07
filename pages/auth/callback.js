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

    if (!hash || !hash.includes('access_token')) {
      console.error('❌ No token hash found in URL');
      router.replace('/auth-failed?reason=missing_hash');
      return;
    }

    const query = new URLSearchParams(hash.substring(1));
    const access_token = query.get('access_token');
    const refresh_token = query.get('refresh_token');

    if (!access_token || !refresh_token) {
      console.error('❌ Missing tokens in hash');
      router.replace('/auth-failed?reason=missing_tokens');
      return;
    }

    const finalizeAuth = async () => {
      const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (error || !data?.session) {
        console.error('❌ Session error:', error?.message);
        router.replace('/auth-failed?reason=invalid_session');
        return;
      }

      const user = data.session.user;
      const user_email = user.email || '';
      const user_name = user.user_metadata?.full_name || user.email || '';
      const user_id = user.id;

      // Save session in cookies
      Cookies.set('user', JSON.stringify({ email: user_email }), {
        expires: 7,
        path: '/',
      });

      // Insert into Supabase table "Data"
      const { error: insertError } = await supabase
        .from('Data')
        .upsert([
          {
            id: user_id,
            name: user_name,
            email: user_email,
            password: '', // because Google user has no password
            plan: 'Free',
            credits: 5,
          },
        ], { onConflict: ['id'] });

      if (insertError) {
        console.error('❌ Insert error:', insertError.message);
      } else {
        console.log('✅ User inserted/updated in Data table');
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
