'use server';

/**
 * src/backend/actions/settingActions.js
 *
 * Server Actions untuk Pengaturan Sistem Sekolah di Supabase.
 */

import { createServerClient } from '@/backend/lib/supabase';
import { revalidatePath } from 'next/cache';

/**
 * Mengambil seluruh pengaturan sekolah sebagai key-value map.
 *
 * @returns {Promise<Record<string, string>>}
 */
export async function getAllSettings() {
  const defaultFallback = {
    nama_sekolah: 'SMP NEGERI 18 BUTON TENGAH',
    npsn: '69989025',
    tahun_ajaran: '2026/2027',
    alamat: 'Jalan Poros Waburense, Desa Tanailandu, Kec. Mawasangka, Kab. Buton Tengah, Sulawesi Tenggara 93762',
    email_kontak: 'info@smpn18buteng.sch.id',
    telepon_kontak: '0812-3456-7890',
    pengumuman_buka: 'true',
  };

  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase.from('pengaturan').select('key, value');

    if (error || !data || data.length === 0) {
      return defaultFallback;
    }

    const settingsMap = { ...defaultFallback };
    data.forEach((item) => {
      settingsMap[item.key] = item.value;
    });

    return settingsMap;
  } catch (err) {
    return defaultFallback;
  }
}

/**
 * Memperbarui sekumpulan pengaturan sekolah.
 *
 * @param {Record<string, string>} settings
 */
export async function updateSettingsBatch(settings) {
  try {
    const supabase = await createServerClient();
    const records = Object.entries(settings).map(([key, value]) => ({
      key,
      value: value.toString(),
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('pengaturan').upsert(records, { onConflict: 'key' });
    if (error) throw error;

    revalidatePath('/admin/seting');
    revalidatePath('/');
    return { success: true, message: 'Pengaturan sekolah berhasil diperbarui.' };
  } catch (err) {
    console.error('[updateSettingsBatch Error]:', err);
    return { success: false, message: `Gagal menyimpan: ${err.message}` };
  }
}
