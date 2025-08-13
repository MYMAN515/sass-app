// pages/blog/[slug].js
'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import Layout from '@/components/Layout';
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Copy,
  Link2,
  Share2,
  User as UserIcon,
  BookText,
} from 'lucide-react';

const ReactMarkdown = dynamic(() => import('react-markdown').then((m) => m.default), { ssr: false });

/* ---------------- utils ---------------- */
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

const wordCount = (md = '') =>
  (md
    .replace(/[#>*`_~\-]|!\[.*?\]\(.*?\)|\[(.*?)\]\(.*?\)/g, ' ')
    .match(/\S+/g) || []).length;

/* -------------- skeletons -------------- */
function HeroSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5">
      <div className="h-[260px] sm:h-[340px] bg-white/10 animate-pulse" />
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="h-6 w-2/3 bg-white/10 rounded animate-pulse" />
        <div className="mt-3 h-4 w-1/2 bg-white/10 rounded animate-pulse" />
      </div>
    </div>
  );
}

/* ---------------- page ---------------- */
export default function BlogPost() {
  const router = useRouter();
  const { slug } = router.query;

  const supabase = useSupabaseClient();
  const user = useUser();

  const [post, setPost] = useState(null);
  const [author, setAuthor] = useState(null); // { full_name, avatar_url }
  const [plugins, setPlugins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [progress, setProgress] = useState(0);
  const [tocOpen, setTocOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const articleRef = useRef(null);

  /* optional remark-gfm */
  useEffect(() => {
    let mounted = true;
    import('remark-gfm')
      .then((m) => mounted && setPlugins([m.default]))
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  /* Fetch post + author */
  useEffect(() => {
    if (!slug) return;
    let active = true;

    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (!active) return;

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setPost(data);
      setLoading(false);

      if (data.author_id) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('user_id', data.author_id)
          .maybeSingle();
        setAuthor(prof || null);
      }
    })();

    return () => {
      active = false;
    };
  }, [slug, supabase]);

  /* reading progress */
  useEffect(() => {
    const onScroll = () => {
      const el = articleRef.current;
      if (!el) return;
      const total = el.scrollHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(window.scrollY - (el.offsetTop - 80), 0), total);
      setProgress(total > 0 ? (scrolled / total) * 100 : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [post]);

  /* guards */
  if (notFound) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold mb-2">404 — Post not found</h1>
          <p className="text-gray-400 mb-6">The post you’re looking for doesn’t exist or was removed.</p>
          <Link href="/blog" className="px-4 py-2 rounded-xl border border-white/15 hover:bg-white/10">
            Back to Blog
          </Link>
        </div>
      </Layout>
    );
  }

  const isOwner = !!(user && post && user.id === post.author_id);
  const canSeeUnpublished = isOwner; // keep simple

  if (!loading && post && post.status !== 'published' && !canSeeUnpublished) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto p-6">This post is not published.</div>
      </Layout>
    );
  }

  const title = post?.title || 'Post';
  const desc = post?.excerpt || title;
  const cover = post?.cover_url || '';
  const wc = wordCount(post?.content_md || '');
  const readMins = Math.max(1, Math.round(wc / 200));
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const dir = (post?.language || '').toLowerCase() === 'ar' ? 'rtl' : 'ltr';

  /* Build TOC from level 1-3 headings */
  const toc = useMemo(() => {
    const lines = (post?.content_md || '').split('\n');
    const items = [];
    for (const ln of lines) {
      const m = ln.match(/^(#{1,3})\s+(.*)/);
      if (m) {
        const level = m[1].length;
        const text = m[2].trim();
        const id = slugify(text);
        items.push({ level, text, id });
      }
    }
    return items;
  }, [post?.content_md]);

  /* heading components with anchors */
  const heading = (Tag) => (props) => {
    const plain = Array.isArray(props.children)
      ? props.children.map((c) => (typeof c === 'string' ? c : '')).join(' ')
      : String(props.children ?? '');
    const id = slugify(plain);
    return (
      <Tag id={id} {...props}>
        <a href={`#${id}`} className="no-underline hover:underline">
          {props.children}
        </a>
      </Tag>
    );
  };

  const components = {
    h1: heading('h1'),
    h2: heading('h2'),
    h3: heading('h3'),
    img: (props) => <img {...props} className="rounded-xl my-4" alt={props.alt || ''} />,
    code: ({ inline, className, children, ...rest }) =>
      inline ? (
        <code className="px-1.5 py-0.5 rounded bg-white/10" {...rest}>
          {children}
        </code>
      ) : (
        <pre className="rounded-xl border border-white/10 bg-black/40 overflow-auto p-4">
          <code className={className} {...rest}>
            {children}
          </code>
        </pre>
      ),
    a: (props) => <a {...props} target="_blank" rel="noopener noreferrer" className="underline" />,
  };

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {}
  }, [shareUrl]);

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

      {/* top progress + back */}
      <div className="sticky top-0 z-30 bg-transparent">
        <div className="h-1 bg-fuchsia-600/90" style={{ width: `${progress}%` }} />
        <div className="max-w-5xl mx-auto px-4 py-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-3 py-1.5 rounded-xl border border-white/15 hover:bg-white/10 text-sm inline-flex items-center gap-2"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
      </div>

      {/* hero */}
      <section className="max-w-5xl mx-auto px-4 pt-2">
        {loading ? (
          <HeroSkeleton />
        ) : (
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            {cover ? (
              <img src={cover} alt="" className="w-full h-[260px] sm:h-[340px] object-cover" />
            ) : (
              <div className="w-full h-[220px] sm:h-[300px] bg-gradient-to-br from-fuchsia-600/20 to-violet-600/20" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-semibold" dir={dir}>
                  {title}
                </h1>
                <Link
                  href="/blog"
                  className="text-sm px-3 py-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10"
                >
                  Back to Blog
                </Link>
              </div>

              <div className="mt-3 flex items-center gap-3 text-sm text-gray-300 flex-wrap">
                {author?.avatar_url ? (
                  <img
                    src={author.avatar_url}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover border border-white/10"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 grid place-items-center">
                    <UserIcon className="w-4 h-4 opacity-70" />
                  </div>
                )}
                <span>{author?.full_name || 'AIStore Author'}</span>
                <span>•</span>
                {post?.published_at && (
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="w-4 h-4 opacity-70" />
                    {new Date(post.published_at).toLocaleDateString()}
                  </span>
                )}
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-4 h-4 opacity-70" /> {readMins} min read
                </span>
                {post?.status !== 'published' && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-lg text-xs bg-yellow-500/15 border border-yellow-500/30 text-yellow-300">
                    Draft
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* content + toc */}
      <section className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Article */}
        <article ref={articleRef} className="prose prose-invert max-w-none" dir={dir}>
          {loading ? (
            <div className="space-y-3">
              <div className="h-6 w-3/4 bg-white/10 rounded animate-pulse" />
              <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-white/10 rounded animate-pulse" />
              <div className="h-4 w-4/6 bg-white/10 rounded animate-pulse" />
            </div>
          ) : ReactMarkdown ? (
            <ReactMarkdown remarkPlugins={plugins} components={components}>
              {post?.content_md || ''}
            </ReactMarkdown>
          ) : (
            <pre className="whitespace-pre-wrap">{post?.content_md || ''}</pre>
          )}
        </article>

        {/* Side */}
        <aside className="lg:sticky lg:top-24 h-max space-y-4">
          {/* TOC */}
          <div className="rounded-2xl border border-white/10 bg-white/5">
            <button
              type="button"
              className="w-full px-4 py-3 flex items-center justify-between"
              onClick={() => setTocOpen((v) => !v)}
              aria-expanded={tocOpen}
            >
              <span className="text-sm font-semibold inline-flex items-center gap-2">
                <BookText className="w-4 h-4" /> On this page
              </span>
              <span className="text-xs text-gray-400">{tocOpen ? 'Hide' : 'Show'}</span>
            </button>
            <div className={cn('px-4 pb-4', tocOpen ? 'block' : 'hidden lg:block')}>
              {toc.length ? (
                <ul className="space-y-2 text-sm">
                  {toc.map((i, idx) => (
                    <li key={idx} className={i.level === 1 ? '' : i.level === 2 ? 'pl-3' : 'pl-6'}>
                      <a href={`#${i.id}`} className="text-gray-300 hover:text-white hover:underline">
                        {i.text}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-gray-400">No headings</div>
              )}
            </div>
          </div>

          {/* Share */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-sm font-semibold mb-3">Share</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(
                  shareUrl
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl border border-white/15 hover:bg-white/10 text-sm inline-flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" /> X / Twitter
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl border border-white/15 hover:bg-white/10 text-sm inline-flex items-center gap-2"
              >
                <Link2 className="w-4 h-4" /> LinkedIn
              </a>
              <button
                onClick={copyLink}
                className="px-3 py-1.5 rounded-xl border border-white/15 hover:bg-white/10 text-sm inline-flex items-center gap-2"
              >
                <Copy className="w-4 h-4" /> Copy link
              </button>
            </div>
            {copied && (
              <div className="mt-2 text-xs text-emerald-300">Link copied ✓</div>
            )}
          </div>
        </aside>
      </section>

      {/* scroll-to-top */}
      <motion.button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: progress > 20 ? 1 : 0, y: progress > 20 ? 0 : 20 }}
        className="fixed bottom-6 right-6 z-40 px-3 py-2 rounded-xl border border-white/15 bg-black/40 backdrop-blur hover:bg-black/60"
        aria-label="Scroll to top"
      >
        ↑
      </motion.button>
    </Layout>
  );
}
