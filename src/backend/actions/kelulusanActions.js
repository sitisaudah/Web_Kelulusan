'use server';

/**
 * src/backend/actions/kelulusanActions.js
 *
 * Server Actions untuk Manajemen Data Kelulusan Siswa.
 * Sumber data 100% dari berkas Excel (.xlsx / .xls) yang diunggah oleh guru / admin sekolah.
 */

import { revalidatePath } from 'next/cache';
import { 
  getLocalGraduationData, 
  saveLocalGraduationData 
} from '@/backend/lib/localGraduationStore';
import { getLocalStudents } from '@/backend/lib/localStudentStore';

/**
 * Mendapatkan seluruh data dan statistik kelulusan dari berkas Excel yang diunggah oleh guru.
 */
export async function getGraduationDataAction() {
  try {
    const local = await getLocalGraduationData();

    // 1. Periksa berkas Excel kelulusan terunggah
    if (local?.source === 'excel' && Array.isArray(local.students) && local.students.length > 0) {
      const students = local.students;
      const total = students.length;
      const lulus = students.filter((s) => s.status === 'LULUS').length;
      const tidakLulus = total - lulus;

      return {
        success: true,
        source: 'excel',
        fileName: local.file_name || 'data_kelulusan.xlsx',
        lastUpdated: local.last_updated,
        total,
        lulus,
        tidakLulus,
        students,
      };
    }

    // 2. Fallback: Ambil data peserta didik yang diimpor dari file Excel Dapodik
    const localStudents = await getLocalStudents();
    if (localStudents && localStudents.length > 0) {
      const mappedStudents = localStudents.map((s) => {
        const rawStatus = (s.status || s.keterangan || 'LULUS').toString().toUpperCase().trim();
        const isLulus = !rawStatus.includes('TIDAK') && rawStatus !== '-';

        return {
          ...s,
          nama: s.nama,
          nipd: s.nipd || '-',
          jk: s.jk || 'L',
          nisn: s.nisn,
          tempat_lahir: s.tempat_lahir || '-',
          tanggal_lahir: s.tanggal_lahir,
          nik: s.nik || '-',
          agama: s.agama || 'Islam',
          nama_ayah: s.nama_ayah || '-',
          nama_ibu: s.nama_ibu || '-',
          status: isLulus ? 'LULUS' : 'TIDAK LULUS',
          raw_status: rawStatus,
        };
      });

      const total = mappedStudents.length;
      const lulus = mappedStudents.filter((s) => s.status === 'LULUS').length;
      const tidakLulus = total - lulus;

      return {
        success: true,
        source: 'excel',
        fileName: 'daftar_pd-SMP NEGERI 18 BUTON TENGAH-2026-2027.xlsx',
        lastUpdated: new Date().toISOString(),
        total,
        lulus,
        tidakLulus,
        students: mappedStudents,
      };
    }

    return {
      success: true,
      source: 'excel',
      fileName: 'Belum ada file diunggah',
      lastUpdated: null,
      total: 0,
      lulus: 0,
      tidakLulus: 0,
      students: [],
    };
  } catch (err) {
    console.error('[getGraduationDataAction Error]:', err);
    return {
      success: false,
      source: 'error',
      message: err.message || 'Gagal memuat data kelulusan.',
      total: 0,
      lulus: 0,
      tidakLulus: 0,
      students: [],
    };
  }
}

/**
 * Memeriksa status kelulusan siswa berdasarkan NISN dan Tanggal Lahir dari file Excel.
 *
 * @param {string} nisn
 * @param {string} tglLahir - format YYYY-MM-DD
 */
export async function checkGraduationAction(nisn, tglLahir) {
  if (!nisn || !tglLahir) {
    return {
      found: false,
      message: 'Harap lengkapi NISN dan Tanggal Lahir.',
    };
  }

  const cleanNisn = nisn.toString().trim();
  const digitsNisn = cleanNisn.replace(/\D/g, '');
  const strippedNisn = digitsNisn.replace(/^0+/, '');

  const normalizeDate = (d) => {
    if (!d) return '';
    const parts = d.toString().trim().replace(/[/.]/g, '-').split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      } else if (parts[2].length === 4) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    return d.toString().trim();
  };

  const targetDate = normalizeDate(tglLahir);

  const [dataRes, localStudents] = await Promise.all([
    getGraduationDataAction(),
    getLocalStudents(),
  ]);

  const allList = [...(dataRes?.students || []), ...(localStudents || [])];

  const matched = allList.find((s) => {
    const sNisn = s.nisn?.toString().trim() || '';
    const sDigits = sNisn.replace(/\D/g, '');
    const sStripped = sDigits.replace(/^0+/, '');
    const matchNisn = sNisn === cleanNisn || sDigits === digitsNisn || (strippedNisn && sStripped === strippedNisn);
    const matchTgl = normalizeDate(s.tanggal_lahir) === targetDate;
    return matchNisn && matchTgl;
  });

  if (matched) {
    return {
      found: true,
      data: {
        ...matched,
        status: matched.status || 'LULUS',
      },
    };
  }

  return {
    found: false,
    message: `Data tidak ditemukan untuk NISN: ${cleanNisn} dan Tanggal Lahir: ${tglLahir}. Pastikan NISN dan tanggal lahir sesuai dengan data resmi sekolah.`,
  };
}

/**
 * Menyimpan data kelulusan yang di-parse dari file Excel guru.
 *
 * @param {any[]} rawStudents
 * @param {string} fileName
 */
export async function uploadGraduationExcelAction(rawStudents, fileName = 'kelulusan_siswa.xlsx') {
  if (!rawStudents || !Array.isArray(rawStudents) || rawStudents.length === 0) {
    return { success: false, message: 'Tidak ada data siswa dalam file Excel.' };
  }

  try {
    // Normalisasi format siswa dengan tetap mempertahankan seluruh 43 kolom
    const cleanList = rawStudents
      .filter((s) => s.nisn && s.nama)
      .map((s) => {
        const statusRaw = (s.status || s.keterangan || 'LULUS').toString().toUpperCase().trim();
        const isLulus = !statusRaw.includes('TIDAK') && statusRaw !== '-';

        return {
          ...s,
          nama: (s.nama || '').toString().trim(),
          nipd: (s.nipd || '-').toString().trim(),
          jk: (s.jk?.toString().toUpperCase() === 'P' || s.jk?.toString().toUpperCase().includes('PEREMPUAN') ? 'P' : 'L'),
          nisn: (s.nisn || '').toString().trim(),
          tempat_lahir: (s.tempat_lahir || s.tempat || '-').toString().trim(),
          tanggal_lahir: (s.tanggal_lahir || s.tanggal || '').toString().trim(),
          nik: (s.nik || '-').toString().trim(),
          agama: (s.agama || 'Islam').toString().trim(),
          nama_ayah: (s.nama_ayah || s.ayah || '-').toString().trim(),
          nama_ibu: (s.nama_ibu || s.ibu || '-').toString().trim(),
          nama_wali: (s.nama_wali || s.wali || '-').toString().trim(),
          status: isLulus ? 'LULUS' : 'TIDAK LULUS',
          raw_status: statusRaw,
        };
      });

    if (cleanList.length === 0) {
      return { success: false, message: 'Format Excel tidak valid. Wajib ada kolom Nama dan NISN.' };
    }

    await saveLocalGraduationData(cleanList, fileName);

    revalidatePath('/admin/kelulusan');
    revalidatePath('/admin');
    revalidatePath('/cek-kelulusan');

    return {
      success: true,
      message: `Berhasil mengimpor ${cleanList.length} data kelulusan dari file "${fileName}".`,
      count: cleanList.length,
    };
  } catch (err) {
    console.error('[uploadGraduationExcelAction Error]:', err);
    return { success: false, message: `Gagal menyimpan data Excel: ${err.message}` };
  }
}
