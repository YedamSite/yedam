'use client';

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { X, Mail, Lock, User, Shield, AlertCircle, Globe, Phone, MapPin, Search, Loader2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authService } from '@/lib/supabaseAuth';
import { useLanguage } from '@/context/LanguageContext';
import { COUNTRIES, DIAL_CODES, getDocumentTypes, getDefaultDocumentType, formatPhone, formatPostalCode, validatePhone } from '@/utils/countries';
import { sendConfirmationEmail } from '@/lib/emailService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultMode?: 'login' | 'register';
  onEmailVerificationRequired?: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess, defaultMode = 'login', onEmailVerificationRequired }: AuthModalProps) {
  const { t } = useLanguage();
  const [mode, setMode] = useState<'login' | 'register' | 'recovery'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [country, setCountry] = useState('Spain');
  const [phone, setPhone] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [documentType, setDocumentType] = useState('nif');
  const [documentNumber, setDocumentNumber] = useState('');
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [isCepValid, setIsCepValid] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [registerStep, setRegisterStep] = useState(1);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [checkingFields, setCheckingFields] = useState<Record<string, boolean>>({});
  const blurTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const handleFieldBlur = useCallback(async (field: string, value: string) => {
    if (blurTimers.current[field]) clearTimeout(blurTimers.current[field]);
    if (!value.trim()) { setFieldErrors(prev => { const n = { ...prev }; delete n[field]; return n; }); return; }
    blurTimers.current[field] = setTimeout(async () => {
      setCheckingFields(prev => ({ ...prev, [field]: true }));
      try {
        const query: Record<string, string> = {};
        if (field === 'email') query.email = value;
        if (field === 'phone') query.phone = value;
        if (field === 'documentNumber') query.documentNumber = value;
        const taken = await authService.checkAvailability(query);
        setFieldErrors(prev => {
          const n = { ...prev };
          if (taken[field]) {
            const msgs: Record<string, string> = {
              email: t('Este correo electrónico ya está registrado.'),
              phone: t('Este teléfono ya está registrado.'),
              documentNumber: t('Este documento ya está registrado.')
            };
            n[field] = msgs[field] || '';
          } else delete n[field];
          return n;
        });
      } catch (e) {
        console.error('checkAvailability error:', e);
      }
      setCheckingFields(prev => ({ ...prev, [field]: false }));
    }, 600);
  }, [t]);

  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  const isCheckingFields = Object.values(checkingFields).some(Boolean);
  const canGoNext = name.trim().length > 0 && phone.trim().length > 0 && email.trim().length > 0 && password.trim().length > 0 && !hasFieldErrors && !isCheckingFields;
  const docTypes = useMemo(() => getDocumentTypes(country), [country]);
  const filteredCountries = useMemo(() =>
    COUNTRIES.filter(c => c.toLowerCase().includes(countrySearch.toLowerCase())),
    [countrySearch]
  );

  const handleCepChange = async (v: string) => {
    const formatted = formatPostalCode(v, country);
    setPostalCode(formatted);
    if (country !== 'Brazil') { setIsCepValid(true); return; }
    const clean = formatted.replace(/\D/g, '');
    if (clean.length === 8) {
      setIsCepLoading(true); setIsCepValid(false);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
        const data = await res.json();
        if (data.erro) {
          setIsCepValid(false);
        } else {
          setStreet(data.logradouro || '');
          setNeighborhood(data.bairro || '');
          setCity(data.localidade || '');
          setState(data.uf || '');
          setIsCepValid(true);
        }
      } catch { setIsCepValid(false); }
      finally { setIsCepLoading(false); }
    } else { setIsCepValid(false); }
  };

  if (!isOpen) return null;

  const handleOAuthGoogle = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      await authService.signInWithGoogle();
      setSuccessMsg(t('✓ Conexión con Google simulada / autorizada!'));
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || t('Error en autenticación de Google'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (mode === 'login') {
        await authService.signIn(email);
        setSuccessMsg(t('✓ ¡Sesión iniciada con éxito!'));
      } else if (mode === 'register') {
        if (!name) {
          setErrorMsg(t('El nombre es obligatorio.'));
          setLoading(false);
          return;
        }
        const taken = await authService.checkAvailability({ email, phone, documentNumber });
        const conflicts: string[] = [];
        if (taken.email) conflicts.push(t('correo electrónico'));
        if (taken.phone) conflicts.push(t('teléfono'));
        if (taken.documentNumber) conflicts.push(t('documento'));
        if (conflicts.length > 0) {
          setErrorMsg(t('Ya existe una cuenta con este {fields}. Por favor, verifica los datos.').replace('{fields}', conflicts.join(', ')));
          setLoading(false);
          return;
        }
        const signUpResult = await authService.signUp(email, name, {
          country, phone, postalCode, street, number, complement, neighborhood, city, state,
          documentType, documentNumber
        });
        
        // Verificar se precisa confirmar e-mail (type-safe)
        const requiresConfirmation = (signUpResult as any).requiresEmailConfirmation === true;
        
        if (requiresConfirmation) {
          setSuccessMsg(t('✓ ¡Cuenta creada! Por favor, verifica tu e-mail para continuar.'));
          setLoading(false);
          
          // Salvar email para reenvio na página verify-email
          if (typeof window !== 'undefined') {
            localStorage.setItem('cheotnun_pending_email', email);
          }

          // Fechar modal e redirecionar para página de verificação
          setTimeout(() => {
            onClose();
            if (onEmailVerificationRequired) {
              onEmailVerificationRequired();
            } else {
              // Fallback: redirecionar manualmente
              if (typeof window !== 'undefined') {
                window.location.href = '/verify-email';
              }
            }
          }, 2000);
          return;
        }
        
        // Enviar e-mail de confirmação personalizado
        const locale = (typeof window !== 'undefined' && localStorage.getItem('cheotnun_locale')) || 'es';
        await sendConfirmationEmail(email, name, locale);
        
        setSuccessMsg(t('✓ ¡Cuenta creada con éxito! ¡Te hemos enviado un correo de bienvenida!'));
      } else {
        // Recovery
        setSuccessMsg(t('✓ Correo de recuperación enviado si la dirección existe.'));
      }
      
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      let msg = err.message || t('Ocurrió un error en el envío de datos.');
      
      // Verificar se é erro de e-mail não confirmado
      if (msg === 'EMAIL_NOT_CONFIRMED') {
        msg = t('Por favor, confirma tu e-mail antes de iniciar sesión. Revisa tu bandeja de entrada o spam.');
        // Salvar email para reenvio na página verify-email
        if (typeof window !== 'undefined') {
          localStorage.setItem('cheotnun_pending_email', email);
        }
        // Redirecionar para página de verificação
        setTimeout(() => {
          onClose();
          if (onEmailVerificationRequired) {
            onEmailVerificationRequired();
          } else {
            if (typeof window !== 'undefined') {
              window.location.href = '/verify-email';
            }
          }
        }, 2000);
      }
      
      const lowercaseMsg = msg.toLowerCase();
      if (msg.includes('cheotnun_users_email_key') || lowercaseMsg.includes('user already exists') || lowercaseMsg.includes('email address has already been registered')) {
        msg = t('Este correo electrónico ya está registrado.');
      } else if (msg.includes('idx_cheotnun_users_unique_phone') || msg.includes('cheotnun_users_phone_key')) {
        msg = t('Este teléfono ya está registrado.');
      } else if (msg.includes('idx_cheotnun_users_unique_document') || msg.includes('cheotnun_users_document_number_key')) {
        msg = t('Este documento ya está registrado.');
      } else if (lowercaseMsg.includes('rate limit') || lowercaseMsg.includes('email rate limit') || lowercaseMsg.includes('too many requests')) {
        msg = t('Demasiadas solicitudes. Espera unos minutos e inténtalo de nuevo.');
      } else if (lowercaseMsg.includes('invalid credentials') || lowercaseMsg.includes('invalid login credentials')) {
        msg = t('Correo electrónico o contraseña incorrectos.');
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#0b0f19] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-xs text-muted-foreground my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Title */}
        <div className="text-center mb-6">
          <span className="font-heading text-lg font-bold tracking-widest text-accent uppercase block">
            {t('CHEOTNUN PORTAL')}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-1 block">
            {mode === 'login' ? t('Iniciar Sesión') : mode === 'register' ? t('Crear Cuenta') : t('Recuperar Contraseña')}
          </span>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-4 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-xl mb-4 text-center">
            {successMsg}
          </div>
        )}

        {/* Tab Selector */}
        {mode !== 'recovery' && (
          <div className="flex bg-[#030712] rounded-full p-1 mb-6 border border-white/5">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 text-center py-2 rounded-full font-bold uppercase tracking-wider text-[10px] transition-all ${
                mode === 'login' ? 'bg-accent text-background' : 'hover:text-white'
              }`}
            >
              {t('Iniciar Sesión')}
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 text-center py-2 rounded-full font-bold uppercase tracking-wider text-[10px] transition-all ${
                mode === 'register' ? 'bg-accent text-background' : 'hover:text-white'
              }`}
            >
              {t('Registrarse')}
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === 'register' && registerStep === 1 && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase font-bold text-accent">{t('Nombre Completo')}</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                  <Input
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder={t('Tu Nombre')}
                    className="pl-9 bg-background border-white/10 text-white rounded-xl text-xs h-10"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase font-bold text-accent">{t('País')}</label>
                  <div className="relative">
                    <div
                      onClick={() => { setIsCountryOpen(!isCountryOpen); setCountrySearch(''); }}
                      className="flex h-10 w-full items-center gap-2 rounded-xl border border-white/10 bg-background px-3 py-2 text-xs text-white cursor-pointer"
                    >
                      <Globe className="h-4 w-4 text-white/40 shrink-0" />
                      <span className="flex-1 truncate">{country}</span>
                      <ChevronDown className={`h-4 w-4 text-white/40 shrink-0 transition-transform ${isCountryOpen ? 'rotate-180' : ''}`} />
                    </div>
                    {isCountryOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-background border border-white/10 rounded-xl shadow-2xl max-h-48 overflow-hidden">
                        <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
                          <Search className="h-3.5 w-3.5 text-white/40 shrink-0" />
                          <input autoFocus value={countrySearch} onChange={e => setCountrySearch(e.target.value)} placeholder={t('Buscar país...')} className="bg-transparent w-full text-xs text-white outline-none placeholder:text-white/30" />
                        </div>
                        <div className="overflow-y-auto max-h-36">
                          {filteredCountries.map(c => (
                            <div key={c} onClick={() => { setCountry(c); setDocumentType(getDefaultDocumentType(c)); setIsCountryOpen(false); }} className={`px-3 py-2 text-xs cursor-pointer hover:bg-white/5 ${country === c ? 'text-accent font-bold bg-white/5' : 'text-white/80'}`}>{c}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase font-bold text-accent">{t('Teléfono')}</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs text-white/60 font-medium z-10">{DIAL_CODES[country] || '+'}</span>
                    <Input type="tel" value={phone} onChange={e => setPhone(formatPhone(e.target.value, country))} onBlur={() => handleFieldBlur('phone', phone)} placeholder={country === 'Brazil' ? '(11) 99999-9999' : t('Número de teléfono')} className="pl-12 bg-background border-white/10 text-white rounded-xl text-xs h-10" />
                    {checkingFields.phone && <Loader2 className="absolute right-2 top-3 h-3 w-3 text-accent animate-spin" />}
                  </div>
                  {fieldErrors.phone && <span className="text-[9px] text-red-400">{fieldErrors.phone}</span>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase font-bold text-accent">{t('Correo Electrónico')}</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                    <Input required type="email" value={email} onChange={e => setEmail(e.target.value)} onBlur={() => handleFieldBlur('email', email)} placeholder={t('ejemplo@correo.com')} className="pl-9 bg-background border-white/10 text-white rounded-xl text-xs h-10" />
                    {checkingFields.email && <Loader2 className="absolute right-2 top-3 h-3 w-3 text-accent animate-spin" />}
                  </div>
                  {fieldErrors.email && <span className="text-[9px] text-red-400">{fieldErrors.email}</span>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase font-bold text-accent">{t('Contraseña')}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                    <Input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="pl-9 bg-background border-white/10 text-white rounded-xl text-xs h-10" />
                  </div>
                </div>
              </div>
              <button type="button" disabled={!canGoNext} onClick={() => setRegisterStep(2)} className={`font-bold py-2.5 rounded-xl text-xs mt-1 uppercase tracking-wider ${canGoNext ? 'bg-accent hover:bg-accentHover text-background' : 'bg-white/5 text-white/30 cursor-not-allowed'}`}>{t('Siguiente')}</button>
            </>
          )}

          {mode === 'register' && registerStep === 2 && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase font-bold text-accent">{t('Dirección de Envío')}</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <Input type="text" value={postalCode} onChange={e => handleCepChange(e.target.value)} placeholder={country === 'Brazil' ? 'CEP' : t('Código Postal')} className="bg-background border-white/10 text-white rounded-xl text-xs h-10 pr-8" />
                    {isCepLoading && <Loader2 className="absolute right-2 top-3 h-4 w-4 text-accent animate-spin" />}
                  </div>
                  <div className="relative">
                    <Input type="text" value={state} onChange={e => setState(country === 'Brazil' ? e.target.value.toUpperCase() : e.target.value)} readOnly={country === 'Brazil' && isCepValid} placeholder={t('Estado/Región')} maxLength={country === 'Brazil' ? 2 : 50} className={`bg-background border-white/10 text-white rounded-xl text-xs h-10 ${country === 'Brazil' && isCepValid ? 'opacity-40 cursor-not-allowed' : ''}`} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <div className="col-span-2 relative">
                    <Input type="text" value={street} onChange={e => setStreet(e.target.value)} readOnly={country === 'Brazil' && isCepValid} placeholder={t('Calle / Dirección')} className={`bg-background border-white/10 text-white rounded-xl text-xs h-10 ${country === 'Brazil' && isCepValid ? 'opacity-40 cursor-not-allowed' : ''}`} />
                  </div>
                  <div className="relative">
                    <Input type="text" value={number} onChange={e => setNumber(e.target.value)} placeholder={t('Nº')} className="bg-background border-accent/30 text-white rounded-xl text-xs h-10" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <div className="col-span-2 relative">
                    <Input type="text" value={neighborhood} onChange={e => setNeighborhood(e.target.value)} readOnly={country === 'Brazil' && isCepValid} placeholder={country === 'Brazil' ? t('Bairro') : t('Cidade / Região')} className={`bg-background border-white/10 text-white rounded-xl text-xs h-10 ${country === 'Brazil' && isCepValid ? 'opacity-40 cursor-not-allowed' : ''}`} />
                  </div>
                  <Input type="text" value={complement} onChange={e => setComplement(e.target.value)} placeholder={t('Complemento')} className="bg-background border-white/10 text-white rounded-xl text-xs h-10" />
                </div>
                <Input type="text" value={city} onChange={e => setCity(e.target.value)} readOnly={country === 'Brazil' && isCepValid} placeholder={t('Ciudad')} className={`bg-background border-white/10 text-white rounded-xl text-xs h-10 ${country === 'Brazil' && isCepValid ? 'opacity-40 cursor-not-allowed' : ''}`} />
                {country === 'Brazil' && isCepValid && (
                  <button type="button" onClick={() => { setPostalCode(''); setIsCepValid(false); setStreet(''); setNeighborhood(''); setCity(''); setState(''); }} className="text-[9px] text-red-400 font-bold uppercase tracking-widest hover:underline text-center w-full">{t('Corrigir CEP / Digitar manualmente')}</button>
                )}
                <label className="text-[9px] uppercase font-bold text-accent">{t('Documento de Identificación')}</label>
                <div className="grid grid-cols-2 gap-2">
                  <select value={documentType} onChange={e => setDocumentType(e.target.value)} className="flex h-10 w-full rounded-xl border border-white/10 bg-background px-3 py-2 text-xs text-white">
                    {docTypes.map(d => (<option key={d.value} value={d.value}>{d.label}</option>))}
                  </select>
                  <Input type="text" value={documentNumber} onChange={e => setDocumentNumber(e.target.value)} onBlur={() => handleFieldBlur('documentNumber', documentNumber)} placeholder={t('Número de documento')} className="bg-background border-white/10 text-white rounded-xl text-xs h-10" />
                  {fieldErrors.documentNumber && <span className="text-[9px] text-red-400 col-span-2">{fieldErrors.documentNumber}</span>}
                </div>
              </div>
              <div className="flex gap-2 mt-1">
                <button type="button" onClick={() => setRegisterStep(prev => prev - 1)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white text-[10px] font-bold uppercase tracking-wider">{t('Volver')}</button>
                <button type="submit" disabled={loading || hasFieldErrors || isCheckingFields} className={`flex-1 font-bold py-2.5 rounded-xl text-[10px] uppercase tracking-wider ${loading || hasFieldErrors || isCheckingFields ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-accent hover:bg-accentHover text-background'}`}>{loading ? t('Procesando...') : t('CREAR CUENTA')}</button>
              </div>
            </>
          )}

          {mode === 'login' && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase font-bold text-accent">{t('Correo Electrónico')}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                  <Input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('ejemplo@correo.com')} className="pl-9 bg-background border-white/10 text-white rounded-xl text-xs h-10" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] uppercase font-bold text-accent">{t('Contraseña')}</label>
                  <button type="button" onClick={() => setMode('recovery')} className="text-[9px] hover:underline hover:text-accent font-semibold">{t('¿Olvidaste tu contraseña?')}</button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                  <Input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="pl-9 bg-background border-white/10 text-white rounded-xl text-xs h-10" />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="bg-accent hover:bg-accentHover text-background font-bold py-2.5 rounded-xl text-xs mt-2">{loading ? t('Procesando...') : t('ACCEDER')}</Button>
            </>
          )}

          {mode === 'recovery' && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase font-bold text-accent">{t('Correo Electrónico')}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                  <Input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('ejemplo@correo.com')} className="pl-9 bg-background border-white/10 text-white rounded-xl text-xs h-10" />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="bg-accent hover:bg-accentHover text-background font-bold py-2.5 rounded-xl text-xs mt-2">{loading ? t('Procesando...') : t('ENVIAR INSTRUCCIONES')}</Button>
            </>
          )}
        </form>

        {/* Social Auth Separator */}
        {mode !== 'recovery' && (
          <div className="flex flex-col gap-4 mt-6 border-t border-white/5 pt-6">
            <div className="relative flex py-1 items-center justify-center">
              <div className="flex-grow border-t border-white/5"></div>
              <span className="flex-shrink mx-4 text-[9px] uppercase font-bold tracking-wider">{t('O continuar con')}</span>
              <div className="flex-grow border-t border-white/5"></div>
            </div>

            <Button
              type="button"
              onClick={handleOAuthGoogle}
              variant="outline"
              className="border-white/10 hover:bg-white/5 text-white flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs h-10"
            >
              <svg className="h-4 w-4 mr-1 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 0, 0)">
                  <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.58h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.48c0,-0.6 -0.06,-1.2 -0.17,-1.72Z" fill="#4285F4" />
                  <path d="M12,20.62c2.43,0 4.47,-0.8 5.96,-2.18l-3.3,-2.58c-0.9,0.6 -2.07,0.98 -3.3,0.98c-2.34,0 -4.33,-1.58 -5.04,-3.7H2.92v2.66c1.5,2.98 4.6,4.82 8.08,4.82Z" fill="#34A853" />
                  <path d="M6.96,13.22c-0.18,-0.54 -0.28,-1.12 -0.28,-1.72c0,-0.6 0.1,-1.18 0.28,-1.72V7.12H2.92c-0.6,1.2 -0.92,2.56 -0.92,4.38c0,1.82 0.32,3.18 0.92,4.38l4.04,-3.26Z" fill="#FBBC05" />
                  <path d="M12,6.16c1.32,0 2.5,0.46 3.44,1.36l2.58,-2.58C16.46,3.48 14.42,2.78 12,2.78c-3.48,0 -6.58,1.84 -8.08,4.82l4.04,3.26c0.71,-2.12 2.7,-3.7 5.04,-3.7Z" fill="#EA4335" />
                </g>
              </svg>
              {t('Continuar con Google')}
            </Button>
          </div>
        )}

        {mode === 'recovery' && (
          <button
            onClick={() => setMode('login')}
            className="w-full text-center hover:underline hover:text-white mt-4 text-[10px] font-semibold"
          >
            {t('Volver al inicio de sesión')}
          </button>
        )}
      </div>
    </div>
  );
}
