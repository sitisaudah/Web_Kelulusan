import { promises as fs } from 'fs';
import path from 'path';

/**
 * Penyimpanan lokal JSON fallback untuk modul Ulangan CBT & Soal PDF.
 * Memastikan fitur ujian PDF dan pengerjaan soal siswa tetap berfungsi 100%
 * baik saat Supabase aktif maupun saat berjalan secara offline / local development.
 */

const DATA_DIR = path.join(process.cwd(), 'src', 'backend', 'data');
const EXAMS_FILE = path.join(DATA_DIR, 'exams.json');
const RESULTS_FILE = path.join(DATA_DIR, 'results.json');

// Default initial data jika file belum ada
const DEFAULT_EXAMS = [
  {
    id: 'demo-pdf-exam-1',
    judul: 'Asesmen Sumatif Akhir Jenjang - IPA Terpadu',
    deskripsi: 'Naskah asesmen sumatif mencakup Fisika, Kimia, dan Biologi SMP. Dilengkapi soal Pilihan Ganda dan Soal Essay / Uraian yang dapat dijawab langsung pada halaman ujian.',
    mapel: 'IPA',
    kelas: 'IX',
    durasi_menit: 60,
    is_active: true,
    tipe_ujian: 'pdf',
    file_pdf_url: '/uploads/soal/contoh_soal_lengkap_pg_essay.pdf',
    file_pdf_nama: 'contoh_soal_lengkap_pg_essay.pdf',
    file_pdf_size: '342 KB',
    total_soal_pdf: 3,
    opsi_jawaban: 'ABCD',
    kunci_jawaban_pdf: {
      '1': 'C',
      '2': 'A',
      '3': 'B',
    },
    bobot_per_soal: 20,
    soal_pg: [
      {
        nomor: 1,
        pertanyaan: 'Organel sel yang berfungsi sebagai tempat respirasi sel untuk menghasilkan energi adalah...',
        pilihan_a: 'Ribosom',
        pilihan_b: 'Kloroplas',
        pilihan_c: 'Mitokondria',
        pilihan_d: 'Badan Golgi',
        kunci_jawaban: 'C',
        bobot: 20,
      },
      {
        nomor: 2,
        pertanyaan: 'Lambang unsur kimia untuk Besi dalam tabel periodik adalah...',
        pilihan_a: 'Fe',
        pilihan_b: 'Be',
        pilihan_c: 'Pb',
        pilihan_d: 'Au',
        kunci_jawaban: 'A',
        bobot: 20,
      },
      {
        nomor: 3,
        pertanyaan: 'Satuan Internasional (SI) untuk besaran kuat arus listrik adalah...',
        pilihan_a: 'Volt',
        pilihan_b: 'Ampere',
        pilihan_c: 'Ohm',
        pilihan_d: 'Watt',
        kunci_jawaban: 'B',
        bobot: 20,
      },
    ],
    soal_essay: [
      {
        nomor: 1,
        pertanyaan: 'Jelaskan perbedaan mendasar antara pembelahan sel secara mitosis dan meiosis!',
        bobot: 20,
      },
      {
        nomor: 2,
        pertanyaan: 'Sebutkan dan jelaskan 3 faktor yang mempengaruhi besarnya hambatan listrik pada kawat penghantar!',
        bobot: 20,
      },
    ],
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

async function ensureDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (e) {}
}

export async function getLocalExams() {
  await ensureDir();
  try {
    const content = await fs.readFile(EXAMS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    await fs.writeFile(EXAMS_FILE, JSON.stringify(DEFAULT_EXAMS, null, 2), 'utf-8');
    return DEFAULT_EXAMS;
  }
}

export async function saveLocalExam(examData) {
  await ensureDir();
  const exams = await getLocalExams();
  
  if (examData.id) {
    const idx = exams.findIndex((e) => e.id === examData.id);
    if (idx !== -1) {
      exams[idx] = { ...exams[idx], ...examData, updated_at: new Date().toISOString() };
    } else {
      exams.unshift({ ...examData, created_at: new Date().toISOString() });
    }
  } else {
    const newExam = {
      ...examData,
      id: `exam-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
    };
    exams.unshift(newExam);
  }

  await fs.writeFile(EXAMS_FILE, JSON.stringify(exams, null, 2), 'utf-8');
  return { success: true };
}

export async function deleteLocalExam(id) {
  await ensureDir();
  const exams = await getLocalExams();
  const filtered = exams.filter((e) => e.id !== id);
  await fs.writeFile(EXAMS_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
  return { success: true };
}

export async function getLocalResults() {
  await ensureDir();
  try {
    const content = await fs.readFile(RESULTS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    return [];
  }
}

export async function saveLocalResult(resultData) {
  await ensureDir();
  const results = await getLocalResults();
  const newResult = {
    ...resultData,
    id: resultData.id || `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    submitted_at: resultData.submitted_at || new Date().toISOString(),
  };
  results.unshift(newResult);
  await fs.writeFile(RESULTS_FILE, JSON.stringify(results, null, 2), 'utf-8');
  return { success: true, id: newResult.id };
}

export async function updateLocalResult(id, updatedFields) {
  await ensureDir();
  const results = await getLocalResults();
  const idx = results.findIndex((r) => r.id === id);
  if (idx !== -1) {
    results[idx] = { ...results[idx], ...updatedFields };
    await fs.writeFile(RESULTS_FILE, JSON.stringify(results, null, 2), 'utf-8');
    return { success: true, data: results[idx] };
  }
  return { success: false, message: 'Data hasil tidak ditemukan.' };
}
