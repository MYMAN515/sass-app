// pages/blog/new.js
'use client';

import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';
import Layout from '@/components/Layout';

const BUCKET = 'blog'; // أنشئ Bucket بهذا الاسم واجعله Public

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
  const [msg, setMsg] = useState('');

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
    const { error } = await supabase.storage.from(BUCKET).upload(filePath, coverFile, { upsert: true });
    if (error) throw new Error(error.message);
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
        body: JSON.stringify({
          title,
          language,
          excerpt,
          content_md: content,
          cover_url: uploaded
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setMsg('تم إرسال المقال للمراجعة ✅');
      setTimeout(() => router.push(`/blog/${data.slug}`), 900);
    } catch (err) {
      setMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Layout><div className="max-w-3xl mx-auto p-6">Loading…</div></Layout>;

  return (
    <Layout>
      <Head><title>New Post — AIStore Blog</title></Head>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6">Create a new post</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm mb-1">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required
              className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Language</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10">
                <option value="en">English</option>
                <option value="ar">Arabic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Cover Image</label>
              <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Excerpt (optional)</label>
            <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)}
              className="w-full h-24 p-3 rounded-2xl bg-white/5 border border-white/10" />
          </div>

          <div>
            <label className="block text-sm mb-2">Content (Markdown)</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post in Markdown…"
              className="w-full h-80 p-4 rounded-2xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60" />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button disabled={submitting}
              className="px-5 py-2 rounded-2xl bg-fuchsia-600 text-white disabled:opacity-60">
              {submitting ? 'Submitting…' : 'Submit for Review'}
            </button>
            {msg && <span className="text-sm text-gray-300">{msg}</span>}
          </div>
        </form>
      </div>
    </Layout>
  );
}
