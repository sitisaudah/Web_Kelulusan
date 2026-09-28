/**
 * src/backend/lib/supabaseServer.js
 *
 * Helper khusus Server Components untuk mendapatkan session user yang aktif.
 * Menggunakan createServerClient() dari supabase.js sebagai fondasi.
 *
 * GUNAKAN FUNGSI INI DI:
 * - Server Components untuk cek user yang sedang login
 * - Middleware (middleware.js)
 *
 * JANGAN gunakan di Client Components — gunakan hook useUser() atau createBrowserClient() di sana.
 */

import { createServerClient } from './supabase';

// ============================================================
// getUser
// Mendapatkan data user yang sedang login dari sisi server.
// Aman: menggunakan getUser() bukan getSession() untuk validasi
// token yang sebenarnya ke Supabase Auth server.
// ============================================================
/**
 * Mendapatkan data user yang sedang login.
 * Memvalidasi token ke Supabase Auth server — tidak bisa dipalsukan.
 *
 * @returns {Promise<{ user: import('@supabase/supabase-js').User | null, supabase: import('@supabase/supabase-js').SupabaseClient }>}
 *
 * @example
 * // Di dalam Server Component:
 * import { getUser } from '@/backend/lib/supabaseServer';
 *
 * export default async function Dashboard() {
 *   const { user } = await getUser();
 *   if (!user) redirect('/login');
 *   return <div>Halo, {user.email}</div>;
 * }
 */
export async function getUser() {
  const supabase = await createServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    // Token tidak valid atau expired — kembalikan null tanpa throw
    // agar komponen bisa handle redirect dengan graceful
    return { user: null, supabase };
  }

  return { user, supabase };
}

// ============================================================
// getUserWithProfile
// Mendapatkan user + data profil (role, nama, NISN, dll) sekaligus.
// Untuk proteksi route berdasarkan role.
// ============================================================
/**
 * Mendapatkan user beserta data profil lengkap dari tabel `profiles`.
 *
 * @returns {Promise<{
 *   user: import('@supabase/supabase-js').User | null,
 *   profile: import('../../types').Profile | null,
 *   supabase: import('@supabase/supabase-js').SupabaseClient
 * }>}
 *
 * @example
 * // Proteksi halaman admin:
 * import { getUserWithProfile } from '@/backend/lib/supabaseServer';
 * import { redirect } from 'next/navigation';
 *
 * export default async function AdminPage() {
 *   const { user, profile } = await getUserWithProfile();
 *   if (!user || profile?.role !== 'admin') redirect('/login');
 *   return <AdminDashboard />;
 * }
 */
export async function getUserWithProfile() {
  const { user, supabase } = await getUser();

  if (!user) {
    return { user: null, profile: null, supabase };
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('[supabaseServer] Gagal mengambil profil:', error.message);
    return { user, profile: null, supabase };
  }

  return { user, profile, supabase };
}
