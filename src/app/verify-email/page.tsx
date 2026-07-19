'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { authService, supabase } from '@/lib/supabaseAuth';

export default function VerifyEmailPage() {
  const { t } = useLanguage();
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendError, setResendError] = useState('');

  useEffect(() => {
    const savedEmail = typeof window !== 'undefined' ? localStorage.getItem('cheotnun_pending_email') : null;
    if (savedEmail) setEmail(savedEmail);
  }, []);

  useEffect(() => {
    const checkConfirmation = async () => {
      if (confirmed) return;
      try {
        const user = await authService.getCurrentUserFromSupabase();
        if (user && user.email_confirmed_at) {
          setConfirmed(true);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('cheotnun_pending_email');
          }
          if (supabase) {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
              setTimeout(() => {
                window.location.href = '/dashboard/cliente';
              }, 2000);
            }
          }
        }
      } catch (e) {
        // Ignore errors during polling
      }
    };

    const interval = setInterval(checkConfirmation, 3000);
    return () => clearInterval(interval);
  }, [confirmed]);

  const handleResendEmail = async () => {
    if (!email || !supabase) return;
    setResendLoading(true);
    setResendError('');
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: window.location.origin + '/auth/callback'
        }
      });
      if (error) throw error;
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 5000);
    } catch (err: any) {
      if (err.message?.includes('rate limit') || err.message?.includes('too many requests')) {
        setResendError(t('Aguarde alguns minutos antes de reenviar.'));
      } else {
        setResendError(err.message || t('Erro ao reenviar e-mail.'));
      }
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#0b1329] border border-white/10 rounded-3xl p-8 shadow-2xl">
        {confirmed ? (
          <>
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
              <h1 className="font-heading text-2xl font-light text-white uppercase tracking-wide">
                {t('E-mail confirmado!')}
              </h1>
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                {t('Redirecionando para sua conta...')}
              </p>
            </div>
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 text-accent animate-spin" />
            </div>
          </>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-4">
                <Mail className="h-8 w-8 text-accent" />
              </div>
              <h1 className="font-heading text-2xl font-light text-white uppercase tracking-wide">
                {t('Verifique seu e-mail')}
              </h1>
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                {t('Enviamos um link de confirmação para o seu e-mail.')}
              </p>
            </div>

            {/* Message Box */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-200 leading-relaxed">
                  <p className="font-bold mb-1">{t('Quase lá!')}</p>
                  <p>
                    {t('Para acessar sua conta, você precisa confirmar seu endereço de e-mail. Clique no link que enviamos para ativar sua conta.')}
                  </p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-secondary/30 border border-white/5 rounded-xl p-4 mb-6">
              <h3 className="text-xs font-bold text-accent uppercase tracking-wider mb-3">
                {t('O que fazer agora:')}
              </h3>
              <ol className="flex flex-col gap-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">1.</span>
                  <span>{t('Abra sua caixa de entrada')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">2.</span>
                  <span>{t('Procure o e-mail de confirmação da Cheotnun')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">3.</span>
                  <span>{t('Clique no link de confirmação')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">4.</span>
                  <span>{t('Faça login normalmente')}</span>
                </li>
              </ol>
            </div>

            {/* Email info */}
            {email && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-4 text-center">
                <p className="text-[10px] text-muted-foreground">
                  {t('E-mail:')} <span className="text-white font-bold">{email}</span>
                </p>
              </div>
            )}

            {/* Resend Error */}
            {resendError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-center">
                <p className="text-xs text-red-400 font-bold">{resendError}</p>
              </div>
            )}

            {/* Resend Email */}
            {emailSent ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 mb-4 text-center">
                <p className="text-xs text-green-400 font-bold">
                  {t('✓ E-mail de confirmação reenviado!')}
                </p>
              </div>
            ) : (
              <Button
                onClick={handleResendEmail}
                disabled={resendLoading || !email}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/5 font-bold text-xs py-3 rounded-xl mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                {resendLoading ? t('Reenviando...') : t('Reenviar e-mail de confirmação')}
              </Button>
            )}

            {/* Back to Login */}
            <Link href="/">
              <Button
                variant="ghost"
                className="w-full text-muted-foreground hover:text-white font-bold text-xs py-3"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('Voltar para o início')}
              </Button>
            </Link>

            {/* Help Text */}
            <div className="mt-6 text-center">
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                {t('Não encontrou o e-mail?')}{' '}
                <span className="text-accent">{t('Verifique sua caixa de spam ou lixo eletrônico.')}</span>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}