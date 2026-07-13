'use client';

import React, { useState } from 'react';
import { Mail, Lock, Loader2, AlertCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabaseAuth';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const cleanEmail = email.trim().toLowerCase();

      if (supabase) {
        // Attempt login using Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        });

        if (error) {
          throw error;
        }

        // Validate if logged-in user is an admin
        const adminEmails = ['admin@cheotnun.com', 'mauemglobal@gmail.com'];
        if (data.user && data.user.email && adminEmails.includes(data.user.email)) {
          // Success
          document.cookie = "cheotnun_admin_session=true; path=/; max-age=7200; SameSite=Lax";
          setSuccessMsg('✓ Autenticado com sucesso! Redirecionando...');
          setTimeout(() => {
            window.location.href = '/dashboard/admin';
          }, 1500);
        } else {
          // Signed in but not admin
          await supabase.auth.signOut();
          throw new Error('Acesso negado. Apenas administradores podem acessar esta área.');
        }
      } else {
        // Fallback local mock authentication
        if ((cleanEmail === 'admin@cheotnun.com' && password === 'admin123') || 
            (cleanEmail === 'mauemglobal@gmail.com' && password === 'Ja@que12')) {
          document.cookie = "cheotnun_admin_session=true; path=/; max-age=7200; SameSite=Lax";
          setSuccessMsg('✓ Autenticado com sucesso! (Modo de Demonstração)');
          setTimeout(() => {
            window.location.href = '/dashboard/admin';
          }, 1500);
        } else {
          throw new Error('E-mail ou senha incorretos para o painel administrativo.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocorreu um erro ao efetuar login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] grid place-items-center p-4">
      <div className="relative w-full max-w-md bg-[#0b0f19] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-accent/10 rounded-2xl mb-3 text-accent border border-accent/20">
            <Shield className="h-6 w-6" />
          </div>
          <span className="font-heading text-lg font-bold tracking-widest text-accent uppercase block">
            CHEOTNUN ENTERPRISE
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-1 block">
            Painel Administrativo - Acesso Restrito
          </span>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl mb-6 flex items-center gap-2 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3.5 rounded-xl mb-6 text-center text-xs">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4 text-xs">
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] uppercase font-bold text-accent">E-mail Administrativo</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-white/40" />
              <Input
                required
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@cheotnun.com"
                className="pl-9 bg-background border-white/10 text-white rounded-xl text-xs h-10"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 font-sans">
            <label className="text-[9px] uppercase font-bold text-accent">Senha de Acesso</label>
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

          <Button
            type="submit"
            disabled={loading}
            className="bg-accent hover:bg-accentHover text-background font-bold py-2.5 rounded-xl text-xs mt-3 flex items-center justify-center gap-2 h-10 w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Autenticando...
              </>
            ) : (
              'ENTRAR NO PAINEL'
            )}
          </Button>
        </form>

        <div className="text-center mt-6 text-[9px] text-muted-foreground">
          © 2026 Cheotnun K-Beauty. Todos os direitos reservados.
        </div>
      </div>
    </div>
  );
}
