// pages/admin/blog/index.js
'use client';

import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import Layout from '@/components/Layout';

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function BlogAdmin() {
  const router = useRouter();
  const supabase = useMemo(() => createPagesBrowserClient(), []);

  const [session, setSession] = useState(null);
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('pending'); // pending | draft | published | rejected | all
  const [q, setQ] = useState('');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [msg, setMsg] = useState('');

  // Auth + role
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!session?.user) {
        router.replace(`/login?next=${encodeURIComponent('/admin/blog')}`);
        return;
      }
      setSession(session);

      const { data: roleRow } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .maybeSingle();

      setRole(roleRow?.role || '');
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, [supabase, router]);

  // Fetch posts
  useEffect(() => {
    if (!session?.user) return;
    (async () => {
      setLoading(true);
      let query = supabase
        .from('posts')
        .select('id, title, slug, excerpt, cover_url, status, language, created_at, published_at')
        .order('created_at', { ascending: false });
      if (status !== 'all') query = query.eq('status', status);
      const { data } = await query;
      setPosts(data || []);
      setLoading(false);
    })();
  }, [session, status, supabase]);

  const filtered = posts.filter(p => {
    const s = q.trim().toLowerCase();
    if (!s) return true;
    return (p.title || '').toLowerCase().includes(s) || (p.excerpt || '').toLowerCase().includes(s);
  });

  async function act(id, action) {
    try {
      setBusyId(id + action);
      const res = await fetch('/api/blog/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');
      setMsg('Done');
      // refresh
      let query = supabase
        .from('posts')
        .select('id, title, slug, excerpt, cover_url, status, language, created_at, published_at')
        .order('created_at', { ascending: false });
      if (status !== 'all') query = query.eq('status', status);
      const { data: refreshed } = await query;
      setPosts(refreshed || []);
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusyId('');
      setTimeout(() => setMsg(''), 1200);
    }
  }

  async function del(id) {
    if (!confirm('Delete this post?')) return;
    try {
      setBusyId(id + 'delete');
      const res = await fetch('/api/blog/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      setPosts(prev => prev.filter(p => p.id !== id));
      setMsg('Deleted');
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusyId('');
      setTimeout(() => setMsg(''), 1200);
    }
  }

  if (!session?.user) {
    return <Layout><div className="max-w-5xl mx-auto p-6">Checking session…</div></Layout>;
  }
  if (!['admin', 'editor'].includes(role)) {
    return <Layout><div className="max-w-5xl mx-auto p-6">Access denied.</div></Layout>;
  }

  return (
    <Layout>
      <Head><title>Blog Admin — AIStore</title></Head>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <h1 className="text-2xl font-bold">Blog Moderation</h1>
          <div className="sm:ml-auto flex items-center gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search…"
              className="px-3 py-2 rounded-2xl bg-white/5 border border-white/10"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 rounded-2xl bg-white/5 border border-white/10"
            >
              <option value="pending">Pending</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="rejected">Rejected</option>
              <option value="all">All</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-10 text-gray-400">Loading…</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {filtered.map(p => (
              <motion.div key={p.id} whileHover={{ y: -3 }} className="border border-white/10 rounded-2xl p-4 bg-white/5 backdrop-blur">
                <div className="flex items-start gap-4">
                  {p.cover_url
                    ? <img src={p.cover_url} alt="" className="w-24 h-24 object-cover rounded-xl" />
                    : <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-fuchsia-600/20 to-violet-600/20" />
                  }

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded-full border border-white/10 bg-white/5">{p.status}</span>
                      {p.published_at && <span className="text-xs text-gray-400">{formatDate(p.published_at)}</span>}
                    </div>
                    <h2 className="font-semibold line-clamp-1">{p.title}</h2>
                    <p className="text-sm text-gray-300 line-clamp-2">{p.excerpt}</p>

                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {p.status !== 'published' && (
                        <button
                          disabled={busyId === p.id + 'publish'}
                          onClick={() => act(p.id, 'publish')}
                          className="px-3 py-1.5 rounded-xl bg-fuchsia-600 text-white text-sm disabled:opacity-60"
                        >Publish</button>
                      )}
                      {p.status === 'published' && (
                        <button
                          disabled={busyId === p.id + 'unpublish'}
                          onClick={() => act(p.id, 'unpublish')}
                          className="px-3 py-1.5 rounded-xl border border-white/15 text-sm disabled:opacity-60"
                        >Unpublish</button>
                      )}
                      {p.status !== 'rejected' && (
                        <button
                          disabled={busyId === p.id + 'reject'}
                          onClick={() => act(p.id, 'reject')}
                          className="px-3 py-1.5 rounded-xl border border-white/15 text-sm disabled:opacity-60"
                        >Reject</button>
                      )}
                      <button
                        disabled={busyId === p.id + 'delete'}
                        onClick={() => del(p.id)}
                        className="px-3 py-1.5 rounded-xl border border-white/15 text-sm disabled:opacity-60"
                      >Delete</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {msg && <div className="mt-4 text-sm text-gray-300">{msg}</div>}
      </div>
    </Layout>
  );
}
