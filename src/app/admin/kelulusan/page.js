"use client";
import React, { useState, useRef } from 'react';
import useSWR from 'swr';
import { 
  Award, RefreshCw, Search, ExternalLink, 
  CheckCircle2, XCircle, FileSpreadsheet, Filter, 
  Upload, Download, AlertCircle, Loader2, X, RotateCcw,
  Eye, School, UserPlus, MapPin, Phone, Users
} from 'lucide-react';
import Topbar from '@/components/portal/Topbar';
import { 
  getGraduationDataAction, 
  uploadGraduationExcelAction 
} from '@/backend/actions/kelulusanActions';
import { 
  parseExcelFile, 
  downloadTemplateKelulusanExcel, 
  exportToExcel 
} from '@/lib/excelHelper';

export default function AdminKelulusanPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');

  // Modal Detail Siswa Dapodik
  const [selectedDetailStudent, setSelectedDetailStudent] = useState(null);

  // Modal Upload Excel Kelulusan
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const fileInputRef = useRef(null);

  const { data, mutate, isValidating, error } = useSWR(
    'admin_graduation_data_hub',
    () => getGraduationDataAction(),
    { revalidateOnFocus: false }
  );

  const students = data?.students || [];
  const total = data?.total || 0;
  const lulus = data?.lulus || 0;
  const tidakLulus = data?.tidakLulus || 0;
  const persentase = total > 0 ? ((lulus / total) * 100).toFixed(1) : 0;

  const filtered = students.filter((s) => {
    const matchSearch =
      s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nisn.includes(searchTerm);
    const matchStatus =
      filterStatus === 'Semua' ||
      (filterStatus === 'LULUS' && s.status === 'LULUS') ||
      (filterStatus === 'TIDAK LULUS' && s.status !== 'LULUS');
    return matchSearch && matchStatus;
  });

  // Handle pilih berkas Excel
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFile(file);
    setUploadLoading(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      const parsed = await parseExcelFile(file);
      if (parsed.normalizedData.length === 0) {
        setUploadError('Tidak ditemukan baris data siswa yang valid. Pastikan kolom NISN dan Nama terisi.');
        setUploadPreview([]);
      } else {
        setUploadPreview(parsed.normalizedData);
      }
    } catch (err) {
      setUploadError(err.message || 'Gagal membaca file Excel.');
      setUploadPreview([]);
    } finally {
      setUploadLoading(false);
    }
  };

  // Simpan data Excel kelulusan
  const handleExecuteUpload = async () => {
    if (uploadPreview.length === 0) return;

    setUploadLoading(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      const res = await uploadGraduationExcelAction(uploadPreview, uploadFile?.name || 'kelulusan.xlsx');
      if (res.success) {
        setUploadSuccess(res.message);
        mutate();
        setTimeout(() => {
          setIsModalOpen(false);
          setUploadSuccess('');
          setUploadPreview([]);
          setUploadFile(null);
        }, 1500);
      } else {
        setUploadError(res.message || 'Gagal menyimpan data.');
      }
    } catch (err) {
      setUploadError('Terjadi kesalahan saat mengunggah.');
    } finally {
      setUploadLoading(false);
    }
  };

  // Export seluruh data siswa & kelulusan ke file Excel dengan 43 kolom standar Dapodik
  const handleExportCurrentData = () => {
    if (students.length === 0) return alert('Tidak ada data untuk diexport.');
    const exportRows = students.map((s, idx) => ({
      'No': idx + 1,
      'Nama Siswa': s.nama,
      'NIPD': s.nipd || '-',
      'Jenis Kelamin': s.jk === 'L' ? 'L' : 'P',
      'NISN': s.nisn,
      'Tempat Lahir': s.tempat_lahir || '-',
      'Tanggal Lahir': s.tanggal_lahir,
      'NIK': s.nik || '-',
      'Agama': s.agama || 'Islam',
      'Alamat': s.alamat || '-',
      'RT': s.rt || '-',
      'RW': s.rw || '-',
      'Dusun': s.dusun || '-',
      'Kelurahan/Desa': s.kelurahan || '-',
      'Kecamatan': s.kecamatan || '-',
      'Kode Pos': s.kode_pos || '-',
      'Jenis Tinggal': s.jenis_tinggal || 'Bersama Orang Tua',
      'Alat Transportasi': s.alat_transportasi || '-',
      'Telepon': s.telepon || '-',
      'HP': s.no_hp || '-',
      'E-mail': s.email || '-',
      'SKHUN': s.skhun || '-',
      'Penerima KPS': s.penerima_kps || 'Tidak',
      'No. KPS': s.no_kps || '-',
      'Nama Ayah': s.nama_ayah || '-',
      'Tahun Lahir Ayah': s.tahun_lahir_ayah || '-',
      'Jenjang Pendidikan Ayah': s.pendidikan_ayah || '-',
      'Pekerjaan Ayah': s.pekerjaan_ayah || '-',
      'Penghasilan Ayah': s.penghasilan_ayah || '-',
      'NIK Ayah': s.nik_ayah || '-',
      'Nama Ibu': s.nama_ibu || '-',
      'Tahun Lahir Ibu': s.tahun_lahir_ibu || '-',
      'Jenjang Pendidikan Ibu': s.pendidikan_ibu || '-',
      'Pekerjaan Ibu': s.pekerjaan_ibu || '-',
      'Penghasilan Ibu': s.penghasilan_ibu || '-',
      'NIK Ibu': s.nik_ibu || '-',
      'Nama Wali': s.nama_wali || '-',
      'Tahun Lahir Wali': s.tahun_lahir_wali || '-',
      'Jenjang Pendidikan Wali': s.pendidikan_wali || '-',
      'Pekerjaan Wali': s.pekerjaan_wali || '-',
      'Penghasilan Wali': s.penghasilan_wali || '-',
      'NIK Wali': s.nik_wali || '-',
      'Rombel Saat Ini': s.kelas || '-',
      'Status Kelulusan': s.status,
    }));

    exportToExcel(exportRows, `Data_Kelulusan_Lengkap_SMPN18_${Date.now()}.xlsx`, 'Kelulusan Siswa');
  };

  return (
    <div className="space-y-8">
      <Topbar
        title="Manajemen Kelulusan Siswa"
        subtitle="Pangkalan Data & Penetapan Kelulusan Resmi Peserta Didik"
      />

      {/* Connection Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-600">
            <FileSpreadsheet size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm text-slate-800">
                Pangkalan Data Kelulusan Peserta Didik
              </h3>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Data Terverifikasi
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 max-w-xl truncate">
              {data?.lastUpdated 
                ? `Terakhir diperbarui: ${new Date(data.lastUpdated).toLocaleString('id-ID')}` 
                : 'Disinkronkan dengan data resmi sekolah'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Tombol Upload */}
          <button
            onClick={() => {
              setUploadFile(null);
              setUploadPreview([]);
              setUploadError('');
              setUploadSuccess('');
              setIsModalOpen(true);
            }}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xs transition cursor-pointer"
          >
            <Upload size={14} /> Unggah Berkas Kelulusan
          </button>

          {/* Refresh Data */}
          <button
            onClick={() => mutate()}
            disabled={isValidating}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-2xl transition cursor-pointer"
          >
            <RefreshCw size={14} className={isValidating ? 'animate-spin text-blue-600' : ''} />
            Refresh
          </button>

          {/* Export Excel */}
          <button
            onClick={handleExportCurrentData}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-2xl hover:bg-slate-50 transition shadow-xs cursor-pointer"
          >
            <Download size={14} /> Export Excel
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Peserta</p>
          <p className="text-3xl font-black text-slate-800 mt-1">{total}</p>
          <span className="text-[10px] text-slate-400 font-medium">Siswa Terdata</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dinyatakan Lulus</p>
          <p className="text-3xl font-black text-emerald-600 mt-1">{lulus}</p>
          <span className="text-[10px] text-emerald-600 font-bold">Tingkat Kelulusan {persentase}%</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Belum / Tidak Lulus</p>
          <p className="text-3xl font-black text-rose-600 mt-1">{tidakLulus}</p>
          <span className="text-[10px] text-rose-500 font-medium">Perlu Pembinaan</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status Pangkalan Data</p>
          <p className="text-xl font-black text-emerald-600 mt-1">
            Terverifikasi Sah
          </p>
          <span className="text-[10px] text-slate-400 font-medium">Periode 2026/2027</span>
        </div>
      </div>

      {/* Search & Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Cari berdasarkan Nama atau NISN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-600 outline-none text-xs font-semibold text-slate-800"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-600 outline-none text-xs font-bold text-slate-700 appearance-none"
            >
              <option value="Semua">Semua Status ({total})</option>
              <option value="LULUS">Hanya Lulus ({lulus})</option>
              <option value="TIDAK LULUS">Tidak Lulus ({tidakLulus})</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-black uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">No</th>
                <th className="px-6 py-4">Nama Siswa</th>
                <th className="px-6 py-4">NISN</th>
                <th className="px-6 py-4">Rombel</th>
                <th className="px-6 py-4">Tgl Lahir</th>
                <th className="px-6 py-4">Orang Tua (Ayah / Ibu)</th>
                <th className="px-6 py-4">Status Kelulusan</th>
                <th className="px-6 py-4 text-center">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {filtered.length > 0 ? (
                filtered.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3.5 text-slate-400">{idx + 1}</td>
                    <td className="px-6 py-3.5 font-bold text-slate-900">{s.nama}</td>
                    <td className="px-6 py-3.5 font-mono">{s.nisn}</td>
                    <td className="px-6 py-3.5">
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-bold text-[10px]">
                        {s.kelas || 'IX'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">{s.tanggal_lahir}</td>
                    <td className="px-6 py-3.5 text-slate-500">{s.nama_ayah || '-'} / {s.nama_ibu || '-'}</td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                          s.status === 'LULUS'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {s.status === 'LULUS' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <button
                        onClick={() => setSelectedDetailStudent(s)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-emerald-700 hover:bg-emerald-50 rounded-lg text-xs font-bold transition cursor-pointer border border-emerald-200"
                        title="Lihat Detail Lengkap Siswa, Orang Tua & Wali"
                      >
                        <Eye size={14} /> Detail
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-slate-400">
                    {isValidating ? 'Menyinkronkan data kelulusan...' : 'Tidak ada data siswa ditemukan.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Upload Excel Kelulusan */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <FileSpreadsheet size={22} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">
                    Upload File Excel Kelulusan Siswa
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Mendukung berkas Excel (.xlsx, .xls) dan CSV
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Template Banner */}
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <p className="text-xs font-bold text-emerald-900">
                  Format Berkas Kelulusan Resmi
                </p>
                <p className="text-[11px] text-emerald-700">
                  Wajib ada kolom NISN, Nama Siswa, Tanggal Lahir, dan Status/Keterangan.
                </p>
              </div>
              <button
                type="button"
                onClick={downloadTemplateKelulusanExcel}
                className="inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shrink-0 cursor-pointer shadow-xs"
              >
                <Download size={14} /> Download Template Excel
              </button>
            </div>

            {/* Error / Success message */}
            {uploadError && (
              <div className="p-3.5 bg-rose-50 text-rose-700 rounded-2xl text-xs font-bold border border-rose-100 flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {uploadSuccess && (
              <div className="p-3.5 bg-emerald-50 text-emerald-700 rounded-2xl text-xs font-bold border border-emerald-100 flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            {/* Upload Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/30 rounded-2xl p-6 text-center cursor-pointer transition group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 bg-white rounded-2xl shadow-xs border border-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400 group-hover:text-emerald-600 transition">
                {uploadLoading ? (
                  <Loader2 size={24} className="animate-spin text-emerald-600" />
                ) : (
                  <Upload size={24} />
                )}
              </div>
              {uploadFile ? (
                <div>
                  <p className="text-xs font-black text-slate-800">{uploadFile.name}</p>
                  <p className="text-[11px] text-emerald-600 font-bold mt-0.5">
                    {(uploadFile.size / 1024).toFixed(1)} KB — Klik untuk mengganti file
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-bold text-slate-700">
                    Pilih Berkas Penetapan Kelulusan
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Format resmi Dapodik (.xlsx / .xls) berisi identitas dan status kelulusan
                  </p>
                </div>
              )}
            </div>

            {/* Preview Tabel */}
            {uploadPreview.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-slate-700">
                    Pratinjau Kelulusan ({uploadPreview.length} Siswa Terbaca)
                  </span>
                  <span className="text-[11px] text-slate-400 font-semibold">
                    Menampilkan 5 data pertama
                  </span>
                </div>
                <div className="border border-slate-200 rounded-2xl overflow-hidden overflow-x-auto max-h-48">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-400 font-black uppercase text-[10px] border-b border-slate-100">
                      <tr>
                        <th className="px-3 py-2">No</th>
                        <th className="px-3 py-2">Nama</th>
                        <th className="px-3 py-2">NISN</th>
                        <th className="px-3 py-2">Tgl Lahir</th>
                        <th className="px-3 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {uploadPreview.slice(0, 5).map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-3 py-2 text-slate-400">{i + 1}</td>
                          <td className="px-3 py-2 font-bold text-slate-900">{row.nama}</td>
                          <td className="px-3 py-2 font-mono text-slate-800">{row.nisn}</td>
                          <td className="px-3 py-2">{row.tanggal_lahir}</td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              (row.status || '').toUpperCase().includes('LULUS') && !(row.status || '').toUpperCase().includes('TIDAK')
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}>
                              {row.status || 'LULUS'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={uploadLoading || uploadPreview.length === 0}
                onClick={handleExecuteUpload}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-xs"
              >
                {uploadLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Menyimpan Data Kelulusan...
                  </>
                ) : (
                  `Terapkan ${uploadPreview.length} Data Kelulusan`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Lengkap Dapodik Kelulusan */}
      {selectedDetailStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <School size={26} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-800">
                      {selectedDetailStudent.nama}
                    </h3>
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Rombel {selectedDetailStudent.kelas || 'IX'}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      selectedDetailStudent.status === 'LULUS' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {selectedDetailStudent.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    NISN: {selectedDetailStudent.nisn} | NIPD: {selectedDetailStudent.nipd || '-'} | NIK: {selectedDetailStudent.nik || '-'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDetailStudent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Konten 4 Bagian Dapodik Lengkap */}
            <div className="space-y-5 text-xs">
              {/* Bagian 1: Identitas Siswa */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
                <h4 className="font-black text-slate-800 mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-blue-600">
                  <UserPlus size={14} /> 1. Identitas Peserta Didik
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-700 font-semibold">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-black block">Nama Lengkap</span>
                    {selectedDetailStudent.nama}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-black block">Jenis Kelamin</span>
                    {selectedDetailStudent.jk === 'L' ? 'Laki-Laki (L)' : 'Perempuan (P)'}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-black block">Tempat Lahir</span>
                    {selectedDetailStudent.tempat_lahir || '-'}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-black block">Tanggal Lahir</span>
                    {selectedDetailStudent.tanggal_lahir || '-'}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-black block">Agama</span>
                    {selectedDetailStudent.agama || 'Islam'}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-black block">Rombel Saat Ini</span>
                    {selectedDetailStudent.kelas || '-'}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-black block">NIK Siswa</span>
                    {selectedDetailStudent.nik || '-'}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-black block">NIPD</span>
                    {selectedDetailStudent.nipd || '-'}
                  </div>
                </div>
              </div>

              {/* Bagian 2: Alamat & Tempat Tinggal */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
                <h4 className="font-black text-slate-800 mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-emerald-600">
                  <MapPin size={14} /> 2. Data Alamat & Tempat Tinggal
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-700 font-semibold">
                  <div className="col-span-2 sm:col-span-4">
                    <span className="text-[10px] text-slate-400 uppercase font-black block">Alamat Lengkap</span>
                    {selectedDetailStudent.alamat_lengkap || selectedDetailStudent.alamat || '-'}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-black block">RT / RW</span>
                    {selectedDetailStudent.rt || '-'} / {selectedDetailStudent.rw || '-'}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-black block">Dusun</span>
                    {selectedDetailStudent.dusun || '-'}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-black block">Kelurahan / Desa</span>
                    {selectedDetailStudent.kelurahan || '-'}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-black block">Kecamatan</span>
                    {selectedDetailStudent.kecamatan || '-'}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-black block">Kode Pos</span>
                    {selectedDetailStudent.kode_pos || '-'}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-black block">Jenis Tinggal</span>
                    {selectedDetailStudent.jenis_tinggal || 'Bersama Orang Tua'}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-black block">Alat Transportasi</span>
                    {selectedDetailStudent.alat_transportasi || '-'}
                  </div>
                </div>
              </div>

              {/* Bagian 3: Kontak & Kesejahteraan KPS */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
                <h4 className="font-black text-slate-800 mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-amber-600">
                  <Phone size={14} /> 3. Kontak, SKHUN & KPS
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-700 font-semibold">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-black block">Nomor HP / WhatsApp</span>
                    {selectedDetailStudent.no_hp || '-'}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-black block">Telepon Rumah</span>
                    {selectedDetailStudent.telepon || '-'}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-black block">Email Siswa</span>
                    {selectedDetailStudent.email || '-'}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-black block">SKHUN</span>
                    {selectedDetailStudent.skhun || '-'}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-black block">Penerima KPS</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      selectedDetailStudent.penerima_kps === 'Ya' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {selectedDetailStudent.penerima_kps || 'Tidak'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-slate-400 uppercase font-black block">Nomor KPS</span>
                    {selectedDetailStudent.no_kps || '-'}
                  </div>
                </div>
              </div>

              {/* Bagian 4: Data Orang Tua & Wali Lengkap */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
                <h4 className="font-black text-slate-800 mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-purple-600">
                  <Users size={14} /> 4. Data Orang Tua & Wali (Lengkap)
                </h4>
                <div className="space-y-3">
                  {/* Ayah */}
                  <div className="p-3 bg-white rounded-xl border border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-black block">Nama Ayah</span>
                      <p className="font-bold text-slate-800">{selectedDetailStudent.nama_ayah || '-'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-black block">Tahun Lahir & NIK</span>
                      {selectedDetailStudent.tahun_lahir_ayah || '-'} ({selectedDetailStudent.nik_ayah || '-'})
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-black block">Pendidikan & Pekerjaan</span>
                      {selectedDetailStudent.pendidikan_ayah || '-'} / {selectedDetailStudent.pekerjaan_ayah || '-'}
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-black block">Penghasilan Ayah</span>
                      <span className="font-bold text-emerald-700">{selectedDetailStudent.penghasilan_ayah || '-'}</span>
                    </div>
                  </div>

                  {/* Ibu */}
                  <div className="p-3 bg-white rounded-xl border border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-black block">Nama Ibu</span>
                      <p className="font-bold text-slate-800">{selectedDetailStudent.nama_ibu || '-'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-black block">Tahun Lahir & NIK</span>
                      {selectedDetailStudent.tahun_lahir_ibu || '-'} ({selectedDetailStudent.nik_ibu || '-'})
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-black block">Pendidikan & Pekerjaan</span>
                      {selectedDetailStudent.pendidikan_ibu || '-'} / {selectedDetailStudent.pekerjaan_ibu || '-'}
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-black block">Penghasilan Ibu</span>
                      <span className="font-bold text-emerald-700">{selectedDetailStudent.penghasilan_ibu || '-'}</span>
                    </div>
                  </div>

                  {/* Wali */}
                  <div className="p-3 bg-white rounded-xl border border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-black block">Nama Wali</span>
                      <p className="font-bold text-slate-800">{selectedDetailStudent.nama_wali || '-'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-black block">Tahun Lahir & NIK</span>
                      {selectedDetailStudent.tahun_lahir_wali || '-'} ({selectedDetailStudent.nik_wali || '-'})
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-black block">Pendidikan & Pekerjaan</span>
                      {selectedDetailStudent.pendidikan_wali || '-'} / {selectedDetailStudent.pekerjaan_wali || '-'}
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-black block">Penghasilan Wali</span>
                      <span className="font-bold text-emerald-700">{selectedDetailStudent.penghasilan_wali || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedDetailStudent(null)}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer transition"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
