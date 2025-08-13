// /pages/_app.js
import '@/styles/globals.css';
import { Montserrat, Open_Sans } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';

import { useState } from 'react';
// ✅ الصحيح مع Pages Router
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['600', '800'],
  variable: '--font-montserrat',
});

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-open-sans',
});

export default function App({ Component, pageProps }) {
  // أنشئ عميل واحد فقط طوال عمر التطبيق
  const [supabaseClient] = useState(() => createPagesBrowserClient());

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <Analytics />
      <div
        className={`
          ${montserrat.variable} ${openSans.variable}
          font-sans bg-[#0f0c29] min-h-screen text-white
        `}
      >
        <Component {...pageProps} />
      </div>
    </SessionContextProvider>
  );
}
