'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Shield, Lock, Eye, Database, Mail, CheckCircle } from 'lucide-react';
import { db } from '@/lib/db';
import { useLanguage } from '@/context/LanguageContext';

export default function PrivacidadPage() {
  const { t, locale } = useLanguage();
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    const siteContent = db.get('site_content');
    const translatedContent = db.getTranslatedRecord(siteContent, locale) || {};
    setContent(translatedContent.privacidad || null);
  }, [locale]);

  const c = content || db.get('site_content')?.privacidad || {};

  const IconMap: any = { Shield, Database, Eye, Lock, Mail, CheckCircle };

  const sections = c?.sections || [
    {
      icon: 'Shield',
      title: '1. Responsable del Tratamiento',
      content: 'Cheotnun K-Beauty S.L., con domicilio en Calle Gran Vía 12, Madrid, España, NIF B-12345678, email: hola@cheotnun.com, es la responsable del tratamiento de tus datos personales.'
    },
    {
      icon: 'Database',
      title: '2. Datos que Recopilamos',
      content: 'Recopilamos: nombre, email, dirección, teléfono, datos de pago, historial de compras, preferencias de productos, y datos de navegación (cookies). Solo recogemos datos necesarios para prestar nuestros servicios.'
    },
    {
      icon: 'Eye',
      title: '3. Finalidad del Tratamiento',
      content: 'Tus datos se usan para: gestionar pedidos y envíos, atender consultas, enviar newsletters (con tu consentimiento), mejorar nuestra web, y cumplir obligaciones legales. No vendemos ni alquilamos tus datos.'
    },
    {
      icon: 'Lock',
      title: '4. Legitimación',
      content: 'El tratamiento se basa en: ejecución del contrato (pedidos), consentimiento explícito (newsletter), interés legítimo (mejora de servicios), y cumplimiento de obligaciones legales (facturación).'
    },
    {
      icon: 'Mail',
      title: '5. Destinatarios',
      content: 'Tus datos pueden ser compartidos con: empresas de transporte (para envíos), pasarelas de pago (Stripe, PayPal), servicios de email marketing, y autoridades cuando sea requerido legalmente.'
    },
    {
      icon: 'CheckCircle',
      title: '6. Tus Derechos',
      content: 'Tienes derecho a: acceder, rectificar, suprimir, limitar, portar y oponerte al tratamiento de tus datos. También puedes retirar tu consentimiento en cualquier momento. Ejerce tus derechos escribiendo a hola@cheotnun.com.'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative w-full min-h-[30vh] flex items-center justify-center overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-background" />
          <div className="relative z-10 text-center px-4 max-w-3xl mx-auto py-16">
            <span className="text-[10px] font-bold text-accent tracking-[0.25em] uppercase">{t(c?.hero?.badge || 'Transparencia y Seguridad')}</span>
            <h1 className="font-heading text-4xl md:text-5xl font-light text-white mt-4 mb-4 uppercase">{t(c?.hero?.title || 'Política de Privacidad')}</h1>
            <p className="text-sm text-foreground/60 max-w-xl mx-auto leading-relaxed">
              {t(c?.hero?.subtitle || 'Tus datos están seguros con nosotros. Cumplimos estrictamente con el RGPD de la Unión Europea.')}
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="max-w-4xl mx-auto px-4 md:px-8 py-16">
          {/* Intro */}
          <div className="bg-card border border-white/5 rounded-3xl p-8 mb-10">
            <p className="text-sm text-foreground/70 leading-relaxed mb-4">
              {t(c?.intro?.p1 || 'En')} <strong className="text-white">{t(c?.intro?.brand || 'Cheotnun K-Beauty')}</strong> {t(c?.intro?.p2 || 'nos tomamos muy en serio tu privacidad. Esta política explica de forma clara y transparente cómo recopilamos, usamos y protegemos tus datos personales.')}
            </p>
            <p className="text-sm text-foreground/70 leading-relaxed">
              {t(c?.intro?.p3 || 'Al usar nuestra web, aceptas las prácticas descritas aquí. Si no estás de acuerdo, por favor no uses nuestros servicios.')}
            </p>
          </div>

          {/* Sections */}
          <div className="flex flex-col gap-6 mb-10">
            {sections.map((section: any, idx: number) => {
              const Icon = IconMap[section.icon] || Shield;
              return (
                <div key={idx} className="bg-card border border-white/5 rounded-2xl p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-accent/10 rounded-xl shrink-0">
                      <Icon className="h-6 w-6 text-accent" />
                    </div>
                    <h2 className="font-heading text-lg font-bold text-white uppercase tracking-wide pt-1">
                      {t(section.title)}
                    </h2>
                  </div>
                  <p className="text-sm text-foreground/70 leading-relaxed pl-[52px]">
                    {t(section.content)}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Security */}
          <div className="bg-gradient-to-r from-green-500/10 via-green-500/5 to-transparent border border-green-500/20 rounded-3xl p-8 mb-10">
            <h3 className="font-heading text-xl font-light text-white uppercase mb-4 flex items-center gap-2">
              <Lock className="h-6 w-6 text-green-400" />
              {t(c?.security?.title || 'Seguridad de Datos')}
            </h3>
            <p className="text-sm text-foreground/70 leading-relaxed mb-4">
              {t(c?.security?.p1 || 'Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos: cifrado SSL/TLS, servidores seguros en la UE, acceso restringido, backups automáticos, y auditorías regulares.')}
            </p>
            <p className="text-sm text-foreground/70 leading-relaxed">
              {t(c?.security?.p2 || 'Aunque usamos las mejores prácticas, ningún sistema es 100% seguro. Te recomendamos usar contraseñas fuertes y no compartir tus credenciales.')}
            </p>
          </div>

          {/* Cookies */}
          <div className="bg-secondary/30 border border-white/5 rounded-3xl p-8 mb-10">
            <h3 className="font-heading text-xl font-light text-white uppercase mb-4">{t(c?.cookies?.title || 'Uso de Cookies')}</h3>
            <p className="text-sm text-foreground/70 leading-relaxed mb-4">
              {t(c?.cookies?.p1 || 'Usamos cookies propias y de terceros para: funcionamiento básico de la web, análisis de tráfico, personalización de contenido, y publicidad segmentada.')}
            </p>
            <p className="text-sm text-foreground/70 leading-relaxed">
              {t(c?.cookies?.p2 || 'Puedes configurar tu navegador para rechazar cookies, pero algunas funciones de la web podrían no funcionar correctamente.')}
            </p>
          </div>

          {/* Contact */}
          <div className="bg-card border border-white/5 rounded-3xl p-8 text-center">
            <h3 className="font-heading text-xl font-light text-white uppercase mb-3">{t(c?.contact?.title || '¿Dudas sobre Privacidad?')}</h3>
            <p className="text-sm text-foreground/60 mb-6">
              {t(c?.contact?.desc || 'Nuestro Delegado de Protección de Datos (DPO) está disponible para cualquier consulta.')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
              <a href={`mailto:${c?.contact?.email || 'dpo@cheotnun.com'}`} className="text-accent hover:underline font-bold">
                ✉️ {t(c?.contact?.email || 'dpo@cheotnun.com')}
              </a>
              <span className="text-foreground/20">|</span>
              <span className="text-foreground/70">{t(c?.contact?.address || 'Calle Gran Vía 12, Madrid, España')}</span>
            </div>
          </div>

          {/* Update Date */}
          <p className="text-center text-[10px] text-muted-foreground mt-8">
            {t('Última actualización:')} {new Date().toLocaleDateString(locale === 'pt' ? 'pt-BR' : locale === 'en' ? 'en-US' : 'es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}