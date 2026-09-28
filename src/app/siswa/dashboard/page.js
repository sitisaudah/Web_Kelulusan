import React from 'react';
import Link from 'next/link';
import { getCurrentUserAction } from '@/backend/actions/authActions';
import { getUlanganList, getHasilUlanganSiswa } from '@/backend/actions/ulanganActions';
import { 
  Award, BookOpen, FileText, User, ChevronRight, 
  Sparkles, Calendar, CheckCircle2, Clock 
} from 'lucide-react';
import Topbar from '@/components/portal/Topbar';

export default async function SiswaDashboard() {
  const { user, profile, studentData } = await getCurrentUserAction();
  const studentName = studentData?.nama || profile?.nama_lengkap || 'Siswa';
  const studentKelas = studentData?.kelas || 'IX';

  // Ambil ulangan aktif dan riwayat ulangan
  const { data: activeExams } = await getUlanganList({ kelas: studentKelas, isStudent: true });
  const { data: results } = await getHasilUlanganSiswa();

  const totalSelesai = results?.length || 0;
  const totalTersedia = activeExams?.length || 0;

  return (
    <div className="space-y-8">
      <Topbar
        title="Dashboard Siswa"
        subtitle={`Selamat datang kembali, ${studentName}!`}
        user={{ nama_lengkap: studentName, role: 'Siswa' }}
      />

      {/* Hero Welcome Card */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg">
        <div className="max-w-2xl relative z-10 space-y-3">
          <span className="inline-flex items-center gap-1.5 bg-blue-500/30 text-blue-200 text-xs font-bold px-3 py-1 rounded-full border border-blue-400/30">
            <Sparkles size={14} className="text-amber-300" /> Kelas {studentKelas} — Tahun Ajaran 2025/2026
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
            Portal Akademik &amp; Kelulusan Digital
          </h2>
          <p className="text-blue-100/90 text-xs sm:text-sm leading-relaxed">
            Akses informasi pengumuman kelulusan resmi dari Google Spreadsheet, kerjakan ulangan online CBT, dan pantau perkembangan nilai akademik Anda.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/siswa/kelulusan"
              className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs font-black px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
            >
              <Award size={16} /> Cek Status Kelulusan
            </Link>
            <Link
              href="/siswa/ulangan"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-5 py-2.5 rounded-xl border border-white/20 backdrop-blur-md transition-all active:scale-95"
            >
              <BookOpen size={16} /> Ujian Online Aktif ({totalTersedia})
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status Kelulusan</p>
            <p className="text-xl font-black text-slate-800 mt-1">Google Sheets</p>
            <span className="text-[10px] text-emerald-600 font-bold inline-flex items-center gap-1 mt-1">
              <CheckCircle2 size={12} /> Terhubung Live
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <Award size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ujian Tersedia</p>
            <p className="text-3xl font-black text-slate-800 mt-1">{totalTersedia}</p>
            <span className="text-[10px] text-slate-500 font-medium mt-1">Siap dikerjakan</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <BookOpen size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ujian Selesai</p>
            <p className="text-3xl font-black text-slate-800 mt-1">{totalSelesai}</p>
            <span className="text-[10px] text-slate-500 font-medium mt-1">Tercatat di sistem</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FileText size={24} />
          </div>
        </div>
      </div>

      {/* Grid Menu Cepat */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Ulangan Aktif Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
              <BookOpen size={18} className="text-blue-600" /> Ulangan / Ujian Aktif
            </h3>
            <Link href="/siswa/ulangan" className="text-xs font-bold text-blue-600 hover:underline">
              Semua Ujian &rarr;
            </Link>
          </div>

          {activeExams && activeExams.length > 0 ? (
            <div className="space-y-3">
              {activeExams.slice(0, 3).map((item) => (
                <div key={item.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-xs text-slate-800">{item.judul}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {item.mapel} &bull; Durasi: {item.durasi_menit} Menit
                    </p>
                  </div>
                  <Link
                    href={`/siswa/ulangan/${item.id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shrink-0"
                  >
                    Mulai
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">
              Belum ada ulangan aktif yang dijadwalkan untuk kelas Anda.
            </p>
          )}
        </div>

        {/* Profil Singkat Siswa */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                <User size={18} className="text-blue-600" /> Data Profil Anda
              </h3>
              <Link href="/siswa/profil" className="text-xs font-bold text-blue-600 hover:underline">
                Lihat Lengkap &rarr;
              </Link>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Nama Lengkap</span>
                <span className="font-bold text-slate-800">{studentName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400 font-medium">NISN</span>
                <span className="font-mono font-bold text-slate-800">{studentData?.nisn || '-'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Kelas</span>
                <span className="font-bold text-slate-800">{studentKelas}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400 font-medium">Tempat, Tgl Lahir</span>
                <span className="font-bold text-slate-800">
                  {studentData?.tempat_lahir ? `${studentData.tempat_lahir}, ${studentData.tanggal_lahir}` : '-'}
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/siswa/kelulusan"
            className="w-full bg-slate-900 hover:bg-black text-white text-xs font-black py-3 rounded-xl flex items-center justify-center gap-2 transition"
          >
            <Award size={16} /> Cek Kelulusan Saya
          </Link>
        </div>
      </div>
    </div>
  );
}
