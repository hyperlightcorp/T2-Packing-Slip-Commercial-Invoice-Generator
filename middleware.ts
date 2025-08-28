// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Calculate SHA-256 (available in Edge/Middleware)
async function sha256(input: string) {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Released paths: login page, login/logout API, Next static resources
  const PUBLIC_PATHS = [
    '/login',
    '/api/login',
    '/api/logout',
  ];
  if (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/public')
  ) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get('auth')?.value;
  const expected = await sha256(process.env.SITE_PASSWORD || '');

  if (cookie === expected) {
    return NextResponse.next();
  }

  // Not authenticated, redirect to /login
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('redirect', pathname); // Redirect after login
  return NextResponse.redirect(url);
}

// Scope (does not protect static resources)
export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
};
