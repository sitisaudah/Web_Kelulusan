/**
 * src/backend/services/graduationService.js
 *
 * Layanan khusus data kelulusan dari Google Spreadsheet.
 * Mengisolasi seluruh proses fetching, parsing CSV (PapaParse),
 * pencarian NISN & tanggal lahir, serta normalisasi data siswa.
 */

import Papa from 'papaparse';

// URL Google Sheets resmi yang dipublikasikan sebagai CSV
export const DEFAULT_GOOGLE_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTUVq4l9uDPXQLj8S3BBa0lrRWvNWATwEzjtdhzfJvDMMVfGR5PIODosccCS9KOgYPT9OIm5jPoLSMD/pub?output=csv';

/**
 * Mengambil seluruh data mentah dari Google Spreadsheet CSV.
 *
 * @param {string} [sheetUrl] - URL opsional (fallback ke DEFAULT_GOOGLE_SHEET_URL)
 * @returns {Promise<any[][]>} Array baris spreadsheet
 */
export async function fetchRawGraduationSheet(sheetUrl = DEFAULT_GOOGLE_SHEET_URL) {
  // Gunakan native fetch yang didukung di browser maupun Node.js/Next.js server
  const response = await fetch(sheetUrl);
  if (!response.ok) {
    throw new Error(`Gagal mengambil data Google Spreadsheet (HTTP ${response.status})`);
  }
  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          resolve(results.data);
        } else {
          reject(new Error('Data Google Spreadsheet kosong atau tidak dapat diakses.'));
        }
      },
      error: (err) => {
        reject(new Error(`Gagal memuat Google Spreadsheet: ${err.message || err}`));
      },
    });
  });
}

/**
 * Mencari index baris header dan pemetaan index setiap kolom.
 *
 * @param {any[][]} allRows
 * @returns {{ headerIndex: number, columns: Record<string, number> } | null}
 */
function resolveSheetHeaders(allRows) {
  const headerIndex = allRows.findIndex((row) =>
    row.some((cell) => cell?.toString().toLowerCase().includes('nisn'))
  );

  if (headerIndex === -1) return null;

  const headerRow = allRows[headerIndex];
  // Sub-header berikutnya (untuk mendeteksi Ayah / Ibu jika ada)
  const subHeaderRow = allRows[headerIndex + 1] || [];

  const getIdx = (term, exact = false) =>
    headerRow.findIndex((cell) => {
      const val = cell?.toString().toLowerCase().trim() || '';
      return exact ? val === term.toLowerCase() : val.includes(term.toLowerCase());
    });

  let idxAyah = getIdx('ayah');
  let idxIbu = getIdx('ibu');

  // Jika kolom orang tua ada di sub-header row (baris berikutnya)
  if (idxAyah === -1 || idxIbu === -1) {
    const subAyah = subHeaderRow.findIndex((c) =>
      c?.toString().toLowerCase().includes('ayah')
    );
    const subIbu = subHeaderRow.findIndex((c) =>
      c?.toString().toLowerCase().includes('ibu')
    );
    if (subAyah !== -1) idxAyah = subAyah;
    if (subIbu !== -1) idxIbu = subIbu;
  }

  return {
    headerIndex: (idxAyah !== -1 && subHeaderRow.length > 0 && subHeaderRow.some(c => c?.toString().toLowerCase().includes('ayah'))) ? headerIndex + 1 : headerIndex,
    columns: {
      nama: getIdx('nama'),
      nipd: getIdx('nipd'),
      jk: getIdx('jk'),
      nisn: getIdx('nisn'),
      tempat: getIdx('tempat'),
      tanggal: getIdx('tanggal'),
      nik: getIdx('nik'),
      agama: getIdx('agama'),
      ayah: idxAyah,
      ibu: idxIbu,
      keterangan: getIdx('keterangan') !== -1 ? getIdx('keterangan') : getIdx('status'),
    },
  };
}

/**
 * Menormalisasi baris array Google Sheet menjadi object siswa terstruktur.
 *
 * @param {any[]} row
 * @param {Record<string, number>} cols
 * @returns {GraduationStudent}
 */
export function normalizeStudentRow(row, cols) {
  const getVal = (idx) => (idx !== -1 && row[idx] != null ? row[idx].toString().trim() : '-');

  const statusRaw = getVal(cols.keterangan);
  const isLulus = !statusRaw.toUpperCase().includes('TIDAK') && statusRaw !== '-';

  return {
    nama: getVal(cols.nama),
    nipd: getVal(cols.nipd),
    jk: getVal(cols.jk),
    nisn: getVal(cols.nisn),
    tempat_lahir: getVal(cols.tempat),
    tanggal_lahir: getVal(cols.tanggal),
    nik: getVal(cols.nik),
    agama: getVal(cols.agama),
    nama_ayah: getVal(cols.ayah),
    nama_ibu: getVal(cols.ibu),
    status: isLulus ? 'LULUS' : 'TIDAK LULUS',
    raw_status: statusRaw,
  };
}

/**
 * Mengambil dan menormalisasi seluruh siswa kelulusan dari Google Spreadsheet.
 *
 * @param {string} [sheetUrl]
 * @returns {Promise<GraduationStudent[]>}
 */
export async function getAllGraduationStudents(sheetUrl = DEFAULT_GOOGLE_SHEET_URL) {
  const allRows = await fetchRawGraduationSheet(sheetUrl);
  const resolved = resolveSheetHeaders(allRows);

  if (!resolved) {
    throw new Error('Gagal mengenali struktur tabel Google Spreadsheet kelulusan.');
  }

  const { headerIndex, columns } = resolved;
  const dataRows = allRows.slice(headerIndex + 1);

  const students = [];
  for (const row of dataRows) {
    // Lewati baris kosong atau baris judul tanpa NISN
    const nisnVal = columns.nisn !== -1 ? row[columns.nisn]?.toString().trim() : '';
    if (!nisnVal || nisnVal.toLowerCase().includes('nisn')) continue;

    students.push(normalizeStudentRow(row, columns));
  }

  return students;
}

/**
 * Mencari data kelulusan siswa berdasarkan NISN dan Tanggal Lahir (YYYY-MM-DD).
 *
 * @param {string} nisn
 * @param {string} tglLahir - format YYYY-MM-DD
 * @param {string} [sheetUrl]
 * @returns {Promise<{ found: boolean, data?: GraduationStudent, message?: string }>}
 */
export async function checkGraduationStatus(nisn, tglLahir, sheetUrl = DEFAULT_GOOGLE_SHEET_URL) {
  if (!nisn || !tglLahir) {
    return {
      found: false,
      message: 'Harap lengkapi NISN dan Tanggal Lahir.',
    };
  }

  const cleanNisn = nisn.toString().trim();
  const cleanTgl = tglLahir.toString().trim();

  const students = await getAllGraduationStudents(sheetUrl);

  const matched = students.find((s) => {
    // Cocokkan NISN (hilangkan leading zero jika ada perbedaan format atau periksa exact match)
    const matchNisn = s.nisn === cleanNisn || s.nisn.replace(/^0+/, '') === cleanNisn.replace(/^0+/, '');
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
    message: `Data tidak ditemukan untuk NISN: ${cleanNisn} dan Tanggal Lahir: ${cleanTgl}. Pastikan data sesuai Dapodik.`,
  };
}

/**
 * Menghitung rekapitulasi statistik kelulusan untuk Dashboard Admin.
 *
 * @param {string} [sheetUrl]
 * @returns {Promise<{ total: number, lulus: number, tidakLulus: number, students: GraduationStudent[] }>}
 */
export async function getGraduationStats(sheetUrl = DEFAULT_GOOGLE_SHEET_URL) {
  const students = await getAllGraduationStudents(sheetUrl);
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
