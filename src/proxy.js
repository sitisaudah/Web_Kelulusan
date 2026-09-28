import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

/**
 * proxy.js (pengganti middleware.js di Next.js 16+)
 *
 * Dijalankan di Edge Runtime sebelum setiap request.
 * Memproteksi route /admin dan /siswa, merefresh session Supabase,
 * dan menjaga backward compatibility dengan admin_session cookie.
 *
 * @param {import('next/server').NextRequest} request
 */
export async function proxy(request) {
  const { pathname } = request.nextUrl;

  const isLegacyAdminLogin = pathname === '/admin/login';
  const isUnifiedLogin = pathname === '/login';
  const legacyAdminSession = request.cookies.get('admin_session')?.value;
  const studentSession = request.cookies.get('siswa_session')?.value;

  // Response awal
  let supabaseResponse = NextResponse.next({ request });

  // Cek apakah Supabase URL sudah diisi dan bukan placeholder
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isSupabaseConfigured =
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-project-ref');

  let user = null;
  let profile = null;

  if (isSupabaseConfigured) {
    try {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      });

      const { data } = await supabase.auth.getUser();
      user = data?.user || null;

      if (user) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('role, nama_lengkap')
          .eq('id', user.id)
          .single();
        profile = prof;
      }
    } catch (err) {
      console.warn('[Proxy Warning] Supabase auth check failed:', err.message);
    }
  }

  const isStaff = legacyAdminSession === 'active' || profile?.role === 'admin' || profile?.role === 'guru';
  const isStudent = studentSession === 'active' || profile?.role === 'siswa';

  // ============================================================
  // PENGALIHAN JIKA SUDAH LOGIN SAAT AKSES HALAMAN LOGIN
  // ============================================================
  if (isUnifiedLogin || isLegacyAdminLogin) {
    if (isStaff) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    if (isStudent) {
      return NextResponse.redirect(new URL('/siswa/dashboard', request.url));
    }
    return supabaseResponse;
  }

  // ============================================================
  // PROTEKSI ROUTE /admin/*
  // ============================================================
  if (pathname.startsWith('/admin')) {
    if (!isStaff) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('tab', 'staff');
      redirectUrl.searchParams.set('message', 'Silakan login sebagai Guru/Admin terlebih dahulu');
      return NextResponse.redirect(redirectUrl);
    }
  }

  // ============================================================
  // PROTEKSI ROUTE /siswa/*
  // ============================================================
  if (pathname.startsWith('/siswa')) {
    if (!isStudent && !isStaff) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('tab', 'siswa');
      redirectUrl.searchParams.set('message', 'Silakan login sebagai Siswa untuk mengakses portal');
      return NextResponse.redirect(redirectUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};
