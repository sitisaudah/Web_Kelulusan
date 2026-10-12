"use client";
import React, { useState } from 'react';
import { Upload, FileSpreadsheet, FileText, CheckCircle2, AlertCircle, ArrowLeft, Loader2, Download } from 'lucide-react';
import Link from 'next/link';
import Topbar from '@/components/portal/Topbar';
import { importSiswaBatch } from '@/backend/actions/siswaActions';
import { parseExcelFile, downloadTemplateSiswaExcel } from '@/lib/excelHelper';

export default function ImportData() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [previewRows, setPreviewRows] = useState([]);
  const [fullNormalizedData, setFullNormalizedData] = useState([]);

  const handleFileChange = async (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setErrorMsg('');
    setSuccessMsg('');
    setPreviewRows([]);
    setFullNormalizedData([]);
    setLoading(true);

    try {
      const parsed = await parseExcelFile(selectedFile);
      if (parsed.normalizedData && parsed.normalizedData.length > 0) {
        setFullNormalizedData(parsed.normalizedData);
        setPreviewRows(parsed.normalizedData.slice(0, 5));
      } else {
        setErrorMsg('Format data siswa tidak valid atau kosong. Pastikan terdapat kolom NISN dan Nama.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal membaca berkas Excel.');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessImport = async () => {
    if (!file || fullNormalizedData.length === 0) {
      setErrorMsg('Pilih dan pastikan file Excel (.xlsx) siswa memiliki data valid terlebih dahulu.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await importSiswaBatch(fullNormalizedData);
      if (res.success) {
        setSuccessMsg(res.message);
        setFile(null);
        setPreviewRows([]);
        setFullNormalizedData([]);
      } else {
        setErrorMsg(res.message || 'Gagal memproses impor.');
      }
    } catch (err) {
      setErrorMsg('Terjadi kesalahan saat menyimpan data ke database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <Topbar
        title="Import Data Siswa"
        subtitle="Impor Data Induk Peserta Didik dari Format Standar Dapodik Kemdikbud"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Upload Area */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border-2 border-dashed border-blue-200 hover:border-blue-400 transition-colors flex flex-col items-center justify-center text-center cursor-pointer relative group">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={(e) => handleFileChange(e.target.files?.[0])}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="bg-blue-50 p-4 rounded-3xl text-blue-600 mb-3 group-hover:scale-105 transition-transform">
              <Upload size={36} />
            </div>
            <h3 className="text-base font-extrabold text-slate-800">
              Pilih atau Unggah Berkas Dapodik Siswa
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Format standar berkas Dapodik resmi (Ukuran berkas maks. 10MB)
            </p>

            {file && (
              <div className="mt-4 p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 border border-emerald-200">
                <FileSpreadsheet size={18} className="text-emerald-600" />
                <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
          </div>

          {successMsg && (
            <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl text-xs font-bold flex items-center gap-2 border border-emerald-200">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl text-xs font-bold flex items-center gap-2 border border-rose-200">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {previewRows.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Pratinjau Data ({fullNormalizedData.length} Siswa Terbaca)
                </h4>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Siap Diimpor
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-semibold text-slate-700">
                  <thead className="text-[10px] text-slate-400 font-bold uppercase border-b bg-slate-50">
                    <tr>
                      <th className="py-2.5 px-3">No</th>
                      <th className="py-2.5 px-3">NISN</th>
                      <th className="py-2.5 px-3">Nama</th>
                      <th className="py-2.5 px-3">Rombel</th>
                      <th className="py-2.5 px-3">JK</th>
                      <th className="py-2.5 px-3">Tgl Lahir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewRows.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-slate-400">{i + 1}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-900 font-bold">{r.nisn}</td>
                        <td className="py-2.5 px-3 text-slate-900 font-bold">{r.nama}</td>
                        <td className="py-2.5 px-3">
                          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-bold text-[10px]">
                            {r.kelas || 'IX'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">{r.jk === 'L' ? 'L' : 'P'}</td>
                        <td className="py-2.5 px-3 text-slate-500">{r.tanggal_lahir || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <button
            onClick={handleProcessImport}
            disabled={!file || loading || fullNormalizedData.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 text-xs active:scale-95 cursor-pointer"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {loading 
              ? 'Memproses dan Menyimpan Data Siswa...' 
              : fullNormalizedData.length > 0 
                ? `Mulai Import ${fullNormalizedData.length} Siswa ke Database` 
                : 'Mulai Import ke Database'}
          </button>
        </div>

        {/* Petunjuk & Template */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 h-fit">
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
            <AlertCircle size={18} className="text-amber-500" /> Format Kolom
          </h3>

          <ul className="space-y-3 text-xs text-slate-600 font-medium leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>Mendukung file ekspor resmi <b>Dapodik Kemdikbud</b> (.xlsx).</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>Otomatis memetakan <b>43 atribut lengkap</b>: Identitas, Alamat RT/RW, Kontak, KPS, serta Data Orang Tua/Wali.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>Format Tanggal Lahir otomatis disesuaikan (contoh: 2014-05-19).</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>Jika ada NISN yang sudah terdaftar, data siswa akan otomatis diperbarui (*upsert*).</span>
            </li>
          </ul>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={downloadTemplateSiswaExcel}
              className="w-full inline-flex items-center justify-center gap-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 py-3 rounded-xl text-xs font-bold transition cursor-pointer border border-emerald-200"
            >
              <Download size={16} /> Unduh Format Template Standar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}