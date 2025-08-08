// pages/api/logout.js
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
  // لماذا: منع أساليب غير مقصودة
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const supabase = createPagesServerClient({ req, res });
    const { error } = await supabase.auth.signOut(); // يزيل كوكيز الجلسة بأمان
    if (error) return res.status(400).json({ error: error.message });

    // منع التخزين المؤقت على المتصفح/الوسيط
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}


// components/LogoutButton.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function LogoutButton({ className = '' }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/logout', { method: 'POST' });
      // لماذا: تنظيف أي كوكي مخصّص للواجهة
      Cookies.remove('user', { path: '/' });

      if (!res.ok) {
        // fallback بسيط: حتى لو فشل، نتابع التوجيه لتفريغ الحالة
        console.warn('Logout API returned non-OK.');
      }

      // توجيه نظيف + منع الرجوع
      router.replace('/login');
    } catch (e) {
      console.error('Logout failed:', e);
      router.replace('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={[
        'inline-flex items-center justify-center rounded-xl px-4 py-2 font-semibold shadow',
        'bg-red-500 text-white hover:bg-red-600 disabled:opacity-60',
        className,
      ].join(' ')}
    >
      {loading ? 'Logging out…' : 'Logout'}
    </button>
  );
}
