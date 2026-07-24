'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Award, 
  Beaker, 
  Heart, 
  ShieldCheck, 
  ShoppingBag, 
  Headset, 
  Gift, 
  Star,
  Leaf,
  FlaskConical,
  Rabbit,
  Recycle,
  Flower2
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/context/LanguageContext';
import { db } from '@/lib/db';
import { useState, useEffect } from 'react';
export default function MarcasPage() {
  const { t, locale } = useLanguage();
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    const siteContent = db.get('site_content');
    const translatedContent = db.getTranslatedRecord(siteContent, locale) || {};
    setContent(translatedContent.marcas || null);
  }, [locale]);

  const c = content || db.get('site_content')?.marcas || {};

  return (
    <div className="min-h-screen bg-[#07101E] flex flex-col font-body selection:bg-[#C9C9C9]/30 text-white">
      <Header />

      <main className="flex-1 w-full overflow-hidden">
        
        {/* 1. HERO SECTION */}
        <section className="relative w-full max-w-full h-[calc(100vh-80px)] overflow-hidden flex flex-col justify-center">
          {/* Background Image */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <Image
              src={c?.hero?.image || "/images/cheotnun-k-beauty-marcas-coreanas-oficiais.webp"}
              alt="K-Beauty Products"
              fill
              sizes="100vw"
              className="object-cover object-center hidden md:block"
              priority
            />
            <Image
              src={c?.hero?.imageMobile || "/images/mobile/cheotnun-k-beauty-marcas-coreanas-oficiais.webp"}
              alt="K-Beauty Products Mobile"
              fill
              sizes="100vw"
              className="object-cover object-center md:hidden"
              priority
            />
          </div>
          {/* Overlay: stronger on mobile for text readability */}
          <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/70 via-black/50 to-black/20 md:bg-gradient-to-r md:from-black/60 md:via-black/30 md:to-transparent" />

          <div className="relative z-10 w-full px-4 lg:px-12 py-6 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center h-full">
            {/* Text Content */}
            <div className="flex flex-col gap-8 max-w-xl">
              <div>
                <h1 className="text-5xl lg:text-7xl font-heading font-light text-white mb-6 leading-[1.1]">
                  {t(c?.hero?.title || 'Marcas Coreanas')}
                </h1>
                <p className="text-base text-gray-300 leading-relaxed max-w-md">
                  {t(c?.hero?.subtitle || 'Trabajamos con las mejores marcas de Corea del Sur para ofrecerte lo mejor en cuidado de la piel.')}
                </p>
              </div>

              <div className="flex flex-col gap-8 mt-4">
                {(c?.features || [
                  { title: 'Marcas auténticas', text: 'Productos 100% originales comprados directamente en Corea del Sur.', icon: 'Award' },
                  { title: 'Innovación y calidad', text: 'Marcas reconocidas por su tecnología avanzada y resultados comprobados.', icon: 'Beaker' },
                  { title: 'Belleza consciente', text: 'Fórmulas seguras, ingredientes eficaces y respeto por tu piel y el medio ambiente.', icon: 'Heart' }
                ]).map((feat: any, idx: number) => {
                  const IconMap: any = { Award, Beaker, Heart, ShieldCheck, ShoppingBag, Headset, Gift, Star, Leaf, FlaskConical, Rabbit, Recycle, Flower2 };
                  const Icon = IconMap[feat.icon] || Award;
                  return (
                    <div key={idx} className="flex items-start gap-5">
                      <div className="w-12 h-12 rounded-full border border-[#C9C9C9] flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-[#C9C9C9] stroke-[1.5]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white mb-1">{t(feat.title)}</h3>
                        <p className="text-xs text-gray-400 leading-relaxed">{t(feat.text)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right side left empty so the grid pushes text left and reveals the background image on right */}
            <div className="hidden lg:block w-full h-full"></div>
          </div>
        </section>

        {/* 2. BRANDS LOGOS SECTION */}
        <section className="w-full px-4 lg:px-12 py-16 border-t border-b border-white/5 bg-[#030712]/50">
          <div className="max-w-[1400px] mx-auto flex flex-col items-center">
            <h2 className="text-xl font-heading font-light text-[#C9C9C9] mb-12 text-center">
              {t('Algunas de las marcas que ofrecemos')}
            </h2>
            
            <div className="w-full flex flex-wrap justify-center gap-x-12 gap-y-10 items-center opacity-80">
              {/* Using typography/CSS for logos since we don't have SVGs for all specific K-beauty brands, styled to look like official wordmarks */}
              <div className="font-heading font-bold text-3xl tracking-widest uppercase">COSRX</div>
              <div className="font-body font-medium text-3xl tracking-tight lowercase">anua</div>
              <div className="flex flex-col items-center">
                <div className="font-heading font-bold text-2xl tracking-[0.2em]">SKIN1004</div>
                <div className="text-[6px] tracking-widest uppercase mt-0.5">THE UNTOUCHED NATURE</div>
              </div>
              <div className="font-heading font-normal text-2xl tracking-wide italic">Beauty of Joseon</div>
              <div className="font-body font-black text-2xl tracking-tighter uppercase">ROUND LAB</div>
              <div className="font-heading font-medium text-2xl tracking-widest uppercase">íUNIK</div>
              <div className="font-body font-semibold text-2xl tracking-tight lowercase">isntree</div>
              <div className="flex flex-col items-center">
                <div className="font-body font-bold text-2xl tracking-widest uppercase">PURITO</div>
                <div className="text-[7px] tracking-[0.3em] uppercase mt-0.5 opacity-60">SEOUL</div>
              </div>
            </div>

            <Link href="/tienda" className="mt-16 px-8 py-3 rounded-full border border-white/20 text-xs font-bold tracking-widest uppercase hover:bg-white/5 transition-colors inline-block text-center">
              {t('VER TODAS LAS MARCAS')}
            </Link>
          </div>
        </section>

        {/* 3. WHY CHOOSE US SECTION */}
        <section className="w-full px-4 lg:px-12 py-24 max-w-[1400px] mx-auto">
          <h2 className="text-3xl lg:text-4xl font-heading font-light text-white mb-12 text-left">
            {t(c?.whyChooseUs?.title || '¿Por qué elegir Cheotnun?')}
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(c?.whyChooseUs?.items || [
                { title: 'Productos 100% originales', text: 'Garantizamos autenticidad en cada producto.', icon: 'ShieldCheck' },
                { title: 'Compra directa en Corea', text: 'Seleccionamos y compramos personalmente para ti.', icon: 'ShoppingBag' },
                { title: 'Atención personalizada', text: 'Te acompañamos en todo el proceso de compra.', icon: 'Headset' },
                { title: 'Selección exclusiva', text: 'Productos elegidos con criterio y mucho cariño.', icon: 'Gift' }
              ]).map((item: any, idx: number) => {
                const IconMap: any = { ShieldCheck, ShoppingBag, Headset, Gift, Award, Beaker, Heart, Star, Leaf, FlaskConical, Rabbit, Recycle, Flower2 };
                const Icon = IconMap[item.icon] || ShieldCheck;
                return (
                  <div key={idx} className="border border-white/10 rounded-2xl p-6 flex flex-col gap-4 hover:bg-white/5 transition-colors">
                    <Icon className="w-8 h-8 text-[#C9C9C9] stroke-[1.2]" />
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1.5">{t(item.title)}</h4>
                      <p className="text-xs text-gray-400 leading-relaxed">{t(item.text)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Card with Image */}
            <div className="bg-[#EFE8DF] rounded-2xl p-8 lg:p-12 flex flex-col lg:flex-row gap-8 items-center text-[#1c2838] relative overflow-hidden">
              <div className="flex-1 z-10 relative">
                <h3 className="text-3xl font-heading font-light leading-tight mb-6">
                  {t(c?.whyChooseUs?.conclusionTitle || 'Seleccionamos con amor, entregamos con confianza.')}
                </h3>
                <p className="text-sm opacity-80 leading-relaxed max-w-xs">
                  {t(c?.whyChooseUs?.conclusionText || 'Nuestro compromiso es que vivas la mejor experiencia de K-Beauty, desde Corea hasta ti.')}
                </p>
              </div>
              <div className="w-full max-w-[280px] h-[350px] relative rounded-xl overflow-hidden shadow-lg z-10">
                <Image
                  src={c?.whyChooseUs?.image || "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop"}
                  alt="K-Beauty Experience"
                  fill
                  className="object-cover"
                />
              </div>
              
              {/* Background decorative elements if needed */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/40 rounded-full blur-3xl" />
            </div>
          </div>
        </section>

        {/* 4. TESTIMONIALS SECTION */}
        <section className="w-full px-4 lg:px-12 pb-24 max-w-[1400px] mx-auto flex flex-col items-center">
          <h2 className="text-2xl font-heading font-light text-white mb-12 text-center">
            {t(c?.testimonials?.title || 'Lo que dicen nuestras clientas')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {(c?.testimonials?.list || []).length > 0 ? (c?.testimonials?.list || []).map((test: any, idx: number) => (
              <div key={idx} className="bg-[#EFE8DF] rounded-2xl p-8 flex flex-col justify-between min-h-[260px] text-[#1c2838]">
                <div>
                  <div className="flex gap-1 mb-4">
                    {[1,2,3,4,5].map(star => <Star key={star} className="w-3.5 h-3.5 fill-[#D5A07D] text-[#C9C9C9]" />)}
                  </div>
                  <p className="text-sm font-medium leading-relaxed mb-8">
                    "{t(test.text)}"
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden relative shadow-sm">
                    <Image src={test.img || test.image} alt={test.name} fill className="object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold leading-tight">{test.name}</span>
                    <span className="text-[10px] opacity-70 mt-0.5">{test.country}</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-4 text-center text-xs text-muted-foreground py-12">
                {t('Ningún testimonio disponible.')}
              </div>
            )}
          </div>

          <a href={c?.testimonials?.buttonLink || 'https://www.instagram.com/lacheotnun'} target="_blank" rel="noopener noreferrer" className="mt-12 px-8 py-3 rounded-full border border-white/20 text-xs font-bold tracking-widest uppercase hover:bg-white/5 transition-colors">
            {t(c?.testimonials?.buttonText || 'VER MÁS OPINIONES')}
          </a>
        </section>

        {/* 5. TRUST BADGES BAR */}
        <section className="w-full border-t border-white/10 bg-[#050B14]">
          <div className="max-w-[1400px] mx-auto px-4 lg:px-12 py-8">
            <div className="flex flex-wrap lg:flex-nowrap justify-between gap-6">
              {(c?.trustBadges || []).length > 0 ? (c?.trustBadges || []).map((badge: any, idx: number) => {
                const BadgeIcon: any = { Leaf, FlaskConical, Rabbit, Recycle, Flower2, Award, Beaker, Heart, ShieldCheck, ShoppingBag, Headset, Gift, Star };
                const Icon = BadgeIcon[badge.icon] || Leaf;
                return (
                  <div key={idx} className="flex items-center gap-3 flex-1 min-w-[200px]">
                    <Icon className="w-6 h-6 text-[#C9C9C9] stroke-[1.2] shrink-0" />
                    <span className="text-[10px] text-gray-300 leading-tight whitespace-pre-line">
                      {t(badge.text)}
                    </span>
                  </div>
                );
              }) : (
                <div className="text-[10px] text-muted-foreground text-center w-full">{t('Sin sellos de confianza configurados.')}</div>
              )}
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
