// pages/auth/callback.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

export default function GoogleAuthCallback() {
  const supabase = createPagesBrowserClient();
  const router = useRouter();
  const [msg, setMsg] = useState('⏳ Verifying Google login…');

  // غيّر هذا لـ false إذا تبي تبقي upsert من العميل
  const USE_TRIGGER = true; // لماذا: التريغر آمن ويتجاوز مشاكل RLS للـ INSERT

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // انتظار استقرار الجلسة بعد OAuth
      for (let i = 0; i < 8; i++) {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session?.user && !error) {
          const { user } = session;
          Cookies.set('user', JSON.stringify({ email: user.email || '' }), { expires: 7, path: '/' });

          if (!USE_TRIGGER) {
            // بديل: upsert مباشر (يتطلب سياسة RLS INSERT: with check (auth.uid() = user_id))
            const { error: upsertError } = await supabase
              .from('Data') // حافظ على نفس اسم جدولك
              .upsert(
                {
                  user_id: user.id,
                  email: user.email || '',
                  name: user.user_metadata?.full_name || user.user_metadata?.name || user.email || '',
                  plan: 'Free',
                  credits: 5,
                },
                { onConflict: 'user_id' } // لماذا: المفتاح المنطقي لصف المستخدم
              );

            if (upsertError) {
              console.error('Upsert failed:', upsertError.message);
              // لا نمنع التوجيه؛ غالبًا الصف موجود أو RLS يمنع الإدراج
            }
          }

          setMsg('✅ Signed in. Redirecting…');
          router.replace('/dashboard');
          return;
        }
        await new Promise((r) => setTimeout(r, 300));
      }

      if (!cancelled) {
        setMsg('❌ Could not confirm your session. Please try again.');
        router.replace('/auth-failed?reason=invalid_session');
      }
    })();

    return () => { cancelled = true; };
  }, [router, supabase]);

  return (
    <div className="grid min-h-[60vh] place-items-center">
      <p className="text-lg font-semibold">{msg}</p>
    </div>
  );
}
