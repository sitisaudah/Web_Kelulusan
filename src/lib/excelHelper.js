import * as XLSX from 'xlsx';

/**
 * Helper pembaca dan pembuat file Excel (.xlsx, .xls, .csv).
 * Disesuaikan khusus untuk format Dapodik resmi SMP Negeri 18 Buton Tengah:
 * - Identitas Siswa (No, Nama, NIPD, JK, NISN, Tempat & Tanggal Lahir, NIK, Agama)
 * - Data Alamat (Alamat, RT, RW, Dusun, Kelurahan/Desa, Kecamatan, Kode Pos)
 * - Informasi Tinggal & Kontak (Jenis Tinggal, Alat Transportasi, Telepon, HP, E-mail, SKHUN, Penerima KPS, No. KPS)
 * - Data Orang Tua/Wali (Nama Ayah/Ibu/Wali, Tahun Lahir, Pendidikan, Pekerjaan, Penghasilan, NIK)
 * - Rombel Saat Ini (Kelas/Rombongan Belajar)
 */

/**
 * Normalisasi nama header kolom agar tahan variasi penulisan dari ekspor Dapodik.
 */
function normalizeHeaderKey(key) {
  const clean = (key || '').toString().toLowerCase().trim().replace(/[^a-z0-9]/g, '');

  // 1. Data Ayah (Prioritaskan cek Ayah sebelum nama/nik umum)
  if (clean.includes('ayah')) {
    if (clean.includes('nik')) return 'nik_ayah';
    if (clean.includes('tahun') || clean.includes('thn') || clean.includes('lahir')) return 'tahun_lahir_ayah';
    if (clean.includes('pendidikan') || clean.includes('jenjang')) return 'pendidikan_ayah';
    if (clean.includes('pekerjaan') || clean.includes('kerja')) return 'pekerjaan_ayah';
    if (clean.includes('penghasilan') || clean.includes('gaji')) return 'penghasilan_ayah';
    return 'nama_ayah';
  }

  // 2. Data Ibu
  if (clean.includes('ibu')) {
    if (clean.includes('nik')) return 'nik_ibu';
    if (clean.includes('tahun') || clean.includes('thn') || clean.includes('lahir')) return 'tahun_lahir_ibu';
    if (clean.includes('pendidikan') || clean.includes('jenjang')) return 'pendidikan_ibu';
    if (clean.includes('pekerjaan') || clean.includes('kerja')) return 'pekerjaan_ibu';
    if (clean.includes('penghasilan') || clean.includes('gaji')) return 'penghasilan_ibu';
    return 'nama_ibu';
  }

  // 3. Data Wali
  if (clean.includes('wali')) {
    if (clean.includes('nik')) return 'nik_wali';
    if (clean.includes('tahun') || clean.includes('thn') || clean.includes('lahir')) return 'tahun_lahir_wali';
    if (clean.includes('pendidikan') || clean.includes('jenjang')) return 'pendidikan_wali';
    if (clean.includes('pekerjaan') || clean.includes('kerja')) return 'pekerjaan_wali';
    if (clean.includes('penghasilan') || clean.includes('gaji')) return 'penghasilan_wali';
    return 'nama_wali';
  }

  // 4. Identitas Siswa
  if (clean.includes('nisn') || clean.includes('noinduksiswanasional')) return 'nisn';
  if (clean.includes('nipd') || clean.includes('noindukpesertadidik')) return 'nipd';
  if (clean.includes('nik')) return 'nik';
  if (clean.includes('nama')) return 'nama';
  if (clean.includes('tanggallahir') || clean.includes('tgllahir') || clean.includes('tgllhr')) return 'tanggal_lahir';
  if (clean.includes('tempatlahir') || clean.includes('tmptlahir')) return 'tempat_lahir';
  if (clean === 'jk' || clean.includes('jeniskelamin') || clean.includes('gender')) return 'jk';
  if (clean.includes('agama')) return 'agama';

  // 5. Rombel / Kelas
  if (clean.includes('rombel') || clean.includes('rombonganbelajar') || clean.includes('kelas')) return 'kelas';

  // 6. Alamat Detail
  if (clean === 'rt') return 'rt';
  if (clean === 'rw') return 'rw';
  if (clean.includes('dusun')) return 'dusun';
  if (clean.includes('kelurahan') || clean.includes('desa')) return 'kelurahan';
  if (clean.includes('kecamatan')) return 'kecamatan';
  if (clean.includes('kodepos') || clean === 'pos') return 'kode_pos';
  if (clean.includes('alamat')) return 'alamat';

  // 7. Tempat Tinggal & Transportasi
  if (clean.includes('tempattinggal') || clean.includes('jenistinggal') || clean === 'tinggal') return 'jenis_tinggal';
  if (clean.includes('transportasi') || clean.includes('alattransportasi')) return 'alat_transportasi';

  // 8. Kontak & KPS
  if (clean.includes('nohp') || clean === 'hp' || clean.includes('handphone') || clean.includes('ponsel') || clean === 'wa') return 'no_hp';
  if (clean.includes('telepon') || clean.includes('telp')) return 'telepon';
  if (clean.includes('email') || clean.includes('surel')) return 'email';
  if (clean.includes('skhun')) return 'skhun';
  if (clean.includes('nokps') || clean.includes('nomorkps')) return 'no_kps';
  if (clean.includes('penerimakps') || clean.includes('kps')) return 'penerima_kps';

  // 9. Kelulusan (jika ada)
  if (clean.includes('status') || clean.includes('keterangan') || clean.includes('kelulusan')) return 'status';

  return clean;
}

/**
 * Format string tanggal (seperti DD/MM/YYYY, DD-MM-YYYY, atau YYYY-MM-DD) ke YYYY-MM-DD
 */
function formatToISODate(str) {
  if (!str) return '';
  const s = str.toString().trim();

  // Sudah format YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // Format DD/MM/YYYY atau DD-MM-YYYY
  const dmyMatch = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  return s;
}

/**
 * Membaca file Excel (.xlsx, .xls) atau CSV dari objek File (HTML input).
 * Mengembalikan array of objects dengan seluruh kolom Dapodik terisi rapi.
 *
 * @param {File} file
 * @returns {Promise<{ rawData: any[], normalizedData: any[], totalRows: number, columnsFound: string[] }>}
 */
export async function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target.result;
        const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
        
        // Ambil sheet pertama
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Konversi ke 2D array baris untuk mendeteksi header secara dinamis
        const allRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        if (!allRows || allRows.length === 0) {
          throw new Error('File Excel kosong atau tidak memiliki data.');
        }

        // Cari baris header yang mengandung NISN atau Nama (biasanya baris ke-4 atau ke-5 di Dapodik)
        let headerIdx = allRows.findIndex((row) =>
          Array.isArray(row) && row.some((cell) => {
            const str = (cell || '').toString().toLowerCase().trim();
            return str === 'nisn' || str === 'nama' || str === 'nama peserta didik';
          })
        );

        if (headerIdx === -1) {
          headerIdx = 0;
        }

        const mainHeader = allRows[headerIdx] || [];
        const subHeader = allRows[headerIdx + 1] || [];
        const hasSubHeader = Array.isArray(subHeader) && subHeader.some((cell) => {
          const str = (cell || '').toString().toLowerCase();
          return str.includes('jenjang') || str.includes('penghasilan') || str.includes('pekerjaan') || str.includes('tahun lahir');
        });

        // Bentuk nama kolom gabungan (Data Ayah, Data Ibu, Data Wali)
        let currentGroup = '';
        const columnKeys = [];
        const maxCols = Math.max(mainHeader.length, subHeader.length);

        for (let c = 0; c < maxCols; c++) {
          const mainVal = (mainHeader[c] || '').toString().trim();
          const subVal = (subHeader[c] || '').toString().trim();

          if (mainVal.toLowerCase().includes('ayah')) currentGroup = 'ayah';
          else if (mainVal.toLowerCase().includes('ibu')) currentGroup = 'ibu';
          else if (mainVal.toLowerCase().includes('wali')) currentGroup = 'wali';
          else if (mainVal && !mainVal.toLowerCase().includes('data')) currentGroup = '';

          let colName = '';
          if (currentGroup && subVal) {
            colName = `${currentGroup}_${subVal}`;
          } else if (mainVal) {
            colName = mainVal;
          } else if (subVal) {
            colName = currentGroup ? `${currentGroup}_${subVal}` : subVal;
          }
          columnKeys.push(colName);
        }

        const dataStartIdx = headerIdx + (hasSubHeader ? 2 : 1);
        const normalizedData = [];

        for (let r = dataStartIdx; r < allRows.length; r++) {
          const row = allRows[r];
          if (!Array.isArray(row) || row.length === 0) continue;

          const item = {};
          for (let c = 0; c < columnKeys.length; c++) {
            const rawKey = columnKeys[c];
            if (!rawKey) continue;

            const normKey = normalizeHeaderKey(rawKey);
            let val = row[c];

            // Jika tanggal dibaca sebagai Date object oleh Excel
            if (val instanceof Date) {
              const yyyy = val.getFullYear();
              const mm = String(val.getMonth() + 1).padStart(2, '0');
              const dd = String(val.getDate()).padStart(2, '0');
              val = `${yyyy}-${mm}-${dd}`;
            } else if (typeof val === 'number') {
              val = String(val);
            } else {
              val = (val || '').toString().trim();
            }

            item[normKey] = val;
          }

          // Pastikan NISN bersih dan leading zero terjaga (10 digit standar Dapodik)
          if (item.nisn) {
            let cleanNisn = item.nisn.toString().replace(/\D/g, '');
            if (cleanNisn.length === 9) cleanNisn = cleanNisn.padStart(10, '0');
            item.nisn = cleanNisn || item.nisn.toString().trim();
          }

          // Format tanggal lahir agar selalu konsisten YYYY-MM-DD
          if (item.tanggal_lahir) {
            item.tanggal_lahir = formatToISODate(item.tanggal_lahir);
          }

          // Format jenis kelamin L / P
          if (item.jk) {
            const upper = item.jk.toUpperCase();
            item.jk = (upper.startsWith('P') || upper.includes('PEREMPUAN')) ? 'P' : 'L';
          }

          // Kelas / Rombel
          item.kelas = item.kelas || 'IX-A';

          // Normalisasi status kelulusan jika ada di kolom Excel
          const rawStatus = (item.status || item.keterangan || 'LULUS').toString().toUpperCase().trim();
          const isLulus = !rawStatus.includes('TIDAK') && rawStatus !== '-';
          item.status = isLulus ? 'LULUS' : 'TIDAK LULUS';
          item.raw_status = rawStatus;

          // Buat alamat lengkap terpadu jika ada bagian-bagian alamat
          const addressParts = [];
          if (item.alamat) addressParts.push(item.alamat);
          if (item.rt || item.rw) addressParts.push(`RT ${item.rt || '0'}/RW ${item.rw || '0'}`);
          if (item.dusun) addressParts.push(`Dusun ${item.dusun}`);
          if (item.kelurahan) addressParts.push(`Desa/Kel. ${item.kelurahan}`);
          if (item.kecamatan) addressParts.push(`Kec. ${item.kecamatan}`);
          if (item.kode_pos) addressParts.push(`Kode Pos ${item.kode_pos}`);

          item.alamat_lengkap = addressParts.length > 0 ? addressParts.join(', ') : (item.alamat || '-');

          // Validasi minimal ada NISN dan Nama
          if (item.nisn && item.nama) {
            normalizedData.push(item);
          }
        }

        resolve({
          normalizedData,
          totalRows: normalizedData.length,
          columnsFound: columnKeys.filter(Boolean),
        });
      } catch (err) {
        reject(new Error(`Gagal membaca file Excel: ${err.message}`));
      }
    };

    reader.onerror = () => reject(new Error('Gagal membaca file dari perangkat Anda.'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Mengunduh Template Excel Data Peserta Didik Resmi Dapodik SMPN 18 Buton Tengah (Tahun Ajaran 2026/2027).
 * Berisi seluruh 43 kolom lengkap sesuai standar Dapodik Kemdikbud.
 */
export function downloadTemplateSiswaExcel() {
  const data = [
    {
      'No': 1,
      'Nama': 'Ahmad Fadillah',
      'NIPD': '202401',
      'JK': 'L',
      'NISN': '0081234567',
      'Tempat Lahir': 'Tanailandu',
      'Tanggal Lahir': '2010-05-14',
      'NIK': '7401010101080001',
      'Agama': 'Islam',
      'Alamat': 'Jl. Pendidikan No. 12',
      'RT': '01',
      'RW': '02',
      'Dusun': 'Tanailandu Satu',
      'Kelurahan/Desa': 'Tanailandu',
      'Kecamatan': 'Mawasangka',
      'Kode Pos': '93762',
      'Jenis Tinggal': 'Bersama Orang Tua',
      'Alat Transportasi': 'Sepeda Motor',
      'Telepon': '-',
      'HP': '081234567890',
      'E-mail': 'ahmad.fadillah@gmail.com',
      'SKHUN': '-',
      'Penerima KPS': 'Tidak',
      'No. KPS': '-',
      'Nama Ayah': 'La Ode Fadli',
      'Tahun Lahir Ayah': '1978',
      'Jenjang Pendidikan Ayah': 'SMA / Sederajat',
      'Pekerjaan Ayah': 'Wiraswasta',
      'Penghasilan Ayah': 'Rp 2.000.000 - Rp 4.999.999',
      'NIK Ayah': '7401010101780001',
      'Nama Ibu': 'Wa Ode Rosna',
      'Tahun Lahir Ibu': '1982',
      'Jenjang Pendidikan Ibu': 'SMA / Sederajat',
      'Pekerjaan Ibu': 'Ibu Rumah Tangga',
      'Penghasilan Ibu': 'Tidak Berpenghasilan',
      'NIK Ibu': '7401010101820002',
      'Nama Wali': '-',
      'Tahun Lahir Wali': '-',
      'Jenjang Pendidikan Wali': '-',
      'Pekerjaan Wali': '-',
      'Penghasilan Wali': '-',
      'NIK Wali': '-',
      'Rombel Saat Ini': 'IX-A',
    },
    {
      'No': 2,
      'Nama': 'Siti Rahmawati',
      'NIPD': '202402',
      'JK': 'P',
      'NISN': '0089876543',
      'Tempat Lahir': 'Mawasangka',
      'Tanggal Lahir': '2010-08-22',
      'NIK': '7401010101080002',
      'Agama': 'Islam',
      'Alamat': 'Jl. Pelabuhan Mawasangka',
      'RT': '02',
      'RW': '01',
      'Dusun': 'Pantai Indah',
      'Kelurahan/Desa': 'Mawasangka',
      'Kecamatan': 'Mawasangka',
      'Kode Pos': '93762',
      'Jenis Tinggal': 'Bersama Orang Tua',
      'Alat Transportasi': 'Jalan Kaki',
      'Telepon': '-',
      'HP': '082198765432',
      'E-mail': 'siti.rahmawati@gmail.com',
      'SKHUN': '-',
      'Penerima KPS': 'Ya',
      'No. KPS': 'KPS-2024-0987',
      'Nama Ayah': 'La Ode Rahman',
      'Tahun Lahir Ayah': '1975',
      'Jenjang Pendidikan Ayah': 'SMP / Sederajat',
      'Pekerjaan Ayah': 'Nelayan',
      'Penghasilan Ayah': 'Rp 1.000.000 - Rp 1.999.999',
      'NIK Ayah': '7401010101750001',
      'Nama Ibu': 'Wa Ode Sitti',
      'Tahun Lahir Ibu': '1979',
      'Jenjang Pendidikan Ibu': 'SMP / Sederajat',
      'Pekerjaan Ibu': 'Ibu Rumah Tangga',
      'Penghasilan Ibu': 'Tidak Berpenghasilan',
      'NIK Ibu': '7401010101790002',
      'Nama Wali': '-',
      'Tahun Lahir Wali': '-',
      'Jenjang Pendidikan Wali': '-',
      'Pekerjaan Wali': '-',
      'Penghasilan Wali': '-',
      'NIK Wali': '-',
      'Rombel Saat Ini': 'IX-B',
    }
  ];

  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [
    { wch: 5 },  // No
    { wch: 25 }, // Nama
    { wch: 10 }, // NIPD
    { wch: 6 },  // JK
    { wch: 15 }, // NISN
    { wch: 16 }, // Tempat Lahir
    { wch: 15 }, // Tanggal Lahir
    { wch: 18 }, // NIK
    { wch: 12 }, // Agama
    { wch: 30 }, // Alamat
    { wch: 6 },  // RT
    { wch: 6 },  // RW
    { wch: 18 }, // Dusun
    { wch: 18 }, // Kelurahan/Desa
    { wch: 16 }, // Kecamatan
    { wch: 10 }, // Kode Pos
    { wch: 20 }, // Jenis Tinggal
    { wch: 18 }, // Alat Transportasi
    { wch: 12 }, // Telepon
    { wch: 16 }, // HP
    { wch: 25 }, // E-mail
    { wch: 12 }, // SKHUN
    { wch: 14 }, // Penerima KPS
    { wch: 16 }, // No. KPS
    { wch: 20 }, // Nama Ayah
    { wch: 16 }, // Tahun Lahir Ayah
    { wch: 22 }, // Jenjang Pendidikan Ayah
    { wch: 18 }, // Pekerjaan Ayah
    { wch: 25 }, // Penghasilan Ayah
    { wch: 18 }, // NIK Ayah
    { wch: 20 }, // Nama Ibu
    { wch: 16 }, // Tahun Lahir Ibu
    { wch: 22 }, // Jenjang Pendidikan Ibu
    { wch: 18 }, // Pekerjaan Ibu
    { wch: 25 }, // Penghasilan Ibu
    { wch: 18 }, // NIK Ibu
    { wch: 20 }, // Nama Wali
    { wch: 16 }, // Tahun Lahir Wali
    { wch: 22 }, // Jenjang Pendidikan Wali
    { wch: 18 }, // Pekerjaan Wali
    { wch: 25 }, // Penghasilan Wali
    { wch: 18 }, // NIK Wali
    { wch: 16 }, // Rombel Saat Ini
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Daftar Siswa Dapodik');
  XLSX.writeFile(wb, 'Format_Dapodik_SMPN18_Buteng_2026_2027.xlsx');
}

/**
 * Mengunduh Template Excel Khusus Kelulusan.
 */
export function downloadTemplateKelulusanExcel() {
  const data = [
    {
      'No': 1,
      'Nama Siswa': 'Ahmad Fadillah',
      'NISN': '0081234567',
      'Tempat Lahir': 'Tanailandu',
      'Tanggal Lahir': '2010-05-14',
      'Jenis Kelamin': 'L',
      'Nama Ayah': 'La Ode Fadli',
      'Nama Ibu': 'Wa Ode Rosna',
      'Status Kelulusan (LULUS/TIDAK LULUS)': 'LULUS',
    },
    {
      'No': 2,
      'Nama Siswa': 'Siti Rahmawati',
      'NISN': '0089876543',
      'Tempat Lahir': 'Mawasangka',
      'Tanggal Lahir': '2010-08-22',
      'Jenis Kelamin': 'P',
      'Nama Ayah': 'La Ode Rahman',
      'Nama Ibu': 'Wa Ode Sitti',
      'Status Kelulusan (LULUS/TIDAK LULUS)': 'LULUS',
    }
  ];

  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 26 },
    { wch: 16 },
    { wch: 18 },
    { wch: 18 },
    { wch: 14 },
    { wch: 20 },
    { wch: 20 },
    { wch: 35 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data Kelulusan');
  XLSX.writeFile(wb, 'template_kelulusan_siswa_smpn18.xlsx');
}

/**
 * Mengekspor daftar siswa ke file Excel (.xlsx) resmi.
 */
export function exportToExcel(data, fileName = 'data_export.xlsx', sheetName = 'Data') {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, fileName);
}
