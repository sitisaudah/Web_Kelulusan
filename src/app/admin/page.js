"use client";
import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { 
  Users, Award, BookOpen, MessageSquare, 
  Search, RefreshCw, ChevronRight, ExternalLink, 
  ShieldCheck, CheckCircle2, XCircle 
} from 'lucide-react';
import Link from 'next/link';
import Topbar from '@/components/portal/Topbar';
import { getGraduationStats, DEFAULT_GOOGLE_SHEET_URL } from '@/backend/services/graduationService';
import { getSiswaList } from '@/backend/actions/siswaActions';
import { getUlanganList } from '@/backend/actions/ulanganActions';
import { getPesanKontakList } from '@/backend/actions/kontakActions';

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dbSiswaCount, setDbSiswaCount] = useState(0);
  const [cbtCount, setCbtCount] = useState(0);
  const [pesanCount, setPesanCount] = useState(0);

  // Fetch data kelulusan dari Google Spreadsheet melalui SWR
  const { data: sheetData, mutate, isValidating, error } = useSWR(
    'graduation_stats_admin',
    () => getGraduationStats(DEFAULT_GOOGLE_SHEET_URL),
    { revalidateOnFocus: false }
  );

  // Fetch data metrik dari Supabase
  useEffect(() => {
    async function loadSupabaseCounts() {
      try {
        const [resSiswa, resCbt, resPesan] = await Promise.all([
          getSiswaList(),
          getUlanganList(),
          getPesanKontakList(),
        ]);

        if (resSiswa.success) setDbSiswaCount(resSiswa.data.length);
        if (resCbt.success) setCbtCount(resCbt.data.length);
        if (resPesan.success) setPesanCount(resPesan.data.filter((p) => !p.is_read).length);
      } catch (err) {
        console.error('Gagal memuat statistik Supabase:', err);
      }
    }

    loadSupabaseCounts();
  }, []);

  const totalSiswaSheets = sheetData?.total || 0;
  const totalLulusSheets = sheetData?.lulus || 0;
  const totalTidakLulusSheets = sheetData?.tidakLulus || 0;

  const filteredStudents = (sheetData?.students || []).filter(
    (s) =>
      s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nisn.includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      <Topbar
        title="Dashboard Administrator"
        subtitle="Pusat Kendali Website SMP Negeri 18 Buton Tengah"
      />

      {/* Grid Statistik Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Siswa Supabase */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Siswa di Database</p>
            <p className="text-3xl font-black text-slate-800 mt-1">{dbSiswaCount}</p>
            <span className="text-[10px] text-blue-600 font-bold mt-1 inline-block">Database Supabase</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users size={24} />
          </div>
        </div>

        {/* Peserta Kelulusan Google Sheets */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Peserta Kelulusan</p>
            <p className="text-3xl font-black text-slate-800 mt-1">{totalSiswaSheets}</p>
            <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-block">
              {totalLulusSheets} Lulus / {totalTidakLulusSheets} Belum
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Award size={24} />
          </div>
        </div>

        {/* Ulangan CBT Aktif */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ulangan CBT</p>
            <p className="text-3xl font-black text-slate-800 mt-1">{cbtCount}</p>
            <span className="text-[10px] text-purple-600 font-bold mt-1 inline-block">Ujian Online</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <BookOpen size={24} />
          </div>
        </div>

        {/* Pesan Kontak Masuk */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pesan Masuk</p>
            <p className="text-3xl font-black text-slate-800 mt-1">{pesanCount}</p>
            <span className="text-[10px] text-amber-600 font-bold mt-1 inline-block">Belum Dibaca</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <MessageSquare size={24} />
          </div>
        </div>
      </div>

      {/* Tabel Preview Kelulusan Google Spreadsheet */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm uppercase tracking-wider text-slate-800">
                Data Kelulusan Google Spreadsheet
              </h3>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                Live Google Sheets
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Data kelulusan resmi ditarik secara otomatis dari spreadsheet sekolah
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Cari Nama atau NISN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 outline-none text-xs font-semibold text-slate-800"
              />
            </div>
            <button
              onClick={() => mutate()}
              disabled={isValidating}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition disabled:opacity-50 shrink-0 cursor-pointer"
              title="Refresh Data Spreadsheet"
            >
              <RefreshCw size={16} className={isValidating ? 'animate-spin text-blue-600' : ''} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-black uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">No</th>
                <th className="px-6 py-4">Nama Lengkap</th>
                <th className="px-6 py-4">NISN</th>
                <th className="px-6 py-4">Tanggal Lahir</th>
                <th className="px-6 py-4">Jenis Kelamin</th>
                <th className="px-6 py-4">Status Kelulusan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {filteredStudents.length > 0 ? (
                filteredStudents.slice(0, 8).map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5 text-slate-400">{i + 1}</td>
                    <td className="px-6 py-3.5 font-bold text-slate-900">{row.nama}</td>
                    <td className="px-6 py-3.5 font-mono">{row.nisn}</td>
                    <td className="px-6 py-3.5">{row.tanggal_lahir}</td>
                    <td className="px-6 py-3.5">{row.jk === 'L' ? 'L' : 'P'}</td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                          row.status === 'LULUS'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {row.status === 'LULUS' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    {isValidating ? 'Mengambil data dari Google Spreadsheet...' : 'Tidak ada data siswa ditemukan.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-2">
          <span>Menampilkan data kelulusan kelas IX SMPN 18 Buton Tengah</span>
          <Link
            href="/admin/kelulusan"
            className="text-blue-600 hover:underline font-bold inline-flex items-center gap-1"
          >
            Buka Panel Kelulusan Lengkap &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}