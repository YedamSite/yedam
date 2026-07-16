'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package, MapPin, Heart, User, Clock, Check, Truck, CreditCard, ExternalLink, FileText, Sparkles, Info
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { db } from '@/lib/db';
import { toggleFavoriteAction } from '@/actions/shopActions';
import { authService } from '@/lib/supabaseAuth';
import { useLanguage } from '@/context/LanguageContext';

export default function ClienteDashboard() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('pedidos');
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Data States
  const [orders, setOrders] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [profileForm, setProfileForm] = useState({ name: 'Jaque Customer', email: 'cliente@example.com' });
  const [profileSaved, setProfileSaved] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);

  const handleCancelSub = () => {
    const updated = { ...subscription, status: 'cancelled' };
    setSubscription(updated);
    localStorage.setItem('cheotnun_sub', JSON.stringify(updated));
    const user = authService.getCurrentUser();
    if (user) {
      const existing = db.get('subscriptions') || [];
      const idx = existing.findIndex((s: any) => s.user_id === user.id && s.status === 'active');
      if (idx >= 0) {
        existing[idx] = { ...existing[idx], status: 'cancelled', updated_at: new Date().toISOString() };
        db.save('subscriptions', [...existing]);
      }
    }
  };

  const handleReactivateSub = async () => {
    if (!subscription) return;
    const user = authService.getCurrentUser();
    if (!user) return;
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'subscription',
          planName: subscription.plan,
          planPrice: subscription.price,
          customerEmail: user.email,
          customerName: user.name || 'Cheotnun Member',
          customerId: user.id,
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else if (data.error) alert(t('Error') + ': ' + data.error);
    } catch (e) {
      console.error('Reactivate subscription error:', e);
      alert(t('Error al reactivar la suscripción. Intenta de nuevo.'));
    }
  };

  const handleSubscribe = async (planName: string, price: number) => {
    const user = authService.getCurrentUser();
    if (!user) { alert(t('Debes iniciar sesión para suscribirte.')); return; }
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'subscription',
          planName,
          planPrice: price,
          customerEmail: user.email,
          customerName: user.name || 'Cheotnun Member',
          customerId: user.id,
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else if (data.error) alert(t('Error') + ': ' + data.error);
    } catch (e) {
      console.error('Subscription checkout error:', e);
      alert(t('Error al procesar la suscripción. Intenta de nuevo.'));
    }
  };

  const loadData = useCallback(async () => {
    const user = authService.getCurrentUser();
    const userId = user ? user.id : 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
    const userEmail = user ? user.email : 'cliente@example.com';

    // Try to load orders and subscriptions from Supabase first, then merge with localStorage
    try {
      await db.reloadFromSupabase(['orders', 'subscriptions']);
    } catch (e) {
      console.error('Failed to reload from Supabase:', e);
    }

    // Load orders
    const allOrders = db.get('orders') || [];
    const userOrders = allOrders.filter((o: any) => o.customer_id === userId);
    setOrders(userOrders);

    // Load addresses
    const allAddresses = db.get('addresses') || [];
    const userAddrs = allAddresses.filter((a: any) => a.user_id === userId);
    setAddresses(userAddrs);

    // Load favorites products from localStorage
    let userFavIds: string[] = [];
    if (typeof window !== 'undefined') {
      const savedFavs = localStorage.getItem('cheotnun_favorites');
      userFavIds = savedFavs ? JSON.parse(savedFavs) : [];
    }
    const products = db.get('products') || [];
    const userFavProducts = products.filter((p: any) => userFavIds.includes(p.id));
    setFavorites(userFavProducts);


    // Load email logs
    const allLogs = db.get('communication_logs') || [];
    setLogs(allLogs.filter((l: any) => l.recipient === userEmail));

    // Load subscription from Supabase first, fallback to localStorage
    const allSubs = db.get('subscriptions') || [];
    const userSub = allSubs.find((s: any) => s.user_id === userId && s.status === 'active');
    if (userSub) {
      setSubscription({
        plan: userSub.plan_name,
        price: userSub.price,
        status: userSub.status,
        next_billing: userSub.next_billing,
        history: userSub.history || [],
      });
    } else if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cheotnun_sub');
      setSubscription(saved ? JSON.parse(saved) : null);
    }
  }, []);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    if (user) {
      setProfileForm({ name: user.name, email: user.email });
    }
    loadData();

    // Real-time polling: sync from Supabase and re-read orders every 5 seconds
    const interval = setInterval(async () => {
      await db.reloadFromSupabase(['orders', 'subscriptions']);
      const userId = user ? user.id : 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
      const allOrders = db.get('orders') || [];
      const userOrders = allOrders.filter((o: any) => o.customer_id === userId);
      setOrders(userOrders);
      const allSubs = db.get('subscriptions') || [];
      const userSub = allSubs.find((s: any) => s.user_id === userId && s.status === 'active');
      if (userSub) {
        setSubscription({
          plan: userSub.plan_name,
          price: userSub.price,
          status: userSub.status,
          next_billing: userSub.next_billing,
          history: userSub.history || [],
        });
      }
    }, 5000);

    // Handle URL params
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get('tab');
      if (tab === 'favorites') {
        setActiveTab('favorites');
      }
      // Subscription success after Stripe Checkout
      if (urlParams.get('subscription') === 'success') {
        setActiveTab('suscripciones');
        const plan = urlParams.get('plan') || 'Premium Box';
        const price = parseFloat(urlParams.get('price') || '29.90');
        const nextDate = new Date();
        nextDate.setMonth(nextDate.getMonth() + 1);
        const newSub = {
          plan,
          price,
          status: 'active',
          next_billing: nextDate.toISOString().split('T')[0],
          history: [
            { date: new Date().toISOString().split('T')[0], amount: price, status: 'paid' }
          ]
        };
        setSubscription(newSub);
        localStorage.setItem('cheotnun_sub', JSON.stringify(newSub));
        // Reload from Supabase (webhook should have saved it already)
        db.reloadFromSupabase(['subscriptions']).catch(() => {});
        window.history.replaceState({}, '', '/dashboard/cliente');
      }
    }

    return () => clearInterval(interval);
  }, []);

  const handleRemoveFavorite = async (productId: string) => {
    const userId = currentUser ? currentUser.id : 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
    const res = await toggleFavoriteAction(userId, productId);
    if (res.success) {
      // Sync local storage
      const saved = localStorage.getItem('cheotnun_favorites');
      const parsed = saved ? JSON.parse(saved) : [];
      const updated = parsed.filter((id: string) => id !== productId);
      localStorage.setItem('cheotnun_favorites', JSON.stringify(updated));
      loadData();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full py-12 px-4 md:px-8">
        {/* User profile brief header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-white/10 pb-6 mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full border-2 border-accent bg-[#030712] flex items-center justify-center text-accent text-lg font-light uppercase tracking-wider font-heading">
              {currentUser?.name ? currentUser.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2) : <User className="h-7 w-7" />}
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-accent">{t('Área del Cliente')}</span>
              <h1 className="font-heading text-3xl font-light text-white uppercase tracking-wider">
                {t('Hola,')} {currentUser?.name || t('Cliente')}
              </h1>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <div className="flex flex-col gap-1 border border-white/5 rounded-3xl p-4 bg-card shadow-xl h-fit">
            {[
              { id: 'pedidos', label: t('Mis Pedidos'), icon: Package },
              { id: 'favorites', label: t('Mis Favoritos'), icon: Heart },
              { id: 'suscripciones', label: t('Club Cheotnun'), icon: Sparkles },
              { id: 'addresses', label: t('Direcciones'), icon: MapPin },
              { id: 'emails', label: t('Comunicaciones'), icon: Clock },
              { id: 'perfil', label: t('Mi Perfil'), icon: User }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-xs uppercase tracking-wider font-bold rounded-2xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-accent text-background shadow-lg shadow-accent/15'
                      : 'hover:bg-white/5 text-foreground/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Main Area */}
          <div className="lg:col-span-3 min-h-[500px]">
            {/* TAB: MIS PEDIDOS */}
            {activeTab === 'pedidos' && (
              <div className="flex flex-col gap-6">
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <div key={order.id} className="bg-card border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col gap-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/5 pb-4 gap-3">
                        <div>
                          <span className="text-[10px] text-accent font-bold uppercase tracking-wider">{t('Pedido')} #{order.id.substring(0, 8)}</span>
                          <span className="text-[10px] text-muted-foreground block mt-0.5">{t('Fecha')}: {new Date(order.created_at).toLocaleDateString('es-ES')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-bold px-3 py-1 rounded-full uppercase border ${
                            order.status === 'entregue' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            order.status === 'enviado' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                            order.status === 'preparando_envio' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            order.status === 'cancelado' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            'bg-accent/10 text-accent border-accent/20'
                          }`}>
                            {({
                              'aguardando_confirmacao': 'Aguardando Confirmação',
                              'preparando_envio': 'Preparando Envío',
                              'enviado': 'Enviado',
                              'entregue': 'Entregue',
                              'cancelado': 'Cancelado'
                            } as Record<string, string>)[order.status] || order.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Items brief */}
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{t('Detalle del Envío')}:</span>
                          <span className="text-white font-bold">{order.shipping_address.street}, {order.shipping_address.city}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{t('Método de Pago')}:</span>
                          <span className="text-white font-bold uppercase">{order.gateway}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{t('Identificación Fiscal')}:</span>
                          <span className="text-white font-bold uppercase">{order.document_type}: {order.document_number}</span>
                        </div>
                      </div>

                      {/* 48h notice for awaiting confirmation */}
                      {order.status === 'aguardando_confirmacao' && (
                        <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 flex items-start gap-3">
                          <Info className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                          <div className="text-[10px] text-foreground/80 leading-relaxed">
                            <span className="font-bold text-accent">{t('Aguardando Confirmação da Loja')}</span>
                            <p className="mt-1">{t('Seu pedido foi recebido e o pagamento foi confirmado. Agora estamos dentro do prazo operacional de até 48 horas úteis (até 72 horas em feriados coreanos) para separar, preparar e enviar seu produto. Você receberá uma notificação assim que o pedido estiver sendo preparado para envio.')}</p>
                          </div>
                        </div>
                      )}

                      {/* Carrier/tracking info */}
                      {(order.carrier || order.tracking_code) && (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
                          <Truck className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                          <div className="text-[10px] text-foreground/80 leading-relaxed">
                            <span className="font-bold text-blue-400">{t('Información de Envío')}</span>
                            {order.carrier && <p className="mt-1">{t('Transportadora')}: {order.carrier}</p>}
                            {order.tracking_code && <p className="mt-1">{t('Código de Rastreo')}: <span className="font-mono font-bold text-white">{order.tracking_code}</span></p>}
                          </div>
                        </div>
                      )}

                      {/* Order tracking timeline visual */}
                      <div className="border-t border-white/5 pt-4">
                        <h4 className="text-[10px] font-bold text-accent uppercase tracking-wider mb-4">{t('Estado del Envío')}</h4>
                        {(() => {
                          const getStatusStep = (status: string) => {
                            switch (status) {
                              case 'aguardando_confirmacao': return 1;
                              case 'preparando_envio': return 2;
                              case 'enviado': return 3;
                              case 'entregue': return 4;
                              case 'cancelado': return 0;
                              default: return 1;
                            }
                          };
                          const currentStep = getStatusStep(order.status);
                          const isCanceled = order.status === 'cancelado';
                          if (isCanceled) {
                            return (
                              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                                <span className="text-[9px] font-bold text-red-400 uppercase">{t('Pedido Cancelado')}</span>
                              </div>
                            );
                          }
                          return (
                            <div className="grid grid-cols-4 gap-2 text-center text-[9px] font-bold uppercase text-muted-foreground">
                              <div className={`flex flex-col items-center gap-1 ${currentStep >= 1 ? 'text-green-400' : ''}`}>
                                <span className={`p-1 rounded-full ${currentStep >= 1 ? 'bg-green-500 text-white' : 'bg-white/5 text-muted-foreground'}`}>
                                  <Clock className="h-3 w-3" />
                                </span>
                                <span>{t('Confirmación')}</span>
                              </div>
                              <div className={`flex flex-col items-center gap-1 ${currentStep >= 2 ? 'text-green-400' : ''}`}>
                                <span className={`p-1 rounded-full ${currentStep >= 2 ? 'bg-green-500 text-white' : 'bg-white/5 text-muted-foreground'}`}>
                                  <Package className="h-3 w-3" />
                                </span>
                                <span>{t('Preparación')}</span>
                              </div>
                              <div className={`flex flex-col items-center gap-1 ${currentStep >= 3 ? 'text-green-400' : ''}`}>
                                <span className={`p-1 rounded-full ${currentStep >= 3 ? 'bg-green-500 text-white' : 'bg-white/5 text-muted-foreground'}`}>
                                  <Truck className="h-3 w-3" />
                                </span>
                                <span>{t('Enviado')}</span>
                              </div>
                              <div className={`flex flex-col items-center gap-1 ${currentStep >= 4 ? 'text-green-400' : ''}`}>
                                <span className={`p-1 rounded-full ${currentStep >= 4 ? 'bg-green-500 text-white' : 'bg-white/5 text-muted-foreground'}`}>
                                  <Check className="h-3 w-3" />
                                </span>
                                <span>{t('Entregado')}</span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Invoice link */}
                      <div className="flex items-center justify-between border-t border-white/5 pt-4">
                        <a href={order.commercial_invoice_url} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-accent hover:underline flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {t('VER COMMERCIAL INVOICE')}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                        <span className="text-sm font-bold text-white font-heading">{t('Total')}: US$ {order.total_amount.toFixed(2)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="border border-dashed border-white/10 rounded-3xl p-12 text-center text-xs text-muted-foreground bg-card">
                    {t('No has realizado ninguna compra todavía.')}
                  </div>
                )}
              </div>
            )}

            {/* TAB: FAVORITOS */}
            {activeTab === 'favorites' && (
              <div className="bg-card border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
                <h2 className="font-heading text-2xl font-light text-white border-b border-white/5 pb-4 mb-6">{t('Mis Favoritos')}</h2>
                
                {favorites.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {favorites.map((prod) => {
                      const imgUrl = prod.id === '11ebc999-9c0b-4ef8-bb6d-6bb9bd380a11' ? 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=400' :
                                     prod.id === '22ebc999-9c0b-4ef8-bb6d-6bb9bd380a22' ? 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400' :
                                     prod.id === '33ebc999-9c0b-4ef8-bb6d-6bb9bd380a33' ? 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=400' :
                                     prod.id === '44ebc999-9c0b-4ef8-bb6d-6bb9bd380a44' ? 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=400' :
                                     'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=400';

                      return (
                        <div key={prod.id} className="bg-secondary/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between group">
                          <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3">
                            <Image src={imgUrl} alt={prod.name} fill unoptimized className="object-cover" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white line-clamp-1">{prod.name}</h4>
                            <span className="text-xs font-bold text-accent block mt-1 font-heading">US$ {prod.price.toFixed(2)}</span>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Link href={`/tienda/produto/${prod.slug}`} className="flex-1">
                              <Button size="sm" variant="outline" className="w-full text-[10px] border-white/10 text-white h-8">{t('VER')}</Button>
                            </Link>
                            <Button size="sm" onClick={() => handleRemoveFavorite(prod.id)} className="bg-red-500 hover:bg-red-600 text-white h-8">
                              {t('Remover')}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-xs text-muted-foreground py-8">
                    {t('Tu lista de deseos está vacía.')}
                  </div>
                )}
              </div>
            )}

            {/* TAB: SUSCRIPCIONES (CLUB CHEOTNUN) */}
            {activeTab === 'suscripciones' && (
              <div className="bg-card border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col gap-6">
                <div>
                  <span className="text-[10px] text-accent uppercase font-bold tracking-widest block">{t('Membresía VIP')}</span>
                  <h2 className="font-heading text-2xl font-light text-white uppercase mt-1">{t('Club Cheotnun K-Beauty')}</h2>
                </div>

                {subscription ? (
                  <div className="flex flex-col gap-6">
                    <div className="border border-white/5 rounded-2xl p-5 bg-secondary/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-white uppercase">{subscription.plan}</h4>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {t('Facturación mensual de')} US$ {subscription.price.toFixed(2)} • {t('Próximo cobro')}: {subscription.next_billing}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[9px] font-bold px-3 py-1 rounded-full uppercase border ${
                          subscription.status === 'active'
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {subscription.status === 'active' ? t('Activa') : t('Cancelada')}
                        </span>
                        {subscription.status === 'active' ? (
                          <Button onClick={handleCancelSub} size="sm" className="bg-red-500 hover:bg-red-600 text-white text-[10px] h-7 px-3 rounded-lg">
                            {t('Cancelar')}
                          </Button>
                        ) : (
                          <Button onClick={handleReactivateSub} size="sm" className="bg-accent hover:bg-accentHover text-background font-bold text-[10px] h-7 px-3 rounded-lg">
                            {t('Reactivar')}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Benefits of Club Cheotnun */}
                    <div className="border border-white/5 rounded-2xl p-5 bg-secondary/20 flex flex-col gap-3">
                      <span className="text-[9px] text-accent font-bold uppercase tracking-wider">{t('Beneficios Incluidos')}</span>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground leading-normal">
                        <li>{t('✓ Box mensual con lo último en cosmética coreana')}</li>
                        <li>{t('✓ Envíos 100% gratuitos en todos tus pedidos')}</li>
                        <li>{t('✓ 15% de descuento adicional en toda la tienda')}</li>
                        <li>{t('✓ Acceso prioritario a lanzamientos y novedades')}</li>
                      </ul>
                    </div>

                    {/* Billing history */}
                    <div>
                      <span className="text-[9px] text-accent font-bold uppercase tracking-wider block mb-3">{t('Historial de Pagos')}</span>
                      <div className="border border-white/5 rounded-2xl overflow-hidden bg-secondary/10 text-xs">
                        <div className="grid grid-cols-3 p-3 bg-secondary/30 font-bold border-b border-white/5">
                          <span>{t('Fecha')}</span>
                          <span>{t('Monto')}</span>
                          <span className="text-right">{t('Estado')}</span>
                        </div>
                        {subscription.history.map((h: any, idx: number) => (
                          <div key={idx} className="grid grid-cols-3 p-3 border-b border-white/5 last:border-0">
                            <span>{h.date}</span>
                            <span>US$ {h.amount.toFixed(2)}</span>
                            <span className="text-right text-green-400 font-semibold uppercase">{h.status === 'paid' ? t('Aprobado') : t('Pendiente')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-8">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {t('Únete al **Club Cheotnun** para recibir mensualmente una box seleccionada de productos coreanos auténticos, además de acceder a beneficios, cupones y muestras exclusivas.')}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        { name: t('Box Standard'), price: 19.90, desc: t('3 productos coreanos esenciales para el cuidado facial diario.') },
                        { name: t('Box Premium'), price: 29.90, desc: t('5 productos premium de alta gama y muestras exclusivas.') },
                        { name: t('Box Deluxe'), price: 39.90, desc: t('7 productos deluxe, accesorios de ritual y regalos VIP.') }
                      ].map((plan) => (
                        <div key={plan.name} className="border border-white/5 bg-secondary/30 rounded-2xl p-5 flex flex-col justify-between gap-4">
                          <div>
                            <h4 className="text-xs font-bold text-white uppercase">{plan.name}</h4>
                            <span className="font-heading text-xl font-bold text-accent block mt-1">US$ {plan.price.toFixed(2)}<span className="text-[9px] text-muted-foreground font-sans">{t('/mes')}</span></span>
                            <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">{plan.desc}</p>
                          </div>
                          <Button onClick={() => handleSubscribe(plan.name, plan.price)} className="w-full bg-accent hover:bg-accentHover text-background font-bold text-[10px] py-2 rounded-lg">
                            {t('SUSCRIBIRSE')}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: DIRECCIONES */}
            {activeTab === 'addresses' && (
              <div className="bg-card border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
                <h2 className="font-heading text-2xl font-light text-white border-b border-white/5 pb-4 mb-6">{t('Mis Direcciones')}</h2>
                
                <div className="flex flex-col gap-3">
                  {addresses.map((addr) => (
                    <div key={addr.id} className="border border-white/5 rounded-2xl p-5 bg-secondary/30 flex items-start gap-4">
                      <MapPin className="h-5 w-5 text-accent mt-0.5" />
                      <div className="text-xs text-muted-foreground leading-relaxed">
                        <h4 className="font-bold text-white text-sm">{addr.first_name} {addr.last_name}</h4>
                        <p className="mt-1">{addr.street}, #{addr.number} ({addr.complement})</p>
                        <p>{addr.postal_code} - {addr.city}, {addr.country}</p>
                        <p className="mt-1 text-accent font-semibold">{addr.document_type.toUpperCase()}: {addr.document_number}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: EMAILS / COMMS */}
            {activeTab === 'emails' && (
              <div className="bg-card border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
                <h2 className="font-heading text-2xl font-light text-white border-b border-white/5 pb-4 mb-6">{t('Comunicaciones Enviadas')}</h2>
                
                <div className="flex flex-col gap-4">
                  {logs.map((log) => (
                    <div key={log.id} className="border border-white/5 rounded-2xl p-4 bg-secondary/30 text-xs">
                      <div className="flex justify-between items-center text-[10px] text-accent font-bold uppercase tracking-wider mb-2">
                        <span>{t('Canal')}: {log.type}</span>
                        <span>{new Date(log.created_at).toLocaleString('es-ES')}</span>
                      </div>
                      <h4 className="font-bold text-white mb-1">{log.subject}</h4>
                      <p className="text-muted-foreground">{log.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: PERFIL */}
            {activeTab === 'perfil' && (
              <div className="bg-card border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
                <h2 className="font-heading text-2xl font-light text-white border-b border-white/5 pb-4 mb-6">{t('Datos Personales')}</h2>
                {profileSaved && (
                  <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-xl p-3.5 mb-6">
                    ✓ {t('Datos guardados con éxito.')}
                  </div>
                )}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setProfileSaved(true);
                    setTimeout(() => setProfileSaved(false), 3000);
                  }}
                  className="flex flex-col gap-4 max-w-md text-xs text-muted-foreground"
                >
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-white">{t('Nombre Completo')}</label>
                    <Input value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} required />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-white">{t('E-mail')}</label>
                    <Input type="email" value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} required />
                  </div>
                  <Button type="submit" className="bg-accent hover:bg-accentHover text-background font-bold py-2.5 rounded-xl mt-2 text-xs">
                    {t('GUARDAR CAMBIOS')}
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
