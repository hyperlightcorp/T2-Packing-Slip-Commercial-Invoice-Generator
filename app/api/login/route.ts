// app/api/login/route.ts
import { NextResponse } from 'next/server';

// Edge/Node
async function sha256(input: string) {
  // Web Crypto
  if (typeof crypto !== 'undefined' && (crypto as any).subtle) {
    const data = new TextEncoder().encode(input);
    const buf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  const { createHash } = await import('crypto');
  return createHash('sha256').update(input).digest('hex');
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const password = String(formData.get('password') || '');
  const sitePassword = process.env.SITE_PASSWORD;

  if (!sitePassword) {
    return NextResponse.json({ ok: false, error: 'SITE_PASSWORD not set' }, { status: 500 });
  }
  if (password !== sitePassword) {
    return NextResponse.json({ ok: false, error: 'Invalid password' }, { status: 401 });
  }

  const value = await sha256(sitePassword);

  const res = NextResponse.json({ ok: true });
  res.headers.append(
    'Set-Cookie',
    `auth=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 12}`
  );
  return res;
}
