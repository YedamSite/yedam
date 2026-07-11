'use client';

import React, { useState, useEffect } from 'react';
import { X, Cookie, Settings, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    const savedConsent = localStorage.getItem('yedam_cookie_consent');
    if (!savedConsent) {
      // Delay de 2 segundos antes de mostrar o banner
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const consent = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('yedam_cookie_consent', JSON.stringify(consent));
    setIsVisible(false);
    
    // Aqui você pode integrar com Google Analytics, Facebook Pixel, etc.
    console.log('✓ Todas las cookies aceptadas');
  };

  const handleRejectAll = () => {
    const consent = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('yedam_cookie_consent', JSON.stringify(consent));
    setIsVisible(false);
    console.log('✓ Solo cookies necesarias activas');
  };

  const handleSavePreferences = () => {
    const consent = {
      ...preferences,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('yedam_cookie_consent', JSON.stringify(consent));
    setIsVisible(false);
    setShowPreferences(false);
    console.log('✓ Preferencias guardadas:', preferences);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Banner Principal */}
      <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-[#08152F]/98 backdrop-blur-md border-t border-white/10 p-4 md:p-6 animate-in slide-in-from-bottom duration-500">
        <div className="max-w-7xl mx-auto">
          {showPreferences ? (
            /* Painel de Preferências */
            <div className="flex flex-col gap-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-heading text-lg font-bold text-white uppercase tracking-wide flex items-center gap-2">
                    <Settings className="h-5 w-5 text-accent" />
                    Preferencias de Cookies
                  </h3>
                  <p className="text-xs text-foreground/60 mt-2">
                    Elige qué cookies deseas aceptar. Puedes cambiar tu configuración en cualquier momento.
                  </p>
                </div>
                <button
                  onClick={() => setShowPreferences(false)}
                  className="text-foreground/40 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Opciones de Cookies */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Necessary */}
                <div className="bg-secondary/50 border border-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-xs font-bold text-white uppercase">Necesarios</span>
                  </div>
                  <p className="text-[10px] text-foreground/60 leading-relaxed mb-3">
                    Esenciales para el funcionamiento del sitio. No pueden ser desactivados.
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked
                      disabled
                      className="rounded border-white/20 bg-secondary text-accent focus:ring-accent/20"
                    />
                    <span className="text-[9px] text-muted-foreground uppercase">
                      Siempre activo
                    </span>
                  </div>
                </div>

                {/* Analytics */}
                <div className="bg-secondary/50 border border-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Settings className="h-5 w-5 text-blue-400" />
                    <span className="text-xs font-bold text-white uppercase">Analytics</span>
                  </div>
                  <p className="text-[10px] text-foreground/60 leading-relaxed mb-3">
                    Google Analytics para entender cómo los visitantes usan el sitio.
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={e => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                      className="rounded border-white/20 bg-secondary text-accent focus:ring-accent/20"
                    />
                    <span className="text-[9px] text-muted-foreground uppercase">
                      {preferences.analytics ? 'Activado' : 'Desactivado'}
                    </span>
                  </div>
                </div>

                {/* Marketing */}
                <div className="bg-secondary/50 border border-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Cookie className="h-5 w-5 text-purple-400" />
                    <span className="text-xs font-bold text-white uppercase">Marketing</span>
                  </div>
                  <p className="text-[10px] text-foreground/60 leading-relaxed mb-3">
                    Facebook Pixel y Google Ads para anuncios personalizados.
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={e => setPreferences(prev => ({ ...prev, marketing: e.target.checked }))}
                      className="rounded border-white/20 bg-secondary text-accent focus:ring-accent/20"
                    />
                    <span className="text-[9px] text-muted-foreground uppercase">
                      {preferences.marketing ? 'Activado' : 'Desactivado'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/5">
                <Button
                  onClick={handleSavePreferences}
                  className="flex-1 bg-accent hover:bg-accentHover text-background font-bold py-3 rounded-xl text-xs"
                >
                  GUARDAR PREFERENCIAS
                </Button>
              </div>
            </div>
          ) : (
            /* Banner Simples */
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-accent/10 rounded-xl shrink-0">
                  <Cookie className="h-6 w-6 text-accent" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-heading text-base font-bold text-white uppercase tracking-wide">
                    Usamos Cookies
                  </h3>
                  <p className="text-xs text-foreground/70 leading-relaxed max-w-2xl">
                    Utilizamos cookies propios y de terceros para mejorar tu experiencia, analizar tráfico y personalizar contenido. 
                    Al continuar navegando, aceptas nuestra{' '}
                    <Link href="/politica-de-privacidad" className="text-accent hover:underline">
                      Política de Privacidad
                    </Link>
                    .
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <Button
                  onClick={() => setShowPreferences(true)}
                  variant="outline"
                  className="border-white/10 text-white hover:bg-white/5 font-bold py-3 px-6 rounded-xl text-xs whitespace-nowrap"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Personalizar
                </Button>
                <Button
                  onClick={handleRejectAll}
                  variant="outline"
                  className="border-white/10 text-white hover:bg-white/5 font-bold py-3 px-6 rounded-xl text-xs whitespace-nowrap"
                >
                  Rechazar Todo
                </Button>
                <Button
                  onClick={handleAcceptAll}
                  className="bg-accent hover:bg-accentHover text-background font-bold py-3 px-6 rounded-xl text-xs whitespace-nowrap"
                >
                  Aceptar Todo
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay escuro quando o painel de preferências está aberto */}
      {showPreferences && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
          onClick={() => setShowPreferences(false)}
        />
      )}
    </>
  );
}

// Componente Link simples para usar dentro do banner
const Link = ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
  <a href={href} className={className} target="_blank" rel="noopener noreferrer">
    {children}
  </a>
);