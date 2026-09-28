'use server';

/**
 * src/backend/actions/ulanganActions.js
 *
 * Server Actions untuk Sistem Ulangan Online (CBT), Ujian Soal PDF (PG & Essay),
 * Penilaian Otomatis Pilihan Ganda, dan Penilaian Manual Soal Essay oleh Guru.
 */

import fs from 'fs';
import path from 'path';
import { createServerClient } from '@/backend/lib/supabase';
import { getCurrentUserAction } from '@/backend/actions/authActions';
import {
  getLocalExams,
  saveLocalExam,
  deleteLocalExam,
  getLocalResults,
  saveLocalResult,
  updateLocalResult,
} from '@/backend/lib/localExamStore';
import { revalidatePath } from 'next/cache';
import { extractExamFromPdfBuffer } from '@/backend/lib/pdfExamParser';

/**
 * Helper untuk memastikan ujian bertipe PDF memiliki butir soal PG dan Essay
 * yang terekstrak secara otomatis dari file PDF jika belum ada.
 */
async function autoExtractQuestionsIfMissing(exam) {
  if (!exam || exam.tipe_ujian !== 'pdf' || !exam.file_pdf_url) {
    return exam;
  }

  const hasPg = Array.isArray(exam.soal_pg) && exam.soal_pg.length > 0;
  const hasEssay = Array.isArray(exam.soal_essay) && exam.soal_essay.length > 0;

  // Jika sudah lengkap keduanya, tidak perlu ekstrak ulang
  if (hasPg && hasEssay) {
    return exam;
  }

  try {
    const cleanUrl = exam.file_pdf_url.startsWith('/') ? exam.file_pdf_url.slice(1) : exam.file_pdf_url;
    const absolutePdfPath = path.join(process.cwd(), 'public', cleanUrl);

    if (fs.existsSync(absolutePdfPath)) {
      const buffer = await fs.promises.readFile(absolutePdfPath);
      const parsed = await extractExamFromPdfBuffer(buffer, absolutePdfPath);

      let updated = false;

      if (!hasPg && parsed.soal_pg && parsed.soal_pg.length > 0) {
        exam.soal_pg = parsed.soal_pg;
        exam.total_soal_pdf = parsed.soal_pg.length;
        updated = true;

        if (!exam.kunci_jawaban_pdf || Object.keys(exam.kunci_jawaban_pdf).length === 0) {
          const keys = {};
          parsed.soal_pg.forEach((q) => {
            keys[q.nomor] = q.kunci_jawaban || 'A';
          });
          exam.kunci_jawaban_pdf = keys;
        }
      }

      if (!hasEssay && parsed.soal_essay && parsed.soal_essay.length > 0) {
        exam.soal_essay = parsed.soal_essay;
        updated = true;
      }

      if (updated) {
        await saveLocalExam(exam);
      }
    }
  } catch (err) {
    console.error('[autoExtractQuestionsIfMissing Error]:', err);
  }

  return exam;
}

/**
 * Mengambil daftar ulangan. Siswa hanya melihat yang aktif, Admin/Guru melihat semua.
 *
 * @param {{ kelas?: string, isStudent?: boolean }} [params]
 */
export async function getUlanganList(params = {}) {
  let examList = [];

  try {
    const supabase = await createServerClient();
    let query = supabase.from('ulangan').select('*').order('created_at', { ascending: false });

    if (params.isStudent) {
      query = query.eq('is_active', true);
      if (params.kelas) {
        query = query.eq('kelas', params.kelas);
      }
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      examList = data;
    }
  } catch (err) {}

  // Jika Supabase kosong/error, gunakan local fallback exams
  if (examList.length === 0) {
    const localExams = await getLocalExams();
    examList = localExams;

    if (params.isStudent) {
      examList = examList.filter((e) => e.is_active !== false);
      if (params.kelas) {
        examList = examList.filter((e) => !e.kelas || e.kelas === params.kelas);
      }
    }
  }

  // Pastikan setiap ujian PDF sudah diekstrak soalnya
  for (let i = 0; i < examList.length; i++) {
    examList[i] = await autoExtractQuestionsIfMissing(examList[i]);
  }

  // Jika siswa yang memanggil, sensor kunci jawaban untuk menjaga integritas ujian
  if (params.isStudent) {
    examList = examList.map((e) => {
      const copy = { ...e };
      delete copy.kunci_jawaban_pdf;
      if (copy.soal_pg) {
        copy.soal_pg = copy.soal_pg.map((q) => {
          const qCopy = { ...q };
          delete qCopy.kunci_jawaban;
          return qCopy;
        });
      }
      return copy;
    });
  }

  return { success: true, data: examList };
}

/**
 * Mengambil detail ulangan.
 *
 * @param {string} id
 * @param {boolean} [isStudent=false]
 */
export async function getUlanganById(id, isStudent = false) {
  let exam = null;

  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('ulangan')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!error && data) {
      exam = data;
    }
  } catch (err) {}

  // Fallback ke local store jika tidak ditemukan di Supabase
  if (!exam) {
    const localExams = await getLocalExams();
    exam = localExams.find((e) => e.id === id) || null;
  }

  if (!exam) {
    return { success: false, data: null, message: 'Ulangan tidak ditemukan.' };
  }

  // Pastikan soal diekstrak jika ujian bertipe PDF
  exam = await autoExtractQuestionsIfMissing(exam);

  // Sensor kunci jawaban jika diakses siswa
  if (isStudent) {
    const safeExam = { ...exam };
    delete safeExam.kunci_jawaban_pdf;
    if (safeExam.soal_pg) {
      safeExam.soal_pg = safeExam.soal_pg.map((q) => {
        const qCopy = { ...q };
        delete qCopy.kunci_jawaban;
        return qCopy;
      });
    }
    return { success: true, data: safeExam };
  }

  return { success: true, data: exam };
}

/**
 * Memaksa ekstraksi ulang butir soal PG dan Essay dari file PDF yang tersimpan.
 *
 * @param {string} examId
 */
export async function reextractExamFromPdf(examId) {
  try {
    const localExams = await getLocalExams();
    const exam = localExams.find((e) => e.id === examId);

    if (!exam) {
      return { success: false, message: 'Data ulangan tidak ditemukan.' };
    }

    if (!exam.file_pdf_url) {
      return { success: false, message: 'Ujian ini belum memiliki file PDF naskah soal.' };
    }

    const cleanUrl = exam.file_pdf_url.startsWith('/') ? exam.file_pdf_url.slice(1) : exam.file_pdf_url;
    const absolutePdfPath = path.join(process.cwd(), 'public', cleanUrl);

    if (!fs.existsSync(absolutePdfPath)) {
      return { success: false, message: 'File naskah PDF fisik tidak ditemukan di server.' };
    }

    const buffer = await fs.promises.readFile(absolutePdfPath);
    const parsed = await extractExamFromPdfBuffer(buffer, absolutePdfPath);

    exam.soal_pg = parsed.soal_pg || [];
    exam.soal_essay = parsed.soal_essay || [];
    exam.total_soal_pdf = parsed.total_pg || (parsed.soal_pg?.length || 0);

    const keys = {};
    (parsed.soal_pg || []).forEach((q) => {
      keys[q.nomor] = q.kunci_jawaban || 'A';
    });
    exam.kunci_jawaban_pdf = keys;

    await saveLocalExam(exam);

    try {
      const supabase = await createServerClient();
      await supabase.from('ulangan').update({
        soal_pg: exam.soal_pg,
        soal_essay: exam.soal_essay,
        total_soal_pdf: exam.total_soal_pdf,
        kunci_jawaban_pdf: exam.kunci_jawaban_pdf,
      }).eq('id', examId);
    } catch (dbErr) {}

    revalidatePath('/admin/ulangan');
    revalidatePath(`/admin/ulangan/${examId}/soal`);
    revalidatePath(`/siswa/ulangan/${examId}`);

    return {
      success: true,
      total_pg: parsed.total_pg,
      total_essay: parsed.total_essay,
      soal_pg: parsed.soal_pg,
      soal_essay: parsed.soal_essay,
      kunci_jawaban_pdf: keys,
      message: `Berhasil mengekstrak ${parsed.total_pg} soal Pilihan Ganda dan ${parsed.total_essay} soal Essay!`,
    };
  } catch (err) {
    console.error('[reextractExamFromPdf Error]:', err);
    return { success: false, message: err.message };
  }
}

/**
 * Menyimpan / memperbarui ulangan (CBT Butir Manual maupun Ujian Naskah PDF lengkap dengan PG & Essay).
 *
 * @param {any} ulanganData
 */
export async function saveUlangan(ulanganData) {
  try {
    const payload = {
      judul: ulanganData.judul?.trim(),
      deskripsi: ulanganData.deskripsi?.trim() || null,
      mapel: ulanganData.mapel?.trim(),
      kelas: ulanganData.kelas?.trim() || 'IX',
      durasi_menit: parseInt(ulanganData.durasi_menit) || 60,
      is_active: ulanganData.is_active !== false,
      waktu_mulai: ulanganData.waktu_mulai || null,
      waktu_selesai: ulanganData.waktu_selesai || null,
      // Atribut Ujian Naskah PDF
      tipe_ujian: ulanganData.tipe_ujian || 'manual',
      file_pdf_url: ulanganData.file_pdf_url || null,
      file_pdf_nama: ulanganData.file_pdf_nama || null,
      file_pdf_size: ulanganData.file_pdf_size || null,
      total_soal_pdf: parseInt(ulanganData.total_soal_pdf) || (ulanganData.soal_pg?.length || 10),
      opsi_jawaban: ulanganData.opsi_jawaban || 'ABCD',
      kunci_jawaban_pdf: ulanganData.kunci_jawaban_pdf || {},
      bobot_per_soal: parseInt(ulanganData.bobot_per_soal) || 10,
      // Butir soal hasil parsing atau edit web (Pilihan Ganda & Essay)
      soal_pg: ulanganData.soal_pg || [],
      soal_essay: ulanganData.soal_essay || [],
    };

    if (!payload.judul || !payload.mapel) {
      return { success: false, message: 'Judul ulangan dan mata pelajaran wajib diisi.' };
    }

    if (payload.tipe_ujian === 'pdf' && !payload.file_pdf_url) {
      return { success: false, message: 'Harap unggah file PDF naskah soal terlebih dahulu.' };
    }

    // Jika soal_pg atau soal_essay kosong padahal file_pdf_url ada, ekstrak otomatis sekarang
    if (payload.tipe_ujian === 'pdf' && payload.file_pdf_url) {
      if ((!payload.soal_pg || payload.soal_pg.length === 0) || (!payload.soal_essay || payload.soal_essay.length === 0)) {
        try {
          const cleanUrl = payload.file_pdf_url.startsWith('/') ? payload.file_pdf_url.slice(1) : payload.file_pdf_url;
          const absolutePdfPath = path.join(process.cwd(), 'public', cleanUrl);

          if (fs.existsSync(absolutePdfPath)) {
            const buffer = await fs.promises.readFile(absolutePdfPath);
            const parsed = await extractExamFromPdfBuffer(buffer, absolutePdfPath);

            if ((!payload.soal_pg || payload.soal_pg.length === 0) && parsed.soal_pg?.length > 0) {
              payload.soal_pg = parsed.soal_pg;
              payload.total_soal_pdf = parsed.soal_pg.length;
              if (!payload.kunci_jawaban_pdf || Object.keys(payload.kunci_jawaban_pdf).length === 0) {
                const keys = {};
                parsed.soal_pg.forEach((q) => { keys[q.nomor] = q.kunci_jawaban || 'A'; });
                payload.kunci_jawaban_pdf = keys;
              }
            }

            if ((!payload.soal_essay || payload.soal_essay.length === 0) && parsed.soal_essay?.length > 0) {
              payload.soal_essay = parsed.soal_essay;
            }
          }
        } catch (autoErr) {
          console.warn('[saveUlangan auto-extract notice]:', autoErr.message);
        }
      }
    }

    // Selalu simpan ke local fallback store agar data persisten
    const localPayload = { ...payload };
    if (ulanganData.id) localPayload.id = ulanganData.id;
    await saveLocalExam(localPayload);

    // Coba simpan ke Supabase jika tersedia
    try {
      const supabase = await createServerClient();
      if (ulanganData.id) {
        await supabase.from('ulangan').update(payload).eq('id', ulanganData.id);
      } else {
        await supabase.from('ulangan').insert([payload]);
      }
    } catch (dbErr) {
      console.warn('[saveUlangan] Supabase sync notice:', dbErr.message);
    }

    revalidatePath('/admin/ulangan');
    revalidatePath('/siswa/ulangan');
    return { success: true, message: 'Ulangan berhasil disimpan.' };
  } catch (err) {
    console.error('[saveUlangan Error]:', err);
    return { success: false, message: err.message };
  }
}

/**
 * Menghapus ulangan.
 *
 * @param {string} id
 */
export async function deleteUlangan(id) {
  try {
    await deleteLocalExam(id);

    try {
      const supabase = await createServerClient();
      await supabase.from('ulangan').delete().eq('id', id);
    } catch (err) {}

    revalidatePath('/admin/ulangan');
    revalidatePath('/siswa/ulangan');
    return { success: true, message: 'Ulangan berhasil dihapus.' };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

/**
 * Mengambil soal ulangan untuk tipe CBT manual.
 *
 * @param {string} ulanganId
 * @param {boolean} [isStudent=false]
 */
export async function getSoalList(ulanganId, isStudent = false) {
  try {
    const supabase = await createServerClient();
    const selectCols = isStudent
      ? 'id, ulangan_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, bobot'
      : 'id, ulangan_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban, bobot';

    const { data, error } = await supabase
      .from('soal')
      .select(selectCols)
      .eq('ulangan_id', ulanganId)
      .order('urutan', { ascending: true });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err) {
    return { success: false, data: [], message: err.message };
  }
}

/**
 * Menyimpan atau memperbarui butir soal manual.
 *
 * @param {any} soalData
 */
export async function saveSoal(soalData) {
  try {
    const supabase = await createServerClient();
    const payload = {
      ulangan_id: soalData.ulangan_id,
      urutan: parseInt(soalData.urutan) || 1,
      pertanyaan: soalData.pertanyaan?.trim(),
      pilihan_a: soalData.pilihan_a?.trim(),
      pilihan_b: soalData.pilihan_b?.trim(),
      pilihan_c: soalData.pilihan_c?.trim(),
      pilihan_d: soalData.pilihan_d?.trim(),
      kunci_jawaban: soalData.kunci_jawaban?.toUpperCase(),
      bobot: parseInt(soalData.bobot) || 10,
    };

    if (!payload.pertanyaan || !payload.pilihan_a || !payload.kunci_jawaban) {
      return { success: false, message: 'Pertanyaan, pilihan jawaban, dan kunci wajib diisi.' };
    }

    let res;
    if (soalData.id) {
      res = await supabase.from('soal').update(payload).eq('id', soalData.id);
    } else {
      res = await supabase.from('soal').insert([payload]);
    }

    if (res.error) throw res.error;

    revalidatePath(`/admin/ulangan/${payload.ulangan_id}/soal`);
    return { success: true, message: 'Soal berhasil disimpan.' };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

/**
 * Menghapus butir soal manual.
 *
 * @param {string} id
 * @param {string} ulanganId
 */
export async function deleteSoal(id, ulanganId) {
  try {
    const supabase = await createServerClient();
    const { error } = await supabase.from('soal').delete().eq('id', id);
    if (error) throw error;

    if (ulanganId) {
      revalidatePath(`/admin/ulangan/${ulanganId}/soal`);
    }
    return { success: true, message: 'Soal berhasil dihapus.' };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

/**
 * Mengirimkan jawaban ulangan oleh siswa (Pilihan Ganda & Soal Essay / Uraian)
 * Menilai otomatis bagian Pilihan Ganda dan merekam jawaban Essay untuk dikoreksi guru.
 *
 * @param {{ ulanganId: string, jawaban?: Record<string, string>, jawaban_pg?: Record<string, string>, jawaban_essay?: Record<string, string> }} param0
 */
export async function submitUlanganJawaban({ 
  ulanganId, 
  jawaban = {}, 
  jawaban_pg, 
  jawaban_essay = {},
  is_disqualified = false,
  catatan_pelanggaran = ''
}) {
  try {
    const { user, profile, studentData } = await getCurrentUserAction();

    if (!user) {
      return { success: false, message: 'Silakan login terlebih dahulu untuk mengumpulkan ujian.' };
    }

    const examRes = await getUlanganById(ulanganId, false);
    if (!examRes.success || !examRes.data) {
      return { success: false, message: 'Data ujian tidak ditemukan.' };
    }
    const exam = examRes.data;

    // Kompatibilitas jawaban PG: bisa dikirim sebagai jawaban_pg atau jawaban
    const answersPG = jawaban_pg || jawaban || {};
    const answersEssay = jawaban_essay || {};

    let totalBenarPG = 0;
    let totalSalahPG = 0;
    let totalSoalPG = 0;
    let nilaiPG = 0;

    // A. PENILAIAN UJIAN NASKAH PDF (PG & Essay)
    if (exam.tipe_ujian === 'pdf') {
      const kunciMap = exam.kunci_jawaban_pdf || {};
      const soalPgList = exam.soal_pg || [];
      totalSoalPG = soalPgList.length > 0 ? soalPgList.length : (exam.total_soal_pdf || Object.keys(kunciMap).length || 10);

      for (let i = 1; i <= totalSoalPG; i++) {
        const userAns = (answersPG[i] || answersPG[String(i)] || '').trim().toUpperCase();
        
        // Ambil kunci dari soal_pg jika ada, atau kunci_jawaban_pdf
        const foundSoal = soalPgList.find((s) => s.nomor === i);
        const kunciAns = (foundSoal?.kunci_jawaban || kunciMap[i] || kunciMap[String(i)] || '').trim().toUpperCase();

        if (kunciAns && userAns === kunciAns) {
          totalBenarPG++;
        } else {
          totalSalahPG++;
        }
      }

      nilaiPG = totalSoalPG > 0 ? Math.round((totalBenarPG / totalSoalPG) * 100 * 100) / 100 : 0;
    } 
    // B. PENILAIAN UJIAN CBT MANUAL
    else {
      let soalList = [];
      try {
        const supabase = await createServerClient();
        const { data } = await supabase
          .from('soal')
          .select('id, kunci_jawaban, bobot')
          .eq('ulangan_id', ulanganId);
        if (data) soalList = data;
      } catch (e) {}

      if (soalList.length === 0) {
        return { success: false, message: 'Gagal memuat butir soal ujian CBT.' };
      }

      totalSoalPG = soalList.length;
      let totalSkorMaks = 0;
      let skorDidapat = 0;

      for (const item of soalList) {
        const bobot = item.bobot || 10;
        totalSkorMaks += bobot;

        const userAns = (answersPG[item.id] || '').trim().toUpperCase();
        if (userAns === (item.kunci_jawaban || '').toUpperCase()) {
          totalBenarPG++;
          skorDidapat += bobot;
        } else {
          totalSalahPG++;
        }
      }

      nilaiPG = totalSkorMaks > 0 ? Math.round((skorDidapat / totalSkorMaks) * 100 * 100) / 100 : 0;
    }

    const totalEssayCount = exam.soal_essay?.length || 0;
    const hasEssay = totalEssayCount > 0;

    const finalNilai = is_disqualified ? 0 : nilaiPG;
    const finalNilaiPg = is_disqualified ? 0 : nilaiPG;
    const finalStatus = is_disqualified
      ? 'DIDISKUALIFIKASI'
      : (hasEssay ? 'Menunggu Koreksi Essay' : 'Selesai');

    const defaultPelanggaranMsg = 'Didiskualifikasi otomatis oleh sistem karena melanggar tata tertib ujian (berpindah tab / keluar layar / copy-paste) melebihi batas toleransi 3 kali.';

    const payloadResult = {
      ulangan_id: ulanganId,
      siswa_id: studentData?.id || null,
      profile_id: user.id,
      nilai: finalNilai,
      nilai_pg: finalNilaiPg,
      nilai_essay: is_disqualified ? 0 : null,
      status_koreksi: finalStatus,
      is_disqualified: Boolean(is_disqualified),
      catatan_pelanggaran: is_disqualified ? (catatan_pelanggaran || defaultPelanggaranMsg) : '',
      koreksi_essay: {},
      catatan_guru: is_disqualified ? 'Siswa didiskualifikasi otomatis (terdeteksi 4x pelanggaran layar/tab).' : '',
      total_benar: is_disqualified ? 0 : totalBenarPG,
      total_salah: is_disqualified ? totalSoalPG : totalSalahPG,
      total_soal_pg: totalSoalPG,
      total_soal_essay: totalEssayCount,
      jawaban_siswa: answersPG,
      jawaban_pg: answersPG,
      jawaban_essay: answersEssay,
      submitted_at: new Date().toISOString(),
      siswa: {
        id: studentData?.id || user.id,
        nama: studentData?.nama || profile?.nama_lengkap || user.email?.split('@')[0],
        nisn: studentData?.nisn || user.email?.split('@')[0] || '-',
        kelas: studentData?.kelas || exam.kelas || 'IX',
      },
      profile: {
        nama_lengkap: profile?.nama_lengkap || studentData?.nama || 'Siswa',
        email: user.email,
      },
      ulangan: {
        id: exam.id,
        judul: exam.judul,
        mapel: exam.mapel,
        kelas: exam.kelas,
        tipe_ujian: exam.tipe_ujian,
        soal_essay: exam.soal_essay || [],
      },
    };

    // Simpan ke local store cadangan
    await saveLocalResult(payloadResult);

    // Simpan ke Supabase jika tersedia
    try {
      const supabase = await createServerClient();
      await supabase.from('hasil_ulangan').insert([{
        ulangan_id: ulanganId,
        siswa_id: studentData?.id || null,
        profile_id: user.id.startsWith('siswa-') ? null : user.id,
        nilai: finalNilai,
        total_benar: payloadResult.total_benar,
        total_salah: payloadResult.total_salah,
        jawaban_siswa: answersPG,
        submitted_at: payloadResult.submitted_at,
      }]);
    } catch (dbErr) {
      console.warn('[submitUlanganJawaban] Supabase notice:', dbErr.message);
    }

    revalidatePath('/siswa/hasil-ulangan');
    revalidatePath('/admin/hasil-ulangan');
    revalidatePath('/siswa/ulangan');

    return {
      success: true,
      message: hasEssay 
        ? 'Ujian berhasil dikumpulkan! Jawaban pilihan ganda dinilai otomatis, jawaban essay dikirim ke guru.' 
        : 'Ujian berhasil dikumpulkan dan dinilai secara otomatis!',
      hasil: {
        nilai: nilaiPG,
        totalBenar: totalBenarPG,
        totalSalah: totalSalahPG,
        totalSoalPG,
        totalSoalEssay: totalEssayCount,
        hasEssay,
      },
    };
  } catch (err) {
    console.error('[submitUlanganJawaban Error]:', err);
    return { success: false, message: `Gagal mengirim ujian: ${err.message}` };
  }
}

/**
 * Guru memberikan nilai dan catatan koreksi untuk jawaban essay siswa.
 *
 * @param {{ resultId: string, skorEssayMap: Record<string, number>, catatanGuru?: string }} param0
 */
export async function gradeEssaySubmission({ resultId, skorEssayMap, catatanGuru = '' }) {
  try {
    const results = await getLocalResults();
    const resultItem = results.find((r) => r.id === resultId);

    if (!resultItem) {
      return { success: false, message: 'Data hasil ujian tidak ditemukan.' };
    }

    // Hitung total nilai essay yang diberikan
    const skorValues = Object.values(skorEssayMap || {}).map((v) => Number(v) || 0);
    const totalSkorEssay = skorValues.reduce((a, b) => a + b, 0);

    // Bobot kalkulasi:
    // Jika ada essay, nilai akhir = Nilai PG (proporsi) + Total Skor Essay
    // Atau guru dapat memberikan nilai essay tambahan
    const nilaiPG = Number(resultItem.nilai_pg ?? resultItem.nilai) || 0;
    
    // Total nilai gabungan (maksimal 100)
    const nilaiGabungan = Math.min(100, Math.round((nilaiPG * 0.6 + totalSkorEssay * 0.4) * 100) / 100);

    const updatedFields = {
      nilai: nilaiGabungan,
      nilai_essay: totalSkorEssay,
      koreksi_essay: skorEssayMap,
      catatan_guru: catatanGuru.trim(),
      status_koreksi: 'Sudah Dikoreksi',
      graded_at: new Date().toISOString(),
    };

    await updateLocalResult(resultId, updatedFields);

    revalidatePath('/admin/hasil-ulangan');
    revalidatePath('/siswa/hasil-ulangan');

    return {
      success: true,
      message: 'Nilai essay berhasil disimpan dan nilai total siswa telah diperbarui!',
      nilaiAkhir: nilaiGabungan,
    };
  } catch (err) {
    console.error('[gradeEssaySubmission Error]:', err);
    return { success: false, message: err.message };
  }
}

/**
 * Mengambil riwayat hasil ulangan siswa yang sedang login.
 */
export async function getHasilUlanganSiswa() {
  try {
    const { user } = await getCurrentUserAction();
    if (!user) return { success: false, data: [] };

    let results = [];

    try {
      const supabase = await createServerClient();
      const { data, error } = await supabase
        .from('hasil_ulangan')
        .select(`
          id, nilai, total_benar, total_salah, submitted_at,
          ulangan:ulangan_id (id, judul, mapel, kelas, tipe_ujian)
        `)
        .eq('profile_id', user.id)
        .order('submitted_at', { ascending: false });

      if (!error && data && data.length > 0) {
        results = data;
      }
    } catch (e) {}

    const localResults = await getLocalResults();
    const myLocal = localResults.filter(
      (r) => r.profile_id === user.id || (user.email && r.profile?.email === user.email)
    );

    const merged = [...results];
    for (const lr of myLocal) {
      if (!merged.some((m) => m.id === lr.id || (m.ulangan?.id === lr.ulangan?.id && m.submitted_at === lr.submitted_at))) {
        merged.push(lr);
      }
    }

    merged.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
    return { success: true, data: merged };
  } catch (err) {
    return { success: false, data: [] };
  }
}

/**
 * Mengambil seluruh hasil ulangan untuk panel Guru/Admin.
 *
 * @param {string} [ulanganId]
 */
export async function getAllHasilUlangan(ulanganId) {
  try {
    let results = [];

    try {
      const supabase = await createServerClient();
      let query = supabase
        .from('hasil_ulangan')
        .select(`
          id, nilai, total_benar, total_salah, submitted_at, jawaban_siswa,
          siswa:siswa_id (id, nama, nisn, kelas),
          profile:profile_id (nama_lengkap, email),
          ulangan:ulangan_id (id, judul, mapel, kelas, tipe_ujian)
        `)
        .order('submitted_at', { ascending: false });

      if (ulanganId && ulanganId !== 'Semua') {
        query = query.eq('ulangan_id', ulanganId);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        results = data;
      }
    } catch (e) {}

    const localResults = await getLocalResults();
    let filteredLocal = localResults;
    if (ulanganId && ulanganId !== 'Semua') {
      filteredLocal = filteredLocal.filter((r) => r.ulangan_id === ulanganId || r.ulangan?.id === ulanganId);
    }

    const merged = [...results];
    for (const lr of filteredLocal) {
      if (!merged.some((m) => m.id === lr.id)) {
        merged.push(lr);
      }
    }

    merged.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
    return { success: true, data: merged };
  } catch (err) {
    return { success: false, data: [] };
  }
}
