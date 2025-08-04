'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function HeroSection() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <section className="w-full font-sans overflow-hidden bg-white dark:bg-zinc-900 text-black dark:text-white">

      {/* Hero Section */}
      <div className="relative flex flex-col-reverse md:flex-row items-center justify-between bg-[#110133] dark:bg-[#0c001d] text-white px-6 md:px-24 py-20 gap-10">
        {isMobile && (
          <div className="fixed bottom-4 right-4 z-50 animate-bounce">
            <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full shadow-lg">
              Try Now →
            </Link>
          </div>
        )}

        <div className="max-w-xl z-10">
          <motion.h1
            className="text-4xl md:text-5xl font-extrabold leading-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Your Product,<br /> Transformed by AI ✨
          </motion.h1>

          <motion.p
            className="text-lg text-white/80 dark:text-white/70 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Upload a photo and watch our AI turn it into a pro-level product image.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Link href="/dashboard" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg">
              Get Started
            </Link>
          </motion.div>
        </div>

        <motion.div
          className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 dark:border-zinc-700 bg-white dark:bg-zinc-900"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Image
            src="/before-after-bottle.jpg"
            alt="AI Product Demo"
            width={500}
            height={700}
            className="w-full h-auto object-contain"
            priority
          />
          <div className="absolute top-3 left-3 text-xs sm:text-sm text-black font-semibold bg-white/90 px-2 py-1 rounded-full shadow">Before</div>
          <div className="absolute top-3 right-3 text-xs sm:text-sm text-white font-semibold bg-orange-500/90 px-2 py-1 rounded-full shadow">After</div>
        </motion.div>
      </div>

      {/* Features */}
      <div className="bg-white dark:bg-zinc-800 py-20 px-6 md:px-24">
        <motion.h2 className="text-3xl font-bold mb-12 text-black dark:text-white text-center" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          How AI Helps You Win
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Image Enhancement', icon: '📷', desc: 'Studio quality images at your fingertips.' },
            { title: 'AI Try-On', icon: '🧍‍♂️', desc: 'Preview products on real models.' },
            { title: 'Smart Descriptions', icon: '💡', desc: 'Auto-generate marketing copy instantly.' }
          ].map(({ title, icon, desc }) => (
            <motion.div
              key={title}
              className="bg-gradient-to-br from-[#F0F4FF] to-white dark:from-zinc-700 dark:to-zinc-800 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all text-center"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-4xl mb-3">{icon}</div>
              <h3 className="text-lg font-bold mb-2 text-black dark:text-white">{title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Real Results */}
      <div className="px-6 md:px-24 py-20">
        <div className="flex flex-col md:flex-row gap-6 bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="flex-1 bg-gradient-to-tr from-zinc-100 to-white dark:from-zinc-700 dark:to-zinc-800 p-6 text-center text-lg font-semibold text-zinc-800 dark:text-white flex flex-col justify-center">
            ✨ Just one click → Amazing difference
          </div>
          <div className="flex-1 flex items-center justify-center relative">
            <Image
              src="/mockup-ai.png"
              alt="Before and After"
              width={500}
              height={400}
              className="w-full h-auto object-contain"
            />
            <div className="absolute top-4 left-4 text-xs text-black font-semibold bg-white px-2 py-1 rounded-full shadow">After</div>
            <div className="absolute top-4 right-4 text-xs text-white font-semibold bg-green-500 px-2 py-1 rounded-full shadow">Before</div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-[#0f0320] text-white py-20 px-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-14">How It Works</h2>
        <div className="flex flex-col md:flex-row justify-center items-center gap-12 relative max-w-6xl mx-auto">
          <div className="hidden md:block absolute top-1/2 w-full h-1 bg-purple-700 z-0"></div>
          {[
            { title: 'Upload', desc: 'Add your product photo', icon: '📤' },
            { title: 'Enhance', desc: 'AI-powered top quality', icon: '⚙️' },
            { title: 'Download', desc: 'Get stunning result', icon: '📥' },
          ].map((step, idx) => (
            <div key={idx} className="bg-[#180a30] z-10 rounded-xl px-6 py-8 text-center shadow-xl w-full md:w-1/3">
              <div className="w-12 h-12 mx-auto mb-4 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl">{step.icon}</div>
              <h3 className="font-semibold text-xl mb-1">{step.title}</h3>
              <p className="text-sm text-gray-300">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
