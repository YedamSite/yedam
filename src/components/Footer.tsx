'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle, Mail, MapPin } from 'lucide-react';
import { db } from '@/lib/db';
import { useLanguage } from '@/context/LanguageContext';

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

const TikTok = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" {...props}>
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
);

const LINK_ICONS: Record<string, React.ComponentType<any>> = {
  MessageCircle, Mail, MapPin
};

export default function Footer() {
  const { t, locale } = useLanguage();
  const siteContent = db.get('site_content');
  const translatedContent = db.getTranslatedRecord(siteContent, locale) || {};
  const content = translatedContent.footer || null;
  const settings = db.get('system_settings');
  const company = settings?.company_details || {};

  const logoUrl = content?.logoUrl || '/images/cheotnun-k-beauty-logo-oficial.webp';
  const description = content?.description || '';
  const social = content?.social || {};
  const columns = content?.columns || [];
  
  // Ensure Contacto is present in the help column just in case it's missing from DB
  const renderColumns = JSON.parse(JSON.stringify(columns));
  const helpColumn = renderColumns.find((c: any) => c.title === 'Ayuda & Políticas' || c.title === 'Ayuda');
  if (helpColumn && !helpColumn.links.some((l: any) => l.href === '/contacto')) {
    helpColumn.links.splice(2, 0, { label: 'Contacto', href: '/contacto' });
  }

  return (
    <footer className="w-full border-t border-white/10 bg-secondary text-foreground py-16 px-4 md:px-8 mt-auto">
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Left Column - Brand info */}
        <div className="flex flex-col gap-4 items-center md:items-start text-center md:text-left">
          <Link href="/" className="flex flex-col items-center gap-2 group">
            <Image
              src={logoUrl}
              alt="Cheotnun"
              width={140}
              height={40}
              className="h-28 w-auto object-contain"
            />
            <div className="flex flex-col items-center justify-center">
              <span className="font-heading text-xl font-light text-white uppercase tracking-wider leading-none">
                Cheotnun
              </span>
              <span className="text-[7px] font-bold text-accent uppercase tracking-[0.3em] leading-none mt-0.5 text-center">
                BEAUTY
              </span>
            </div>
          </Link>
          <p className="text-xs text-muted-foreground leading-relaxed mt-2">
            {t(description)}
          </p>
          <div className="flex gap-4 mt-2">
            {social.instagram && (
              <a href={social.instagram} target="_blank" rel="noreferrer" className="text-accent hover:text-accentHover transition-colors">
                <Instagram className="h-4.5 w-4.5" />
              </a>
            )}
            {social.youtube && (
              <a href={social.youtube} target="_blank" rel="noreferrer" className="text-accent hover:text-accentHover transition-colors">
                <Youtube className="h-4.5 w-4.5" />
              </a>
            )}
            {social.tiktok && (
              <a href={social.tiktok} target="_blank" rel="noreferrer" className="text-accent hover:text-accentHover transition-colors">
                <TikTok className="h-4.5 w-4.5" />
              </a>
            )}
          </div>
        </div>

        {/* Dynamic Columns */}
        {renderColumns.map((col: any, idx: number) => (
          <div key={idx} className="flex flex-col gap-4 items-center md:items-start text-center md:text-left">
            <h3 className="text-xs font-bold uppercase tracking-wider text-accent">{t(col.title)}</h3>
            <ul className="flex flex-col gap-2.5 text-xs text-muted-foreground items-center md:items-start">
              {(col.links || []).map((link: any, li: number) => {
                const Icon = LINK_ICONS[link.icon || ''];
                return (
                  <li key={li}>
                    <Link href={link.href} className="hover:text-accent transition-colors flex items-center gap-2">
                      {Icon && <Icon className="h-4 w-4 text-accent shrink-0" />}
                      <span>{t(link.label)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto max-w-7xl border-t border-white/5 mt-12 pt-10 flex flex-col items-center text-center text-[10px] text-muted-foreground gap-3">
        <p>
          {t('Orgulhosamente desenvolvido por')}{' '}
          <a className="font-semibold text-foreground hover:text-accent transition-colors duration-200" href="https://www.voltris.com.br" target="_blank" rel="noreferrer">
            VOLTRIS
          </a>
        </p>
        <p>&copy; {new Date().getFullYear()} {t(company.name || 'CHEOTNUN K-BEAUTY')}. {t('Todos los derechos reservados')}.</p>
        <p>
          <Link href="/politica-de-privacidad" className="hover:text-accent transition-colors">
            {t('Política de Privacidad')}
          </Link>
        </p>
        <p>
          {t('En colaboración con')}{' '}
          <a className="font-semibold text-foreground hover:text-accent transition-colors duration-200" href="https://www.maeumglobal.com.br" target="_blank" rel="noreferrer">
            Maeum Global Agency
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
