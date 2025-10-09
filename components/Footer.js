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
      { label: 'Templates', href: '/templates' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Pricing', href: '/pricing' },
      { label: 'Documentation', href: '/docs' },
      { label: 'Blog', href: '/blog' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center', href: '/help' },
      { label: 'Contact', href: '/contact' },
      { label: 'Status', href: '/status' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy & Terms', href: '/privacy-terms' },
      { label: 'Security', href: '/security' },
      { label: 'Accessibility', href: '/accessibility' },
    ],
  },
];

const HIGHLIGHTS = [
  { value: '1.2K+', label: 'Retail teams active' },
  { value: '98%', label: 'Customer satisfaction' },
  { value: '24/7', label: 'Global support coverage' },
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
    <footer className="relative overflow-hidden bg-[#050814] text-[#F1F5F9]">
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

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-16 px-6 py-16 sm:px-10 lg:px-16">
        {/* Top CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="grid gap-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-fuchsia-900/10 backdrop-blur-xl sm:p-8 lg:grid-cols-[1.2fr,1fr]"
        >
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
              <span className="inline-block h-2 w-2 animate-ping rounded-full bg-emerald-400" />
              New drops every other week
            </div>
            <div>
              <h3 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Get the playbook for unforgettable product visuals
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70 sm:text-base">
                Actionable guides, templates, and invites to live sessions. Zero fluff, just the tools that help your team move faster.
              </p>
            </div>
            <dl className="grid gap-4 text-sm text-white/70 sm:grid-cols-3">
              {HIGHLIGHTS.map((item) => (
                <div key={item.label} className="flex flex-col rounded-2xl bg-white/5 px-4 py-3">
                  <dt className="text-xs uppercase tracking-wider text-white/50">{item.label}</dt>
                  <dd className="text-lg font-semibold text-white">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <form onSubmit={onSubscribe} className="flex w-full flex-col gap-3 rounded-2xl bg-black/30 p-4 sm:p-6">
            <label htmlFor="footer-email" className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
              Join the list
            </label>
            <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
              <input
                id="footer-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@brand.com"
                className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-fuchsia-400/60 focus:ring-2 focus:ring-fuchsia-500/40"
                aria-invalid={state.status === 'error'}
                aria-describedby="footer-email-help"
              />
              <button
                type="submit"
                disabled={state.status === 'loading'}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-900/30 transition hover:shadow-indigo-900/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {state.status === 'loading' ? 'Please wait…' : 'Subscribe'}
              </button>
            </div>
            {state.msg && (
              <div
                id="footer-email-help"
                role="status"
                aria-live="polite"
                className={`text-xs ${state.status === 'error' ? 'text-rose-300' : 'text-emerald-300'}`}
              >
                {state.msg}
              </div>
            )}
            <p className="text-[11px] text-white/40">
              By subscribing you agree to receive updates from AIStore and accept our{' '}
              <Link href="/privacy-terms" className="font-medium text-white/70 hover:text-white">
                privacy policy
              </Link>
              .
            </p>
          </form>
        </motion.div>

        {/* Middle: Links + Social */}
        <div className="grid gap-12 lg:grid-cols-[1.1fr,1fr]">
          {/* Brand */}
          <div className="space-y-8">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500 shadow-lg shadow-fuchsia-900/40">
                <svg width="22" height="22" viewBox="0 0 24 24" className="text-white">
                  <path d="M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" fill="currentColor" />
                </svg>
              </div>
              <div>
                <span className="text-xl font-semibold tracking-tight">AIStore</span>
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">Visual Intelligence</p>
              </div>
            </Link>

            <p className="max-w-md text-sm leading-relaxed text-white/70">
              From concept to campaign in minutes. AIStore delivers cohesive, shoppable visuals that match your brand energy across every touchpoint.
            </p>

            <div className="grid gap-3 text-sm text-white/70 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-white/40">Contact</p>
                <a href="mailto:hello@aistore.io" className="mt-2 block font-medium text-white hover:underline">
                  hello@aistore.io
                </a>
                <p className="mt-1 text-white/50">Mon – Fri · 9:00 – 19:00 GMT</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-white/40">HQ</p>
                <p className="mt-2 font-medium text-white">Dubai Design District</p>
                <p className="text-white/50">Dubai · UAE</p>
              </div>
            </div>

            {/* Social */}
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/40">Find us online</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {SOCIALS.map(({ label, icon: Icon, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className="inline-flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/80 transition hover:-translate-y-0.5 hover:bg-white/20 hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-8">
            {/* Mobile accordion */}
            <div className="divide-y divide-white/10 overflow-hidden rounded-3xl border border-white/10 bg-white/5 md:hidden">
              {NAV.map((group) => (
                <details key={group.title} className="group">
                  <summary className="flex cursor-pointer items-center justify-between gap-2 px-5 py-4 text-base font-semibold text-white/80 transition group-open:bg-white/5">
                    {group.title}
                    <span className="text-sm text-white/40 group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <ul className="space-y-2 px-5 pb-5 text-sm text-white/70">
                    {group.links.map((l) => (
                      <li key={l.href}>
                        <Link href={l.href} className="transition hover:text-white hover:underline">
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>

            {/* Desktop columns */}
            <div className="hidden gap-10 text-sm md:grid md:grid-cols-3 lg:grid-cols-4">
              {NAV.map((group) => (
                <div key={group.title} className="space-y-4">
                  <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/50">{group.title}</h4>
                  <ul className="space-y-2 text-white/80">
                    {group.links.map((l) => (
                      <li key={l.href}>
                        <Link href={l.href} className="transition hover:text-white hover:underline">
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-6 border-t border-white/10 pt-8 text-sm text-white/70 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-lg font-semibold text-white">🧠 AIStore</p>
            <p>© {new Date().getFullYear()} AIStore Technologies. Crafted with care between Amman & Dubai.</p>
            <p className="text-xs text-white/40">Made for teams who want fast, consistent storytelling across every channel.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              All systems operational
            </span>
            <Link href="/status" className="text-xs text-white/70 underline underline-offset-4 transition hover:text-white">
              Status page
            </Link>
            <Link href="/privacy-terms" className="text-xs text-white/70 underline underline-offset-4 transition hover:text-white">
              Privacy & Terms
            </Link>
            <Link href="/accessibility" className="text-xs text-white/70 underline underline-offset-4 transition hover:text-white">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
