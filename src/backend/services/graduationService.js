/**
 * src/backend/services/graduationService.js
 *
 * Layanan kelulusan siswa berbasis berkas Excel (.xlsx) sekolah.
 * Semua ketergantungan Google Spreadsheet telah dihapus sesuai kebijakan sekolah.
 */

import { getLocalGraduationData } from '@/backend/lib/localGraduationStore';
import { getLocalStudents } from '@/backend/lib/localStudentStore';

/**
 * Mengambil seluruh data siswa kelulusan dari berkas Excel yang diunggah.
 */
export async function getAllGraduationStudents() {
  const localGrad = await getLocalGraduationData();
  if (localGrad?.source === 'excel' && Array.isArray(localGrad.students) && localGrad.students.length > 0) {
    return localGrad.students;
  }

  const localStudents = await getLocalStudents();
  return (localStudents || []).map((s) => {
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
}

/**
 * Mencari data kelulusan siswa berdasarkan NISN dan Tanggal Lahir (YYYY-MM-DD).
 */
export async function checkGraduationStatus(nisn, tglLahir) {
  if (!nisn || !tglLahir) {
    return {
      found: false,
      message: 'Harap lengkapi NISN dan Tanggal Lahir.',
    };
  }

  const cleanNisn = nisn.toString().trim();
  const cleanTgl = tglLahir.toString().trim();
  const students = await getAllGraduationStudents();

  const matched = students.find((s) => {
    const sNisn = s.nisn?.toString().trim() || '';
    const matchNisn = sNisn === cleanNisn || sNisn.replace(/^0+/, '') === cleanNisn.replace(/^0+/, '');
    const matchTgl = s.tanggal_lahir === cleanTgl;
    return matchNisn && matchTgl;
  });

  if (matched) {
    return {
      found: true,
      data: matched,
    };
  }

  return {
    found: false,
    message: `Data tidak ditemukan untuk NISN: ${cleanNisn} dan Tanggal Lahir: ${cleanTgl}. Pastikan data sesuai berkas Excel Dapodik.`,
  };
}

/**
 * Menghitung rekapitulasi statistik kelulusan.
 */
export async function getGraduationStats() {
  const students = await getAllGraduationStudents();
  const total = students.length;
  const lulus = students.filter((s) => s.status === 'LULUS').length;
  const tidakLulus = total - lulus;

  return {
    total,
    lulus,
    tidakLulus,
    students,
  };
}
