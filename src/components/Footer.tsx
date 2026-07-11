'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle, Mail, MapPin } from 'lucide-react';

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const Youtube = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
  </svg>
);

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-secondary text-foreground py-16 px-4 md:px-8 mt-auto">
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Left Column - Brand info */}
        {/* Left Column - Brand info */}
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center group">
            <Image
              src="/images/logo.png"
              alt="Yedam"
              width={140}
              height={40}
              className="h-10 w-auto object-contain"
            />
          </Link>
          <p className="text-xs text-muted-foreground leading-relaxed mt-2">
            Importamos los cosméticos coreanos más exclusivos y galardonados a nivel internacional para transformar tu rutina diaria de skincare en un ritual de lujo.
          </p>
          <div className="flex gap-4 mt-2">
            <a href="https://instagram.com/yedam.kbeauty" target="_blank" rel="noreferrer" className="text-accent hover:text-accentHover transition-colors">
              <Instagram className="h-4.5 w-4.5" />
            </a>
            <a href="https://youtube.com/yedam.kbeauty" target="_blank" rel="noreferrer" className="text-accent hover:text-accentHover transition-colors">
              <Youtube className="h-4.5 w-4.5" />
            </a>
          </div>
        </div>

        {/* Column 2 - Tienda */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-accent">Tienda</h3>
          <ul className="flex flex-col gap-2.5 text-xs text-muted-foreground">
            <li><Link href="/tienda" className="hover:text-accent transition-colors">Todos los productos</Link></li>
            <li><Link href="/tienda?category=cuidado-facial" className="hover:text-accent transition-colors">Cuidado Facial</Link></li>
            <li><Link href="/tienda?category=proteccion-solar" className="hover:text-accent transition-colors">Protección Solar</Link></li>
            <li><Link href="/rutinas" className="hover:text-accent transition-colors">Rutinas Recomendadas</Link></li>
          </ul>
        </div>

        {/* Column 3 - Ayuda */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-accent">Ayuda & Políticas</h3>
          <ul className="flex flex-col gap-2.5 text-xs text-muted-foreground">
            <li><Link href="/ayuda/envios" className="hover:text-accent transition-colors">Envíos y Entregas</Link></li>
            <li><Link href="/ayuda/devoluciones" className="hover:text-accent transition-colors">Cambios y Devoluciones</Link></li>
            <li><Link href="/politica-de-privacidad" className="hover:text-accent transition-colors">Política de Privacidad</Link></li>
            <li><Link href="/terminos" className="hover:text-accent transition-colors">Términos y Condiciones</Link></li>
          </ul>
        </div>

        {/* Column 4 - Atencion al Cliente */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-accent">Atención al Cliente</h3>
          <ul className="flex flex-col gap-3 text-xs text-muted-foreground">
            <li className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-accent" />
              <span>WhatsApp: +34 600 111 222</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-accent" />
              <span>hola@yedambeauty.com</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-accent mt-0.5 shrink-0" />
              <span className="leading-relaxed">Calle Gran Vía 12, Madrid, España</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-7xl border-t border-white/5 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-[10px] text-muted-foreground gap-4">
        <p>&copy; {new Date().getFullYear()} YEDAM K-BEAUTY. Todos los derechos reservados.</p>
        <div className="flex items-center gap-1">
          <span>Orgulhosamente desenvolvido por</span>
          <a className="font-semibold text-foreground hover:text-accent transition-colors duration-200" href="https://www.voltris.com.br" target="_blank" rel="noreferrer">Voltris</a>
        </div>
        <p className="mt-2 sm:mt-0">En colaboración con Maeum Global Agency.</p>
      </div>
    </footer>
  );
}
