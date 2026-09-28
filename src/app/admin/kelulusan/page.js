"use client";
import React, { useState } from 'react';
import useSWR from 'swr';
import { 
  Award, RefreshCw, Search, ExternalLink, 
  CheckCircle2, XCircle, FileSpreadsheet, Filter 
} from 'lucide-react';
import Topbar from '@/components/portal/Topbar';
import { getGraduationStats, DEFAULT_GOOGLE_SHEET_URL } from '@/backend/services/graduationService';

export default function AdminKelulusanPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');

  const { data, mutate, isValidating, error } = useSWR(
    'admin_full_graduation_sheet',
    () => getGraduationStats(DEFAULT_GOOGLE_SHEET_URL),
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

  return (
    <div className="space-y-8">
      <Topbar
        title="Manajemen Kelulusan (Google Sheets)"
        subtitle="Sumber Data Kelulusan Resmi SMP Negeri 18 Buton Tengah"
      />

      {/* Connection Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <FileSpreadsheet size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm text-slate-800">Koneksi Google Spreadsheet Aktif</h3>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Online
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 max-w-xl truncate">
              {DEFAULT_GOOGLE_SHEET_URL}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => mutate()}
            disabled={isValidating}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-2xl transition cursor-pointer"
          >
            <RefreshCw size={14} className={isValidating ? 'animate-spin text-blue-600' : ''} />
            {isValidating ? 'Menyinkronkan...' : 'Refresh Data'}
          </button>
          <a
            href={DEFAULT_GOOGLE_SHEET_URL.replace('/pub?output=csv', '/edit')}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xs transition"
          >
            <ExternalLink size={14} /> Buka Spreadsheet
          </a>
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
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tahun Ajaran</p>
          <p className="text-2xl font-black text-blue-600 mt-1">2025/2026</p>
          <span className="text-[10px] text-slate-400 font-medium">Periode Aktif</span>
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
                <th className="px-6 py-4">Tgl Lahir</th>
                <th className="px-6 py-4">Orang Tua (Ayah / Ibu)</th>
                <th className="px-6 py-4">Status Kelulusan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {filtered.length > 0 ? (
                filtered.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3.5 text-slate-400">{idx + 1}</td>
                    <td className="px-6 py-3.5 font-bold text-slate-900">{s.nama}</td>
                    <td className="px-6 py-3.5 font-mono">{s.nisn}</td>
                    <td className="px-6 py-3.5">{s.tanggal_lahir}</td>
                    <td className="px-6 py-3.5 text-slate-500">{s.nama_ayah} / {s.nama_ibu}</td>
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                    {isValidating ? 'Menyinkronkan dengan Google Sheets...' : 'Tidak ada data siswa ditemukan.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
