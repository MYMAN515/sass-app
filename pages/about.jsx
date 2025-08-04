import Layout from '@/components/Layout';
import { Poppins } from 'next/font/google';
import { motion } from 'framer-motion';

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '600', '700'], display: 'swap' });

export default function AboutPage() {
  return (
    <Layout title="About | AIStore">
      <main className={`${poppins.className}`}>
        <div className="max-w-6xl mx-auto py-20 px-6 text-[#F1F5F9]">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">About AIStore</h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
              We're not just enhancing images. We're transforming the way e-commerce stores create, manage, and showcase their products — with the power of AI.
            </p>
          </motion.div>

          {/* Sections */}
          <div className="grid md:grid-cols-2 gap-16">

            {/* Mission */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold mb-3 text-white">🚀 Our Mission</h2>
              <p className="text-gray-300 leading-relaxed">
                Our mission is to empower digital sellers with tools that make content creation seamless, beautiful, and scalable.
                Whether you're a small boutique or a global brand, AIStore helps you look professional without breaking your workflow.
              </p>
            </motion.div>

            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold mb-3 text-white">🎯 Our Vision</h2>
              <p className="text-gray-300 leading-relaxed">
                We believe in a world where creativity meets automation — where AI isn’t just a backend buzzword,
                but a tool that elevates business owners and creators to their highest potential.
              </p>
            </motion.div>

            {/* Values */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="md:col-span-2"
            >
              <h2 className="text-2xl font-bold mb-4 text-white">💡 Core Values</h2>
              <ul className="text-gray-300 space-y-2 list-disc list-inside">
                <li>Innovation over imitation</li>
                <li>Data privacy and transparency</li>
                <li>Design-driven experiences</li>
                <li>Speed, simplicity, and security</li>
                <li>Customer-first mentality</li>
              </ul>
            </motion.div>

            {/* Team Highlight */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="md:col-span-2"
            >
              <h2 className="text-2xl font-bold mb-4 text-white">👨‍💻 Meet the Creator</h2>
              <p className="text-gray-300 leading-relaxed">
                AIStore is built by <strong className="text-white">Qais Bin Rakan</strong>, a developer, designer, and strategist
                passionate about using AI to make entrepreneurship easier, faster, and more beautiful. With 6+ years of AI & SaaS,
                AIStore reflects deep love for tech, design, and usability.
              </p>
            </motion.div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
