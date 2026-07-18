import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Proteger todas as rotas do dashboard (admin e cliente)
  if (path.startsWith('/dashboard')) {
    // Permitir acesso à página de verify-email
    if (path === '/verify-email') {
      return NextResponse.next();
    }

    // Verificar sessão do usuário
    const sessionCookie = request.cookies.get('cheotnun_session');

    // Se não houver sessão, redirecionar para login
    if (!sessionCookie) {
      if (path.startsWith('/dashboard/admin')) {
        const loginUrl = new URL('/dashboard/admin/login', request.url);
        return NextResponse.redirect(loginUrl);
      } else {
        // Dashboard do cliente - redirecionar para home ou login
        const homeUrl = new URL('/', request.url);
        return NextResponse.redirect(homeUrl);
      }
    }

    try {
      // Verificar se o e-mail está confirmado
      const sessionData = JSON.parse(sessionCookie.value);
      const emailConfirmed = sessionData.email_confirmed_at !== null && sessionData.email_confirmed_at !== undefined;

      // Se e-mail não estiver confirmado, redirecionar para verify-email
      if (!emailConfirmed && path !== '/verify-email') {
        const verifyUrl = new URL('/verify-email', request.url);
        return NextResponse.redirect(verifyUrl);
      }
    } catch (error) {
      console.error('Error parsing session cookie:', error);
      // Se houver erro ao parsear, redirecionar para login
      if (path.startsWith('/dashboard/admin')) {
        const loginUrl = new URL('/dashboard/admin/login', request.url);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/verify-email',
  ],
};
