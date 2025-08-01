'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white min-h-screen flex flex-col items-center justify-start px-6 overflow-hidden pt-32">
      {/* Background Effects */}
      <div className="absolute w-[400px] h-[400px] bg-gradient-to-tr from-purple-500 to-pink-500 opacity-10 rounded-full blur-[100px] -top-20 -left-20 z-0" />
      <div className="absolute w-[200px] h-[200px] bg-gradient-to-tr from-fuchsia-500 to-indigo-600 opacity-10 rounded-full blur-2xl -bottom-10 -right-10 z-0" />

      {/* Hero Title */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-5xl z-10"
      >
        <motion.h1
          className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-4"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          I couldn’t afford a studio… so I built one 🤷‍♂️
        </motion.h1>

        <p className="text-md md:text-lg text-purple-200 max-w-2xl mx-auto">
          I wanted to sell my products. I had no gear, no time, no budget. So I built an AI that shoots the photos for me. It learns how my product looks, builds scenes, adjusts lighting, and spits out images that convert.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4 justify-center mt-8">
          <Link
            href="/upload"
            className="bg-purple-600 hover:bg-purple-700 transition px-6 py-3 rounded-full text-white shadow-lg hover:scale-105"
          >
            📸 Try the AI Studio
          </Link>
          <Link
            href="/how-it-works"
            className="bg-white hover:bg-gray-100 transition px-6 py-3 rounded-full text-purple-700 font-semibold shadow-lg hover:scale-105"
          >
            🔍 How It Works
          </Link>
        </div>

        <p className="mt-4 text-sm text-gray-400">💡 All you need is a phone photo of your product.</p>
      </motion.div>

      {/* Preview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2 }}
        className="relative mt-20 w-[90%] max-w-4xl h-[360px] rounded-2xl overflow-hidden border-2 border-purple-700/20 shadow-xl bg-gradient-to-br from-black/20 to-purple-800/10 backdrop-blur-xl"
      >
        <Image
          src="/ai-studio.png"
          alt=""
          fill
          style={{ objectFit: 'cover' }}
          className="rounded-xl"
          priority
        />
        <div className="absolute top-4 left-4 z-[5] bg-purple-900/60 text-white text-xs px-3 py-1 rounded-full shadow-lg animate-pulse pointer-events-none">
          Make your product look like it’s from a $10k shoot 🤑
        </div>
      </motion.div>

      {/* Before / After — The Glow-Up */}
<motion.div
  className="mt-32 w-full max-w-5xl z-10"
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }}
  viewport={{ once: true }}
>
  <h3 className="text-3xl font-bold text-center text-white mb-3">
    This Is What We Call a Glow-Up ✨
  </h3>
  <p className="text-center text-purple-300 text-sm mb-10 max-w-xl mx-auto">
    One’s from a phone camera. The other? From an AI trained to make your product look like it just dropped a 6-figure ad campaign.
  </p>
  <div className="flex flex-wrap justify-center gap-8">
    <div className="text-center">
      <Image
        src="/before.webp"
        alt="Before AI"
        width={300}
        height={300}
        className="rounded-xl object-cover border border-white/10 shadow-md"
      />
      <p className="mt-2 text-white text-xs opacity-70">BEFORE – Just vibes & low light</p>
    </div>
    <div className="text-center relative">
      <Image
        src="/after.jpg"
        alt="After AI"
        width={300}
        height={300}
        className="rounded-xl object-cover border border-purple-500 shadow-xl"
      />
      <div className="absolute top-2 left-2 bg-fuchsia-600 text-white text-[10px] px-2 py-[2px] rounded-full animate-pulse">
        AI Enhanced
      </div>
      <p className="mt-2 text-white text-xs font-semibold tracking-wide text-purple-200">
        AFTER – Looks like a $10k shoot
      </p>
    </div>
  </div>
</motion.div>


      {/* Why This Is Wild */}
      <motion.div
        className="mt-32 w-full max-w-6xl z-10"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="text-2xl text-center text-white font-bold mb-10">Why This Is Ridiculously Powerful</h2>
        <div className="grid md:grid-cols-3 gap-10 text-left text-purple-100">
          {[
            {
              title: "🧠 Your Own AI Model",
              desc: "We train a mini AI on your product. It learns your angles, textures, shadows — and builds scenes from scratch that look stunning."
            },
            {
              title: "⚡ No Studio, No Problem",
              desc: "No photographer. No gear. Just snap a photo with your phone, and we’ll turn it into a premium shot."
            },
            {
              title: "💰 The Images Sell Themselves",
              desc: "Seriously. You just upload and wait. The results look so real, you’ll question how you even did this without AI."
            }
          ].map(({ title, desc }) => (
            <div key={title} className="bg-white/5 p-6 rounded-xl border border-purple-500/10 shadow-lg">
              <h4 className="text-lg font-bold mb-2">{title}</h4>
              <p className="text-sm text-purple-200">{desc}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Testimonial */}
      <motion.div
        className="mt-32 text-center max-w-2xl z-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl font-bold mb-4">"I swear AI took these shots — I didn’t touch a thing 😭"</h2>
        <p className="text-purple-300">— Real Customer (we didn’t pay him to say that)</p>
      </motion.div>

      {/* Final CTA */}
      <motion.div
        className="mt-24 mb-20 bg-gradient-to-tr from-purple-700 via-fuchsia-700 to-pink-600 p-10 rounded-2xl text-white text-center max-w-3xl shadow-2xl"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <h3 className="text-2xl font-semibold mb-2">Let AI Shoot Your Products. You Chill.</h3>
        <p className="text-purple-100 mb-6">Upload your product. Come back in 2 minutes. Watch the magic happen.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/upload" className="bg-white text-purple-800 px-5 py-3 rounded-full font-semibold hover:scale-105 transition">
            🚀 Try It Now
          </Link>
          <Link href="/pricing" className="text-white border border-white px-5 py-3 rounded-full hover:bg-white hover:text-purple-700 transition">
            💸 Pricing
          </Link>
        </div>
        
      </motion.div>
       {/* Bottom CTA */}
        <motion.button
          className="fixed bottom-6 right-6 bg-gradient-to-tr from-pink-500 to-indigo-600 text-white px-5 py-3 rounded-full shadow-xl hover:scale-105"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
          onClick={() => router.push('/enhance')}
        >
          🚀 Launch Something
        </motion.button>
    </section>
  );
}
