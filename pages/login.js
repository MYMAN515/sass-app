'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';
import Cookies from 'js-cookie';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const confirmEmail = async () => {
      const hash = window.location.hash;

      if (!hash) {
        setStatus('error');
        setError('Verification link is invalid or expired.');
        return;
      }

      // تأكيد التحقق من الجلسة
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !sessionData?.session?.user) {
        setStatus('error');
        setError('Unable to confirm your session. Please log in again.');
        return;
      }

      const user = sessionData.session.user;

      // التحقق إن كان المستخدم موجود مسبقًا في جدول Data
      const { data: existingUser, error: checkError } = await supabase
        .from('Data')
        .select('*')
        .eq('email', user.email)
        .single();

      if (!existingUser) {
        const insertRes = await supabase.from('Data').insert([
          {
            name: user.user_metadata?.name || 'Anonymous',
            email: user.email,
            password: null, // يمكنك تعيين قيمة افتراضية أو تركها null
          },
        ]);

        if (insertRes.error) {
          setStatus('error');
          setError('Failed to save your data. Please try again later.');
          return;
        }
      }

      // تخزين الجلسة في الكوكيز (اختياري)
      Cookies.set('user', JSON.stringify({ email: user.email }), { expires: 7, path: '/' });

      // إعادة التوجيه إلى صفحة الـ Dashboard
      setStatus('success');
      router.replace('/dashboard');
    };

    confirmEmail();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {status === 'loading' && <p>Verifying your email...</p>}
      {status === 'success' && <p>Email verified! Redirecting...</p>}
      {status === 'error' && <p className="text-red-500">{error}</p>}
    </div>
  );
}
