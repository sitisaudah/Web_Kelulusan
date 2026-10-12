import { promises as fs } from 'fs';
import path from 'path';

/**
 * Penyimpanan lokal JSON fallback untuk Data Kelulusan yang diunggah via Excel.
 * Memungkinkan sekolah menggunakan file Excel lokal (.xlsx) tanpa harus online Google Sheets.
 */

const DATA_DIR = path.join(process.cwd(), 'src', 'backend', 'data');
const GRADUATION_FILE = path.join(DATA_DIR, 'graduation.json');

async function ensureDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (e) {}
}

export async function getLocalGraduationData() {
  await ensureDir();
  try {
    const content = await fs.readFile(GRADUATION_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    return parsed;
  } catch (err) {
    return {
      source: 'none', // 'excel' | 'none'
      last_updated: null,
      students: [],
    };
  }
}

export async function saveLocalGraduationData(studentsList, fileName = 'uploaded_excel.xlsx') {
  await ensureDir();
  const payload = {
    source: 'excel',
    file_name: fileName,
    last_updated: new Date().toISOString(),
    total: studentsList.length,
    students: studentsList,
  };

  await fs.writeFile(GRADUATION_FILE, JSON.stringify(payload, null, 2), 'utf-8');
  return { success: true, count: studentsList.length };
}

