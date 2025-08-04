// /pages/_app.js
import '@/styles/globals.css'
import { Montserrat, Open_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['600', '800'],
  variable: '--font-montserrat',
})
const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-open-sans',
})

export default function App({ Component, pageProps }) {
  return (
    <>
      {/* Vercel Analytics */}
      <Analytics />

      {/* Main wrapper applies fonts and dark bg */}
      <main
        className={`
          ${montserrat.variable}
          ${openSans.variable}
          font-sans
          bg-[#0f0c29]
          min-h-screen
          text-white
        `}
      >
        <Component {...pageProps} />
      </main>
    </>
  )
}