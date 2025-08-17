// /pages/_app.js
import '@/styles/globals.css';
import { Analytics } from '@vercel/analytics/react';

import { useState } from 'react';
// ✅ الصحيح مع Pages Router
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';

export default function App({ Component, pageProps }) {
  // أنشئ عميل واحد فقط طوال عمر التطبيق
  const [supabaseClient] = useState(() => createPagesBrowserClient());

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <Analytics />
      <Component {...pageProps} />
    </SessionContextProvider>
  );
}
