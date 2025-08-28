// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Edge/Node compatible SHA-256 function
async function sha256(input: string) {
  if (typeof crypto !== 'undefined' && (crypto as any).subtle) {
    const data = new TextEncoder().encode(input);
    const buf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback for environments without Web Crypto API
  const { createHash } = await import('crypto');
  return createHash('sha256').update(input).digest('hex');
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow access to login page and API routes
  if (pathname === '/login' || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Check authentication
  const authCookie = request.cookies.get('auth');
  
  if (!authCookie) {
    // Redirect to login with current path as redirect parameter
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify the auth cookie
  const sitePassword = process.env.SITE_PASSWORD;
  if (!sitePassword) {
    console.error('SITE_PASSWORD environment variable not set');
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const expectedHash = await sha256(sitePassword);
    if (authCookie.value !== expectedHash) {
      // Invalid auth cookie, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  } catch (error) {
    console.error('Error validating auth cookie:', error);
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};