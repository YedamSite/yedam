'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import SafeImage from '@/components/SafeImage';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { db } from '@/lib/db';
import { useLanguage } from '@/context/LanguageContext';
import DOMPurify from 'isomorphic-dompurify';

export default function BlogPostPage() {
  const { t, locale } = useLanguage();
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<any>(null);
  const [notFoundState, setNotFoundState] = useState(false);
  const [blogSettings, setBlogSettings] = useState<any>({});

  useEffect(() => {
    const posts = db.get('blog_posts') || [];
    const rawPost = posts.find((p: any) => p.slug === slug);
    const translated = rawPost ? db.getTranslatedRecord(rawPost, locale) : null;

    if (!translated || translated.status !== 'published') {
      setNotFoundState(true);
    } else {
      setPost(translated);
    }

    // Load blog appearance settings from site_content
    const siteContent = db.get('site_content');
    setBlogSettings(siteContent?.blog || {});
  }, [slug, locale]);

  useEffect(() => {
    if (post) {
      document.title = post.seo_title || `${post.title} | Cheotnun K-Beauty`;
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
    }
  }, [post]);

  // Colors from admin settings (with sensible defaults)
  const contentColor = blogSettings?.contentTextColor || '#e2e8f0';
  const headingColor = blogSettings?.headingTextColor || '#ffffff';

  if (notFoundState) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center py-20">
            <h1 className="font-heading text-3xl text-white mb-4">{t('Artículo no encontrado')}</h1>
            <Link href="/blog" className="text-accent hover:underline text-sm">{t('Volver al Blog')}</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <article className="max-w-3xl mx-auto px-4 md:px-8 py-16">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[10px] text-foreground/40 font-bold uppercase tracking-wider mb-8">
            <Link href="/" className="hover:text-accent transition-colors">{t('Inicio')}</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-accent transition-colors">{t('Blog')}</Link>
            <span>/</span>
            <span className="text-accent truncate max-w-[200px]">{post.title}</span>
          </div>

          {/* Header */}
          <header className="mb-10">
            <div className="flex items-center gap-3 text-[9px] text-accent font-bold uppercase tracking-widest mb-4">
              <span>{t('K-Beauty')}</span>
              <span className="text-foreground/20">·</span>
              <span className="text-foreground/40">{post.created_at}</span>
              <span className="text-foreground/20">·</span>
              <span className="text-foreground/40">{post.author}</span>
            </div>
            <h1 className="font-heading text-3xl md:text-5xl font-light leading-tight mb-4" style={{ color: headingColor }}>{post.title}</h1>
            {post.subtitle && (
              <p className="text-base leading-relaxed max-w-2xl" style={{ color: contentColor }}>{post.subtitle}</p>
            )}
          </header>

          {/* Featured Image */}
          {post.image && (
            <div className="relative w-full h-[300px] md:h-[400px] rounded-3xl overflow-hidden mb-12 border border-white/5">
              <SafeImage
                src={post.image}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Content — colors controlled by admin settings */}
          <style>{`
            .blog-content p, .blog-content li, .blog-content td { color: ${contentColor}; }
            .blog-content h1, .blog-content h2, .blog-content h3, .blog-content h4 { color: ${headingColor}; }
            .blog-content strong, .blog-content b { color: ${headingColor}; font-weight: 700; }
            .blog-content a { color: var(--color-accent); text-decoration: none; }
            .blog-content a:hover { text-decoration: underline; }
            .blog-content h2 { font-size: 1.5rem; margin-top: 2.5rem; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.05); }
            .blog-content h3 { font-size: 1.125rem; margin-top: 2rem; margin-bottom: 0.75rem; }
            .blog-content p { line-height: 1.75; margin-bottom: 1.25rem; }
            .blog-content ul, .blog-content ol { padding-left: 1.5rem; margin-bottom: 1.25rem; }
            .blog-content li { margin-bottom: 0.5rem; line-height: 1.7; }
            .blog-content img { border-radius: 1rem; margin: 2rem 0; max-width: 100%; }
            .blog-content blockquote { border-left: 3px solid var(--color-accent); padding-left: 1rem; margin: 1.5rem 0; opacity: 0.8; }
            .blog-content code { background: rgba(255,255,255,0.08); padding: 0.1em 0.4em; border-radius: 4px; font-size: 0.875em; }
            .blog-content pre { background: rgba(0,0,0,0.4); padding: 1rem; border-radius: 0.75rem; overflow-x: auto; margin: 1.5rem 0; }
          `}</style>
          <div
            className="blog-content font-sans"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content || '') }}
          />

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-xs text-foreground/40">
              <span className="font-bold text-white">{post.author}</span> &middot; {t('Cheotnun K-Beauty')}
            </div>
            <Link
              href="/blog"
              className="text-[10px] font-bold text-accent uppercase tracking-widest hover:underline flex items-center gap-2"
            >
              ← {t('Volver al Blog')}
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}