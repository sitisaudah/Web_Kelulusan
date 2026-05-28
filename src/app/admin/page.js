"use client";
import React, { useState } from 'react';
import useSWR from 'swr';
import Papa from 'papaparse';
import { motion } from 'framer-motion';
import { 
  Users, UserCheck, UserX, LogOut, Search, RefreshCw, GraduationCap, List 
} from 'lucide-react';
import { deleteCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';

const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTUVq4l9uDPXQLj8S3BBa0lrRWvNWATwEzjtdhzfJvDMMVfGR5PIODosccCS9KOgYPT9OIm5jPoLSMD/pub?output=csv";

// Fetcher Function
const fetcher = (url) => new Promise((resolve, reject) => {
  Papa.parse(url, {
    download: true,
    header: false,
    skipEmptyLines: true,
    complete: (results) => resolve(results.data.slice(1)),
    error: (err) => reject(err)
  });
});

export default function AdminDashboard() {
  const { data: students, mutate, isValidating } = useSWR(GOOGLE_SHEET_URL, fetcher);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const handleLogout = () => {
    deleteCookie('admin_session');
    router.push('/admin/login');
  };

  // Statistik (Berdasarkan Kolom L / Index 11)
  const totalSiswa = students?.length || 0;
  const totalLulus = students?.filter(row => row[11]?.toString().toUpperCase().trim() === "LULUS").length || 0;
  const totalTidakLulus = totalSiswa - totalLulus;

  // Filter Pencarian
  const filteredData = students?.filter(row => 
    row[1]?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    row[4]?.toString().includes(searchTerm)
  ) || [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-slate-900 text-white p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <GraduationCap className="text-blue-500" size={28} />
          <h2 className="font-black text-lg italic tracking-tight uppercase">Admin SMPN 18</h2>
        </div>
        <nav className="flex-1 space-y-2 font-bold">
          <div className="bg-blue-600 p-4 rounded-xl flex items-center gap-3"><List size={18} /> Data Kelulusan</div>
        </nav>
        <button onClick={handleLogout} className="mt-10 p-4 text-red-400 hover:bg-red-500/10 rounded-xl transition font-bold flex items-center gap-3">
          <LogOut size={18} /> KELUAR
        </button>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-6 md:p-10">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-800">Dashboard Admin</h1>
            <p className="text-slate-500 font-medium italic">Sinkronisasi Google Sheets Aktif</p>
          </div>
          <button onClick={() => mutate()} disabled={isValidating} className="bg-white border-2 border-slate-200 px-6 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-sm active:scale-95 transition-all">
            <RefreshCw size={18} className={isValidating ? "animate-spin text-blue-600" : ""} />
            {isValidating ? "Memuat..." : "Refresh Data"}
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatBox label="Total Peserta" value={totalSiswa} color="bg-blue-50" textColor="text-blue-600" />
          <StatBox label="Lulus" value={totalLulus} color="bg-emerald-50" textColor="text-emerald-600" />
          <StatBox label="Tidak Lulus" value={totalTidakLulus} color="bg-rose-50" textColor="text-rose-600" />
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center gap-4">
            <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">Tabel Kelulusan</h3>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input type="text" placeholder="Cari Nama/NISN..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-600 outline-none font-bold text-sm" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">
                <tr><th className="px-8 py-5">Nama</th><th className="px-8 py-5">NISN</th><th className="px-8 py-5">Tgl Lahir</th><th className="px-8 py-5">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-sm text-slate-600">
                {filteredData.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-4">{row[1]}</td>
                    <td className="px-8 py-4">{row[4]}</td>
                    <td className="px-8 py-4">{row[6]}</td>
                    <td className="px-8 py-4">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${row[11]?.includes("TIDAK") ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        {row[11] || "LULUS"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatBox({ label, value, color, textColor }) {
  return (
    <div className={`${color} p-8 rounded-[35px] border border-white shadow-sm`}>
      <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${textColor}`}>{label}</p>
      <p className="text-4xl font-black text-slate-800 tracking-tighter">{value}</p>
    </div>
  );
}