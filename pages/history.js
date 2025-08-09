// pages/history.js
'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import Toast from '@/components/Toast';
import { supabase } from '@/lib/supabaseClient';

const PAGE_SIZE = 12;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aistoreassistant.app';

const pickUrl = (row) => row?.output_url || row?.image_url || row?.url || '';
const pickType = (row) => (row?.type || row?.kind || 'enhance').toUpperCase();

function formatDate(iso) {
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
}

function buildShareText() {
  return `Made with AIStore — next-gen product imagery. ${SITE_URL}`;
}
function openNew(url) { window.open(url, '_blank', 'noopener,noreferrer'); }

export default function HistoryPage() {
  const [items, setItems] = useState([]);
  const [kind, setKind] = useState('all'); // all | enhance | tryon
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [busyId, setBusyId] = useState(null);
  const [shareOpenId, setShareOpenId] = useState(null);
  const [user, setUser] = useState({ id: '', email: '' });

  // ---------- loader core: tries user_id then fallback to user_email ----------
  async function fetchPage({ after = null, use = 'user_id' }) {
    const cols = 'id,created_at,type,kind,image_url,output_url,user_id,user_email';
    let q = supabase.from('generation_history').select(cols).order('created_at', { ascending: false }).limit(PAGE_SIZE);
    if (after) q = q.lt('created_at', after);
    if (kind !== 'all') q = q.eq('type', kind).or(`kind.eq.${kind}`); // يدعم type أو kind
    if (use === 'user_id') q = q.eq('user_id', user.id);
    if (use === 'user_email') q = q.eq('user_email', user.email);
    const { data, error } = await q;
    return { data: data || [], error };
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(''); setCursor(null); setItems([]);

      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { setLoading(false); return; }
      const info = { id: u.id, email: u.email || '' };
      setUser(info);

      // حاول user_id أولاً
      const first = await fetchPage({ use: 'user_id' });
      let data = first.data;

      // لو ما فيه نتائج، جرّب user_email
      if (!first.error && data.length === 0 && info.email) {
        const fb = await fetchPage({ use: 'user_email' });
        data = fb.data;
      }

      if (!mounted) return;
      setItems(data);
      setCursor(data.length ? data[data.length - 1].created_at : null);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [kind]);

  async function loadMore() {
    if (!cursor || !user.id) return;
    setLoadingMore(true);
    try {
      // نفس منطق البداية: user_id ثم email
      let more = await fetchPage({ after: cursor, use: 'user_id' });
      let data = more.data;
      if (!more.error && data.length === 0 && user.email) {
        const fb = await fetchPage({ after: cursor, use: 'user_email' });
        data = fb.data;
      }
      setItems((prev) => [...prev, ...data]);
      setCursor(data.length ? data[data.length - 1].created_at : null);
    } catch (e) {
      setError(e?.message || 'Failed to load more.');
    } finally {
      setLoadingMore(false);
    }
  }

  // ---------- actions ----------
  async function onDelete(id) {
    try {
      setBusyId(id);
      const { error } = await supabase.from('generation_history').delete().eq('id', id);
      if (error) throw error;
      setItems((prev) => prev.filter((x) => x.id !== id));
      setToast({ show: true, message: 'Deleted', type: 'success' });
    } catch (e) {
      setError(e?.message || 'Delete failed.');
    } finally {
      setBusyId(null);
    }
  }
  async function onCopy(url) {
    try { await navigator.clipboard.writeText(url); setToast({ show: true, message: 'Link copied', type: 'success' }); }
    catch { setToast({ show: true, message: 'Copy failed', type: 'error' }); }
  }
  async function onDownload(url) {
    try {
      const res = await fetch(url); const blob = await res.blob();
      const a = document.createElement('a'); const href = URL.createObjectURL(blob);
      a.href = href; a.download = `aistore-${Date.now()}.png`; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(href), 1000);
      setToast({ show: true, message: 'Downloading…', type: 'success' });
    } catch { setToast({ show: true, message: 'Download failed', type: 'error' }); }
  }

  // share
  function shareX(url) {
    const u = new URL('https://twitter.com/intent/tweet');
    u.searchParams.set('text', buildShareText()); u.searchParams.set('url', url); openNew(u.toString());
  }
  function shareReddit(url) {
    const u = new URL('https://www.reddit.com/submit');
    u.searchParams.set('url', url); u.searchParams.set('title', 'Made with AIStore'); openNew(u.toString());
  }
  async function shareInstagram(url) {
    const caption = `${buildShareText()}\n${url}`;
    try { await navigator.clipboard.writeText(caption); setToast({ show: true, message: 'Caption copied — paste in Instagram.', type: 'success' }); }
    catch { setToast({ show: true, message: 'Copy failed — open Instagram and paste manually.', type: 'error' }); }
    openNew('https://instagram.com/');
  }
  function shareNative(url) {
    const data = { title: 'AIStore', text: buildShareText(), url };
    if (navigator.share) navigator.share(data).catch(() => {});
    else onCopy(url);
  }

  const showEmpty = !loading && items.length === 0;

  return (
    <Layout title="History — AIStore" description="Your generated results, ready to share.">
      <div className="relative min-h-screen">
        {/* brand backdrop */}
        <div className="absolute inset-0 -z-20">
          <div className="h-full w-full bg-[radial-gradient(120%_100%_at_50%_-10%,#eef2ff_0%,#ffffff_40%,#fff1f6_100%)] dark:hidden" />
          <div className="hidden dark:block h-full w-full bg-[radial-gradient(120%_100%_at_40%_-10%,#3b1e82_0%,#0f0320_55%,#080312_100%)]" />
          <div className="pointer-events-none absolute inset-0 hidden dark:block opacity-25 [background-image:linear-gradient(to_right,rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.06)_1px,transparent_1px)] [background-size:24px_24px]" />
        </div>

        <main className="relative z-10 text-zinc-900 dark:text-white px-4 sm:px-6 lg:px-10 py-10">
          <Toast show={toast.show} message={toast.message} type={toast.type} />

          {/* header */}
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Your Gallery</h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Clean, mobile-first cards. Share anywhere.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'enhance', label: 'Enhance' },
                  { key: 'tryon', label: 'Try-On' },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setKind(f.key)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold border transition
                      ${kind === f.key
                        ? 'border-fuchsia-500 bg-fuchsia-600 text-white shadow'
                        : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white'}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-rose-400/40 bg-rose-500/10 text-rose-100 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {/* grid */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {loading && Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-3xl overflow-hidden border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5">
                  <div className="h-64 bg-zinc-200/70 dark:bg-zinc-800/50" />
                  <div className="p-4">
                    <div className="h-3 w-24 bg-zinc-200/70 dark:bg-zinc-800/50 rounded mb-2" />
                    <div className="h-3 w-16 bg-zinc-200/70 dark:bg-zinc-800/50 rounded" />
                  </div>
                </div>
              ))}

              {!loading && items.map((row) => {
                const url = pickUrl(row);
                const type = pickType(row);
                const isOpen = shareOpenId === row.id;

                return (
                  <div key={row.id} className="group relative rounded-3xl overflow-hidden border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-md shadow-sm hover:shadow-fuchsia-500/20 transition">
                    <div className="relative">
                      <img
                        src={url || '/placeholder.png'}
                        alt="result"
                        className="w-full h-64 object-cover bg-zinc-50 dark:bg-zinc-950"
                        loading="lazy"
                      />
                      <div className="absolute left-3 top-3">
                        <span className={`text-[10px] sm:text-xs font-semibold px-2 py-1 rounded-full
                          ${type === 'TRYON' ? 'bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-300'
                                             : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300'}`}>
                          {type}
                        </span>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400">
                          {formatDate(row.created_at)}
                        </div>
                        <button
                          onClick={() => shareNative(url)}
                          className="sm:hidden rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-xs font-semibold"
                        >
                          Share
                        </button>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <div className="relative">
                          <button
                            onClick={() => setShareOpenId(isOpen ? null : row.id)}
                            className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-700"
                          >
                            Share
                          </button>
                          {isOpen && (
                            <div
                              className="absolute right-0 mt-2 w-44 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-xl p-2 z-20"
                              onMouseLeave={() => setShareOpenId(null)}
                            >
                              <button onClick={() => { setShareOpenId(null); shareX(url); }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs">Share to X (Twitter)</button>
                              <button onClick={() => { setShareOpenId(null); shareReddit(url); }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs">Share to Reddit</button>
                              <button onClick={() => { setShareOpenId(null); shareInstagram(url); }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs">Share to Instagram</button>
                              <div className="my-1 h-px bg-zinc-200 dark:bg-zinc-800" />
                              <button onClick={() => { setShareOpenId(null); onCopy(url); }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs">Copy Link</button>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => onDownload(url)}
                          className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-700"
                        >
                          Download
                        </button>

                        <button
                          onClick={() => onDelete(row.id)}
                          disabled={busyId === row.id}
                          className="rounded-xl border border-rose-300/50 text-rose-600 dark:text-rose-300 bg-rose-500/10 px-3 py-2 text-xs font-semibold hover:bg-rose-500/20 disabled:opacity-60"
                        >
                          {busyId === row.id ? '...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {(!loading && items.length === 0) && (
              <div className="py-16 text-center text-sm text-zinc-600 dark:text-zinc-400">
                No history yet. Try <a className="underline" href="/enhance">Enhance</a> or <a className="underline" href="/tryon">Try-On</a>.
              </div>
            )}

            {!loading && cursor && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="rounded-full px-5 py-2 text-sm font-semibold border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-60"
                >
                  {loadingMore ? 'Loading…' : 'Load more'}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </Layout>
  );
}
