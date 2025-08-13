// pages/blog/new.js
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import Layout from '@/components/Layout';
import {
  ArrowLeft,
  Send,
  Save,
  Undo2,
  Upload,
  X,
  Languages,
  Eye,
  EyeOff,
  Heading2,
  Bold,
  Italic,
  Code2,
  List,
  Link as LinkIcon,
  Image as ImageIcon,
  Clock,
  CheckCircle2,
} from 'lucide-react';

const BUCKET = 'blog';
const DRAFT_KEY = 'blog_new_draft_v4';

/* ---------------------- utils ---------------------- */
const cn = (...cls) => cls.filter(Boolean).join(' ');

const slugify = (s = '') =>
  s
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100);

const safeName = (n = '') =>
  n
    .toLowerCase()
    .replace(/[^a-z0-9.\-]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100);

/* ---------------------- page ---------------------- */
export default function NewPostPage() {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const user = useUser();

  // form state
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('en');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [coverUrl, setCoverUrl] = useState('');

  // ui/ux state
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');
  const [activeTab, setActiveTab] = useState('write'); // 'write' | 'preview'
  const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | saved
  const [errors, setErrors] = useState({ title: '', content: '' });

  const editorRef = useRef(null);
  const saveTimer = useRef(null);

  /* ---------------------- auth redirect ---------------------- */
  useEffect(() => {
    if (user === null) {
      const next = encodeURIComponent('/blog/new');
      router.replace(`/login?next=${next}`);
    }
  }, [user, router]);

  /* ---------------------- derived ---------------------- */
  const wc = useMemo(() => (content.trim().match(/\S+/g) || []).length, [content]);
  const readMin = useMemo(() => Math.max(1, Math.round(wc / 200)), [wc]);
  const slug = useMemo(() => slugify(title), [title]);
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  /* ---------------------- autosave ---------------------- */
  useEffect(() => {
    if (!user) return;
    setSaveStatus('saving');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ title, language, excerpt, content, coverUrl, ts: Date.now() })
      );
      setSaveStatus('saved');
      ping('Draft saved');
    }, 500);
    return () => clearTimeout(saveTimer.current);
  }, [title, language, excerpt, content, coverUrl, user]);

  const restoreDraft = useCallback(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return ping('No saved draft', true);
      const d = JSON.parse(raw);
      setTitle(d.title || '');
      setLanguage(d.language || 'en');
      setExcerpt(d.excerpt || '');
      setContent(d.content || '');
      setCoverUrl(d.coverUrl || '');
      setSaveStatus('saved');
      ping('Draft restored ✓');
    } catch {
      ping("Couldn’t restore draft", true);
    }
  }, []);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
    ping('Draft cleared');
  }, []);

  function ping(msg, isError = false) {
    setToast(msg);
    if (isError) console.warn(msg);
    clearTimeout(ping._t);
    ping._t = setTimeout(() => setToast(''), 1600);
  }

  const onDropFiles = useCallback((files) => {
    const f = files?.[0];
    if (!f) return;
    setCoverFile(f);
    setCoverUrl(URL.createObjectURL(f));
  }, []);

  async function uploadCoverIfNeeded() {
    if (!coverFile) return coverUrl || null;
    const filePath = `users/${user.id}/covers/${Date.now()}-${safeName(coverFile.name)}`;
    const { error } = await supabase
      .storage
      .from(BUCKET)
      .upload(filePath, coverFile, { upsert: true, contentType: coverFile.type });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    return data.publicUrl;
  }

  const validate = useCallback(() => {
    const e = { title: '', content: '' };
    if (title.trim().length < 6) e.title = 'Title too short (min 6)';
    if (wc < 50) e.content = 'Content too short (min 50 words)';
    setErrors(e);
    return !e.title && !e.content;
  }, [title, wc]);

  async function handleSubmit(e) {
    e?.preventDefault?.();
    if (!user) return ping('Login required', true);
    if (!validate()) return ping('Please fix errors', true);

    try {
      setSubmitting(true);
      ping('Submitting…');
      const uploaded = await uploadCoverIfNeeded();

      const res = await fetch('/api/blog/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, language, excerpt, content_md: content, cover_url: uploaded }),
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

  // markdown toolbar insertion
  const insertMd = useCallback((before, after = '') => {
    const el = editorRef.current;
    if (!el) return;
    const [start, end] = [el.selectionStart, el.selectionEnd];
    const sel = content.slice(start, end);
    const updated = content.slice(0, start) + before + sel + after + content.slice(end);
    setContent(updated);
    requestAnimationFrame(() => {
      const pos = start + before.length + sel.length + after.length;
      el.focus();
      el.setSelectionRange(pos, pos);
    });
  }, [content]);

  /* ---------------------- user info ---------------------- */
  const userName =
    user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userAvatar = user?.user_metadata?.avatar_url || '';

  /* ---------------------- UI ---------------------- */
  return (
    <Layout>
      <Head>
        <title>New Post — AIStore Blog</title>
      </Head>

      {/* Top App Bar */}
      <div className="sticky top-0 z-40 border-b border-white/10 backdrop-blur supports-[backdrop-filter]:bg-black/35">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 rounded-xl border border-white/10 hover:bg-white/10 active:scale-[0.98]"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt=""
                className="w-8 h-8 rounded-full object-cover border border-white/10"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10" />
            )}
            <div className="text-xs sm:text-sm text-gray-200 truncate">{userName}</div>
            <span className="text-gray-500 hidden sm:inline">•</span>
            <span className="text-[11px] sm:text-xs text-gray-400 hidden sm:flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> ~{readMin} min
            </span>
          </div>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <Badge subtle icon={saveStatus === 'saved' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              label={saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved' : '—'} />

            <button type="button" onClick={restoreDraft}
              className="px-3 py-1.5 rounded-xl border border-white/15 hover:bg-white/10 text-xs sm:text-sm flex items-center gap-1">
              <Undo2 className="w-3.5 h-3.5" /> Restore
            </button>
            <button type="button" onClick={clearDraft}
              className="px-3 py-1.5 rounded-xl border border-white/15 hover:bg-white/10 text-xs sm:text-sm">
              Clear
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              className="px-3 sm:px-4 py-1.5 rounded-xl bg-fuchsia-600 text-white text-xs sm:text-sm disabled:opacity-60 flex items-center gap-1">
              <Send className="w-3.5 h-3.5" /> {submitting ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 sm:gap-8">
        {/* Editor Column */}
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-6">
          {/* Details Card */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.03] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="text-sm font-semibold text-gray-200">Post details</h2>
              <span className="text-[11px] sm:text-xs text-gray-400">
                Slug: <code className="bg-black/30 px-1.5 py-0.5 rounded">{slug || '—'}</code>
              </span>
            </div>

            <label htmlFor="title" className="block text-xs sm:text-sm mb-1">Title</label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g., 10 Tips for Better Product Photos"
              className={cn(
                'w-full px-3 sm:px-4 py-3 rounded-2xl bg-white/5 border focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60',
                errors.title ? 'border-rose-400' : 'border-white/10'
              )}
              maxLength={120}
            />
            <div className="mt-1 text-[11px] sm:text-xs flex items-center justify-between">
              <span className={cn('text-gray-500', errors.title && 'text-rose-400')}>{errors.title || `${Math.max(0, 120 - title.length)} chars left`}</span>
              <span className="text-gray-500">{title.trim().length} / 120</span>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 sm:gap-4 mt-4">
              <div>
                <label htmlFor="language" className="block text-xs sm:text-sm mb-1">Language</label>
                <div className="relative">
                  <select
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full appearance-none px-3 sm:px-4 py-3 pr-9 rounded-2xl bg-white/5 border border-white/10 focus:outline-none"
                  >
                    <option value="en">English</option>
                    <option value="ar">Arabic</option>
                  </select>
                  <Languages className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 opacity-70" />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="excerpt" className="block text-xs sm:text-sm mb-1">Excerpt (optional)</label>
                <textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Short summary used on cards and meta tags."
                  className="w-full h-[84px] p-3 rounded-2xl bg-white/5 border border-white/10 focus:outline-none"
                  maxLength={220}
                />
                <div className="mt-1 text-[11px] sm:text-xs text-gray-500">{excerpt.length} / 220</div>
              </div>
            </div>
          </div>

          {/* Cover Card */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.03] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="text-sm font-semibold text-gray-200">Cover image</h2>
              {coverUrl && (
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-xl border border-white/15 hover:bg-white/10 text-xs sm:text-sm flex items-center gap-1"
                  onClick={() => {
                    setCoverFile(null);
                    setCoverUrl('');
                  }}
                >
                  <TrashIcon /> Remove
                </button>
              )}
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                onDropFiles(e.dataTransfer.files);
              }}
              className={cn(
                'rounded-2xl border border-dashed p-4 sm:p-5 transition-colors',
                dragOver ? 'border-fuchsia-400 bg-fuchsia-500/10' : 'border-white/15 bg-white/5'
              )}
            >
              <label
                htmlFor="cover-input"
                className="w-full cursor-pointer flex flex-col items-center justify-center gap-2 text-center"
              >
                <div className="p-3 rounded-xl border border-white/10">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-sm">Tap to upload or drag & drop</div>
                <div className="text-[11px] text-gray-500">PNG/JPG · ideal 1200×630 (≈1.91:1)</div>
              </label>
              <input
                id="cover-input"
                type="file"
                accept="image/*"
                onChange={(e) => onDropFiles(e.target.files)}
                className="sr-only"
              />

              {coverUrl ? (
                <div className="mt-3 relative overflow-hidden rounded-xl border border-white/10">
                  <img src={coverUrl} alt="Cover preview" className="w-full h-44 sm:h-52 object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setCoverFile(null);
                      setCoverUrl('');
                    }}
                    className="absolute top-2 right-2 p-2 rounded-full bg-black/60 backdrop-blur border border-white/20"
                    aria-label="Remove cover"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="mt-3 h-28 sm:h-32 rounded-xl bg-gradient-to-br from-fuchsia-600/20 to-violet-600/20" />
              )}
            </div>
          </div>

          {/* Editor Card */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.03]">
            {/* Tabs */}
            <div className="px-4 sm:px-5 pt-3 flex items-center justify-between gap-3">
              <div className="inline-flex p-1 rounded-xl border border-white/10 bg-white/5">
                <TabButton active={activeTab === 'write'} onClick={() => setActiveTab('write')}>
                  <PenIcon /> Write
                </TabButton>
                <TabButton active={activeTab === 'preview'} onClick={() => setActiveTab('preview')}>
                  <Eye className="w-4 h-4" /> Preview
                </TabButton>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <MiniTB icon={<Heading2 className="w-4 h-4" />} onClick={() => insertMd('## ')} />
                <MiniTB icon={<Bold className="w-4 h-4" />} onClick={() => insertMd('**', '**')} />
                <MiniTB icon={<Italic className="w-4 h-4" />} onClick={() => insertMd('_', '_')} />
                <MiniTB icon={<Code2 className="w-4 h-4" />} onClick={() => insertMd('`', '`')} />
                <MiniTB icon={<List className="w-4 h-4" />} onClick={() => insertMd('- ')} />
                <MiniTB icon={<LinkIcon className="w-4 h-4" />} onClick={() => insertMd('[text](', ')')} />
                <MiniTB icon={<ImageIcon className="w-4 h-4" />} onClick={() => insertMd('![alt](', ')')} />
              </div>
            </div>

            {/* Editor / Preview */}
            <div className="p-4 sm:p-5 border-t border-white/10">
              {activeTab === 'write' ? (
                <div>
                  <textarea
                    ref={editorRef}
                    dir={dir}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="# Heading\n\nWrite your post in Markdown…"
                    className={cn(
                      'w-full h-[360px] sm:h-[420px] p-3 sm:p-4 rounded-2xl bg-white/5 border focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60',
                      errors.content ? 'border-rose-400' : 'border-white/10'
                    )}
                  />
                  <div className="mt-2 text-[11px] sm:text-xs text-gray-500 flex items-center gap-3">
                    <span>{wc} words</span>
                    <span>•</span>
                    <span>~{readMin} min read</span>
                    <span className="ml-auto text-gray-500">Shortcut: ⌘/Ctrl + Enter</span>
                  </div>
                  {errors.content && (
                    <div className="mt-2 text-[12px] text-rose-400">{errors.content}</div>
                  )}
                </div>
              ) : (
                <div className="prose prose-invert max-w-none border border-white/10 rounded-xl p-4 bg-white/5">
                  <MarkdownLite text={content} />
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Side Column (Preview Card + Checklist) */}
        <div className="space-y-6">
          {/* Live Card */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.03] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Card Preview</h3>
              <span className="text-[11px] sm:text-xs text-gray-400 px-2 py-0.5 rounded-full border border-white/10 bg-white/5">
                {language}
              </span>
            </div>
            <div className="p-4">
              <div className="rounded-xl overflow-hidden border border-white/10">
                {coverUrl ? (
                  <img src={coverUrl} alt="" className="w-full h-36 sm:h-40 object-cover" />
                ) : (
                  <div className="w-full h-36 sm:h-40 bg-gradient-to-br from-fuchsia-600/20 to-violet-600/20" />
                )}
                <div className="p-4" dir={dir}>
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
            </div>
          </div>

          {/* Checklist */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.03] p-4">
            <h4 className="text-sm font-semibold mb-3">Publish checklist</h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <Check ok={title.trim().length >= 6} text="Clear title (≥ 6 chars)" />
              <Check ok={wc >= 50} text="At least 50 words" />
              <Check ok={!!coverUrl} text="Cover image added" />
              <Check ok={(excerpt || '').length <= 220} text="Excerpt ≤ 220 chars" />
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar (Phones) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-white/10 backdrop-blur bg-black/60 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-400">{wc} words · ~{readMin} min</span>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={restoreDraft} className="px-3 py-1.5 rounded-xl border border-white/15 hover:bg-white/10 text-xs flex items-center gap-1">
              <Undo2 className="w-3.5 h-3.5" /> Restore
            </button>
            <button onClick={clearDraft} className="px-3 py-1.5 rounded-xl border border-white/15 hover:bg-white/10 text-xs">Clear</button>
            <button onClick={handleSubmit} disabled={submitting} className="px-3 py-1.5 rounded-xl bg-fuchsia-600 text-white text-xs disabled:opacity-60 flex items-center gap-1">
              <Send className="w-3.5 h-3.5" /> {submitting ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Button (extra reachability on phones) */}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="lg:hidden fixed bottom-16 right-4 z-40 p-4 rounded-full shadow-xl bg-fuchsia-600 text-white disabled:opacity-60 active:scale-95"
        aria-label="Submit post"
      >
        <Send className="w-5 h-5" />
      </button>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 px-3 py-2 rounded-xl bg-black/70 border border-white/10 text-sm animate-in fade-in slide-in-from-bottom-2">
          {toast}
        </div>
      )}
    </Layout>
  );
}

/* ---------------------- tiny components ---------------------- */
function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-lg text-xs sm:text-sm flex items-center gap-1',
        active ? 'bg-fuchsia-600 text-white' : 'text-gray-300 hover:bg-white/10'
      )}
    >
      {children}
    </button>
  );
}

function MiniTB({ icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs p-2 rounded-lg border border-white/15 hover:bg-white/10"
      title="Markdown tool"
      aria-label="Markdown tool"
    >
      {icon}
    </button>
  );
}

function Check({ ok, text }) {
  return (
    <li className="flex items-center gap-2">
      <span className={cn('inline-block w-2.5 h-2.5 rounded-full', ok ? 'bg-emerald-400' : 'bg-white/20')} />
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
      if (buf.length) {
        out.push(
          <ul key={`ul-${out.length}`} className="list-disc pl-6">
            {buf}
          </ul>
        );
        buf = [];
      }
      out.push(el);
    }
  }
  if (buf.length) out.push(<ul key="ul-last" className="list-disc pl-6">{buf}</ul>);
  return <>{out}</>;
}

function Badge({ label, icon, subtle = false }) {
  return (
    <span className={cn('inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg border', subtle ? 'bg-white/5 border-white/10 text-gray-300' : 'bg-fuchsia-600/20 border-fuchsia-500/40 text-fuchsia-200') }>
      {icon}
      {label}
    </span>
  );
}

function PenIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
      <path d="M12.5 6.5l5 5L8 21l-5 1 1-5 9.5-10.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
      <path d="M3 6h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M8 6l1-2h6l1 2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
