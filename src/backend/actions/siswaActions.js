'use server';

/**
 * src/backend/actions/siswaActions.js
 *
 * Server Actions untuk Manajemen Data Siswa (CRUD & Batch Import) di Supabase.
 */

import { createServerClient } from '@/backend/lib/supabase';
import { revalidatePath } from 'next/cache';
import { 
  getLocalStudents, 
  saveLocalStudent, 
  deleteLocalStudent, 
  importLocalStudentsBatch 
} from '@/backend/lib/localStudentStore';

/**
 * Mengambil daftar seluruh siswa dengan opsi pencarian & filter kelas.
 *
 * @param {{ search?: string, kelas?: string }} [params]
 */
export async function getSiswaList(params = {}) {
  // 1. Coba dari Supabase jika dikonfigurasi
  try {
    const supabase = await createServerClient();
    let query = supabase.from('siswa').select('*').order('nama', { ascending: true });

    if (params.search) {
      const s = `%${params.search.trim()}%`;
      query = query.or(`nama.ilike.${s},nisn.ilike.${s}`);
    }

    if (params.kelas && params.kelas !== 'Semua') {
      query = query.eq('kelas', params.kelas);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return { success: true, data };
    }
  } catch (err) {
    // Supabase tidak aktif / fallback ke local
  }

  // 2. Fallback ke Local Store JSON
  try {
    let localData = await getLocalStudents();

    if (params.search) {
      const s = params.search.toLowerCase().trim();
      localData = localData.filter(
        (item) => item.nama?.toLowerCase().includes(s) || item.nisn?.includes(s)
      );
    }

    if (params.kelas && params.kelas !== 'Semua') {
      localData = localData.filter((item) => item.kelas === params.kelas);
    }

    localData.sort((a, b) => (a.nama || '').localeCompare(b.nama || ''));
    return { success: true, data: localData };
  } catch (localErr) {
    console.error('[getSiswaList Local Error]:', localErr);
    return { success: false, data: [], message: localErr.message };
  }
}

/**
 * Mengambil satu siswa berdasarkan ID.
 *
 * @param {string} id
 */
export async function getSiswaById(id) {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('siswa')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && data) return { success: true, data };
  } catch (err) {}

  const all = await getLocalStudents();
  const matched = all.find((s) => s.id === id || s.nisn === id);
  if (matched) return { success: true, data: matched };
  return { success: false, data: null, message: 'Siswa tidak ditemukan' };
}

/**
 * Menyimpan (tambah baru atau update) data siswa.
 *
 * @param {any} siswaData
 */
export async function saveSiswa(siswaData) {
  try {
    const payload = {
      ...siswaData,
      id: siswaData.id,
      nisn: siswaData.nisn?.toString().trim(),
      nipd: siswaData.nipd ? siswaData.nipd.toString().trim() : null,
      nik: siswaData.nik ? siswaData.nik.toString().trim() : null,
      nama: siswaData.nama?.toString().trim(),
      kelas: (siswaData.kelas || 'IX').toString().trim(),
      tempat_lahir: siswaData.tempat_lahir ? siswaData.tempat_lahir.toString().trim() : null,
      tanggal_lahir: siswaData.tanggal_lahir,
      jk: siswaData.jk || 'L',
      agama: siswaData.agama || 'Islam',
    };

    if (!payload.nisn || !payload.nama || !payload.tanggal_lahir) {
      return { success: false, message: 'NISN, Nama, dan Tanggal Lahir wajib diisi.' };
    }

    // Selalu sinkronkan seluruh 43 kolom ke local store
    await saveLocalStudent(payload);

    // Coba simpan ke Supabase jika tersedia
    try {
      const supabase = await createServerClient();
      const supabasePayload = {
        nisn: payload.nisn,
        nipd: payload.nipd,
        nik: payload.nik,
        nama: payload.nama,
        kelas: payload.kelas,
        tempat_lahir: payload.tempat_lahir,
        tanggal_lahir: payload.tanggal_lahir,
        jk: payload.jk,
        agama: payload.agama,
        nama_ayah: payload.nama_ayah || null,
        nama_ibu: payload.nama_ibu || null,
        alamat: payload.alamat_lengkap || payload.alamat || null,
      };

      if (siswaData.id && !siswaData.id.startsWith('siswa-')) {
        await supabase.from('siswa').update(supabasePayload).eq('id', siswaData.id);
      } else {
        await supabase.from('siswa').upsert([supabasePayload], { onConflict: 'nisn' });
      }
    } catch (e) {
      // Supabase offline, data tetap aman di local
    }

    revalidatePath('/admin/siswa');
    return { success: true, message: 'Data siswa berhasil disimpan.' };
  } catch (err) {
    console.error('[saveSiswa Error]:', err);
    return { success: false, message: `Gagal menyimpan data siswa: ${err.message}` };
  }
}

/**
 * Menghapus data siswa berdasarkan ID.
 *
 * @param {string} id
 */
export async function deleteSiswa(id) {
  try {
    await deleteLocalStudent(id);

    try {
      const supabase = await createServerClient();
      await supabase.from('siswa').delete().eq('id', id);
    } catch (e) {}

    revalidatePath('/admin/siswa');
    return { success: true, message: 'Siswa berhasil dihapus.' };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

/**
 * Import data siswa secara batch (massal) dari array parsed CSV/Excel.
 *
 * @param {any[]} rawStudents
 */
export async function importSiswaBatch(rawStudents) {
  if (!rawStudents || rawStudents.length === 0) {
    return { success: false, message: 'Tidak ada data untuk diimpor.' };
  }

  try {
    // Normalisasi baris dengan seluruh atribut Dapodik resmi
    const cleanList = rawStudents
      .filter((s) => s.nisn && s.nama)
      .map((s) => {
        const alamatGabung = s.alamat_lengkap || s.alamat || [
          s.dusun ? `Dusun ${s.dusun}` : '',
          s.rt || s.rw ? `RT ${s.rt || '0'}/RW ${s.rw || '0'}` : '',
          s.kelurahan ? `Desa/Kel. ${s.kelurahan}` : '',
          s.kecamatan ? `Kec. ${s.kecamatan}` : '',
          s.kode_pos ? s.kode_pos : ''
        ].filter(Boolean).join(', ') || null;

        return {
          // Identitas Siswa
          nisn: s.nisn.toString().trim(),
          nipd: s.nipd ? s.nipd.toString().trim() : null,
          nik: s.nik ? s.nik.toString().trim() : null,
          nama: s.nama.toString().trim(),
          kelas: (s.kelas || s.rombel || 'IX-A').toString().trim(),
          tempat_lahir: s.tempat_lahir ? s.tempat_lahir.toString().trim() : null,
          tanggal_lahir: s.tanggal_lahir ? s.tanggal_lahir.toString().trim() : '2010-01-01',
          jk: (s.jk?.toString().toUpperCase() === 'P' || s.jk?.toString().toUpperCase().includes('PEREMPUAN') ? 'P' : 'L'),
          agama: s.agama ? s.agama.toString().trim() : 'Islam',

          // Alamat
          alamat: s.alamat ? s.alamat.toString().trim() : null,
          alamat_lengkap: alamatGabung,
          rt: s.rt ? s.rt.toString().trim() : null,
          rw: s.rw ? s.rw.toString().trim() : null,
          dusun: s.dusun ? s.dusun.toString().trim() : null,
          kelurahan: s.kelurahan ? s.kelurahan.toString().trim() : null,
          kecamatan: s.kecamatan ? s.kecamatan.toString().trim() : null,
          kode_pos: s.kode_pos ? s.kode_pos.toString().trim() : null,

          // Tempat Tinggal, Transportasi & Kontak
          jenis_tinggal: s.jenis_tinggal ? s.jenis_tinggal.toString().trim() : null,
          alat_transportasi: s.alat_transportasi ? s.alat_transportasi.toString().trim() : null,
          telepon: s.telepon ? s.telepon.toString().trim() : null,
          no_hp: s.no_hp ? s.no_hp.toString().trim() : null,
          email: s.email ? s.email.toString().trim() : null,
          skhun: s.skhun ? s.skhun.toString().trim() : null,
          penerima_kps: s.penerima_kps ? s.penerima_kps.toString().trim() : null,
          no_kps: s.no_kps ? s.no_kps.toString().trim() : null,

          // Data Ayah
          nama_ayah: s.nama_ayah ? s.nama_ayah.toString().trim() : null,
          tahun_lahir_ayah: s.tahun_lahir_ayah ? s.tahun_lahir_ayah.toString().trim() : null,
          pendidikan_ayah: s.pendidikan_ayah ? s.pendidikan_ayah.toString().trim() : null,
          pekerjaan_ayah: s.pekerjaan_ayah ? s.pekerjaan_ayah.toString().trim() : null,
          penghasilan_ayah: s.penghasilan_ayah ? s.penghasilan_ayah.toString().trim() : null,
          nik_ayah: s.nik_ayah ? s.nik_ayah.toString().trim() : null,

          // Data Ibu
          nama_ibu: s.nama_ibu ? s.nama_ibu.toString().trim() : null,
          tahun_lahir_ibu: s.tahun_lahir_ibu ? s.tahun_lahir_ibu.toString().trim() : null,
          pendidikan_ibu: s.pendidikan_ibu ? s.pendidikan_ibu.toString().trim() : null,
          pekerjaan_ibu: s.pekerjaan_ibu ? s.pekerjaan_ibu.toString().trim() : null,
          penghasilan_ibu: s.penghasilan_ibu ? s.penghasilan_ibu.toString().trim() : null,
          nik_ibu: s.nik_ibu ? s.nik_ibu.toString().trim() : null,

          // Data Wali
          nama_wali: s.nama_wali ? s.nama_wali.toString().trim() : null,
          tahun_lahir_wali: s.tahun_lahir_wali ? s.tahun_lahir_wali.toString().trim() : null,
          pendidikan_wali: s.pendidikan_wali ? s.pendidikan_wali.toString().trim() : null,
          pekerjaan_wali: s.pekerjaan_wali ? s.pekerjaan_wali.toString().trim() : null,
          penghasilan_wali: s.penghasilan_wali ? s.penghasilan_wali.toString().trim() : null,
          nik_wali: s.nik_wali ? s.nik_wali.toString().trim() : null,
        };
      });

    if (cleanList.length === 0) {
      return { success: false, message: 'Format data siswa tidak valid (wajib ada kolom NISN dan Nama).' };
    }

    // 1. Simpan ke local store JSON
    await importLocalStudentsBatch(cleanList);

    // 2. Coba simpan ke Supabase jika aktif
    try {
      const supabase = await createServerClient();
      // Filter hanya kolom yang pasti ada di skema inti Supabase
      const supabasePayload = cleanList.map((s) => ({
        nisn: s.nisn,
        nipd: s.nipd,
        nik: s.nik,
        nama: s.nama,
        kelas: s.kelas,
        tempat_lahir: s.tempat_lahir,
        tanggal_lahir: s.tanggal_lahir,
        jk: s.jk,
        agama: s.agama,
        nama_ayah: s.nama_ayah,
        nama_ibu: s.nama_ibu,
        alamat: s.alamat_lengkap || s.alamat,
      }));
      await supabase.from('siswa').upsert(supabasePayload, { onConflict: 'nisn' });
    } catch (e) {
      // Supabase tidak aktif / fallback tetap berhasil
    }

    revalidatePath('/admin/siswa');
    return {
      success: true,
      message: `Berhasil mengimpor ${cleanList.length} siswa ke database.`,
      count: cleanList.length,
    };
  } catch (err) {
    console.error('[importSiswaBatch Error]:', err);
    return { success: false, message: `Gagal import data: ${err.message}` };
  }
}
