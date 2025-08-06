'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';

const features = [
  {
    title: 'Enhance Studio',
    icon: '/icons/enhance.png',
    description: 'Make your product photos look cinematic using AI enhancements.',
    href: '/enhance',
    cta: 'Enhance Now',
  },
  {
    title: 'Try-on Experience',
    icon: '/icons/tryon.png',
    description: 'Visualize products directly on models using virtual try-on.',
    href: '/tryon',
    cta: 'Try Now',
  },
];

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (!session || error) {
        router.replace('/login');
      } else {
        setUser(session.user);
      }
    };

    checkSession();
  }, [router, supabase]);

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Layout title="Dashboard">
        <Head>
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@600;700&display=swap"
            rel="stylesheet"
          />
        </Head>

        <div className="relative flex-1 bg-gradient-to-br from-[#0b0519] via-[#1c0c35] to-[#0e031a] px-4 sm:px-6 lg:px-12 py-10 sm:py-16 text-white font-sans overflow-hidden transition-colors">
          {/* Background Effects */}
          <div className="absolute top-10 left-10 w-48 h-48 bg-purple-600 rounded-full blur-[120px] opacity-30 z-0 animate-pulse" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-fuchsia-600 rounded-full blur-[150px] opacity-20 z-0 animate-pulse" />

          <motion.h1
            className="text-center text-4xl sm:text-5xl md:text-6xl font-extrabold mb-14 z-10 relative"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Welcome back, <span className="bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">{user.user_metadata?.name || user.email}</span>
          </motion.h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto z-10 relative">
            {features.map((f) => (
              <motion.div
                key={f.title}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 text-center shadow-xl hover:shadow-fuchsia-600/30 transition-all duration-300 cursor-pointer relative overflow-hidden"
                onClick={() => router.push(f.href)}
              >
                <div className="relative mb-5 flex items-center justify-center">
                  <div className="p-3 rounded-2xl border border-white/10 bg-white/10">
                    <img src={f.icon} alt={f.title} className="w-16 h-16" />
                  </div>
                  <div className="absolute top-1/2 left-1/2 w-24 h-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-fuchsia-500 via-purple-600 to-indigo-500 blur-3xl opacity-10 group-hover:opacity-30 transition duration-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 tracking-wide">{f.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed mb-5">{f.description}</p>
                <button className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-pink-500 hover:to-purple-700 text-white font-semibold py-2 px-6 rounded-full text-sm shadow-lg transition duration-300">
                  {f.cta}
                </button>
              </motion.div>
            ))}
          </div>

          <motion.button
            className="fixed bottom-6 right-6 bg-gradient-to-tr from-[#ff6a8b] to-[#8a4fff] text-white font-semibold px-6 py-3 rounded-full shadow-xl hover:scale-105 z-50"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
            onClick={() => router.push('/enhance')}
          >
            🚀 Launch Studio
          </motion.button>
        </div>
      </Layout>
    </div>
  );
}
