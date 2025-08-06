'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.substring(1));
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');

      if (!access_token || !refresh_token) {
        router.replace('/login');
        return;
      }

      const supabase = createBrowserSupabaseClient();

      const { error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (sessionError) {
        console.error('❌ Session Error:', sessionError);
        return router.replace('/login');
      }

      const { data: { user } } = await supabase.auth.getUser();

      await supabase.from('Data').upsert({
        user_id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || '',
        Provider: user.app_metadata.provider || 'email',
        created_at: new Date().toISOString(),
        credits: 5,
        plan: 'Free',
      });

      Cookies.set('user', JSON.stringify({ email: user.email }), { expires: 7 });

      router.replace('/dashboard');
    };

    if (router.isReady) handleOAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      Verifying session...
    </div>
  );
}
