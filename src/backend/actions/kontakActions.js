'use server';

/**
 * src/backend/actions/kontakActions.js
 *
 * Server Actions untuk Form Pesan Kontak Publik & Kotak Masuk Admin.
 */

import { createServerClient } from '@/backend/lib/supabase';
import { revalidatePath } from 'next/cache';

/**
 * Mengirim pesan kontak baru dari pengunjung website publik.
 *
 * @param {{ nama: string, email: string, no_hp?: string, subjek: string, pesan: string }} payload
 */
export async function kirimPesanKontak(payload) {
  if (!payload.nama || !payload.email || !payload.subjek || !payload.pesan) {
    return { success: false, message: 'Harap lengkapi semua kolom wajib (Nama, Email, Subjek, Pesan).' };
  }

  try {
    const supabase = await createServerClient();
    const { error } = await supabase.from('pesan_kontak').insert([
      {
        nama: payload.nama.trim(),
        email: payload.email.trim(),
        no_hp: payload.no_hp?.trim() || null,
        subjek: payload.subjek.trim(),
        pesan: payload.pesan.trim(),
        is_read: false,
      },
    ]);

    if (error) throw error;

    revalidatePath('/admin/kontak');
    return {
      success: true,
      message: 'Terima kasih, pesan Anda telah berhasil dikirim ke pihak sekolah SMP Negeri 18 Buton Tengah.',
    };
  } catch (err) {
    console.error('[kirimPesanKontak Error]:', err);
    return { success: false, message: 'Gagal mengirim pesan. Silakan coba lagi.' };
  }
}

/**
 * Mengambil daftar pesan kontak masuk untuk Admin/Guru.
 */
export async function getPesanKontakList() {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('pesan_kontak')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err) {
    return { success: false, data: [] };
  }
}

/**
 * Menandai pesan telah dibaca oleh Admin.
 *
 * @param {string} id
 */
export async function tandaiPesanDibaca(id) {
  try {
    const supabase = await createServerClient();
    const { error } = await supabase
      .from('pesan_kontak')
      .update({ is_read: true })
      .eq('id', id);

    if (error) throw error;
    revalidatePath('/admin/kontak');
    return { success: true };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

/**
 * Menghapus pesan kontak.
 *
 * @param {string} id
 */
export async function hapusPesanKontak(id) {
  try {
    const supabase = await createServerClient();
    const { error } = await supabase.from('pesan_kontak').delete().eq('id', id);
    if (error) throw error;

    revalidatePath('/admin/kontak');
    return { success: true, message: 'Pesan berhasil dihapus.' };
  } catch (err) {
    return { success: false, message: err.message };
  }
}
