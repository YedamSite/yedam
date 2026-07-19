'use client';

import React, { useState, useEffect } from 'react';
import { Lock, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabaseAuth';
import { useLanguage } from '@/context/LanguageContext';

export default function UpdatePasswordPage() {
  const { t } = useLanguage();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Check if we have a session (user was redirected here after clicking reset link)
    const checkSession = async () => {
      if (!supabase) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setReady(true);
      } else {
        // If no session, try to get it from URL hash (Supabase recovery redirect)
        if (window.location.hash && window.location.hash.includes('access_token')) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          if (accessToken && refreshToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (!error) {
              setReady(true);
              // Clean URL
              window.history.replaceState(null, '', '/auth/update-password');
            }
          }
        }
      }
    };
    checkSession();
  }, []);

  const handleUpdatePassword = async () => {
    if (password.length < 6) {
      setError(t('La contraseña debe tener al menos 6 caracteres.'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('Las contraseñas no coinciden.'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (!supabase) throw new Error('Supabase not configured');
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    } catch (err: any) {
      setError(err.message || t('Error al actualizar la contraseña.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#0b1329] border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-accent" />
          </div>
          <h1 className="font-heading text-2xl font-light text-white uppercase tracking-wide">
            {t('Nueva Contraseña')}
          </h1>
          <p className="text-[10px] text-muted-foreground mt-2">
            {t('Elige una nueva contraseña para tu cuenta.')}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-4 text-xs text-center flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {success ? (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-xl text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2" />
            <p className="text-xs font-bold">{t('✓ Contraseña actualizada. Redireccionando...')}</p>
          </div>
        ) : ready ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] uppercase font-bold text-accent">{t('Nueva Contraseña')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                <Input
                  required
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 bg-background border-white/10 text-white rounded-xl text-xs h-10"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] uppercase font-bold text-accent">{t('Confirmar contraseña')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                <Input
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 bg-background border-white/10 text-white rounded-xl text-xs h-10"
                />
              </div>
            </div>
            <Button
              onClick={handleUpdatePassword}
              disabled={loading || !password || !confirmPassword}
              className="w-full bg-accent hover:bg-accentHover text-background font-bold py-3 rounded-xl text-xs mt-2 uppercase tracking-wider"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t('Actualizando...')}</>
              ) : (
                t('CAMBIAR CONTRASEÑA')
              )}
            </Button>
          </div>
        ) : (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 text-accent animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
