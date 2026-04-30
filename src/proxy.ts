import createMiddleware from 'next-intl/middleware';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(req: NextRequest) {
  const isAuthRoute = /^\/[^/]+\/auth/.test(req.nextUrl.pathname);

  if (isAuthRoute) {
    return intlMiddleware(req);
  }

  const token = await getToken({ req });

  if (!token) {
    const locale = routing.locales.includes(req.nextUrl.pathname.split('/')[1] as (typeof routing.locales)[number])
      ? req.nextUrl.pathname.split('/')[1]
      : routing.defaultLocale;

    return NextResponse.redirect(new URL(`/${locale}/auth/login`, req.url));
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
