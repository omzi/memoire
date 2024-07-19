import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';
import { SIGN_IN_ROUTE, API_AUTH_PREFIX, DEFAULT_SIGN_IN_REDIRECT, metaRoutes, publicRoutes, authRoutes } from '#/lib/utils';

export const middleware = async (req: NextRequest, res: NextResponse) => {
  const { nextUrl } = req;
  const token = await getToken({ req });

  // Check for all unprotected routes...
  if (
    nextUrl.pathname.startsWith(API_AUTH_PREFIX) ||
    publicRoutes.includes(nextUrl.pathname) ||
    metaRoutes.includes(nextUrl.pathname)
  ) {
    return NextResponse.next();
  }

  // console.log('Middleware Token :>>', token);
  
  if (authRoutes.includes(nextUrl.pathname)) {
    if (token) {
      const url = new URL(DEFAULT_SIGN_IN_REDIRECT, nextUrl);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  if (!token) {
    const url = new URL(`${SIGN_IN_ROUTE}?next=${nextUrl.pathname}`, nextUrl);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
};

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)']
};
