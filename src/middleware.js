import { NextResponse } from 'next/server';

export function middleware(request) {
  // Ambil data cookie login
  const isLoggedIn = request.cookies.get('admin_session');
  const isLoginPage = request.nextUrl.pathname === '/admin/login';

  // Jika belum login dan mencoba akses halaman admin (selain halaman login)
  if (!isLoggedIn && !isLoginPage && request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Jika sudah login dan mencoba akses halaman login lagi, lempar ke dashboard
  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

// Tentukan halaman mana saja yang dijaga oleh satpam ini
export const config = {
  matcher: ['/admin/:path*'],
};