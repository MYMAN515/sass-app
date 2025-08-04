<<<<<<< HEAD
// pages/pricing.jsx
'use client'
import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'
import Button from '@/components/ui/Button'; // ✅ correct for default export
import Layout from '@/components/Layout'
=======
'use client';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Layout from '@/components/Layout';
import { useEffect, useState } from 'react';
>>>>>>> 292c6fba (New Front-end | Back-End|)

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
<<<<<<< HEAD
    gradient: 'bg-white text-black',
    shadow: 'shadow-xl',
=======
>>>>>>> 292c6fba (New Front-end | Back-End|)
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
<<<<<<< HEAD
    icon: '↗️',
    gradient: 'bg-gradient-to-br from-purple-500 to-indigo-500 text-white',
    shadow: 'shadow-2xl',
=======
    icon: '🚀',
>>>>>>> 292c6fba (New Front-end | Back-End|)
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
<<<<<<< HEAD
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
=======
  },
];

export default function PricingPage() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const observer = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    observer(); // run on mount

    const mo = new MutationObserver(observer);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => mo.disconnect();
  }, []);

  return (
    <Layout title="Pricing">
      <div className={`min-h-screen py-24 px-6 transition-colors duration-500 ${isDark ? 'bg-zinc-900 text-white' : 'bg-gradient-to-b from-[#f3f4ff] to-[#fff0f6] text-black'}`}>
        <div className="text-center mb-16">
          <motion.h1
            className="text-5xl font-bold"
>>>>>>> 292c6fba (New Front-end | Back-End|)
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
<<<<<<< HEAD
            Pricing
          </motion.h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              className={`rounded-3xl p-8 ${plan.gradient} ${plan.shadow} flex flex-col justify-between items-center text-center`}
=======
            Pricing Plans
          </motion.h1>
          <p className="text-lg mt-4 text-zinc-500 dark:text-zinc-400">
            Choose the plan that fits your business.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              className={`rounded-3xl p-8 border transition-all duration-300 text-center flex flex-col justify-between shadow-xl hover:shadow-2xl ${
                isDark
                  ? 'bg-zinc-800 text-white border-zinc-700'
                  : 'bg-white text-zinc-900 border-zinc-200'
              }`}
>>>>>>> 292c6fba (New Front-end | Back-End|)
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2, duration: 0.6 }}
            >
              <div className="text-4xl mb-4">{plan.icon}</div>
              <h3 className="text-2xl font-semibold mb-1">{plan.name}</h3>
              <p className="text-3xl font-bold mb-1">{plan.price}</p>
              {plan.period && (
<<<<<<< HEAD
                <span className="text-zinc-400 text-sm mb-6">{plan.period}</span>
              )}

              <ul className="text-sm space-y-4 mb-8">
=======
                <span className="text-zinc-400 dark:text-zinc-500 text-sm mb-6">{plan.period}</span>
              )}

              <ul className="text-sm space-y-4 mb-8 mt-4">
>>>>>>> 292c6fba (New Front-end | Back-End|)
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 justify-center">
                    <CheckCircle className="w-4 h-4 text-purple-500" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
<<<<<<< HEAD
                className="w-full py-2 text-base font-medium rounded-xl shadow-md hover:scale-105 transition-transform"
=======
                className="w-full py-2 text-base font-medium rounded-xl shadow-md hover:scale-105 transition-transform bg-purple-600 text-white"
>>>>>>> 292c6fba (New Front-end | Back-End|)
                variant="default"
              >
                {plan.button}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
<<<<<<< HEAD
  )
=======
  );
>>>>>>> 292c6fba (New Front-end | Back-End|)
}
