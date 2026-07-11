'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { RotateCcw, CheckCircle, Clock, Package, ShieldCheck, AlertCircle } from 'lucide-react';

const returnSteps = [
  {
    step: '01',
    icon: Clock,
    title: 'Solicitud (14 días)',
    desc: 'Tienes 14 días naturales desde la recepción para solicitar la devolución. Escribe a hola@yedambeauty.com con tu número de pedido y motivo.'
  },
  {
    step: '02',
    icon: Package,
    title: 'Preparación',
    desc: 'Te enviaremos las instrucciones y etiqueta de devolución. Empaqueta los productos en su embalaje original, sin usar y precintados.'
  },
  {
    step: '03',
    icon: RotateCcw,
    title: 'Envío Gratis',
    desc: 'Para productos defectuosos o errores nuestros, cubrimos el coste de envío. Para cambios de opinión, el coste corre por tu cuenta.'
  },
  {
    step: '04',
    icon: ShieldCheck,
    title: 'Reembolso (5-7 días)',
    desc: 'Una vez recibido y verificado, procesamos el reembolso en 5-7 días hábiles a tu método de pago original.'
  }
];

export default function DevolucionesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative w-full min-h-[30vh] flex items-center justify-center overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-background" />
          <div className="relative z-10 text-center px-4 max-w-3xl mx-auto py-16">
            <span className="text-[10px] font-bold text-accent tracking-[0.25em] uppercase">Política de Devolución</span>
            <h1 className="font-heading text-4xl md:text-5xl font-light text-white mt-4 mb-4 uppercase">Cambios y Devoluciones</h1>
            <p className="text-sm text-foreground/60 max-w-xl mx-auto leading-relaxed">
              Compra con confianza. Tienes 14 días para devolver tus productos sin compromiso.
            </p>
          </div>
        </section>

        {/* Policy Summary */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
          <div className="bg-gradient-to-r from-accent/10 via-accent/5 to-transparent border border-accent/20 rounded-3xl p-8 md:p-10 mb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-4">
                  <Clock className="h-8 w-8 text-accent" />
                </div>
                <h3 className="font-heading text-lg font-bold text-white uppercase mb-2">14 Días</h3>
                <p className="text-xs text-foreground/60">Para solicitar devolución desde la recepción</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-4">
                  <Package className="h-8 w-8 text-accent" />
                </div>
                <h3 className="font-heading text-lg font-bold text-white uppercase mb-2">Producto Sin Usar</h3>
                <p className="text-xs text-foreground/60">Con embalaje original y precintado</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-accent" />
                </div>
                <h3 className="font-heading text-lg font-bold text-white uppercase mb-2">Reembolso Rápido</h3>
                <p className="text-xs text-foreground/60">5-7 días hábiles tras verificación</p>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="mb-16">
            <h2 className="font-heading text-2xl font-light text-white uppercase tracking-wide mb-8">Proceso de Devolución</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {returnSteps.map((item, idx) => {
                const Icon = item.icon;
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
                Condiciones para Devolución
              </h3>
              <ul className="flex flex-col gap-3">
                {[
                  'Producto sin usar, sin abrir y en perfecto estado',
                  'Embalaje original intacto con todos los precintos',
                  'Ticket o comprobante de compra',
                  'Solicitud dentro de los 14 días naturales',
                  'Formulario de devolución completado'
                ].map((condition, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs text-foreground/70">
                    <CheckCircle className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                    <span>{condition}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-card border border-white/5 rounded-3xl p-8">
              <h3 className="font-heading text-xl font-light text-white uppercase mb-6 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
                No Aceptamos Devoluciones de
              </h3>
              <ul className="flex flex-col gap-3">
                {[
                  'Productos abiertos o usados',
                  'Artículos en oferta o liquidación (salvo defecto)',
                  'Tarjetas regalo y cajas de suscripción',
                  'Productos sin embalaje original',
                  'Devoluciones después de 14 días'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs text-foreground/70">
                    <AlertCircle className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-secondary/30 border border-white/5 rounded-3xl p-8 text-center">
            <h3 className="font-heading text-xl font-light text-white uppercase mb-3">¿Necesitas Ayuda?</h3>
            <p className="text-xs text-foreground/60 mb-6 max-w-lg mx-auto">
              Nuestro equipo de atención al cliente está disponible para ayudarte con cualquier duda sobre cambios o devoluciones.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs">
              <a href="mailto:hola@yedambeauty.com" className="text-accent hover:underline font-bold">
                ✉️ hola@yedambeauty.com
              </a>
              <span className="text-foreground/20">|</span>
              <a href="https://wa.me/34600111222" className="text-accent hover:underline font-bold">
                💬 WhatsApp: +34 600 111 222
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}