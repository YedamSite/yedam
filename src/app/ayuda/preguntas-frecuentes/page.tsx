'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/context/translations';
import { ChevronRight } from 'lucide-react';
import { db } from '@/lib/db';

export default function FAQPage() {
  const { t } = useLanguage();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // We can just use the quickItems as our base FAQs or add more
  const c = db.get('site_content')?.contacto || {};
  const faqs = c?.faq?.quickItems || [
    { q: '¿Cuánto tiempo tarda en llegar mi pedido?', a: 'Los envíos estándar toman entre 3 a 7 días hábiles, y los express entre 1 a 3 días hábiles.' },
    { q: '¿Qué métodos de pago aceptan?', a: 'Aceptamos tarjetas de crédito, débito, Pix y transferencias bancarias a través de Stripe y PayPal.' },
    { q: '¿Realizan envíos a mi país?', a: 'Sí, realizamos envíos a todo el mundo. Los costos y tiempos de entrega varían según la ubicación.' },
    { q: '¿Puedo cambiar o devolver un producto?', a: 'Tienes 30 días para devolver un producto sin usar y en su empaque original. Contáctanos para iniciar el proceso.' }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Header />

      <main className="flex-1 pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <h1 className="text-4xl md:text-5xl font-heading text-white mb-6">
            {t('Preguntas Frecuentes')}
          </h1>
          <p className="text-white/70 text-sm mb-12">
            {t('Encuentra respuestas rápidas a las dudas más comunes de nuestros clientes.')}
          </p>

          <div className="flex flex-col gap-4">
            {faqs.map((item: any, idx: number) => {
              const isExpanded = expandedFaq === idx;
              return (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-lg flex flex-col cursor-pointer group hover:bg-white/10 transition-colors" onClick={() => setExpandedFaq(isExpanded ? null : idx)}>
                   <div className="px-6 py-5 flex items-center justify-between">
                     <span className="text-[13px] text-white/90 group-hover:text-white font-medium">{t(item.q || item)}</span>
                     <ChevronRight className={`w-4 h-4 text-[#C9C9C9]/50 group-hover:text-[#C9C9C9] transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                   </div>
                   {isExpanded && item.a && (
                     <div className="px-6 pb-5 pt-2 border-t border-white/5 text-[12px] text-white/70 leading-relaxed">
                       {t(item.a)}
                     </div>
                   )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
