'use client';

import React, { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart, ArrowLeft, ShieldCheck, RefreshCcw, Truck } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/db';
import { toggleFavoriteAction } from '@/actions/shopActions';
import { authService } from '@/lib/supabaseAuth';
import { useLanguage } from '@/context/LanguageContext';

export default function ProductoDetallePage({ params }: { params: Promise<{ slug: string }> }) {
  const { t, locale } = useLanguage();
  // Resolve params using React 19 `use` hook
  const resolvedParams = use(params);
  const { slug } = resolvedParams;

  const [product, setProduct] = useState<any>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [added, setAdded] = useState(false);

  const loadData = () => {
    const products = db.get('products') || [];
    const prod = products.find((p: any) => p.slug === slug);
    setProduct(prod ? db.getTranslatedRecord(prod, locale) : null);

    if (typeof window !== 'undefined') {
      const savedFavs = localStorage.getItem('cheotnun_favorites');
      setFavorites(savedFavs ? JSON.parse(savedFavs) : []);
    }
  };

  useEffect(() => {
    loadData();
  }, [slug, locale]);

  const handleToggleFavorite = async () => {
    if (!product) return;
    const user = authService.getCurrentUser();
    const userId = user ? user.id : 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
    const res = await toggleFavoriteAction(userId, product.id);
    if (res.success) {
      let updatedFavs = [...favorites];
      if (res.isFavorite) {
        updatedFavs.push(product.id);
      } else {
        updatedFavs = updatedFavs.filter(id => id !== product.id);
      }
      setFavorites(updatedFavs);
      localStorage.setItem('cheotnun_favorites', JSON.stringify(updatedFavs));
    }
  };

  const handleAddToCart = () => {
    if (!product || typeof window === 'undefined') return;
    const cart = localStorage.getItem('cheotnun_cart');
    const parsedCart = cart ? JSON.parse(cart) : [];

    const existingIdx = parsedCart.findIndex((item: any) => item.product_id === product.id);
    if (existingIdx !== -1) {
      parsedCart[existingIdx].quantity += 1;
    } else {
      parsedCart.push({
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: '/products/dokdo-cleanser.jpg'
      });
    }

    localStorage.setItem('cheotnun_cart', JSON.stringify(parsedCart));
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-muted-foreground">
          {t('Cargando producto...')}
        </div>
        <Footer />
      </div>
    );
  }

  const isFav = favorites.includes(product.id);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 py-12 px-4 md:px-8 max-w-6xl mx-auto w-full">
        <Link href="/tienda" className="flex items-center gap-1.5 text-xs font-bold text-accent hover:underline mb-8">
          <ArrowLeft className="h-4 w-4" />
          {t('VOLVER AL CATÁLOGO')}
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left - Image Gallery */}
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden border border-white/5 bg-secondary shadow-xl">
            <Image
              src={product.image || 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=800'}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Right - Product details */}
          <div className="flex flex-col gap-6">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-accent">{t('K-Beauty Skincare')}</span>
              <h1 className="font-heading text-3xl sm:text-4xl font-light text-white mt-1 leading-snug">{product.name}</h1>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{t('(48 opiniones)')}</span>
                </div>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-accent font-semibold uppercase tracking-wider">{t('SKU:')} {product.sku}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-y border-white/5 py-4">
              <span className="font-heading text-3xl font-bold text-accent">US$ {product.price.toFixed(2)}</span>
              <div className="text-right flex items-center gap-3">
                <span className="text-xs text-muted-foreground">{product.volume}</span>
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border ${
                  product.stock > 10
                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                    : product.stock > 0
                    ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    product.stock > 10 ? 'bg-green-400' : product.stock > 0 ? 'bg-yellow-400' : 'bg-red-400'
                  }`} />
                  {product.stock > 0 ? `${product.stock} ${t('en stock')}` : t('Agotado')}
                </span>
              </div>
            </div>

            <div className="text-xs text-muted-foreground leading-relaxed">
              <h3 className="font-bold text-white uppercase tracking-wider mb-2">{t('Descripción del Producto')}</h3>
              <p>{product.description}</p>
              <h4 className="font-bold text-white uppercase tracking-wider mt-4 mb-2">{t('English Details')}</h4>
              <p>{product.description_en}</p>
            </div>

            <div className="flex gap-4 mt-4">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 bg-accent hover:bg-accentHover text-background font-bold py-3.5 rounded-full"
              >
                {added ? t('¡AGREGADO AL CARRITO!') : t('AGREGAR AL CARRITO')}
              </Button>
              <Button
                onClick={handleToggleFavorite}
                variant="outline"
                className={`border-white/10 text-white hover:bg-white/5 px-4 rounded-full ${isFav ? 'text-red-500 border-red-500/20 bg-red-500/5' : ''}`}
              >
                <Heart className={`h-5 w-5 ${isFav ? 'fill-current' : ''}`} />
              </Button>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-8 mt-4 text-center">
              <div className="flex flex-col items-center gap-1.5">
                <ShieldCheck className="h-5 w-5 text-accent" />
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">{t('Certificado')}</span>
                <span className="text-[9px] text-muted-foreground">{t('Original de Corea')}</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <RefreshCcw className="h-5 w-5 text-accent" />
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">{t('Garantía')}</span>
                <span className="text-[9px] text-muted-foreground">{t('15 días cambios')}</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <Truck className="h-5 w-5 text-accent" />
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">{t('Envíos')}</span>
                <span className="text-[9px] text-muted-foreground">{t('Seguimiento postal')}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
