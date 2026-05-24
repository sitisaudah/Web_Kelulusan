"use client";
import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ImportData() {
  const [file, setFile] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <Link href="/admin" className="flex items-center text-blue-600 mb-6 hover:underline">
        <ArrowLeft size={20} className="mr-2" /> Kembali ke Dashboard
      </Link>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Import Data Siswa</h1>
        <p className="text-gray-500 mb-8">Unggah file Excel (.xlsx) atau CSV yang berisi data kelulusan siswa.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Upload Area */}
          <div className="md:col-span-2">
            <div className="border-2 border-dashed border-blue-200 bg-white rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:border-blue-400 transition-colors cursor-pointer">
              <div className="bg-blue-50 p-4 rounded-full mb-4">
                <Upload className="text-blue-600" size={40} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Klik atau seret file ke sini</h3>
              <p className="text-gray-400 text-sm mt-1">Format yang didukung: .xlsx, .csv (Maks. 5MB)</p>
              <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
              {file && (
                <div className="mt-4 p-2 bg-green-50 text-green-700 rounded text-sm flex items-center">
                  <FileText size={16} className="mr-2" /> {file.name}
                </div>
              )}
            </div>

            <button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition">
              Proses & Simpan Data
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center">
              <AlertCircle size={18} className="mr-2 text-yellow-500" /> Instruksi
            </h3>
            <ul className="text-sm text-gray-600 space-y-4">
              <li className="flex items-start">
                <CheckCircle2 size={16} className="mr-2 text-green-500 mt-0.5" />
                Gunakan format kolom: <b>No, NISN, Nama, Status, Keterangan</b>.
              </li>
              <li className="flex items-start">
                <CheckCircle2 size={16} className="mr-2 text-green-500 mt-0.5" />
                Pastikan NISN tidak ada yang duplikat.
              </li>
              <li className="flex items-start">
                <CheckCircle2 size={16} className="mr-2 text-green-500 mt-0.5" />
                Status hanya boleh diisi <b>Lulus</b> atau <b>Tidak Lulus</b>.
              </li>
            </ul>
            <div className="mt-8">
              <button className="text-blue-600 text-sm font-medium hover:underline flex items-center">
                <FileText size={16} className="mr-2" /> Download Template Excel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}