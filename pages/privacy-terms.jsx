import { Poppins } from 'next/font/google';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import Footer from '@/components/Footer'; // تأكد إنك مستورد الفوتر

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '600', '700'], display: 'swap' });

const tabs = ['Privacy Policy', 'Terms of Use'];
const sections = {
  'Privacy Policy': [
    {
      title: '1. Data We Collect',
      content: [
        'Your name, email, and login credentials',
        'Uploaded images and product media',
        'Usage logs and interaction data',
      ],
    },
    {
      title: '2. Use of Your Data',
      content: [
        'To enhance AI services and UX',
        'To notify you of critical updates',
        'To analyze platform performance',
      ],
    },
    {
      title: '3. Data Security',
      content: [
        'Data is encrypted at rest and in transit',
        'Temporary files are auto-deleted',
        'Only authorized systems access sensitive info',
      ],
    },
  ],
  'Terms of Use': [
    {
      title: '1. Acceptance',
      content: [
        'Using AIStore means you accept these terms',
        'You must be 13+ or have legal consent',
      ],
    },
    {
      title: '2. Fair Use',
      content: [
        'No illegal, explicit, or abusive content',
        'No reselling or redistributing AI outputs',
      ],
    },
    {
      title: '3. Subscription & Refunds',
      content: [
        'Plans auto-renew unless cancelled',
        'Refunds only issued for verified technical failure',
      ],
    },
  ],
};

export default function LegalPage() {
  const [activeTab, setActiveTab] = useState('Privacy Policy');

  return (
    <Layout title="Legal | AIStore">
      <main className={`${poppins.className} bg-[#0B0F19] text-[#F1F5F9] min-h-screen px-4 md:px-10 py-16`}>
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">Legal Center</h1>
          <p className="text-gray-400 text-lg mb-10">
            Everything about your rights, data & responsibility with AIStore.
          </p>

          {/* Tabs */}
          <div className="flex flex-wrap gap-4 mb-12">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all ${
                  tab === activeTab
                    ? 'bg-white text-black'
                    : 'border-gray-600 text-gray-400 hover:border-white hover:text-white'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Animated Section */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-10"
          >
            {sections[activeTab].map(({ title, content }, idx) => (
              <div key={idx}>
                <h2 className="text-2xl font-bold mb-3 text-white">{title}</h2>
                <ul className="list-disc pl-6 text-gray-300 space-y-1">
                  {content.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </motion.div>

          {/* Contact */}
          <div className="mt-20 border-t border-gray-700 pt-6 text-sm text-gray-400">
            <p>
              📧 For legal or privacy concerns, contact us at:{' '}
              <a href="mailto:legal@aistore.app" className="underline text-white hover:text-blue-400">
                legal@aistore.app
              </a>
            </p>
            <p className="mt-2">© 2025 AIStore. All rights reserved.</p>
          </div>
        </div>
      </main>

      <Footer />
    </Layout>
  );
}
