'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { db } from '@/lib/db';
import { useLanguage } from '@/context/LanguageContext';

export default function BlogPage() {
  const { t, locale } = useLanguage();
  const rawPosts = (db.get('blog_posts') || []).filter((p: any) => p.status === 'published');
  const posts = rawPosts.map((p: any) => db.getTranslatedRecord(p, locale));

  const siteContent = db.get('site_content');
  const translatedContent = db.getTranslatedRecord(siteContent, locale) || {};
  const pageTitle = translatedContent.blog?.pageTitle || t('Blog Cheotnun K-Beauty');
  const pageSubtitle = translatedContent.blog?.pageSubtitle || t('Artículos, guías y secretos del skincare coreano.');

  useEffect(() => {
    document.title = `${pageTitle} ${t('| Cheotnun K-Beauty')}`;
  }, [pageTitle, locale]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative w-full min-h-[40vh] flex items-center justify-center overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-background" />
          <div className="relative z-10 text-center px-4 max-w-3xl mx-auto py-20">
            <span className="text-[10px] font-bold text-accent tracking-[0.25em] uppercase">{t('Cheotnun Journal')}</span>
            <h1 className="font-heading text-4xl md:text-6xl font-light text-white mt-4 mb-4 uppercase">{pageTitle}</h1>
            <p className="text-sm text-foreground/60 max-w-xl mx-auto leading-relaxed">{pageSubtitle}</p>
          </div>
        </section>

        {/* Posts Grid */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-foreground/40 text-sm">{t('No hay artículos publicados todavía.')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post: any) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col rounded-3xl border border-white/5 overflow-hidden bg-card hover:border-accent/30 transition-all duration-500 hover:-translate-y-1"
                >
                  <div className="relative h-52 overflow-hidden">
                    <Image
                      src={post.image || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600'}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                  </div>
                  <div className="p-6 flex flex-col gap-3 flex-1">
                    <div className="flex items-center gap-2 text-[9px] text-accent font-bold uppercase tracking-widest">
                      <span>{t('K-Beauty')}</span>
                      <span className="text-foreground/20">·</span>
                      <span className="text-foreground/40">{post.created_at}</span>
                    </div>
                    <h2 className="font-heading text-lg font-bold text-white group-hover:text-accent transition-colors leading-tight">
                      {t(post.title)}
                    </h2>
                    {post.subtitle && (
                      <p className="text-xs text-foreground/60 leading-relaxed line-clamp-2">{t(post.subtitle)}</p>
                    )}
                    <div className="mt-auto pt-3 flex items-center gap-2">
                      <span className="text-[10px] font-bold text-accent uppercase tracking-wider">{t('Leer más')}</span>
                      <span className="text-accent group-hover:translate-x-1 transition-transform text-sm">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
