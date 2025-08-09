// ─────────────────────────────────────────────────────────
// 3) /pages/history.jsx  (واجهة التاريخ)
// ─────────────────────────────────────────────────────────
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Layout from '@/components/Layout';
import Spinner from '@/components/Spinner';
import Button from '@/components/Button';
import Toast from '@/components/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { listHistory, deleteHistory } from '@/lib/historyClient';

function CompareSlider({ before, after }) {
  const [pos, setPos] = useState(50);
  const trackRef = useRef(null);
  const clamp = (v) => Math.max(0, Math.min(100, v));
  const move = (x) => {
    const r = trackRef.current?.getBoundingClientRect(); if (!r) return;
    setPos(clamp(((x - r.left) / r.width) * 100));
  };
  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
      <img src={after} alt="after" className="w-full block" />
      <div className="absolute inset-0 pointer-events-none" style={{ width: `${pos}%` }}>
        <img src={before} alt="before" className="w-full h-full object-cover" />
      </div>
      <div
        role="slider"
        aria-valuenow={Math.round(pos)}
        tabIndex={0}
        onPointerDown={(e)=>{e.currentTarget.setPointerCapture?.(e.pointerId); move(e.clientX)}}
        onPointerMove={(e)=>{if(!(e.buttons&1))return; move(e.clientX)}}
        onKeyDown={(e)=>{ if(e.key==='ArrowLeft') setPos(p=>clamp(p-5)); if(e.key==='ArrowRight') setPos(p=>clamp(p+5)); }}
        className="absolute inset-y-0"
        style={{ left: `calc(${pos}% - 1px)` }}
      >
        <div className="h-full w-0.5 bg-white/90 mix-blend-difference" />
      </div>
      <div className="absolute left-2 top-2 text-[10px] px-2 py-1 rounded-full bg-black/60 text-white">Before</div>
      <div className="absolute right-2 top-2 text-[10px] px-2 py-1 rounded-full bg-emerald-500/90 text-white">After</div>
    </div>
  );
}

export default function HistoryPage() {
  const [kind, setKind] = useState('all'); // all | enhance | tryon
  const [q, setQ] = useState('');
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [busyId, setBusyId] = useState(null);

  const empty = !loading && items.length === 0;

  async function load(reset = false) {
    try {
      setLoading(true);
      const res = await listHistory({ kind, q, limit: 12, cursor: reset ? null : cursor });
      setItems((prev) => reset ? res.items : [...prev, ...res.items]);
      setCursor(res.nextCursor);
    } catch (e) {
      setToast({ show: true, message: e.message || 'Failed to load history', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(true); /* on mount + filters */ }, [kind]);
  // بحث مؤجل
  useEffect(() => {
    const id = setTimeout(() => load(true), 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  async function onDelete(id) {
    try {
      setBusyId(id);
      await deleteHistory(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
      setToast({ show: true, message: 'Deleted', type: 'success' });
    } catch (e) {
      setToast({ show: true, message: e.message || 'Delete failed', type: 'error' });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Layout title="History" description="Your generated images history">
      <main className="min-h-screen pb-20 bg-gradient-to-b from-white to-purple-50 dark:from-zinc-900 dark:to-purple-900">
        <Toast show={toast.show} message={toast.message} type={toast.type} />

        <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-10 pt-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">History</h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Review, download, and manage your past generations.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {['all','enhance','tryon'].map(k => (
                <button
                  key={k}
                  onClick={()=>setKind(k)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold border transition ${kind===k ? 'border-fuchsia-500 bg-fuchsia-500 text-white' : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-white'}`}
                >
                  {k === 'all' ? 'All' : k === 'enhance' ? 'Enhance' : 'Try-On'}
                </button>
              ))}
              <div className="flex items-center rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2">
                <svg width="16" height="16" viewBox="0 0 24 24" className="text-zinc-500"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28h.79L20 20.5 21.5 19 15.5 14ZM9.5 14A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14Z"/></svg>
                <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search prompt…" className="bg-transparent outline-none text-sm ml-2 w-44" />
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm"
                >
                  <CompareSlider before={item.input_url} after={item.output_url} />
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      <span className={`mr-2 rounded-full px-2 py-0.5 ${item.kind==='enhance'?'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300':'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-300'}`}>{item.kind}</span>
                      {new Date(item.created_at).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={()=>navigator.clipboard.writeText(item.output_url)}
                        className="text-xs rounded-md border px-2 py-1 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                        title="Copy output link"
                      >Copy</button>
                      <a
                        href={item.output_url} download
                        className="text-xs rounded-md border px-2 py-1 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      >Download</a>
                      <button
                        onClick={()=>onDelete(item.id)}
                        disabled={busyId===item.id}
                        className="text-xs rounded-md border px-2 py-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 disabled:opacity-60"
                      >{busyId===item.id?'...':'Delete'}</button>
                    </div>
                  </div>
                  {item.prompt && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-zinc-500">Prompt</summary>
                      <pre className="mt-1 whitespace-pre-wrap break-words text-xs text-zinc-700 dark:text-zinc-300">{item.prompt}</pre>
                    </details>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-10"><Spinner /></div>
          )}

          {empty && (
            <div className="py-16 text-center text-sm text-zinc-600 dark:text-zinc-400">
              No history yet. Generate your first image from <a className="underline" href="/enhance">Enhance</a> or <a className="underline" href="/tryon">Try-On</a>.
            </div>
          )}

          {cursor && !loading && (
            <div className="mt-8 flex justify-center">
              <Button onClick={()=>load(false)}>Load more</Button>
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
}
