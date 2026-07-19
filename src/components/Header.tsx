'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Heart, ShoppingBag, User, Menu, X, LogOut, LayoutDashboard, Globe, Check } from 'lucide-react';
import { authService } from '@/lib/supabaseAuth';
import { db } from '@/lib/db';
import AuthModal from './AuthModal';
import { useLanguage } from '@/context/LanguageContext';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, setLocale, t, isModalOpen, setIsModalOpen } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [favCount, setFavCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  
  // Search state & filtering
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const rawProducts = db.get('products') || [];
  const productsList = rawProducts.map((p: any) => db.getTranslatedRecord(p, locale));

  const rawCategories = db.get('categories') || [];
  const categoriesList = rawCategories.map((c: any) => db.getTranslatedRecord(c, locale));
  
  const searchResults = headerSearchQuery.trim()
    ? productsList.filter((p: any) =>
        p.name.toLowerCase().includes(headerSearchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(headerSearchQuery.toLowerCase())
      ).slice(0, 4)
    : [];

  const matchedCategories = headerSearchQuery.trim()
    ? categoriesList.filter((c: any) =>
        c.name.toLowerCase().includes(headerSearchQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  // Auth state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const updateSession = () => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
  };

  useEffect(() => {
    updateSession();

    const updateCounts = () => {
      const cart = localStorage.getItem('cheotnun_cart');
      const parsedCart = cart ? JSON.parse(cart) : [];
      setCartCount(parsedCart.reduce((acc: number, item: any) => acc + item.quantity, 0));

      const favs = localStorage.getItem('cheotnun_favorites');
      const parsedFavs = favs ? JSON.parse(favs) : [];
      setFavCount(parsedFavs.length);
    };

    updateCounts();
    // Keep counts and sessions synced in dynamic pages
    const interval = setInterval(() => {
      updateCounts();
      updateSession();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close language modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isModalOpen && !(e.target as Element).closest('[data-language-selector]')) {
        setIsModalOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isModalOpen, setIsModalOpen]);

  const handleLogout = async () => {
    await authService.signOut();
    setCurrentUser(null);
    router.push('/');
  };

  const handleAuthSuccess = () => {
    updateSession();
    const user = authService.getCurrentUser();
    if (user) {
      if (user.role === 'super_admin' || user.role === 'admin') {
        router.push('/dashboard/admin');
      } else {
        router.push('/dashboard/cliente');
      }
    }
  };

  const openAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  const siteContent = db.get('site_content');
  const translatedContent = db.getTranslatedRecord(siteContent, locale) || {};
  const headerContent = translatedContent.header || {};
  const navItems = [
    { label: t('Inicio'), href: '/' },
    { label: t('Tienda'), href: '/tienda' },
    { label: t('Rutinas'), href: '/rutinas' },
    { label: t('Blog'), href: '/blog' },
    { label: t('Experiencias'), href: '/experiencias' }
  ];

  return (
    <div className="w-full flex flex-col sticky top-0 z-50">
      {/* Top Announcement Bar */}
      <div className="w-full bg-[#030712] border-b border-white/5 py-2.5 px-4 md:px-8 text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center md:justify-between text-center">
        <div className="leading-relaxed">{t(headerContent.announcementText || 'Belleza que nace de la tradición. Cosmética que transforma.')}</div>
        <div className="hidden md:flex items-center gap-6 relative">
          <div>{t(headerContent.shippingText || 'Envíos para toda América Latina')}</div>
          <div>{t('Atención')}</div>
          <div className="relative">
            <button 
              onClick={() => setIsModalOpen(!isModalOpen)}
              className="flex items-center gap-1 text-white hover:text-accent transition-colors"
              data-language-selector
            >
              {locale === 'es' ? 'ES' : locale === 'pt' ? 'PT' : 'EN'}
              <span className="text-[10px]">▾</span>
            </button>
            
            {/* Language Modal */}
            {isModalOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-white/10 bg-[#07101E] p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150" data-language-selector>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => setLocale('es')}
                    className={`flex items-center justify-between w-full px-3 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors ${locale === 'es' ? 'bg-accent/20 text-accent' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                  >
                    <span>{t('Español')}</span>
                    {locale === 'es' && <Check className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={() => setLocale('pt')}
                    className={`flex items-center justify-between w-full px-3 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors ${locale === 'pt' ? 'bg-accent/20 text-accent' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                  >
                    <span>{t('Portugués')}</span>
                    {locale === 'pt' && <Check className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={() => setLocale('en')}
                    className={`flex items-center justify-between w-full px-3 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors ${locale === 'en' ? 'bg-accent/20 text-accent' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                  >
                    <span>{t('Inglés')}</span>
                    {locale === 'en' && <Check className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <header className="w-full border-t border-b border-white/10 px-4 md:px-8 h-20 bg-transparent relative flex items-center">
        <div className="absolute inset-0 -z-10 bg-background/95 backdrop-blur" />
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between relative z-10">
          {/* Logo - Left */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <Image
              src={headerContent.logoUrl || '/images/cheotnun-k-beauty-logo-oficial.webp'}
              alt="Cheotnun"
              width={140}
              height={40}
              priority
              className="h-14 md:h-16 w-auto object-contain"
            />
            <div className="flex flex-col items-center justify-center md:hidden">
              <span className="font-heading text-lg font-light text-white uppercase tracking-wider leading-none">
                Cheotnun
              </span>
              <span className="text-[6px] font-bold text-accent uppercase tracking-[0.3em] leading-none mt-0.5 text-center">
                BEAUTY
              </span>
            </div>
            <div className="hidden md:flex flex-col items-center justify-center">
              <span className="font-heading text-2xl font-light text-white uppercase tracking-wider leading-none">
                Cheotnun
              </span>
              <span className="text-[8px] font-bold text-accent uppercase tracking-[0.3em] leading-none mt-0.5 text-center">
                BEAUTY
              </span>
            </div>
          </Link>

          {/* Desktop Nav Centered - flex-1 to fill space */}
          <nav className="hidden md:flex items-center justify-center gap-10 flex-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-xs uppercase tracking-[0.15em] font-semibold transition-all hover:text-accent hover:-translate-y-0.5 duration-300 whitespace-nowrap ${pathname === item.href ? 'text-accent border-b border-accent/40 pb-0.5' : 'text-foreground/80'
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Action Buttons - Right */}
          <div className="hidden md:flex items-center gap-6 shrink-0">
            {/* Dynamic Search Bar with Autocomplete */}
            <div className="relative flex items-center">
              {isSearchExpanded ? (
                <div className="relative flex items-center">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (headerSearchQuery.trim()) {
                        router.push(`/tienda?search=${encodeURIComponent(headerSearchQuery.trim())}`);
                        setIsSearchExpanded(false);
                        setHeaderSearchQuery('');
                      }
                    }}
                    className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-full px-3 py-1 animate-in fade-in zoom-in-95 duration-200"
                  >
                    <input
                      type="text"
                      value={headerSearchQuery}
                      onChange={(e) => setHeaderSearchQuery(e.target.value)}
                      placeholder={t('Buscar...')}
                      autoFocus
                      className="bg-transparent text-white border-0 outline-none text-[10px] w-28 uppercase tracking-wider placeholder-gray-500 font-bold"
                    />
                    <button type="submit">
                      <Search strokeWidth={1.8} className="h-3.5 w-3.5 text-accent hover:scale-110 transition-all" />
                    </button>
                    <button type="button" onClick={() => { setIsSearchExpanded(false); setHeaderSearchQuery(''); }} className="text-gray-400 hover:text-white text-[9px] font-bold ml-1">
                      ✕
                    </button>
                  </form>

                  {/* Autocomplete Dropdown */}
                  {headerSearchQuery.trim() && (searchResults.length > 0 || matchedCategories.length > 0) && (
                    <div className="absolute right-0 top-full mt-2.5 w-72 rounded-2xl border border-white/10 bg-[#07101E] p-3.5 shadow-2xl z-50 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-150">
                      {matchedCategories.length > 0 && (
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[8px] text-accent font-bold uppercase tracking-widest">{t('Categorías')}</span>
                          <div className="flex flex-col gap-1">
                            {matchedCategories.map((cat: any) => (
                              <Link
                                key={cat.id}
                                href={`/tienda?category=${cat.slug}`}
                                onClick={() => {
                                  setIsSearchExpanded(false);
                                  setHeaderSearchQuery('');
                                }}
                                className="text-[10px] text-white hover:text-accent font-semibold transition-colors py-0.5 uppercase tracking-wide"
                              >
                                📁 {cat.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                      {searchResults.length > 0 && (
                        <div className="flex flex-col gap-2">
                          <span className="text-[8px] text-accent font-bold uppercase tracking-widest border-t border-white/5 pt-2">{t('Productos')}</span>
                          <div className="flex flex-col gap-2.5">
                            {searchResults.map((prod: any) => {
                              const imgUrl = prod.id === '11ebc999-9c0b-4ef8-bb6d-6bb9bd380a11' ? 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=100' :
                                             prod.id === '22ebc999-9c0b-4ef8-bb6d-6bb9bd380a22' ? 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=100' :
                                             prod.id === '33ebc999-9c0b-4ef8-bb6d-6bb9bd380a33' ? 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=100' :
                                             prod.id === '44ebc999-9c0b-4ef8-bb6d-6bb9bd380a44' ? 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=100' :
                                             'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=100';
                              return (
                                <Link
                                  key={prod.id}
                                  href={`/tienda/produto/${prod.slug}`}
                                  onClick={() => {
                                    setIsSearchExpanded(false);
                                    setHeaderSearchQuery('');
                                  }}
                                  className="flex items-center gap-2.5 group/item"
                                >
                                  <div className="relative h-8 w-8 rounded overflow-hidden shrink-0 bg-secondary/50">
                                    <Image src={imgUrl} alt={prod.name} fill unoptimized className="object-cover" />
                                  </div>
                                  <div className="flex flex-col truncate">
                                    <span className="text-[10px] text-white group-hover/item:text-accent font-bold truncate transition-colors leading-tight uppercase">{prod.name}</span>
                                    <span className="text-[9px] text-accent/80 font-heading">US$ {prod.price.toFixed(2)}</span>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <button onClick={() => setIsSearchExpanded(true)}>
                  <Search strokeWidth={1.8} className="h-4.5 w-4.5 text-accent hover:scale-110 cursor-pointer transition-all" />
                </button>
              )}
            </div>

            {/* Favorites */}
            <Link href="/dashboard/cliente?tab=favorites" className="relative">
              <Heart strokeWidth={1.8} className="h-4.5 w-4.5 text-accent hover:scale-110 transition-all" />
              {favCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-accent text-background text-[8px] font-bold h-3.5 w-3.5 rounded-full flex items-center justify-center">
                  {favCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link href="/tienda/carrinho" className="relative">
              <ShoppingBag strokeWidth={1.8} className="h-4.5 w-4.5 text-accent hover:scale-110 transition-all" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-accent text-background text-[8px] font-bold h-3.5 w-3.5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Session Profile or Login Buttons */}
            {currentUser ? (
              <div className="relative group">
                <button className="flex items-center gap-1.5 px-4 py-1.5 border border-white/10 rounded-full text-[10px] uppercase font-bold tracking-wider hover:bg-white/5 transition-all text-foreground/90">
                  <User strokeWidth={1.8} className="h-3.5 w-3.5 text-accent" />
                  <span className="max-w-[100px] truncate">{currentUser.name}</span>
                </button>
                <div className="absolute right-0 top-full mt-1.5 w-52 rounded-md border border-white/10 bg-secondary p-1 shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-150">
                  <Link
                    href={currentUser.role === 'super_admin' || currentUser.role === 'admin' ? '/dashboard/admin' : '/dashboard/cliente'}
                    className="w-full text-left px-2.5 py-2 text-xs rounded hover:bg-white/5 hover:text-accent transition-colors flex items-center gap-2 text-foreground/80"
                  >
                    <LayoutDashboard className="h-4 w-4 text-accent" />
                    <span>{t('Mi Panel')}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-2.5 py-2 text-xs rounded hover:bg-red-500/5 hover:text-red-400 transition-colors flex items-center gap-2 text-red-500 border-t border-white/5 mt-1"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t('Cerrar Sesión')}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => openAuth('login')}
                  className="text-[10px] font-bold uppercase tracking-wider text-foreground/80 hover:text-accent px-3 py-1.5 transition-all"
                >
                  {t('Entrar')}
                </button>
                <button
                  onClick={() => openAuth('register')}
                  className="bg-accent hover:bg-accentHover text-background font-bold text-[10px] uppercase tracking-wider px-5 py-2.5 rounded-full shadow-lg transition-all hover:scale-105"
                >
                  {t('Crear Cuenta')}
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <button
            className="md:hidden text-foreground/80 hover:text-accent"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute inset-x-0 top-full bg-background border-b border-white/10 shadow-2xl p-6 flex flex-col gap-6 animate-in fade-in slide-in-from-top-5 duration-200 z-50">
            {/* Search Input for Mobile */}
            <div className="relative">
              <input
                type="text"
                value={headerSearchQuery}
                onChange={(e) => setHeaderSearchQuery(e.target.value)}
                placeholder={t('Buscar producto...')}
                className="w-full bg-black/30 border border-white/10 text-white rounded-xl py-2.5 px-4 pr-10 text-xs uppercase tracking-wider placeholder-gray-500 font-bold outline-none focus:border-accent"
              />
              <button
                onClick={() => {
                  if (headerSearchQuery.trim()) {
                    router.push(`/tienda?search=${encodeURIComponent(headerSearchQuery.trim())}`);
                    setMobileMenuOpen(false);
                    setHeaderSearchQuery('');
                  }
                }}
                className="absolute right-3 top-3"
              >
                <Search className="h-4 w-4 text-accent" />
              </button>
              
              {/* Autocomplete for Mobile */}
              {headerSearchQuery.trim() && (searchResults.length > 0 || matchedCategories.length > 0) && (
                <div className="absolute left-0 right-0 top-full mt-1.5 rounded-xl border border-white/10 bg-[#07101E] p-3 shadow-2xl z-50 flex flex-col gap-2">
                  {matchedCategories.map((cat: any) => (
                    <Link
                      key={cat.id}
                      href={`/tienda?category=${cat.slug}`}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setHeaderSearchQuery('');
                      }}
                      className="text-[10px] text-white hover:text-accent font-semibold py-0.5 uppercase tracking-wide px-2"
                    >
                      📁 {cat.name}
                    </Link>
                  ))}
                  {searchResults.map((prod: any) => (
                    <Link
                      key={prod.id}
                      href={`/tienda/produto/${prod.slug}`}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setHeaderSearchQuery('');
                      }}
                      className="text-[10px] text-white hover:text-accent font-bold py-0.5 truncate uppercase px-2 border-t border-white/5 pt-1.5"
                    >
                      ✨ {prod.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-xs uppercase tracking-wider font-bold hover:text-accent ${pathname === item.href ? 'text-accent' : 'text-foreground'
                    }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Language selector for Mobile */}
            <div className="border-t border-white/5 pt-4">
              <span className="text-[8px] font-bold text-accent uppercase tracking-widest block text-center mb-2">
                {t('Idioma')}
              </span>
              <div className="flex gap-2 justify-center">
                {(['es', 'pt', 'en'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => { setLocale(lang); setMobileMenuOpen(false); }}
                    className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors ${
                      locale === lang ? 'bg-accent/20 text-accent' : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {lang === 'es' ? 'ES' : lang === 'pt' ? 'PT' : 'EN'}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-white/5" />

            {/* User actions on Mobile */}
            {currentUser ? (
              <div className="flex flex-col gap-3">
                <div className="text-[9px] font-bold text-accent uppercase tracking-widest">
                  {t('Sesión')}: {currentUser.name} ({currentUser.role})
                </div>
                <Link
                  href={currentUser.role === 'super_admin' || currentUser.role === 'admin' ? '/dashboard/admin' : '/dashboard/cliente'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-xs text-foreground/80 py-1"
                >
                  <LayoutDashboard className="h-4 w-4 text-accent" />
                  {t('Mi Panel')}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-xs text-red-500 py-1 text-left"
                >
                  <LogOut className="h-4 w-4" />
                  {t('Cerrar Sesión')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => openAuth('login')}
                  className="border border-white/15 hover:bg-white/5 text-white font-bold text-xs py-2.5 rounded-xl transition-all"
                >
                  {t('Entrar')}
                </button>
                <button
                  onClick={() => openAuth('register')}
                  className="bg-accent hover:bg-accentHover text-background font-bold text-xs py-2.5 rounded-xl transition-all"
                >
                  {t('Crear Cuenta')}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Auth Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
          defaultMode={authModalMode}
          onEmailVerificationRequired={() => {
            if (typeof window !== 'undefined') {
              window.location.href = '/verify-email';
            }
          }}
        />
      </header>
    </div>
  );
}
