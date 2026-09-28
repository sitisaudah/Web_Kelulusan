'use server';

/**
 * src/backend/actions/authActions.js
 *
 * Server Actions untuk Autentikasi Supabase & Fallback Kredensial Sekolah.
 * Mendukung login siswa via NISN, login staff via email/username, logout, dan session getter.
 */

import { createServerClient } from '@/backend/lib/supabase';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAllGraduationStudents } from '@/backend/services/graduationService';

/**
 * Login untuk Siswa menggunakan NISN dan Password.
 * Siswa dapat login menggunakan NISN dan password akun Supabase,
 * ATAU menggunakan password default (Tanggal Lahir format YYYY-MM-DD atau '123456')
 * yang dicocokkan otomatis dari database kelulusan / Dapodik.
 *
 * @param {{ nisn: string, password: string }} credentials
 */
export async function loginSiswaAction({ nisn, password }) {
  if (!nisn || !password) {
    return { success: false, message: 'NISN dan password wajib diisi.' };
  }

  const cleanNisn = nisn.toString().trim();
  const cleanPass = password.toString().trim();
  const cookieStore = await cookies();

  // 1. Coba pencocokan data siswa dari Google Sheet / Dapodik
  try {
    const sheetStudents = await getAllGraduationStudents();
    const matched = sheetStudents.find(
      (s) => s.nisn === cleanNisn || s.nisn.replace(/^0+/, '') === cleanNisn.replace(/^0+/, '')
    );

    if (matched) {
      const validPasswords = [
        matched.tanggal_lahir,
        matched.tanggal_lahir.replace(/-/g, ''),
        '123456',
        'smpn18',
        'smpn18buteng',
      ];

      if (validPasswords.includes(cleanPass)) {
        cookieStore.set('siswa_session', 'active', {
          maxAge: 3600 * 24,
          path: '/',
          httpOnly: false,
        });
        cookieStore.set('siswa_nisn', matched.nisn, {
          maxAge: 3600 * 24,
          path: '/',
          httpOnly: false,
        });

        return {
          success: true,
          user: { id: `siswa-${matched.nisn}`, email: `${matched.nisn}@siswa.smpn18.sch.id` },
          profile: { role: 'siswa', nama_lengkap: matched.nama },
          studentData: {
            nama: matched.nama,
            nisn: matched.nisn,
            nipd: matched.nipd,
            nik: matched.nik,
            kelas: 'IX',
            tempat_lahir: matched.tempat_lahir,
            tanggal_lahir: matched.tanggal_lahir,
            jk: matched.jk,
            agama: matched.agama,
            nama_ayah: matched.nama_ayah,
            nama_ibu: matched.nama_ibu,
          },
        };
      }
    }
  } catch (err) {
    console.warn('[loginSiswaAction] Fallback check notice:', err.message);
  }

  // 2. Coba autentikasi via Supabase Auth jika akun sudah terdaftar di Supabase
  try {
    const supabase = await createServerClient();
    const emailCandidate = cleanNisn.includes('@')
      ? cleanNisn
      : `${cleanNisn}@siswa.smpn18.sch.id`;

    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailCandidate,
      password: cleanPass,
    });

    if (!error && data?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, nama_lengkap')
        .eq('id', data.user.id)
        .single();

      cookieStore.set('siswa_session', 'active', {
        maxAge: 3600 * 24,
        path: '/',
        httpOnly: false,
      });

      return { success: true, user: data.user, profile };
    }
  } catch (err) {
    // Supabase belum terkonfigurasi atau error
  }

  return {
    success: false,
    message: 'NISN atau password salah. (Petunjuk password default: Tanggal Lahir YYYY-MM-DD atau 123456)',
  };
}

/**
 * Login untuk Guru dan Admin menggunakan Email atau Username dan Password resmi.
 * Mendukung username legacy "adminsmpn18buteng" dan password "smpn18butengjaya"
 * maupun akun email di Supabase Auth.
 *
 * @param {{ email: string, password: string }} credentials
 */
export async function loginStaffAction({ email, password }) {
  if (!email || !password) {
    return { success: false, message: 'Username/Email dan password wajib diisi.' };
  }

  const cleanInput = email.trim().toLowerCase();
  const cleanPassword = password.trim();
  const cookieStore = await cookies();

  // 1. Dukung kredensial admin default/legacy sekolah secara langsung
  if (
    (cleanInput === 'adminsmpn18buteng' ||
      cleanInput === 'admin' ||
      cleanInput === 'admin@smpn18.sch.id') &&
    cleanPassword === 'smpn18butengjaya'
  ) {
    // Beri cookie admin_session
    cookieStore.set('admin_session', 'active', {
      maxAge: 3600 * 24, // 24 jam
      path: '/',
      httpOnly: false,
    });

    return {
      success: true,
      user: { id: 'admin-local-id', email: 'admin@smpn18.sch.id' },
      profile: {
        id: 'admin-local-id',
        role: 'admin',
        nama_lengkap: 'Administrator SMPN 18 Buton Tengah',
        email: 'admin@smpn18.sch.id',
      },
    };
  }

  // 2. Jika bukan kredensial legacy, coba login ke Supabase Auth
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanInput,
      password: cleanPassword,
    });

    if (error) {
      return {
        success: false,
        message: 'Username/Email atau password salah! Periksa kembali.',
      };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, nama_lengkap')
      .eq('id', data.user.id)
      .single();

    if (profile && profile.role !== 'admin' && profile.role !== 'guru') {
      await supabase.auth.signOut();
      return { success: false, message: 'Akses ditolak: Akun ini bukan akun Admin atau Guru.' };
    }

    // Set juga cookie fallback untuk kompatibilitas
    cookieStore.set('admin_session', 'active', {
      maxAge: 3600 * 24,
      path: '/',
      httpOnly: false,
    });

    return { success: true, user: data.user, profile };
  } catch (err) {
    console.error('[loginStaffAction Error]:', err);
    return {
      success: false,
      message: 'Username/Password salah, atau server autentikasi belum terhubung.',
    };
  }
}

/**
 * Logout dari sistem (menghapus session Supabase dan seluruh cookie sesi).
 */
export async function logoutAction() {
  try {
    const supabase = await createServerClient();
    await supabase.auth.signOut();
  } catch (err) {
    // Abaikan jika Supabase belum aktif
  }

  const cookieStore = await cookies();
  try {
    cookieStore.delete('admin_session');
    cookieStore.delete('siswa_session');
    cookieStore.delete('siswa_nisn');
  } catch {
    // Abaikan
  }

  redirect('/login');
}

/**
 * Mendapatkan data sesi user yang sedang aktif beserta profil dari database / session cookies.
 */
export async function getCurrentUserAction() {
  const cookieStore = await cookies();
  const isAdminActive = cookieStore.get('admin_session')?.value === 'active';
  const isSiswaActive = cookieStore.get('siswa_session')?.value === 'active';
  const siswaNisnCookie = cookieStore.get('siswa_nisn')?.value;

  // Cek sesi Supabase Auth terlebih dahulu
  try {
    const supabase = await createServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (!error && user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      let studentData = null;
      if (profile?.role === 'siswa') {
        const { data: s } = await supabase
          .from('siswa')
          .select('*')
          .or(`profile_id.eq.${user.id},nisn.eq.${user.email?.split('@')[0]}`)
          .maybeSingle();
        studentData = s;
      }

      return { user, profile, studentData };
    }
  } catch (err) {
    // Lanjut ke pemeriksaan fallback cookie
  }

  // Fallback Sesi Admin
  if (isAdminActive) {
    return {
      user: { id: 'admin-local-id', email: 'admin@smpn18.sch.id' },
      profile: {
        id: 'admin-local-id',
        role: 'admin',
        nama_lengkap: 'Administrator SMPN 18 Buton Tengah',
        email: 'admin@smpn18.sch.id',
      },
      studentData: null,
    };
  }

  // Fallback Sesi Siswa
  if (isSiswaActive && siswaNisnCookie) {
    try {
      const sheetStudents = await getAllGraduationStudents();
      const s = sheetStudents.find(
        (st) => st.nisn === siswaNisnCookie || st.nisn.replace(/^0+/, '') === siswaNisnCookie.replace(/^0+/, '')
      );

      if (s) {
        return {
          user: { id: `siswa-${s.nisn}`, email: `${s.nisn}@siswa.smpn18.sch.id` },
          profile: { role: 'siswa', nama_lengkap: s.nama },
          studentData: {
            nama: s.nama,
            nisn: s.nisn,
            nipd: s.nipd,
            nik: s.nik,
            kelas: 'IX',
            tempat_lahir: s.tempat_lahir,
            tanggal_lahir: s.tanggal_lahir,
            jk: s.jk,
            agama: s.agama,
            nama_ayah: s.nama_ayah,
            nama_ibu: s.nama_ibu,
          },
        };
      }
    } catch (e) {}

    return {
      user: { id: 'siswa-session-id', email: `${siswaNisnCookie}@siswa.smpn18.sch.id` },
      profile: { role: 'siswa', nama_lengkap: 'Siswa SMPN 18' },
      studentData: {
        nama: 'Siswa SMPN 18',
        nisn: siswaNisnCookie,
        kelas: 'IX',
      },
    };
  }

  return { user: null, profile: null, studentData: null };
}
