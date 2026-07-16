'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, ShieldCheck, Check, Trash2, FileText } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { submitOrderAction } from '@/actions/shopActions';
import { authService } from '@/lib/supabaseAuth';
import { useLanguage } from '@/context/LanguageContext';

export default function CheckoutWizard() {
  const { t } = useLanguage();
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
  const [gateway, setGateway] = useState('stripe');
  const [dlocalSubMethod, setDlocalSubMethod] = useState('card');
  const [cashNetwork, setCashNetwork] = useState('pago_movil');

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  // Auth state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authName, setAuthName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');

  // Success state
  const [orderSuccess, setOrderSuccess] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Sync document type requirements when country changes
  useEffect(() => {
    if (country === 'España') {
      setDocType('nif');
    } else if (country === 'Uruguay') {
      setDocType('rut');
      setCashNetwork('abitab');
    } else if (country === 'Paraguay') {
      setDocType('ruc');
      setCashNetwork('pago_movil');
    }
  }, [country]);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cart = localStorage.getItem('cheotnun_cart');
      setCartItems(cart ? JSON.parse(cart) : []);
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
  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'CUPOM10') {
      setDiscount(10); // 10 USD off
      setCouponApplied(true);
    }
  };

  const subtotal = cartItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  const total = Math.max(0, subtotal + 15.00 - discount); // subtotal + shipping - discount

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

    const res = await submitOrderAction({
      customerId,
      items: cartItems,
      shippingAddress: address,
      billingAddress: address,
      documentType: docType as any,
      documentNumber: docNumber,
      gateway
    });

    setLoading(false);
    if (res.success) {
      setOrderSuccess(res.order);
      localStorage.removeItem('cheotnun_cart');
      setCartItems([]);
      // Salvar pedido no localStorage do cliente para aparecer no dashboard
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
      setStep(5);
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
          <span className={step >= 2 ? 'text-accent' : ''}>{t('2. Cuenta')}</span>
          <span>→</span>
          <span className={step >= 3 ? 'text-accent' : ''}>{t('3. Envío')}</span>
          <span>→</span>
          <span className={step >= 4 ? 'text-accent' : ''}>{t('4. Pago')}</span>
          <span>→</span>
          <span className={step >= 5 ? 'text-accent' : ''}>{t('5. Confirmación')}</span>
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
                          <Image src="https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=200" alt={item.name} fill className="object-cover" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white max-w-[150px] sm:max-w-xs truncate">{item.name}</h4>
                          <span className="text-[10px] text-accent font-semibold font-heading">US$ {item.price.toFixed(2)}</span>
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
                  {couponApplied && <span className="text-[10px] text-green-500 mt-1 font-semibold">{t('✓ Cupón "CUPOM10" aplicado: -US$ 10.00')}</span>}
                </div>
              ) : (
                <div className="border border-dashed border-white/10 rounded-2xl p-12 text-center text-xs text-muted-foreground">
                  {t('El carrito está vacío.')}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: LOGIN / SIGNUP */}
          {step === 2 && (
            <div className="lg:col-span-2 bg-card border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
              <h2 className="font-heading text-2xl font-light text-white mb-6">
                {authMode === 'signup' ? t('Crear tu Cuenta') : t('Iniciar Sesión')}
              </h2>
              {currentUser ? (
                <div className="flex flex-col gap-4">
                  <div className="border border-green-500/30 bg-green-500/10 rounded-2xl p-4 text-center">
                    <p className="text-green-400 text-sm font-bold">{t('✓ Conectado como')} {currentUser.email}</p>
                  </div>
                  <Button onClick={() => setStep(3)} className="w-full bg-accent hover:bg-accentHover text-background font-bold rounded-xl">
                    {t('CONTINUAR AL ENVÍO')}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => { setAuthMode('signup'); setAuthError(''); }}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${authMode === 'signup' ? 'bg-accent text-background' : 'bg-white/5 text-muted-foreground'}`}
                    >
                      {t('Crear Cuenta')}
                    </button>
                    <button
                      onClick={() => { setAuthMode('login'); setAuthError(''); }}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${authMode === 'login' ? 'bg-accent text-background' : 'bg-white/5 text-muted-foreground'}`}
                    >
                      {t('Iniciar Sesión')}
                    </button>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Input
                      value={authEmail}
                      onChange={e => setAuthEmail(e.target.value)}
                      placeholder={t('Tu correo electrónico')}
                      className="bg-black/30 border-white/10 text-white rounded-xl text-sm"
                    />
                    {authMode === 'signup' && (
                      <Input
                        value={authName}
                        onChange={e => setAuthName(e.target.value)}
                        placeholder={t('Tu nombre completo')}
                        className="bg-black/30 border-white/10 text-white rounded-xl text-sm"
                      />
                    )}
                    {authError && <p className="text-red-400 text-xs">{authError}</p>}
                    <Button
                      onClick={async () => {
                        if (!authEmail) { setAuthError(t('Ingresa un correo')); return; }
                        if (authMode === 'signup' && !authName) { setAuthError(t('Ingresa tu nombre')); return; }
                        setAuthLoading(true);
                        setAuthError('');
                        try {
                          if (authMode === 'signup') {
                            await authService.signUp(authEmail, authName);
                          } else {
                            await authService.signIn(authEmail);
                          }
                          setCurrentUser(authService.getCurrentUser());
                        } catch (e: any) {
                          setAuthError(e?.message || t('Error al autenticar'));
                        } finally {
                          setAuthLoading(false);
                        }
                      }}
                      disabled={authLoading}
                      className="w-full bg-accent hover:bg-accentHover text-background font-bold rounded-xl"
                    >
                      {authLoading ? t('Procesando...') : authMode === 'signup' ? t('CREAR CUENTA') : t('INICIAR SESIÓN')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: ADDRESS & DOCUMENT AUTO REQUIREMENTS */}
          {step === 3 && (
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

          {/* STEP 4: PAYMENT GATEWAYS */}
          {step === 4 && (
            <div className="lg:col-span-2 bg-card border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
              <h2 className="font-heading text-2xl font-light text-white mb-6">{t('Método de Pago')}</h2>
              
              <div className="flex flex-col gap-4">
                {[
                  { id: 'stripe', name: t('Stripe Checkout'), desc: t('Tarjetas de crédito, débito internacionales y Apple Pay') },
                  { id: 'paypal', name: t('PayPal Integration'), desc: t('Paga de forma rápida y segura con tu cuenta PayPal') },
                  { id: 'mercadopago', name: t('Mercado Pago LatAm'), desc: t('Tarjetas de crédito locales y transferencias') },
                  { id: 'dlocal', name: t('dLocal Payments'), desc: t('Medios de pago locales para Uruguay, Paraguay y otros') }
                ].map((gatewayOption) => (
                  <div key={gatewayOption.id} className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={() => setGateway(gatewayOption.id)}
                      className={`w-full text-left p-5 border rounded-2xl transition-all flex flex-col ${
                        gateway === gatewayOption.id
                          ? 'border-accent bg-accent/5 text-accent'
                          : 'border-white/10 hover:bg-white/5 text-white'
                      }`}
                    >
                      <span className="text-sm font-bold uppercase tracking-wider">{gatewayOption.name}</span>
                      <span className="text-[10px] text-muted-foreground mt-1">{gatewayOption.desc}</span>
                    </button>
                    
                    {gateway === 'dlocal' && gatewayOption.id === 'dlocal' && (country === 'Paraguay' || country === 'Uruguay') && (
                      <div className="border border-white/10 rounded-2xl p-4 bg-black/20 ml-4 flex flex-col gap-3">
                        <span className="text-[10px] font-bold text-accent uppercase tracking-wider">{t('Selecciona la modalidad dLocal:')}</span>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                            <input
                              type="radio"
                              name="dlocalSub"
                              value="card"
                              checked={dlocalSubMethod === 'card'}
                              onChange={() => setDlocalSubMethod('card')}
                              className="accent-accent"
                            />
                            {t('Tarjeta de Crédito Internacional')}
                          </label>
                          <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                            <input
                              type="radio"
                              name="dlocalSub"
                              value="cash"
                              checked={dlocalSubMethod === 'cash'}
                              onChange={() => setDlocalSubMethod('cash')}
                              className="accent-accent"
                            />
                            {t('Pago en Efectivo (Redes Locales)')}
                          </label>
                        </div>
                        
                        {dlocalSubMethod === 'cash' && (
                          <div className="flex flex-col gap-2 mt-2">
                            <span className="text-[9px] text-muted-foreground uppercase font-bold">{t('Red de Cobranza:')}</span>
                            <select
                              value={cashNetwork}
                              onChange={(e) => setCashNetwork(e.target.value)}
                              className="flex h-9 w-full rounded-md border border-white/10 bg-background px-3 py-1 text-xs text-white"
                            >
                              {country === 'Paraguay' ? (
                                <>
                                  <option value="pago_movil">Pago Móvil</option>
                                  <option value="aqui_pago">Aquí Pago</option>
                                </>
                              ) : (
                                <>
                                  <option value="abitab">Abitab</option>
                                  <option value="redpagos">Redpagos</option>
                                </>
                              )}
                            </select>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: SUCCESS CONGRATS */}
          {step === 5 && orderSuccess && (
            <div className="lg:col-span-3 bg-card border border-white/5 rounded-3xl p-8 md:p-12 text-center flex flex-col items-center gap-4 max-w-xl mx-auto shadow-2xl">
              <span className="p-4 bg-accent/20 border border-accent/40 rounded-full text-accent">
                <Check className="h-10 w-10" />
              </span>
              <h2 className="font-heading text-3xl font-light text-white uppercase tracking-wider">{t('¡Gracias por tu compra!')}</h2>
              
              {gateway === 'dlocal' && dlocalSubMethod === 'cash' ? (
                <div className="w-full flex flex-col gap-4 mt-2">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t('Hemos registrado tu pedido')} **#{orderSuccess.id.substring(0, 8)}**. {t('Para completar el pago, utiliza el siguiente cupón de cobranza local:')}
                  </p>
                  
                  {/* Visual Barcode Voucher Card */}
                  <div className="bg-white text-black font-mono text-left p-6 rounded-2xl border border-gray-200 flex flex-col gap-4 shadow-lg text-xs leading-normal">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-gray-500 block">{t('Red de Cobranza')}</span>
                        <span className="text-sm font-bold uppercase text-accent">
                          {cashNetwork === 'pago_movil' && t('Pago Móvil (Paraguay)')}
                          {cashNetwork === 'aqui_pago' && t('Aquí Pago (Paraguay)')}
                          {cashNetwork === 'abitab' && t('Abitab (Uruguay)')}
                          {cashNetwork === 'redpagos' && t('Redpagos (Uruguay)')}
                        </span>
                      </div>
                      <span className="text-lg font-bold font-heading text-accent">US$ {total.toFixed(2)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-[10px]">
                      <div>
                        <span className="font-bold text-gray-500 uppercase block text-[8px]">{t('Referencia de Pago')}</span>
                        <span className="font-bold text-black select-all">1029-4820-{orderSuccess.id.substring(0, 4).toUpperCase()}</span>
                      </div>
                      <div>
                        <span className="font-bold text-gray-500 uppercase block text-[8px]">{t('Fecha de Vencimiento')}</span>
                        <span className="font-bold text-black">
                          {(() => {
                            const date = new Date();
                            date.setDate(date.getDate() + 3);
                            return date.toLocaleDateString('es-ES');
                          })()}
                        </span>
                      </div>
                    </div>

                    {/* Visual Barcode lines */}
                    <div className="flex flex-col items-center gap-1 bg-gray-50 p-4 rounded-xl border border-gray-200 mt-2">
                      <div className="flex h-12 w-full justify-between items-stretch max-w-xs px-2 bg-white border border-gray-300">
                        {Array.from({ length: 45 }).map((_, idx) => {
                          const isSpace = idx % 3 === 0 || idx % 7 === 0;
                          const thickness = idx % 5 === 0 ? 'w-1.5' : idx % 2 === 0 ? 'w-[1px]' : 'w-0.5';
                          return (
                            <div
                              key={idx}
                              className={`${isSpace ? 'bg-transparent' : 'bg-black'} ${thickness}`}
                            />
                          );
                        })}
                      </div>
                      <span className="text-[9px] tracking-[6px] text-gray-600 font-bold mt-1">10294820{orderSuccess.id.substring(0, 4).toUpperCase()}</span>
                    </div>

                    <div className="text-[8px] text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                      <span className="font-bold block uppercase text-[9px] text-gray-600 mb-1">{t('Instrucciones de pago:')}</span>
                      {t('1. Presenta este cupón impreso o en tu celular en cualquier sucursal de la red seleccionada.')}<br />
                      {t('2. O bien, ingresa a la aplicación de tu banco o billetera digital y digita el número de referencia.')}<br />
                      {t('3. Guarda el recibo. Tu pedido será procesado inmediatamente una vez confirmada la compensación.')}
                    </div>
                  </div>
                  
                  <Button onClick={() => window.print()} variant="outline" className="border-white/10 text-white hover:bg-white/5 py-2 px-6 rounded-xl text-xs w-fit mx-auto mt-2">
                    {t('IMPRIMIR VOUCHER')}
                  </Button>
                </div>
              ) : (
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
              )}
              
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

          {/* Checkout Right Summary Column (Always visible, except step 5) */}
          {step !== 5 && (
            <div className="bg-card border border-white/5 rounded-3xl p-6 shadow-xl h-fit flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-accent uppercase tracking-wider border-b border-white/5 pb-3 mb-4">{t('Resumen del Pedido')}</h3>
                
                <div className="flex flex-col gap-2.5 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>{t('Subtotal')}</span>
                    <span>US$ {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('Envío')}</span>
                    <span>US$ 15.00</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-500">
                      <span>{t('Descuento (Cupón)')}</span>
                      <span>-US$ {discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="h-px bg-white/5 my-2" />
                  <div className="flex justify-between text-sm font-bold text-white">
                    <span>{t('Total General')}</span>
                    <span className="text-accent font-heading text-lg">US$ {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Wizard navigation buttons */}
              <div className="mt-8 flex flex-col gap-3">
                {step === 1 && (
                  <Button
                    onClick={() => setStep(2)}
                    disabled={cartItems.length === 0}
                    className="w-full bg-accent hover:bg-accentHover text-background font-bold rounded-xl flex items-center justify-center gap-2"
                  >
                    {t('CONTINUAR A MI CUENTA')}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
                {step === 2 && !currentUser && null}
                {step === 2 && currentUser && (
                  <Button
                    onClick={() => setStep(3)}
                    className="w-full bg-accent hover:bg-accentHover text-background font-bold rounded-xl"
                  >
                    {t('CONTINUAR AL ENVÍO')}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
                {step === 3 && (
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => setStep(4)}
                      disabled={!firstName || !lastName || !street || !city || !zipCode || !docNumber}
                      className="w-full bg-accent hover:bg-accentHover text-background font-bold rounded-xl flex items-center justify-center gap-2"
                    >
                      {t('CONTINUAR AL PAGO')}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" onClick={() => setStep(2)} className="text-xs text-muted-foreground">
                      {t('Volver a mi cuenta')}
                    </Button>
                  </div>
                )}
                {step === 4 && (
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={handleCheckoutSubmit}
                      disabled={loading}
                      className="w-full bg-accent hover:bg-accentHover text-background font-bold rounded-xl flex items-center justify-center gap-2"
                    >
                      {loading ? t('Procesando...') : t('COMPLETAR PEDIDO')}
                    </Button>
                    <Button variant="ghost" onClick={() => setStep(3)} className="text-xs text-muted-foreground">
                      {t('Volver al envío')}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
