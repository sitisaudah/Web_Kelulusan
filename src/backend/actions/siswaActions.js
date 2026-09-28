'use server';

/**
 * src/backend/actions/siswaActions.js
 *
 * Server Actions untuk Manajemen Data Siswa (CRUD & Batch Import) di Supabase.
 */

import { createServerClient, createAdminClient } from '@/backend/lib/supabase';
import { revalidatePath } from 'next/cache';

/**
 * Mengambil daftar seluruh siswa dengan opsi pencarian & filter kelas.
 *
 * @param {{ search?: string, kelas?: string }} [params]
 */
export async function getSiswaList(params = {}) {
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
    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err) {
    console.error('[getSiswaList Error]:', err);
    return { success: false, data: [], message: err.message };
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

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, data: null, message: err.message };
  }
}

/**
 * Menyimpan (tambah baru atau update) data siswa.
 *
 * @param {any} siswaData
 */
export async function saveSiswa(siswaData) {
  try {
    const supabase = await createServerClient();
    const payload = {
      nisn: siswaData.nisn?.trim(),
      nipd: siswaData.nipd?.trim() || null,
      nik: siswaData.nik?.trim() || null,
      nama: siswaData.nama?.trim(),
      kelas: siswaData.kelas?.trim() || 'IX',
      tempat_lahir: siswaData.tempat_lahir?.trim() || null,
      tanggal_lahir: siswaData.tanggal_lahir,
      jk: siswaData.jk || 'L',
      agama: siswaData.agama || 'Islam',
      nama_ayah: siswaData.nama_ayah || null,
      nama_ibu: siswaData.nama_ibu || null,
      alamat: siswaData.alamat || null,
    };

    if (!payload.nisn || !payload.nama || !payload.tanggal_lahir) {
      return { success: false, message: 'NISN, Nama, dan Tanggal Lahir wajib diisi.' };
    }

    let res;
    if (siswaData.id) {
      res = await supabase.from('siswa').update(payload).eq('id', siswaData.id);
    } else {
      res = await supabase.from('siswa').insert([payload]);
    }

    if (res.error) throw res.error;

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
    const supabase = await createServerClient();
    const { error } = await supabase.from('siswa').delete().eq('id', id);
    if (error) throw error;

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
    const supabase = await createServerClient();

    // Normalisasi baris
    const cleanList = rawStudents
      .filter((s) => s.nisn && s.nama)
      .map((s) => ({
        nisn: s.nisn.toString().trim(),
        nipd: s.nipd ? s.nipd.toString().trim() : null,
        nik: s.nik ? s.nik.toString().trim() : null,
        nama: s.nama.toString().trim(),
        kelas: s.kelas ? s.kelas.toString().trim() : 'IX',
        tempat_lahir: s.tempat_lahir ? s.tempat_lahir.toString().trim() : null,
        tanggal_lahir: s.tanggal_lahir ? s.tanggal_lahir.toString().trim() : '2010-01-01',
        jk: (s.jk?.toString().toUpperCase() === 'P' ? 'P' : 'L'),
        agama: s.agama || 'Islam',
        nama_ayah: s.nama_ayah || null,
        nama_ibu: s.nama_ibu || null,
      }));

    if (cleanList.length === 0) {
      return { success: false, message: 'Format data siswa tidak valid (wajib ada kolom NISN dan Nama).' };
    }

    const { error } = await supabase
      .from('siswa')
      .upsert(cleanList, { onConflict: 'nisn' });

    if (error) throw error;

    revalidatePath('/admin/siswa');
    return {
      success: true,
      message: `Berhasil mengimpor ${cleanList.length} siswa ke database Supabase.`,
      count: cleanList.length,
    };
  } catch (err) {
    console.error('[importSiswaBatch Error]:', err);
    return { success: false, message: `Gagal import data: ${err.message}` };
  }
}
