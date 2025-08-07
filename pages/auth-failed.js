'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function AuthFailedPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/'); // يرجع المستخدم للصفحة الرئيسية أو تقدر تغيرها
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#0d0d22] text-white px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <div className="text-5xl mb-4">❌</div>
        <h1 className="text-2xl font-bold mb-2">Authentication Failed</h1>
        <p className="text-zinc-400 mb-4">
          Something went wrong during sign-in. You’ll be redirected shortly.
        </p>
        <button
          onClick={() => router.push('/')}
          className="mt-2 px-6 py-2 bg-white text-black rounded-xl hover:bg-zinc-200 transition"
        >
          Back to Home
        </button>
      </motion.div>
    </main>
  );
}
