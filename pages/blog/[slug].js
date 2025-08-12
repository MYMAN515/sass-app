// pages/blog/[slug].js
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import Layout from '@/components/Layout';

const ReactMarkdown = dynamic(() => import('react-markdown').then(m => m.default), { ssr: false });

function slugify(str = '') {
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100);
}

function wordCount(md = '') {
  return (md.replace(/[#>*`_~\-]|!\[.*?\]\(.*?\)|\[(.*?)\]\(.*?\)/g, ' ').match(/\S+/g) || []).length;
}

export default function BlogPost() {
  const router = useRouter();
  const { slug } = router.query;
  const supabase = useMemo(() => createPagesBrowserClient(), []);
  const [post, setPost] = useState(null);
  const [author, setAuthor] = useState(null); // { full_name, avatar_url }
  const [plugins, setPlugins] = useState([]);
  const [progress, setProgress] = useState(0);
  const articleRef = useRef(null);

  // Load optional remark-gfm if available
  useEffect(() => {
    let mounted = true;
    import('remark-gfm')
      .then(m => mounted && setPlugins([m.default]))
      .catch(() => setPlugins([]));
    return () => { mounted = false; };
  }, []);

  // Fetch post
  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      setPost(data || null);
      if (data?.author_id) {
        // try to fetch profile (optional table)
        const { data: prof } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('user_id', data.author_id)
          .maybeSingle();
        setAuthor(prof || null);
      }
    })();
  }, [slug, supabase]);

  // Reading progress
  useEffect(() => {
    function onScroll() {
      const el = articleRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.scrollHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(window.scrollY - (el.offsetTop - 80), 0), total);
      setProgress(total > 0 ? (scrolled / total) * 100 : 0);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [post]);

  if (!post) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto p-6">Loading…</div>
      </Layout>
    );
  }

  if (post.status !== 'published') {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto p-6">This post is not published.</div>
      </Layout>
    );
  }

  const title = post.title || 'Post';
  const desc = post.excerpt || title;
  const cover = post.cover_url || '';
  const wc = wordCount(post.content_md || '');
  const readMins = Math.max(1, Math.round(wc / 200));
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  // Build TOC from level 1-3 headings
  const toc = useMemo(() => {
    const lines = (post.content_md || '').split('\n');
    const items = [];
    for (const ln of lines) {
      const m = ln.match(/^(#{1,3})\s+(.*)/);
      if (m) {
        const level = m[1].length;
        const text = m[2].trim();
        items.push({ level, text, id: slugify(text) });
      }
    }
    return items;
  }, [post.content_md]);

  // Custom heading renderers to add ids for anchor links
  const heading = (Tag) => (props) => {
    const text = String(props.children?.[0] ?? '');
    const id = slugify(text);
    return (
      <Tag id={id} {...props}>
        <a href={`#${id}`} className="no-underline hover:underline">{props.children}</a>
      </Tag>
    );
  };

  const components = {
    h1: heading('h1'),
    h2: heading('h2'),
    h3: heading('h3'),
    img: (props) => (
      <img {...props} className="rounded-xl my-4" alt={props.alt || ''} />
    ),
    code: ({ inline, className, children, ...rest }) => {
      // minimal code styling; you can plug highlight.js later
      return inline ? (
        <code className="px-1.5 py-0.5 rounded bg-white/10" {...rest}>{children}</code>
      ) : (
        <pre className="rounded-xl border border-white/10 bg-black/40 overflow-auto p-4">
          <code className={className} {...rest}>{children}</code>
        </pre>
      );
    },
    a: (props) => <a {...props} target="_blank" rel="noopener noreferrer" />,
  };

  return (
    <Layout>
      <Head>
        <title>{title} — AIStore Blog</title>
        <meta name="description" content={desc} />
        {cover ? <meta property="og:image" content={cover} /> : null}
        <meta property="og:title" content={`${title} — AIStore Blog`} />
        <meta property="og:description" content={desc} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      {/* Reading progress */}
      <div className="sticky top-0 z-30 h-1 bg-transparent">
        <div
          className="h-1 bg-fuchsia-600 transition-[width]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Hero cover */}
      <section className="max-w-5xl mx-auto px-4 pt-6">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5">
          {cover ? (
            <img src={cover} alt="" className="w-full h-[280px] sm:h-[360px] object-cover" />
          ) : (
            <div className="w-full h-[220px] sm:h-[300px] bg-gradient-to-br from-fuchsia-600/20 to-violet-600/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-semibold">{title}</h1>
              <Link
                href="/blog"
                className="text-sm px-3 py-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10"
              >
                ← Back to Blog
              </Link>
            </div>

            <div className="mt-3 flex items-center gap-3 text-sm text-gray-300 flex-wrap">
              {/* Author */}
              {author?.avatar_url ? (
                <img src={author.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover border border-white/10" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10" />
              )}
              <span>{author?.full_name || 'AIStore Author'}</span>
              <span>•</span>
              {post.published_at && <span>{new Date(post.published_at).toLocaleDateString()}</span>}
              <span>•</span>
              <span>{readMins} min read</span>
            </div>
          </div>
        </div>
      </section>

      {/* Article + TOC */}
      <section className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
        <article ref={articleRef} className="prose prose-invert max-w-none">
          {ReactMarkdown ? (
            <ReactMarkdown remarkPlugins={plugins} components={components}>
              {post.content_md || ''}
            </ReactMarkdown>
          ) : (
            <pre className="whitespace-pre-wrap">{post.content_md || ''}</pre>
          )}
        </article>

        {/* TOC & share */}
        <aside className="lg:sticky lg:top-24 h-max">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-sm font-semibold mb-3">On this page</h3>
            {toc.length ? (
              <ul className="space-y-2 text-sm">
                {toc.map((i, idx) => (
                  <li key={idx} className={`pl-${(i.level - 1) * 3}`}>
                    <a
                      href={`#${i.id}`}
                      className="text-gray-300 hover:text-white hover:underline"
                    >
                      {i.text}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-gray-400">No headings</div>
            )}
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-sm font-semibold mb-3">Share</h3>
            <div className="flex items-center gap-2">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank" rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl border border-white/15 hover:bg-white/10 text-sm"
              >
                X / Twitter
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                target="_blank" rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl border border-white/15 hover:bg-white/10 text-sm"
              >
                LinkedIn
              </a>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(shareUrl);
                  } catch {}
                }}
                className="px-3 py-1.5 rounded-xl border border-white/15 hover:bg-white/10 text-sm"
              >
                Copy link
              </button>
            </div>
          </div>
        </aside>
      </section>
    </Layout>
  );
}
