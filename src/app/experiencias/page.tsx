'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Check, ArrowRight, Play, Star, Calendar, MapPin,
  ShieldCheck, HelpCircle, ChevronDown, Award, Compass, Heart
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { db } from '@/lib/db';
import { saveNewsletterSubscriberToSupabase } from '@/lib/newsletterService';
import { useLanguage } from '@/context/LanguageContext';

const EXPERIENCES = [
  {
    id: 'exp-1',
    title: 'Hanbang Skincare Workshop',
    desc: 'Taller presencial exclusivo de 3 horas sobre medicina tradicional coreana aplicada al cuidado facial.',
    location: 'Madrid, Barcelona & Seúl',
    duration: '3 Horas',
    price: 'US$ 150.00',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800',
    highlights: ['Análisis personalizado de piel', 'Creación de tónico a medida', 'Técnicas de masaje facial coreano']
  },
  {
    id: 'exp-2',
    title: 'K-Beauty Personal Shopper Tour',
    desc: 'Recorrido exclusivo con asesores expertos por las mejores boutiques de cosmética en Seúl (Myeongdong y Hongdae).',
    location: 'Seúl, Corea del Sur',
    duration: '1 Día completo',
    price: 'US$ 350.00',
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=800',
    highlights: ['Guía hispanohablante experta', 'Descuentos exclusivos en tiendas', 'Recomendaciones según tipo de piel']
  },
  {
    id: 'exp-3',
    title: 'K-Beauty & Wellness Retreat',
    desc: 'Un retiro de 7 días que fusiona la cosmética premium, la gastronomía Hanjeongsik y visitas a spas de lujo coreanos.',
    location: 'Seúl y Jeju',
    duration: '7 Días',
    price: 'US$ 2,900.00',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?q=80&w=800',
    highlights: ['Hospedagem 5 estrelas', 'Tratamientos en Sulwhasoo Spa', 'Alimentación antiedad certificada']
  }
];

const BENEFICIOS = [
  { title: 'Certificación Premium', desc: 'Acceso a marcas certificadas y productos seleccionados por dermatólogos en Corea.', icon: Award },
  { title: 'Inmersión Cultural', desc: 'No es solo cuidado de la piel, es entender el estilo de vida, hábitos y bienestar coreano.', icon: Compass },
  { title: 'Asesoría de por vida', desc: 'Seguimiento personalizado de tu rutina por nuestras consultoras tras cada experiencia.', icon: Heart }
];

const PASOS = [
  { step: '01', title: 'Selecciona tu Experiencia', desc: 'Explora nuestro catálogo y elige el taller o tour que se adapte a tus metas de skincare.' },
  { step: '02', title: 'Reserva & Cuestionario', desc: 'Realiza el pago seguro en línea y completa un cuestionario rápido sobre tu rutina actual.' },
  { step: '03', title: 'Asesoría Individual', desc: 'Coordinamos una sesión previa en línea para personalizar los materiales e itinerarios.' },
  { step: '04', title: 'Vive la Experiencia', desc: 'Disfruta del workshop, tour o retiro con el sello exclusivo y premium de Cheotnun.' }
];

const FAQ = [
  { q: '¿Necesito conocimientos previos para los workshops?', a: 'No, nuestros talleres están diseñados tanto para principiantes como para entusiastas avanzados del skincare.' },
  { q: '¿Los tours en Seúl incluyen la traducción?', a: 'Sí, todas nuestras experiencias internacionales cuentan con guías expertas de habla hispana.' },
  { q: '¿Cómo se integra con Maeum Global?', a: 'Cheotnun K-Beauty organiza los talleres y experiencias cosméticas, mientras que Maeum Global (nuestra agencia hermana) se encarga de los vuelos de lujo, visados y traslados si reservas un retiro internacional.' }
];

export default function ExperienciasPage() {
  const { t } = useLanguage();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1">
        {/* HERO BANNER */}
        <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden bg-black">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1920"
              alt="Cheotnun Experiences Banner"
              fill
              className="object-cover object-center filter brightness-[0.35]"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/30" />
          </div>

          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center gap-6">
            <span className="text-[10px] uppercase font-bold tracking-widest text-accent border border-accent/40 bg-accent/10 px-4 py-1.5 rounded-full">
              {t('Experiencias Exclusivas K-Beauty')}
            </span>
            <h1 className="font-heading text-4xl sm:text-6xl font-light text-white uppercase tracking-wide leading-tight">
              {t('CHEOTNUN EXPERIENCES')}
            </h1>
            <p className="text-sm sm:text-base text-gray-300 max-w-2xl font-light leading-relaxed">
              {t('Descubre el verdadero arte del skincare coreano a través de talleres presenciales, recorridos de compra personalizados y retiros de bienestar de lujo.')}
            </p>
            <a href="#catalogo">
              <Button className="bg-accent hover:bg-accentHover text-background font-bold px-8 py-6 rounded-full text-xs transition-transform hover:scale-105">
                {t('EXPLORAR EL CATÁLOGO')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
        </section>

        {/* INTRODUCCION CHEOTNUN EXPERIENCES */}
        <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-accent tracking-widest">{t('Inmersión y Bienestar')}</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-light text-white uppercase mt-2">
              {t('Más allá del Producto:')}<br />{t('Una Filosofía de Cuidado')}
            </h2>
            <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
              {t('En Cheotnun K-Beauty creemos que el cuidado de la piel no se limita a aplicar cremas. Es un ritual holístico que conecta la salud, la naturaleza y la ciencia coreana. Nuestras experiencias están diseñadas para guiarte en el proceso de entender las necesidades biológicas de tu rostro mientras experimentas la cultura estética coreana.')}
            </p>
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              {t('A través de nuestra alianza con la agencia boutique')} <strong className="text-accent">Maeum Global</strong>, {t('elevamos cada experiencia internacional a un nivel sin precedentes de sofisticación y comodidad logística.')}
            </p>
          </div>

          <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 group shadow-2xl bg-zinc-900 flex items-center justify-center">
            {isVideoPlaying ? (
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="Cheotnun Experience Video"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : (
              <>
                <Image
                  src="https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?q=80&w=800"
                  alt="Video thumbnail"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500 brightness-50"
                />
                <button
                  onClick={() => setIsVideoPlaying(true)}
                  className="absolute p-5 bg-accent/90 hover:bg-accent text-background rounded-full shadow-2xl transition-transform hover:scale-110 flex items-center justify-center cursor-pointer z-10"
                >
                  <Play className="h-6 w-6 fill-background ml-1" />
                </button>
                <span className="absolute bottom-4 left-4 text-[10px] font-bold text-white uppercase bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                  {t('VER VÍDEO INSTITUCIONAL')} • 2:15 Min
                </span>
              </>
            )}
          </div>
        </section>

        {/* CARDS EXPERIENCIAS (CATALOGO) */}
        <section id="catalogo" className="py-20 bg-secondary/30 border-y border-white/5">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-[10px] uppercase font-bold text-accent tracking-widest">{t('Nuestras Propuestas')}</span>
              <h2 className="font-heading text-3xl font-light text-white uppercase mt-2">{t('Programas de Inmersión Seleccionados')}</h2>
              <p className="text-xs text-muted-foreground mt-3">
                {t('Reserva tu plaza en nuestros exclusivos programas presenciales y recorridos premium en Asia.')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {EXPERIENCES.map((exp) => (
                <div key={exp.id} className="bg-card border border-white/5 rounded-3xl overflow-hidden flex flex-col justify-between hover:shadow-2xl hover:border-white/10 transition-all group">
                  <div>
                    <div className="relative aspect-[16/10] w-full overflow-hidden">
                      <Image src={exp.image} alt={t(exp.title)} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      <span className="absolute top-4 left-4 bg-accent text-background text-[9px] font-bold tracking-widest px-2.5 py-1 rounded-full uppercase">
                        {t(exp.duration)}
                      </span>
                    </div>

                    <div className="p-6">
                      <span className="text-[9px] font-bold text-accent uppercase tracking-widest flex items-center gap-1.5">
                        <MapPin className="h-3 w-3" />
                        {t(exp.location)}
                      </span>
                      <h3 className="font-heading text-xl font-medium text-white mt-2 group-hover:text-accent transition-colors leading-snug">
                        {t(exp.title)}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                        {t(exp.desc)}
                      </p>

                      <ul className="mt-5 flex flex-col gap-2 border-t border-white/5 pt-4">
                        {exp.highlights.map((h, i) => (
                          <li key={i} className="flex items-center gap-2 text-[10px] text-gray-300">
                            <Check className="h-3.5 w-3.5 text-accent shrink-0" />
                            <span>{t(h)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-6 pt-0 flex justify-between items-center border-t border-white/5 mt-4">
                    <div>
                      <span className="text-[9px] uppercase text-muted-foreground block font-semibold">{t('Inversión')}</span>
                      <span className="text-sm font-bold text-accent font-heading">{exp.price}</span>
                    </div>
                    <Button onClick={() => alert(`${t('Reservando')} ${exp.title}`)} className="bg-accent hover:bg-accentHover text-background font-bold text-[10px] py-1.5 h-8 px-4 rounded-xl">
                      {t('RESERVAR PLAZA')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BENEFICIOS */}
        <section className="py-20 max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[10px] uppercase font-bold text-accent tracking-widest">{t('¿Por qué elegirnos?')}</span>
            <h2 className="font-heading text-3xl font-light text-white uppercase mt-2">{t('Beneficios de la Inmersión Cheotnun')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {BENEFICIOS.map((ben, idx) => {
              const Icon = ben.icon;
              return (
                <div key={idx} className="bg-card border border-white/5 rounded-3xl p-8 flex flex-col items-center gap-4 hover:border-white/10 transition-all">
                  <span className="p-4 bg-accent/10 rounded-2xl text-accent">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h4 className="font-heading text-lg font-bold text-white uppercase tracking-wider">{t(ben.title)}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t(ben.desc)}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* PROCESO DE PARTICIPACION */}
        <section className="py-20 bg-secondary/20 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-[10px] uppercase font-bold text-accent tracking-widest">{t('Paso a Paso')}</span>
              <h2 className="font-heading text-3xl font-light text-white uppercase mt-2">{t('Cómo participar del programa')}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {PASOS.map((paso, idx) => (
                <div key={idx} className="relative flex flex-col gap-4 text-xs text-muted-foreground bg-card border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all">
                  <span className="font-heading text-4xl font-light text-accent/30">{paso.step}</span>
                  <h4 className="font-bold text-white uppercase tracking-wider">{t(paso.title)}</h4>
                  <p className="leading-relaxed text-[11px]">{t(paso.desc)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* INTEGRACION MAEUM GLOBAL */}
        <section className="py-20 max-w-7xl mx-auto px-4 md:px-8">
          <div className="border border-accent/25 rounded-3xl p-8 md:p-12 bg-gradient-to-r from-accent/5 via-transparent to-accent/5 flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl">
            <div className="flex flex-col gap-3">
              <span className="text-[10px] uppercase font-bold text-accent tracking-widest">{t('Alianza Estratégica')}</span>
              <h3 className="font-heading text-2xl md:text-3xl font-light text-white uppercase leading-snug">
                {t('¿Deseas combinarlo con un viaje completo?')}
              </h3>
              <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
                {t('Nuestros retiros y tours de compras se coordinan en conjunto con Maeum Global Agency. Ellos proveerán vuelos premium, visados de estudios, reservas en los mejores hoteles de Seúl y traslados privados.')}
              </p>
            </div>
            <Link href="https://maeumglobal.com" target="_blank" className="shrink-0">
              <Button className="bg-accent hover:bg-accentHover text-background font-bold px-8 py-6 rounded-full text-xs">
                {t('EXPLORAR VIAJES')} MAEUM
                <Compass className="ml-2 h-4 w-4 animate-spin-slow" />
              </Button>
            </Link>
          </div>
        </section>

        {/* DEPOIMENTOS */}
        <section className="py-20 bg-secondary/10 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-[10px] uppercase font-bold text-accent tracking-widest">{t('Testimonios Reales')}</span>
              <h2 className="font-heading text-3xl font-light text-white uppercase mt-2">{t('La opinión de nuestras clientas')}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-card border border-white/5 rounded-3xl p-8 flex flex-col gap-4">
                <div className="flex items-center gap-1 text-accent">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-accent" />)}
                </div>
                <p className="text-xs text-gray-300 italic leading-relaxed">
                  {t('"El taller de Hanbang Skincare en Madrid superó todas mis expectativas. No solo aprendí a identificar los ingredientes que mi piel mixta necesitaba, sino que pude formular mi propio tónico personalizado que hoy es el pilar de mi rutina."')}
                </p>
                <div className="flex items-center gap-3 border-t border-white/5 pt-4 mt-2">
                  <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center font-bold text-accent text-xs">
                    LM
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Laura Méndez</h5>
                    <span className="text-[10px] text-muted-foreground">{t('Madrid, España')}</span>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-white/5 rounded-3xl p-8 flex flex-col gap-4">
                <div className="flex items-center gap-1 text-accent">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-accent" />)}
                </div>
                <p className="text-xs text-gray-300 italic leading-relaxed">
                  {t('"El tour de compras K-Beauty en Seúl fue simplemente espectacular. Ir acompañada de una consultora experta hispanohablante me ahorró mucho dinero y tiempo, logrando comprar exactamente lo que mi rostro necesitaba en las mejores boutiques de Myeongdong."')}
                </p>
                <div className="flex items-center gap-3 border-t border-white/5 pt-4 mt-2">
                  <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center font-bold text-accent text-xs">
                    SB
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Sofía Benítez</h5>
                    <span className="text-[10px] text-muted-foreground">{t('Santiago, Chile')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ ACCORDION */}
        <section className="py-20 max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-[10px] uppercase font-bold text-accent tracking-widest flex items-center justify-center gap-1.5">
              <HelpCircle className="h-4 w-4" /> {t('Preguntas Frecuentes')}
            </span>
            <h2 className="font-heading text-3xl font-light text-white uppercase mt-2">{t('Resolver Dudas Rápidas')}</h2>
          </div>

          <div className="flex flex-col gap-4">
            {FAQ.map((faq, idx) => (
              <div key={idx} className="border border-white/5 rounded-2xl bg-card overflow-hidden">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-xs font-semibold text-white uppercase tracking-wider hover:bg-white/5 transition-all"
                >
                  <span>{t(faq.q)}</span>
                  <ChevronDown className={`h-4 w-4 text-accent transition-transform duration-200 ${activeFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence initial={false}>
                  {activeFaq === idx && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 pt-0 text-xs text-muted-foreground border-t border-white/5 leading-relaxed bg-black/10">
                        {t(faq.a)}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* CTA CONTATO */}
        <section className="py-20 border-t border-white/5 bg-secondary/15 text-center">
          <div className="max-w-2xl mx-auto px-4 flex flex-col items-center gap-6">
            <span className="text-[10px] uppercase font-bold text-accent tracking-widest">{t('¿Dudas?')}</span>
            <h2 className="font-heading text-3xl font-light text-white uppercase">{t('¿Quieres una Experiencia Privada?')}</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('Organizamos talleres privados para grupos corporativos, despedidas de soltera o viajes de amigos en Seúl o España. Contáctanos y personalizamos todo el itinerario.')}
            </p>
            <Button onClick={() => alert('Abriendo chat de soporte de Cheotnun')} className="bg-accent hover:bg-accentHover text-background font-bold px-8 py-5 rounded-full text-xs">
              {t('HABLAR CON CONSULTORA')}
            </Button>
          </div>
        </section>

        {/* NEWSLETTER */}
        <section className="py-16 bg-card border-t border-white/5">
          <div className="max-w-4xl mx-auto px-4 text-center flex flex-col items-center gap-5">
            <span className="text-[10px] uppercase font-bold text-accent tracking-widest">{t('Newsletter')}</span>
            <h3 className="font-heading text-xl text-white uppercase tracking-wider">{t('Recibe invitaciones a nuevos talleres presenciales')}</h3>
            
            {newsletterSubmitted ? (
              <div className="text-xs text-green-400 font-bold bg-green-500/10 border border-green-500/20 px-6 py-2 rounded-xl">
                {t('✓ ¡Te has suscrito con éxito! Recibirás los eventos del blog en tu correo.')}
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
                        source: 'experiencias',
                        status: 'active',
                        created_at: new Date().toISOString().split('T')[0]
                      });
                      db.save('newsletter_subscribers', subs);
                    }
                    // Salvar também no Supabase (async, não bloqueia a UI)
                    saveNewsletterSubscriberToSupabase(newsletterEmail, '', 'experiencias')
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
                    setNewsletterSubmitted(true);
                  }
                }}
                className="flex w-full max-w-md items-center gap-2 mt-2"
              >
                <Input
                  required
                  type="email"
                  placeholder={t('Tu dirección de correo electrónico')}
                  value={newsletterEmail}
                  onChange={e => setNewsletterEmail(e.target.value)}
                  className="bg-background border-white/10 text-white rounded-full text-xs px-4"
                />
                <Button type="submit" className="bg-accent hover:bg-accentHover text-background font-bold rounded-full text-xs px-6 py-2.5 shrink-0">
                  {t('SUSCRIBIRSE')}
                </Button>
              </form>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
