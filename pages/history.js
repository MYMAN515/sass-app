// pages/history.js
'use client';

import { useEffect, useMemo, useState } from 'react';
import Layout from '@/components/Layout';
import Toast from '@/components/Toast';
import { listHistory, deleteHistory } from '@/lib/historyClient';

const PAGE_SIZE = 12;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aistoreassistant.app';

const FILTERS = [
  { key: 'all', label: 'All results' },
  { key: 'enhance', label: 'Enhance' },
  { key: 'tryon', label: 'Try-On' },
];

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function formatRelative(iso) {
  try {
    const date = new Date(iso);
    const diff = date.getTime() - Date.now();
    const absDiff = Math.abs(diff);
    const units = [
      ['year', 1000 * 60 * 60 * 24 * 365],
      ['month', 1000 * 60 * 60 * 24 * 30],
      ['week', 1000 * 60 * 60 * 24 * 7],
      ['day', 1000 * 60 * 60 * 24],
      ['hour', 1000 * 60 * 60],
      ['minute', 1000 * 60],
      ['second', 1000],
    ];
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    for (const [unit, ms] of units) {
      if (absDiff >= ms || unit === 'second') {
        return rtf.format(Math.round(diff / ms), unit);
      }
    }
  } catch {
    return '';
  }
  return '';
}

function pickOutputUrl(row) {
  return row?.output_url || row?.options?.source_url || '/placeholder.png';
}

function pickInputUrl(row) {
  return row?.input_url || '/placeholder.png';
}

function buildShareText() {
  return `Made with AIStore — next-gen product imagery. ${SITE_URL}`;
}

function humanizeKey(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function compactValue(value) {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    return value.length > 42 ? `${value.slice(0, 39)}…` : value;
  }
  return null;
}

export default function HistoryPage() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [error, setError] = useState('');
  const [needsAuth, setNeedsAuth] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [busyId, setBusyId] = useState(null);
  const [shareOpen, setShareOpen] = useState(null);
  const [promptItem, setPromptItem] = useState(null);
  const [stats, setStats] = useState({ total: 0 });

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      setNeedsAuth(false);
      try {
        const { items: data, nextCursor, totalCount } = await listHistory({
          kind: filter,
          q: query,
          limit: PAGE_SIZE,
        });
        if (cancelled) return;
        setItems(data);
        setCursor(nextCursor);
        setStats({ total: totalCount ?? data.length });
      } catch (err) {
        if (cancelled) return;
        if (err?.message === 'No session') {
          setNeedsAuth(true);
          setItems([]);
          setCursor(null);
        } else {
          setError(err?.message || 'Failed to load history.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [filter, query]);

  async function loadMore() {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const { items: data, nextCursor } = await listHistory({
        kind: filter,
        q: query,
        limit: PAGE_SIZE,
        cursor,
      });
      setItems((prev) => [...prev, ...data]);
      setCursor(nextCursor);
    } catch (err) {
      setError(err?.message || 'Failed to load more history.');
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleDelete(id) {
    try {
      setBusyId(id);
      await deleteHistory(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      setStats((prev) => ({ ...prev, total: Math.max(0, (prev.total || 1) - 1) }));
      setToast({ show: true, message: 'History entry deleted.', type: 'success' });
    } catch (err) {
      setToast({ show: true, message: err?.message || 'Failed to delete entry.', type: 'error' });
    } finally {
      setBusyId(null);
    }
  }

  async function handleCopy(url) {
    try {
      await navigator.clipboard.writeText(url);
      setToast({ show: true, message: 'Link copied to clipboard.', type: 'success' });
    } catch {
      setToast({ show: true, message: 'Failed to copy link.', type: 'error' });
    }
  }

  async function handleDownload(url) {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = href;
      a.download = `aistore-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(href), 1000);
      setToast({ show: true, message: 'Download started.', type: 'success' });
    } catch {
      setToast({ show: true, message: 'Failed to download image.', type: 'error' });
    }
  }

  function shareNative(url) {
    const payload = { title: 'AIStore', text: buildShareText(), url };
    if (navigator.share) {
      navigator.share(payload).catch(() => {});
    } else {
      handleCopy(url);
    }
  }

  function shareX(url) {
    const next = new URL('https://twitter.com/intent/tweet');
    next.searchParams.set('text', buildShareText());
    next.searchParams.set('url', url);
    window.open(next.toString(), '_blank', 'noopener,noreferrer');
  }

  function shareReddit(url) {
    const next = new URL('https://www.reddit.com/submit');
    next.searchParams.set('url', url);
    next.searchParams.set('title', 'Made with AIStore');
    window.open(next.toString(), '_blank', 'noopener,noreferrer');
  }

  async function shareInstagram(url) {
    const caption = `${buildShareText()}\n${url}`;
    try {
      await navigator.clipboard.writeText(caption);
      setToast({ show: true, message: 'Caption copied. Paste in Instagram.', type: 'success' });
    } catch {
      setToast({ show: true, message: 'Copy failed — paste manually.', type: 'error' });
    }
    window.open('https://instagram.com/', '_blank', 'noopener,noreferrer');
  }

  const optionBadges = useMemo(() => {
    return items.reduce((acc, item) => {
      const options = item?.options || {};
      const entries = Object.entries(options).filter(([key, value]) => {
        if (key === 'storage_path' || key === 'source_url') return false;
        const compact = compactValue(value);
        return compact !== null && compact !== '';
      });
      return { ...acc, [item.id]: entries.map(([key, value]) => ({ key, value: compactValue(value) })) };
    }, {});
  }, [items]);

  const showEmpty = !loading && items.length === 0 && !error && !needsAuth;

  return (
    <Layout
      title="History — AIStore"
      description="Browse every AI render you've created and bring it back in one click."
      className="relative pb-20"
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_-10%,rgba(79,70,229,0.18)_0%,rgba(10,10,20,0.92)_55%,rgba(10,10,20,1)_100%)]" />
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:20px_20px]" />
      </div>

      <Toast show={toast.show} message={toast.message} type={toast.type} />

      {promptItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-950/95 p-6 text-slate-100 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">Prompt details</h3>
                <p className="text-xs text-slate-400">Created {formatDate(promptItem.created_at)}</p>
              </div>
              <button
                onClick={() => setPromptItem(null)}
                className="rounded-full border border-white/20 px-3 py-1 text-xs font-medium text-slate-200 hover:bg-white/10"
              >
                Close
              </button>
            </div>
            <div className="mt-4 max-h-[60vh] overflow-y-auto rounded-2xl bg-black/30 p-4 text-sm leading-relaxed">
              {promptItem.prompt ? (
                <pre className="whitespace-pre-wrap font-sans text-slate-100">{promptItem.prompt}</pre>
              ) : (
                <p className="text-slate-400">No prompt was stored for this generation.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <section className="relative mx-auto mt-6 w-full max-w-6xl">
        <header className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white md:text-4xl">Your creative trail</h1>
            <p className="mt-2 max-w-xl text-sm text-slate-300">
              Revisit every enhance and try-on render, download high-res copies, or share them instantly with your team.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <div className="flex rounded-full border border-white/10 bg-white/5 p-1 text-xs font-medium text-slate-200">
              {FILTERS.map((option) => (
                <button
                  key={option.key}
                  onClick={() => setFilter(option.key)}
                  className={`rounded-full px-3 py-1.5 transition ${
                    filter === option.key ? 'bg-white text-slate-900 shadow' : 'text-slate-200 hover:bg-white/10'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <label className="flex w-full items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 focus-within:border-white/30 focus-within:bg-white/10">
              <span className="text-xs uppercase tracking-wide text-slate-400">Search</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Prompt, style, option..."
                className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
              />
            </label>
          </div>
        </header>

        <div className="mt-6 flex flex-wrap gap-4 text-xs text-slate-300">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
            <span className="size-2 rounded-full bg-emerald-400" />
            {stats.total || 0} total generations
          </span>
          {query && (
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-amber-200">
              Filtered by “{query}”
              <button
                onClick={() => setSearch('')}
                className="rounded-full border border-amber-300/40 px-2 py-0.5 text-[10px] uppercase tracking-wide"
              >
                Clear
              </button>
            </span>
          )}
        </div>

        {error && (
          <div className="mt-6 rounded-3xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-sm text-rose-100">
            {error}
          </div>
        )}

        {needsAuth && (
          <div className="mt-12 rounded-3xl border border-white/10 bg-white/5 px-6 py-12 text-center text-sm text-slate-300">
            <p className="mx-auto max-w-md">
              You need to be signed in to see your history. Log in, generate something magical, and it will appear here automatically.
            </p>
            <a
              href="/login"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-slate-100"
            >
              Go to login
            </a>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {loading &&
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-3xl border border-white/10 bg-white/5 p-5"
              >
                <div className="h-48 rounded-2xl bg-white/10" />
                <div className="mt-5 h-3 w-24 rounded-full bg-white/10" />
                <div className="mt-2 h-3 w-full rounded-full bg-white/10" />
                <div className="mt-2 h-3 w-1/2 rounded-full bg-white/10" />
              </div>
            ))}

          {!loading &&
            items.map((item) => {
              const outputUrl = pickOutputUrl(item);
              const inputUrl = pickInputUrl(item);
              const options = optionBadges[item.id] || [];
              const isShareOpen = shareOpen === item.id;

              return (
                <article
                  key={item.id}
                  className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 text-slate-100 transition hover:border-white/30 hover:bg-white/10"
                >
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                    <div className="grid grid-cols-2 gap-3">
                      <figure className="flex flex-col gap-2">
                        <div className="relative overflow-hidden rounded-xl">
                          <img
                            src={inputUrl}
                            alt="Original upload"
                            className="h-32 w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <figcaption className="text-center text-[11px] uppercase tracking-wide text-slate-400">Original</figcaption>
                      </figure>
                      <figure className="flex flex-col gap-2">
                        <div className="relative overflow-hidden rounded-xl ring-2 ring-fuchsia-400/40">
                          <img
                            src={outputUrl}
                            alt="AI result"
                            className="h-32 w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <figcaption className="text-center text-[11px] uppercase tracking-wide text-slate-200">Result</figcaption>
                      </figure>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] font-medium uppercase tracking-wide">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] ${
                        item.kind === 'tryon'
                          ? 'bg-fuchsia-500/20 text-fuchsia-200'
                          : 'bg-indigo-500/20 text-indigo-200'
                      }`}
                    >
                      {item.kind ? item.kind : 'enhance'}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] ${
                        item.status === 'success'
                          ? 'bg-emerald-500/20 text-emerald-200'
                          : 'bg-amber-500/20 text-amber-200'
                      }`}
                    >
                      {item.status || 'unknown'}
                    </span>
                    <span className="text-slate-400">{formatRelative(item.created_at)}</span>
                  </div>

                  {options.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-200">
                      {options.map((entry) => (
                        <span
                          key={entry.key}
                          className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1"
                        >
                          <span className="text-[10px] uppercase text-slate-400">{humanizeKey(entry.key)}</span>
                          <span>{entry.value}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="mt-3 line-clamp-3 text-sm text-slate-200">
                    {item.prompt || 'Prompt not recorded for this generation.'}
                  </p>

                  <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                    <span title={formatDate(item.created_at)}>Created {formatDate(item.created_at)}</span>
                    <span>{item.credits_used || 0} credit{(item.credits_used || 0) === 1 ? '' : 's'}</span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3 text-xs">
                    <button
                      onClick={() => setPromptItem(item)}
                      className="rounded-full border border-white/10 px-3 py-1.5 text-slate-200 transition hover:border-white/30 hover:bg-white/10"
                    >
                      View prompt
                    </button>
                    <button
                      onClick={() => handleDownload(outputUrl)}
                      className="rounded-full border border-white/10 px-3 py-1.5 text-slate-200 transition hover:border-white/30 hover:bg-white/10"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleCopy(outputUrl)}
                      className="rounded-full border border-white/10 px-3 py-1.5 text-slate-200 transition hover:border-white/30 hover:bg-white/10"
                    >
                      Copy link
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setShareOpen(isShareOpen ? null : item.id)}
                        className="rounded-full border border-white/10 px-3 py-1.5 text-slate-200 transition hover:border-white/30 hover:bg-white/10"
                      >
                        Share
                      </button>
                      {isShareOpen && (
                        <div
                          className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/95 text-left text-xs shadow-xl"
                          onMouseLeave={() => setShareOpen(null)}
                        >
                          <button
                            onClick={() => {
                              setShareOpen(null);
                              shareNative(outputUrl);
                            }}
                            className="block w-full px-4 py-2 text-left text-slate-200 hover:bg-white/10"
                          >
                            Share via device
                          </button>
                          <button
                            onClick={() => {
                              setShareOpen(null);
                              shareX(outputUrl);
                            }}
                            className="block w-full px-4 py-2 text-left text-slate-200 hover:bg-white/10"
                          >
                            Share to X
                          </button>
                          <button
                            onClick={() => {
                              setShareOpen(null);
                              shareReddit(outputUrl);
                            }}
                            className="block w-full px-4 py-2 text-left text-slate-200 hover:bg-white/10"
                          >
                            Share to Reddit
                          </button>
                          <button
                            onClick={() => {
                              setShareOpen(null);
                              shareInstagram(outputUrl);
                            }}
                            className="block w-full px-4 py-2 text-left text-slate-200 hover:bg-white/10"
                          >
                            Share to Instagram
                          </button>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={busyId === item.id}
                      className="ml-auto inline-flex items-center gap-1 rounded-full border border-rose-400/50 bg-rose-500/10 px-3 py-1.5 text-rose-200 transition hover:bg-rose-500/20 disabled:opacity-50"
                    >
                      {busyId === item.id ? 'Removing…' : 'Delete'}
                    </button>
                  </div>
                </article>
              );
            })}
        </div>

        {showEmpty && (
          <div className="mt-16 rounded-3xl border border-white/10 bg-white/5 px-6 py-16 text-center text-sm text-slate-300">
            <p className="mx-auto max-w-md">
              You have no saved generations yet. Head over to <a className="text-white underline" href="/enhance">Enhance</a> or{' '}
              <a className="text-white underline" href="/tryon">Try-On</a> to create your first masterpiece.
            </p>
          </div>
        )}

        {cursor && !loading && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/20 disabled:opacity-60"
            >
              {loadingMore ? 'Loading…' : 'Load more'}
            </button>
          </div>
        )}
      </section>
    </Layout>
  );
}
