<<<<<<< HEAD
// pages/dashboard.js

=======
"use client";

import { useEffect, useState } from 'react';
>>>>>>> 292c6fba (New Front-end | Back-End|)
import Layout from '@/components/Layout';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Head from 'next/head';
<<<<<<< HEAD
import { useState, useEffect } from 'react';
=======
import Cookies from 'js-cookie';
>>>>>>> 292c6fba (New Front-end | Back-End|)

const features = [
  {
    title: 'Enhance Studio',
    icon: '/icons/enhance.png',
    description: 'Make your product photos look cinematic using AI enhancements.',
    href: '/enhance',
    cta: 'Enhance Now',
  },
  {
<<<<<<< HEAD
    title: 'Magic Copy',
    icon: '/icons/magic.png',
    description: 'Transform plain descriptions into high converting vivid copy.',
    href: '/rewrite',
    cta: 'Rewrite Magic',
  },
  {
    title: 'Try-On Room',
    icon: '/icons/tryon.png',
    description: 'Let users see your product on realistic human models.',
    href: '/tryon',
    cta: 'Try It On',
  },
  {
    title: 'My Vault',
    icon: '/icons/vault.png',
=======
    title: 'Try-on Experience',
    icon: '/icons/tryon.png',
    description: 'Visualize products directly on models using virtual try-on.',
    href: '/tryon',
    cta: 'Try Now',
  },
  {
    title: 'My Vault',
    icon: '/icons/magic.png',
>>>>>>> 292c6fba (New Front-end | Back-End|)
    description: 'Your archive of AI creations. Remix, reuse, reimagine.',
    href: '/dashboard/history',
    cta: 'Open Vault',
  }
];

export default function Dashboard() {
  const router = useRouter();
<<<<<<< HEAD


  return (
    <div >
=======
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = Cookies.get('user');
    if (!stored) {
      router.replace('/login');
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      if (!parsed?.email) throw new Error('Invalid user object');
      setUser(parsed);
    } catch (err) {
      console.error('Invalid cookie:', err);
      Cookies.remove('user');
      router.replace('/login');
    }
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
>>>>>>> 292c6fba (New Front-end | Back-End|)
      <Layout title="Dashboard">
        <Head>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@600;700&display=swap" rel="stylesheet" />
        </Head>

<<<<<<< HEAD
        <div className="relative min-h-screen bg-[#0b0519] dark:bg-[#f5f5f5] px-4 sm:px-6 lg:px-12 py-10 sm:py-16 text-white dark:text-black font-sans overflow-hidden transition-colors">
      

          {/* Background Glow Effects */}
          <div className="absolute top-[10%] left-[10%] w-40 h-40 bg-purple-600 rounded-full blur-[100px] opacity-20 z-0" />
          <div className="absolute bottom-[5%] right-[10%] w-60 h-60 bg-fuchsia-600 rounded-full blur-[120px] opacity-10 z-0" />

          {/* Title */}
          <motion.h1
            className="text-center text-3xl sm:text-4xl md:text-5xl font-bold mb-12 sm:mb-20 z-10 relative"
=======
        <div className="relative flex-1 bg-gradient-to-br from-[#0b0519] via-[#1c0c35] to-[#0e031a] px-4 sm:px-6 lg:px-12 py-10 sm:py-16 text-white font-sans overflow-hidden transition-colors">
          {/* Background Glow */}
          <div className="absolute top-10 left-10 w-48 h-48 bg-purple-600 rounded-full blur-[120px] opacity-30 z-0 animate-pulse" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-fuchsia-600 rounded-full blur-[150px] opacity-20 z-0 animate-pulse" />

          {/* Welcome Text */}
          <motion.h1
            className="text-center text-4xl sm:text-5xl md:text-6xl font-extrabold mb-14 z-10 relative"
>>>>>>> 292c6fba (New Front-end | Back-End|)
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
<<<<<<< HEAD
            Welcome back, Visionary
          </motion.h1>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-2 z-10 relative">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="group bg-[#1a103d] dark:bg-white border border-[#2c1d5a] dark:border-gray-300 rounded-2xl p-6 text-center shadow-md transition-all duration-300 hover:shadow-[0_0_20px_#9f4eff55] hover:border-fuchsia-500 cursor-pointer"
                onClick={() => router.push(f.href)}
              >
                <div className="relative mb-4 flex items-center justify-center">
                  <div className="p-2 rounded-xl border border-white/20 dark:border-black/10 bg-black/20 dark:bg-white/10">
                    <img src={f.icon} alt={f.title} className="w-14 h-14 relative z-10" />
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-20 blur-2xl transition" />
                </div>
                <h3 className="text-white dark:text-black text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-white/70 dark:text-gray-700 text-sm mb-4">{f.description}</p>
                <button className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-fuchsia-500 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-full text-sm shadow-md group-hover:shadow-purple-500/40 transition duration-300">
=======
            Welcome back, <span className="bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">Visionary</span>
          </motion.h1>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto z-10 relative">
            {features.map((f, i) => (
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
>>>>>>> 292c6fba (New Front-end | Back-End|)
                  {f.cta}
                </button>
              </motion.div>
            ))}
          </div>

          {/* Launch CTA */}
          <motion.button
<<<<<<< HEAD
            className="fixed bottom-5 right-5 bg-gradient-to-tr from-[#ff6a8b] to-[#8a4fff] text-white font-semibold px-6 py-3 rounded-full shadow-xl hover:scale-105 z-50"
=======
            className="fixed bottom-6 right-6 bg-gradient-to-tr from-[#ff6a8b] to-[#8a4fff] text-white font-semibold px-6 py-3 rounded-full shadow-xl hover:scale-105 z-50"
>>>>>>> 292c6fba (New Front-end | Back-End|)
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
            onClick={() => router.push('/enhance')}
          >
<<<<<<< HEAD
            🚀 Launch Something
=======
            🚀 Launch Studio
>>>>>>> 292c6fba (New Front-end | Back-End|)
          </motion.button>
        </div>
      </Layout>
    </div>
  );
}
