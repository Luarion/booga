import { type NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from './src/lib/apiBaseUrl';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api') || pathname.startsWith('/setup')) {
    return NextResponse.next();
  }

  try {
    const response = await fetch(new URL('/api/setup', getApiBaseUrl()), {
      cache: 'no-store',
    });

    if (!response.ok) return NextResponse.next();

    const setupCompleted = (await response.json()) as boolean;
    if (setupCompleted) return NextResponse.next();

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/setup';
    redirectUrl.search = '';
    return NextResponse.redirect(redirectUrl);
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
