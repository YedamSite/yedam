'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { db } from '@/lib/db';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const posts = db.get('blog_posts') || [];
  const post = posts.find((p: any) => p.slug === slug);

  if (!post || post.status !== 'published') {
    notFound();
  }

  useEffect(() => {
    document.title = post.seo_title || `${post.title} | Yedam K-Beauty`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (post.seo_description) {
      if (metaDesc) metaDesc.setAttribute('content', post.seo_description);
      else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = post.seo_description;
        document.head.appendChild(meta);
      }
    }
  }, [post.seo_title, post.seo_description, post.title]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <article className="max-w-3xl mx-auto px-4 md:px-8 py-16">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[10px] text-foreground/40 font-bold uppercase tracking-wider mb-8">
            <Link href="/" className="hover:text-accent transition-colors">Inicio</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-accent transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-accent truncate max-w-[200px]">{post.title}</span>
          </div>

          {/* Header */}
          <header className="mb-10">
            <div className="flex items-center gap-3 text-[9px] text-accent font-bold uppercase tracking-widest mb-4">
              <span>K-Beauty</span>
              <span className="text-foreground/20">·</span>
              <span className="text-foreground/40">{post.created_at}</span>
              <span className="text-foreground/20">·</span>
              <span className="text-foreground/40">{post.author}</span>
            </div>
            <h1 className="font-heading text-3xl md:text-5xl font-light text-white leading-tight mb-4">{post.title}</h1>
            {post.subtitle && (
              <p className="text-base text-foreground/60 leading-relaxed max-w-2xl">{post.subtitle}</p>
            )}
          </header>

          {/* Featured Image */}
          {post.image && (
            <div className="relative w-full h-[300px] md:h-[400px] rounded-3xl overflow-hidden mb-12 border border-white/5">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-invert prose-sm md:prose-base max-w-none
              prose-headings:font-heading prose-headings:font-light prose-headings:text-white
              prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-white/5 prose-h2:pb-3
              prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3
              prose-p:text-foreground/70 prose-p:leading-relaxed prose-p:mb-5
              prose-strong:text-white prose-strong:font-bold
              prose-a:text-accent prose-a:no-underline hover:prose-a:underline
              prose-li:text-foreground/70
              prose-img:rounded-2xl prose-img:my-8"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-xs text-foreground/40">
              <span className="font-bold text-white">{post.author}</span> &middot; Yedam K-Beauty
            </div>
            <Link
              href="/blog"
              className="text-[10px] font-bold text-accent uppercase tracking-widest hover:underline flex items-center gap-2"
            >
              ← Volver al Blog
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
