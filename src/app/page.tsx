'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Star, ShieldCheck, Truck, ShieldAlert, Heart, Compass, Check, ArrowRight,
  Droplet, Sparkles, AlertCircle, HelpCircle, Eye, ShoppingBag, EyeOff, Smile,
  Hourglass, ClipboardList, Plus, MessageCircle, Mail, MapPin
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { db } from '@/lib/db';
import { toggleFavoriteAction } from '@/actions/shopActions';
import { authService } from '@/lib/supabaseAuth';
import { saveNewsletterSubscriberToSupabase } from '@/lib/newsletterService';
import { useLanguage } from '@/context/LanguageContext';
import { StructuredData } from '@/components/StructuredData';
import { generateOrganizationSchema, generateWebSiteSchema, generateBreadcrumbSchema } from '@/lib/structuredData';

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  ShieldCheck, Truck, ShieldAlert, Heart, Droplet, Sparkles,
  Smile, Hourglass, ClipboardList, Star, Compass
};

export default function Home() {
  const [content, setContent] = useState<any>(null);
  const { t, locale } = useLanguage();
  const [products, setProducts] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const loadData = () => {
    const rawProds = db.get('products') || [];
    setProducts(rawProds.map((p: any) => db.getTranslatedRecord(p, locale)));

    const siteContent = db.get('site_content');
    const translatedContent = db.getTranslatedRecord(siteContent, locale) || {};
    setContent(translatedContent.home || null);

    if (typeof window !== 'undefined') {
      const savedFavs = localStorage.getItem('cheotnun_favorites');
      setFavorites(savedFavs ? JSON.parse(savedFavs) : []);
    }
  };

  useEffect(() => {
    loadData();
  }, [locale]);

  const handleToggleFavorite = async (productId: string) => {
    const user = authService.getCurrentUser();
    const userId = user ? user.id : 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
    const res = await toggleFavoriteAction(userId, productId);
    if (res.success) {
      let updatedFavs = [...favorites];
      if (res.isFavorite) {
        updatedFavs.push(productId);
      } else {
        updatedFavs = updatedFavs.filter(id => id !== productId);
      }
      setFavorites(updatedFavs);
      localStorage.setItem('cheotnun_favorites', JSON.stringify(updatedFavs));
    }
  };

  const c = content;
  const rawCategories = db.get('categories') || [];
  const categories = rawCategories.map((cat: any) => db.getTranslatedRecord(cat, locale));

  return (
    <div className="flex flex-col min-h-screen bg-[#020617] text-white relative">
      <div className="absolute top-[5%] left-[10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[40%] right-[5%] w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <Header />

      {/* Hero Section — Full viewport */}
      <section className="relative min-h-[calc(100vh-80px)] flex items-center overflow-hidden border-b border-white/5">
        {/* Responsive background images */}
        <div className="absolute inset-0 bg-cover bg-[position:65%_center] bg-no-repeat md:hidden"
          style={{ backgroundImage: c?.hero?.bgImageMobile ? `url('${c.hero.bgImageMobile}')` : "url('/images/cheotnun-k-beauty-banner-mobile-skincare-coreano.webp')" }}
        />
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat hidden md:block"
          style={{ backgroundImage: c?.hero?.bgImage ? `url('${c.hero.bgImage}')` : "url('/images/cheotnun-k-beauty-banner-principal-skincare-coreano.webp')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent z-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-background/40 z-0" />

        <div className="max-w-7xl mx-auto w-full px-4 md:px-8 relative z-10 py-8 md:py-12">
          <div className="flex flex-col items-start gap-4 md:gap-5 text-left max-w-xl">
            <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-2.5 py-1 md:px-3.5 md:py-1.5">
              <span className="text-[7px] md:text-[9px] font-bold text-accent uppercase tracking-[0.15em] whitespace-nowrap">
                {t('CHEOTNUN — Tu tienda online de cosmética coreana K-Beauty')}
              </span>
            </div>
            <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-light tracking-tight leading-[0.95] text-white">
              {t(c?.hero?.titleLine1 || 'Tu belleza.')}<br />
              <span className="text-accent italic font-serif">{t(c?.hero?.titleLine2 || 'Tu ritual.')}</span><br />
              {t(c?.hero?.titleLine3 || 'Tu momento.')}
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-gray-200 max-w-md font-normal leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {t(c?.hero?.subtitle || 'Cheotnun es tu tienda online de cosmética coreana K-Beauty. Compra productos auténticos, descubre rutinas personalizadas para tu tipo de piel y recibe envíos a toda América Latina.')}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-1">
              <Link href={c?.hero?.btnBuyLink || '/tienda'}>
                <Button className="w-full sm:w-auto bg-accent hover:bg-accentHover text-background font-bold text-xs tracking-[0.1em] py-4 md:py-5 px-7 md:px-9 rounded-full shadow-xl shadow-accent/15 transition-all hover:-translate-y-0.5 duration-300">
                  {t(c?.hero?.btnBuyText || 'COMPRAR AHORA')}
                </Button>
              </Link>
              <Link href={c?.hero?.btnRoutineLink || '/rutinas'}>
                <Button variant="outline" className="w-full sm:w-auto text-white border-white/20 hover:bg-white/5 hover:border-accent/40 font-bold text-xs tracking-[0.1em] py-4 md:py-5 px-7 md:px-9 rounded-full backdrop-blur transition-all hover:-translate-y-0.5 duration-300">
                  {t(c?.hero?.btnRoutineText || 'DESCUBRIR RUTINAS')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Highlights Bar */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 relative z-20 -mt-24 md:-mt-12">
        <div className="w-full bg-[#081229]/65 backdrop-blur-xl border border-white/15 rounded-2xl md:rounded-3xl p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-xs text-muted-foreground shadow-2xl">
          {(c?.highlights?.items || []).map((feat: any, idx: number) => {
            const Icon = ICON_MAP[feat.icon] || ShieldCheck;
            return (
              <div key={idx} className="flex items-center gap-3.5">
                <span className="p-2.5 bg-white/5 rounded-xl border border-white/15 text-accent">
                  <Icon strokeWidth={1.8} className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="font-bold text-white text-[10px] tracking-wider uppercase">{t(feat.title)}</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">{t(feat.text)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Categorias Circular Row */}
      <section className="py-24 lg:py-28 max-w-7xl mx-auto w-full px-4 md:px-8">
        <div className="text-center max-w-md mx-auto mb-16">
          <span className="text-[10px] text-accent uppercase font-bold tracking-[0.2em] block mb-2">{t(c?.categories?.preTitle || 'Colección Curada')}</span>
          <h2 className="font-heading text-3xl sm:text-4xl font-light text-white tracking-wide">{t(c?.categories?.title || 'Descubre lo mejor del K-Beauty')}</h2>
          <p className="text-xs text-muted-foreground mt-2 font-light">{t(c?.categories?.subtitle || 'Productos auténticos para realzar tu belleza natural.')}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-6">
          {categories.map((cat: any) => (
            <Link key={cat.id} href={`/tienda?category=${cat.slug}`} className="relative h-64 rounded-3xl overflow-hidden border border-white/10 group shadow-xl">
              <Image src={cat.image || 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=400'} alt={cat.name} fill unoptimized className="object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm py-4 px-2 text-center border-t border-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white group-hover:text-accent transition-colors leading-snug">
                  {t(cat.name)}
                </span>
              </div>
            </Link>
          ))}
        </div>
        <div className="flex justify-center mt-12">
          <Link href="/tienda">
            <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 hover:border-accent/40 font-bold text-xs px-8 py-5 rounded-full uppercase tracking-wider transition-all hover:-translate-y-0.5 duration-300">
              {t(c?.categories?.buttonText || 'VER TODAS LAS CATEGORÍAS')}
            </Button>
          </Link>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="py-24 lg:py-28 border-y border-white/5 bg-[#050b1c] w-full">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-4 gap-12 items-center">
          <div className="flex flex-col items-start gap-4">
            <span className="text-[10px] text-accent uppercase font-bold tracking-[0.2em] block">{t(c?.bestSellers?.preTitle || 'Favoritos de la Comunidad')}</span>
            <h2 className="font-heading text-4xl font-light text-white leading-tight">{t(c?.bestSellers?.title || 'Más vendidos')}</h2>
            <p className="text-xs text-gray-400 font-light leading-relaxed">
              {t(c?.bestSellers?.subtitle || 'Los favoritos de nuestra comunidad internacional. Fórmulas probadas que entregan resultados visibles.')}
            </p>
            <Link href="/tienda" className="text-xs font-bold text-accent hover:underline flex items-center gap-1.5 uppercase tracking-[0.15em] mt-4">
              {t(c?.bestSellers?.buttonText || 'VER TODOS')} →
            </Link>
          </div>

          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-5 gap-4">
            {products.slice(0, 5).map((prod) => {
              const isFav = favorites.includes(prod.id);
              let brand = 'K-Beauty';
              if (prod.brand_id === 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33') brand = 'Round Lab';
              else if (prod.brand_id === 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44') brand = 'Beauty of Joseon';
              else if (prod.brand_id === 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55') brand = 'COSRX';
              else if (prod.brand_id === 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66') brand = 'Anua';
              else if (prod.brand_id === '70eebc99-9c0b-4ef8-bb6d-6bb9bd380a77') brand = 'Skin1004';

              const imgUrl = prod.image || 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=400';

              return (
                <div key={prod.id} className="bg-[#0b1329] border border-white/10 rounded-3xl overflow-hidden shadow-xl hover:border-accent/30 transition-all flex flex-col justify-between group relative h-full">
                  <button
                    onClick={() => handleToggleFavorite(prod.id)}
                    className="absolute right-3 top-3 z-20 p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-accent hover:scale-110 transition-transform"
                  >
                    <Heart strokeWidth={1.8} className={`h-3.5 w-3.5 ${isFav ? 'fill-accent text-accent' : 'text-accent'}`} />
                  </button>

                  <div className="relative aspect-square w-full overflow-hidden bg-secondary">
                    <Image src={imgUrl} alt={prod.name} fill unoptimized className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                    <div>
                      <span className="text-[8px] font-bold text-accent uppercase tracking-widest">{brand}</span>
                      <h3 className="font-heading text-xs font-semibold text-white line-clamp-2 mt-0.5 leading-snug group-hover:text-accent transition-colors">{prod.name}</h3>
                      <div className="flex items-center gap-1 mt-1.5">
                        <div className="flex text-accent">
                          {[...Array(5)].map((_, i) => (<Star key={i} strokeWidth={1.8} className="h-2.5 w-2.5 fill-current" />))}
                        </div>
                        <span className="text-[9px] text-gray-500 font-bold">(48)</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2.5 border-t border-white/5 mt-auto">
                      <div className="flex flex-col">
                        <span className="text-[8px] text-gray-500 uppercase font-bold tracking-wider">{t('Precio')}</span>
                        <span className="text-xs font-bold text-accent font-heading">US$ {prod.price.toFixed(2)}</span>
                      </div>
                      <Link href={`/tienda/produto/${prod.slug}`} className="p-2 bg-[#091E3A] hover:bg-accent text-white hover:text-background rounded-full border border-white/10 transition-all shadow-md">
                        <Plus strokeWidth={2} className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Experiencias Cheotnun Section */}
      <section className="py-24 lg:py-28 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-md mx-auto mb-16">
          <span className="text-[9px] font-bold text-accent tracking-widest uppercase">{t(c?.experiencias?.preTitle || 'Experiencias Cheotnun')}</span>
          <h2 className="font-heading text-3xl font-light text-white mt-1">{t(c?.experiencias?.title || 'Vive la belleza coreana más allá de los productos')}</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {(c?.experiencias?.cards || []).map((card: any, idx: number) => {
            const badgeColor = card.badgeColor === 'blue'
              ? 'bg-blue-500/20 text-blue-400 border-blue-400/35'
              : 'bg-accent/20 text-accent border-accent/35';
            return (
              <div key={idx} className="bg-[#0b1329] border border-white/10 rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-xl min-h-[340px] group">
                <div className="flex-1 p-6 md:p-8 flex flex-col justify-between relative z-10">
                  <div>
                    <span className={`text-[8px] font-bold tracking-widest px-2.5 py-1 border rounded-full uppercase w-fit block ${badgeColor}`}>
                      {t(card.badge)}
                    </span>
                    <h3 className="font-heading text-2xl font-light text-white mt-6">{t(card.title)}</h3>
                    <p className="text-xs text-gray-400 mt-3 leading-relaxed">{t(card.text)}</p>
                  </div>
                  <Link href="/experiencias">
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/5 hover:border-accent/40 font-bold text-[9px] px-6 py-4.5 rounded-full uppercase tracking-wider w-fit mt-6 transition-all hover:-translate-y-0.5 duration-300">
                      {t(card.buttonText || 'SABER MÁS')}
                    </Button>
                  </Link>
                </div>
                <div className="w-full md:w-[45%] h-[200px] md:h-auto relative shrink-0 border-t md:border-t-0 md:border-l border-white/5">
                  <Image src={card.image} fill unoptimized alt={card.title} className="object-cover group-hover:scale-102 transition-transform duration-500" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Rutinas por Necesidad */}
      <section className="py-24 lg:py-28 border-t border-white/5 bg-[#040815] w-full">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex justify-between items-end mb-16">
            <div className="text-left">
              <span className="text-[10px] text-accent uppercase font-bold tracking-[0.2em] block mb-2">{t(c?.routines?.preTitle || 'Tratamientos Específicos')}</span>
              <h2 className="font-heading text-3xl font-light text-white uppercase tracking-wide">{t(c?.routines?.title || 'Rutinas para cada necesidad')}</h2>
              <p className="text-xs text-gray-400 mt-2 font-light">{t(c?.routines?.subtitle || 'Encuentra la rutina ideal para tu tipo de piel y estilo de vida.')}</p>
            </div>
            <Link href="/rutinas" className="text-xs font-bold text-accent hover:underline uppercase tracking-[0.15em] shrink-0 pb-1 hidden sm:block">
              {t(c?.routines?.buttonText || 'VER TODAS LAS RUTINAS')} →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-6">
            {(c?.routines?.items || []).map((item: any, idx: number) => {
              const Icon = ICON_MAP[item.icon] || Sparkles;
              return (
                <div key={idx} className="border border-white/10 bg-card/45 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 hover:border-accent/40 transition-all text-center shadow-lg">
                  <span className="p-3 bg-white/5 rounded-full text-accent border border-white/10">
                    <Icon strokeWidth={1.8} className="h-5 w-5" />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300 mt-1">{t(item.name)}</span>
                </div>
              );
            })}
          </div>

          {/* Mobile-only link to /rutinas */}
          <div className="mt-8 text-center sm:hidden">
            <Link href="/rutinas" className="text-xs font-bold text-accent hover:underline uppercase tracking-[0.15em]">
              {t(c?.routines?.buttonText || 'VER TODAS LAS RUTINAS')} →
            </Link>
          </div>

          <div className="w-full bg-[#0b1329] border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8 grid grid-cols-2 md:grid-cols-5 gap-6 text-xs text-muted-foreground shadow-2xl mt-16">
            {(c?.routines?.badges || []).map((badge: any, idx: number) => {
              const Icon = ICON_MAP[badge.icon] || ShieldCheck;
              return (
                <div key={idx} className="flex items-center gap-3 justify-center">
                  <span className="p-2 bg-white/5 rounded-full text-accent border border-white/10">
                    <Icon strokeWidth={1.8} className="h-4 w-4" />
                  </span>
                  <span className="font-bold text-white text-[9.5px] uppercase tracking-wider text-center">{t(badge.title)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Instagram Feed */}
      <section className="py-24 lg:py-28 max-w-7xl mx-auto px-4 md:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-center mb-10">
          <div className="flex flex-col items-start gap-4">
            <h2 className="font-heading text-3xl font-light text-white uppercase leading-tight">{t(c?.instagram?.title || 'Únete a nuestra comunidad')}</h2>
            <p className="text-xs text-gray-400 font-light leading-relaxed">{t(c?.instagram?.subtitle || 'Tips, rutinas, lanzamientos y mucho más en Instagram.')}</p>
            <a href={c?.instagram?.buttonLink || 'https://instagram.com/cheotnun.kbeauty'} target="_blank" rel="noreferrer">
              <Button variant="outline" className="border-white/10 hover:bg-white/5 text-white font-bold text-[10px] px-8 py-5 rounded-full uppercase tracking-wider transition-all hover:-translate-y-0.5 duration-300">
                {t(c?.instagram?.buttonText || 'SEGUIR EN INSTAGRAM')}
              </Button>
            </a>
          </div>

          <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-5 gap-4">
            {(c?.instagram?.images || []).map((url: string, idx: number) => (
              <div key={idx} className="relative aspect-square rounded-3xl overflow-hidden border border-white/10 group shadow-lg">
                <Image src={url} alt={`Instagram ${idx}`} fill unoptimized className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/10" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 bg-background w-full">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="relative bg-[#0b1329] border border-white/10 rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-md">
              <span className="text-[8px] font-bold text-accent uppercase tracking-widest">{t(c?.newsletter?.preTitle || 'CHEOTNUN CLUB')}</span>
              <h2 className="font-heading text-3xl font-light text-accent uppercase tracking-wide mt-2">{t(c?.newsletter?.title || 'Sé la primera en descubrir nuevos lanzamientos y ofertas.')}</h2>
            </div>

            <div className="w-full max-w-md">
              {newsletterSubscribed ? (
                <div className="text-accent font-bold text-xs bg-accent/10 border border-accent/30 p-4 rounded-xl text-center">
                  {t(c?.newsletter?.successMessage || '✓ ¡Te has suscrito con éxito! Bienvenido al Cheotnun Club.')}
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newsletterEmail) {
                      const subs = db.get('newsletter_subscribers') || [];
                      const exists = subs.some((s: any) => s.email === newsletterEmail);
                      if (!exists) {
                        subs.push({
                          id: crypto.randomUUID(),
                          email: newsletterEmail,
                          name: '',
                          source: 'homepage',
                          status: 'active',
                          created_at: new Date().toISOString().split('T')[0]
                        });
                        db.save('newsletter_subscribers', subs);
                        // Salvar também no Supabase (async, não bloqueia a UI)
                        saveNewsletterSubscriberToSupabase(newsletterEmail, '', 'homepage')
                          .then(result => {
                            if (result.success) {
                              console.log('✓ Newsletter subscriber saved to Supabase');
                            } else {
                              console.error('✗ Failed to save to Supabase:', result.error);
                            }
                          });
                        // Disparar evento para atualizar outras abas/páginas
                        if (typeof window !== 'undefined') {
                          window.dispatchEvent(new Event('storage'));
                          window.dispatchEvent(new CustomEvent('cheotnun_db_change', { detail: { table: 'newsletter_subscribers' } }));
                        }
                      }
                      setNewsletterSubscribed(true);
                    }
                  }}
                  className="flex flex-col sm:flex-row gap-3 w-full"
                >
                  <Input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={e => setNewsletterEmail(e.target.value)}
                    placeholder={t('Tu correo electrónico')}
                    className="bg-black/50 border-white/10 rounded-full text-white placeholder-gray-500 text-xs h-11 px-6 w-full"
                  />
                  <Button type="submit" className="bg-accent hover:bg-accentHover text-background rounded-full font-bold px-8 h-11 text-xs shrink-0 transition-all hover:scale-105 w-full sm:w-auto">
                    {t(c?.newsletter?.buttonText || 'SUSCRIBIRSE')}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Data Transparency Notice */}
      <section className="py-12 bg-[#030712] border-t border-white/5 w-full">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            {t('Al registrarte en Cheotnun, tus datos (nombre, correo electrónico) se utilizan para procesar tus pedidos, personalizar tu experiencia de compra y enviarte información relevante sobre tus compras. Tus datos están seguros y nunca se comparten sin tu consentimiento.')}
          </p>
        </div>
      </section>

      <Footer />
      
      {/* Structured Data for SEO */}
      <StructuredData data={generateOrganizationSchema()} id="organization-schema" />
      <StructuredData data={generateWebSiteSchema()} id="website-schema" />
      <StructuredData data={generateBreadcrumbSchema([
        { name: 'Inicio', url: 'https://www.cheotnun.com' },
      ])} id="breadcrumb-schema" />
    </div>
  );
}
