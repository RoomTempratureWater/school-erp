import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET || 'fallback_secret_key_for_development';
const encodedKey = new TextEncoder().encode(secretKey);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup');

  let isAuthenticated = false;
  let userRole: string | undefined;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, encodedKey, { algorithms: ['HS256'] });
      isAuthenticated = true;
      userRole = payload.role as string;
    } catch (err) {
      isAuthenticated = false;
    }
  }

  // Redirect unauthenticated users to login
  if (!isAuthenticated && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // RBAC: Management users cannot access school year setup
  if (isAuthenticated && userRole === 'MANAGEMENT' && request.nextUrl.pathname.startsWith('/school-year-setup')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Inject the pathname to headers so Server Components can read it
  const response = NextResponse.next();
  response.headers.set('x-pathname', request.nextUrl.pathname);
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
