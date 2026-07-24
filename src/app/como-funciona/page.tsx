'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ShoppingBag, 
  PlaneTakeoff, 
  PackageSearch, 
  Truck,
  CreditCard,
  Building2,
  Globe2,
  CheckCircle2,
  ShieldCheck,
  Leaf,
  Plus,
  Mail,
  Box,
  ArrowRight
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/context/LanguageContext';
import { db } from '@/lib/db';
import { useState, useEffect } from 'react';
import { saveNewsletterSubscriberToSupabase } from '@/lib/newsletterService';
import { Visa, Mastercard, Amex, PayPal, DinersClub } from '@/components/PaymentIcons';

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const BranchBlossom = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 180 C 60 140 100 120 180 40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M60 140 C 90 150 120 160 150 140" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M100 120 C 110 90 130 70 160 60" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M140 80 C 150 100 160 110 180 110" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    
    <g transform="translate(180, 40) scale(1)">
      <path d="M0 -5 C 5 -15 15 -10 10 0 C 20 5 20 15 10 15 C 5 25 -5 25 -10 15 C -20 15 -20 5 -10 0 C -15 -10 -5 -15 0 -5 Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="0" cy="5" r="1.5" fill="currentColor" />
    </g>
    <g transform="translate(160, 60) scale(0.8) rotate(30)">
      <path d="M0 -5 C 5 -15 15 -10 10 0 C 20 5 20 15 10 15 C 5 25 -5 25 -10 15 C -20 15 -20 5 -10 0 C -15 -10 -5 -15 0 -5 Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="0" cy="5" r="1.5" fill="currentColor" />
    </g>
    <g transform="translate(150, 140) scale(1.1) rotate(-20)">
      <path d="M0 -5 C 5 -15 15 -10 10 0 C 20 5 20 15 10 15 C 5 25 -5 25 -10 15 C -20 15 -20 5 -10 0 C -15 -10 -5 -15 0 -5 Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="0" cy="5" r="1.5" fill="currentColor" />
    </g>
    <g transform="translate(90, 110) scale(0.7) rotate(45)">
      <path d="M0 -5 C 5 -15 15 -10 10 0 C 20 5 20 15 10 15 C 5 25 -5 25 -10 15 C -20 15 -20 5 -10 0 C -15 -10 -5 -15 0 -5 Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="0" cy="5" r="1.5" fill="currentColor" />
    </g>

    <circle cx="180" cy="110" r="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="140" cy="150" r="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="110" cy="70" r="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="50" cy="130" r="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    
    <path d="M60 140 Q 50 130 65 125 Z" fill="none" stroke="currentColor" strokeWidth="1" />
    <path d="M100 120 Q 90 100 115 105 Z" fill="none" stroke="currentColor" strokeWidth="1" />
    <path d="M140 80 Q 135 65 150 70 Z" fill="none" stroke="currentColor" strokeWidth="1" />
  </svg>
);

export default function ComoFuncionaPage() {
  const { t, locale } = useLanguage();
  const [content, setContent] = useState<any>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  useEffect(() => {
    const siteContent = db.get('site_content');
    const translatedContent = db.getTranslatedRecord(siteContent, locale) || {};
    setContent(translatedContent.comoFunciona || null);
  }, [locale]);

  const c = content || db.get('site_content')?.comoFunciona || {};

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <Header />

      <main className="flex-1 w-full flex flex-col items-center">
        {/* HERO SECTION */}
        <section className="relative w-full max-w-full h-[calc(100vh-80px)] overflow-hidden flex flex-col justify-center">
          {/* Background Image */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <Image 
              src={c?.hero?.image || "/images/cheotnun-k-beauty-como-funciona-guia.webp"} 
              alt="Productos"
              fill
              sizes="100vw"
              className="object-cover object-center hidden md:block"
              priority
            />
            <Image 
              src={c?.hero?.imageMobile || "/images/mobile/cheotnun-k-beauty-como-funciona-guia.webp"} 
              alt="Productos Mobile"
              fill
              sizes="100vw"
              className="object-cover object-center md:hidden"
              priority
            />
          </div>
          {/* Overlay: stronger on mobile for text readability */}
          <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/70 via-black/50 to-black/20 md:bg-gradient-to-r md:from-black/60 md:via-black/30 md:to-transparent" />

          <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-12 py-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col max-w-xl">
              <h1 className="text-5xl md:text-6xl font-heading font-light text-white mb-6">
                {t(c?.hero?.title || 'Cómo funciona')}
              </h1>
              <p className="text-white/80 text-[13px] leading-relaxed mb-12 max-w-sm">
                {t(c?.hero?.subtitle || 'Hemos simplificado cada paso para que tu experiencia de compra sea segura, práctica y confiable.')}
              </p>
            </div>
            
            {/* Right side empty */}
            <div className="hidden lg:block w-full h-full"></div>
          </div>
        </section>

        {/* TIMELINE STEPS */}
        <section className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 mb-12 -mt-20 relative z-20">
           <div className="border border-[#C9C9C9]/40 rounded-3xl p-8 lg:p-12 bg-[#0a111a]/80 backdrop-blur-md shadow-2xl relative overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                 {/* Connecting line */}
                 <div className="absolute top-[35px] left-[12%] right-[12%] h-[1px] bg-[#C9C9C9]/30 hidden lg:block" />
                 
                 {(c?.steps || [
                   { number: '1', icon: 'ShoppingBag', title: 'Eliges\ntus productos', text: 'Explora nuestra tienda\ny selecciona tus favoritos.' },
                   { number: '2', icon: 'PlaneTakeoff', title: 'Compramos\nen Corea', text: 'Nuestro equipo compra\ndirectamente en tiendas\noficiales y confiables.' },
                   { number: '3', icon: 'PackageSearch', title: 'Preparamos\ntu pedido', text: 'Verificamos, embalamos\ny preparamos todo\ncon mucho cuidado.' },
                   { number: '4', icon: 'Truck', title: 'Enviamos\na ti', text: 'Recibes tus productos\nen la puerta de tu casa,\nestés donde estés.' }
                 ]).map((step: any, idx: number) => {
                   const IconMap: any = { ShoppingBag, PlaneTakeoff, PackageSearch, Truck, ShieldCheck, Leaf, Box, CheckCircle2 };
                   const Icon = IconMap[step.icon] || ShoppingBag;
                   return (
                     <div key={idx} className="flex flex-col items-center text-center relative z-10 group">
                        <div className="relative mb-6">
                          <div className="w-20 h-20 rounded-full border border-white/20 flex items-center justify-center bg-transparent group-hover:border-[#C9C9C9]/50 transition-colors">
                             <Icon className="w-8 h-8 text-white stroke-[1.2] group-hover:text-[#C9C9C9] transition-colors" />
                          </div>
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#EAE4DC] text-[#1c2838] text-[10px] font-bold flex items-center justify-center shadow-md">
                             {step.number}
                          </div>
                        </div>
                        <h4 className="text-[14px] font-heading font-light text-white mb-3 leading-tight whitespace-pre-line">{t(step.title)}</h4>
                        <p className="text-[10px] text-white/60 leading-relaxed whitespace-pre-line">{t(step.text)}</p>
                     </div>
                   );
                 })}
              </div>
           </div>
        </section>

        {/* FORMAS DE PAGO & ENVIOS INTERNACIONALES */}
        <section className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 mb-12">
           <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
              
              {/* Formas de Pago */}
              <div className="border border-white/10 bg-transparent rounded-3xl p-8 lg:p-10 relative overflow-hidden flex flex-col justify-between shadow-lg">
                 <div>
                   <h3 className="text-2xl font-heading text-white font-light mb-2">{t(c?.paymentsInfo?.title || 'Formas de pago')}</h3>
                   <p className="text-[11px] text-white/60 mb-8">{t(c?.paymentsInfo?.subtitle || 'Seguridad y flexibilidad para ti.')}</p>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="border border-white/10 rounded-xl h-16 flex items-center justify-center p-3 bg-white">
                       <Visa className="h-8 w-auto" />
                    </div>
                    <div className="border border-white/10 rounded-xl h-16 flex items-center justify-center p-3 bg-white">
                       <Mastercard className="h-8 w-auto" />
                    </div>
                    <div className="border border-white/10 rounded-xl h-16 flex items-center justify-center p-3 bg-white">
                       <Amex className="h-8 w-auto" />
                    </div>
                    <div className="border border-white/10 rounded-xl h-16 flex items-center justify-center p-3 bg-white">
                       <DinersClub className="h-8 w-auto" />
                    </div>
                    <div className="border border-white/10 rounded-xl h-16 flex items-center justify-center p-3 bg-white col-span-2">
                       <PayPal className="h-10 w-auto" />
                    </div>
                    <div className="border border-[#1c2838]/10 rounded-xl p-4 bg-white flex flex-col items-center justify-center text-center">
                       <Building2 className="w-6 h-6 text-[#1c2838] mb-2 stroke-[1.2]" />
                       <span className="text-[9px] text-[#1c2838]/80 leading-tight">Transferencia<br/>Bancaria</span>
                    </div>
                 </div>
              </div>

              {/* Envios Internacionales */}
              <div className="border border-white/10 bg-transparent rounded-3xl p-8 lg:p-10 relative overflow-hidden shadow-lg flex flex-col lg:flex-row gap-8">
                 <div className="flex-1 flex flex-col justify-center z-10 relative">
                   <h3 className="text-2xl font-heading text-white font-light mb-2">{t(c?.shippingInfo?.title || 'Envíos internacionales')}</h3>
                   <p className="text-[11px] text-white/60 mb-10">{t(c?.shippingInfo?.subtitle || 'Llegamos a toda América Latina.')}</p>

                   <div className="flex flex-col gap-6">
                      {(c?.shippingInfo?.items || [
                        { title: 'Envíos seguros y rastreables', text: 'Trabajamos con transportadoras confiables para que tu pedido llegue hasta ti.' },
                        { title: 'Tiempo estimado de entrega', text: 'De 7 a 20 días hábiles, dependiendo de tu país.' },
                        { title: 'Te mantenemos informada', text: 'Recibirás tu número de seguimiento para acompañar cada paso de tu pedido.' }
                      ]).map((item: any, idx: number) => {
                         const icons = [Box, ClockIcon, ArrowDownCircleIcon];
                         const Icon = icons[idx % icons.length];
                         return (
                            <div key={idx} className="flex gap-4">
                               <div className="mt-1 w-8 h-8 rounded-full border border-white/20 flex items-center justify-center shrink-0">
                                  <Icon className="w-4 h-4 text-white stroke-[1.5]" />
                               </div>
                               <div>
                                  <h4 className="text-[11px] font-bold text-white mb-1">{t(item.title)}</h4>
                                  <p className="text-[9px] text-white/60 leading-relaxed max-w-[200px]">
                                    {t(item.text)}
                                  </p>
                               </div>
                            </div>
                         );
                      })}
                   </div>
                 </div>

                 {/* World Map Background/Image */}
                 <div className="relative flex-1 min-h-[250px] opacity-40 mix-blend-screen flex items-center justify-center">
                    {/* SVG Map representing global reach */}
                    <svg viewBox="0 0 1000 500" className="w-full h-full text-white fill-current opacity-30">
                       <path d="M200,150 Q250,100 300,120 T350,80 T400,150 T450,180 T380,250 T300,280 T200,200 Z" />
                       <path d="M600,100 Q650,50 700,70 T800,120 T850,200 T800,300 T700,280 T600,200 Z" />
                       <path d="M250,300 Q300,350 320,400 T280,450 T220,380 Z" />
                       <circle cx="280" cy="380" r="4" className="fill-accent opacity-100" />
                       <circle cx="700" cy="150" r="4" className="fill-accent opacity-100" />
                       <circle cx="400" cy="180" r="4" className="fill-accent opacity-100" />
                       <path d="M280,380 Q500,200 700,150" fill="none" stroke="#c5a173" strokeWidth="2" strokeDasharray="5,5" className="opacity-100" />
                       <path d="M400,180 Q350,280 280,380" fill="none" stroke="#c5a173" strokeWidth="2" strokeDasharray="5,5" className="opacity-100" />
                    </svg>
                 </div>
              </div>
           </div>
        </section>

        {/* PRODUCTOS ORIGINALES */}
        <section className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 mb-16">
           <div className="bg-[#EAE4DC] text-[#1c2838] rounded-3xl p-8 lg:p-12 shadow-lg flex flex-col md:flex-row items-center gap-10 overflow-hidden relative">
              <div className="relative w-full md:w-1/3 h-[300px] rounded-2xl overflow-hidden shrink-0">
                 <Image 
                   src={c?.promises?.image || 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=600'} 
                   alt="Productos originales"
                   fill
                   className="object-cover"
                 />
              </div>
              
              <div className="flex-1 flex flex-col justify-center relative z-10">
                 <h3 className="text-3xl font-heading mb-4 leading-tight">{t(c?.promises?.title || 'Productos 100 % originales')}</h3>
                 <p className="text-[11px] text-[#1c2838]/80 leading-relaxed mb-10 max-w-lg">
                   {t(c?.promises?.subtitle || 'Solo trabajamos con marcas coreanas auténticas y autorizadas. Garantizamos la calidad y procedencia de cada producto que llega a tus manos.')}
                 </p>

                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    {(c?.promises?.items || [
                      { icon: 'ShieldCheck', title: 'Marcas oficiales' },
                      { icon: 'Box', title: 'Compra directa en Corea del Sur' },
                      { icon: 'CheckCircle2', title: 'Productos certificados' },
                      { icon: 'Leaf', title: 'Frescura y calidad garantizadas' }
                    ]).map((item: any, idx: number) => {
                      const PromIconMap: any = { ShieldCheck, Box, CheckCircle2, Leaf };
                      const PromIcon = PromIconMap[item.icon] || ShieldCheck;
                      return (
                        <div key={idx} className="flex flex-col items-center text-center">
                           <div className="w-12 h-12 rounded-full border border-[#1c2838]/20 flex items-center justify-center mb-3">
                             <PromIcon className="w-5 h-5 stroke-[1.5]" />
                           </div>
                           <h5 className="text-[9px] font-bold text-[#1c2838] leading-tight whitespace-pre-line">{t(item.title)}</h5>
                        </div>
                      );
                    })}
                 </div>
              </div>
           </div>
        </section>

        {/* PREGUNTAS FRECUENTES */}
        {(c?.faq?.items || []).length > 0 && (
          <section className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 mb-16">
             <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-white/10 pb-4">
                <div>
                   <h3 className="text-2xl font-heading text-white font-light">{t(c?.faq?.title || 'Preguntas frecuentes')}</h3>
                   <p className="text-[11px] text-white/60 mt-1">{t(c?.faq?.subtitle || 'Resolvemos tus dudas más comunes.')}</p>
                </div>
                <Link href="/ayuda/preguntas-frecuentes" className="text-[9px] font-bold text-white uppercase tracking-widest hover:text-[#C9C9C9] transition-colors flex items-center gap-2 mt-4 md:mt-0">
                   {t(c?.faq?.buttonText || 'VER TODAS LAS PREGUNTAS')} <ArrowRight className="w-3 h-3" />
                 </Link>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0">
                {(c?.faq?.items || []).map((q: string, idx: number) => (
                   <div key={idx} className="border-b border-white/10 py-5 flex items-center justify-between cursor-pointer group hover:border-[#C9C9C9]/40 transition-colors">
                      <span className="text-[12px] text-white/90 group-hover:text-[#C9C9C9] transition-colors">{t(q)}</span>
                      <Plus className="w-4 h-4 text-white/40 group-hover:text-[#C9C9C9] transition-colors" />
                   </div>
                ))}
             </div>
          </section>
        )}

        {/* UNETE A NUESTRA COMUNIDAD (INSTAGRAM) */}
        <section className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 mb-16">
           <div className="flex flex-col xl:flex-row gap-8 items-center xl:items-start">
              <div className="flex-1 max-w-sm mt-4 text-center xl:text-left">
                 <h3 className="text-2xl font-heading text-white font-light mb-2">{t(c?.community?.title || 'Únete a nuestra comunidad')}</h3>
                 <p className="text-[11px] text-white/60 leading-relaxed mb-6">
                   {t(c?.community?.desc || 'Descubre rutinas, tips, lanzamientos y mucho más en Instagram.')}
                 </p>
                 <a href={c?.community?.buttonLink || 'https://instagram.com/cheotnun.kbeauty'} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-white/20 hover:bg-white/5 text-white font-bold text-[9px] tracking-widest px-6 py-3 rounded-sm uppercase transition-all">
                    <Instagram className="w-4 h-4" /> {t(c?.community?.buttonText || 'SEGUIR EN INSTAGRAM')}
                 </a>
              </div>

              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                 {(c?.community?.images || [
                   'https://images.unsplash.com/photo-1615397323281-a6cecd55dbf7?q=80&w=300',
                   'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?q=80&w=300',
                   'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=300',
                   'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=300'
                 ]).map((img: string, idx: number) => (
                    <a key={idx} href={c?.community?.buttonLink || 'https://instagram.com/cheotnun.kbeauty'} target="_blank" rel="noreferrer" className="relative h-40 md:h-48 rounded-xl overflow-hidden group">
                       <Image src={img} alt="Instagram" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                       <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Instagram className="w-6 h-6 text-white" />
                       </div>
                       <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Instagram className="w-3 h-3 text-white" />
                       </div>
                    </a>
                 ))}
              </div>
           </div>
        </section>

        {/* NEWSLETTER */}
        <section className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 mb-16">
          <div className="border border-white/10 rounded-2xl py-10 px-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden bg-[#0a111a]">
             <Mail className="absolute left-8 top-1/2 -translate-y-1/2 w-32 h-32 text-[#C9C9C9]/10 pointer-events-none" strokeWidth={0.5} />
             <BranchBlossom className="absolute -right-10 bottom-0 w-64 h-64 text-[#C9C9C9]/20 pointer-events-none" />
             
             <div className="flex items-center gap-6 z-10 pl-4">
               <div>
                 <h4 className="text-xl md:text-2xl font-heading text-white font-light mb-1">
                   {t(c?.newsletter?.title || 'Sé la primera en enterarte')}
                 </h4>
                 <p className="text-[11px] text-white/60 max-w-sm leading-relaxed">
                   {t(c?.newsletter?.subtitle || 'Nuevos lanzamientos, ofertas exclusivas y contenido especial directamente en tu correo.')}
                 </p>
                 <div className="w-full max-w-md z-10 flex flex-col items-end">
                {newsletterSubscribed ? (
                  <div className="bg-[#C9C9C9]/10 border border-[#C9C9C9]/20 rounded-md p-4 w-full flex items-center justify-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#C9C9C9]" />
                    <span className="text-sm font-bold text-white uppercase tracking-wider">{t('✓ ¡Te has suscrito con éxito! Recibirás los eventos del blog en tu correo.')}</span>
                  </div>
                ) : (
                  <form 
                    onSubmit={(e) => { 
                      e.preventDefault(); 
                      if (newsletterEmail) {
                        const currentSubs = db.get('newsletter_subscribers') || [];
                        if (!currentSubs.some((s: any) => s.email === newsletterEmail)) {
                          const subs = [...currentSubs];
                          subs.push({
                            id: crypto.randomUUID(),
                            email: newsletterEmail,
                            source: 'como-funciona',
                            status: 'active',
                            created_at: new Date().toISOString().split('T')[0]
                          });
                          db.save('newsletter_subscribers', subs);
                          
                          saveNewsletterSubscriberToSupabase(newsletterEmail, '', 'como-funciona')
                            .then(async result => {
                              if (result.success) {
                                try {
                                  await fetch('/api/email/newsletter', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ email: newsletterEmail })
                                  });
                                } catch (err) {
                                  console.error('Failed to notify admin:', err);
                                }
                              }
                            });
                            
                          if (typeof window !== 'undefined') {
                            window.dispatchEvent(new Event('storage'));
                            window.dispatchEvent(new CustomEvent('cheotnun_db_change', { detail: { table: 'newsletter_subscribers' } }));
                          }
                        }
                        setNewsletterSubscribed(true);
                      }
                    }} 
                    className="flex h-12 w-full mb-3"
                  >
                    <input 
                      type="email" 
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder={t(c?.newsletter?.placeholder || 'Tu correo electrónico')} 
                      className="flex-1 bg-transparent border border-white/20 rounded-l-md px-4 text-xs text-white focus:outline-none focus:border-[#C9C9C9] placeholder:text-gray-500"
                    />
                    <button type="submit" className="bg-[#C9C9C9] hover:bg-[#d6b78e] text-[#1c2838] font-bold text-[10px] tracking-widest px-8 rounded-r-md uppercase transition-colors">
                      {t(c?.newsletter?.buttonText || 'SUSCRIBIRME')}
                    </button>
                  </form>
                )}
                <p className="text-[9px] text-white/40 w-full text-left mt-3">
                  {t(c?.newsletter?.disclaimer || 'Prometemos no enviar spam. Solo compartimos lo mejor del K-Beauty.')}
                </p>
              </div>
             </div>
             </div>
          </div>
        </section>

      </main>
      
      <Footer />
    </div>
  );
}

// Extra Lucide Icons used locally
const ClockIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const ArrowDownCircleIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="8 12 12 16 16 12" />
    <line x1="12" y1="8" x2="12" y2="16" />
  </svg>
);
