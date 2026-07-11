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

export default function CheckoutWizard() {
  const [step, setStep] = useState(1);
  const [cartItems, setCartItems] = useState<any[]>([]);

  // Form states
  const [country, setCountry] = useState('España');
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
      const cart = localStorage.getItem('yedam_cart');
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
    localStorage.setItem('yedam_cart', JSON.stringify(updated));
  };

  const handleRemoveItem = (prodId: string) => {
    const filtered = cartItems.filter(item => item.product_id !== prodId);
    setCartItems(filtered);
    localStorage.setItem('yedam_cart', JSON.stringify(filtered));
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

    const user = authService.getCurrentUser();
    const customerId = user ? user.id : 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';

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
      localStorage.removeItem('yedam_cart');
      setCartItems([]);
      setStep(4);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1 py-12 px-4 md:px-8 max-w-5xl mx-auto w-full">
        {/* Wizard Steps indicator */}
        <div className="flex justify-between items-center max-w-md mx-auto mb-10 text-xs font-bold text-muted-foreground uppercase tracking-wider">
          <span className={step >= 1 ? 'text-accent' : ''}>1. Carrito</span>
          <span>→</span>
          <span className={step >= 2 ? 'text-accent' : ''}>2. Envío & Identificación</span>
          <span>→</span>
          <span className={step >= 3 ? 'text-accent' : ''}>3. Pago</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* STEP 1: CART ITEMS */}
          {step === 1 && (
            <div className="lg:col-span-2 bg-card border border-white/5 rounded-3xl p-6 shadow-xl">
              <h2 className="font-heading text-2xl font-light text-white mb-6">Carrito de Compras</h2>
              
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
                      placeholder="Cupón de descuento (CUPOM10)"
                      className="bg-black/30 border-white/10 text-white rounded-xl text-xs flex-1"
                    />
                    <Button onClick={handleApplyCoupon} className="bg-accent hover:bg-accentHover text-background font-bold rounded-xl text-xs px-5">
                      APLICAR
                    </Button>
                  </div>
                  {couponApplied && <span className="text-[10px] text-green-500 mt-1 font-semibold">✓ Cupón "CUPOM10" aplicado: -US$ 10.00</span>}
                </div>
              ) : (
                <div className="border border-dashed border-white/10 rounded-2xl p-12 text-center text-xs text-muted-foreground">
                  El carrito está vacío.
                </div>
              )}
            </div>
          )}

          {/* STEP 2: ADDRESS & DOCUMENT AUTO REQUIREMENTS */}
          {step === 2 && (
            <div className="lg:col-span-2 bg-card border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
              <h2 className="font-heading text-2xl font-light text-white mb-6">Información de Envío</h2>
              
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold uppercase text-accent">Nombre</label>
                    <Input value={firstName} onChange={e => setFirstName(e.target.value)} required />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold uppercase text-accent">Apellido</label>
                    <Input value={lastName} onChange={e => setLastName(e.target.value)} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold uppercase text-accent">País de Destino</label>
                    <select
                      value={country}
                      onChange={e => setCountry(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm text-white"
                    >
                      <option value="España">España</option>
                      <option value="Uruguay">Uruguay</option>
                      <option value="Paraguay">Paraguay</option>
                    </select>
                  </div>
                  {/* Dynamic Document input based on country selection */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold uppercase text-accent">
                      {country === 'España' && 'Documento NIF / NIE'}
                      {country === 'Uruguay' && 'Documento RUT o CI'}
                      {country === 'Paraguay' && 'Documento RUC o CI'}
                    </label>
                    <Input
                      value={docNumber}
                      onChange={e => setDocNumber(e.target.value)}
                      placeholder={
                        country === 'España' ? 'Ej: 12345678Z' : country === 'Uruguay' ? 'Ej: 1234567-8' : 'Ej: 123456-7'
                      }
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase text-accent">Calle & Número</label>
                  <Input value={street} onChange={e => setStreet(e.target.value)} required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold uppercase text-accent">Ciudad</label>
                    <Input value={city} onChange={e => setCity(e.target.value)} required />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold uppercase text-accent">Código Postal</label>
                    <Input value={zipCode} onChange={e => setZipCode(e.target.value)} required />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase text-accent">Teléfono de Contacto</label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} required />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT GATEWAYS */}
          {step === 3 && (
            <div className="lg:col-span-2 bg-card border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
              <h2 className="font-heading text-2xl font-light text-white mb-6">Método de Pago</h2>
              
              <div className="flex flex-col gap-4">
                {[
                  { id: 'stripe', name: 'Stripe Checkout', desc: 'Tarjetas de crédito, débito internacionales y Apple Pay' },
                  { id: 'paypal', name: 'PayPal Integration', desc: 'Paga de forma rápida y segura con tu cuenta PayPal' },
                  { id: 'mercadopago', name: 'Mercado Pago LatAm', desc: 'Tarjetas de crédito locales y transferencias' },
                  { id: 'dlocal', name: 'dLocal Payments', desc: 'Medios de pago locales para Uruguay, Paraguay y otros' }
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
                        <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Selecciona la modalidad dLocal:</span>
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
                            Tarjeta de Crédito Internacional
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
                            Pago en Efectivo (Redes Locales)
                          </label>
                        </div>
                        
                        {dlocalSubMethod === 'cash' && (
                          <div className="flex flex-col gap-2 mt-2">
                            <span className="text-[9px] text-muted-foreground uppercase font-bold">Red de Cobranza:</span>
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

          {/* STEP 4: SUCCESS CONGRATS */}
          {step === 4 && orderSuccess && (
            <div className="lg:col-span-3 bg-card border border-white/5 rounded-3xl p-8 md:p-12 text-center flex flex-col items-center gap-4 max-w-xl mx-auto shadow-2xl">
              <span className="p-4 bg-accent/20 border border-accent/40 rounded-full text-accent">
                <Check className="h-10 w-10" />
              </span>
              <h2 className="font-heading text-3xl font-light text-white uppercase tracking-wider">¡Gracias por tu compra!</h2>
              
              {gateway === 'dlocal' && dlocalSubMethod === 'cash' ? (
                <div className="w-full flex flex-col gap-4 mt-2">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Hemos registrado tu pedido **#{orderSuccess.id.substring(0, 8)}**. Para completar el pago, utiliza el siguiente cupón de cobranza local:
                  </p>
                  
                  {/* Visual Barcode Voucher Card */}
                  <div className="bg-white text-black font-mono text-left p-6 rounded-2xl border border-gray-200 flex flex-col gap-4 shadow-lg text-xs leading-normal">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-gray-500 block">Red de Cobranza</span>
                        <span className="text-sm font-bold uppercase text-accent">
                          {cashNetwork === 'pago_movil' && 'Pago Móvil (Paraguay)'}
                          {cashNetwork === 'aqui_pago' && 'Aquí Pago (Paraguay)'}
                          {cashNetwork === 'abitab' && 'Abitab (Uruguay)'}
                          {cashNetwork === 'redpagos' && 'Redpagos (Uruguay)'}
                        </span>
                      </div>
                      <span className="text-lg font-bold font-heading text-accent">US$ {total.toFixed(2)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-[10px]">
                      <div>
                        <span className="font-bold text-gray-500 uppercase block text-[8px]">Referencia de Pago</span>
                        <span className="font-bold text-black select-all">1029-4820-{orderSuccess.id.substring(0, 4).toUpperCase()}</span>
                      </div>
                      <div>
                        <span className="font-bold text-gray-500 uppercase block text-[8px]">Fecha de Vencimiento</span>
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
                      <span className="font-bold block uppercase text-[9px] text-gray-600 mb-1">Instrucciones de pago:</span>
                      1. Presenta este cupón impreso o en tu celular en cualquier sucursal de la red seleccionada.<br />
                      2. O bien, ingresa a la aplicación de tu banco o billetera digital y digita el número de referencia.<br />
                      3. Guarda el recibo. Tu pedido será procesado inmediatamente una vez confirmada la compensación.
                    </div>
                  </div>
                  
                  <Button onClick={() => window.print()} variant="outline" className="border-white/10 text-white hover:bg-white/5 py-2 px-6 rounded-xl text-xs w-fit mx-auto mt-2">
                    IMPRIMIR VOUCHER
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Hemos recibido tu pedido con el ID **{orderSuccess.id.substring(0, 8)}**. En unos momentos se acreditará el pago y recibirás tu **Commercial Invoice** junto con los detalles de envío en tu dashboard.
                </p>
              )}
              
              <div className="h-px bg-white/10 w-full my-4" />

              <div className="flex gap-4">
                <Link href="/dashboard/cliente">
                  <Button className="bg-accent hover:bg-accentHover text-background font-bold py-2.5 px-6 rounded-xl text-xs">
                    IR A MI DASHBOARD
                  </Button>
                </Link>
                <Link href="/tienda">
                  <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 py-2.5 px-6 rounded-xl text-xs">
                    SEGUIR COMPRANDO
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Checkout Right Summary Column (Always visible, except step 4) */}
          {step !== 4 && (
            <div className="bg-card border border-white/5 rounded-3xl p-6 shadow-xl h-fit flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-accent uppercase tracking-wider border-b border-white/5 pb-3 mb-4">Resumen del Pedido</h3>
                
                <div className="flex flex-col gap-2.5 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>US$ {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Envío</span>
                    <span>US$ 15.00</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-500">
                      <span>Descuento (Cupón)</span>
                      <span>-US$ {discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="h-px bg-white/5 my-2" />
                  <div className="flex justify-between text-sm font-bold text-white">
                    <span>Total General</span>
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
                    CONTINUAR AL ENVÍO
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
                      CONTINUAR AL PAGO
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" onClick={() => setStep(1)} className="text-xs text-muted-foreground">
                      Volver al carrito
                    </Button>
                  </div>
                )}
                {step === 3 && (
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={handleCheckoutSubmit}
                      disabled={loading}
                      className="w-full bg-accent hover:bg-accentHover text-background font-bold rounded-xl flex items-center justify-center gap-2"
                    >
                      {loading ? 'Procesando...' : 'COMPLETAR PEDIDO'}
                    </Button>
                    <Button variant="ghost" onClick={() => setStep(2)} className="text-xs text-muted-foreground">
                      Volver al envío
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
