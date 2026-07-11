'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Star, ShieldCheck, Truck, ShieldAlert, Heart, Compass, Check, ArrowRight,
  Droplet, Sparkles, AlertCircle, HelpCircle, Eye, ShoppingBag, EyeOff, Smile,
  Hourglass, ClipboardList, Plus
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { db } from '@/lib/db';
import { toggleFavoriteAction } from '@/actions/shopActions';
import { authService } from '@/lib/supabaseAuth';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const loadData = () => {
    setProducts(db.get('products') || []);
    if (typeof window !== 'undefined') {
      const savedFavs = localStorage.getItem('yedam_favorites');
      setFavorites(savedFavs ? JSON.parse(savedFavs) : []);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
      localStorage.setItem('yedam_favorites', JSON.stringify(updatedFavs));
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#020617] text-white relative overflow-hidden">
      
      {/* Background Starry Glows */}
      <div className="absolute top-[5%] left-[10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[40%] right-[5%] w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <Header />

      {/* Hero Section Split Layout matching reference exactly */}
      <section className="relative min-h-[95vh] flex flex-col justify-between pt-8 overflow-hidden border-b border-white/5 bg-cover bg-[position:75%_center] md:bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/banner.png')" }}>
        
        {/* Dark elegant overlay to integrate the image with the layout and ensure high contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent z-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-0" />

        <div className="max-w-7xl mx-auto w-full px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 py-16 lg:py-24">
          
          {/* Left Text Column */}
          <div className="lg:col-span-12 flex flex-col items-start gap-8 text-left max-w-2xl">
            <h1 className="font-heading text-5xl sm:text-7xl lg:text-8xl font-light tracking-tight leading-[0.95] text-white">
              Tu belleza.<br />
              <span className="text-accent italic font-serif">Tu ritual.</span><br />
              Tu momento.
            </h1>
            
            <p className="text-sm sm:text-base text-gray-200 max-w-lg font-normal leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Cosméticos coreanos auténticos seleccionados para cada etapa de tu cuidado facial. Fórmulas botánicas que revelan tu luminosidad natural.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-2">
              <Link href="/tienda">
                <Button className="w-full sm:w-auto bg-accent hover:bg-accentHover text-background font-bold text-xs tracking-[0.1em] py-6 px-10 rounded-full shadow-xl shadow-accent/15 transition-all hover:-translate-y-0.5 duration-300">
                  COMPRAR AHORA
                </Button>
              </Link>
              <Link href="/rutinas">
                <Button variant="outline" className="w-full sm:w-auto text-white border-white/20 hover:bg-white/5 hover:border-accent/40 font-bold text-xs tracking-[0.1em] py-6 px-10 rounded-full backdrop-blur transition-all hover:-translate-y-0.5 duration-300">
                  DESCUBRIR RUTINAS
                </Button>
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Floating Highlights Bar at the bottom overlapping the background image */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 relative z-20 -mt-24 md:-mt-12">
        <div className="w-full bg-[#081229]/65 backdrop-blur-xl border border-white/15 rounded-2xl md:rounded-3xl p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-xs text-muted-foreground shadow-2xl">
          {[
            { icon: ShieldCheck, title: '100% ORIGINALES', text: 'Directo desde Corea' },
            { icon: Truck, title: 'ENVÍOS INTERNACIONALES', text: 'A toda América Latina' },
            { icon: ShieldAlert, title: 'PASOS SEGUROS', text: 'Protegemos tu compra' },
            { icon: Heart, title: 'ATENCIÓN PERSONALIZADA', text: 'Estamos para ayudarte' }
          ].map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="flex items-center gap-3.5">
                <span className="p-2.5 bg-white/5 rounded-xl border border-white/15 text-accent">
                  <Icon strokeWidth={1.8} className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="font-bold text-white text-[10px] tracking-wider uppercase">{feat.title}</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">{feat.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Categorias Circular Row */}
      <section className="py-24 lg:py-28 max-w-7xl mx-auto w-full px-4 md:px-8">
        <div className="text-center max-w-md mx-auto mb-16">
          <span className="text-[10px] text-accent uppercase font-bold tracking-[0.2em] block mb-2">Colección Curada</span>
          <h2 className="font-heading text-3xl sm:text-4xl font-light text-white tracking-wide">Descubre lo mejor del K-Beauty</h2>
          <p className="text-xs text-muted-foreground mt-2 font-light">Productos auténticos para realzar tu belleza natural.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-6">
          {[
            { name: 'Cuidado Facial', image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=400', slug: 'cuidado-facial' },
            { name: 'Cuidado Corporal', image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=400', slug: 'cuidado-corporal' },
            { name: 'Cuidado Capilar', image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=400', slug: 'cuidado-capilar' },
            { name: 'Maquillaje', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=400', slug: 'maquillaje' },
            { name: 'Cuidado de Uñas', image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=400', slug: 'cuidado-de-unas' },
            { name: 'Protección Solar', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=400', slug: 'proteccion-solar' }
          ].map((cat, idx) => (
            <Link key={idx} href={`/tienda?category=${cat.slug}`} className="relative h-64 rounded-3xl overflow-hidden border border-white/10 group shadow-xl">
              <Image src={cat.image} alt={cat.name} fill unoptimized className="object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm py-4 px-2 text-center border-t border-white/5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white group-hover:text-accent transition-colors leading-snug">
                  {cat.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
        <div className="flex justify-center mt-12">
          <Link href="/tienda">
            <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 hover:border-accent/40 font-bold text-xs px-8 py-5 rounded-full uppercase tracking-wider transition-all hover:-translate-y-0.5 duration-300">
              VER TODAS LAS CATEGORÍAS
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-24 lg:py-28 border-y border-white/5 bg-[#050b1c] w-full">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-4 gap-12 items-center">
          
          {/* Left Title Column */}
          <div className="flex flex-col items-start gap-4">
            <span className="text-[10px] text-accent uppercase font-bold tracking-[0.2em] block">Favoritos de la Comunidad</span>
            <h2 className="font-heading text-4xl font-light text-white leading-tight">Más vendidos</h2>
            <p className="text-xs text-gray-400 font-light leading-relaxed">
              Los favoritos de nuestra comunidad internacional. Fórmulas probadas que entregan resultados visibles.
            </p>
            <Link href="/tienda" className="text-xs font-bold text-accent hover:underline flex items-center gap-1.5 uppercase tracking-[0.15em] mt-4">
              VER TODOS →
            </Link>
          </div>

          {/* Right Product Grid - 5 Items */}
          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-5 gap-4">
            {products.slice(0, 5).map((prod) => {
              const isFav = favorites.includes(prod.id);
              // Mock brand name based on ID
              let brand = "K-Beauty";
              if (prod.id === '11ebc999-9c0b-4ef8-bb6d-6bb9bd380a11') brand = "Round Lab";
              else if (prod.id === '22ebc999-9c0b-4ef8-bb6d-6bb9bd380a22') brand = "Beauty of Joseon";
              else if (prod.id === '33ebc999-9c0b-4ef8-bb6d-6bb9bd380a33') brand = "COSRX";
              else if (prod.id === '44ebc999-9c0b-4ef8-bb6d-6bb9bd380a44') brand = "Anua";
              else if (prod.id === '55ebc999-9c0b-4ef8-bb6d-6bb9bd380a55') brand = "Skin1004";

              const imgUrl = prod.id === '11ebc999-9c0b-4ef8-bb6d-6bb9bd380a11' ? 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=400' :
                             prod.id === '22ebc999-9c0b-4ef8-bb6d-6bb9bd380a22' ? 'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=400' :
                             prod.id === '33ebc999-9c0b-4ef8-bb6d-6bb9bd380a33' ? 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=400' :
                             prod.id === '44ebc999-9c0b-4ef8-bb6d-6bb9bd380a44' ? 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=400' :
                             'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=400';

              return (
                <div key={prod.id} className="bg-[#0b1329] border border-white/10 rounded-3xl overflow-hidden shadow-xl hover:border-accent/30 transition-all flex flex-col justify-between group relative h-full">
                  <button
                    onClick={() => handleToggleFavorite(prod.id)}
                    className="absolute right-3 top-3 z-20 p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-accent hover:scale-110 transition-transform"
                  >
                    <Heart strokeWidth={1.8} className={`h-3.5 w-3.5 ${isFav ? 'fill-accent text-accent' : 'text-accent'}`} />
                  </button>

                  <div className="relative aspect-square w-full overflow-hidden bg-secondary">
                    <Image
                      src={imgUrl}
                      alt={prod.name}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  </div>
                  
                  <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                    <div>
                      <span className="text-[8px] font-bold text-accent uppercase tracking-widest">{brand}</span>
                      <h3 className="font-heading text-xs font-semibold text-white line-clamp-2 mt-0.5 leading-snug group-hover:text-accent transition-colors">
                        {prod.name}
                      </h3>
                      <div className="flex items-center gap-1 mt-1.5">
                        <div className="flex text-accent">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} strokeWidth={1.8} className="h-2.5 w-2.5 fill-current" />
                          ))}
                        </div>
                        <span className="text-[9px] text-gray-500 font-bold">(48)</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2.5 border-t border-white/5 mt-auto">
                      <div className="flex flex-col">
                        <span className="text-[8px] text-gray-500 uppercase font-bold tracking-wider">Precio</span>
                        <span className="text-xs font-bold text-accent font-heading">US$ {prod.price.toFixed(2)}</span>
                      </div>
                      <Link href={`/tienda/produto/${prod.slug}`} className="p-2 bg-[#091E3A] hover:bg-accent text-white hover:text-background rounded-full border border-white/10 transition-all shadow-md">
                        <Plus strokeWidth={2} className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Experiencias Yedam Section matching reference */}
      <section className="py-24 lg:py-28 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-md mx-auto mb-16">
          <span className="text-[9px] font-bold text-accent tracking-widest uppercase">Experiencias Yedam</span>
          <h2 className="font-heading text-3xl font-light text-white mt-1">Vive la belleza coreana más allá de los productos</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-[#0b1329] border border-white/10 rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-xl min-h-[340px] group">
            <div className="flex-1 p-6 md:p-8 flex flex-col justify-between relative z-10">
              <div>
                <span className="text-[8px] bg-accent/20 text-accent font-bold tracking-widest px-2.5 py-1 border border-accent/35 rounded-full uppercase w-fit block">YEDAM EXPERIENCE</span>
                <h3 className="font-heading text-2xl font-light text-white mt-6">Prueba, siente y descubre.</h3>
                <p className="text-xs text-gray-400 mt-3 leading-relaxed">
                  Damos a probar productos exclusivos en experiencias únicas en Corea del Sur.
                </p>
              </div>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/5 hover:border-accent/40 font-bold text-[9px] px-6 py-4.5 rounded-full uppercase tracking-wider w-fit mt-6 transition-all hover:-translate-y-0.5 duration-300">
                SABER MÁS
              </Button>
            </div>
            <div className="w-full md:w-[45%] h-[200px] md:h-auto relative shrink-0 border-t md:border-t-0 md:border-l border-white/5">
              <Image src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=400" fill unoptimized alt="Skincare background" className="object-cover group-hover:scale-102 transition-transform duration-500" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#0b1329] border border-white/10 rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-xl min-h-[340px] group">
            <div className="flex-1 p-6 md:p-8 flex flex-col justify-between relative z-10">
              <div>
                <span className="text-[8px] bg-blue-500/20 text-blue-400 font-bold tracking-widest px-2.5 py-1 border border-blue-400/35 rounded-full uppercase w-fit block">EN COLABORACIÓN CON MAEUM</span>
                <h3 className="font-heading text-2xl font-light text-white mt-6">Viajes que transforman.</h3>
                <p className="text-xs text-gray-400 mt-3 leading-relaxed">
                  Viaja a Corea y vive la cultura, la belleza y el bienestar de una forma auténtica.
                </p>
              </div>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/5 hover:border-accent/40 font-bold text-[9px] px-6 py-4.5 rounded-full uppercase tracking-wider w-fit mt-6 transition-all hover:-translate-y-0.5 duration-300">
                EXPLORAR VIAJES
              </Button>
            </div>
            <div className="w-full md:w-[45%] h-[200px] md:h-auto relative shrink-0 border-t md:border-t-0 md:border-l border-white/5">
              <Image src="https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=400" fill unoptimized alt="Travel background" className="object-cover group-hover:scale-102 transition-transform duration-500" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#0b1329] border border-white/10 rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-xl min-h-[340px] group">
            <div className="flex-1 p-6 md:p-8 flex flex-col justify-between relative z-10">
              <div>
                <span className="text-[8px] bg-accent/20 text-accent font-bold tracking-widest px-2.5 py-1 border border-accent/35 rounded-full uppercase w-fit block">BEAUTY & CULTURA</span>
                <h3 className="font-heading text-2xl font-light text-white mt-6">Más que belleza, una conexión.</h3>
                <p className="text-xs text-gray-400 mt-3 leading-relaxed">
                  Sumérgete en la cultura coreana y descubre el origen de tu rutina de belleza.
                </p>
              </div>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/5 hover:border-accent/40 font-bold text-[9px] px-6 py-4.5 rounded-full uppercase tracking-wider w-fit mt-6 transition-all hover:-translate-y-0.5 duration-300">
                VER EXPERIENCIAS
              </Button>
            </div>
            <div className="w-full md:w-[45%] h-[200px] md:h-auto relative shrink-0 border-t md:border-t-0 md:border-l border-white/5">
              <Image src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=400" fill unoptimized alt="Culture background" className="object-cover group-hover:scale-102 transition-transform duration-500" />
            </div>
          </div>
        </div>
      </section>

      {/* Rutinas por Necesidad Box Grid matching reference */}
      <section className="py-24 lg:py-28 border-t border-white/5 bg-[#040815] w-full">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex justify-between items-end mb-16">
            <div className="text-left">
              <span className="text-[10px] text-accent uppercase font-bold tracking-[0.2em] block mb-2">Tratamientos Específicos</span>
              <h2 className="font-heading text-3xl font-light text-white uppercase tracking-wide">Rutinas para cada necesidad</h2>
              <p className="text-xs text-gray-400 mt-2 font-light">Encuentra la rutina ideal para tu tipo de piel y estilo de vida.</p>
            </div>
            <Link href="/rutinas" className="text-xs font-bold text-accent hover:underline uppercase tracking-[0.15em] shrink-0 pb-1 hidden sm:block">
              VER TODAS LAS RUTINAS →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-6">
            {[
              { name: 'Piel Hidratada', icon: Droplet },
              { name: 'Piel Iluminada', icon: Sparkles },
              { name: 'Piel Sensible', icon: Smile },
              { name: 'Anti-acné', icon: ShieldCheck },
              { name: 'Anti-edad', icon: Hourglass },
              { name: 'Rutina Completa', icon: ClipboardList }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="border border-white/10 bg-card/45 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 hover:border-accent/40 transition-all text-center shadow-lg">
                  <span className="p-3 bg-white/5 rounded-full text-accent border border-white/10">
                    <Icon strokeWidth={1.8} className="h-5 w-5" />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300 mt-1">{item.name}</span>
                </div>
              );
            })}
          </div>

          {/* Floating Badges Bar at the bottom of routines */}
          <div className="w-full bg-[#0b1329] border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8 grid grid-cols-2 md:grid-cols-5 gap-6 text-xs text-muted-foreground shadow-2xl mt-16">
            {[
              { icon: ShieldCheck, title: 'Ingredientes seguros' },
              { icon: Droplet, title: 'Fórmulas efectivas' },
              { icon: Star, title: 'Resultados reales' },
              { icon: Compass, title: 'Inspirado en la tradición' },
              { icon: Smile, title: 'Desarrollado con ciencia' }
            ].map((badge, idx) => {
              const Icon = badge.icon;
              return (
                <div key={idx} className="flex items-center gap-3 justify-center">
                  <span className="p-2 bg-white/5 rounded-full text-accent border border-white/10">
                    <Icon strokeWidth={1.8} className="h-4 w-4" />
                  </span>
                  <span className="font-bold text-white text-[9.5px] uppercase tracking-wider text-center">{badge.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Instagram Feed (Únete a nuestra comunidad) */}
      <section className="py-24 lg:py-28 max-w-7xl mx-auto px-4 md:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-center mb-10">
          <div className="flex flex-col items-start gap-4">
            <h2 className="font-heading text-3xl font-light text-white uppercase leading-tight">Únete a nuestra comunidad</h2>
            <p className="text-xs text-gray-400 font-light leading-relaxed">
              Tips, rutinas, lansamientos y mucho más en Instagram.
            </p>
            <Button variant="outline" className="border-white/10 hover:bg-white/5 text-white font-bold text-[10px] px-8 py-5 rounded-full uppercase tracking-wider transition-all hover:-translate-y-0.5 duration-300">
              SEGUIR EN INSTAGRAM
            </Button>
          </div>

          <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=400',
              'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=400',
              'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=400',
              'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=400',
              'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=400'
            ].map((url, idx) => (
              <div key={idx} className="relative aspect-square rounded-3xl overflow-hidden border border-white/10 group shadow-lg">
                <Image src={url} alt={`Instagram ${idx}`} fill unoptimized className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/10" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Floating Card Newsletter matching reference exactly */}
      <section className="py-24 bg-background w-full">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="relative bg-[#0b1329] border border-white/10 rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-md">
              <span className="text-[8px] font-bold text-accent uppercase tracking-widest">YEDAM CLUB</span>
              <h2 className="font-heading text-3xl font-light text-accent uppercase tracking-wide mt-2">Sé la primera en descubrir nuevos lanzamientos y ofertas.</h2>
            </div>

            <div className="w-full max-w-md">
              {newsletterSubscribed ? (
                <div className="text-accent font-bold text-xs bg-accent/10 border border-accent/30 p-4 rounded-xl text-center">
                  ✓ ¡Te has suscrito con éxito!
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setNewsletterSubscribed(true);
                  }}
                  className="flex gap-3"
                >
                  <Input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={e => setNewsletterEmail(e.target.value)}
                    placeholder="Tu E-mail"
                    className="bg-black/50 border-white/10 rounded-full text-white placeholder-gray-500 text-xs h-11 px-6"
                  />
                  <Button type="submit" className="bg-accent hover:bg-accentHover text-background rounded-full font-bold px-8 h-11 text-xs shrink-0 transition-all hover:scale-105">
                    SUBSCRIBIRSE
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
