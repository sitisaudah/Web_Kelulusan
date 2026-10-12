"use client";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, XCircle, ArrowLeft, Heart, User, 
  Star, Trophy, Award, Landmark, ShieldCheck, 
  Sparkles, PartyPopper, Medal, GraduationCap, Printer,
  Users, MapPin
} from 'lucide-react';
import Link from 'next/link';
import confetti from 'canvas-confetti';

export default function HasilKelulusan() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const savedData = localStorage.getItem('hasil_siswa');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setData(parsed);
      
      if (parsed.status === "LULUS") {
        // Efek kembang api super meriah (sisi kiri & kanan)
        const end = Date.now() + (10 * 1000);
        const colors = ['#34d399', '#fbbf24', '#60a5fa', '#f472b6'];

        (function frame() {
          confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: colors
          });
          confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: colors
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        }());
      }
    }
  }, []);

  const getPesanApresiasi = (status, nisn) => {
    const listLulus = [
      "Masa depan cerah menantimu! Teruslah berkarya dan membanggakan orang tua.",
      "Keberhasilan adalah milik mereka yang tidak pernah berhenti mencoba. Selamat!",
      "Langkahmu baru saja dimulai. Pertahankan semangat ini di jenjang selanjutnya!",
      "Selamat atas pencapaian luar biasamu! SMPN 18 Buton Tengah bangga padamu."
    ];
    const lastDigit = parseInt(nisn?.slice(-1)) || 0;
    return status === "LULUS" ? listLulus[lastDigit % listLulus.length] : "Jangan menyerah, kegagalan adalah rintangan yang akan menguatkanmu.";
  };

  const handlePrint = () => {
    window.print();
  };

  if (!data) return <div className="p-20 text-center font-bold text-slate-600">Memuat Hasil...</div>;
  const isLulus = data.status === "LULUS";

  // Varian animasi untuk list data
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className={`min-h-screen py-10 px-4 relative overflow-hidden transition-colors duration-1000 ${isLulus ? 'bg-emerald-50' : 'bg-rose-50'}`}>
      
      {/* Ornamen Latar Belakang (Animated) */}
      <div className="absolute inset-0 pointer-events-none print:hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [0, -40, 0], 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
              opacity: [0.1, 0.3, 0.1] 
            }}
            transition={{ duration: 7 + i, repeat: Infinity }}
            className={`absolute ${isLulus ? 'text-emerald-300' : 'text-rose-300'}`}
            style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
          >
            {i % 3 === 0 ? <Sparkles size={30 + i * 5} /> : i % 2 === 0 ? <Star size={20} /> : <PartyPopper size={40} />}
          </motion.div>
        ))}
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-8 print:hidden">
          <Link href="/cek-kelulusan" className="inline-flex items-center text-slate-700 font-black hover:gap-3 transition-all bg-white/80 backdrop-blur-md px-6 py-3 rounded-2xl shadow-sm border border-white">
            <ArrowLeft className="mr-2 text-blue-600" size={20} /> KEMBALI
          </Link>
          <button 
            onClick={handlePrint}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Printer size={18} /> Cetak Bukti Kelulusan
          </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8, rotateX: 20 }} 
          animate={{ opacity: 1, scale: 1, rotateX: 0 }} 
          className={`bg-white rounded-[60px] shadow-[0_30px_100px_rgba(0,0,0,0.1)] overflow-hidden border-[16px] border-white relative print:border-none print:shadow-none print:rounded-none`}
        >
          {/* Efek Glow Neon pada Card */}
          <div className={`absolute inset-0 rounded-[44px] blur-3xl opacity-20 pointer-events-none print:hidden ${isLulus ? 'bg-emerald-400' : 'bg-rose-400'}`} />

          {/* Header Visual */}
          <div 
            className="p-14 text-center text-white relative overflow-hidden print:p-8"
            style={{
              background: isLulus 
                ? 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)' 
                : 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)'
            }}
          >
            {/* Pattern Abstract */}
            <div className="absolute inset-0 opacity-10 pointer-events-none print:hidden">
              <Landmark size={300} className="absolute -right-20 -top-20 rotate-12" />
              <GraduationCap size={250} className="absolute -left-20 -bottom-20 -rotate-12" />
            </div>
            
            <motion.div 
              initial={{ scale: 0, rotate: -180 }} 
              animate={{ scale: 1, rotate: 0 }} 
              transition={{ type: 'spring', damping: 10, delay: 0.2 }}
              className="relative inline-block z-10"
            >
              {isLulus ? (
                <div className="relative">
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                  >
                    <Trophy className="w-28 h-28 mx-auto mb-4 text-yellow-300 drop-shadow-[0_0_15px_rgba(253,224,71,0.5)]" />
                  </motion.div>
                  <motion.div 
                    animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-4 -left-4 text-white print:hidden"
                  >
                    <Sparkles size={32} />
                  </motion.div>
                </div>
              ) : (
                <XCircle className="w-28 h-28 mx-auto mb-4 drop-shadow-xl opacity-90" />
              )}
            </motion.div>

            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-2xl md:text-3xl font-black italic tracking-tighter mb-2 drop-shadow-md uppercase"
            >
              {isLulus ? 'SELAMAT ANDA DINYATAKAN LULUS' : 'TETAP SEMANGAT'}
            </motion.h2>
            <p className="text-white/80 text-xs font-bold tracking-[0.2em] uppercase">
              SMP NEGERI 18 BUTON TENGAH — TAHUN AJARAN 2025/2026
            </p>
          </div>

          {/* Konten Data */}
          <div className="p-12 relative z-10 print:p-6">
            {/* Pesan Apresiasi */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className={`mb-12 p-8 rounded-[40px] text-center italic relative border-2 print:mb-6 print:p-4 ${isLulus ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}
            >
              <Medal className={`absolute -top-5 left-1/2 -translate-x-1/2 print:hidden ${isLulus ? 'text-emerald-500' : 'text-rose-500'}`} size={40} />
              <p className="text-lg md:text-xl font-bold leading-relaxed">
                "{getPesanApresiasi(data.status, data.nisn)}"
              </p>
            </motion.div>

            {/* Grid Informasi */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 gap-8 print:gap-4"
            >
              {/* 1. Profil Siswa */}
              <section className="space-y-4 print:space-y-2">
                <h4 className="text-slate-400 font-black text-xs tracking-[0.3em] flex items-center gap-3 italic">
                  <User size={18} className="text-blue-500" /> PROFIL SISWA
                </h4>
                <div className="space-y-4 border-l-4 border-blue-100 pl-5 print:space-y-2">
                  <motion.div variants={itemVariants}><InfoField label="NAMA LENGKAP" value={data.nama} /></motion.div>
                  <motion.div variants={itemVariants}><InfoField label="NISN" value={data.nisn} /></motion.div>
                  <motion.div variants={itemVariants}><InfoField label="TEMPAT, TANGGAL LAHIR" value={`${data.tempat_lahir || '-'}, ${data.tanggal_lahir || '-'}`} /></motion.div>
                  <motion.div variants={itemVariants}><InfoField label="JENIS KELAMIN & ROMBEL" value={`${data.jk === 'L' ? 'LAKI-LAKI' : 'PEREMPUAN'} — Kelas ${data.kelas || 'IX'}`} /></motion.div>
                </div>
              </section>

              {/* 2. Hasil Akademik & Identitas Resmi */}
              <section className="space-y-4 print:space-y-2">
                <h4 className="text-slate-400 font-black text-xs tracking-[0.3em] flex items-center gap-3 italic">
                  <ShieldCheck size={18} className="text-emerald-500" /> HASIL AKADEMIK
                </h4>
                <div className="space-y-4 border-l-4 border-emerald-100 pl-5 print:space-y-2">
                  <motion.div variants={itemVariants}><InfoField label="NIPD / NO INDUK" value={data.nipd || '-'} /></motion.div>
                  <motion.div variants={itemVariants}><InfoField label="NOMOR NIK" value={data.nik || '-'} /></motion.div>
                  <motion.div variants={itemVariants}><InfoField label="AGAMA" value={data.agama || 'Islam'} /></motion.div>
                  <motion.div variants={itemVariants}>
                    <div className="p-3 bg-emerald-50 rounded-2xl inline-block border border-emerald-100">
                       <InfoField label="STATUS KELULUSAN" value={data.status} highlight />
                    </div>
                  </motion.div>
                </div>
              </section>

              {/* 3. Data Orang Tua & Wali */}
              <section className="space-y-4 print:space-y-2">
                <h4 className="text-slate-400 font-black text-xs tracking-[0.3em] flex items-center gap-3 italic">
                  <Users size={18} className="text-purple-500" /> DATA ORANG TUA / WALI
                </h4>
                <div className="space-y-4 border-l-4 border-purple-100 pl-5 print:space-y-2">
                  <motion.div variants={itemVariants}>
                    <InfoField 
                      label="NAMA AYAH KANDUNG" 
                      value={data.nama_ayah ? `${data.nama_ayah} ${data.pekerjaan_ayah ? `(${data.pekerjaan_ayah})` : ''}` : '-'} 
                    />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <InfoField 
                      label="NAMA IBU KANDUNG" 
                      value={data.nama_ibu ? `${data.nama_ibu} ${data.pekerjaan_ibu ? `(${data.pekerjaan_ibu})` : ''}` : '-'} 
                    />
                  </motion.div>
                  {data.nama_wali && data.nama_wali !== '-' && (
                    <motion.div variants={itemVariants}>
                      <InfoField 
                        label="NAMA WALI SISWA" 
                        value={`${data.nama_wali} ${data.pekerjaan_wali ? `(${data.pekerjaan_wali})` : ''}`} 
                      />
                    </motion.div>
                  )}
                </div>
              </section>

              {/* 4. Alamat Tempat Tinggal */}
              <section className="space-y-4 print:space-y-2">
                <h4 className="text-slate-400 font-black text-xs tracking-[0.3em] flex items-center gap-3 italic">
                  <MapPin size={18} className="text-amber-500" /> ALAMAT DOMISILI
                </h4>
                <div className="space-y-4 border-l-4 border-amber-100 pl-5 print:space-y-2">
                  <motion.div variants={itemVariants}>
                    <InfoField 
                      label="ALAMAT LENGKAP" 
                      value={data.alamat_lengkap || data.alamat || 'Tanailandu, Kec. Mawasangka'} 
                    />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <InfoField 
                      label="DUSUN / KELURAHAN" 
                      value={`${data.dusun ? `Dusun ${data.dusun}` : '-'}, ${data.kelurahan || 'Tanailandu'}`} 
                    />
                  </motion.div>
                </div>
              </section>
            </motion.div>

            <div className="hidden print:block mt-8 pt-6 border-t border-slate-200 text-right">
              <p className="text-xs text-slate-500 mb-12">Tanailandu, 02 Juni 2026<br />Kepala SMP Negeri 18 Buton Tengah</p>
              <p className="text-xs font-bold text-slate-800 underline">RUSLAN SAULA, S.Pd.</p>
              <p className="text-[10px] text-slate-500">NIP. 197805122008011012</p>
            </div>
          </div>
        </motion.div>

        <p className="text-center mt-12 text-slate-400 text-[10px] font-bold tracking-[0.4em] uppercase print:hidden">
          &copy; 2026 - SMPN 18 Buton Tengah - Berakhlak & Berprestasi
        </p>
      </div>
    </div>
  );
}

function InfoField({ label, value, highlight }) {
  return (
    <div className="group">
      <p className="text-[9px] font-black text-slate-400 tracking-widest mb-1 uppercase">
        {label}
      </p>
      <p className={`text-lg md:text-xl font-black ${highlight ? 'text-emerald-600' : 'text-slate-800'}`}>
        {value || '-'}
      </p>
    </div>
  );
}