'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import Cookies from 'js-cookie';

export default function GoogleAuthCallback() {
  const supabase = createBrowserSupabaseClient();
  const router = useRouter();
  const [status, setStatus] = useState('⏳ Verifying Google login...');

  useEffect(() => {
    const finalizeAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session?.user) {
        console.error('❌ No valid session', error);
        router.replace('/auth-failed?reason=invalid_session');
        return;
      }

      const user = session.user;
      const user_email = user.email || '';
      const user_name = user.user_metadata?.full_name || user.email || '';
      const user_id = user.id;

      // Save cookie
      Cookies.set('user', JSON.stringify({ email: user_email }), {
        expires: 7,
        path: '/',
      });

      // Insert user into 'Data' table
      const { error: insertError } = await supabase
        .from('Data')
        .upsert([
          {
            id: user_id,
            name: user_name,
            email: user_email,
            password: '', // OAuth user
            plan: 'Free',
            credits: 5,
          },
        ], { onConflict: ['id'] });

      if (insertError) {
        console.error('❌ Insert error:', insertError.message);
      } else {
        console.log('✅ User inserted into Data');
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
