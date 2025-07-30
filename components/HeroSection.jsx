'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
      <div className="absolute w-[400px] h-[400px] bg-gradient-to-tr from-purple-500 to-pink-500 opacity-10 rounded-full blur-[100px] -top-20 -left-20 z-0" />
      <div className="absolute w-[200px] h-[200px] bg-gradient-to-tr from-fuchsia-500 to-indigo-600 opacity-10 rounded-full blur-2xl -bottom-10 -right-10 z-0" />

      {/* Headline storytelling */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-4xl z-10"
      >
        <motion.h1
          className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          An AI So Smart, Our Competitors Asked If It’s Real
        </motion.h1>

        <p className="text-lg text-purple-200 max-w-xl mx-auto">
          What happens when you mix obsession, AI, and ecommerce? Ask the 20,000+ brands who boosted sales with just one click.
        </p>

        <div className="flex flex-wrap gap-4 justify-center mt-8">
          <Link
            href="/quiz"
            className="bg-purple-600 hover:bg-purple-700 transition px-6 py-3 rounded-full text-white shadow-lg hover:scale-105"
          >
            🔍 Diagnose My Product
          </Link>
          <Link
            href="/demo"
            className="bg-white hover:bg-gray-100 transition px-6 py-3 rounded-full text-purple-700 font-semibold shadow-lg hover:scale-105"
          >
            ▶️ Watch Demo
          </Link>
        </div>

        <p className="mt-4 text-sm text-gray-400">📈 42 rewrites just happened in the last 60 seconds.</p>
      </motion.div>

      {/* Live AI Visual */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2 }}
        className="relative mt-20 w-[400px] h-[260px] rounded-2xl overflow-hidden border-2 border-purple-700/20 shadow-xl bg-gradient-to-br from-black/20 to-purple-800/10 backdrop-blur-xl"
      >
        <Image
          src="/hero-image.png"
          alt="3D AI startup workspace"
          fill
          style={{ objectFit: 'cover' }}
          className="rounded-xl"
          priority
        />
        <div className="absolute top-4 left-4 bg-purple-900/60 text-white text-xs px-3 py-1 rounded-full shadow-lg animate-pulse">
          🤖 AI Working...
        </div>
      </motion.div>

      {/* CEO Statement */}
      <motion.div
        className="mt-24 text-center z-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-2">Mr. Qais 👑</h2>
        <p className="text-purple-300 max-w-xl mx-auto">
          “I built this to automate my hustle. Turns out, I automated 20,000 other founders too.”
        </p>
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        className="mt-24 w-full max-w-5xl z-10"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="bg-white/5 backdrop-blur-2xl border border-purple-600/10 rounded-2xl p-10">
          <h3 className="text-2xl font-semibold text-purple-100 mb-6">🤯 Still Not Convinced?</h3>
          <ul className="space-y-6 text-left text-purple-200 text-md">
            <li>
              <strong>Is this real AI?</strong> — Yes. It's the type that quietly gets your product sold while you sleep.
            </li>
            <li>
              <strong>What makes it different?</strong> — It doesn't just rewrite, it <em>reasons</em>. It doesn't just enhance — it <em>enchants</em>.
            </li>
            <li>
              <strong>Why does it feel magical?</strong> — Because it’s built by weirdos with a vision. And a coffee addiction.
            </li>
          </ul>
        </div>
      </motion.div>
    </section>
  );
}