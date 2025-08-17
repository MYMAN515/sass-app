// components/Footer.jsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaXTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa6';

const NAV = [
  {
    title: 'Products',
    links: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Enhance Studio', href: '/enhance' },
      { label: 'Try-On Experience', href: '/tryon' },
    ],
  },
  {
    title: 'Resources',
    links: [{ label: 'Pricing', href: '/pricing' }],
  },
  {
    title: 'Company',
    links: [{ label: 'About', href: '/about' }],
  },
  {
    title: 'Legal',
    links: [{ label: 'Privacy-Terms', href: '/privacy-terms' }],
  },
];

const SOCIALS = [
  { label: 'X', icon: FaXTwitter, href: 'https://twitter.com' },
  { label: 'Instagram', icon: FaInstagram, href: 'https://instagram.com' },
  { label: 'LinkedIn', icon: FaLinkedin, href: 'https://linkedin.com' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState({ status: 'idle', msg: '' });

  const onSubscribe = (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setState({ status: 'error', msg: 'Please enter a valid email.' });
      return;
    }
    setState({ status: 'loading', msg: 'Subscribing…' });
    setTimeout(() => {
      setState({ status: 'success', msg: 'You are in! Check your inbox.' });
      setEmail('');
    }, 900);
  };

  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-[#F3FFF8] via-[#FFFCE8] to-white text-zinc-800">
      {/* mint→lemon hairline */}
      <div className="h-px w-full bg-gradient-to-r from-[#CFFAE2] via-[#E9FFD7] to-[#FFF0A6] opacity-80" />

      {/* BG auras */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-[#D8FFEA] blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-[#FFF7B3] blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-48 w-48 rounded-full bg-[#E8FFF4] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 md:px-12 lg:px-16 py-16">
        {/* Top CTA (glassy card) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="mb-12 grid gap-6 rounded-3xl border border-zinc-200 bg-white/70 p-6 shadow-sm backdrop-blur md:grid-cols-3"
        >
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 text-xs text-zinc-600">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Join 1,200+ stores leveling up visuals
            </div>
            <h3 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900">
              Get tips, updates & exclusive credits
            </h3>
            <p className="mt-1 text-sm text-zinc-600">
              Short, useful emails. No spam. Unsubscribe anytime.
            </p>
          </div>

          <form onSubmit={onSubscribe} className="flex w-full items-center gap-2">
            <label htmlFor="footer-email" className="sr-only">
              Email
            </label>
            <input
              id="footer-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@brand.com"
              className="flex-1 rounded-xl border border-zinc-200 bg-white/80 px-4 py-3 text-sm outline-none placeholder:text-zinc-400 focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-200/60"
              aria-invalid={state.status === 'error'}
              aria-describedby="footer-email-help"
              required
            />
            <button
              type="submit"
              disabled={state.status === 'loading'}
              className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
            >
              {state.status === 'loading' ? 'Please wait…' : 'Subscribe'}
            </button>
          </form>

          {state.msg && (
            <div
              id="footer-email-help"
              aria-live="polite"
              className={`text-xs ${state.status === 'error' ? 'text-rose-600' : 'text-emerald-700'}`}
            >
              {state.msg}
            </div>
          )}
        </motion.div>

        {/* Middle: Brand + Links + Social */}
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          {/* Brand (KEEP logo + company name) */}
          <div className="col-span-2 md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-indigo-500 shadow">
                <svg width="18" height="18" viewBox="0 0 24 24" className="text-white">
                  <path
                    d="M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <span className="text-lg font-semibold tracking-tight text-zinc-900">AIStore</span>
            </Link>

            <p className="mt-3 max-w-xs text-sm text-zinc-600">
              AI studio for next-gen e-commerce visuals. Faster iteration, consistent looks, brand-ready assets.
            </p>

            {/* Social */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {SOCIALS.map(({ label, icon: Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="inline-flex size-9 items-center justify-center rounded-full border border-zinc-200 bg-white/80 text-zinc-700 transition hover:bg-white shadow-sm"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Nav groups */}
          {NAV.map((group) => (
            <div key={group.title} className="col-span-1">
              <h4 className="mb-3 font-semibold text-zinc-900">{group.title}</h4>
              <ul className="space-y-2 text-sm text-zinc-600">
                {group.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="transition hover:text-zinc-900 hover:underline underline-offset-4"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-zinc-200 pt-6 text-sm text-zinc-600 md:flex-row md:items-center">
          <div>
            <p className="text-zinc-900 font-bold text-lg">🧠 AIStore</p>
            <p className="mt-1">© {new Date().getFullYear()} AIStore. All rights reserved.</p>
            <p className="mt-1 text-zinc-500">Built with 🤎 from Qais, Jordan | UAE</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/60 bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              All systems operational
            </span>
            <Link
              href="/status"
              className="text-xs text-zinc-600 hover:text-zinc-900 underline underline-offset-4"
            >
              Status page
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
