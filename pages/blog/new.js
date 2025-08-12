'use client';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import Layout from '@/components/Layout';
import MarkdownEditor from '@/components/MarkdownEditor';

const BUCKET = 'blog'; // create this bucket (public) in Supabase Storage

export default function NewPostPage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('en');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [coverUrl, setCoverUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
      if (!session?.user) router.replace('/login');
    })();
  }, [router]);

  async function uploadCoverIfNeeded() {
    if (!coverFile) return coverUrl || null;
    const filePath = `covers/${Date.now()}-${coverFile.name}`;
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(filePath, coverFile, { upsert: true });
    if (upErr) throw new Error(upErr.message);
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    return data.publicUrl;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setSubmitting(true);
      const uploaded = await uploadCoverIfNeeded();
      const res = await fetch('/api/blog/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, language, excerpt, content_md: content, cover_url: uploaded }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setMessage('Submitted for review.');
      setTimeout(() => router.push(`/blog/${data.slug}`), 900);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Layout><div className="max-w-3xl mx-auto p-6">Loading…</div></Layout>;

  return (
    <Layout>
      <Head>
        <title>New Post — AIStore Blog</title>
      </Head>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6">Create a new post</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-4 py-2 border rounded-2xl" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Language</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full px-4 py-2 border rounded-2xl">
                <option value="en">English</option>
                <option value="ar">Arabic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cover Image</label>
              <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} className="w-full" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Excerpt (optional)</label>
            <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="w-full h-24 p-3 border rounded-2xl" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <MarkdownEditor value={content} onChange={setContent} />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button disabled={submitting} className="px-5 py-2 rounded-2xl bg-black text-white disabled:opacity-60">
              {submitting ? 'Submitting…' : 'Submit for Review'}
            </button>
            {message && <span className="text-sm text-gray-600">{message}</span>}
          </div>
        </form>
      </div>
    </Layout>
  );
}

