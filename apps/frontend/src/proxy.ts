import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/', '/customers', '/appointments', '/revenue'];
const authRoutes = ['/login', '/register'];

function isTokenValid(token?: string | null): boolean {
  if (!token || token === 'undefined' || token === 'null' || !token.trim()) {
    return false;
  }
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    const payload = JSON.parse(jsonPayload);
    if (payload.exp && payload.exp * 1000 <= Date.now()) {
      return false; // Token is expired
    }
    return true;
  } catch {
    return false;
  }
}

export function proxy(request: NextRequest) {
  const rawAccessToken = request.cookies.get('accessToken')?.value;
  const hasValidToken = isTokenValid(rawAccessToken);
  const shouldPurgeLegacy = request.cookies.has('session_token');
  const { pathname } = request.nextUrl;

  // 1. Kiểm tra nếu chưa đăng nhập hoặc token đã hết hạn mà truy cập route yêu cầu bảo vệ
  const isProtected = protectedRoutes.some((route) =>
    route === '/' ? pathname === '/' : pathname.startsWith(route),
  );

  if (isProtected && !hasValidToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    const redirectRes = NextResponse.redirect(loginUrl);
    redirectRes.cookies.delete('accessToken');
    if (shouldPurgeLegacy) redirectRes.cookies.delete('session_token');
    return redirectRes;
  }

  // 2. Kiểm tra nếu đã đăng nhập và token còn hạn mà truy cập lại trang /login hoặc /register
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  if (isAuthRoute && hasValidToken) {
    const redirectRes = NextResponse.redirect(new URL('/', request.url));
    if (shouldPurgeLegacy) redirectRes.cookies.delete('session_token');
    return redirectRes;
  }

  const res = NextResponse.next();
  if (shouldPurgeLegacy) {
    res.cookies.delete('session_token');
  }
  if (rawAccessToken && !hasValidToken) {
    res.cookies.delete('accessToken');
  }
  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, svg, icons
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
