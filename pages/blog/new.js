// pages/blog/new.js
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import Layout from '@/components/Layout';

const BUCKET = 'blog';
const DRAFT_KEY = 'blog_new_draft_v3';

/* -------------- utils -------------- */
const slugify = (s = '') =>
  s.toString().toLowerCase().trim()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '')
    .replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 100);

const safeName = (n = '') =>
  n.toLowerCase().replace(/[^a-z0-9.\-]+/g, '-').replace(/-+/g, '-').slice(0, 100);

/* -------------- page -------------- */
export default function NewPostPage() {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const user = useUser();

  // form
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('en');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');

  const [coverFile, setCoverFile] = useState(null);
  const [coverUrl, setCoverUrl] = useState('');

  // ux
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');
  const [showFullPreview, setShowFullPreview] = useState(false);

  const editorRef = useRef(null);
  const saveTimer = useRef(null);

  // redirect if not authed
  useEffect(() => {
    if (user === null) {
      const next = encodeURIComponent('/blog/new');
      router.replace(`/login?next=${next}`);
    }
  }, [user, router]);

  // derived
  const wc = useMemo(() => (content.trim().match(/\S+/g) || []).length, [content]);
  const readMin = useMemo(() => Math.max(1, Math.round(wc / 200)), [wc]);
  const slug = useMemo(() => slugify(title), [title]);

  // autosave
  useEffect(() => {
    if (!user) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ title, language, excerpt, content, coverUrl, ts: Date.now() })
      );
      ping('Draft saved');
    }, 600);
    return () => clearTimeout(saveTimer.current);
  }, [title, language, excerpt, content, coverUrl, user]);

  function restoreDraft() {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return ping('No saved draft', true);
      const d = JSON.parse(raw);
      setTitle(d.title || '');
      setLanguage(d.language || 'en');
      setExcerpt(d.excerpt || '');
      setContent(d.content || '');
      setCoverUrl(d.coverUrl || '');
      ping('Draft restored ✓');
    } catch { ping('Couldn’t restore draft', true); }
  }
  function clearDraft() {
    localStorage.removeItem(DRAFT_KEY);
    ping('Draft cleared');
  }

  function ping(msg, isError = false) {
    setToast(msg);
    if (isError) console.warn(msg);
    clearTimeout(ping._t);
    ping._t = setTimeout(() => setToast(''), 1400);
  }

  function onDropFiles(files) {
    const f = files?.[0];
    if (!f) return;
    setCoverFile(f);
    setCoverUrl(URL.createObjectURL(f));
  }

  async function uploadCoverIfNeeded() {
    if (!coverFile) return coverUrl || null;
    const filePath = `users/${user.id}/covers/${Date.now()}-${safeName(coverFile.name)}`;
    const { error } = await supabase
      .storage.from(BUCKET)
      .upload(filePath, coverFile, { upsert: true, contentType: coverFile.type });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    return data.publicUrl;
  }

  async function handleSubmit(e) {
    e?.preventDefault?.();
    if (!user) return ping('Login required', true);
    if (title.trim().length < 6) return ping('Title too short (min 6)', true);
    if (wc < 50) return ping('Content too short (min 50 words)', true);

    try {
      setSubmitting(true);
      ping('Submitting…');
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
      if (!res.ok) throw new Error(data.error || 'Failed to create');

      localStorage.removeItem(DRAFT_KEY);
      ping('Submitted for review ✓');
      setTimeout(() => router.push(`/blog/${data.slug}`), 600);
    } catch (err) {
      ping(err.message, true);
    } finally {
      setSubmitting(false);
    }
  }

  function handleKeyDown(e) {
    const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().includes('MAC');
    if ((isMac && e.metaKey && e.key === 'Enter') || (!isMac && e.ctrlKey && e.key === 'Enter')) {
      handleSubmit(e);
    }
  }

  // tiny markdown toolbar
  function insertMd(before, after = '') {
    const el = editorRef.current;
    if (!el) return;
    const [start, end] = [el.selectionStart, el.selectionEnd];
    const sel = content.slice(start, end);
    const updated = content.slice(0, start) + before + sel + after + content.slice(end);
    setContent(updated);
    requestAnimationFrame(() => {
      const pos = start + before.length + sel.length + after.length;
      el.focus(); el.setSelectionRange(pos, pos);
    });
  }

  /* ---------- UI ---------- */
  const userName =
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'User';
  const userAvatar = user?.user_metadata?.avatar_url || '';

  return (
    <Layout>
      <Head><title>New Post — AIStore Blog</title></Head>

      {/* top bar (mobile friendly) */}
      <div className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-black/35 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {userAvatar
              ? <img src={userAvatar} alt="" className="w-8 h-8 rounded-full object-cover border border-white/10" />
              : <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10" />
            }
            <div className="text-xs sm:text-sm text-gray-200 truncate">{userName}</div>
            <span className="text-gray-500 hidden sm:inline">•</span>
            <span className="text-[11px] sm:text-xs text-gray-400 hidden sm:inline">
              {wc} words · ~{readMin} min
            </span>
          </div>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <button type="button" onClick={restoreDraft}
              className="px-3 py-1.5 rounded-xl border border-white/15 hover:bg-white/10 text-xs sm:text-sm">
              Restore
            </button>
            <button type="button" onClick={clearDraft}
              className="px-3 py-1.5 rounded-xl border border-white/15 hover:bg-white/10 text-xs sm:text-sm">
              Clear
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              className="px-3 sm:px-4 py-1.5 rounded-xl bg-fuchsia-600 text-white text-xs sm:text-sm disabled:opacity-60">
              {submitting ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </div>
      </div>

      {/* layout: single column on mobile, split on lg */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 sm:gap-8">
        {/* editor column */}
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-6">

          {/* details card */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.03] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="text-sm font-semibold text-gray-200">Post details</h2>
              <span className="text-[11px] sm:text-xs text-gray-400">
                Slug: <code className="bg-black/30 px-1.5 py-0.5 rounded">{slug || '—'}</code>
              </span>
            </div>

            <label className="block text-xs sm:text-sm mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g., 10 Tips for Better Product Photos"
              className="w-full px-3 sm:px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60"
            />
            <div className="mt-1 text-[11px] sm:text-xs text-gray-500">{Math.max(0, 80 - title.length)} chars left</div>

            <div className="grid sm:grid-cols-3 gap-3 sm:gap-4 mt-4">
              <div>
                <label className="block text-xs sm:text-sm mb-1">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 sm:px-4 py-3 rounded-2xl bg-white/5 border border-white/10"
                >
                  <option value="en">English</option>
                  <option value="ar">Arabic</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-sm mb-1">Excerpt (optional)</label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Short summary used on cards and meta tags."
                  className="w-full h-[72px] p-3 rounded-2xl bg-white/5 border border-white/10"
                />
                <div className="mt-1 text-[11px] sm:text-xs text-gray-500">{excerpt.length} / 220</div>
              </div>
            </div>
          </div>

          {/* cover card */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.03] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="text-sm font-semibold text-gray-200">Cover image</h2>
              {coverUrl && (
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-xl border border-white/15 hover:bg-white/10 text-xs sm:text-sm"
                  onClick={() => { setCoverFile(null); setCoverUrl(''); }}
                >
                  Remove
                </button>
              )}
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); onDropFiles(e.dataTransfer.files); }}
              className={`rounded-2xl border border-dashed ${dragOver ? 'border-fuchsia-400 bg-fuchsia-500/10' : 'border-white/15 bg-white/5'} p-3 sm:p-4`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onDropFiles(e.target.files)}
                  className="block w-full text-xs sm:text-sm"
                />
              </div>

              {coverUrl ? (
                <div className="mt-3 relative overflow-hidden rounded-xl border border-white/10">
                  <img src={coverUrl} alt="" className="w-full h-40 sm:h-48 object-cover" />
                </div>
              ) : (
                <div className="mt-3 h-28 sm:h-32 rounded-xl bg-gradient-to-br from-fuchsia-600/20 to-violet-600/20" />
              )}
              <div className="mt-2 text-[11px] sm:text-xs text-gray-500">PNG/JPG · ideal 1200×630 (≈1.91:1).</div>
            </div>
          </div>

          {/* editor card */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.03] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3 mb-2">
              <h2 className="text-sm font-semibold text-gray-200">Content (Markdown)</h2>
              <div className="flex items-center gap-1 sm:gap-2">
                <TB label="H2" onClick={() => insertMd('## ')} />
                <TB label="Bold" onClick={() => insertMd('**', '**')} />
                <TB label="Italic" onClick={() => insertMd('_', '_')} />
                <TB label="Code" onClick={() => insertMd('`', '`')} />
                <TB label="List" onClick={() => insertMd('- ')} />
                <TB label="Link" onClick={() => insertMd('[text](', ')')} />
                <TB label="Image" onClick={() => insertMd('![alt](', ')')} />
              </div>
            </div>

            <textarea
              ref={editorRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="# Heading\n\nWrite your post in Markdown…"
              className="w-full h-[360px] sm:h-[420px] p-3 sm:p-4 rounded-2xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60"
            />

            <div className="mt-2 text-[11px] sm:text-xs text-gray-500 flex items-center gap-3">
              <span>{wc} words</span><span>•</span><span>~{readMin} min read</span>
              <span className="ml-auto text-gray-500">Shortcut: ⌘/Ctrl + Enter</span>
            </div>
          </div>
        </form>

        {/* preview column */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.03] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Live Preview</h3>
              <button
                type="button"
                onClick={() => setShowFullPreview(v => !v)}
                className="text-xs px-3 py-1.5 rounded-xl border border-white/15 hover:bg-white/10"
              >
                {showFullPreview ? 'Compact' : 'Full'}
              </button>
            </div>

            <div className="p-4">
              <div className="rounded-xl overflow-hidden border border-white/10">
                {coverUrl
                  ? <img src={coverUrl} alt="" className="w-full h-36 sm:h-40 object-cover" />
                  : <div className="w-full h-36 sm:h-40 bg-gradient-to-br from-fuchsia-600/20 to-violet-600/20" />
                }
                <div className="p-4">
                  <div className="flex items-center gap-2 text-[11px] sm:text-xs text-gray-400">
                    <span className="px-2 py-0.5 rounded-full border border-white/10 bg-white/5">{language}</span>
                    <span>preview</span>
                  </div>
                  <h4 className="font-semibold text-base sm:text-lg mt-2 line-clamp-2">
                    {title || 'Post title'}
                  </h4>
                  <p className="text-sm text-gray-300 mt-2 line-clamp-3">
                    {excerpt || 'Short description will appear here.'}
                  </p>
                </div>
              </div>

              {showFullPreview && (
                <div className="prose prose-invert max-w-none mt-4 border border-white/10 rounded-xl p-4 bg-white/5">
                  <MarkdownLite text={content} />
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.03] p-4">
            <h4 className="text-sm font-semibold mb-2">Publish checklist</h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <Check ok={title.trim().length >= 6} text="Clear title (≥ 6 chars)" />
              <Check ok={wc >= 50} text="At least 50 words" />
              <Check ok={!!coverUrl} text="Cover image added" />
              <Check ok={(excerpt || '').length <= 220} text="Excerpt ≤ 220 chars" />
            </ul>
          </div>
        </div>
      </div>

      {/* bottom action bar for phones */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-white/10 backdrop-blur bg-black/50 px-3 py-2 flex items-center gap-2">
        <span className="text-[11px] text-gray-400">{wc} words · ~{readMin} min</span>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={restoreDraft}
            className="px-3 py-1.5 rounded-xl border border-white/15 hover:bg-white/10 text-xs">Restore</button>
          <button onClick={clearDraft}
            className="px-3 py-1.5 rounded-xl border border-white/15 hover:bg-white/10 text-xs">Clear</button>
          <button onClick={handleSubmit} disabled={submitting}
            className="px-3 py-1.5 rounded-xl bg-fuchsia-600 text-white text-xs disabled:opacity-60">
            {submitting ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      </div>

      {/* toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 px-3 py-2 rounded-xl bg-black/70 border border-white/10 text-sm">
          {toast}
        </div>
      )}
    </Layout>
  );
}

/* ---------- tiny components ---------- */
function TB({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs px-2.5 py-1.5 rounded-lg border border-white/15 hover:bg-white/10"
      title={label}
    >
      {label}
    </button>
  );
}
function Check({ ok, text }) {
  return (
    <li className="flex items-center gap-2">
      <span className={`inline-block w-2.5 h-2.5 rounded-full ${ok ? 'bg-emerald-400' : 'bg-white/20'}`} />
      <span className={ok ? 'text-gray-200' : 'text-gray-400'}>{text}</span>
    </li>
  );
}
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
  const out = [];
  let buf = [];
  for (const el of lines) {
    if (el.type === 'li') buf.push(el);
    else {
      if (buf.length) { out.push(<ul key={`ul-${out.length}`} className="list-disc pl-6">{buf}</ul>); buf = []; }
      out.push(el);
    }
  }
  if (buf.length) out.push(<ul key="ul-last" className="list-disc pl-6">{buf}</ul>);
  return <>{out}</>;
}
