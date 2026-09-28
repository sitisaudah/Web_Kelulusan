/**
 * src/backend/lib/pdfWorkerCli.js
 *
 * Standalone CLI script yang dieksekusi via Node.js child_process
 * untuk mem-parsing PDF secara andal tanpa interferensi module bundler Next.js / Turbopack.
 */

const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

async function run() {
  const filePath = process.argv[2];
  if (!filePath || !fs.existsSync(filePath)) {
    console.log(JSON.stringify({ success: false, error: 'File tidak ditemukan.' }));
    process.exit(1);
  }

  try {
    const { PDFParse } = await import('pdf-parse');
    
    // Cari worker yang valid
    const workerCandidates = [
      path.join(process.cwd(), 'node_modules', 'pdf-parse', 'dist', 'worker', 'pdf.worker.mjs'),
      path.join(process.cwd(), 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.mjs'),
      path.join(process.cwd(), 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.mjs'),
    ];

    for (const w of workerCandidates) {
      if (fs.existsSync(w)) {
        try {
          PDFParse.setWorker(pathToFileURL(w).href);
          break;
        } catch (e) {}
      }
    }

    const buffer = fs.readFileSync(filePath);
    const parser = new PDFParse({ data: buffer });
    const parsedData = await parser.getText();
    const rawText = parsedData?.text || '';

    console.log(JSON.stringify({ success: true, text: rawText }));
    process.exit(0);
  } catch (err) {
    console.log(JSON.stringify({ success: false, error: err.message || String(err) }));
    process.exit(1);
  }
}

run();
