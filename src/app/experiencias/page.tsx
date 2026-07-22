'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowRight, 
  Plane, 
  MapPin, 
  Star, 
  Camera, 
  Award,
  Flower,
  FlaskConical,
  CheckCircle2,
  Gift,
  Fan,
  Coffee,
  Mail
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/context/LanguageContext';
import { db } from '@/lib/db';
import { useState, useEffect } from 'react';

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

export default function ExperienciasPage() {
  const { t, locale } = useLanguage();
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    const siteContent = db.get('site_content');
    const translatedContent = db.getTranslatedRecord(siteContent, locale) || {};
    setContent(translatedContent.experienciasPage || null);
  }, [locale]);

  const c = content || db.get('site_content')?.experienciasPage || {};

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <Header />

      <main className="flex-1 w-full flex flex-col items-center">
        {/* HERO SECTION */}
        <section className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 py-12 lg:py-0 min-h-[calc(100vh-80px)] grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-xl relative">
            <h1 className="text-5xl md:text-6xl font-heading font-light text-white mb-4">
              {t(c?.hero?.title || 'Experiencias Yedam')}
            </h1>
            <h2 className="text-xl md:text-2xl text-accent mb-6 font-light">
              {t(c?.hero?.subtitle || 'Mucho más que productos, vivencias que transforman.')}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-10 max-w-sm">
              {t(c?.hero?.buttonText || 'Conecta con la cultura coreana, descubre nuevos rituales de belleza y vive momentos únicos que te inspirarán.')}
            </p>
            {/* Floral graphic */}
            <div className="mt-8 -ml-8">
               <BranchBlossom className="w-48 h-48 text-accent/40" />
            </div>
          </div>
          
          <div className="relative w-full h-[50vh] md:h-[60vh] lg:h-[75vh] min-h-[400px] max-h-[700px] flex justify-end">
            <div className="relative w-full md:w-[85%] h-full rounded-tl-[10rem] rounded-bl-3xl overflow-hidden border-2 border-white/10 shadow-2xl">
              <Image 
                src={c?.hero?.image || "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1600"} 
                alt="Experiencias Yedam"
                fill
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent opacity-80" />
            </div>
          </div>
        </section>

        {/* DESCUBRE NUESTRAS EXPERIENCIAS */}
        <section className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 py-16 border-t border-white/5">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-4">
               <div className="h-[1px] bg-accent/30 flex-1 hidden sm:block"></div>
               <BranchBlossom className="w-8 h-8 text-accent opacity-60" />
               <h3 className="text-2xl md:text-3xl font-heading text-white">{t('Descubre nuestras experiencias')}</h3>
               <BranchBlossom className="w-8 h-8 text-accent opacity-60 scale-x-[-1]" />
               <div className="h-[1px] bg-accent/30 flex-1 hidden sm:block"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { 
                icon: FlaskConical, title: 'Beauty Experience', 
                desc: 'Descubre, prueba y aprende sobre los mejores productos coreanos con asesoramiento personalizado.',
                img: 'https://images.unsplash.com/photo-1615397323281-a6cecd55dbf7?q=80&w=400' 
              },
              { 
                icon: Award, title: 'Talleres y Clases', 
                desc: 'Participa en talleres exclusivos sobre skincare, maquillaje y rutinas coreanas con expertos.',
                img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=400' 
              },
              { 
                icon: Gift, title: 'Unboxings Especiales', 
                desc: 'Recibe cajas exclusivas con productos seleccionados y sorpresas inspiradas en Corea.',
                img: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?q=80&w=400' 
              },
              { 
                icon: Fan, title: 'Cultura & Belleza', 
                desc: 'Sumérgete en la cultura coreana y descubre la historia y filosofía detrás de cada ritual de belleza.',
                img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=400' 
              },
              { 
                icon: Coffee, title: 'Experiencias Locales', 
                desc: 'Recomendaciones exclusivas de lugares, cafés, tiendas y espacios de belleza en Corea.',
                img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=400' 
              }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col bg-[#FDF9F4] text-[#1c2838] rounded-xl overflow-hidden shadow-lg border border-transparent">
                <div className="relative h-36 w-full">
                  <Image src={item.img} alt={item.title} fill className="object-cover" />
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-[#1c2838] text-[#FDF9F4] rounded-full flex items-center justify-center border-4 border-[#FDF9F4]">
                     <item.icon className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                </div>
                <div className="p-6 pt-10 flex flex-col flex-1 text-center items-center">
                  <h4 className="font-heading font-medium text-sm mb-3">{t(item.title)}</h4>
                  <p className="text-[10px] text-gray-600 leading-relaxed mb-6 flex-1">{t(item.desc)}</p>
                  <Link href="/tienda" className="text-[10px] font-bold border border-[#1c2838]/20 px-6 py-2 rounded-full uppercase tracking-wider hover:bg-[#1c2838] hover:text-[#FDF9F4] transition-colors flex items-center gap-2">
                    {t('VER MÁS')} <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* MAEUM GLOBAL */}
        <section className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 py-16">
          <div className="border border-white/10 rounded-3xl p-8 md:p-12 grid grid-cols-1 lg:grid-cols-[1.5fr_3fr] gap-12 bg-card">
            {/* Left Info */}
            <div className="flex flex-col justify-center">
              <span className="text-xs text-accent mb-1">{t('En colaboración con')}</span>
              <div className="flex items-center gap-3 mb-4">
                 <h3 className="font-heading text-3xl md:text-4xl text-white tracking-wide">{t('MAEUM GLOBAL')}</h3>
                 <Plane className="w-6 h-6 text-accent opacity-80 -rotate-45" strokeWidth={1.5} />
              </div>
              <h4 className="text-xl text-white font-light mb-4">{t('Viajes que transforman.')}</h4>
              <p className="text-[11px] text-muted-foreground mb-8 leading-relaxed max-w-[280px]">
                {t('Maeum Global te lleva a Corea para vivir experiencias únicas de belleza, cultura y bienestar.')}
              </p>
              
              <ul className="flex flex-col gap-4 mb-10">
                 {[
                   'Rutas exclusivas de K-Beauty',
                   'Visitas a tiendas y marcas coreanas',
                   'Talleres y experiencias inmersivas',
                   'Acompañamiento en todo el viaje'
                 ].map((li, i) => (
                   <li key={i} className="flex items-center gap-3 text-xs text-white/90">
                      <CheckCircle2 className="w-4 h-4 text-accent shrink-0" strokeWidth={1.5} />
                      {t(li)}
                   </li>
                 ))}
              </ul>
              <a href="https://www.maeumglobal.com.br" target="_blank" rel="noopener noreferrer" className="bg-accent hover:bg-white text-background font-bold text-[10px] tracking-widest px-8 py-3.5 rounded uppercase flex items-center gap-3 transition-colors w-fit">
                 {t('EXPLORAR VIAJES')} <ArrowRight className="w-3 h-3" />
              </a>
            </div>
            
            {/* Right Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {[
                 { 
                   title: 'Rutas de Belleza', 
                   desc: 'Recorre los mejores barrios de Seúl y descubre tiendas, clínicas y spas icónicos.', 
                   img: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?q=80&w=400',
                   icon: MapPin 
                 },
                 { 
                   title: 'Experiencias Exclusivas', 
                   desc: 'Accede a experiencias únicas con marcas, talleres privados y eventos especiales.', 
                   img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=400',
                   icon: Award 
                 },
                 { 
                   title: 'Cultura y Conexión', 
                   desc: 'Vive la cultura coreana, conoce su historia y conecta con personas que comparten tu pasión.', 
                   img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=400',
                   icon: Camera 
                 }
               ].map((card, idx) => (
                 <div key={idx} className="bg-[#FDF9F4] text-[#1c2838] rounded-xl overflow-hidden shadow-lg flex flex-col relative">
                    <div className="relative h-56 w-full">
                      <Image src={card.img} alt={card.title} fill className="object-cover" />
                      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-[#FDF9F4] text-[#1c2838] rounded-full flex items-center justify-center shadow-md">
                         <card.icon className="w-5 h-5" strokeWidth={1.5} />
                      </div>
                    </div>
                    <div className="px-6 pt-10 pb-6 text-center flex flex-col flex-1">
                      <h4 className="font-heading font-medium text-[13px] mb-3">{t(card.title)}</h4>
                      <p className="text-[10px] text-gray-600 leading-relaxed flex-1">{t(card.desc)}</p>
                    </div>
                 </div>
               ))}
            </div>
            
          </div>
          {/* Slider Dots */}
          <div className="flex justify-center gap-2 mt-8">
             <div className="w-1.5 h-1.5 rounded-full bg-accent/30"></div>
             <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
             <div className="w-1.5 h-1.5 rounded-full bg-accent/30"></div>
             <div className="w-1.5 h-1.5 rounded-full bg-accent/30"></div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 py-16">
           <div className="bg-[#EAE4DC] text-[#1c2838] rounded-3xl p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-[1.5fr_3fr] gap-12 items-center">
              
              <div className="flex flex-col h-full">
                 <h3 className="font-heading text-3xl font-light mb-6 leading-snug max-w-[200px]">
                   {t('Lo que dicen nuestras viajeras')}
                 </h3>
                 <div className="flex-1 my-4">
                   <BranchBlossom className="w-32 h-32 text-[#1c2838]/20" />
                 </div>
                 <Link href="/contacto" className="border border-[#1c2838] text-[10px] font-bold uppercase tracking-widest px-6 py-2.5 rounded hover:bg-[#1c2838] hover:text-[#EAE4DC] transition-colors w-fit inline-block">
                    {t('VER MÁS TESTIMONIOS')}
                 </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                 {[
                   {
                     quote: '"Fue un viaje increíble, cada detalle estuvo pensado para que viviéramos lo mejor de Corea y su belleza. ¡Totalmente transformador!"',
                     name: 'Camila R.',
                     country: 'México',
                     img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150'
                   },
                   {
                     quote: '"Las experiencias de skincare y los talleres fueron lo que más disfruté. Me llevo mucho aprendizaje y recuerdos inolvidables."',
                     name: 'Daniela P.',
                     country: 'Colombia',
                     img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=150'
                   },
                   {
                     quote: '"Maeum Global y Yedam hicieron que mi sueño de conocer Corea se volviera realidad. ¡Quiero volver pronto!"',
                     name: 'Valeria S.',
                     country: 'Argentina',
                     img: 'https://images.unsplash.com/photo-1558222218-b7b54eede3f3?q=80&w=150'
                   }
                 ].map((test, idx) => (
                   <div key={idx} className="bg-[#FDF9F4] rounded-2xl p-6 shadow-sm flex flex-col justify-between border border-[#1c2838]/5">
                     <div>
                       <div className="flex gap-1 mb-4">
                         {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-[#c5a173] text-[#c5a173]" />)}
                       </div>
                       <p className="text-[10px] text-gray-700 leading-relaxed mb-6 italic">{t(test.quote)}</p>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden relative shrink-0 border border-[#1c2838]/10">
                           <Image src={test.img} alt={test.name} fill className="object-cover" />
                        </div>
                        <div>
                           <h5 className="text-[11px] font-bold">{test.name}</h5>
                           <span className="text-[9px] text-gray-500">{t(test.country)}</span>
                        </div>
                     </div>
                   </div>
                 ))}
              </div>

           </div>
        </section>

        {/* NEWSLETTER */}
        <section className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 pt-8 pb-20">
          <div className="bg-transparent border-t border-b border-white/10 py-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
             
             <div className="flex items-center gap-6 z-10">
               <div className="p-3 border border-white/20 rounded-md">
                 <Mail className="w-6 h-6 text-accent" strokeWidth={1} />
               </div>
               <div>
                 <h4 className="text-xl md:text-2xl font-heading text-white font-light">
                   {t('Sé la primera en enterarte')} <br/> {t('de nuevas experiencias y viajes exclusivos.')}
                 </h4>
               </div>
             </div>

             <div className="w-full max-w-md z-10 flex flex-col items-end">
               <div className="flex h-12 w-full mb-3 bg-white/5 border border-white/20 rounded-md">
                  <input type="email" placeholder="tu@email.com" className="flex-1 bg-transparent px-4 py-2 text-[11px] text-white placeholder:text-gray-400 outline-none" />
                  <button type="submit" className="bg-accent hover:bg-white text-background font-bold text-[10px] tracking-widest px-8 rounded-r-md uppercase transition-colors h-full">
                    {t('SUSCRIBIRME')}
                  </button>
               </div>
               <p className="text-[9px] text-muted-foreground w-full text-left">
                  {t('Prometemos no enviar spam. Solo compartimos lo mejor del K-Beauty.')}
               </p>
             </div>
             
             {/* Decorative Flowers */}
             <BranchBlossom className="absolute right-[25%] -bottom-10 w-48 h-48 text-accent/20" />
          </div>
        </section>

      </main>
      
      <Footer />
    </div>
  );
}
