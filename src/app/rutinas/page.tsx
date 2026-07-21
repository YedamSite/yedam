'use client';

import React from 'react';
import Image from 'next/image';
import { 
  Droplet, 
  Sparkles, 
  Leaf, 
  AlertCircle, 
  Hourglass, 
  LayoutGrid, 
  Sun, 
  Moon,
  ArrowRight,
  Flower,
  ShieldCheck,
  FlaskConical,
  Target,
  Sparkle,
  Atom,
  Mail
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/context/LanguageContext';

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

export default function RutinasPage() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <Header />

      <main className="flex-1 w-full flex flex-col items-center">
        {/* HERO SECTION */}
        <section className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 py-12 lg:py-0 min-h-[calc(100vh-80px)] grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-xl">
            <h1 className="text-6xl md:text-7xl font-heading font-light text-white mb-6">
              {t('Rutinas')}
            </h1>
            <h2 className="text-2xl md:text-3xl text-white mb-6 font-light">
              {t('Cada piel es única, cada rutina también.')}
            </h2>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-10">
              {t('Encuentra la rutina ideal para tu tipo de piel y objetivos. Productos auténticos, combinados de forma inteligente para resultados visibles.')}
            </p>
            <button className="bg-accent hover:bg-white text-background font-bold text-sm tracking-widest px-8 py-4 rounded-md uppercase flex items-center gap-3 transition-colors">
              {t('ENCONTRAR MI RUTINA')} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="relative w-full h-[50vh] md:h-[60vh] lg:h-[75vh] min-h-[400px] max-h-[700px] flex justify-end">
            {/* The arched/circular image style */}
            <div className="relative w-full md:w-4/5 h-full rounded-tl-full rounded-bl-full overflow-hidden border-4 border-white/5 shadow-2xl">
              <Image 
                src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1600" 
                alt="Skincare Routine Products"
                fill
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent opacity-80" />
            </div>
          </div>
        </section>

        {/* ELIGE TU RUTINA IDEAL */}
        <section className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 py-16 border-t border-white/5">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-4">
               <div className="h-[1px] bg-accent/30 flex-1 hidden sm:block"></div>
               <BranchBlossom className="w-8 h-8 text-accent opacity-60" />
               <h3 className="text-3xl font-heading text-white">{t('Elige tu rutina ideal')}</h3>
               <BranchBlossom className="w-8 h-8 text-accent opacity-60 scale-x-[-1]" />
               <div className="h-[1px] bg-accent/30 flex-1 hidden sm:block"></div>
            </div>
            <p className="text-muted-foreground text-sm">{t('Selecciona tu tipo de piel o tu objetivo principal.')}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: Droplet, title: 'Piel Hidratada', desc: 'Para mantener tu piel suave, flexible y duraderamente hidratada.', color: 'text-sky-300', border: 'border-sky-300/30', btn: 'text-sky-300 border-sky-300/30 hover:bg-sky-300 hover:text-black' },
              { icon: Sparkles, title: 'Piel Luminosa', desc: 'Para una piel más radiante, uniforme y llena de vitalidad.', color: 'text-rose-300', border: 'border-rose-300/30', btn: 'text-rose-300 border-rose-300/30 hover:bg-rose-300 hover:text-black' },
              { icon: Leaf, title: 'Piel Sensible', desc: 'Para calmar, proteger y fortalecer tu piel sensible o reactiva.', color: 'text-green-400', border: 'border-green-400/30', btn: 'text-green-400 border-green-400/30 hover:bg-green-400 hover:text-black' },
              { icon: AlertCircle, title: 'Antiacné', desc: 'Para equilibrar el exceso de grasa y reducir imperfecciones.', color: 'text-teal-400', border: 'border-teal-400/30', btn: 'text-teal-400 border-teal-400/30 hover:bg-teal-400 hover:text-black' },
              { icon: Hourglass, title: 'Antiedad', desc: 'Para prevenir y tratar los signos del envejecimiento de la piel.', color: 'text-purple-400', border: 'border-purple-400/30', btn: 'text-purple-400 border-purple-400/30 hover:bg-purple-400 hover:text-black' },
              { icon: LayoutGrid, title: 'Rutina Completa', desc: 'Rutina completa para cuidar tu piel en cada paso del día.', color: 'text-orange-300', border: 'border-orange-300/30', btn: 'text-orange-300 border-orange-300/30 hover:bg-orange-300 hover:text-black' },
            ].map((item, idx) => (
              <div key={idx} className={`flex flex-col items-center text-center border rounded-t-[4rem] rounded-b-xl p-6 pt-10 bg-transparent hover:bg-white/5 transition-all group ${item.border}`}>
                <item.icon className={`w-8 h-8 ${item.color} mb-4 group-hover:scale-110 transition-transform`} strokeWidth={1.5} />
                <h4 className="text-white text-[13px] font-medium mb-3">{t(item.title)}</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed flex-1 mb-6">{t(item.desc)}</p>
                <button className={`text-[9px] border px-4 py-2 rounded-full uppercase tracking-widest font-bold transition-colors w-full mt-auto ${item.btn}`}>
                  {t('VER RUTINA')}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* RUTINAS RECOMENDADAS PARA TI */}
        <section className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 py-16">
          <div className="flex justify-between items-end mb-10">
            <h3 className="text-2xl md:text-3xl font-heading text-white">{t('Rutinas recomendadas para ti')}</h3>
            <button className="text-[10px] font-bold text-accent uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2">
              {t('VER TODAS LAS RUTINAS')} <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { icon: Droplet, title: 'HIDRATADA', desc: 'Hidratación profunda y duradera para una piel saludable y luminosa.', img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600' },
              { icon: Sparkles, title: 'LUMINOSA', desc: 'Ilumina, unifica el tono y revela la luminosidad natural de tu piel.', img: 'https://images.unsplash.com/photo-1608248593802-86a0300a202c?q=80&w=600' },
              { icon: Leaf, title: 'SENSIBLE', desc: 'Calma, protege y fortalece la barrera natural de tu piel.', img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=600' },
              { icon: AlertCircle, title: 'ANTIACNÉ', desc: 'Equilibra el exceso de grasa y ayuda a reducir imperfecciones.', img: 'https://images.unsplash.com/photo-1615397323281-a6cecd55dbf7?q=80&w=600' },
              { icon: Hourglass, title: 'ANTIEDAD', desc: 'Mejora la elasticidad, firmeza y previene los signos del tiempo.', img: 'https://images.unsplash.com/photo-1571781926291-c477ebefa608?q=80&w=600' }
            ].map((card, idx) => (
              <div key={idx} className="flex flex-col bg-[#FDF9F4] text-[#1c2838] border border-transparent rounded-xl overflow-hidden hover:shadow-xl transition-all">
                <div className="p-4 flex items-center gap-2 text-[10px] font-bold tracking-widest text-[#1c2838]/80 border-b border-[#1c2838]/5">
                  <card.icon className="w-4 h-4" strokeWidth={1.5} /> {t(card.title)}
                </div>
                <div className="relative h-48 w-full bg-white">
                  <Image src={card.img} alt={card.title} fill className="object-cover" />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-center gap-6 mb-4 text-[9px] text-[#1c2838]/60 font-bold tracking-widest">
                    <span className="flex items-center gap-1.5"><Sun className="w-3.5 h-3.5 text-[#c5a173]" /> {t('DÍA')}</span>
                    <span className="flex items-center gap-1.5"><Moon className="w-3.5 h-3.5 text-[#1c2838]/60" /> {t('NOCHE')}</span>
                  </div>
                  <p className="text-[11px] text-center text-[#1c2838]/90 leading-relaxed mb-6 flex-1">
                    {t(card.desc)}
                  </p>
                  <button className="w-full py-2.5 text-[9px] uppercase tracking-widest font-bold border border-[#1c2838]/20 rounded-md hover:bg-[#1c2838] hover:text-[#FDF9F4] transition-colors">
                    {t('VER RUTINA COMPLETA')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* LOS PASOS DE TU RUTINA */}
        <section className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 py-16 border-t border-white/5">
          <div className="mb-12">
            <h3 className="text-2xl md:text-3xl font-heading text-white">{t('Los pasos de tu rutina')}</h3>
            <p className="text-muted-foreground text-sm mt-2">{t('Sigue este orden para obtener los mejores resultados.')}</p>
          </div>

          <div className="flex flex-col xl:flex-row gap-12 items-center xl:items-start">
            <div className="flex-1 flex flex-wrap lg:flex-nowrap justify-center lg:justify-between items-start gap-4 lg:gap-2 relative w-full">
              {[
                { num: 1, title: 'LIMPIEZA', desc: 'Elimina impurezas y prepara tu piel', img: 'https://images.unsplash.com/photo-1629367494173-c78a56567877?q=80&w=200' },
                { num: 2, title: 'TÓNICO', desc: 'Equilibra el pH y prepara tu piel', img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=200' },
                { num: 3, title: 'TRATAMIENTO', desc: 'Aplica sérums o esencias según tu necesidad', img: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=200' },
                { num: 4, title: 'CONTORNO DE OJOS', desc: 'Cuida la piel delicada del contorno de ojos', img: 'https://images.unsplash.com/photo-1615397323281-a6cecd55dbf7?q=80&w=200' },
                { num: 5, title: 'HIDRATANTE', desc: 'Hidrata y sella los beneficios anteriores', img: 'https://images.unsplash.com/photo-1571781926291-c477ebefa608?q=80&w=200' },
                { num: 6, title: 'PROTECTOR SOLAR', desc: 'Protege tu piel de los rayos UV todos los dias', img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=200' }
              ].map((step, idx) => (
                <React.Fragment key={step.num}>
                  <div className="flex flex-col items-center text-center w-32 relative z-10">
                    <div className="relative w-20 h-20 rounded-full border-2 border-white/10 mb-4 bg-card flex items-center justify-center p-2">
                       <Image src={step.img} alt={step.title} fill className="rounded-full object-cover p-1" />
                       <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-accent text-background text-xs font-bold flex items-center justify-center shadow-md">
                         {step.num}
                       </div>
                    </div>
                    <h5 className="text-[10px] font-bold text-white mb-2 tracking-wider">{t(step.title)}</h5>
                    <p className="text-[9px] text-muted-foreground leading-snug">{t(step.desc)}</p>
                  </div>
                  {idx < 5 && (
                    <div className="hidden lg:flex items-center text-accent/50 mt-8">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* CONSEJO YEDAM CARD */}
            <div className="w-full xl:w-72 bg-card border border-white/10 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-center shadow-lg">
              <BranchBlossom className="absolute -right-4 -top-4 w-32 h-32 text-accent/20 pointer-events-none" />
              <div className="flex items-center gap-2 mb-4 relative z-10">
                <h4 className="text-[13px] font-bold text-white tracking-wider">{t('Consejo Yedam')}</h4>
                <Flower className="w-4 h-4 text-accent" strokeWidth={1.5} />
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed relative z-10">
                {t('La constancia es la clave. Una rutina diaria, con los productos correctos, puede transformar tu piel.')}
              </p>
            </div>
          </div>
        </section>

        {/* BOTTOM WIDGETS (HELP & NEWSLETTER) */}
        <section className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Necesitas Ayuda */}
            <div className="bg-[#EAE4DC] text-[#1c2838] border border-transparent rounded-2xl overflow-hidden flex flex-col sm:flex-row items-center relative shadow-lg">
               <div className="p-8 sm:w-1/2 z-10 flex flex-col justify-center">
                 <h4 className="text-2xl font-heading mb-3">{t('¿Necesitas ayuda para elegir?')}</h4>
                 <p className="text-[11px] text-[#1c2838]/70 mb-6 leading-relaxed">
                   {t('Nuestro equipo te ayuda a encontrar la rutina perfecta para tu piel.')}
                 </p>
                 <button className="border border-[#1c2838] hover:bg-[#1c2838] hover:text-[#EAE4DC] font-bold text-[9px] tracking-widest px-6 py-3 rounded uppercase flex items-center justify-center gap-2 transition-colors w-fit">
                    {t('HACER MI DIAGNÓSTICO')} <ArrowRight className="w-3 h-3" />
                 </button>
               </div>
               <div className="relative w-full sm:w-1/2 h-48 sm:h-full min-h-[250px]">
                  <Image 
                    src="https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=800"
                    alt="Ayuda"
                    fill
                    className="object-cover"
                  />
               </div>
            </div>

            {/* Newsletter */}
            <div className="bg-card border border-white/10 rounded-2xl p-8 lg:p-10 relative overflow-hidden flex flex-col justify-center shadow-lg">
              <Mail className="absolute right-4 bottom-4 w-32 h-32 text-accent/10 pointer-events-none" strokeWidth={0.5} />
              <BranchBlossom className="absolute -right-4 bottom-0 w-48 h-48 text-accent/30 pointer-events-none" />
              
              <h4 className="text-xl lg:text-2xl font-heading font-light text-white mb-6 relative z-10 max-w-[320px] leading-snug">
                {t('Sé la primera en descubrir nuevas rutinas y promociones exclusivas.')}
              </h4>
              
              <div className="flex relative z-10 h-12 w-full max-w-sm mt-4">
                <input 
                  type="email" 
                  placeholder={t('Tu correo electrónico')} 
                  className="flex-1 bg-white text-[#1c2838] border-none rounded-l-md px-4 text-xs focus:outline-none placeholder:text-gray-400"
                />
                <button className="bg-accent hover:bg-white text-background font-bold text-[10px] tracking-widest px-6 rounded-r-md uppercase transition-colors">
                  {t('SUSCRIBIRME')}
                </button>
              </div>
              <p className="text-[9px] text-muted-foreground mt-3 relative z-10">
                {t('Prometemos no enviar spam. Solo compartimos lo mejor del K-Beauty.')}
              </p>
            </div>

          </div>
        </section>

        {/* FEATURES FOOTER */}
        <section className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 py-10 border-t border-white/5">
          <div className="flex flex-wrap justify-center md:justify-between items-center gap-8">
             <div className="flex items-center gap-3">
               <ShieldCheck className="w-6 h-6 text-accent" strokeWidth={1.5} />
               <span className="text-[10px] text-white/80 uppercase tracking-wider w-24 leading-snug">{t('Ingredientes seguros y efectivos')}</span>
             </div>
             <div className="flex items-center gap-3">
               <FlaskConical className="w-6 h-6 text-accent" strokeWidth={1.5} />
               <span className="text-[10px] text-white/80 uppercase tracking-wider w-24 leading-snug">{t('Fórmulas probadas dermatológicamente')}</span>
             </div>
             <div className="flex items-center gap-3">
               <Target className="w-6 h-6 text-accent" strokeWidth={1.5} />
               <span className="text-[10px] text-white/80 uppercase tracking-wider w-24 leading-snug">{t('Resultados reales y visibles')}</span>
             </div>
             <div className="flex items-center gap-3">
               <Sparkle className="w-6 h-6 text-accent" strokeWidth={1.5} />
               <span className="text-[10px] text-white/80 uppercase tracking-wider w-24 leading-snug">{t('Inspirado en la tradición coreana')}</span>
             </div>
             <div className="flex items-center gap-3">
               <Atom className="w-6 h-6 text-accent" strokeWidth={1.5} />
               <span className="text-[10px] text-white/80 uppercase tracking-wider w-24 leading-snug">{t('Desarrollado con ciencia avanzada')}</span>
             </div>
          </div>
        </section>

      </main>
      
      <Footer />
    </div>
  );
}

