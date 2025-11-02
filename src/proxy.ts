import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

/**
 * Middleware to protect API routes
 * Performs a fast initial check using session cookie
 * Individual routes use withAuth() for full session validation
 */
export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  
  if (!sessionCookie) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  return NextResponse.next();
}

export const config = {
  // Protect all API routes except /api/auth/*
  matcher: '/api/((?!auth).*)',
};

