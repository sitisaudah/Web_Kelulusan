import { PDFParse } from 'pdf-parse';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { pathToFileURL } from 'url';

/**
 * src/backend/lib/pdfExamParser.js
 *
 * Parser cerdas untuk mengekstrak naskah soal PDF menjadi butir soal terstruktur
 * (Pilihan Ganda & Soal Essay / Uraian) langsung ke tampilan web.
 * Mendukung format penomoran inline standar maupun format tabel/kolom Word.
 */

// Konfigurasi worker pdf-parse
function setupPdfWorker() {
  try {
    const workerCandidates = [
      path.join(process.cwd(), 'node_modules', 'pdf-parse', 'dist', 'worker', 'pdf.worker.mjs'),
      path.join(process.cwd(), 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.mjs'),
      path.join(process.cwd(), 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.mjs'),
    ];

    for (const w of workerCandidates) {
      if (fs.existsSync(w)) {
        PDFParse.setWorker(pathToFileURL(w).href);
        break;
      }
    }
  } catch (e) {}
}

/**
 * Ekstraksi teks melalui script CLI Node independen jika terjadi kendala pada Next.js bundler
 */
function extractTextViaCli(pdfPathOrBuffer) {
  let tempFilePath = null;
  let targetPath = null;

  try {
    if (typeof pdfPathOrBuffer === 'string' && fs.existsSync(pdfPathOrBuffer)) {
      targetPath = pdfPathOrBuffer;
    } else {
      tempFilePath = path.join(os.tmpdir(), `temp_exam_${Date.now()}_${Math.random().toString(36).substring(2)}.pdf`);
      fs.writeFileSync(tempFilePath, pdfPathOrBuffer);
      targetPath = tempFilePath;
    }

    const cliScript = path.join(process.cwd(), 'src', 'backend', 'lib', 'pdfWorkerCli.js');
    const cp = eval('require("child_process")');
    const stdout = cp.execFileSync('node', [cliScript, targetPath], {
      encoding: 'utf8',
      timeout: 15000,
      maxBuffer: 10 * 1024 * 1024,
    });

    const parsed = JSON.parse(stdout.trim());
    if (parsed.success && parsed.text) {
      return parsed.text;
    }
    return '';
  } catch (cliErr) {
    console.error('[extractTextViaCli Error]:', cliErr.message);
    return '';
  } finally {
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try { fs.unlinkSync(tempFilePath); } catch (e) {}
    }
  }
}

export async function extractExamFromPdfBuffer(pdfBuffer, optionalFilePath = null) {
  let rawText = '';

  // 1. Coba ekstraksi langsung dengan PDFParse dalam memori
  try {
    setupPdfWorker();
    const parser = new PDFParse({ data: pdfBuffer });
    const parsedData = await parser.getText();
    rawText = parsedData?.text || '';
  } catch (error) {
    console.warn('[pdfExamParser direct warning]:', error.message, '-> Beralih ke CLI worker fallback...');
  }

  // 2. Jika direct parsing gagal (misal kendala worker di Next.js Turbopack), gunakan CLI worker fallback
  if (!rawText || rawText.trim().length === 0) {
    try {
      rawText = extractTextViaCli(optionalFilePath || pdfBuffer);
    } catch (fallbackErr) {
      console.error('[pdfExamParser fallback Error]:', fallbackErr);
    }
  }

  if (!rawText || rawText.trim().length === 0) {
    return {
      success: false,
      message: 'Gagal membaca teks dari naskah PDF.',
      soal_pg: [],
      soal_essay: [],
      kunci_jawaban: {},
      total_pg: 0,
      total_essay: 0,
    };
  }

  return parseSmartExamText(rawText);
}

/**
 * Parser multi-strategi untuk mengenali teks naskah soal dari PDF
 *
 * @param {string} rawText
 */
export function parseSmartExamText(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return { success: false, soal_pg: [], soal_essay: [], kunci_jawaban: {}, total_pg: 0, total_essay: 0 };
  }

  // 1. Ekstraksi Bagian Kunci Jawaban jika tertera di halaman akhir naskah
  const kunciRegex = /KUNCI\s+JAWABAN[\s\S]*?(?:A\.\s*PILIHAN\s+GANDA)?([\s\S]*?)(?:--\s*\d+\s*of\s*\d+\s*--|$)/i;
  const kunciMatch = rawText.match(kunciRegex);
  const keys = {};

  if (kunciMatch) {
    const keyPairs = kunciMatch[1].matchAll(/(\d+)[\.\s]*[:\.\-]?\s*([A-Ea-e])/g);
    for (const kp of keyPairs) {
      keys[parseInt(kp[1])] = kp[2].toUpperCase();
    }
  }

  // Buang teks kunci jawaban agar tidak membingungkan parser butir soal
  let text = rawText;
  if (kunciMatch) {
    text = text.substring(0, kunciMatch.index);
  }

  // 2. Deteksi Pemisah Bagian Essay / Uraian (Bagian B / II)
  const esaiRegex = /(?:(?:\r?\n)+(?:B\.\s*ESAI|B\.\s*ESSAY|II\.\s*ESAI|II\.\s*ESSAY|BAGIAN\s+B[^\r\n]*ESAI)[^\r\n]*)/i;
  const esaiIdx = text.search(esaiRegex);

  let pgPart = text;
  let esaiPart = '';
  if (esaiIdx !== -1) {
    pgPart = text.substring(0, esaiIdx);
    esaiPart = text.substring(esaiIdx);
  }

  // 3. Deteksi Format Soal PG: Inline Numbering vs Column/Table Layout
  const linesPg = pgPart.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const hasInlineNumberedQuestions =
    linesPg.some((l) => /^\d+[\.\)]\s+[A-Za-z\"']/.test(l)) &&
    linesPg.some((l) => /^[A-Ea-e][\.\)]\s+/.test(l));

  let pgList = [];

  // STRATEGI A: FORMAT INLINE (1. Pertanyaan... A. Opsi... B. Opsi...)
  if (hasInlineNumberedQuestions) {
    let currentSoal = null;
    let currentOption = null;

    for (const line of linesPg) {
      if (/^(?:I|A|BAGIAN\s+[IA])\s*[\.:\-]?\s*(?:PILIHAN\s+GANDA|PG)/i.test(line)) continue;
      if (!currentSoal && !/^\d+[\.\)]/.test(line)) continue;

      const qMatch = line.match(/^(\d+)[\.\)]\s*(.*)/);
      if (qMatch) {
        if (currentSoal && currentSoal.pertanyaan) {
          pgList.push(currentSoal);
        }
        currentSoal = {
          nomor: parseInt(qMatch[1]) || pgList.length + 1,
          pertanyaan: qMatch[2] || '',
          pilihan_a: '',
          pilihan_b: '',
          pilihan_c: '',
          pilihan_d: '',
          pilihan_e: '',
          kunci_jawaban: keys[parseInt(qMatch[1])] || 'A',
          bobot: 10,
        };
        currentOption = null;
        continue;
      }

      const optMatch = line.match(/^([A-Ea-e])[\.\)]\s*(.*)/);
      if (optMatch && currentSoal) {
        currentOption = optMatch[1].toLowerCase();
        currentSoal[`pilihan_${currentOption}`] = optMatch[2] || '';
        continue;
      }

      if (currentSoal) {
        if (currentOption) {
          currentSoal[`pilihan_${currentOption}`] += (currentSoal[`pilihan_${currentOption}`] ? ' ' : '') + line;
        } else {
          currentSoal.pertanyaan += (currentSoal.pertanyaan ? ' ' : '') + line;
        }
      }
    }
    if (currentSoal && currentSoal.pertanyaan) {
      pgList.push(currentSoal);
    }
  } 
  // STRATEGI B: FORMAT TABEL / KOLOM TERPISAH (Naskah soal & 4 opsi, nomor di kolom lain)
  else {
    let cleaned = pgPart
      .replace(/--\s*\d+\s*of\s*\d+\s*--/g, '')
      .replace(/LATIHAN\s+SOAL[^\r\n]*/gi, '')
      .replace(/Tingkat\s+Sekolah[^\r\n]*/gi, '')
      .replace(/A\.\s*PILIHAN\s+GANDA[^\r\n]*/gi, '')
      .replace(/Pilihlah\s+salah\s+satu[^\r\n]*/gi, '');

    // Saring baris yang hanya berupa penomoran terpisah ('1.', '2.', 'a.', 'b.', dst.)
    const rawLines = cleaned.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const contentLines = rawLines.filter((l) => !/^(?:\d+\.?|[a-eA-E]\.?)$/.test(l));

    let currentQuestionText = '';
    let currentOptions = [];

    for (let i = 0; i < contentLines.length; i++) {
      const line = contentLines[i];

      if (!currentQuestionText) {
        currentQuestionText = line;
        continue;
      }

      // Cek apakah pertanyaan sudah lengkap berdasarkan tanda baca akhir
      const isQuestionEnding =
        /[\.\?\:]\s*$/.test(currentQuestionText) ||
        /(?:disebut|adalah|yaitu|berikut|merupakan|kecuali|sebagai|adalah teks)\s*\.{2,}$/i.test(currentQuestionText);

      if (!isQuestionEnding && currentOptions.length === 0) {
        currentQuestionText += ' ' + line;
        continue;
      }

      // Kumpulkan 4 opsi jawaban
      currentOptions.push(line);

      if (currentOptions.length === 4) {
        const qNum = pgList.length + 1;
        pgList.push({
          nomor: qNum,
          pertanyaan: currentQuestionText.trim(),
          pilihan_a: currentOptions[0] || '',
          pilihan_b: currentOptions[1] || '',
          pilihan_c: currentOptions[2] || '',
          pilihan_d: currentOptions[3] || '',
          pilihan_e: '',
          kunci_jawaban: keys[qNum] || 'A',
          bobot: 10,
        });
        currentQuestionText = '';
        currentOptions = [];
      }
    }
  }

  // 4. Parsing Bagian Soal Essay / Uraian
  let esaiList = [];
  if (esaiPart) {
    let cleanEsai = esaiPart
      .replace(/--\s*\d+\s*of\s*\d+\s*--/g, '')
      .replace(/B\.\s*ESAI[^\r\n]*/gi, '')
      .replace(/Jawablah\s+pertanyaan[^\r\n]*/gi, '');

    const eLines = cleanEsai.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const validELines = eLines.filter((l) => !/^(?:\d+\.?|[a-eA-E]\.?)$/.test(l));

    let eIdx = 1;
    let curEText = '';

    for (const el of validELines) {
      if (!curEText) {
        curEText = el;
      } else if (!/[\!\?\.]\s*$/.test(curEText)) {
        curEText += ' ' + el;
      } else {
        esaiList.push({
          nomor: eIdx++,
          pertanyaan: curEText.trim(),
          bobot: 20,
        });
        curEText = el;
      }
    }
    if (curEText) {
      esaiList.push({
        nomor: eIdx++,
        pertanyaan: curEText.trim(),
        bobot: 20,
      });
    }
  }

  return {
    success: true,
    soal_pg: pgList,
    soal_essay: esaiList,
    kunci_jawaban: keys,
    total_pg: pgList.length,
    total_essay: esaiList.length,
  };
}
