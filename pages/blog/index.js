'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import Layout from '@/components/Layout';

export default function BlogIndex() {
  const [posts, setPosts] = useState([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase
        .from('posts')
        .select('title, slug, excerpt, cover_url, published_at, created_at, language')
        .eq('status','published')
        .order('published_at', { ascending: false });
      setPosts(data || []);
    };
    fetchPosts();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return posts;
    return posts.filter(p =>
      (p.title || '').toLowerCase().includes(s) ||
      (p.excerpt || '').toLowerCase().includes(s)
    );
  }, [posts, q]);

  return (
    <Layout>
      <Head>
        <title>Blog — AIStore</title>
        <meta name="description" content="Latest articles, tutorials, and updates from AIStore." />
      </Head>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
          <div className="sm:ml-auto w-full sm:w-80">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search articles..."
              className="w-full px-4 py-2 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/50"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(p => (
            <motion.div key={p.slug} whileHover={{ y: -4 }} className="border rounded-2xl overflow-hidden bg-white">
              <Link href={`/blog/${p.slug}`} className="block">
                {p.cover_url && (
                  <img src={p.cover_url} alt="" className="w-full h-44 object-cover" />
                )}
                <div className="p-4">
                  <h2 className="font-semibold text-lg line-clamp-2">{p.title}</h2>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-3">{p.excerpt}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {!filtered.length && (
          <div className="text-center text-gray-500 py-20">No posts yet.</div>
        )}
      </div>
    </Layout>
  );
}

