'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, ShieldCheck, Check, Trash2, FileText, CreditCard, Loader2, Globe, Search, ChevronDown } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { submitOrderAction } from '@/actions/shopActions';
import { authService } from '@/lib/supabaseAuth';
import AuthModal from '@/components/AuthModal';
import { db } from '@/lib/db';
import { useLanguage } from '@/context/LanguageContext';
import { COUNTRIES, DIAL_CODES, formatPhone, formatPostalCode, validatePhone } from '@/utils/countries';

const COUNTRY_KEY_MAP: Record<string, string> = {
  'Brasil': 'Brazil',
  'España': 'Spain',
  'México': 'Mexico',
  'Chile': 'Chile',
  'Colombia': 'Colombia',
  'Argentina': 'Argentina',
  'Uruguay': 'Uruguay',
  'Paraguay': 'Paraguay',
  'Estados Unidos': 'United States',
  'Portugal': 'Portugal',
};

function isValidCPF(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return false;
  if (/^(\d)\1+$/.test(clean)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(clean.charAt(i)) * (10 - i);
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(9))) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(clean.charAt(i)) * (11 - i);
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(10))) return false;
  return true;
}

function isValidCNPJ(cnpj: string): boolean {
  const clean = cnpj.replace(/\D/g, '');
  if (clean.length !== 14) return false;
  if (/^(\d)\1+$/.test(clean)) return false;
  let size = clean.length - 2;
  let numbers = clean.substring(0, size);
  const digits = clean.substring(size);
  let sum = 0;
  let pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;
  size = size + 1;
  numbers = clean.substring(0, size);
  sum = 0;
  pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;
  return true;
}

async function lookupViaCep(cep: string): Promise<{ street: string; city: string; state: string } | null> {
  const clean = cep.replace(/\D/g, '');
  if (clean.length !== 8) return null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
    const data = await res.json();
    if (data.erro) return null;
    return {
      street: data.logradouro || '',
      city: data.localidade || '',
      state: data.uf || ''
    };
  } catch {
    return null;
  }
}

export default function CheckoutWizard() {
  const { t, locale } = useLanguage();
  const [step, setStep] = useState(1);
  const [cartItems, setCartItems] = useState<any[]>([]);

  // Form states
  const [country, setCountry] = useState('Brasil');
  const [docType, setDocType] = useState('cpf');
  const [docNumber, setDocNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [phone, setPhone] = useState('');
  const [stripeLoading, setStripeLoading] = useState(false);

  // Validation states
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState('');
  const [docError, setDocError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const countryKey = COUNTRY_KEY_MAP[country] || country;
  const dialCode = DIAL_CODES[countryKey] || '+55';

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
    setCepError('');
    setDocError('');
    setPhoneError('');
    if (country === 'Brasil') setDocType('cpf');
    else if (country === 'España') setDocType('nif');
    else if (country === 'Uruguay') setDocType('rut');
    else if (country === 'Paraguay') setDocType('ruc');
    else if (country === 'Argentina') setDocType('dni');
    else if (country === 'México') setDocType('rfc');
    else setDocType('nif');
  }, [country]);

  // Country search dropdown state
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return COUNTRIES;
    return COUNTRIES.filter(c => c.toLowerCase().includes(countrySearch.toLowerCase()));
  }, [countrySearch]);

  const handleZipCodeChange = async (val: string) => {
    const formatted = formatPostalCode(val, countryKey);
    setZipCode(formatted);
    setCepError('');

    if (country === 'Brasil' || countryKey === 'Brazil') {
      const clean = formatted.replace(/\D/g, '');
      if (clean.length === 8) {
        setCepLoading(true);
        const addressData = await lookupViaCep(clean);
        setCepLoading(false);
        if (addressData) {
          if (addressData.city) setCity(addressData.city);
          if (addressData.street) setStreet(addressData.street);
          setCepError('');
        } else {
          setCepError(t('Código Postal / CEP no encontrado o inválido. Ingrese un CEP real.'));
        }
      } else if (clean.length > 0 && clean.length !== 8) {
        setCepError(t('Código Postal / CEP no encontrado o inválido. Ingrese un CEP real.'));
      }
    }
  };

  const handlePhoneChange = (val: string) => {
    const formatted = formatPhone(val, countryKey);
    setPhone(formatted);

    if (formatted.trim()) {
      const valid = validatePhone(formatted, countryKey);
      if (!valid) {
        setPhoneError(t('Teléfono o DDD inválido. Ingrese un número válido.'));
      } else {
        setPhoneError('');
      }
    } else {
      setPhoneError('');
    }
  };

  const handleDocChange = (val: string) => {
    setDocNumber(val);
    setDocError('');

    if (!val.trim()) return;

    if (country === 'Brasil' || countryKey === 'Brazil') {
      const clean = val.replace(/\D/g, '');
      if (docType === 'cnpj' || clean.length > 11) {
        if (!isValidCNPJ(clean)) {
          setDocError(t('CNPJ inválido. Ingrese un CNPJ real de 14 dígitos.'));
        } else {
          setDocError('');
        }
      } else {
        if (!isValidCPF(clean)) {
          setDocError(t('CPF inválido. Ingrese un CPF real de 11 dígitos.'));
        } else {
          setDocError('');
        }
      }
    } else {
      if (val.trim().length < 4) {
        setDocError(t('Número de documento inválido.'));
      } else {
        setDocError('');
      }
    }
  };

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

  // Dynamic Coupon System
  const [couponError, setCouponError] = useState('');
  const [appliedCouponCode, setAppliedCouponCode] = useState('');

  const getPrice = (item: any) => locale === 'pt' ? (item.price_brl || item.price * 5) : item.price;
  const currency = locale === 'pt' ? 'R$' : 'US$';
  const rate = locale === 'pt' ? 5 : 1;

  const subtotal = cartItems.reduce((acc, curr) => acc + (getPrice(curr) * curr.quantity), 0);

  const handleApplyCoupon = () => {
    setCouponError('');
    const codeClean = couponCode.trim().toUpperCase();
    if (!codeClean) return;

    const allCoupons = (db.get('coupons') as any[]) || [];
    const found = allCoupons.find((c: any) => (c.code || '').toUpperCase() === codeClean && c.status === 'active');

    if (!found) {
      setDiscount(0);
      setCouponApplied(false);
      setAppliedCouponCode('');
      setCouponError(t('Cupón inválido o no existente'));
      return;
    }

    let calculatedDiscount = 0;
    if (found.type === 'percentage') {
      calculatedDiscount = subtotal * (Number(found.discount) / 100);
    } else {
      calculatedDiscount = Number(found.discount) * rate;
    }

    setDiscount(calculatedDiscount);
    setCouponApplied(true);
    setAppliedCouponCode(found.code);
    setCouponError('');
  };

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
          import('@/actions/shopActions').then(mod => {
            mod.confirmOrderPaymentAction(orderId);
          });
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

    // 1. Create the pending order record
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

    // 2. Create Stripe Checkout Session and redirect
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
                      placeholder={t('Código del Cupón')}
                      className="bg-black/30 border-white/10 text-white rounded-xl text-xs flex-1 uppercase"
                    />
                    <Button onClick={handleApplyCoupon} className="bg-accent hover:bg-accentHover text-background font-bold rounded-xl text-xs px-5">
                      {t('APLICAR')}
                    </Button>
                  </div>
                  {couponApplied && (
                    <span className="text-[10px] text-green-500 mt-1.5 font-semibold block">
                      ✓ {t('Cupón')} &quot;{appliedCouponCode}&quot; {t('aplicado')}: -{currency} {discount.toFixed(2)}
                    </span>
                  )}
                  {couponError && (
                    <span className="text-[10px] text-red-500 mt-1.5 font-semibold block">
                      ✕ {couponError}
                    </span>
                  )}
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
                  {/* Searchable Country Selector matching AuthModal */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold uppercase text-accent">{t('País de Destino')}</label>
                    <div className="relative">
                      <div
                        onClick={() => { setIsCountryOpen(!isCountryOpen); setCountrySearch(''); }}
                        className="flex h-10 w-full items-center gap-2 rounded-xl border border-white/10 bg-background px-3 py-2 text-xs text-white cursor-pointer hover:border-white/20"
                      >
                        <Globe className="h-4 w-4 text-accent shrink-0" />
                        <span className="flex-1 truncate font-medium">{country} ({dialCode})</span>
                        <ChevronDown className={`h-4 w-4 text-white/40 shrink-0 transition-transform ${isCountryOpen ? 'rotate-180' : ''}`} />
                      </div>
                      {isCountryOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-background border border-white/10 rounded-xl shadow-2xl max-h-56 overflow-hidden">
                          <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5 bg-secondary/50">
                            <Search className="h-3.5 w-3.5 text-white/40 shrink-0" />
                            <input
                              autoFocus
                              value={countrySearch}
                              onChange={e => setCountrySearch(e.target.value)}
                              placeholder={t('Buscar país...')}
                              className="bg-transparent w-full text-xs text-white outline-none placeholder:text-white/30"
                            />
                          </div>
                          <div className="overflow-y-auto max-h-40">
                            {filteredCountries.map(c => {
                              const codeKey = COUNTRY_KEY_MAP[c] || c;
                              const code = DIAL_CODES[codeKey] || '';
                              return (
                                <div
                                  key={c}
                                  onClick={() => {
                                    setCountry(c);
                                    setIsCountryOpen(false);
                                  }}
                                  className={`px-3 py-2 text-xs cursor-pointer flex justify-between items-center hover:bg-white/5 ${country === c ? 'text-accent font-bold bg-white/5' : 'text-white/80'}`}
                                >
                                  <span>{c}</span>
                                  <span className="text-[10px] font-mono opacity-60">{code}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dynamic Document type + number input based on country selection */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-semibold uppercase text-accent">
                        {country === 'Brasil' || countryKey === 'Brazil' ? t('Documento de Identificación') : t('Documento de Identificación')}
                      </label>
                      {(country === 'Brasil' || countryKey === 'Brazil') && (
                        <div className="flex gap-2 text-[9px] font-bold">
                          <button
                            type="button"
                            onClick={() => { setDocType('cpf'); setDocNumber(''); setDocError(''); }}
                            className={`px-1.5 py-0.5 rounded ${docType === 'cpf' ? 'bg-accent text-background font-bold' : 'text-white/60 hover:text-white'}`}
                          >
                            CPF
                          </button>
                          <button
                            type="button"
                            onClick={() => { setDocType('cnpj'); setDocNumber(''); setDocError(''); }}
                            className={`px-1.5 py-0.5 rounded ${docType === 'cnpj' ? 'bg-accent text-background font-bold' : 'text-white/60 hover:text-white'}`}
                          >
                            CNPJ
                          </button>
                        </div>
                      )}
                    </div>
                    <Input
                      value={docNumber}
                      onChange={e => handleDocChange(e.target.value)}
                      placeholder={
                        country === 'Brasil' || countryKey === 'Brazil'
                          ? (docType === 'cnpj' ? '00.000.000/0001-00' : '000.000.000-00')
                          : country === 'España' ? '12345678Z' : country === 'Uruguay' ? '1234567-8' : '123456-7'
                      }
                      className={`bg-background border-white/10 text-white text-xs h-10 font-mono uppercase ${docError ? 'border-red-500/60 focus:border-red-500' : ''}`}
                      required
                    />
                    {docError && <span className="text-[10px] text-red-400 font-semibold">{docError}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold uppercase text-accent">{t('Código Postal / CEP')}</label>
                    <div className="relative flex items-center">
                      <Input
                        value={zipCode}
                        onChange={e => handleZipCodeChange(e.target.value)}
                        placeholder={country === 'Brasil' || countryKey === 'Brazil' ? '89238-589' : t('Código Postal')}
                        className={`bg-background border-white/10 text-white text-xs h-10 font-mono ${cepError ? 'border-red-500/60 focus:border-red-500' : ''}`}
                        required
                      />
                      {cepLoading && <Loader2 className="absolute right-3 h-4 w-4 text-accent animate-spin" />}
                    </div>
                    {cepError && <span className="text-[10px] text-red-400 font-semibold">{cepError}</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold uppercase text-accent">{t('Ciudad')}</label>
                    <Input value={city} onChange={e => setCity(e.target.value)} required />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase text-accent">{t('Calle & Número')}</label>
                  <Input value={street} onChange={e => setStreet(e.target.value)} required placeholder={t('Ej: Av. Brasil 1234, Apt 402')} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase text-accent">{t('Teléfono de Contacto (com DDI/DDD)')}</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs text-accent font-bold font-mono z-10 shrink-0 select-none bg-accent/10 border border-accent/20 px-1.5 py-0.5 rounded">
                      {dialCode}
                    </span>
                    <Input
                      type="tel"
                      value={phone}
                      onChange={e => handlePhoneChange(e.target.value)}
                      placeholder={country === 'Brasil' ? '(11) 99671-6235' : t('Número de teléfono')}
                      className="pl-16 bg-background border-white/10 text-white text-xs h-10 font-mono"
                      required
                    />
                  </div>
                  {phoneError && <span className="text-[10px] text-red-400 font-semibold">{phoneError}</span>}
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
                  <div className="flex justify-between items-center text-sm font-bold text-white">
                    <span>{t('Total General')}</span>
                    <span className="text-accent font-mono font-bold text-base tracking-tight">{currency} {total.toFixed(2)}</span>
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
                      disabled={!firstName || !lastName || !street || !city || !zipCode || !docNumber || !phone || Boolean(cepError) || Boolean(docError) || Boolean(phoneError)}
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
