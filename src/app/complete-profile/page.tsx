'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, User, Globe, Phone, MapPin, Search, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authService, supabase } from '@/lib/supabaseAuth';
import { useLanguage } from '@/context/LanguageContext';
import { COUNTRIES, DIAL_CODES, getDocumentTypes, getDefaultDocumentType, formatPhone, formatPostalCode } from '@/utils/countries';

export default function CompleteProfilePage() {
  const { t, locale } = useLanguage();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const docTypes = useMemo(() => getDocumentTypes(country), [country]);
  const filteredCountries = useMemo(() =>
    COUNTRIES.filter(c => c.toLowerCase().includes(countrySearch.toLowerCase())),
    [countrySearch]
  );

  useEffect(() => {
    const checkAuth = async () => {
      const session = authService.getCurrentUser();
      if (!session) {
        router.push('/');
        return;
      }
      setUser(session);
      setCountry(session.country || 'Spain');
      setPhone(session.phone || '');
      setPostalCode(session.postal_code || '');
      setStreet(session.street || '');
      setNumber(session.number || '');
      setComplement(session.complement || '');
      setNeighborhood(session.neighborhood || '');
      setCity(session.city || '');
      setState(session.state || '');
      setDocumentType(session.document_type || getDefaultDocumentType(session.country || 'Spain'));
      setDocumentNumber(session.document_number || '');
      setLoading(false);

      const needsProfile = typeof window !== 'undefined' && localStorage.getItem('cheotnun_needs_profile');
      if (!needsProfile) {
        router.push('/');
      }
    };
    checkAuth();
  }, [router]);

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

  const handleSave = async () => {
    if (!user || !supabase) return;
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Save to DB via API
      const resp = await fetch('/api/supabase-reload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upsert',
          table: 'users',
          records: [{
            id: user.id,
            email: user.email,
            name: user.name,
            phone: formatPhone(phone, country).replace(/\D/g, '') || null,
            country: country || null,
            document_type: documentType || null,
            document_number: documentNumber.replace(/\D/g, '') || null,
            postal_code: postalCode || null,
            street: street || null,
            number: number || null,
            complement: complement || null,
            neighborhood: neighborhood || null,
            city: city || null,
            state: state || null,
          }]
        }),
      });
      const result = await resp.json();
      if (!result.success) throw new Error(result.error || 'Erro ao salvar');

      // Update local session
      const updated = {
        ...user,
        phone: formatPhone(phone, country).replace(/\D/g, '') || null,
        country: country || null,
        document_type: documentType || null,
        document_number: documentNumber.replace(/\D/g, '') || null,
        postal_code: postalCode || null,
        street: street || null,
        number: number || null,
        complement: complement || null,
        neighborhood: neighborhood || null,
        city: city || null,
        state: state || null,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('cheotnun_session', JSON.stringify(updated));
        localStorage.removeItem('cheotnun_needs_profile');
      }

      setSuccess(t('✓ Registro completado!'));
      setTimeout(() => {
        router.push('/dashboard/cliente');
      }, 1500);
    } catch (err: any) {
      setError(err.message || t('Erro ao salvar dados.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4">
      <div className="max-w-lg w-full bg-[#0b1329] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-accent" />
          </div>
          <h1 className="font-heading text-2xl font-light text-white uppercase tracking-wide">
            {t('Completa tu registro')}
          </h1>
          <p className="text-[10px] text-muted-foreground mt-2">
            {t('Solo falta completar tus datos para finalizar tu cuenta.')}
          </p>
          <div className="mt-3 text-[10px] text-white/60">
            <p>{user?.name} — {user?.email}</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-4 text-xs text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-xl mb-4 text-xs text-center">
            {success}
          </div>
        )}

        <div className="flex flex-col gap-3">
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
                <Input type="tel" value={phone} onChange={e => setPhone(formatPhone(e.target.value, country))} placeholder={country === 'Brazil' ? '(11) 99999-9999' : t('Número de teléfono')} className="pl-12 bg-background border-white/10 text-white rounded-xl text-xs h-10" />
              </div>
            </div>
          </div>

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
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] uppercase font-bold text-accent">{t('Documento de Identificación')}</label>
            <div className="grid grid-cols-2 gap-2">
              <select value={documentType} onChange={e => setDocumentType(e.target.value)} className="flex h-10 w-full rounded-xl border border-white/10 bg-background px-3 py-2 text-xs text-white">
                {docTypes.map(d => (<option key={d.value} value={d.value}>{d.label}</option>))}
              </select>
              <Input type="text" value={documentNumber} onChange={e => setDocumentNumber(e.target.value)} placeholder={t('Número de documento')} className="bg-background border-white/10 text-white rounded-xl text-xs h-10" />
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-accent hover:bg-accentHover text-background font-bold py-3 rounded-xl text-xs mt-2 uppercase tracking-wider"
          >
            {saving ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t('Guardando...')}</>
            ) : (
              t('Completar Registro')
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
