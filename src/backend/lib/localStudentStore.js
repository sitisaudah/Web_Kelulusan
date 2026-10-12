import { promises as fs } from 'fs';
import path from 'path';

/**
 * Penyimpanan lokal JSON fallback untuk Data Induk Siswa.
 * Memastikan manajemen siswa dan pencarian profil siswa berfungsi optimal
 * baik saat Supabase aktif maupun dalam mode lokal / offline development.
 */

const DATA_DIR = path.join(process.cwd(), 'src', 'backend', 'data');
const STUDENTS_FILE = path.join(DATA_DIR, 'students.json');

// Default initial data jika file belum ada
const DEFAULT_STUDENTS = [
  {
    id: 'siswa-001',
    nisn: '0081234567',
    nipd: '202401',
    nik: '7401010101080001',
    nama: 'Ahmad Fadillah',
    kelas: 'IX-A',
    tempat_lahir: 'Tanailandu',
    tanggal_lahir: '2010-05-14',
    jk: 'L',
    agama: 'Islam',
    nama_ayah: 'La Ode Fadli',
    nama_ibu: 'Wa Ode Rosna',
    alamat: 'Desa Tanailandu, Buton Tengah',
    created_at: new Date().toISOString(),
  },
  {
    id: 'siswa-002',
    nisn: '0089876543',
    nipd: '202402',
    nik: '7401010101080002',
    nama: 'Siti Rahmawati',
    kelas: 'IX-B',
    tempat_lahir: 'Mawasangka',
    tanggal_lahir: '2010-08-22',
    jk: 'P',
    agama: 'Islam',
    nama_ayah: 'La Ode Rahman',
    nama_ibu: 'Wa Ode Sitti',
    alamat: 'Mawasangka, Buton Tengah',
    created_at: new Date().toISOString(),
  },
  {
    id: 'siswa-003',
    nisn: '0087654321',
    nipd: '202403',
    nik: '7401010101080003',
    nama: 'Budi Santoso',
    kelas: 'IX-A',
    tempat_lahir: 'Gu',
    tanggal_lahir: '2010-03-10',
    jk: 'L',
    agama: 'Islam',
    nama_ayah: 'Santoso',
    nama_ibu: 'Mariam',
    alamat: 'Kec. Gu, Buton Tengah',
    created_at: new Date().toISOString(),
  },
];

async function ensureDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (e) {}
}

export async function getLocalStudents() {
  await ensureDir();
  try {
    const content = await fs.readFile(STUDENTS_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    await fs.writeFile(STUDENTS_FILE, JSON.stringify(DEFAULT_STUDENTS, null, 2), 'utf-8');
    return DEFAULT_STUDENTS;
  }
}

export async function saveLocalStudent(studentData) {
  await ensureDir();
  const students = await getLocalStudents();

  if (studentData.id) {
    const idx = students.findIndex((s) => s.id === studentData.id);
    if (idx !== -1) {
      students[idx] = { ...students[idx], ...studentData, updated_at: new Date().toISOString() };
    } else {
      students.unshift({ ...studentData, created_at: new Date().toISOString() });
    }
  } else {
    // Cari apakah NISN sudah ada
    const existingIdx = students.findIndex((s) => s.nisn === studentData.nisn);
    if (existingIdx !== -1) {
      students[existingIdx] = { ...students[existingIdx], ...studentData, updated_at: new Date().toISOString() };
    } else {
      const newStudent = {
        ...studentData,
        id: `siswa-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        created_at: new Date().toISOString(),
      };
      students.unshift(newStudent);
    }
  }

  await fs.writeFile(STUDENTS_FILE, JSON.stringify(students, null, 2), 'utf-8');
  return { success: true };
}

export async function deleteLocalStudent(id) {
  await ensureDir();
  const students = await getLocalStudents();
  const filtered = students.filter((s) => s.id !== id);
  await fs.writeFile(STUDENTS_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
  return { success: true };
}

export async function importLocalStudentsBatch(cleanList) {
  await ensureDir();
  const students = await getLocalStudents();

  cleanList.forEach((item) => {
    const idx = students.findIndex((s) => s.nisn === item.nisn);
    if (idx !== -1) {
      students[idx] = { ...students[idx], ...item, updated_at: new Date().toISOString() };
    } else {
      students.push({
        ...item,
        id: `siswa-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        created_at: new Date().toISOString(),
      });
    }
  });

  await fs.writeFile(STUDENTS_FILE, JSON.stringify(students, null, 2), 'utf-8');
  return { success: true, count: cleanList.length };
}
