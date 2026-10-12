"use client";
import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, UserPlus, Search, Filter, Edit2, Trash2, 
  Download, ArrowLeft, CheckCircle2, XCircle, Loader2, X,
  Upload, FileSpreadsheet, FileText, CheckCircle, AlertCircle, Eye,
  MapPin, Phone, Mail, Home, Car, Award, School, Key
} from 'lucide-react';
import Link from 'next/link';
import Topbar from '@/components/portal/Topbar';
import { getSiswaList, saveSiswa, deleteSiswa, importSiswaBatch } from '@/backend/actions/siswaActions';
import { parseExcelFile, downloadTemplateSiswaExcel, exportToExcel } from '@/lib/excelHelper';

export default function ManajemenDataSiswa() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKelas, setFilterKelas] = useState('Semua');

  // Modal Tambah / Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    nisn: '',
    nipd: '',
    nik: '',
    nama: '',
    kelas: 'IX-A',
    tempat_lahir: '',
    tanggal_lahir: '',
    jk: 'L',
    agama: 'Islam',
    nama_ayah: '',
    nama_ibu: '',
    alamat: '',
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // Modal Import Excel State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const fileInputRef = useRef(null);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await getSiswaList({ search: searchTerm, kelas: filterKelas });
      if (res.success) {
        setStudents(res.data);
      }
    } catch (err) {
      console.error('Gagal mengambil data siswa:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [searchTerm, filterKelas]);

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setFormData({
      nisn: '',
      nipd: '',
      nik: '',
      nama: '',
      kelas: 'IX-A',
      tempat_lahir: '',
      tanggal_lahir: '',
      jk: 'L',
      agama: 'Islam',
      nama_ayah: '',
      nama_ibu: '',
      alamat: '',
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (siswa) => {
    setEditingStudent(siswa);
    setFormData({
      id: siswa.id,
      nisn: siswa.nisn || '',
      nipd: siswa.nipd || '',
      nik: siswa.nik || '',
      nama: siswa.nama || '',
      kelas: siswa.kelas || 'IX-A',
      tempat_lahir: siswa.tempat_lahir || '',
      tanggal_lahir: siswa.tanggal_lahir || '',
      jk: siswa.jk || 'L',
      agama: siswa.agama || 'Islam',
      nama_ayah: siswa.nama_ayah || '',
      nama_ibu: siswa.nama_ibu || '',
      alamat: siswa.alamat || '',
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError('');

    try {
      const res = await saveSiswa(formData);
      if (res.success) {
        setIsModalOpen(false);
        loadStudents();
      } else {
        setModalError(res.message || 'Gagal menyimpan siswa.');
      }
    } catch (err) {
      setModalError('Terjadi kesalahan saat menyimpan.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id, nama) => {
    if (!confirm(`Yakin ingin menghapus data siswa: ${nama}?`)) return;

    try {
      const res = await deleteSiswa(id);
      if (res.success) {
        loadStudents();
      } else {
        alert(res.message || 'Gagal menghapus siswa.');
      }
    } catch (err) {
      alert('Terjadi kesalahan saat menghapus.');
    }
  };

  // Modal Detail Lengkap Dapodik
  const [selectedDetailStudent, setSelectedDetailStudent] = useState(null);

  // Export ke Excel (.xlsx) dengan 43 Kolom Standar Dapodik
  const handleExportExcel = () => {
    if (students.length === 0) return alert('Tidak ada data siswa untuk diexport.');
    
    const exportData = students.map((s, idx) => ({
      'No': idx + 1,
      'Nama': s.nama,
      'NIPD': s.nipd || '-',
      'JK': s.jk === 'L' ? 'L' : 'P',
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
      'Rombel Saat Ini': s.kelas,
    }));

    exportToExcel(exportData, `Daftar_Siswa_Dapodik_SMPN18_${Date.now()}.xlsx`, 'Daftar Siswa Dapodik');
  };

  // Buka Modal Import Excel
  const handleOpenImportModal = () => {
    setImportFile(null);
    setImportPreview([]);
    setImportError('');
    setImportSuccess('');
    setIsImportModalOpen(true);
  };

  // Pilih & Baca File Excel
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setImportLoading(true);
    setImportError('');
    setImportSuccess('');

    try {
      const parsed = await parseExcelFile(file);
      if (parsed.normalizedData.length === 0) {
        setImportError('File Excel tidak memiliki baris data siswa yang valid. Pastikan terdapat kolom NISN dan Nama.');
        setImportPreview([]);
      } else {
        setImportPreview(parsed.normalizedData);
      }
    } catch (err) {
      setImportError(err.message || 'Gagal membaca file Excel.');
      setImportPreview([]);
    } finally {
      setImportLoading(false);
    }
  };

  // Eksekusi Simpan Data Import ke Database
  const handleExecuteImport = async () => {
    if (importPreview.length === 0) return;

    setImportLoading(true);
    setImportError('');
    setImportSuccess('');

    try {
      const res = await importSiswaBatch(importPreview);
      if (res.success) {
        setImportSuccess(res.message);
        loadStudents();
        setTimeout(() => {
          setIsImportModalOpen(false);
          setImportSuccess('');
          setImportPreview([]);
          setImportFile(null);
        }, 1800);
      } else {
        setImportError(res.message || 'Gagal mengimpor data ke database.');
      }
    } catch (err) {
      setImportError('Terjadi kesalahan saat memproses impor data.');
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Topbar
        title="Manajemen Data Siswa"
        subtitle="Pangkalan Data Induk Peserta Didik SMP Negeri 18 Buton Tengah"
      />

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-800">
            Daftar Seluruh Siswa ({students.length})
          </h2>
          <p className="text-xs text-slate-500">
            Kelola identitas, rombel/kelas, dan informasi kependudukan peserta didik
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Tombol Import */}
          <button
            onClick={handleOpenImportModal}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Upload size={15} /> Import Data Dapodik
          </button>

          {/* Tombol Export */}
          <button
            onClick={handleExportExcel}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-2xl hover:bg-slate-50 transition shadow-xs cursor-pointer"
          >
            <FileSpreadsheet size={15} className="text-emerald-600" /> Unduh Rekap Data
          </button>

          {/* Tombol Tambah Siswa Manual */}
          <button
            onClick={handleOpenAddModal}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-2xl shadow-xs transition active:scale-95 cursor-pointer"
          >
            <UserPlus size={15} /> Tambah Siswa
          </button>
        </div>
      </div>

      {/* Information Banner tentang Password Masuk Siswa */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Key size={18} />
          </div>
          <div>
            <p className="font-extrabold text-blue-950">Informasi Kredensial Masuk Siswa ke Portal</p>
            <p className="text-blue-700 mt-0.5">
              Username: <strong className="font-mono text-blue-900">NISN</strong> &bull; Password: <strong className="font-mono text-blue-900">Tanggal Lahir (Format: YYYY-MM-DD, contoh: 2012-02-11)</strong> sesuai data resmi sekolah.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider bg-blue-200/70 text-blue-900 px-2.5 py-1 rounded-lg shrink-0">
          Akses Mandiri Siswa
        </span>
      </div>

      {/* Toolbar Search & Filter */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
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
        <div className="flex items-center gap-2">
          <div className="relative">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-600 outline-none text-xs font-bold text-slate-700 appearance-none"
            >
              <option value="Semua">Semua Rombel ({students.length})</option>
              {Array.from(new Set(['IX-A', 'IX-B', 'IX-C', 'VIII-A', 'VII-A', ...students.map((s) => s.kelas).filter(Boolean)])).map((k) => (
                <option key={k} value={k}>Kelas {k}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabel Data Siswa */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-black uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">No</th>
                <th className="px-6 py-4">NISN</th>
                <th className="px-6 py-4">Nama Lengkap</th>
                <th className="px-6 py-4">Kelas/Rombel</th>
                <th className="px-6 py-4">JK</th>
                <th className="px-6 py-4">Tempat, Tanggal Lahir</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                    <Loader2 className="animate-spin mx-auto text-blue-600 mb-2" size={24} />
                    Memuat data siswa dari Supabase...
                  </td>
                </tr>
              ) : students.length > 0 ? (
                students.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3.5 text-slate-400">{idx + 1}</td>
                    <td className="px-6 py-3.5 font-mono text-slate-800">{s.nisn}</td>
                    <td className="px-6 py-3.5 font-bold text-slate-900">{s.nama}</td>
                    <td className="px-6 py-3.5">
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-bold">
                        {s.kelas}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">{s.jk === 'L' ? 'Laki-Laki' : 'Perempuan'}</td>
                    <td className="px-6 py-3.5 text-slate-500">
                      {s.tempat_lahir ? `${s.tempat_lahir}, ${s.tanggal_lahir}` : s.tanggal_lahir}
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedDetailStudent(s)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                          title="Lihat Detail Lengkap Dapodik"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(s)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          title="Edit Siswa"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id, s.nama)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Hapus Siswa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                    Belum ada data siswa di database. Silakan klik "Tambah Siswa" atau lakukan "Import Data".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah / Edit Siswa */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-800">
                {editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSaveStudent} className="space-y-4 text-xs font-bold">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 mb-1">NISN *</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    placeholder="10 digit NISN"
                    value={formData.nisn}
                    onChange={(e) => setFormData({ ...formData, nisn: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Kelas *</label>
                  <select
                    value={formData.kelas}
                    onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                  >
                    <option value="IX-A">IX-A</option>
                    <option value="IX-B">IX-B</option>
                    <option value="IX-C">IX-C</option>
                    <option value="VIII-A">VIII-A</option>
                    <option value="VII-A">VII-A</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Nama Lengkap Siswa *</label>
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap sesuai Dapodik"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    placeholder="Contoh: Tanailandu"
                    value={formData.tempat_lahir}
                    onChange={(e) => setFormData({ ...formData, tempat_lahir: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Tanggal Lahir *</label>
                  <input
                    type="date"
                    required
                    value={formData.tanggal_lahir}
                    onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 mb-1">Jenis Kelamin</label>
                  <select
                    value={formData.jk}
                    onChange={(e) => setFormData({ ...formData, jk: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                  >
                    <option value="L">Laki-Laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Agama</label>
                  <input
                    type="text"
                    value={formData.agama}
                    onChange={(e) => setFormData({ ...formData, agama: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 mb-1">Nama Ayah</label>
                  <input
                    type="text"
                    value={formData.nama_ayah}
                    onChange={(e) => setFormData({ ...formData, nama_ayah: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Nama Ibu</label>
                  <input
                    type="text"
                    value={formData.nama_ibu}
                    onChange={(e) => setFormData({ ...formData, nama_ibu: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center gap-2"
                >
                  {modalLoading ? <Loader2 size={14} className="animate-spin" /> : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Import Excel */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <FileSpreadsheet size={22} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">
                    Import Data Peserta Didik Dapodik
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Mendukung format berkas resmi Dapodik Kemdikbud
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Banner Download Template */}
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <p className="text-xs font-bold text-emerald-900">
                  Format Standar 43 Kolom Dapodik
                </p>
                <p className="text-[11px] text-emerald-700">
                  Pastikan kolom NISN dan Nama terisi. Mendukung seluruh atribut Dapodik resmi.
                </p>
              </div>
              <button
                type="button"
                onClick={downloadTemplateSiswaExcel}
                className="inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shrink-0 cursor-pointer shadow-xs"
              >
                <Download size={14} /> Unduh Format Template
              </button>
            </div>

            {/* Error & Success Messages */}
            {importError && (
              <div className="p-3.5 bg-rose-50 text-rose-700 rounded-2xl text-xs font-bold border border-rose-100 flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            {importSuccess && (
              <div className="p-3.5 bg-emerald-50 text-emerald-700 rounded-2xl text-xs font-bold border border-emerald-100 flex items-center gap-2">
                <CheckCircle size={16} className="shrink-0" />
                <span>{importSuccess}</span>
              </div>
            )}

            {/* Upload Area */}
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
                {importLoading ? (
                  <Loader2 size={24} className="animate-spin text-emerald-600" />
                ) : (
                  <Upload size={24} />
                )}
              </div>
              {importFile ? (
                <div>
                  <p className="text-xs font-black text-slate-800">{importFile.name}</p>
                  <p className="text-[11px] text-emerald-600 font-bold mt-0.5">
                    {(importFile.size / 1024).toFixed(1)} KB — Klik untuk mengganti file
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-bold text-slate-700">
                    Klik atau Seret berkas Excel (.xlsx) ke sini
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Format resmi Dapodik .xlsx atau .xls (Maksimal 10 MB)
                  </p>
                </div>
              )}
            </div>

            {/* Preview Tabel Hasil Parse */}
            {importPreview.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-slate-700">
                    Pratinjau Data ({importPreview.length} Siswa Terbaca)
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
                        <th className="px-3 py-2">NISN</th>
                        <th className="px-3 py-2">Nama</th>
                        <th className="px-3 py-2">Kelas</th>
                        <th className="px-3 py-2">JK</th>
                        <th className="px-3 py-2">Tgl Lahir</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {importPreview.slice(0, 5).map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-3 py-2 text-slate-400">{i + 1}</td>
                          <td className="px-3 py-2 font-mono text-slate-800">{row.nisn}</td>
                          <td className="px-3 py-2 font-bold text-slate-900">{row.nama}</td>
                          <td className="px-3 py-2">{row.kelas || 'IX-A'}</td>
                          <td className="px-3 py-2">{row.jk}</td>
                          <td className="px-3 py-2">{row.tanggal_lahir}</td>
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
                onClick={() => setIsImportModalOpen(false)}
                className="flex-1 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-xs cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                disabled={importLoading || importPreview.length === 0}
                onClick={handleExecuteImport}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-xs"
              >
                {importLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Menyimpan ke Database...
                  </>
                ) : (
                  `Simpan ${importPreview.length} Data Siswa`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Lengkap Dapodik */}
      {selectedDetailStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <School size={26} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-800">
                      {selectedDetailStudent.nama}
                    </h3>
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Rombel {selectedDetailStudent.kelas}
                    </span>
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {selectedDetailStudent.jk === 'L' ? 'Laki-Laki' : 'Perempuan'}
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

            {/* Konten 4 Bagian Dapodik */}
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

              {/* Bagian 4: Data Orang Tua & Wali */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
                <h4 className="font-black text-slate-800 mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-purple-600">
                  <Users size={14} /> 4. Data Orang Tua & Wali
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
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}