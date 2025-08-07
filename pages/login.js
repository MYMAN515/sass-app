'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();
  const [formType, setFormType] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // ✅ تحقق إن كان المستخدم داخل مسبقًا
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        router.replace('/dashboard');
      }
      setCheckingSession(false);
    };
    checkSession();
  }, [supabase, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, type: formType }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login/Registration failed');

      if (formType === 'register') {
        alert('✅ Registration successful. Please verify your email.');
      } else {
        // ✅ تحديث جلسة Supabase يدويًا هنا
        await supabase.auth.setSession({
          access_token: data.token,
          refresh_token: data.refresh_token,
        });

        // ✅ خزّن بيانات المستخدم في كوكي (اختياري)
        Cookies.set('user', JSON.stringify({ email: data.user.email }), {
          expires: 7,
          path: '/',
        });

        // ✅ توجيه إلى الصفحة الرئيسية
        router.replace('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) return null;

  return (
    // ... (نفس التصميم السابق تبع الفورم)
    // يمكنك نسخ الـ form من الكود السابق مباشرة
  );
}
