'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Heart, ShoppingBag, User, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { authService } from '@/lib/supabaseAuth';
import AuthModal from './AuthModal';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [favCount, setFavCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

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
      const cart = localStorage.getItem('yedam_cart');
      const parsedCart = cart ? JSON.parse(cart) : [];
      setCartCount(parsedCart.reduce((acc: number, item: any) => acc + item.quantity, 0));

      const favs = localStorage.getItem('yedam_favorites');
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

  const navItems = [
    { label: 'Inicio', href: '/' },
    { label: 'Tienda', href: '/tienda' },
    { label: 'Rutinas', href: '/rutinas' },
    { label: 'Experiencias', href: '/experiencias' }
  ];

  return (
    <div className="w-full flex flex-col sticky top-0 z-50">
      {/* Top Announcement Bar matching reference */}
      <div className="w-full bg-[#030712] border-b border-white/5 py-2.5 px-4 md:px-8 text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center md:justify-between text-center">
        <div className="leading-relaxed">Belleza que nace de la tradición. Cosmética que transforma.</div>
        <div className="hidden md:flex items-center gap-6">
          <div>Envíos para toda América Latina</div>
          <div>Atención</div>
          <div className="text-white">ES ▾</div>
        </div>
      </div>

      <header className="w-full border-t border-b border-white/10 px-4 md:px-8 h-20 bg-transparent relative flex items-center">
        <div className="absolute inset-0 -z-10 bg-background/95 backdrop-blur" />
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between relative z-10">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <Image
              src="/images/logo.png"
              alt="Yedam"
              width={140}
              height={40}
              priority
              className="h-20 w-auto object-contain"
            />
          </Link>

          {/* Desktop Nav Centered */}
          <nav className="hidden md:flex items-center justify-center gap-10 absolute left-1/2 -translate-x-1/2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-xs uppercase tracking-[0.15em] font-semibold transition-all hover:text-accent hover:-translate-y-0.5 duration-300 ${pathname === item.href ? 'text-accent border-b border-accent/40 pb-0.5' : 'text-foreground/80'
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-6">
            <Search strokeWidth={1.8} className="h-4.5 w-4.5 text-accent hover:scale-110 cursor-pointer transition-all" />

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
                    <span>Mi Panel</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-2.5 py-2 text-xs rounded hover:bg-red-500/5 hover:text-red-400 transition-colors flex items-center gap-2 text-red-500 border-t border-white/5 mt-1"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => openAuth('login')}
                  className="text-[10px] font-bold uppercase tracking-wider text-foreground/80 hover:text-accent px-3 py-1.5 transition-all"
                >
                  Entrar
                </button>
                <button
                  onClick={() => openAuth('register')}
                  className="bg-accent hover:bg-accentHover text-background font-bold text-[10px] uppercase tracking-wider px-5 py-2.5 rounded-full shadow-lg transition-all hover:scale-105"
                >
                  Crear Cuenta
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

            <div className="h-px bg-white/5" />

            {/* User actions on Mobile */}
            {currentUser ? (
              <div className="flex flex-col gap-3">
                <div className="text-[9px] font-bold text-accent uppercase tracking-widest">
                  Sesión: {currentUser.name} ({currentUser.role})
                </div>
                <Link
                  href={currentUser.role === 'super_admin' || currentUser.role === 'admin' ? '/dashboard/admin' : '/dashboard/cliente'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-xs text-foreground/80 py-1"
                >
                  <LayoutDashboard className="h-4 w-4 text-accent" />
                  Mi Panel
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-xs text-red-500 py-1 text-left"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => openAuth('login')}
                  className="border border-white/15 hover:bg-white/5 text-white font-bold text-xs py-2.5 rounded-xl transition-all"
                >
                  Entrar
                </button>
                <button
                  onClick={() => openAuth('register')}
                  className="bg-accent hover:bg-accentHover text-background font-bold text-xs py-2.5 rounded-xl transition-all"
                >
                  Crear Cuenta
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
        />
      </header>
    </div>
  );
}
