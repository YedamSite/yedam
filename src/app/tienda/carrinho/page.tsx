'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, ShieldCheck, Check, Trash2, FileText, CreditCard } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { submitOrderAction } from '@/actions/shopActions';
import { authService } from '@/lib/supabaseAuth';
import AuthModal from '@/components/AuthModal';
import { db } from '@/lib/db';
import { useLanguage } from '@/context/LanguageContext';

export default function CheckoutWizard() {
  const { t, locale } = useLanguage();
  const [step, setStep] = useState(1);
  const [cartItems, setCartItems] = useState<any[]>([]);

  // Form states
  const [country, setCountry] = useState('Brasil');
  const [docType, setDocType] = useState('nif');
  const [docNumber, setDocNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [phone, setPhone] = useState('');
  const [stripeLoading, setStripeLoading] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  // Auth state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Success state
  const [orderSuccess, setOrderSuccess] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Sync document type requirements when country changes
  useEffect(() => {
    if (country === 'España') setDocType('nif');
    else if (country === 'Uruguay') setDocType('rut');
    else if (country === 'Paraguay') setDocType('ruc');
  }, [country]);

  // Load cart from localStorage on mount and enrich with actual product images
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cart = localStorage.getItem('cheotnun_cart');
      const parsed = cart ? JSON.parse(cart) : [];
      const allProds = (db.get('products') as any[]) || [];
      const prodMap = new Map(allProds.map((p: any) => [p.id, p]));
      const enriched = parsed.map((item: any) => {
        const matchingProd: any = prodMap.get(item.product_id);
        const actualImage = item.image && item.image !== '/products/dokdo-cleanser.jpg'
          ? item.image
          : matchingProd?.image || 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=200';
        return {
          ...item,
          image: actualImage
        };
      });
      setCartItems(enriched);
      localStorage.setItem('cheotnun_cart', JSON.stringify(enriched));
    }
  }, []);

  const handleUpdateQty = (prodId: string, diff: number) => {
    const updated = cartItems.map(item => {
      if (item.product_id === prodId) {
        const newQty = Math.max(1, item.quantity + diff);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    setCartItems(updated);
    localStorage.setItem('cheotnun_cart', JSON.stringify(updated));
  };

  const handleRemoveItem = (prodId: string) => {
    const filtered = cartItems.filter(item => item.product_id !== prodId);
    setCartItems(filtered);
    localStorage.setItem('cheotnun_cart', JSON.stringify(filtered));
  };

  // Apply Coupon "CUPOM10"
  const getPrice = (item: any) => locale === 'pt' ? (item.price_brl || item.price * 5) : item.price;
  const currency = locale === 'pt' ? 'R$' : 'US$';
  const rate = locale === 'pt' ? 5 : 1;

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'CUPOM10') {
      setDiscount(10 * rate);
      setCouponApplied(true);
    }
  };

  const subtotal = cartItems.reduce((acc, curr) => acc + (getPrice(curr) * curr.quantity), 0);
  const shipping = locale === 'pt' ? 75.00 : 15.00;
  const total = Math.max(0, subtotal + shipping - discount);

  // Check for Stripe success/cancel redirect on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const orderId = params.get('order_id');
      
      if (params.get('success') === 'true') {
        setStep(4);
        if (orderId) {
          setOrderSuccess({ id: orderId });
          localStorage.removeItem('cheotnun_cart');
          setCartItems([]);
        }
        window.history.replaceState({}, '', '/tienda/carrinho');
      } else if (params.get('canceled') === 'true') {
        if (orderId) {
          // Restore stock and mark as cancelled
          import('@/actions/shopActions').then(mod => {
            mod.cancelOrderAction(orderId).then(res => {
              if (res.success) {
                console.log('Order cancelled and stock restored:', orderId);
              }
            });
          });
        }
        window.history.replaceState({}, '', '/tienda/carrinho');
      }
    }
  }, []);

  const handleCheckoutSubmit = async () => {
    if (!firstName || !lastName || !street || !city || !zipCode || !docNumber) return;
    setLoading(true);

    const address = {
      first_name: firstName,
      last_name: lastName,
      street,
      number: 'S/N',
      complement: '',
      city,
      state: country,
      postal_code: zipCode,
      country,
      phone
    };

    const customerId = currentUser ? currentUser.id : 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
    const customerEmail = currentUser ? currentUser.email : 'cliente@example.com';

    // 1. Create the order in local DB + Supabase
    const res = await submitOrderAction({
      customerId,
      items: cartItems,
      shippingAddress: address,
      billingAddress: address,
      documentType: docType as any,
      documentNumber: docNumber,
      gateway: 'stripe'
    });

    if (!res.success || !res.order) {
      setLoading(false);
      return;
    }

    // 2. Save order locally for dashboard
    try {
      const raw = localStorage.getItem('cheotnun_db_state');
      const state = raw ? JSON.parse(raw) : {};
      if (!state.orders) state.orders = [];
      const exists = state.orders.some((o: any) => o.id === res.order!.id);
      if (!exists) {
        state.orders.push(res.order!);
        localStorage.setItem('cheotnun_db_state', JSON.stringify(state));
      }
    } catch {}

    // 3. Create Stripe Checkout Session and redirect
    try {
      setStripeLoading(true);
      const checkoutRes = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: res.order.id,
          customerEmail,
          customerName: `${firstName} ${lastName}`,
          totalAmount: total,
          items: cartItems,
          locale,
        }),
      });

      const data = await checkoutRes.json();
      if (data.url) {
        localStorage.removeItem('cheotnun_cart');
        setCartItems([]);
        window.location.href = data.url;
      } else {
        console.error('Stripe checkout failed:', data.error);
        setLoading(false);
        setStripeLoading(false);
      }
    } catch (error) {
      console.error('Stripe checkout error:', error);
      setLoading(false);
      setStripeLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1 py-12 px-4 md:px-8 max-w-5xl mx-auto w-full">
        {/* Wizard Steps indicator */}
        <div className="flex justify-between items-center max-w-lg mx-auto mb-10 text-[9px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
          <span className={step >= 1 ? 'text-accent' : ''}>{t('1. Carrito')}</span>
          <span>→</span>
          <span className={step >= 2 ? 'text-accent' : ''}>{t('2. Identificación')}</span>
          <span>→</span>
          <span className={step >= 3 ? 'text-accent' : ''}>{t('3. Pago')}</span>
          <span>→</span>
          <span className={step >= 4 ? 'text-accent' : ''}>{t('4. Confirmación')}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* STEP 1: CART ITEMS */}
          {step === 1 && (
            <div className="lg:col-span-2 bg-card border border-white/5 rounded-3xl p-6 shadow-xl">
              <h2 className="font-heading text-2xl font-light text-white mb-6">{t('Carrito de Compras')}</h2>
              
              {cartItems.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {cartItems.map((item) => (
                    <div key={item.product_id} className="border border-white/5 rounded-2xl p-4 bg-secondary/30 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-secondary">
                          <Image src={item.image || 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=200'} alt={item.name} fill unoptimized className="object-cover" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white max-w-[150px] sm:max-w-xs truncate">{item.name}</h4>
                          <span className="text-[10px] text-accent font-semibold font-heading">{currency} {getPrice(item).toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-white/10 rounded-lg px-2 bg-black/40 h-8">
                          <button onClick={() => handleUpdateQty(item.product_id, -1)} className="text-xs text-muted-foreground px-1.5 hover:text-white">-</button>
                          <span className="text-xs text-white px-2 font-mono">{item.quantity}</span>
                          <button onClick={() => handleUpdateQty(item.product_id, 1)} className="text-xs text-muted-foreground px-1.5 hover:text-white">+</button>
                        </div>
                        <button onClick={() => handleRemoveItem(item.product_id)} className="text-red-500 hover:text-red-400 p-2">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Coupon entry */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                    <Input
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value)}
                      placeholder={t('Cupón de descuento (CUPOM10)')}
                      className="bg-black/30 border-white/10 text-white rounded-xl text-xs flex-1"
                    />
                    <Button onClick={handleApplyCoupon} className="bg-accent hover:bg-accentHover text-background font-bold rounded-xl text-xs px-5">
                      {t('APLICAR')}
                    </Button>
                  </div>
                  {couponApplied && <span className="text-[10px] text-green-500 mt-1 font-semibold">{t('✓ Cupón "CUPOM10" aplicado:')} -{currency} {discount.toFixed(2)}</span>}
                </div>
              ) : (
                <div className="border border-dashed border-white/10 rounded-2xl p-12 text-center text-xs text-muted-foreground">
                  {t('El carrito está vacío.')}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: ADDRESS & DOCUMENT AUTO REQUIREMENTS */}
          {step === 2 && (
            <div className="lg:col-span-2 bg-card border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
              <h2 className="font-heading text-2xl font-light text-white mb-6">{t('Información de Envío')}</h2>
              
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold uppercase text-accent">{t('Nombre')}</label>
                    <Input value={firstName} onChange={e => setFirstName(e.target.value)} required />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold uppercase text-accent">{t('Apellido')}</label>
                    <Input value={lastName} onChange={e => setLastName(e.target.value)} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold uppercase text-accent">{t('País de Destino')}</label>
                    <select
                      value={country}
                      onChange={e => setCountry(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm text-white"
                    >
                      <option value="Brasil">Brasil</option>
                      <option value="México">México</option>
                      <option value="Chile">Chile</option>
                      <option value="Colombia">Colombia</option>
                      <option value="Argentina">Argentina</option>
                      <option value="España">España</option>
                      <option value="Uruguay">Uruguay</option>
                      <option value="Paraguay">Paraguay</option>
                    </select>
                  </div>
                  {/* Dynamic Document input based on country selection */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold uppercase text-accent">
                      {country === 'Brasil' && t('Documento CPF / CNPJ')}
                      {country === 'México' && t('Documento RFC o CURP')}
                      {country === 'Chile' && t('Documento RUT')}
                      {country === 'Colombia' && t('Documento RUT o CC')}
                      {country === 'Argentina' && t('Documento DNI o CUIT')}
                      {country === 'España' && t('Documento NIF / NIE')}
                      {country === 'Uruguay' && t('Documento RUT o CI')}
                      {country === 'Paraguay' && t('Documento RUC o CI')}
                    </label>
                    <Input
                      value={docNumber}
                      onChange={e => setDocNumber(e.target.value)}
                      placeholder={
                        country === 'España' ? t('Ej: 12345678Z') : country === 'Uruguay' ? t('Ej: 1234567-8') : t('Ej: 123456-7')
                      }
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold uppercase text-accent">{t('Calle & Número')}</label>
                    <Input value={street} onChange={e => setStreet(e.target.value)} required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-semibold uppercase text-accent">{t('Ciudad')}</label>
                      <Input value={city} onChange={e => setCity(e.target.value)} required />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-semibold uppercase text-accent">{t('Código Postal')}</label>
                      <Input value={zipCode} onChange={e => setZipCode(e.target.value)} required />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold uppercase text-accent">{t('Teléfono de Contacto')}</label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} required />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: STRIPE PAYMENT */}
          {step === 3 && (
            <div className="lg:col-span-2 bg-card border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
              <h2 className="font-heading text-2xl font-light text-white mb-6">{t('Método de Pago')}</h2>
              
              <div className="flex flex-col gap-4">
                <div className="border border-white/10 rounded-2xl p-6 bg-black/20 flex items-start gap-4">
                  <span className="p-3 bg-accent/10 border border-accent/20 rounded-full text-accent shrink-0">
                    <CreditCard className="h-6 w-6" />
                  </span>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-white uppercase tracking-wider">Stripe</span>
                    <span className="text-[10px] text-muted-foreground">{t('Paga de forma segura con tarjeta de crédito, débito o Apple Pay')}</span>
                    <div className="flex gap-3 mt-2">
                      <ShieldCheck className="h-4 w-4 text-green-400" />
                      <span className="text-[9px] text-green-400 font-semibold">{t('Pago 100% seguro procesado por Stripe')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS CONGRATS */}
          {step === 4 && orderSuccess && (
            <div className="lg:col-span-3 bg-card border border-white/5 rounded-3xl p-8 md:p-12 text-center flex flex-col items-center gap-4 max-w-xl mx-auto shadow-2xl">
              <span className="p-4 bg-green-500/20 border border-green-500/40 rounded-full text-green-400">
                <Check className="h-10 w-10" />
              </span>
              <h2 className="font-heading text-3xl font-light text-white uppercase tracking-wider">{t('¡Gracias por tu compra!')}</h2>
              
              <div className="flex flex-col gap-4 items-center w-full">
                <p className="text-sm text-white leading-relaxed">
                  {t('Hemos recibido tu pedido con el ID')} <strong className="text-accent">#{orderSuccess.id.substring(0, 8)}</strong>.
                </p>
                
                <div className="bg-orange-500/10 border border-orange-500/30 text-orange-200 text-xs p-5 rounded-2xl text-left w-full shadow-inner mt-2">
                  <strong className="block mb-2 text-orange-400 text-sm flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                    </span>
                    {t('Importante: Validación de Pedido (48-72h)')}
                  </strong>
                  <p className="opacity-90">{t('Como operamos con envíos directos desde Corea del Sur hacia Latinoamérica, tu pedido ha entrado en la fase de validación de disponibilidad y documentación de exportación (48-72 horas).')}</p>
                  <p className="opacity-90 mt-2">{t('Una vez confirmado el stock y el pago, emitiremos tu Commercial Invoice final y prepararemos el paquete para envío.')}</p>
                </div>

                <div className="flex flex-col items-center mt-4 p-4 border border-white/5 rounded-2xl w-full bg-black/20">
                  <p className="text-xs text-muted-foreground mb-3">
                    {t('Tu orden ha sido registrada. Puedes descargar la factura proforma (Invoice preliminar) aquí:')}
                  </p>
                  <a href={`/invoices/cheotnun-inv-${orderSuccess.id}.pdf`} target="_blank" rel="noreferrer">
                    <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-black py-2 px-6 rounded-xl text-xs flex gap-2 transition-all">
                      <FileText className="h-4 w-4" />
                      {t('DESCARGAR COMMERCIAL INVOICE')}
                    </Button>
                  </a>
                </div>
              </div>
              
              <div className="h-px bg-white/10 w-full my-4" />

              <div className="flex gap-4">
                <Link href="/dashboard/cliente">
                  <Button className="bg-accent hover:bg-accentHover text-background font-bold py-2.5 px-6 rounded-xl text-xs">
                    {t('IR A MI DASHBOARD')}
                  </Button>
                </Link>
                <Link href="/tienda">
                  <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 py-2.5 px-6 rounded-xl text-xs">
                    {t('SEGUIR COMPRANDO')}
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Checkout Right Summary Column (Always visible, except step 4) */}
          {step !== 4 && (
            <div className="bg-card border border-white/5 rounded-3xl p-6 shadow-xl h-fit flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-accent uppercase tracking-wider border-b border-white/5 pb-3 mb-4">{t('Resumen del Pedido')}</h3>
                
                <div className="flex flex-col gap-2.5 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>{t('Subtotal')}</span>
                    <span>{currency} {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('Envío')}</span>
                    <span>{currency} {shipping.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-500">
                      <span>{t('Descuento (Cupón)')}</span>
                      <span>-{currency} {discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="h-px bg-white/5 my-2" />
                  <div className="flex justify-between text-sm font-bold text-white">
                    <span>{t('Total General')}</span>
                    <span className="text-accent font-heading text-lg">{currency} {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Wizard navigation buttons */}
              <div className="mt-8 flex flex-col gap-3">
                {step === 1 && (
                  <Button
                    onClick={() => {
                      const user = authService.getCurrentUser();
                      if (user) {
                        setCurrentUser(user);
                        setStep(2);
                      } else {
                        setAuthModalOpen(true);
                      }
                    }}
                    disabled={cartItems.length === 0}
                    className="w-full bg-accent hover:bg-accentHover text-background font-bold rounded-xl flex items-center justify-center gap-2"
                  >
                    {t('CONTINUAR AL ENVÍO')}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
                {step === 2 && (
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => setStep(3)}
                      disabled={!firstName || !lastName || !street || !city || !zipCode || !docNumber}
                      className="w-full bg-accent hover:bg-accentHover text-background font-bold rounded-xl flex items-center justify-center gap-2"
                    >
                      {t('CONTINUAR AL PAGO')}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" onClick={() => setStep(1)} className="text-xs text-muted-foreground">
                      {t('Volver al carrito')}
                    </Button>
                  </div>
                )}
                {step === 3 && (
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={handleCheckoutSubmit}
                      disabled={loading || stripeLoading}
                      className="w-full bg-accent hover:bg-accentHover text-background font-bold rounded-xl flex items-center justify-center gap-2"
                    >
                      {loading || stripeLoading ? t('Procesando...') : t('PAGAR CON STRIPE')}
                    </Button>
                    {stripeLoading && (
                      <span className="text-[9px] text-center text-muted-foreground animate-pulse">{t('Redirigiendo a Stripe...')}</span>
                    )}
                    <Button variant="ghost" onClick={() => setStep(2)} className="text-xs text-muted-foreground">
                      {t('Volver al envío')}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setCurrentUser(authService.getCurrentUser());
          setAuthModalOpen(false);
          setStep(2);
        }}
        onEmailVerificationRequired={() => {
          if (typeof window !== 'undefined') {
            window.location.href = '/verify-email';
          }
        }}
      />

      <Footer />
    </div>
  );
}
