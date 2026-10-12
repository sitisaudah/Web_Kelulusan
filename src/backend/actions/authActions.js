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
import { getLocalStudents } from '@/backend/lib/localStudentStore';
import { getLocalGraduationData } from '@/backend/lib/localGraduationStore';

/**
 * Cari data profil lengkap siswa berdasarkan NISN dari berkas Excel lokal (students.json / graduation.json)
 * maupun Supabase. Memastikan seluruh 43 kolom data Dapodik / Excel terambil utuh untuk siswa tersebut.
 *
 * @param {string} nisnInput
 */
export async function getStudentProfileByNisn(nisnInput) {
  if (!nisnInput) return null;
  const clean = nisnInput.toString().trim();
  const digits = clean.replace(/\D/g, '');
  const stripped = digits.replace(/^0+/, '');

  const isMatch = (targetNisn) => {
    if (!targetNisn) return false;
    const tStr = targetNisn.toString().trim();
    const tDigits = tStr.replace(/\D/g, '');
    const tStripped = tDigits.replace(/^0+/, '');
    return tStr === clean || tDigits === digits || (stripped && tStripped === stripped);
  };

  let studentObj = null;

  // 1. Prioritas: Ambil data komprehensif dari students.json (43 kolom Dapodik)
  try {
    const localStudents = await getLocalStudents();
    const found = localStudents.find((s) => isMatch(s.nisn));
    if (found) {
      studentObj = { ...found };
    }
  } catch (err) {
    console.warn('[getStudentProfileByNisn] Local students check notice:', err.message);
  }

  // 2. Gabungkan data status / nomor peserta dari graduation.json
  try {
    const gradData = await getLocalGraduationData();
    if (Array.isArray(gradData?.students)) {
      const foundGrad = gradData.students.find((s) => isMatch(s.nisn));
      if (foundGrad) {
        if (!studentObj) {
          studentObj = { ...foundGrad };
        } else {
          studentObj = {
            ...studentObj,
            status: foundGrad.status || studentObj.status || 'LULUS',
            nomor_peserta: foundGrad.nomor_peserta || studentObj.nomor_peserta || studentObj.nipd,
          };
        }
      }
    }
  } catch (err) {
    console.warn('[getStudentProfileByNisn] Local grad check notice:', err.message);
  }

  // 3. Fallback ke Supabase jika belum ditemukan
  if (!studentObj) {
    try {
      const supabase = await createServerClient();
      const { data: s } = await supabase
        .from('siswa')
        .select('*')
        .or(`nisn.eq.${clean},nisn.eq.${digits.padStart(10, '0')}`)
        .maybeSingle();
      if (s) {
        studentObj = { ...s };
      }
    } catch (err) {}
  }

  if (studentObj) {
    // Normalisasi field kunci
    studentObj.nama = studentObj.nama || 'Siswa SMPN 18';
    studentObj.nisn = (studentObj.nisn || clean).toString().padStart(10, '0');
    studentObj.status = studentObj.status || 'LULUS';
    return studentObj;
  }

  return null;
}

/**
 * Login untuk Siswa menggunakan NISN dan Password.
 * Siswa dapat login menggunakan NISN dan password akun Supabase,
 * ATAU menggunakan password default (Tanggal Lahir format YYYY-MM-DD / YYYYMMDD / DDMMYYYY, NISN, atau '123456')
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

  // 1. Coba pencocokan data siswa dari Excel Kelulusan / Dapodik Local Students
  try {
    const matched = await getStudentProfileByNisn(cleanNisn);

    if (matched) {
      const tglLahir = matched.tanggal_lahir?.toString().trim() || '';
      const tglParts = tglLahir.replace(/[/.]/g, '-').split('-');
      let ddmmyyyy = '';
      if (tglParts.length === 3 && tglParts[0].length === 4) {
        ddmmyyyy = `${tglParts[2].padStart(2, '0')}${tglParts[1].padStart(2, '0')}${tglParts[0]}`;
      }

      const validPasswords = [
        tglLahir,
        tglLahir.replace(/-/g, ''),
        ddmmyyyy,
        matched.nisn,
        cleanNisn,
        '123456',
        'smpn18',
        'smpn18buteng',
      ].filter(Boolean);

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
          user: { id: `siswa-${matched.nisn}`, email: matched.email || `${matched.nisn}@siswa.smpn18.sch.id` },
          profile: { role: 'siswa', nama_lengkap: matched.nama },
          studentData: matched,
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
    message: 'NISN atau password salah. Masukkan Tanggal Lahir Anda (format: YYYY-MM-DD, contoh: 2012-02-11) atau nomor NISN.',
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
        const nisnCandidate = user.email?.split('@')[0] || siswaNisnCookie;
        studentData = await getStudentProfileByNisn(nisnCandidate);
        if (!studentData) {
          const { data: s } = await supabase
            .from('siswa')
            .select('*')
            .or(`profile_id.eq.${user.id},nisn.eq.${nisnCandidate}`)
            .maybeSingle();
          studentData = s;
        }
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
    const student = await getStudentProfileByNisn(siswaNisnCookie);
    if (student) {
      return {
        user: { id: `siswa-${student.nisn}`, email: student.email || `${student.nisn}@siswa.smpn18.sch.id` },
        profile: { role: 'siswa', nama_lengkap: student.nama },
        studentData: student,
      };
    }

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
