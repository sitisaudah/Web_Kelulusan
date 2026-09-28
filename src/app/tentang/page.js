"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, Target, Eye, Users, BookOpen, 
  Award, Shield, Laptop, Library, Trophy, CheckCircle2 
} from 'lucide-react';
import Link from 'next/link';

export default function TentangPage() {
  const dewanGuru = [
    { nama: 'Ruslan Saula, S.Pd.', jabatan: 'Kepala Sekolah', nip: '197805122008011012', mapel: 'Bahasa Indonesia' },
    { nama: 'Siti Rahmawati, S.Pd.', jabatan: 'Wakil Kepala Sekolah / Guru', nip: '198502142010012023', mapel: 'Matematika' },
    { nama: 'Ahmad Fadillah, S.Pd.', jabatan: 'Guru Mata Pelajaran', nip: '199011032015021004', mapel: 'Ilmu Pengetahuan Alam (IPA)' },
    { nama: 'Nurul Hidayah, S.Pd.', jabatan: 'Guru Mata Pelajaran', nip: '199208202019032015', mapel: 'Bahasa Inggris' },
    { nama: 'La Ode Armin, S.Pd.', jabatan: 'Guru Mata Pelajaran', nip: '199104052018021008', mapel: 'Pendidikan Jasmani (PJOK)' },
    { nama: 'Wa Ode Mardiana, S.Pd.', jabatan: 'Guru Mata Pelajaran', nip: '199307122020012019', mapel: 'Pendidikan Agama Islam' },
  ];

  const fasilitas = [
    { icon: Laptop, title: 'Laboratorium Komputer CBT', desc: 'Dilengkapi perangkat komputer dan koneksi jaringan untuk pelaksanaan asesmen dan ujian online.' },
    { icon: Library, title: 'Perpustakaan Sekolah', desc: 'Koleksi buku kurikulum merdeka, referensi umum, dan buku bacaan pengayaan untuk literasi siswa.' },
    { icon: Building2, title: 'Ruang Kelas Nyaman', desc: 'Ruang belajar yang bersih, berpenerangan cukup, dan mendukung iklim pembelajaran aktif interaktif.' },
    { icon: Trophy, title: 'Lapangan Olahraga & Seni', desc: 'Sarana penyaluran bakat olahraga bola voli, futsal, bulu tangkis, serta kegiatan ekstrakurikuler kepramukaan.' },
  ];

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
          Profil Lembaga
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          SMP Negeri 18 Buton Tengah
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Lembaga pendidikan menengah pertama negeri yang berdedikasi mendidik putra-putri bangsa 
          di kawasan Waburense, Desa Tanailandu, Kecamatan Mawasangka, Kabupaten Buton Tengah.
        </p>
      </div>

      {/* Visi & Misi Card */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-8 sm:p-10 rounded-3xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
              <Eye size={26} className="text-amber-300" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-blue-200">
              Visi Kami
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mt-2 mb-6 leading-snug">
              "Terwujudnya Peserta Didik yang Berakhlak Mulia, Cerdas, Terampil, dan Berwawasan Lingkungan."
            </h2>
          </div>
          <p className="text-xs text-blue-100/80 leading-relaxed border-t border-blue-500/50 pt-4">
            Berkomitmen mempersiapkan lulusan yang siap bersaing ke jenjang SMA/SMK sederajat dengan pondasi moral yang kuat.
          </p>
        </div>

        <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
              <Target size={26} />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">
              Misi Kami
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 mt-2 mb-4">
              Langkah Nyata Pendidikan Berkualitas
            </h2>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
              <li className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>Menumbuhkan penghayatan dan pengamalan ajaran agama dalam kehidupan sehari-hari.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>Melaksanakan proses belajar mengajar secara efektif, kontekstual, dan berpusat pada siswa.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>Mendorong dan membantu siswa mengenali potensi dirinya melalui kegiatan ekstrakurikuler.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>Mengembangkan pemanfaatan teknologi informasi dalam sistem penilaian dan pembelajaran.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Fasilitas Sekolah */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-black uppercase tracking-widest text-blue-600">
            Sarana &amp; Prasarana
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Fasilitas Penunjang Pembelajaran
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {fasilitas.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <Icon size={24} />
                </div>
                <h3 className="font-bold text-slate-800 text-base mb-2">{f.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dewan Guru */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-black uppercase tracking-widest text-blue-600">
            Pendidik &amp; Tenaga Kependidikan
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Dewan Guru SMPN 18 Buton Tengah
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dewanGuru.map((g, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shrink-0">
                {g.nama.split(' ')[0][0]}
              </div>
              <div className="space-y-1 min-w-0">
                <h4 className="font-bold text-slate-800 text-sm truncate">{g.nama}</h4>
                <p className="text-xs font-semibold text-blue-600">{g.jabatan}</p>
                <p className="text-[11px] text-slate-500">{g.mapel}</p>
                <p className="text-[10px] text-slate-400 font-mono">NIP: {g.nip}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
