import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { extractExamFromPdfBuffer } from '@/backend/lib/pdfExamParser';

export const runtime = 'nodejs';

/**
 * Route handler untuk upload file naskah soal PDF oleh guru/admin.
 * File disimpan di public/uploads/soal/ dan sekaligus di-parsing secara otomatis
 * menjadi butir soal Pilihan Ganda & Soal Essay / Uraian.
 */
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'Tidak ada file yang diunggah.' },
        { status: 400 }
      );
    }

    // Validasi tipe file PDF
    const isPdfType = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdfType) {
      return NextResponse.json(
        { success: false, message: 'Format file tidak valid. Hanya file PDF (.pdf) yang diperbolehkan.' },
        { status: 400 }
      );
    }

    // Validasi ukuran maksimal 25MB
    const MAX_SIZE = 25 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, message: 'Ukuran file terlalu besar. Maksimal ukuran file adalah 25MB.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Pastikan folder penyimpanan ada
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'soal');
    await mkdir(uploadDir, { recursive: true });

    // Sanitasi nama file unik
    const cleanOriginalName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueFileName = `soal_${Date.now()}_${cleanOriginalName}`;
    const filePath = path.join(uploadDir, uniqueFileName);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/soal/${uniqueFileName}`;

    // Format ukuran file
    const sizeInKb = (file.size / 1024).toFixed(1);
    const sizeFormatted = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` 
      : `${sizeInKb} KB`;

    // Parsing otomatis naskah PDF menjadi butir soal PG & Essay
    const parseResult = await extractExamFromPdfBuffer(buffer, filePath);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: file.name,
      fileSize: sizeFormatted,
      rawSize: file.size,
      soal_pg: parseResult.soal_pg || [],
      soal_essay: parseResult.soal_essay || [],
      total_pg: parseResult.total_pg || 0,
      total_essay: parseResult.total_essay || 0,
      parse_debug: {
        success: parseResult.success,
        message: parseResult.message,
        text_length: parseResult.raw_text_length || 0,
      },
      message: 'File PDF naskah soal berhasil diunggah dan diekstrak ke tampilan web.',
    });
  } catch (error) {
    console.error('[Upload PDF Error]:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Terjadi kesalahan saat mengunggah dan mengekstrak file.' },
      { status: 500 }
    );
  }
}
