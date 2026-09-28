"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ChevronRight, Award, Calendar, Megaphone, 
  Users, BookOpen, MapPin, CheckCircle, ArrowRight, 
  Sparkles, ShieldCheck, GraduationCap
} from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-16 pb-20">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-950 text-white py-24 px-4 sm:px-6 lg:px-8">
        {/* Decorative Grid Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-blue-700/60 border border-blue-500/40 text-blue-200 px-4 py-1.5 rounded-full text-xs font-bold mb-6 backdrop-blur-md"
          >
            <Sparkles size={14} className="text-amber-400" />
            Website Resmi SMP Negeri 18 Buton Tengah
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight mb-6"
          >
            Mewujudkan Generasi <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
              Berakhlak Mulia &amp; Berprestasi
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-base sm:text-lg text-blue-100/90 font-normal mb-10 leading-relaxed"
          >
            Pusat pendidikan berkualitas di Desa Tanailandu, Kecamatan Mawasangka, Buton Tengah. 
            Menunjang pembelajaran modern berbasis digital dan pengumuman kelulusan online terintegrasi.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link 
              href="/cek-kelulusan" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-amber-400 hover:bg-amber-300 text-slate-900 px-8 py-4 rounded-2xl font-black text-base shadow-xl hover:shadow-amber-400/20 transition-all hover:scale-105 active:scale-95"
            >
              <Award size={20} className="text-slate-900" />
              Cek Pengumuman Kelulusan
              <ChevronRight size={18} />
            </Link>

            <Link 
              href="/login" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-2xl font-bold text-base backdrop-blur-md transition-all active:scale-95"
            >
              <GraduationCap size={20} />
              Portal Siswa &amp; CBT
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 2. Fitur Layanan Cepat (Quick Access) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 flex flex-col justify-between hover:border-blue-300 transition-all group">
            <div>
              <div className="bg-blue-50 text-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Award size={24} />
              </div>
              <h3 className="text-base font-black text-slate-800 mb-1">Cek Kelulusan</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pengumuman kelulusan resmi siswa SMPN 18 Buton Tengah via Google Spreadsheet.
              </p>
            </div>
            <Link href="/cek-kelulusan" className="mt-4 text-xs font-bold text-blue-600 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              Buka Sekarang <ArrowRight size={14} />
            </Link>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 flex flex-col justify-between hover:border-blue-300 transition-all group">
            <div>
              <div className="bg-emerald-50 text-emerald-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BookOpen size={24} />
              </div>
              <h3 className="text-base font-black text-slate-800 mb-1">Ujian Online (CBT)</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pelaksanaan ulangan harian dan ujian sekolah berbasis komputer untuk seluruh siswa.
              </p>
            </div>
            <Link href="/login?tab=siswa" className="mt-4 text-xs font-bold text-emerald-600 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              Mulai Ujian <ArrowRight size={14} />
            </Link>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 flex flex-col justify-between hover:border-blue-300 transition-all group">
            <div>
              <div className="bg-purple-50 text-purple-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users size={24} />
              </div>
              <h3 className="text-base font-black text-slate-800 mb-1">Profil &amp; Guru</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Kenali dewan guru, tenaga kependidikan, fasilitas, serta visi misi sekolah kami.
              </p>
            </div>
            <Link href="/tentang" className="mt-4 text-xs font-bold text-purple-600 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              Lihat Profil <ArrowRight size={14} />
            </Link>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 flex flex-col justify-between hover:border-blue-300 transition-all group">
            <div>
              <div className="bg-amber-50 text-amber-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MapPin size={24} />
              </div>
              <h3 className="text-base font-black text-slate-800 mb-1">Lokasi Sekolah</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Petunjuk arah dan peta lokasi SMP Negeri 18 di poros Tanailandu, Kec. Mawasangka.
              </p>
            </div>
            <Link href="/lokasi" className="mt-4 text-xs font-bold text-amber-600 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              Buka Peta <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Sambutan & Jadwal */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Sambutan Kepala Sekolah */}
          <div className="md:col-span-2 bg-gradient-to-br from-white to-slate-50 p-8 sm:p-10 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 text-blue-600 mb-4 font-bold text-xs uppercase tracking-widest">
              <Megaphone size={18} /> Sambutan Kepala Sekolah
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-4">
              Membangun Masa Depan Berkarakter di SMPN 18 Buton Tengah
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              "Puji syukur ke hadirat Tuhan Yang Maha Esa atas hadirnya website resmi SMP Negeri 18 Buton Tengah. 
              Website ini hadir sebagai jembatan informasi antara sekolah, orang tua, peserta didik, dan masyarakat. 
              Melalui portal terpadu ini, kami mengintegrasikan layanan pengumuman kelulusan serta sistem ujian CBT digital 
              untuk mendukung kemajuan mutu pendidikan di Buton Tengah."
            </p>
            <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                RS
              </div>
              <div>
                <p className="font-extrabold text-slate-800 text-sm">Ruslan Saula, S.Pd.</p>
                <p className="text-xs text-slate-500 font-medium">Kepala SMP Negeri 18 Buton Tengah</p>
              </div>
            </div>
          </div>

          {/* Agenda & Jadwal */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 text-blue-600 mb-4 font-bold text-xs uppercase tracking-widest">
                <Calendar size={18} /> Agenda Akademik
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-4">Jadwal Penting</h3>
              <ul className="space-y-4 text-xs text-slate-600 font-medium">
                <li className="flex items-start gap-3 bg-blue-50/60 p-3 rounded-xl border border-blue-100/50">
                  <span className="w-2 h-2 rounded-full bg-blue-600 mt-1 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-800">Pengumuman Kelulusan</p>
                    <p className="text-slate-500">02 Juni 2026 — Diumumkan secara online</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="w-2 h-2 rounded-full bg-amber-500 mt-1 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-800">Penilaian Akhir Semester (CBT)</p>
                    <p className="text-slate-500">Jadwal ulangan online di Portal Siswa</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-800">Penerbitan SKL Digital</p>
                    <p className="text-slate-500">Dapat dicetak mandiri di halaman hasil</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link href="/kontak" className="text-xs font-bold text-blue-600 flex items-center justify-between">
                <span>Ada pertanyaan seputar jadwal?</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Visi & Misi Ringkas */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-blue-900 text-white p-8 sm:p-12 rounded-3xl relative overflow-hidden">
          <div className="max-w-3xl">
            <span className="text-xs font-black uppercase tracking-widest text-amber-300 mb-2 block">
              Visi Sekolah
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mb-6 leading-tight">
              "Unggul dalam Prestasi, Terampil dalam Teknologi, Berlandaskan Iman dan Takwa."
            </h2>
            <div className="grid sm:grid-cols-3 gap-6 pt-6 border-t border-blue-800/80">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <CheckCircle size={16} /> Karakter
                </div>
                <p className="text-xs text-blue-100/80">Menanamkan nilai kejujuran, religius, dan sopan santun.</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <CheckCircle size={16} /> Akademik
                </div>
                <p className="text-xs text-blue-100/80">Mendorong peserta didik mencapai kompetensi kelulusan optimal.</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <CheckCircle size={16} /> Digital
                </div>
                <p className="text-xs text-blue-100/80">Adaptasi sistem ujian online dan literasi komputer terpadu.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}