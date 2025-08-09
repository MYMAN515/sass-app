// pages/history.js
'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const PAGE_SIZE = 12;

function formatDate(iso) {
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
}

export default function HistoryPage() {
  const [items, setItems] = useState([]);
  const [kind, setKind] = useState('all'); // all | enhance | tryon
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState(null); // آخر created_at
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [userEmail, setUserEmail] = useState('');

  // جلب أولي + عند تغيير الفلتر
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError('');
      setCursor(null);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const email = user?.email || '';
        if (!email) {
          setItems([]);
          setUserEmail('');
          setLoading(false);
          return;
        }
        setUserEmail(email);

        let q = supabase
          .from('generation_history')
          .select('*')
          .eq('user_email', email)
          .order('created_at', { ascending: false })
          .limit(PAGE_SIZE);

        if (kind !== 'all') q = q.eq('type', kind);

        const { data, error } = await q;
        if (error) throw error;

        if (!mounted) return;
        setItems(data || []);
        setCursor(data?.length ? data[data.length - 1].created_at : null);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load history.');
        setItems([]);
        setCursor(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [kind]);

  async function loadMore() {
    if (!cursor || !userEmail) return;
    setLoadingMore(true);
    try {
      let q = supabase
        .from('generation_history')
        .select('*')
        .eq('user_email', userEmail)
        .lt('created_at', cursor)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);

      if (kind !== 'all') q = q.eq('type', kind);

      const { data, error } = await q;
      if (error) throw error;
      setItems((prev) => [...prev, ...(data || [])]);
      setCursor(data?.length ? data[data.length - 1].created_at : null);
    } catch (e) {
      setError(e?.message || 'Failed to load more.');
    } finally {
      setLoadingMore(false);
    }
  }

  async function onDelete(id) {
    try {
      setBusyId(id);
      const { error } = await supabase.from('generation_history').delete().eq('id', id);
      if (error) throw error;
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      setError(e?.message || 'Delete failed.');
    } finally {
      setBusyId(null);
    }
  }

  async function onCopy(url) {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      setError('Copy failed.');
    }
  }

  async function onShare(item) {
    try {
      const url = item.image_url;
      const shareData = {
        title: 'AIStore — Generated Image',
        text: 'Check out this image I generated with AIStore.',
        url,
      };
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      // تجاهل إلغاء المشاركة
    }
  }

  async function onDownload(url) {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `aistore-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    } catch {
      setError('Download failed.');
    }
  }

  const showEmpty = !loading && items.length === 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-purple-50 dark:from-zinc-900 dark:to-purple-900 text-zinc-900 dark:text-white px-4 sm:px-6 lg:px-10 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">History</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Your generated results — mobile‑first, shareable.</p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            {[
              { key: 'all', label: 'All' },
              { key: 'enhance', label: 'Enhance' },
              { key: 'tryon', label: 'Try‑On' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setKind(f.key)}
                className={`rounded-full px-4 py-2 text-sm font-semibold border transition
                  ${kind === f.key
                    ? 'border-fuchsia-500 bg-fuchsia-500 text-white'
                    : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white'
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error toast (بسيط) */}
        {error && (
          <div className="mt-4 rounded-xl border border-rose-400/40 bg-rose-500/10 text-rose-100 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Grid */}
        <div className="mt-6 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Skeletons */}
          {loading &&
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900">
                <div className="h-48 bg-zinc-200/70 dark:bg-zinc-800/70" />
                <div className="p-3">
                  <div className="h-3 w-24 bg-zinc-200/70 dark:bg-zinc-800/70 rounded mb-2" />
                  <div className="h-3 w-16 bg-zinc-200/70 dark:bg-zinc-800/70 rounded" />
                </div>
              </div>
            ))}

          {/* Items */}
          {!loading && items.map((item) => (
            <div
              key={item.id}
              className="group rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-lg transition"
            >
              {/* Result image only */}
              <div className="relative bg-zinc-50 dark:bg-zinc-950">
                <img
                  src={item.image_url}
                  alt="result"
                  className="w-full h-56 sm:h-52 object-cover"
                  onError={(e) => { e.currentTarget.src = '/placeholder.png'; }}
                  loading="lazy"
                />
                <div className="absolute left-2 top-2">
                  <span className={`text-[10px] sm:text-xs font-semibold px-2 py-1 rounded-full ${item.type === 'tryon'
                    ? 'bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-300'
                    : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300'
                    }`}>
                    {item.type?.toUpperCase?.() || 'ENHANCE'}
                  </span>
                </div>
              </div>

              {/* Meta + Actions */}
              <div className="p-3 sm:p-4">
                <div className="text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400">
                  {formatDate(item.created_at)}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => onShare(item)}
                    className="flex-1 sm:flex-none rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-700"
                    aria-label="Share"
                    title="Share"
                  >
                    Share
                  </button>
                  <button
                    onClick={() => onCopy(item.image_url)}
                    className="flex-1 sm:flex-none rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-700"
                    aria-label="Copy Link"
                    title="Copy Link"
                  >
                    Copy Link
                  </button>
                  <button
                    onClick={() => onDownload(item.image_url)}
                    className="flex-1 sm:flex-none rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-700"
                    aria-label="Download"
                    title="Download"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    disabled={busyId === item.id}
                    className="flex-1 sm:flex-none rounded-lg border border-rose-300/50 text-rose-600 dark:text-rose-300 bg-rose-500/10 px-3 py-2 text-xs font-semibold hover:bg-rose-500/20 disabled:opacity-60"
                    aria-label="Delete"
                    title="Delete"
                  >
                    {busyId === item.id ? '...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty */}
        {showEmpty && (
          <div className="py-16 text-center text-sm text-zinc-600 dark:text-zinc-400">
            No history yet. Try <a className="underline" href="/enhance">Enhance</a> or <a className="underline" href="/tryon">Try‑On</a>.
          </div>
        )}

        {/* Load more */}
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
  );
}
