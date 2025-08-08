// ==============================
// .env.local  (ضروري)
// ==============================
// لماذا: ضبط العودة لنفس الدومين في كل البيئات
NEXT_PUBLIC_SITE_URL=https://your-domain.com

// ==============================
// pages/api/login-with-google.js
// ==============================
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
  // لماذا: API Route آمن لإطلاق OAuth من السيرفر وتفادي مشاكل الـ redirect origins
  const supabase = createPagesServerClient({ req, res });
  const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo }, // يضمن العودة للـ callback الصحيح
  });

  if (error) {
    return res.status(400).json({ error: error.message || 'OAuth init failed' });
  }

  // توجيه مباشر إلى صفحة موافقة Google
  return res.redirect(data.url);
}

// ==============================
// pages/auth/callback.jsx
// ==============================
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default function GoogleAuthCallback() {
  const supabase = createBrowserSupabaseClient();
  const router = useRouter();
  const [msg, setMsg] = useState('⏳ Verifying your Google login…');

  useEffect(() => {
    let cancelled = false;

    const confirmSession = async () => {
      // لماذا: بعض المتصفحات تتأخر في استرجاع الجلسة بعد OAuth
      for (let i = 0; i < 8; i++) {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!cancelled && session?.user && !error) {
          const email = session.user.email || '';
          Cookies.set('user', JSON.stringify({ email }), { expires: 7, path: '/' }); // لماذا: تجربة UI أسرع

          setMsg('✅ Signed in. Preparing your dashboard…');

          // ⚠️ الصف في جدول Data يتم إنشاؤه تلقائيًا عبر Trigger على auth.users
          router.replace('/dashboard');
          return;
        }
        await new Promise((r) => setTimeout(r, 300));
      }

      if (!cancelled) {
        setMsg('❌ Could not confirm your session. Please try again.');
        router.replace('/login?error=session');
      }
    };

    confirmSession();
    return () => { cancelled = true; };
  }, [router, supabase]);

  return (
    <div className="grid min-h-[60vh] place-items-center">
      <p className="text-lg font-semibold">{msg}</p>
    </div>
  );
}

// ==============================
// components/LoginWithGoogleButton.jsx  (اختياري للاستخدام في صفحة /login)
// ==============================
'use client';

import { useState } from 'react';

export default function LoginWithGoogleButton({ className = '' }) {
  const [loading, setLoading] = useState(false);

  const onGoogle = async () => {
    try {
      setLoading(true);
      // لماذا: استدعاء API Route للسيرفر يحسن الثقة بالنطاق ويجنب قيود redirect origins
      window.location.href = '/api/login-with-google';
    } catch {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={onGoogle}
      disabled={loading}
      className={[
        'inline-flex items-center justify-center gap-3 rounded-xl bg-white text-black px-5 py-3 font-semibold shadow-md hover:shadow-lg transition disabled:opacity-60',
        className,
      ].join(' ')}
      aria-label="Continue with Google"
    >
      <img
        src="https://www.svgrepo.com/show/475656/google-color.svg"
        alt=""
        className="h-5 w-5"
      />
      {loading ? 'Please wait…' : 'Continue with Google'}
    </button>
  );
}

