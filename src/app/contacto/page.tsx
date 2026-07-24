'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  MessageCircle, 
  Mail, 
  Clock, 
  MapPin, 
  Lock,
  PackageSearch,
  CreditCard,
  RefreshCw,
  Handshake,
  Info,
  ChevronRight,
  Headset,
  CheckCircle2,
  Send
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/context/LanguageContext';
import { db } from '@/lib/db';
import { useState, useEffect } from 'react';

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

const iconMap: Record<string, any> = { MessageCircle, Mail, Instagram, Clock, MapPin, Info, PackageSearch, CreditCard, RefreshCw, Handshake, Headset, CheckCircle2 };

export default function ContactoPage() {
  const { t, locale } = useLanguage();
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    const siteContent = db.get('site_content');
    const translatedContent = db.getTranslatedRecord(siteContent, locale) || {};
    setContent(translatedContent.contacto || null);
  }, [locale]);

  const c = content || db.get('site_content')?.contacto || {};
  const methods = [
    { icon: 'MessageCircle', title: c?.contactMethods?.whatsapp?.label || 'WhatsApp', desc: c?.contactMethods?.whatsapp?.desc || 'La forma más rápida de hablar con nuestro equipo.', btn: c?.contactMethods?.whatsapp?.btn || 'ESCRIBIR AHORA', link: c?.contactMethods?.whatsapp?.link || '#contacto-form', footer: c?.contactMethods?.whatsapp?.value || '+55 11 98765-4321' },
    { icon: 'Mail', title: c?.contactMethods?.email?.label || 'Correo electrónico', desc: c?.contactMethods?.email?.desc || 'Envíanos un e-mail y te responderemos pronto.', btn: c?.contactMethods?.email?.btn || 'ENVIAR E-MAIL', link: c?.contactMethods?.email?.link || 'mailto:hola@cheotnun.com', footer: c?.contactMethods?.email?.value || 'hola@cheotnun.com' },
    { icon: 'Instagram', title: c?.contactMethods?.instagram?.label || 'Instagram', desc: c?.contactMethods?.instagram?.desc || 'Envíanos un mensaje directo en Instagram.', btn: c?.contactMethods?.instagram?.btn || 'IR AL INSTAGRAM', link: c?.contactMethods?.instagram?.link || 'https://instagram.com/cheotnun.kbeauty', footer: c?.contactMethods?.instagram?.value || '@cheotnun.kbeauty' },
    { icon: 'Clock', title: c?.contactMethods?.hours?.label || 'Horario de atención', desc: c?.contactMethods?.hours?.desc || 'Lunes a viernes 9:00 a 18:00 (GMT-3)', btn: c?.contactMethods?.hours?.btn || 'VER HORARIOS', link: c?.contactMethods?.hours?.link || '#', footer: c?.contactMethods?.hours?.value || 'Excepto feriados' },
    { icon: 'MapPin', title: c?.contactMethods?.address?.label || 'Nuestra dirección', desc: c?.contactMethods?.address?.desc || 'Oficina administrativa', btn: c?.contactMethods?.address?.btn || 'VER EN EL MAPA', link: c?.contactMethods?.address?.link || '#', footer: c?.contactMethods?.address?.value || 'Atención online' }
  ];
  const badges = c?.hero?.badges || [];
  const faqTopics = c?.faq?.topics || [];
  const quickItems = c?.faq?.quickItems || [];
  const communityImages = c?.community?.images || [];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <Header />

      <main className="flex-1 w-full flex flex-col items-center">
        {/* HERO SECTION */}
        <section className="relative w-full max-w-full h-[calc(100vh-80px)] overflow-hidden flex flex-col justify-center">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <Image 
              src={c?.hero?.image || "/images/cheotnun-k-beauty-contato-atendimento.webp"} 
              alt="Contacto"
              fill
              sizes="100vw"
              className="object-cover object-center hidden md:block"
              priority
            />
            <Image 
              src={c?.hero?.imageMobile || "/images/mobile/cheotnun-k-beauty-contato-atendimento.webp"} 
              alt="Contacto Mobile"
              fill
              sizes="100vw"
              className="object-cover object-center md:hidden"
              priority
            />
          </div>

          <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-12 py-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col max-w-xl">
              <h1 className="text-5xl md:text-6xl font-heading font-light text-white mb-6 whitespace-pre-line">
                {t(c?.hero?.title || 'Estamos aquí\npara ti')}
              </h1>
              <p className="text-white/80 text-[13px] leading-relaxed mb-8 max-w-sm">
                {t(c?.hero?.subtitle || '¿Tienes preguntas, necesitas ayuda con tu pedido o quieres más información sobre nuestros productos? Nuestro equipo está listo para ayudarte.')}
              </p>
              <a href="#contacto-form" className="border border-[#C9C9C9] text-[#C9C9C9] hover:bg-[#C9C9C9] hover:text-[#1c2838] font-bold text-[10px] tracking-widest px-8 py-3 rounded-md uppercase transition-colors w-fit flex items-center gap-2 mb-10">
                 <Headset className="w-4 h-4" /> {t(c?.hero?.buttonText || 'RESPUESTA RÁPIDA Y PERSONALIZADA')}
              </a>
              
              {badges.length > 0 && (
                <div className="flex flex-wrap gap-6 text-[10px] text-white/70">
                  {badges.map((badge: any, idx: number) => {
                    const BadgeIcon = iconMap[badge.icon] || Clock;
                    return (
                      <span key={idx} className="flex items-center gap-2"><BadgeIcon className="w-3.5 h-3.5 text-[#C9C9C9]" /> {t(badge.text)}</span>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="hidden lg:block w-full h-full"></div>
          </div>
        </section>

        {/* FORMAS DE CONTACTO */}
        <section className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 mb-16 border-t border-white/5 pt-12">
           <div className="text-center mb-10">
             <div className="flex items-center justify-center gap-4">
                <div className="h-[1px] bg-[#C9C9C9]/30 flex-1 hidden sm:block max-w-[200px]"></div>
                <BranchBlossom className="w-8 h-8 text-[#C9C9C9] opacity-60" />
                <h3 className="text-2xl md:text-3xl font-heading text-white">{t(c?.contactMethods?.title || 'Formas de contacto')}</h3>
                <BranchBlossom className="w-8 h-8 text-[#C9C9C9] opacity-60 scale-x-[-1]" />
                <div className="h-[1px] bg-[#C9C9C9]/30 flex-1 hidden sm:block max-w-[200px]"></div>
             </div>
           </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {methods.map((card: any, idx: number) => {
                 const Icon = iconMap[card.icon] || MessageCircle;
                 return (
                   <div key={idx} className="bg-[#EAE4DC] text-[#1c2838] rounded-2xl p-8 flex flex-col items-center text-center shadow-lg relative overflow-hidden group hover:bg-[#FDF9F4] transition-colors border border-transparent">
                      <div className="w-12 h-12 rounded-full border border-[#1c2838]/20 flex items-center justify-center mb-4">
                         <Icon className="w-5 h-5 stroke-[1.5]" />
                      </div>
                      <h4 className="text-[14px] font-heading mb-2 leading-tight">{t(card.title)}</h4>
                      <p className="text-[10px] text-[#1c2838]/70 leading-relaxed mb-6 flex-1 whitespace-pre-line">{t(card.desc)}</p>
                      <a href={card.link} className="bg-[#d6b78e] hover:bg-[#1c2838] hover:text-[#FDF9F4] text-[#1c2838] font-bold text-[9px] px-6 py-2 rounded-md uppercase tracking-widest transition-colors mb-3 w-full border border-[#d6b78e] group-hover:border-[#1c2838]">
                        {t(card.btn)}
                      </a>
                      <span className="text-[9px] text-[#1c2838]/60 font-medium">{t(card.footer)}</span>
                   </div>
                 );
              })}
            </div>
        </section>

        {/* ENVIANOS UN MENSAJE & EN QUE PODEMOS AYUDARTE */}
        <section id="contacto-form" className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 mb-16">
           <div className="bg-[#FDF9F4] text-[#1c2838] rounded-3xl p-8 lg:p-12 shadow-lg grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 relative overflow-hidden">
              <div className="flex flex-col relative z-10">
                 <div className="flex items-center gap-3 mb-6">
                    <Mail className="w-5 h-5 text-[#C9C9C9] stroke-[1.5]" />
                    <h3 className="text-2xl font-heading">{t(c?.form?.title || 'Envíanos un mensaje')}</h3>
                 </div>
                 
                 <form className="flex flex-col gap-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                       <div className="flex flex-col">
                          <label className="text-[9px] font-bold uppercase tracking-widest mb-1">{t(c?.form?.nameLabel || 'Nombre completo')}</label>
                          <input type="text" className="bg-transparent border-b border-[#1c2838]/20 py-2 focus:outline-none focus:border-[#C9C9C9] text-sm" />
                       </div>
                       <div className="flex flex-col">
                          <label className="text-[9px] font-bold uppercase tracking-widest mb-1">{t(c?.form?.emailLabel || 'E-mail')}</label>
                          <input type="email" className="bg-transparent border-b border-[#1c2838]/20 py-2 focus:outline-none focus:border-[#C9C9C9] text-sm" />
                       </div>
                    </div>
                    <div className="flex flex-col">
                       <label className="text-[9px] font-bold uppercase tracking-widest mb-1">{t(c?.form?.subjectLabel || 'Asunto')}</label>
                       <select className="bg-transparent border-b border-[#1c2838]/20 py-2 focus:outline-none focus:border-[#C9C9C9] text-sm text-[#1c2838]/70 appearance-none">
                         {(c?.form?.subjectOptions || ['Selecciona un asunto', 'Dudas sobre productos', 'Estado de mi pedido', 'Devoluciones', 'Otros']).map((opt: string, idx: number) => (
                           <option key={idx}>{t(opt)}</option>
                         ))}
                       </select>
                    </div>
                    <div className="flex flex-col flex-1 min-h-[100px]">
                       <label className="text-[9px] font-bold uppercase tracking-widest mb-1">{t(c?.form?.messageLabel || 'Tu mensaje')}</label>
                       <textarea required className="bg-transparent border-b border-[#1c2838]/20 py-2 focus:outline-none focus:border-[#C9C9C9] text-sm h-full resize-none"></textarea>
                    </div>
                    
                    <button type="submit" onClick={(e) => { e.preventDefault(); alert(t(c?.form?.successAlert || '¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.')); }} className="bg-[#C9C9C9] hover:bg-[#1c2838] hover:text-[#FDF9F4] text-[#1c2838] font-bold text-[10px] tracking-widest py-4 rounded-md uppercase transition-colors flex justify-center items-center gap-2 mt-4">
                      {t(c?.form?.submitText || 'ENVIAR MENSAJE')} <Send className="w-3.5 h-3.5" />
                    </button>
                    
                    <div className="flex items-center justify-center gap-1.5 mt-2">
                       <Lock className="w-3 h-3 text-[#1c2838]/50" />
                       <span className="text-[9px] text-[#1c2838]/50">{t(c?.form?.securityNotice || 'Tu información está segura con nosotros y no será compartida.')}</span>
                    </div>
                 </form>
              </div>

              <div className="flex flex-col relative z-10 border-l border-[#1c2838]/10 pl-0 lg:pl-12 pt-8 lg:pt-0 mt-8 lg:mt-0">
                 <h3 className="text-2xl font-heading mb-6">{t(c?.faq?.title || '¿En qué podemos ayudarte?')}</h3>
                 
                 <div className="flex flex-col gap-6">
                    {faqTopics.map((topic: any, idx: number) => {
                       const TopicIcon = iconMap[topic.icon] || Info;
                       return (
                         <div key={idx} className="flex items-start gap-4 group cursor-pointer">
                            <div className="w-10 h-10 rounded-full border border-[#1c2838]/20 flex items-center justify-center shrink-0 bg-white">
                              <TopicIcon className="w-4 h-4 stroke-[1.5] text-[#1c2838] group-hover:text-[#C9C9C9] transition-colors" />
                            </div>
                            <div className="flex-1">
                               <h4 className="text-[13px] font-bold text-[#1c2838] mb-0.5 group-hover:text-[#C9C9C9] transition-colors">{t(topic.title)}</h4>
                               <p className="text-[10px] text-[#1c2838]/60 leading-relaxed">{t(topic.desc)}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-[#1c2838]/20 mt-1 group-hover:text-[#C9C9C9] transition-colors" />
                         </div>
                       );
                    })}
                 </div>
                 
                 <BranchBlossom className="absolute -right-4 -bottom-4 w-40 h-40 text-[#C9C9C9]/20 pointer-events-none hidden lg:block" />
              </div>
           </div>
        </section>

        {/* PREGUNTAS FRECUENTES RAPIDAS */}
        {quickItems.length > 0 && (
          <section className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 mb-16 border-t border-white/5 pt-12">
             <div className="text-left mb-8 flex flex-col md:flex-row justify-between md:items-end border-b border-white/10 pb-4">
               <div className="flex items-center gap-4">
                  <h3 className="text-2xl font-heading text-white">{t(c?.faq?.subtitle || 'Preguntas frecuentes rápidas')}</h3>
                  <BranchBlossom className="w-6 h-6 text-[#C9C9C9] opacity-60" />
               </div>
               <Link href="/ayuda/preguntas-frecuentes" className="bg-[#1c2838] hover:bg-white text-white hover:text-black font-bold text-[9px] tracking-widest px-6 py-2.5 rounded-md uppercase transition-colors border border-white/10 mt-4 md:mt-0">
                 {t(c?.faq?.buttonText || 'VER TODAS LAS PREGUNTAS FRECUENTES')}
               </Link>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                {quickItems.map((q: string, idx: number) => (
                   <div key={idx} className="bg-white/5 border border-white/10 rounded-lg px-6 py-4 flex items-center justify-between cursor-pointer group hover:bg-white/10 transition-colors">
                      <span className="text-[11px] text-white/90 group-hover:text-white font-medium">{t(q)}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#C9C9C9]/50 group-hover:text-[#C9C9C9] transition-colors" />
                   </div>
                ))}
             </div>
          </section>
        )}

        {/* UNETE A NUESTRA COMUNIDAD (INSTAGRAM) */}
        <section className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 mb-16">
           <div className="bg-[#EAE4DC] rounded-3xl p-8 lg:p-10 flex flex-col xl:flex-row gap-8 items-center xl:items-center shadow-lg">
              <div className="flex-1 max-w-sm text-center xl:text-left text-[#1c2838]">
                 <div className="flex items-center justify-center xl:justify-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full border border-[#1c2838]/20 flex items-center justify-center">
                       <Instagram className="w-5 h-5 text-[#C9C9C9]" />
                    </div>
                    <h3 className="text-2xl font-heading font-light">{t(c?.community?.title || 'Únete a nuestra comunidad')}</h3>
                 </div>
                 <p className="text-[11px] text-[#1c2838]/70 leading-relaxed mb-6">
                   {t(c?.community?.desc || 'Síguenos en nuestras redes sociales y sé la primera en descubrir lanzamientos, promociones y consejos de belleza.')}
                 </p>
                 <a href={c?.community?.buttonLink || 'https://instagram.com/cheotnun.kbeauty'} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-[#1c2838] hover:bg-[#1c2838] hover:text-[#FDF9F4] text-[#1c2838] font-bold text-[9px] tracking-widest px-6 py-3 rounded-md uppercase transition-all">
                    <Instagram className="w-3.5 h-3.5" /> {t(c?.community?.buttonText || 'SEGUIR EN INSTAGRAM')}
                 </a>
              </div>

              {communityImages.length > 0 && (
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                  {communityImages.map((img: string, idx: number) => (
                     <a key={idx} href={c?.community?.buttonLink || 'https://instagram.com/cheotnun.kbeauty'} target="_blank" rel="noreferrer" className="relative h-32 md:h-40 rounded-xl overflow-hidden group">
                        <Image src={img} alt="Instagram" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <Instagram className="w-5 h-5 text-white" />
                        </div>
                        <div className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-white/40 backdrop-blur-md flex items-center justify-center">
                           <Instagram className="w-2.5 h-2.5 text-black" />
                        </div>
                     </a>
                  ))}
                </div>
              )}
           </div>
        </section>

      </main>
      
      <Footer />
    </div>
  );
}
