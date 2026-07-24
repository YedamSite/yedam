'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { RotateCcw, CheckCircle, Clock, Package, ShieldCheck, AlertCircle } from 'lucide-react';
import { db } from '@/lib/db';
import { useLanguage } from '@/context/LanguageContext';

const iconMap: Record<string, any> = { RotateCcw, CheckCircle, Clock, Package, ShieldCheck, AlertCircle };

export default function DevolucionesPage() {
  const { t, locale } = useLanguage();
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    const siteContent = db.get('site_content');
    const translatedContent = db.getTranslatedRecord(siteContent, locale) || {};
    setContent(translatedContent.ayudaDevoluciones?.hero || null);
  }, [locale]);

  const c = content;
  const badge = c?.badge || 'Política de Devolución';
  const title = c?.title || 'Cambios y Devoluciones';
  const subtitle = c?.subtitle || 'Compra con confianza. Tienes 14 días para devolver tus productos sin compromiso.';
  const steps = c?.steps || [];
  const summary = c?.summary || [];
  const sectionTitle = c?.sectionTitle || 'Proceso de Devolución';
  const conditionsTitle = c?.conditionsTitle || 'Condiciones para Devolución';
  const conditions = c?.conditions || [];
  const notAcceptedTitle = c?.notAcceptedTitle || 'No Aceptamos Devoluciones de';
  const notAccepted = c?.notAccepted || [];
  const contactTitle = c?.contactTitle || '¿Necesitas Ayuda?';
  const contactText = c?.contactText || 'Nuestro equipo de atención al cliente está disponible para ayudarte con cualquier duda sobre cambios o devoluciones.';
  const contactEmail = c?.contactEmail || 'hola@cheotnun.com';
  const contactWhatsapp = c?.contactWhatsapp || '+34 600 111 222';

  const getIcon = (name: string) => iconMap[name] || ShieldCheck;

  const defaultSteps = [
    { step: '01', icon: 'Clock', title: 'Solicitud (14 días)', desc: 'Tienes 14 días naturales desde la recepción para solicitar la devolución. Escríbenos con tu número de pedido y motivo.' },
    { step: '02', icon: 'Package', title: 'Preparación', desc: 'Te enviaremos las instrucciones y etiqueta de devolución. Empaqueta los productos en su embalaje original, sin usar y precintados.' },
    { step: '03', icon: 'RotateCcw', title: 'Envío Gratis', desc: 'Para productos defectuosos o errores nuestros, cubrimos el coste de envío. Para cambios de opinión, el coste corre por tu cuenta.' },
    { step: '04', icon: 'ShieldCheck', title: 'Reembolso (5-7 días)', desc: 'Una vez recibido y verificado, procesamos el reembolso en 5-7 días hábiles a tu método de pago original.' }
  ];

  const defaultSummary = [
    { icon: 'Clock', title: '14 Días', text: 'Para solicitar devolución desde la recepción' },
    { icon: 'Package', title: 'Producto Sin Usar', text: 'Con embalaje original y precintado' },
    { icon: 'CheckCircle', title: 'Reembolso Rápido', text: '5-7 días hábiles tras verificación' }
  ];

  const defaultConditions = [
    'Producto sin usar, sin abrir y en perfecto estado',
    'Embalaje original intacto con todos los precintos',
    'Ticket o comprobante de compra',
    'Solicitud dentro de los 14 días naturales',
    'Formulario de devolución completado'
  ];

  const defaultNotAccepted = [
    'Productos abiertos o usados',
    'Artículos en oferta o liquidación (salvo defecto)',
    'Tarjetas regalo y cajas de suscripción',
    'Productos sin embalaje original',
    'Devoluciones después de 14 días'
  ];

  const activeSteps = steps.length > 0 ? steps : defaultSteps;
  const activeSummary = summary.length > 0 ? summary : defaultSummary;
  const activeConditions = conditions.length > 0 ? conditions : defaultConditions;
  const activeNotAccepted = notAccepted.length > 0 ? notAccepted : defaultNotAccepted;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative w-full min-h-[30vh] flex items-center justify-center overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-background" />
          <div className="relative z-10 text-center px-4 max-w-3xl mx-auto py-16">
            <span className="text-[10px] font-bold text-accent tracking-[0.25em] uppercase">{badge}</span>
            <h1 className="font-heading text-4xl md:text-5xl font-light text-white mt-4 mb-4 uppercase">{title}</h1>
            <p className="text-sm text-foreground/60 max-w-xl mx-auto leading-relaxed">{subtitle}</p>
          </div>
        </section>

        {/* Policy Summary */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
          <div className="bg-gradient-to-r from-accent/10 via-accent/5 to-transparent border border-accent/20 rounded-3xl p-8 md:p-10 mb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {activeSummary.map((item: any, idx: number) => {
                const Icon = getIcon(item.icon);
                return (
                  <div key={idx} className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-4">
                      <Icon className="h-8 w-8 text-accent" />
                    </div>
                    <h3 className="font-heading text-lg font-bold text-white uppercase mb-2">{item.title}</h3>
                    <p className="text-xs text-foreground/60">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Steps */}
          <div className="mb-16">
            <h2 className="font-heading text-2xl font-light text-white uppercase tracking-wide mb-8">{sectionTitle}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {activeSteps.map((item: any, idx: number) => {
                const Icon = getIcon(item.icon);
                return (
                  <div key={idx} className="bg-card border border-white/5 rounded-2xl p-6 relative">
                    <span className="text-5xl font-heading font-bold text-accent/10 absolute top-4 right-4">{item.step}</span>
                    <Icon className="h-8 w-8 text-accent mb-4" />
                    <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-3">{item.title}</h3>
                    <p className="text-xs text-foreground/60 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Conditions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
            <div className="bg-card border border-white/5 rounded-3xl p-8">
              <h3 className="font-heading text-xl font-light text-white uppercase mb-6 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                {conditionsTitle}
              </h3>
              <ul className="flex flex-col gap-3">
                {activeConditions.map((condition: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-xs text-foreground/70">
                    <CheckCircle className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                    <span>{condition}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-card border border-white/5 rounded-3xl p-8">
              <h3 className="font-heading text-xl font-light text-white uppercase mb-6 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-accent" />
                {notAcceptedTitle}
              </h3>
              <ul className="flex flex-col gap-3">
                {activeNotAccepted.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-xs text-foreground/70">
                    <AlertCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-secondary/30 border border-white/5 rounded-3xl p-8 text-center">
            <h3 className="font-heading text-xl font-light text-white uppercase mb-3">{contactTitle}</h3>
            <p className="text-xs text-foreground/60 mb-6 max-w-lg mx-auto">{contactText}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs">
              <a href={`mailto:${contactEmail}`} className="text-accent hover:underline font-bold">
                ✉️ {contactEmail}
              </a>
              <span className="text-foreground/20">|</span>
              <a href={`https://wa.me/${contactWhatsapp.replace(/\D/g, '')}`} className="text-accent hover:underline font-bold">
                💬 WhatsApp: {contactWhatsapp}
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
