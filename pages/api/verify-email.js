'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import Cookies from 'js-cookie';

export default function VerifyEmailPage() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const checkSessionAndInsert = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (session?.user) {
        const email = session.user.email;
        const id = session.user.id;
        const provider = session.user.app_metadata?.provider ?? 'email';

        // ✅ إدخال بيانات المستخدم في جدول Data
        const { error: insertError } = await supabase.from('Data').insert([
          {
            id,
            Provider: provider,
            user_id: id,
            credits: 5,
            plan: 'Free',
          }
        ]);

        if (insertError) {
          console.error('Insert error:', insertError);
        }

        // ✅ حفظ معلومات المستخدم في الكوكيز
        Cookies.set('user', JSON.stringify({ email }), { expires: 7 });

        // ✅ التوجيه إلى الصفحة الرئيسية
        router.replace('/dashboard');
      } else {
        setStatus('unauthenticated');
      }
    };

    checkSessionAndInsert();
  }, [supabase, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {status === 'loading' && <p>Verifying...</p>}
      {status === 'unauthenticated' && <p>Unable to verify session. Please log in.</p>}
    </div>
  );
}
