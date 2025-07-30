// pages/dashboard.js

import Layout from '@/components/Layout'
import { Button } from '@/components/ui'
import { motion } from 'framer-motion'
import { useRouter } from 'next/router'
import Cookies from 'js-cookie'

const actions = [
  {
    title: 'Enhance Image',
    description: 'Make your product photos pop using AI magic.',
    href: '/enhance',
  },
  {
    title: 'Rewrite Description',
    description: 'Turn dull product copy into scroll-stopping gold.',
    href: '/rewrite',
  },
  {
    title: 'AI Try-On',
    description: 'Let shoppers see clothes on real models instantly.',
    href: '/tryon',
  },
]

const gridVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
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
      <div className="max-w-6xl mx-auto py-14 px-4">
        <motion.h1
          className="text-4xl font-bold text-zinc-900 dark:text-white text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Welcome to AI Store Assistant 👋
        </motion.h1>

        <motion.div
          className="grid gap-8 grid-cols-1 md:grid-cols-3"
          variants={gridVariants}
          initial="hidden"
          animate="show"
        >
          {actions.map((action) => (
            <motion.div
              key={action.title}
              className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-6 border hover:shadow-2xl transition-all"
              variants={cardVariants}
            >
              <h2 className="text-xl font-semibold text-purple-700 dark:text-purple-300 mb-2">
                {action.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{action.description}</p>
              <Button variant="secondary" onClick={() => router.push(action.href)}>
                Get Started
              </Button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Layout>
  )
}