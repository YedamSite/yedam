'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseAuth';

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        let user: any = null;

        if (window.location.hash && window.location.hash.includes('access_token')) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          if (accessToken && refreshToken && supabase) {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (error) throw error;
            user = data.user;
          }
        } else {
          // Already have a session (e.g. page refresh after redirect)
          const { data: { user: existingUser } } = await supabase!.auth.getUser();
          user = existingUser;
        }

        // Check if user exists in DB — if not, needs to complete profile
        if (user && supabase) {
          const { data: dbUser } = await supabase
            .from('cheotnun_users')
            .select('id')
            .eq('id', user.id)
            .maybeSingle();

          if (!dbUser) {
            if (typeof window !== 'undefined') {
              localStorage.setItem('cheotnun_needs_profile', 'true');
            }
            setStatus('success');
            setTimeout(() => {
              window.location.href = '/complete-profile';
            }, 1000);
            return;
          }
        }

        setStatus('success');
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#0b1329] border border-white/10 rounded-3xl p-8 shadow-2xl text-center">
        {status === 'processing' && (
          <>
            <div className="animate-spin h-10 w-10 border-2 border-accent border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-accent font-bold text-sm">Autenticando...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <p className="text-green-400 font-bold text-sm">Redirecionando...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
            <p className="text-red-400 font-bold text-sm">Erro ao autenticar. Redirecionando...</p>
          </>
        )}
      </div>
    </div>
  );
}
