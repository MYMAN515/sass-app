// pages/dashboard.js

import Layout from '@/components/Layout'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import Head from 'next/head'

const features = [
  {
    title: 'Enhance Studio',
    icon: '🖼️',
    description: 'Make your product photos look cinematic using AI enhancements.',
    href: '/enhance',
    cta: 'Enhance Now'
  },
  {
    title: 'Magic Copy',
    icon: '✍️',
    description: 'Transform plain descriptions into high-converting, vivid copy.',
    href: '/rewrite',
    cta: 'Rewrite Magic'
  },
  {
    title: 'Try-On Room',
    icon: '🧍‍♀️',
    description: 'Let users see your product on realistic human models instantly.',
    href: '/tryon',
    cta: 'Try It On'
  },
  {
    title: 'My Vault',
    icon: '📂',
    description: 'Your archive of AI creations. Remix, reuse, reimagine.',
    href: '/dashboard/history',
    cta: 'Open Vault'
  }
]

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

export async function getServerSideProps(ctx) {
  let user = null
  try {
    user = JSON.parse(ctx.req.cookies['user'] || null)
  } catch (e) {}

  if (!user) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }

  return {
    props: {
      user,
    },
  }
}

export default function Dashboard() {
  const router = useRouter()

  return (
    <Layout title="Dashboard">
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@600&display=swap" rel="stylesheet" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] px-6 py-16 text-white relative overflow-hidden">
        {/* Hero */}
        <motion.h1
          className="text-5xl font-bold text-center mb-10 drop-shadow-[0_2px_8px_rgba(200,0,255,0.7)]"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          style={{ fontFamily: 'Orbitron' }}
        >
          Welcome Back, Visionary 👁️‍🗨️
        </motion.h1>

        {/* Feature Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          initial="hidden"
          animate="show"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              variants={cardVariants}
              whileHover={{ scale: 1.05 }}
              className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-fuchsia-500/30 transition duration-300 cursor-pointer"
              onClick={() => router.push(f.href)}
            >
              <div className="text-4xl mb-3">{f.icon}</div>
              <h2 className="text-xl font-semibold mb-2">{f.title}</h2>
              <p className="text-sm text-white/80 mb-4">{f.description}</p>
              <button className="text-xs uppercase bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-full shadow-md">
                {f.cta}
              </button>
            </motion.div>
          ))}
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
      </div>
    </Layout>
  )
}
