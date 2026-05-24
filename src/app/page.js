"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, Info, Calendar, Megaphone } from 'lucide-react';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-700 to-blue-900 py-20 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center text-white"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
            PENGUMUMAN KELULUSAN SMP
          </h1>
          <p className="text-xl md:text-2xl font-light mb-8 text-blue-100">
            Tahun Ajaran 2025/2026
          </p>
          <Link 
            href="/cek-kelulusan" 
            className="inline-flex items-center bg-white text-blue-700 px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:bg-blue-50 transition-all hover:scale-105"
          >
            Lihat Kelulusan <ChevronRight className="ml-2" />
          </Link>
        </motion.div>
      </section>

      {/* Informasi Section */}
      <section id="informasi" className="py-16 max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-blue-600">
              <Megaphone />
            </div>
            <h3 className="text-xl font-bold mb-3">Sambutan Kepala Sekolah</h3>
            <p className="text-slate-600 leading-relaxed">
              "Selamat kepada seluruh siswa kelas IX. Masa depan cerah menanti Anda. Tetaplah berprestasi di jenjang berikutnya."
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-blue-600">
              <Calendar />
            </div>
            <h3 className="text-xl font-bold mb-3">Jadwal Penting</h3>
            <ul className="text-slate-600 space-y-2">
              <li>• Pengumuman: 25 Mei 2026</li>
              <li>• Cap Tiga Jari: 28 Mei 2026</li>
              <li>• Pengambilan SKL: 1 Juni 2026</li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-blue-600">
              <Info />
            </div>
            <h3 className="text-xl font-bold mb-3">Informasi Penting</h3>
            <p className="text-slate-600">
              Pastikan NISN dan tanggal lahir sesuai dengan data di Dapodik untuk melihat hasil.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}