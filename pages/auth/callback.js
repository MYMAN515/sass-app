'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { supabase } from '@/lib/supabaseClient';

export default function Callback() {
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

      // ✅ 1. تفعيل الجلسة
      const { error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (sessionError) {
        console.error('❌ Failed to set session:', sessionError);
        router.replace('/login');
        return;
      }

      // ✅ 2. الحصول على بيانات المستخدم
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

    //   console.log('✅ User:', userData);

      // ✅ 3. التأكد من وجود الجلسة (اختياري للعرض)
      const session = await supabase.auth.getSession();
    //   console.log('✅ Session:', session.data.session);

      // ✅ 4. upsert في جدول Data مع user_id لدعم RLS
      const { error: insertError } = await supabase.from('Data').upsert({
        user_id: userData.id,       // ضروري للبوليصة
        email: userData.email,
        name: userData.name,
        Provider: 'Google',
      }, {
        onConflict: ['user_id'],
      });

      if (insertError) {
        console.error('❌ Error inserting user into Data table:', insertError);
      }

      // ✅ 5. حفظ البيانات في الكوكيز
      Cookies.set('token', access_token, { path: '/', expires: 1 });
      Cookies.set('user', JSON.stringify(userData), { path: '/', expires: 1 });

      // ✅ 6. التوجيه للداشبورد
      router.replace('/dashboard');
    };

    handleOAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-white text-lg">
      Logging you in via Google...
    </div>
  );
}
