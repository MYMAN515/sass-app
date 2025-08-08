// components/Footer.jsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaXTwitter, FaInstagram, FaYoutube, FaTiktok, FaLinkedin, FaDiscord, FaGithub,
} from 'react-icons/fa6';

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
    links: [
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy-Terms', href: '/privacy-terms' },
    ],
  },
];

const SOCIALS = [
  { label: 'X', icon: FaXTwitter, href: 'https://twitter.com' },
  { label: 'Instagram', icon: FaInstagram, href: 'https://instagram.com' },
  { label: 'LinkedIn', icon: FaLinkedin, href: 'https://linkedin.com' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState({ status: 'idle', msg: '' }); // why: تغذية راجعة فورية للمشترك

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
    <footer className="relative overflow-hidden bg-[#0B0F19] text-[#F1F5F9]">
      {/* BG FX */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-fuchsia-600/20 blur-[120px]" />
        <div className="absolute -bottom-24 -right-24 h-[22rem] w-[22rem] rounded-full bg-indigo-600/20 blur-[140px]" />
        <div className="absolute inset-0 opacity-[0.06]"
             style={{
               backgroundImage:
                 'linear-gradient(to right, rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.5) 1px, transparent 1px)',
               backgroundSize: '44px 44px',
             }}
        />
        <div
          className="absolute inset-0 opacity-[0.04] mix-blend-soft-light"
          style={{ backgroundImage: 'url("data:image/svg+xml;utf8,\
<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'1200\' height=\'600\'><filter id=\'n\'>\
<feTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/></filter>\
<rect width=\'100%\' height=\'100%\' filter=\'url(%23n)\' opacity=\'0.4\'/></svg>")' }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 md:px-12 lg:px-16 py-16">
        {/* Top CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="mb-12 grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md md:grid-cols-3"
        >
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 text-xs text-white/70">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Join 1,200+ stores leveling up visuals
            </div>
            <h3 className="mt-2 text-2xl font-bold tracking-tight">
              Get tips, updates & exclusive credits
            </h3>
            <p className="mt-1 text-sm text-white/70">
              Short, useful emails. No spam. Unsubscribe anytime.
            </p>
          </div>

          <form onSubmit={onSubscribe} className="flex w-full items-center gap-2">
            <label htmlFor="footer-email" className="sr-only">Email</label>
            <input
              id="footer-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@brand.com"
              className="flex-1 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm outline-none placeholder:text-white/50 focus:border-fuchsia-500/60"
              aria-invalid={state.status === 'error'}
              aria-describedby="footer-email-help"
            />
            <button
              type="submit"
              disabled={state.status === 'loading'}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-fuchsia-600 hover:to-indigo-600 disabled:opacity-60"
            >
              {state.status === 'loading' ? 'Please wait…' : 'Subscribe'}
            </button>
          </form>

          {state.msg && (
            <div id="footer-email-help" className={`text-xs ${state.status === 'error' ? 'text-rose-300' : 'text-emerald-300'}`}>
              {state.msg}
            </div>
          )}
        </motion.div>

        {/* Middle: Links + Social */}
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-indigo-500 shadow-lg">
                <svg width="18" height="18" viewBox="0 0 24 24" className="text-white">
                  <path d="M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" fill="currentColor" />
                </svg>
              </div>
              <span className="text-lg font-semibold tracking-tight">AIStore</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-white/70">
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
                  className="inline-flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/80 transition hover:bg-white/20"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Nav groups */}
          {NAV.map((group) => (
            <div key={group.title} className="col-span-1">
              <h4 className="mb-3 font-bold text-white">{group.title}</h4>
              <ul className="space-y-2 text-sm text-white/80">
                {group.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="transition hover:text-white hover:underline underline-offset-4"
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
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 text-sm md:flex-row md:items-center">
          <div>
            <p className="text-white font-bold text-lg">🧠 AIStore</p>
            <p className="mt-1 text-white/70">© {new Date().getFullYear()} AIStore. All rights reserved.</p>
            <p className="mt-1 text-white/50">Built with 🤎 from Qais, Jordan | UAE</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-200 border border-emerald-400/30">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              All systems operational
            </span>
            <Link href="/status" className="text-xs text-white/70 hover:text-white underline underline-offset-4">
              Status page
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
