'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { supabase } from '@/lib/supabaseClient';

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const { access_token, refresh_token } = router.query;

      if (!access_token || !refresh_token) {
        console.warn('❌ Missing tokens from URL query');
        router.replace('/login');
        return;
      }

      // ✅ 1. Set the session
      const { error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (sessionError) {
        console.error('❌ Failed to set session:', sessionError);
        router.replace('/login');
        return;
      }

      // ✅ 2. Get user info
      const { data: { user }, error } = await supabase.auth.getUser();

      if (!user || error) {
        console.error('❌ Failed to fetch user:', error);
        router.replace('/login');
        return;
      }

      const userData = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email,
        avatar: user.user_metadata?.avatar_url || '',
      };

      // ✅ 3. Insert into Data table (if not exists)
      const { error: insertError } = await supabase.from('Data').upsert({
        user_id: userData.id,
        email: userData.email,
        name: userData.name,
        Provider: 'Google',
        created_at: new Date().toISOString(),
        credits: 10,
        plan: 'Free',
      }, {
        onConflict: ['user_id'],
      });

      if (insertError) {
        console.error('❌ Error inserting user into Data table:', insertError);
      }

      // ✅ 4. Save cookies
      Cookies.set('token', access_token, { path: '/', expires: 1 });
      Cookies.set('user', JSON.stringify(userData), { path: '/', expires: 1 });

      // ✅ 5. Redirect to dashboard
      router.replace('/dashboard');
    };

    if (router.isReady) {
      handleOAuthCallback();
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-white text-lg">
      Logging you in via Google...
    </div>
  );
}
