"use client";
import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Search, Filter, Edit2, Trash2, 
  Download, ArrowLeft, CheckCircle2, XCircle, Loader2, X 
} from 'lucide-react';
import Link from 'next/link';
import Topbar from '@/components/portal/Topbar';
import { getSiswaList, saveSiswa, deleteSiswa } from '@/backend/actions/siswaActions';

export default function ManajemenDataSiswa() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKelas, setFilterKelas] = useState('Semua');

  // Modal State
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

  const handleExportCSV = () => {
    if (students.length === 0) return alert('Tidak ada data siswa untuk diexport.');
    
    const headers = ['NISN', 'Nama', 'Kelas', 'JK', 'Tempat Lahir', 'Tanggal Lahir', 'Agama'];
    const rows = students.map((s) => [
      `"${s.nisn}"`,
      `"${s.nama}"`,
      `"${s.kelas}"`,
      `"${s.jk}"`,
      `"${s.tempat_lahir || ''}"`,
      `"${s.tanggal_lahir || ''}"`,
      `"${s.agama || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `data_siswa_smpn18_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <Topbar
        title="Manajemen Data Siswa"
        subtitle="Data Induk Peserta Didik Tersimpan di Database Supabase"
      />

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-800">
            Daftar Seluruh Siswa ({students.length})
          </h2>
          <p className="text-xs text-slate-500">
            Kelola identitas, kelas, dan akun portal peserta didik
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-2xl hover:bg-slate-50 transition shadow-xs cursor-pointer"
          >
            <Download size={16} /> Export CSV
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-2xl shadow-xs transition active:scale-95 cursor-pointer"
          >
            <UserPlus size={16} /> Tambah Siswa
          </button>
        </div>
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
              <option value="Semua">Semua Kelas</option>
              <option value="IX-A">Kelas IX-A</option>
              <option value="IX-B">Kelas IX-B</option>
              <option value="IX-C">Kelas IX-C</option>
              <option value="VIII-A">Kelas VIII-A</option>
              <option value="VII-A">Kelas VII-A</option>
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
                <th className="px-6 py-4">Kelas</th>
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
                      <div className="flex items-center justify-center gap-2">
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
    </div>
  );
}