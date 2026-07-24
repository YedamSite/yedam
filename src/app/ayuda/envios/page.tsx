'use client';

import React from 'react';
import Image from 'next/image';
import {
  Truck,
  ShieldCheck,
  ShoppingBag,
  PackageSearch,
  PlaneTakeoff,
  ClipboardCheck,
  Globe2,
  Home,
  Info,
  CreditCard,
  Building2,
  Lock,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  PackageOpen,
  UserCheck
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/context/LanguageContext';
import { db } from '@/lib/db';
import { useState, useEffect } from 'react';
import { Visa, Mastercard, Amex, PayPal } from '@/components/PaymentIcons';

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

const FlowerDecoration = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(50, 50) scale(4)">
      <path d="M0 -5 C 5 -15 15 -10 10 0 C 20 5 20 15 10 15 C 5 25 -5 25 -10 15 C -20 15 -20 5 -10 0 C -15 -10 -5 -15 0 -5 Z" stroke="currentColor" strokeWidth="0.5" fill="none" />
      <circle cx="0" cy="5" r="1" fill="currentColor" />
    </g>
  </svg>
);

export default function EnviosYPagosPage() {
  const { t, locale } = useLanguage();
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    const siteContent = db.get('site_content');
    const translatedContent = db.getTranslatedRecord(siteContent, locale) || {};
    setContent(translatedContent.envios || null);
  }, [locale]);

  const c = content || db.get('site_content')?.envios || {};

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <Header />

      <main className="flex-1 w-full flex flex-col items-center">
        {/* HERO SECTION */}
        <section className="relative w-full h-[calc(100vh-80px)] overflow-hidden flex flex-col justify-center">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image 
              src={c?.hero?.image || "/images/cheotnun-k-beauty-politica-envios.webp"} 
              alt="Envíos"
              fill
              className="object-cover object-center hidden md:block"
              priority
            />
            <Image 
              src={c?.hero?.imageMobile || "/images/mobile/cheotnun-k-beauty-politica-envios.webp"} 
              alt="Envíos Mobile"
              fill
              className="object-cover object-center md:hidden"
              priority
            />
          </div>

          <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-12 py-6 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 items-center">
            <div className="flex flex-col">
              <h1 className="text-5xl md:text-6xl font-heading font-light text-white mb-4">
                {t(c?.hero?.title || 'Envíos y Pagos')}
              </h1>
              <h2 className="text-xl md:text-2xl text-[#C9C9C9] mb-6 font-heading font-light">
                {t(c?.hero?.subtitle || 'Transparencia, seguridad y cumplimiento en cada paso de tu compra.')}
              </h2>
              <p className="text-muted-foreground text-[13px] leading-relaxed mb-10 max-w-lg">
                {t(c?.hero?.text || 'Realizamos envíos internacionales cumpliendo con todas las regulaciones de Corea del Sur y de cada país destino, para que tu experiencia sea segura y sin complicaciones.')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                {(c?.features || [
                  { text: 'Envíos seguros a\ntoda América Latina y Europa', icon: 'PlaneTakeoff' },
                  { text: 'Pagos protegidos\ny múltiples opciones', icon: 'ShieldCheck' }
                ]).map((feat: any, idx: number) => {
                   const IconMap: any = { Truck, ShieldCheck, PlaneTakeoff };
                   const Icon = IconMap[feat.icon] || Truck;
                   return (
                     <div key={idx} className="flex items-center gap-4 bg-transparent border border-[#C9C9C9]/40 rounded-md px-6 py-4 flex-1 backdrop-blur-sm">
                       <Icon className="w-6 h-6 text-[#C9C9C9] shrink-0" strokeWidth={1.5} />
                       <span className="text-[11px] text-white leading-snug whitespace-pre-line">{t(feat.text)}</span>
                     </div>
                   );
                })}
              </div>
            </div>
            
            {/* Right side left empty to reveal background */}
            <div className="hidden lg:block w-full h-full"></div>
          </div>
        </section>

        {/* COMO FUNCIONA EL ENVIO */}
        <section className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 mb-12">
          <div className="bg-[#FDF9F4] rounded-2xl p-8 lg:p-12 shadow-lg relative overflow-hidden">
            <div className="flex items-center gap-3 mb-10">
              <h3 className="text-2xl font-heading text-[#1c2838]">{t(c?.shipping?.title || 'Cómo funciona el envío')}</h3>
              <FlowerDecoration className="w-6 h-6 text-[#C9C9C9] opacity-60" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 relative">
              {/* Connecting line */}
              <div className="absolute top-[50px] left-8 right-8 h-[1px] bg-[#1c2838]/10 hidden lg:block" />

              {[
                { num: '1', icon: ShoppingBag, title: 'Realizas tu pedido', desc: 'Elige tus productos favoritos en nuestra tienda y completa tu compra.' },
                { num: '2', icon: PackageSearch, title: 'Preparamos tu pedido', desc: 'Verificamos, empaquetamos y preparamos tu pedido con el mayor cuidado.' },
                { num: '3', icon: PlaneTakeoff, title: 'Envío desde Corea del Sur', desc: 'Tu pedido sale de Corea cumpliendo con todas las regulaciones de exportación.' },
                { num: '4', icon: ClipboardCheck, title: 'Despacho de aduana', desc: 'Realizamos todos los trámites de exportación en Corea del Sur.' },
                { num: '5', icon: Globe2, title: 'Transporte internacional', desc: 'Tu pedido viaja por aire hasta el país destino.' },
                { num: '6', icon: Home, title: 'Entrega en tu dirección', desc: 'Despacho de aduana en tu país y entrega final en la dirección indicada.' }
              ].map((step, idx) => (
                <div key={idx} className="flex flex-col items-center text-center relative z-10">
                  <div className="w-6 h-6 rounded-full bg-[#EAE4DC] text-[#1c2838] text-[10px] font-bold flex items-center justify-center mb-6 z-20 shadow-sm border border-white">
                    {step.num}
                  </div>
                  <div className="mb-4 text-[#1c2838]">
                    <step.icon className="w-10 h-10 stroke-[1.2]" />
                  </div>
                  <h4 className="text-[12px] font-bold text-[#1c2838] mb-3 leading-tight">{t(step.title)}</h4>
                  <p className="text-[10px] text-[#1c2838]/70 leading-relaxed">{t(step.desc)}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-6 border-t border-[#1c2838]/10 flex items-center justify-center gap-3 text-[11px] text-[#1c2838]/80">
              <Info className="w-4 h-4 text-[#1c2838]/50" />
              {t(c?.shipping?.text || 'Te proporcionamos un número de seguimiento para que puedas rastrear tu pedido en todo momento.')}
            </div>
          </div>
        </section>

        {/* ENVIOS INTERNACIONALES */}
        <section className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 mb-12">
          <div className="bg-[#EAE4DC] rounded-2xl p-8 lg:p-10 shadow-lg grid grid-cols-1 lg:grid-cols-[1fr_2.5fr] gap-8">

            {/* Left Column */}
            <div>
              <h3 className="text-2xl font-heading text-[#1c2838] mb-2">{t(c?.shipping?.tableTitle || 'Envíos internacionales')}</h3>
              <p className="text-[11px] text-[#1c2838]/70 mb-8">{t(c?.shipping?.tableSubtitle || 'Realizamos envíos a todos estos países y más.')}</p>

              <div className="flex flex-col gap-6">
                {[
                  { flagUrl: '/images/flags/paraguay.webp', name: 'Paraguay', desc: 'Envíos permitidos via courier.\nEl destinatario puede estar sujeto al pago de impuestos de importación (IVA y aranceles) según la legislación paraguaya.' },
                  { flagUrl: '/images/flags/uruguay.webp', name: 'Uruguay', desc: 'Envíos permitidos via courier.\nEl destinatario puede estar sujeto al pago de impuestos de importación (IVA y aranceles) según la legislación uruguaya.' },
                  { flagUrl: '/images/flags/espana.webp', name: 'España', desc: 'Envíos permitidos via courier.\nPara envíos a España y otros países de la UE, se aplican las regulaciones de importación de la Unión Europea.' },
                  { flagIcon: Globe2, name: 'Otros países de\nAmérica Latina', desc: 'Enviamos a la mayoría de los países de América Latina. Las políticas de importación pueden variar según la legislación local.' }
                ].map((country, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="mt-0.5 shrink-0 flex items-center justify-center w-8">
                      {country.flagUrl ? (
                        <Image
                          src={country.flagUrl}
                          alt={`Bandera de ${country.name}`}
                          width={28}
                          height={20}
                          className="object-cover rounded-sm shadow-sm"
                          unoptimized={false}
                        />
                      ) : country.flagIcon ? (
                        (() => {
                          const Icon = country.flagIcon;
                          return <Icon className="w-6 h-6 text-[#1c2838]" strokeWidth={1.5} />;
                        })()
                      ) : null}
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold text-[#1c2838] mb-1 whitespace-pre-line">{t(country.name)}</h4>
                      <p className="text-[9px] text-[#1c2838]/70 leading-relaxed whitespace-pre-line">{t(country.desc)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column / Table */}
            <div className="flex flex-col gap-4 overflow-x-auto">
              <div className="bg-[#FDF9F4] rounded-xl border border-[#1c2838]/10 overflow-hidden min-w-[600px]">
                <div className="grid grid-cols-[1.5fr_1.5fr_2fr_1.5fr_1fr] bg-[#FDF9F4] border-b border-[#1c2838]/10 p-4 text-[10px] font-bold text-[#1c2838] text-center">
                  <div className="text-left pl-4">{t('Destino')}</div>
                  <div>{t('Tiempo estimado')}</div>
                  <div>{t('Método de envío')}</div>
                  <div>{t('Costo de envío*')}</div>
                  <div>{t('Seguimiento')}</div>
                </div>
                {[
                  { name: 'Paraguay', flagUrl: '/images/flags/paraguay.webp', time: '5 a 10 días hábiles', method: 'Courier internacional\n(DHL / FedEx)', cost: 'Desde USD 25\n(según peso)' },
                  { name: 'Uruguay', flagUrl: '/images/flags/uruguay.webp', time: '5 a 10 días hábiles', method: 'Courier internacional\n(DHL / FedEx)', cost: 'Desde USD 25\n(según peso)' },
                  { name: 'España', flagUrl: '/images/flags/espana.webp', time: '7 a 14 días hábiles', method: 'Courier internacional\n(DHL / FedEx)', cost: 'Desde EUR 15\n(según peso)' },
                  { name: 'Resto de\nAmérica Latina', flagIcon: Globe2, time: '5 a 15 días hábiles', method: 'Courier internacional\n(DHL / FedEx)', cost: 'Desde USD 25\n(según peso)' }
                ].map((row, idx) => (
                  <div key={idx} className="grid grid-cols-[1.5fr_1.5fr_2fr_1.5fr_1fr] p-4 text-[11px] text-[#1c2838]/80 border-b border-[#1c2838]/5 last:border-0 items-center text-center">
                    <div className="text-left pl-4 flex items-center gap-3 font-medium">
                      <div className="w-6 flex justify-center shrink-0">
                        {row.flagUrl ? (
                          <Image
                            src={row.flagUrl}
                            alt={`Bandera de ${row.name.replace('\n', ' ')}`}
                            width={24}
                            height={16}
                            className="object-cover rounded-sm shadow-sm"
                          />
                        ) : row.flagIcon ? (
                          (() => {
                            const Icon = row.flagIcon;
                            return <Icon className="w-5 h-5 text-[#1c2838]/80" strokeWidth={1.5} />;
                          })()
                        ) : null}
                      </div>
                      <span className="whitespace-pre-line leading-tight">{t(row.name)}</span>
                    </div>
                    <div>{t(row.time)}</div>
                    <div className="whitespace-pre-line leading-tight">{t(row.method)}</div>
                    <div className="whitespace-pre-line leading-tight">{t(row.cost)}</div>
                    <div className="flex justify-center">
                      <CheckCircle2 className="w-5 h-5 text-[#1c2838]/50 stroke-[1.5]" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-[#1c2838]/70 mt-2 px-2 leading-relaxed">
                * {t('El costo de envío se calcula según el peso, dimensiones y país destino.')}<br />
                {t('Los impuestos de importación son responsabilidad del destinatario según la legislación de cada país.')}
              </div>
            </div>
          </div>
        </section>

        {/* PAGOS SEGUROS */}
        <section className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 mb-12">
          <div className="bg-[#FDF9F4] rounded-2xl shadow-lg grid grid-cols-1 lg:grid-cols-[2fr_1fr] overflow-hidden">
            <div className="p-8 lg:p-10">
              <h3 className="text-2xl font-heading text-[#1c2838] mb-2">{t(c?.payments?.title || 'Pagos seguros')}</h3>
              <p className="text-[11px] text-[#1c2838]/70 mb-8">{t(c?.payments?.subtitle || 'Ofrecemos múltiples opciones de pago para tu comodidad.')}</p>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {(c?.payments?.methods || [
                  { name: 'Tarjetas de crédito', desc: 'Aceptamos Visa, Mastercard, American Express y más.' },
                  { name: 'PayPal', desc: 'Paga de forma rápida y segura con tu cuenta de PayPal.' },
                  { name: 'Transferencia bancaria', desc: 'Disponibles para algunos países. Contáctanos para más información.', icon: 'Building2' },
                  { name: 'Pagos locales', desc: 'Consulta sobre opciones de pago local disponibles en tu país.', icon: 'CreditCard' },
                  { name: 'Compra protegida', desc: 'Tu información y pago están 100% protegidos con encriptación y sistemas de seguridad.', icon: 'ShieldCheck' }
                ]).map((method: any, idx: number) => {
                  let content = null;
                  if (method.name.includes('Tarjetas')) content = <div className="flex gap-3 justify-center items-center h-8"><Visa className="h-5 w-auto" /><Mastercard className="h-5 w-auto" /><Amex className="h-5 w-auto" /></div>;
                  if (method.name.includes('PayPal')) content = <div className="flex justify-center items-center h-8"><PayPal className="h-6 w-auto" /></div>;
                  
                  const IconMap: any = { Building2, CreditCard, ShieldCheck };
                  const Icon = IconMap[method.icon];

                  return (
                    <div key={idx} className="flex flex-col text-center items-center">
                      <div className="h-10 flex items-center justify-center mb-3 text-[#1c2838]">
                        {content ? content : (Icon && <Icon className="w-6 h-6 stroke-[1.5]" />)}
                      </div>
                      <h5 className="text-[11px] font-bold text-[#1c2838] mb-2 leading-tight">{t(method.name)}</h5>
                      <p className="text-[9px] text-[#1c2838]/70 leading-relaxed">{t(method.desc)}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-[#0a111a] p-8 lg:p-10 flex flex-col justify-center relative overflow-hidden">
              <BranchBlossom className="absolute -right-6 -bottom-6 w-32 h-32 text-[#C9C9C9]/30 pointer-events-none" />
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="w-10 h-10 border border-white/20 rounded-lg flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-[#C9C9C9] stroke-[1.5]" />
                </div>
                <h3 className="text-[20px] font-heading font-light text-white leading-tight">
                  {t('Tu seguridad es')}<br />{t('nuestra prioridad')}
                </h3>
              </div>
              <p className="text-[10px] text-white/70 leading-relaxed relative z-10 max-w-[200px]">
                {t('Todas las transacciones están protegidas por los más altos estándares de seguridad.')}
              </p>
            </div>
          </div>
        </section>

        {/* LEGISLACION Y CUMPLIMIENTO */}
        <section className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 mb-16">
          <div className="bg-[#FDF9F4] rounded-2xl p-8 lg:p-10 shadow-lg relative">
            <h3 className="text-2xl font-heading text-[#1c2838] mb-2">{t('Legislación y cumplimiento')}</h3>
            <p className="text-[11px] text-[#1c2838]/70 mb-8">{t('Cumplimos con todas las regulaciones de Corea del Sur y de cada país destino.')}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { flagUrl: '/images/flags/corea.webp', title: 'Exportación desde Corea del Sur', desc: 'Cumplimos con todas las regulaciones de exportación de la República de Corea, incluyendo documentación y controles aduaneros.' },
                { icon: PackageOpen, title: 'Importación en el país destino', desc: 'Cada país tiene sus propias regulaciones de importación. El destinatario puede estar sujeto al pago de impuestos, aranceles o tasas aduaneras.' },
                { icon: CheckCircle2, title: 'Productos permitidos', desc: 'Enviamos únicamente productos cosméticos de uso personal. No enviamos productos prohibidos o restringidos por la aduana de cada país.' },
                { icon: UserCheck, title: 'Responsabilidad del cliente', desc: 'Es responsabilidad del cliente conocer las regulaciones de importación de su país y asumir los costos de impuestos o aranceles aplicables.' }
              ].map((item, idx) => (
                <div key={idx} className="bg-white rounded-xl p-6 border border-[#1c2838]/5 shadow-sm">
                  <div className="mb-4 text-[#1c2838]">
                    {item.flagUrl ? (
                      <Image
                        src={item.flagUrl}
                        alt={`Bandera`}
                        width={28}
                        height={20}
                        className="object-cover rounded-sm shadow-sm"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full border border-[#1c2838]/20 flex items-center justify-center">
                        {item.icon && <item.icon className="w-4 h-4 stroke-[1.5]" />}
                      </div>
                    )}
                  </div>
                  <h5 className="text-[11px] font-bold text-[#1c2838] mb-2 leading-tight">{t(item.title)}</h5>
                  <p className="text-[10px] text-[#1c2838]/70 leading-relaxed">{t(item.desc)}</p>
                </div>
              ))}
            </div>

            {/* Bottom Support Callout */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-center sm:text-left">
              <div className="w-8 h-8 rounded-full border border-[#1c2838]/20 flex items-center justify-center bg-[#EAE4DC] text-[#1c2838] shrink-0">
                <HelpCircle className="w-4 h-4 stroke-[1.5]" />
              </div>
              <span className="text-[12px] font-medium text-[#1c2838]">
                {t('¿Tienes dudas sobre envíos o pagos? Nuestro equipo está aquí para ayudarte.')}
              </span>
              <button className="bg-[#0a111a] hover:bg-black text-white font-bold text-[10px] tracking-widest px-8 py-3 rounded-md uppercase transition-colors">
                {t('CONTACTAR SOPORTE')}
              </button>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}