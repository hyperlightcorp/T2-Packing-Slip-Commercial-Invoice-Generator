// app/api/logout/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  // clear auth（HttpOnly）cookie
  res.headers.append(
    'Set-Cookie',
    'auth=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'
  );
  return res;
}

