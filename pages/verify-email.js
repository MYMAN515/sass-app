'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import Cookies from 'js-cookie';

export default function VerifyEmailPage() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();
  const [status, setStatus] = useState('Verifying...');

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes('access_token')) {
      setStatus('❌ Invalid verification link.');
      return;
    }

    const query = new URLSearchParams(hash.substring(1));
    const access_token = query.get('access_token');
    const refresh_token = query.get('refresh_token');

    const restoreSessionAndInsert = async () => {
      const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (error || !data?.session) {
        setStatus('❌ Failed to verify session.');
        return;
      }

      const user = data.session.user;
      const user_email = user.email || '';
      const user_name = user.user_metadata?.full_name || user.email || '';
      const user_id = user.id;

      // ✅ حفظ الإيميل في الكوكيز
      Cookies.set('user', JSON.stringify({ email: user_email }), {
        expires: 7,
        path: '/',
      });

      // ✅ إدخال البيانات في جدول Data (لو مش موجود)
      const { error: insertError } = await supabase
        .from('Data')
        .upsert([
          {
            id: user_id,
            name: user_name,
            email: user_email,
            password: '', // فارغ لأن الحساب مفعل بالإيميل فقط
          },
        ], { onConflict: ['id'] }); // ما يتكرر لو موجود

      if (insertError) {
        console.error('❌ Insert error:', insertError.message);
      }

      setStatus('✅ Email verified! Redirecting...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    };

    restoreSessionAndInsert();
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-xl font-semibold">{status}</p>
    </div>
  );
}
