'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart, ShoppingCart, Search, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { db } from '@/lib/db';
import { toggleFavoriteAction } from '@/actions/shopActions';
import { authService } from '@/lib/supabaseAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/context/LanguageContext';
import { useSearchParams } from 'next/navigation';

function TiendaContent() {
  const { t, locale } = useLanguage();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');

  const [products, setProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  // Filters
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [addedProduct, setAddedProduct] = useState<string | null>(null);

  const loadData = () => {
    const rawProds = db.get('products') || [];
    setProducts(rawProds.map((p: any) => db.getTranslatedRecord(p, locale)));

    const rawBrands = db.get('brands') || [];
    setBrands(rawBrands.map((b: any) => db.getTranslatedRecord(b, locale)));

    const rawCategories = db.get('categories') || [];
    const translatedCategories = rawCategories.map((c: any) => db.getTranslatedRecord(c, locale));
    setCategories(translatedCategories);

    if (categoryParam) {
      const cat = translatedCategories.find((c: any) => c.slug === categoryParam);
      if (cat) setSelectedCategory(cat.id);
    } else {
      setSelectedCategory('ALL');
    }

    if (searchParam) {
      setSearchQuery(searchParam);
    }

    if (typeof window !== 'undefined') {
      const savedFavs = localStorage.getItem('cheotnun_favorites');
      setFavorites(savedFavs ? JSON.parse(savedFavs) : []);
    }
  };

  useEffect(() => {
    loadData();
  }, [locale, categoryParam, searchParam]);

  const handleToggleFavorite = async (productId: string) => {
    const user = authService.getCurrentUser();
    const userId = user ? user.id : 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
    const res = await toggleFavoriteAction(userId, productId);
    if (res.success) {
      let updatedFavs = [...favorites];
      if (res.isFavorite) {
        updatedFavs.push(productId);
      } else {
        updatedFavs = updatedFavs.filter(id => id !== productId);
      }
      setFavorites(updatedFavs);
      localStorage.setItem('cheotnun_favorites', JSON.stringify(updatedFavs));
    }
  };

  const handleAddToCart = (product: any) => {
    if (typeof window === 'undefined') return;
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
        price_brl: product.price_brl || product.price * 5,
        quantity: 1,
        image: '/products/dokdo-cleanser.jpg'
      });
    }

    localStorage.setItem('cheotnun_cart', JSON.stringify(parsedCart));
    setAddedProduct(product.name);
    setTimeout(() => setAddedProduct(null), 3000);
  };

  const filteredProducts = products.filter(p => {
    const matchesBrand = selectedBrand === 'ALL' || p.brand_id === selectedBrand;
    const matchesCategory = selectedCategory === 'ALL' || p.category_id === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBrand && matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1 py-12 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-white/10 pb-6 mb-8 gap-4">
          <div>
            <span className="text-xs text-accent uppercase font-bold tracking-widest">{t('K-Beauty Shop')}</span>
            <h1 className="font-heading text-3xl sm:text-4xl font-light text-white mt-1">{t('Catálogo de Cosméticos')}</h1>
          </div>
          
          {/* Global notification for cart addition */}
          {addedProduct && (
            <div className="bg-accent/25 border border-accent/40 text-accent text-xs rounded-xl px-4 py-2 animate-bounce">
              ✓ ¡{addedProduct} {t('agregado al carrito')}!
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="flex flex-col gap-6 border border-white/10 rounded-3xl p-6 bg-card shadow-xl h-fit">
            {/* Search */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-accent uppercase tracking-wider">{t('Buscar Producto')}</label>
              <div className="relative">
                <Input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t('Ej: Sérum, Limpiador...')}
                  className="bg-black/30 border-white/10 text-white rounded-xl pr-10 text-xs"
                />
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-accent uppercase tracking-wider">{t('Categorías')}</label>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => setSelectedCategory('ALL')}
                  className={`w-full text-left text-xs font-semibold py-2 px-3 rounded-lg transition-colors ${
                    selectedCategory === 'ALL' ? 'bg-accent/15 text-accent font-bold' : 'text-muted-foreground hover:bg-white/5'
                  }`}
                >
                  {t('Todas las categorías')}
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left text-xs font-semibold py-2 px-3 rounded-lg transition-colors ${
                      selectedCategory === cat.id ? 'bg-accent/15 text-accent font-bold' : 'text-muted-foreground hover:bg-white/5'
                    }`}
                  >
                    {t(cat.name)}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-accent uppercase tracking-wider">{t('Marcas')}</label>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => setSelectedBrand('ALL')}
                  className={`w-full text-left text-xs font-semibold py-2 px-3 rounded-lg transition-colors ${
                    selectedBrand === 'ALL' ? 'bg-accent/15 text-accent font-bold' : 'text-muted-foreground hover:bg-white/5'
                  }`}
                >
                  {t('Todas las marcas')}
                </button>
                {brands.map((br) => (
                  <button
                    key={br.id}
                    onClick={() => setSelectedBrand(br.id)}
                    className={`w-full text-left text-xs font-semibold py-2 px-3 rounded-lg transition-colors ${
                      selectedBrand === br.id ? 'bg-accent/15 text-accent font-bold' : 'text-muted-foreground hover:bg-white/5'
                    }`}
                  >
                    {br.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Products Grid Area */}
          <div className="lg:col-span-3">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {filteredProducts.map((prod) => {
                  const isFav = favorites.includes(prod.id);
                  return (
                    <div key={prod.id} className="bg-card border border-white/5 rounded-2xl overflow-hidden shadow-xl hover:border-accent/40 transition-all flex flex-col group relative">
                      {/* Favorite Toggle Button */}
                      <button
                        onClick={() => handleToggleFavorite(prod.id)}
                        className="absolute right-3 top-3 z-20 p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white hover:text-red-500 transition-colors"
                      >
                        <Heart className={`h-3.5 w-3.5 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                      </button>

                      <div className="relative aspect-square w-full overflow-hidden bg-secondary">
                        <Image
                          src={prod.image || 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=400'}
                          alt={t(prod.name)}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] font-bold text-accent uppercase tracking-wider">{t('Skin Care')}</span>
                          <h3 className="font-heading text-sm font-medium text-white line-clamp-2 mt-1 leading-snug group-hover:text-accent transition-colors">
                            {t(prod.name)}
                          </h3>
                          <p className="text-[9px] text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed">{t(prod.description)}</p>
                          <div className="flex items-center gap-1 mt-1.5">
                            <div className="flex text-accent">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="h-3 w-3 fill-current" />
                              ))}
                            </div>
                            <span className="text-[9px] text-muted-foreground">(48)</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-3 mt-4 pt-2 border-t border-white/5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-accent font-heading">{locale === 'pt' ? `R$ ${(prod.price_brl || prod.price * 5).toFixed(2)}` : `US$ ${prod.price.toFixed(2)}`}</span>
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] font-semibold ${prod.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {prod.stock > 0 ? `Stock: ${prod.stock}` : t('Agotado')}
                              </span>
                              <span className="text-[10px] text-muted-foreground">{t(prod.volume)}</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Link href={`/tienda/produto/${prod.slug}`} className="flex-1">
                              <Button variant="outline" className="w-full text-[10px] font-bold text-white border-white/10 hover:bg-white/5 py-1.5 h-8">
                                {t('VER DETALLES')}
                              </Button>
                            </Link>
                            <Button
                              onClick={() => handleAddToCart(prod)}
                              disabled={prod.stock <= 0}
                              className="bg-accent hover:bg-accentHover text-background py-1.5 px-3 h-8"
                            >
                              <ShoppingCart className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="border border-dashed border-white/10 rounded-3xl p-12 text-center text-xs text-muted-foreground">
                {t('Ningún producto coincide con los filtros aplicados.')}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function TiendaPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-background items-center justify-center text-white">
        Cargando tienda...
      </div>
    }>
      <TiendaContent />
    </Suspense>
  );
}
