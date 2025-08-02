// pages/pricing.jsx
'use client'
import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'
import Button from '@/components/ui/Button'; // ✅ correct for default export
import Layout from '@/components/Layout'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    features: [
      '5 credits per month',
      'Basic image enhancement',
      'AI try-on for models',
    ],
    button: 'Start for Free',
    icon: '⭐',
    gradient: 'bg-white text-black',
    shadow: 'shadow-xl',
  },
  {
    name: 'Pro',
    price: '$20',
    period: '/month',
    features: [
      'Unlimited credits',
      'Advanced enhancement',
      'AI try-on for models',
    ],
    button: 'Upgrade',
    icon: '↗️',
    gradient: 'bg-gradient-to-br from-purple-500 to-indigo-500 text-white',
    shadow: 'shadow-2xl',
  },
  {
    name: 'Enterprise',
    price: 'Custom pricing',
    period: '',
    features: [
      'Unlimited credits',
      'Advanced enhancement',
      'Dedicated account manager',
    ],
    button: 'Contact Us',
    icon: '💼',
    gradient: 'bg-white text-black',
    shadow: 'shadow-xl',
  },
]

export default function PricingPage() {
  return (
    <Layout title="Pricing">
      <div className="min-h-screen bg-gradient-to-b from-[#f3f4ff] to-[#fff0f6] py-24 px-6">
        <div className="text-center mb-16">
          <motion.h1
            className="text-5xl font-bold text-zinc-900"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Pricing
          </motion.h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              className={`rounded-3xl p-8 ${plan.gradient} ${plan.shadow} flex flex-col justify-between items-center text-center`}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2, duration: 0.6 }}
            >
              <div className="text-4xl mb-4">{plan.icon}</div>
              <h3 className="text-2xl font-semibold mb-1">{plan.name}</h3>
              <p className="text-3xl font-bold mb-1">{plan.price}</p>
              {plan.period && (
                <span className="text-zinc-400 text-sm mb-6">{plan.period}</span>
              )}

              <ul className="text-sm space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 justify-center">
                    <CheckCircle className="w-4 h-4 text-purple-500" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                className="w-full py-2 text-base font-medium rounded-xl shadow-md hover:scale-105 transition-transform"
                variant="default"
              >
                {plan.button}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
