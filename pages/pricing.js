// pages/pricing.js

import Layout from '@/components/Layout'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Info } from 'lucide-react'
import { Button } from '@/components/ui'

const plans = [
  {
    name: 'Pro',
    monthly: 25,
    yearly: 180,
    features: ['Up to 5 Users', 'All Tools Unlocked', 'Email Support'],
    cta: 'Start 9-day Trial',
    recommended: true,
    priceId: 'price_1RqdB6HWc2vVrAkQn7A5OtBl', // ← YOUR real Stripe Price ID for Pro
  },
  {
    name: 'Business',
    monthly: 49,
    yearly: 350,
    features: ['Unlimited Users', 'Priority Support', 'AI Powered Features'],
    cta: 'Subscribe',
    priceId: 'price_1RqfMoHWc2vVrAkQ3Y0bRKES', // ← YOUR real Stripe Price ID for Business
  },
]

export default function Pricing() {
  const [billing, setBilling] = useState('monthly')

  const handleCheckout = async (priceId) => {
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      })

      const data = await res.json()
      if (data?.url) {
        window.location.href = data.url
      } else {
        alert('Checkout session failed.')
      }
    } catch (error) {
      console.error(error)
      alert('Something went wrong. Please try again.')
    }
  }

  return (
    <Layout title="Pricing">
      <section className="max-w-7xl mx-auto px-4 py-24 text-zinc-900 dark:text-white">
        <div className="text-center mb-12">
          <motion.h1
            className="text-4xl md:text-5xl font-bold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Pricing Plans for Every Stage
          </motion.h1>
          <p className="mt-4 text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
            Choose the plan that fits your team size and goals. Simple, transparent pricing.
          </p>
          <div className="mt-6 inline-flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-full">
            {['monthly', 'yearly'].map((option) => (
              <button
                key={option}
                className={`px-4 py-1 rounded-full text-sm transition-all ${
                  billing === option
                    ? 'bg-purple-600 text-white'
                    : 'text-zinc-600 dark:text-zinc-300'
                }`}
                onClick={() => setBilling(option)}
              >
                {option === 'monthly' ? 'Monthly Billing' : 'Yearly (Save 25%)'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              className={`rounded-2xl p-6 border bg-white dark:bg-zinc-900 shadow-sm transition-all relative hover:shadow-xl ${
                plan.recommended
                  ? 'border-purple-600 shadow-lg scale-[1.02]'
                  : 'border-zinc-200 dark:border-zinc-700'
              }`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              {plan.recommended && (
                <span className="absolute top-4 right-4 text-xs bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full font-medium">
                  Recommended
                </span>
              )}
              <h2 className="text-lg font-semibold mb-2">{plan.name}</h2>
              <p className="text-3xl font-bold mb-4">
                ${billing === 'monthly' ? plan.monthly : plan.yearly}
                <span className="text-base font-medium text-zinc-400 dark:text-zinc-500 ml-1">
                  /{billing === 'monthly' ? 'mo' : 'yr'}
                </span>
              </p>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-purple-500 mt-1" />
                    {feat}
                    {feat.includes('SSO') && (
                      <Info
                        className="w-4 h-4 ml-1 text-zinc-400 cursor-pointer"
                        title="Single Sign-On and Service-Level Agreements available"
                      />
                    )}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={plan.recommended ? 'default' : 'secondary'}
                onClick={() => handleCheckout(plan.priceId)}
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </section>
    </Layout>
  )
}
