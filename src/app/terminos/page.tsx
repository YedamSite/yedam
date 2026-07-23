'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FileText, Scale, AlertTriangle, CheckCircle, ShoppingCart, CreditCard } from 'lucide-react';
import { db } from '@/lib/db';
import { useLanguage } from '@/context/LanguageContext';

export default function TerminosPage() {
  const { t, locale } = useLanguage();
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    const siteContent = db.get('site_content');
    const translatedContent = db.getTranslatedRecord(siteContent, locale) || {};
    setContent(translatedContent.terminos || null);
  }, [locale]);

  const c = content || db.get('site_content')?.terminos || {};

  const IconMap: any = { FileText, ShoppingCart, CreditCard, Scale, AlertTriangle, CheckCircle };

  const sections = c?.sections || [
    {
      icon: 'FileText',
      title: '1. Condiciones Generales',
      content: 'Al acceder y usar cheotnun.com, aceptas estos términos de uso en su totalidad. Si no estás de acuerdo, no uses esta web. Nos reservamos el derecho de modificar estos términos en cualquier momento sin previo aviso.'
    },
    {
      icon: 'ShoppingCart',
      title: '2. Proceso de Compra',
      content: 'Los precios incluyen IVA español. El proceso de compra es: selección de productos, añadir al carrito, checkout, pago, y confirmación por email. La confirmación no garantiza stock hasta verificación. Nos reservamos el derecho de rechazar pedidos por stock limitado o uso fraudulento.'
    },
    {
      icon: 'CreditCard',
      title: '3. Pagos',
      content: 'Aceptamos: tarjetas (Visa, Mastercard, Amex), PayPal, Stripe, y transferencia bancaria. Todos los pagos son procesados por pasarelas seguras. El cargo se realiza en el momento de la compra. Precios en EUR (€).'
    },
    {
      icon: 'Scale',
      title: '4. Propiedad Intelectual',
      content: 'Todo el contenido de esta web (textos, imágenes, logos, diseños, código) es propiedad de Cheotnun K-Beauty S.L. o de terceros licenciados. Queda prohibida la reproducción, distribución o uso comercial sin autorización escrita.'
    },
    {
      icon: 'AlertTriangle',
      title: '5. Limitación de Responsabilidad',
      content: 'No nos hacemos responsables de: errores tipográficos, daños por uso indebido de productos, interrupciones temporales de la web, o daños por virus. Los productos son para uso cosmético externo. Consulta a un dermatólogo si tienes piel sensible.'
    },
    {
      icon: 'CheckCircle',
      title: '6. Ley Aplicable y Jurisdicción',
      content: 'Estos términos se rigen por la ley española. Cualquier disputa será resuelta en los juzgados y tribunales de Madrid, España, salvo que la ley aplicable disponga otra cosa.'
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
            <span className="text-[10px] font-bold text-accent tracking-[0.25em] uppercase">{t(c?.hero?.badge || 'Marco Legal')}</span>
            <h1 className="font-heading text-4xl md:text-5xl font-light text-white mt-4 mb-4 uppercase">{t(c?.hero?.title || 'Términos y Condiciones')}</h1>
            <p className="text-sm text-foreground/60 max-w-xl mx-auto leading-relaxed">
              {t(c?.hero?.subtitle || 'Conoce las reglas que rigen el uso de nuestra plataforma y servicios.')}
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="max-w-4xl mx-auto px-4 md:px-8 py-16">
          {/* Intro */}
          <div className="bg-card border border-white/5 rounded-3xl p-8 mb-10">
            <p className="text-sm text-foreground/70 leading-relaxed mb-4">
              {t(c?.intro?.p1 || 'Bienvenido a')} <strong className="text-white">{t(c?.intro?.brand || 'Cheotnun K-Beauty')}</strong>. {t(c?.intro?.p2 || 'Estos términos establecen las condiciones bajo las cuales proporcionamos nuestros servicios de comercio electrónico de productos de belleza coreana.')}
            </p>
            <p className="text-sm text-foreground/70 leading-relaxed">
              <strong className="text-white">{t('Empresa:')}</strong> {t(c?.company?.name || 'Cheotnun K-Beauty S.L.')}<br/>
              <strong className="text-white">{t('NIF:')}</strong> {t(c?.company?.nif || 'B-12345678')}<br/>
              <strong className="text-white">{t('Domicilio:')}</strong> {t(c?.company?.address || 'Calle Gran Vía 12, Madrid, España')}<br/>
              <strong className="text-white">{t('Email:')}</strong> {t(c?.company?.email || 'hola@cheotnun.com')}<br/>
              <strong className="text-white">{t('Teléfono:')}</strong> {t(c?.company?.phone || '+34 600 111 222')}
            </p>
          </div>

          {/* Sections */}
          <div className="flex flex-col gap-6 mb-10">
            {sections.map((section: any, idx: number) => {
              const Icon = IconMap[section.icon] || FileText;
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

          {/* Additional Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            <div className="bg-secondary/30 border border-white/5 rounded-3xl p-6">
              <h3 className="font-heading text-base font-bold text-white uppercase mb-4">{t(c?.additional?.ageTitle || 'Edad Mínima')}</h3>
              <p className="text-sm text-foreground/70 leading-relaxed">
                {t(c?.additional?.ageDesc || 'Debes ser mayor de 18 años para realizar compras en esta web. Al usar nuestros servicios, declaras tener la edad legal requerida.')}
              </p>
            </div>
            <div className="bg-secondary/30 border border-white/5 rounded-3xl p-6">
              <h3 className="font-heading text-base font-bold text-white uppercase mb-4">{t(c?.additional?.accountTitle || 'Cuentas de Usuario')}</h3>
              <p className="text-sm text-foreground/70 leading-relaxed">
                {t(c?.additional?.accountDesc || 'Eres responsable de mantener la confidencialidad de tu cuenta y contraseña. Notifica inmediatamente cualquier uso no autorizado.')}
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-card border border-white/5 rounded-3xl p-8 text-center">
            <h3 className="font-heading text-xl font-light text-white uppercase mb-3">{t(c?.contact?.title || 'Consultas Legales')}</h3>
            <p className="text-sm text-foreground/60 mb-6">
              {t(c?.contact?.desc || 'Para cualquier duda sobre estos términos, contacta con nuestro departamento legal.')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
              <a href={`mailto:${c?.company?.email || 'legal@cheotnun.com'}`} className="text-accent hover:underline font-bold">
                ✉️ {t(c?.company?.email || 'legal@cheotnun.com')}
              </a>
              <span className="text-foreground/20">|</span>
              <a href={`tel:${c?.company?.phone || '+34912345678'}`} className="text-accent hover:underline font-bold">
                📞 {t(c?.company?.phone || '+34 912 345 678')}
              </a>
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