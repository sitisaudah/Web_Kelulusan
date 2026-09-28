/**
 * src/backend/lib/supabase.js
 *
 * Pusat inisialisasi semua Supabase client.
 * Ekspor tiga fungsi factory untuk tiga konteks berbeda:
 *
 * 1. createBrowserClient()  → untuk Client Components ('use client')
 * 2. createServerClient()   → untuk Server Components & Route Handlers
 * 3. createAdminClient()    → untuk operasi sensitif di Route Handlers (service_role)
 *
 * PENTING:
 * - createAdminClient() HANYA boleh dipanggil dari server-side (Route Handlers)
 * - Jangan pernah ekspos SUPABASE_SERVICE_ROLE_KEY ke browser
 */

import { createBrowserClient as _createBrowserClient } from '@supabase/ssr';
import { createServerClient as _createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// ============================================================
// Environment variables & Fallbacks
// ============================================================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';


// ============================================================
// 1. BROWSER CLIENT
// Gunakan di: Client Components ('use client')
// Menggunakan anon key — aman untuk browser
// ============================================================
/**
 * Buat Supabase client untuk Client Components.
 * Menggunakan cookie-based session dari @supabase/ssr agar sinkron dengan server.
 *
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 *
 * @example
 * // Di dalam Client Component:
 * 'use client';
 * import { createBrowserClient } from '@/backend/lib/supabase';
 * const supabase = createBrowserClient();
 * const { data } = await supabase.from('pengumuman').select('*');
 */
export function createBrowserClient() {
  return _createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// ============================================================
// 2. SERVER CLIENT
// Gunakan di: Server Components, Route Handlers, Server Actions
// Membaca dan menulis cookie untuk manajemen session
// ============================================================
/**
 * Buat Supabase client untuk konteks server (Server Components, Route Handlers).
 * Secara otomatis membaca session dari cookies untuk autentikasi.
 *
 * CATATAN: Harus dipanggil dalam async context karena `cookies()` adalah async di Next.js 15+.
 *
 * @returns {Promise<import('@supabase/supabase-js').SupabaseClient>}
 *
 * @example
 * // Di dalam Server Component atau Route Handler:
 * import { createServerClient } from '@/backend/lib/supabase';
 * const supabase = await createServerClient();
 * const { data: { user } } = await supabase.auth.getUser();
 */
export async function createServerClient() {
  const cookieStore = await cookies();

  return _createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // setAll dipanggil dari Server Component — cookies tidak bisa dimodifikasi.
          // Ini normal dan dapat diabaikan jika middleware sudah merefresh session.
        }
      },
    },
  });
}

// ============================================================
// 3. ADMIN CLIENT (Service Role)
// Gunakan di: Route Handlers untuk operasi admin sensitif
// Bypass semua RLS — gunakan dengan sangat hati-hati!
// ============================================================
/**
 * Buat Supabase client dengan service_role key.
 * Client ini **bypass semua RLS policies** — hanya gunakan untuk:
 * - Import/export data massal
 * - Operasi admin yang tidak bisa dilakukan oleh anon key
 * - Background jobs di server
 *
 * ⚠️  JANGAN gunakan di Client Components atau ekspos ke browser.
 * ⚠️  Selalu validasi otorisasi user di level aplikasi sebelum memanggil ini.
 *
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 *
 * @example
 * // Di dalam Route Handler (server-only):
 * import { createAdminClient } from '@/backend/lib/supabase';
 * const supabaseAdmin = createAdminClient();
 * await supabaseAdmin.from('profiles').update({ role: 'admin' }).eq('id', userId);
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      '[Supabase Admin] SUPABASE_SERVICE_ROLE_KEY wajib diisi di .env.local untuk operasi admin'
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      // Service role client tidak perlu menyimpan session
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
