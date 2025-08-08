// pages/legal.js
'use client';

import { Poppins } from 'next/font/google';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import Footer from '@/components/Footer';
import Link from 'next/link';

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '600', '700'], display: 'swap' });

const TABS = [
  { key: 'privacy', label: 'Privacy Policy', hash: '#privacy' },
  { key: 'terms', label: 'Terms of Use', hash: '#terms' },
];

const DATA = {
  privacy: [
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
  terms: [
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

function slugify(s) {
  return s.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
}

export default function LegalPage() {
  const [activeKey, setActiveKey] = useState('privacy');
  const [query, setQuery] = useState('');
  const [copiedId, setCopiedId] = useState('');
  const [currentSection, setCurrentSection] = useState('');
  const containerRef = useRef(null);
  const indicatorRef = useRef(null);

  // تبويب بحسب الهاش
  useEffect(() => {
    const applyFromHash = () => {
      const h = (typeof window !== 'undefined' && window.location.hash || '').toLowerCase();
      const found = TABS.find(t => t.hash === h);
      setActiveKey(found?.key || 'privacy');
    };
    applyFromHash();
    window.addEventListener('hashchange', applyFromHash);
    return () => window.removeEventListener('hashchange', applyFromHash);
  }, []);

  // تحديث الهاش عند تغيير التبويب
  useEffect(() => {
    const tab = TABS.find(t => t.key === activeKey);
    if (!tab) return;
    if (window.location.hash !== tab.hash) {
      history.replaceState(null, '', tab.hash);
    }
  }, [activeKey]);

  // فهرس الأقسام
  const sections = useMemo(() => {
    const list = DATA[activeKey] || [];
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list
      .map(sec => ({
        ...sec,
        content: sec.content.filter(item => item.toLowerCase().includes(q)),
        _keep: sec.title.toLowerCase().includes(q) || sec.content.some(c => c.toLowerCase().includes(q)),
      }))
      .filter(s => s._keep)
      .map(({ _keep, ...rest }) => rest);
  }, [activeKey, query]);

  // Scroll-spy
  useEffect(() => {
    const target = containerRef.current;
    if (!target) return;
    const headings = Array.from(target.querySelectorAll('section[data-legal-section="true"]'));
    const io = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setCurrentSection(visible.target.id);
      },
      { root: null, rootMargin: '0px 0px -70% 0px', threshold: [0.2, 0.4, 0.6] }
    );
    headings.forEach(h => io.observe(h));
    return () => io.disconnect();
  }, [activeKey, sections.length]);

  const lastUpdated = 'July 15, 2025';

  const onCopy = async (id) => {
    try {
      const url = `${window.location.origin}${window.location.pathname}${window.location.hash ? '' : TABS.find(t => t.key === activeKey)?.hash || ''}#${id}`;
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(''), 1200);
    } catch {}
  };

  return (
    <Layout title="Legal | AIStore">
      <main className={`${poppins.className} bg-[#0B0F19] text-[#F1F5F9] min-h-screen`}>
        {/* Hero */}
        <div className="relative overflow-hidden">
          <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-fuchsia-600/20 blur-[120px]" />
          <div className="absolute -bottom-24 -right-24 h-[22rem] w-[22rem] rounded-full bg-indigo-600/20 blur-[140px]" />
          <div className="relative mx-auto max-w-6xl px-4 md:px-8 lg:px-10 py-14">
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="text-4xl md:text-5xl font-bold text-white tracking-tight"
            >
              Legal Center
            </motion.h1>
            <p className="text-gray-400 text-lg mt-2">
              Everything about your rights, data & responsibility with AIStore.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-white/70">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                GDPR-aware
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1">
                Encrypted in transit & at rest
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1">
                Updated: {lastUpdated}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs + Search */}
        <div className="mx-auto max-w-6xl px-4 md:px-8 lg:px-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:w-auto">
              <div className="inline-flex rounded-2xl border border-white/10 bg-white/5 p-1 backdrop-blur">
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setActiveKey(t.key)}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                        const idx = TABS.findIndex(x => x.key === activeKey);
                        const next = e.key === 'ArrowRight'
                          ? TABS[(idx + 1) % TABS.length]
                          : TABS[(idx - 1 + TABS.length) % TABS.length];
                        setActiveKey(next.key);
                      }
                    }}
                    className={`relative z-10 px-4 py-2 text-sm font-semibold rounded-xl transition ${
                      activeKey === t.key ? 'text-white' : 'text-white/70 hover:text-white'
                    }`}
                    aria-pressed={activeKey === t.key}
                    aria-current={activeKey === t.key ? 'page' : undefined}
                  >
                    {t.label}
                    {activeKey === t.key && (
                      <motion.span
                        layoutId="tab-pill"
                        className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 shadow-[0_10px_30px_-10px_rgba(236,72,153,.45)]"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="legal-search" className="sr-only">Search</label>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <svg width="16" height="16" viewBox="0 0 24 24" className="text-white/60"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.471 6.471 0 0 0 1.57-4.23A6.5 6.5 0 1 0 9.5 15c1.61 0 3.09-.59 4.23-1.57l.27.28v.79L20 20.49 21.49 19 15.5 14Zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14Z"/></svg>
                <input
                  id="legal-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search in this page…"
                  className="bg-transparent text-sm outline-none placeholder:text-white/50"
                />
              </div>
              <button
                onClick={() => window.print()}
                className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold hover:bg-white/10 transition"
              >
                <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M19 8H5a3 3 0 0 0-3 3v5h4v4h12v-4h4v-5a3 3 0 0 0-3-3M7 18v-4h10v4M19 5H5V3h14Z"/></svg>
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-6xl px-4 md:px-8 lg:px-10 mt-8 pb-20 grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* TOC */}
          <aside className="md:col-span-3">
            <div className="sticky top-24 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm backdrop-blur">
              <div className="mb-2 font-semibold text-white/80">On this page</div>
              <ul className="space-y-1">
                {(DATA[activeKey] || []).map((s) => {
                  const id = slugify(s.title);
                  const active = currentSection === id;
                  return (
                    <li key={id}>
                      <a
                        href={`#${id}`}
                        className={`block rounded-lg px-2 py-1 transition ${
                          active ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {s.title}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

          {/* Sections */}
          <section className="md:col-span-9 space-y-6" ref={containerRef}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/80 backdrop-blur"
            >
              <div>These terms complement our mission to provide a secure, reliable, and fair platform. For specific regional requirements (GDPR/CCPA), contact <a className="underline" href="mailto:legal@aistore.app">legal@aistore.app</a>.</div>
            </motion.div>

            {sections.map(({ title, content }) => {
              const id = slugify(title);
              const isCopied = copiedId === id;
              return (
                <motion.section
                  key={id}
                  id={id}
                  data-legal-section="true"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.35 }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-2xl font-bold text-white">{title}</h2>
                    <button
                      onClick={() => onCopy(id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10 transition"
                      title="Copy section link"
                      aria-label="Copy section link"
                    >
                      {isCopied ? (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M9 16.17 4.83 12 3.41 13.41 9 19l12-12-1.41-1.41z"/></svg>
                          Copied
                        </>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M3.9 12a5 5 0 0 1 1.46-3.54l2.1-2.1a5 5 0 0 1 7.07 0l.71.7-1.41 1.42-.7-.71a3 3 0 0 0-4.25 0l-2.12 2.12a3 3 0 0 0 0 4.25l.7.71-1.41 1.41-.7-.7A5 5 0 0 1 3.9 12Zm6.36 6.36.7.71a5 5 0 0 0 7.07 0l2.12-2.12a5 5 0 0 0 0-7.07l-.7-.71-1.42 1.41.71.71a3 3 0 0 1 0 4.25l-2.12 2.12a3 3 0 0 1-4.25 0l-.71-.71-1.41 1.41Z"/></svg>
                          Copy link
                        </>
                      )}
                    </button>
                  </div>
                  <ul className="mt-3 list-disc pl-5 text-white/80 space-y-1">
                    {content.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </motion.section>
              );
            })}

            {/* Contact + Meta */}
            <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-white/70">
                📧 For legal or privacy concerns, contact us at:{' '}
                <a href="mailto:legal@aistore.app" className="underline hover:text-white">legal@aistore.app</a>
              </div>
              <div className="text-xs text-white/50">
                © {new Date().getFullYear()} AIStore. All rights reserved.
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
      <style jsx global>{`
        @media print {
          header, footer, nav, .sticky, .backdrop-blur { display: none !important; }
          main { background: #fff !important; color: #000 !important; }
          a { color: #000 !important; text-decoration: underline; }
          .border, .bg-white\\/5, .bg-white\\/10 { border: none !important; background: transparent !important; }
        }
      `}</style>
    </Layout>
  );
}
