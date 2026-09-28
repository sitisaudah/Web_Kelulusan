"use client";
import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Papa from 'papaparse';
import Topbar from '@/components/portal/Topbar';
import { importSiswaBatch } from '@/backend/actions/siswaActions';

export default function ImportData() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [previewRows, setPreviewRows] = useState([]);

  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setErrorMsg('');
    setSuccessMsg('');

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          setPreviewRows(results.data.slice(0, 5));
        } else {
          setErrorMsg('File kosong atau format tidak sesuai.');
        }
      },
      error: (err) => {
        setErrorMsg(`Gagal membaca file: ${err.message}`);
      },
    });
  };

  const handleProcessImport = () => {
    if (!file) {
      setErrorMsg('Pilih file CSV terlebih dahulu.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rawData = results.data;
          // Normalisasi key kolom yang mungkin bervariasi (case insensitive)
          const normalized = rawData.map((row) => {
            const getVal = (keyPart) => {
              const matchedKey = Object.keys(row).find((k) =>
                k.toLowerCase().trim().includes(keyPart.toLowerCase())
              );
              return matchedKey ? row[matchedKey] : undefined;
            };

            return {
              nisn: getVal('nisn'),
              nama: getVal('nama'),
              nipd: getVal('nipd'),
              nik: getVal('nik'),
              kelas: getVal('kelas') || 'IX-A',
              tempat_lahir: getVal('tempat'),
              tanggal_lahir: getVal('tanggal') || getVal('tgl') || '2010-01-01',
              jk: getVal('jk'),
              agama: getVal('agama') || 'Islam',
              nama_ayah: getVal('ayah'),
              nama_ibu: getVal('ibu'),
            };
          });

          const res = await importSiswaBatch(normalized);
          if (res.success) {
            setSuccessMsg(res.message);
            setFile(null);
            setPreviewRows([]);
          } else {
            setErrorMsg(res.message || 'Gagal memproses impor.');
          }
        } catch (err) {
          setErrorMsg('Terjadi kesalahan saat memproses data ke database.');
        } finally {
          setLoading(false);
        }
      },
      error: () => {
        setLoading(false);
        setErrorMsg('Gagal memparsing file CSV.');
      },
    });
  };

  const downloadTemplate = () => {
    const csvContent = 'data:text/csv;charset=utf-8,NISN,Nama,Kelas,Tempat_Lahir,Tanggal_Lahir,JK,Agama,Nama_Ayah,Nama_Ibu\n0104433545,Adelia Fadila,IX-A,Tanailandu,2010-12-05,P,Islam,Ruslan,Sumarni\n0115925129,Almira Rahmawati,IX-B,Tarakan,2011-01-15,P,Islam,Zamiluddin,Hesti';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'template_import_siswa.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <Topbar
        title="Import Data Siswa"
        subtitle="Impor Massal Siswa Baru ke Database Supabase dari File CSV / Excel"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Upload Area */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border-2 border-dashed border-blue-200 hover:border-blue-400 transition-colors flex flex-col items-center justify-center text-center cursor-pointer relative">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => handleFileChange(e.target.files[0])}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="bg-blue-50 p-4 rounded-3xl text-blue-600 mb-3">
              <Upload size={36} />
            </div>
            <h3 className="text-base font-extrabold text-slate-800">
              Pilih atau Tarik File CSV Siswa ke Sini
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Mendukung file format <b>.csv</b> (Ukuran maksimal 5MB)
            </p>

            {file && (
              <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold flex items-center gap-2 border border-blue-100">
                <FileText size={16} /> {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>

          {successMsg && (
            <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl text-xs font-bold flex items-center gap-2 border border-emerald-200">
              <CheckCircle2 size={16} /> {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl text-xs font-bold flex items-center gap-2 border border-rose-200">
              <AlertCircle size={16} /> {errorMsg}
            </div>
          )}

          {previewRows.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">
                Pratinjau 5 Baris Pertama
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-semibold text-slate-700">
                  <thead className="text-[10px] text-slate-400 font-bold uppercase border-b">
                    <tr>
                      <th className="py-2">NISN</th>
                      <th className="py-2">Nama</th>
                      <th className="py-2">Kelas</th>
                      <th className="py-2">Tgl Lahir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewRows.map((r, i) => (
                      <tr key={i}>
                        <td className="py-2 font-mono">{r.NISN || r.nisn}</td>
                        <td className="py-2">{r.Nama || r.nama}</td>
                        <td className="py-2">{r.Kelas || r.kelas || 'IX'}</td>
                        <td className="py-2">{r.Tanggal_Lahir || r.tanggal_lahir || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <button
            onClick={handleProcessImport}
            disabled={!file || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 text-xs active:scale-95 cursor-pointer"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {loading ? 'Memproses dan Menyimpan ke Supabase...' : 'Mulai Import ke Database'}
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
              <span>Kolom wajib: <b>NISN</b> dan <b>Nama</b>.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>Format Tanggal Lahir yang disarankan: <b>YYYY-MM-DD</b> (Contoh: 2010-12-05).</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>Jika ada NISN yang sudah terdaftar, data akan otomatis diperbarui (*upsert*).</span>
            </li>
          </ul>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={downloadTemplate}
              className="w-full inline-flex items-center justify-center gap-2 text-blue-600 hover:bg-blue-50 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer border border-blue-200"
            >
              <FileText size={16} /> Unduh Contoh Template CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}