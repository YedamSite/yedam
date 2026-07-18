'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Truck, Clock, Package, Globe, CheckCircle, AlertCircle } from 'lucide-react';

const shippingInfo = [
  {
    icon: Truck,
    title: 'Envíos Internacionales',
    desc: 'Enviamos a toda América Latina: Brasil, Argentina, Chile, Colombia, México, Perú y más.'
  },
  {
    icon: Clock,
    title: 'Tiempo de Entrega',
    desc: 'España Peninsular: 2-4 días hábiles | España Islas: 4-7 días | Latinoamérica: 7-15 días hábiles | Resto del mundo: 10-20 días hábiles'
  },
  {
    icon: Package,
    title: 'Procesamiento',
    desc: 'Todos los pedidos se procesan en 24-48 horas hábiles. Recibirás un email de confirmación con el número de seguimiento.'
  },
  {
    icon: Globe,
    title: 'Aduanas e Impuestos',
    desc: 'Los precios NO incluyen IVA español para envíos fuera de la UE. Los impuestos de importación locales son responsabilidad del comprador.'
  }
];

const shippingRates = [
  { region: 'España Peninsular', time: '2-4 días', cost: 'US$ 5.90', free: 'US$ 50+' },
  { region: 'España Islas (Canarias, Baleares)', time: '4-7 días', cost: 'US$ 12.90', free: 'US$ 80+' },
  { region: 'Portugal', time: '3-5 días', cost: 'US$ 8.90', free: 'US$ 60+' },
  { region: 'Unión Europea', time: '5-10 días', cost: 'US$ 12.90', free: 'US$ 80+' },
  { region: 'América Latina', time: '7-15 días', cost: 'US$ 15.90', free: 'US$ 100+' },
  { region: 'Estados Unidos y Canadá', time: '7-12 días', cost: 'US$ 18.90', free: 'US$ 120+' },
  { region: 'Otros Países', time: '10-20 días', cost: 'US$ 22.90', free: 'US$ 150+' }
];

export default function EnviosPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative w-full min-h-[30vh] flex items-center justify-center overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-background" />
          <div className="relative z-10 text-center px-4 max-w-3xl mx-auto py-16">
            <span className="text-[10px] font-bold text-accent tracking-[0.25em] uppercase">Información de Envío</span>
            <h1 className="font-heading text-4xl md:text-5xl font-light text-white mt-4 mb-4 uppercase">Envíos y Entregas</h1>
            <p className="text-sm text-foreground/60 max-w-xl mx-auto leading-relaxed">
              Enviamos belleza coreana auténtica a todo el mundo con seguridad y rapidez.
            </p>
          </div>
        </section>

        {/* Info Cards */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {shippingInfo.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-card border border-white/5 rounded-2xl p-6">
                  <Icon className="h-8 w-8 text-accent mb-4" />
                  <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-2">{item.title}</h3>
                  <p className="text-xs text-foreground/60 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Shipping Rates Table */}
          <div className="bg-card border border-white/5 rounded-3xl p-6 md:p-8 mb-16">
            <h2 className="font-heading text-2xl font-light text-white uppercase tracking-wide mb-6">Tarifas de Envío</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-4 text-[9px] text-accent uppercase tracking-wider font-bold">Región</th>
                    <th className="text-left py-4 px-4 text-[9px] text-accent uppercase tracking-wider font-bold">Tiempo de Entrega</th>
                    <th className="text-left py-4 px-4 text-[9px] text-accent uppercase tracking-wider font-bold">Costo</th>
                    <th className="text-left py-4 px-4 text-[9px] text-accent uppercase tracking-wider font-bold">Envío Gratis en Pedidos+</th>
                  </tr>
                </thead>
                <tbody>
                  {shippingRates.map((rate, idx) => (
                    <tr key={idx} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                      <td className="py-4 px-4 text-white font-medium">{rate.region}</td>
                      <td className="py-4 px-4 text-foreground/70">{rate.time}</td>
                      <td className="py-4 px-4 text-accent font-bold">{rate.cost}</td>
                      <td className="py-4 px-4">
                        <span className="text-green-400 font-bold">{rate.free}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tracking */}
          <div className="bg-gradient-to-r from-accent/10 via-accent/5 to-transparent border border-accent/20 rounded-3xl p-8 md:p-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h3 className="font-heading text-xl font-light text-white uppercase mb-2">Seguimiento de Pedidos</h3>
                <p className="text-xs text-foreground/60 max-w-lg">
                  Una vez que tu pedido sea enviado, recibirás un email con el número de seguimiento y enlace para monitorear tu entrega en tiempo real.
                </p>
              </div>
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Tracking 24/7</span>
              </div>
            </div>
          </div>

          {/* Important Info */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-secondary/30 border border-white/5 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-xs uppercase mb-2">Zonas Remotas</h4>
                  <p className="text-xs text-foreground/60">
                    Algunas zonas rurales o islas pueden tener tiempos de entrega extendidos (3-5 días adicionales). Te contactaremos si hay algún retraso.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-secondary/30 border border-white/5 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-xs uppercase mb-2">Embalaje Seguro</h4>
                  <p className="text-xs text-foreground/60">
                    Todos los productos son embalados con cuidado en cajas resistentes con protección antivuelco para garantizar que lleguen en perfectas condiciones.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}