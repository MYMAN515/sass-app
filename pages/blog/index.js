// pages/blog/index.js
'use client';

import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import Layout from '@/components/Layout';

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function SkeletonCard() {
  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 backdrop-blur animate-pulse">
      <div className="h-44 bg-white/10" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-2/3 bg-white/10 rounded" />
        <div className="h-3 w-5/6 bg-white/10 rounded" />
        <div className="h-3 w-4/6 bg-white/10 rounded" />
      </div>
    </div>
  );
}

function ArticleCard({ p }) {
  return (
    <motion.div whileHover={{ y: -4 }} className="group border border-white/10 rounded-2xl overflow-hidden bg-white/5 backdrop-blur">
      <Link href={`/blog/${p.slug}`} className="block">
        <div className="relative">
          {p.cover_url ? (
            <img src={p.cover_url} alt="" className="w-full h-44 object-cover" />
          ) : (
            <div className="w-full h-44 bg-gradient-to-br from-fuchsia-600/20 to-violet-600/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            {p.language && (
              <span className="px-2 py-0.5 rounded-full border border-white/10 bg-white/5">
                {p.language}
              </span>
            )}
            {p.published_at && <span>{formatDate(p.published_at)}</span>}
          </div>
          <h2 className="font-semibold text-lg mt-2 line-clamp-2 group-hover:underline">
            {p.title}
          </h2>
          <p className="text-sm text-gray-300 mt-2 line-clamp-3">{p.excerpt}</p>
        </div>
      </Link>
    </motion.div>
  );
}

export default function BlogIndex() {
  const [posts, setPosts] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('posts')
        .select('id, title, slug, excerpt, cover_url, published_at, created_at, language')
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      setPosts(data || []);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return posts;
    return posts.filter(
      (p) =>
        (p.title || '').toLowerCase().includes(s) ||
        (p.excerpt || '').toLowerCase().includes(s)
    );
  }, [posts, q]);

  return (
    <Layout>
      <Head>
        <title>Blog — AIStore</title>
        <meta
          name="description"
          content="Guides, case studies, and product imagery tips from AIStore."
        />
      </Head>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 pt-10">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-600/10 to-fuchsia-500/10">
          <div className="absolute inset-0 pointer-events-none [background-image:radial-gradient(circle_at_20%_20%,rgba(255,255,255,.12),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,.08),transparent_30%)]" />
          <div className="p-8 sm:p-12">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Blog</h1>
            <p className="mt-2 text-gray-300 max-w-2xl">
              Insights, tutorials, and updates to help you craft world-class product visuals.
            </p>

            <div className="mt-6 max-w-md">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search articles..."
                className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => (
              <ArticleCard key={p.id} p={p} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-24">No posts yet.</div>
        )}
      </section>
    </Layout>
  );
}
