'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabaseClient';
import Layout from '@/components/Layout';

const ReactMarkdown = dynamic(() => import('react-markdown').then(m => m.default), { ssr: false });

export default function BlogPost() {
  const router = useRouter();
  const { slug } = router.query;
  const [post, setPost] = useState(null);

  useEffect(() => {
    if (!slug) return;
    const run = async () => {
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      setPost(data || null);
    };
    run();
  }, [slug]);

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

  return (
    <Layout>
      <Head>
        <title>{title} — AIStore Blog</title>
        <meta name="description" content={desc} />
        {cover ? <meta property="og:image" content={cover} /> : null}
      </Head>

      <article className="max-w-3xl mx-auto px-4 py-10 prose">
        {cover && <img src={cover} alt="" className="w-full rounded-2xl mb-6" />}
        <h1>{title}</h1>
        {ReactMarkdown ? <ReactMarkdown>{post.content_md || ''}</ReactMarkdown> : <pre className="whitespace-pre-wrap">{post.content_md || ''}</pre>}
      </article>
    </Layout>
  );
}
