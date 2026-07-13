import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Only protect /dashboard/admin and its subroutes
  if (path.startsWith('/dashboard/admin')) {
    // Exclude the login route itself to prevent redirect loops
    if (path === '/dashboard/admin/login') {
      return NextResponse.next();
    }

    const sessionCookie = request.cookies.get('cheotnun_admin_session');

    // If session cookie is missing or not set to true, redirect to login
    if (!sessionCookie || sessionCookie.value !== 'true') {
      const loginUrl = new URL('/dashboard/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/admin/:path*',
  ],
};
