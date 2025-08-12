// pages/blog/new.js
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';

const BUCKET = 'blog';                  // Ensure this Storage bucket exists and is Public
const DRAFT_KEY = 'blog_new_draft_v1';  // Local draft key

export default function NewPostPage() {
  const router = useRouter();
  const supabase = useMemo(() => createPagesBrowserClient(), []);

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('en');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [coverUrl, setCoverUrl] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [tab, setTab] = useState('edit'); // edit | preview

  const saveTimer = useRef(null);

  // Session check + redirect to login with return path
  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(session);
      setLoading(false);

      if (!session?.user) {
        const next = encodeURIComponent('/blog/new');
        router.replace(`/login?next=${next}`);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase, router]);

  // Derived UX info
  const contentWordCount = useMemo(
    () => (content?.trim()?.match(/\S+/g) || []).length,
    [content]
  );
  const readingMinutes = useMemo(
    () => Math.max(1, Math.round(contentWordCount / 200)),
    [contentWordCount]
  );

  // Auto-save local draft (debounced)
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const draft = {
        title,
        language,
        excerpt,
        content,
        coverUrlMeta: coverUrl ? { url: coverUrl } : null,
        ts: Date.now(),
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }, 500);
    return () => clearTimeout(saveTimer.current);
  }, [title, language, excerpt, content, coverUrl]);

  function restoreDraft() {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return setMsg('No saved draft found.');
      const d = JSON.parse(raw);
      setTitle(d.title || '');
      setLanguage(d.language || 'en');
      setExcerpt(d.excerpt || '');
      setContent(d.content || '');
      if (d.coverUrlMeta?.url) setCoverUrl(d.coverUrlMeta.url);
      setMsg('Draft restored ✅');
      setTimeout(() => setMsg(''), 1200);
    } catch {
      setMsg('Could not restore draft.');
    }
  }

  function clearDraft() {
    localStorage.removeItem(DRAFT_KEY);
    setMsg('Draft cleared.');
    setTimeout(() => setMsg(''), 1200);
  }

  // Upload cover if needed
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

    // Basic validation
    if (title.trim().length < 6) {
      setMsg('Title is too short (min 6 characters).');
      return;
    }
    if (contentWordCount < 50) {
      setMsg('Content is too short (min 50 words).');
      return;
    }

    try {
      setSubmitting(true);
      setMsg('Submitting...');
      const uploaded = await uploadCoverIfNeeded();

      const res = await fetch('/api/blog/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          language,
          excerpt,
          content_md: content,
          cover_url: uploaded,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create post');

      setMsg('Submitted for review ✅');
      localStorage.removeItem(DRAFT_KEY);
      setTimeout(() => router.push(`/blog/${data.slug}`), 900);
    } catch (err) {
      setMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function onDropFiles(files) {
    const f = files?.[0];
    if (!f) return;
    setCoverFile(f);
    setCoverUrl(URL.createObjectURL(f)); // local preview
  }

  function handleKeyDown(e) {
    const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().includes('MAC');
    if ((isMac && e.metaKey && e.key === 'Enter') || (!isMac && e.ctrlKey && e.key === 'Enter')) {
      handleSubmit(e);
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto p-6">Loading…</div>
      </Layout>
    );
  }

  const userName =
    session?.user?.user_metadata?.full_name ||
    session?.user?.email?.split('@')[0] ||
    'User';
  const userAvatar = session?.user?.user_metadata?.avatar_url || '';

  return (
    <Layout>
      <Head>
        <title>New Post — AIStore Blog</title>
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Create a new post</h1>
            <p className="text-gray-300 text-sm">
              Share your guides and experiments with the AIStore community. Submissions are reviewed before publishing.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt=""
                className="w-8 h-8 rounded-full object-cover border border-white/10"
                onError={(e) => { e.currentTarget.src = '/avatar-fallback.png'; }}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10" />
            )}
            <span className="text-sm text-gray-200">{userName}</span>
          </div>
        </div>

        {/* Tips */}
        <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <ul className="text-sm text-gray-300 list-disc pl-5 space-y-1">
            <li>Use a clear, specific title.</li>
            <li>Add an eye-catching cover image (ideally 1200×630).</li>
            <li>Structure content with headings and lists.</li>
            <li>Suggested intro length: 50–100 words.</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g., 10 Tips for Better Product Photos"
              className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60"
            />
            <div className="mt-1 text-xs text-gray-400">
              {Math.max(0, 80 - title.length)} chars left (suggested ≤ 80)
            </div>
          </div>

          {/* Language + Cover */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-sm mb-1">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10"
              >
                <option value="en">English</option>
                <option value="ar">Arabic</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm mb-1">Cover Image</label>

              {/* Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); onDropFiles(e.dataTransfer.files); }}
                className={`rounded-2xl border border-dashed ${dragOver ? 'border-fuchsia-400 bg-fuchsia-500/5' : 'border-white/15 bg-white/5'} p-3`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onDropFiles(e.target.files)}
                    className="block w-full text-sm"
                  />
                  {coverUrl && (
                    <button
                      type="button"
                      onClick={() => { setCoverFile(null); setCoverUrl(''); }}
                      className="px-3 py-2 text-sm rounded-xl border border-white/15 hover:bg-white/10"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* Preview */}
                {coverUrl && (
                  <div className="mt-3 relative overflow-hidden rounded-xl border border-white/10">
                    <img src={coverUrl} alt="" className="w-full h-44 object-cover" />
                  </div>
                )}
              </div>
              <div className="mt-1 text-xs text-gray-400">PNG/JPG. Ideal aspect ratio ~1.91:1 (e.g., 1200×630).</div>
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm mb-1">Excerpt (optional)</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short summary used on cards and meta tags."
              className="w-full h-24 p-3 rounded-2xl bg-white/5 border border-white/10"
            />
            <div className="mt-1 text-xs text-gray-400">{excerpt.length} / 220</div>
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-sm">Content (Markdown)</label>
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTab('edit')}
                  className={`px-3 py-1.5 rounded-xl text-sm border ${tab === 'edit' ? 'bg-fuchsia-600 text-white border-fuchsia-500/40' : 'bg-white/5 border-white/10'}`}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setTab('preview')}
                  className={`px-3 py-1.5 rounded-xl text-sm border ${tab === 'preview' ? 'bg-fuchsia-600 text-white border-fuchsia-500/40' : 'bg-white/5 border-white/10'}`}
                >
                  Preview
                </button>
              </div>
            </div>

            {tab === 'edit' ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="# Heading\n\nWrite your post in Markdown…"
                className="w-full h-80 p-4 rounded-2xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60"
              />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="prose prose-invert max-w-none bg-white/5 border border-white/10 rounded-2xl p-4"
                style={{ wordWrap: 'break-word' }}
              >
                {/* Minimal preview without extra deps */}
                <MarkdownLite text={content} />
              </motion.div>
            )}

            <div className="mt-2 text-xs text-gray-400 flex items-center gap-3">
              <span>{contentWordCount} words</span>
              <span>•</span>
              <span>~{readingMinutes} min read</span>
              <span className="ml-auto text-gray-500">Shortcut: ⌘/Ctrl + Enter to submit</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              disabled={submitting}
              className="px-5 py-2 rounded-2xl bg-fuchsia-600 text-white disabled:opacity-60"
            >
              {submitting ? 'Submitting…' : 'Submit for Review'}
            </button>

            <button
              type="button"
              onClick={restoreDraft}
              className="px-4 py-2 rounded-2xl border border-white/15 hover:bg-white/10"
            >
              Restore draft
            </button>

            <button
              type="button"
              onClick={clearDraft}
              className="px-4 py-2 rounded-2xl border border-white/15 hover:bg-white/10"
            >
              Clear draft
            </button>

            {msg && <span className="text-sm text-gray-300">{msg}</span>}
          </div>
        </form>
      </div>
    </Layout>
  );
}

/**
 * MarkdownLite: minimal preview component (headings + simple lists).
 * If you want full markdown features, we can switch to react-markdown + remark-gfm.
 */
function MarkdownLite({ text = '' }) {
  if (!text) return <p className="text-gray-400">Nothing to preview yet.</p>;
  const lines = text.split('\n').map((ln, i) => {
    if (/^###\s+/.test(ln)) return <h3 key={i}>{ln.replace(/^###\s+/, '')}</h3>;
    if (/^##\s+/.test(ln)) return <h2 key={i}>{ln.replace(/^##\s+/, '')}</h2>;
    if (/^#\s+/.test(ln)) return <h1 key={i}>{ln.replace(/^#\s+/, '')}</h1>;
    if (/^\-\s+/.test(ln)) return <li key={i}>{ln.replace(/^\-\s+/, '')}</li>;
    if (/^\*\s+/.test(ln)) return <li key={i}>{ln.replace(/^\*\s+/, '')}</li>;
    return <p key={i}>{ln}</p>;
  });

  // Wrap li blocks into ul groups
  const wrapped = [];
  let buffer = [];
  for (const el of lines) {
    if (el.type === 'li') buffer.push(el);
    else {
      if (buffer.length) {
        wrapped.push(<ul key={`ul-${wrapped.length}`} className="list-disc pl-6">{buffer}</ul>);
        buffer = [];
      }
      wrapped.push(el);
    }
  }
  if (buffer.length) wrapped.push(<ul key="ul-last" className="list-disc pl-6">{buffer}</ul>);
  return <>{wrapped}</>;
}
