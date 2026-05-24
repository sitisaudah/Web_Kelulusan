"use client";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, XCircle, ArrowLeft, Heart, User, 
  Star, Trophy, Award, Landmark, ShieldCheck, 
  Sparkles, PartyPopper, Medal, GraduationCap 
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

  if (!data) return <div className="p-20 text-center font-bold">Memuat Hasil...</div>;
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
      <div className="absolute inset-0 pointer-events-none">
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
        <Link href="/cek-kelulusan" className="inline-flex items-center text-slate-700 mb-8 font-black hover:gap-3 transition-all bg-white/80 backdrop-blur-md px-6 py-3 rounded-2xl shadow-sm border border-white">
          <ArrowLeft className="mr-2 text-blue-600" size={20} /> KEMBALI
        </Link>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8, rotateX: 20 }} 
          animate={{ opacity: 1, scale: 1, rotateX: 0 }} 
          className={`bg-white rounded-[60px] shadow-[0_30px_100px_rgba(0,0,0,0.1)] overflow-hidden border-[16px] border-white relative`}
        >
          {/* Efek Glow Neon pada Card */}
          <div className={`absolute inset-0 rounded-[44px] blur-3xl opacity-20 pointer-events-none ${isLulus ? 'bg-emerald-400' : 'bg-rose-400'}`} />

          {/* Header Visual */}
          <div 
            className="p-14 text-center text-white relative overflow-hidden"
            style={{
              background: isLulus 
                ? 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)' 
                : 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)'
            }}
          >
            {/* Pattern Abstract */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
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
                    className="absolute -top-4 -left-4 text-white"
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
              className="text-2xl font-black italic tracking-tighter mb-4 drop-shadow-md"
            >
              {isLulus ? 'SELAMAT ANDA DINYATAKAN LULUS' : 'TETAP SEMANGAT'}
            </motion.h2>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="inline-block px-2 py-2 backdrop-blur-md rounded-full borde"
            >
            </motion.div>
          </div>

          {/* Konten Data */}
          <div className="p-12 relative z-10">
            {/* Pesan Apresiasi Meriah */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className={`mb-12 p-8 rounded-[40px] text-center italic relative border-2 ${isLulus ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}
            >
              <Medal className={`absolute -top-5 left-1/2 -translate-x-1/2 ${isLulus ? 'text-emerald-500' : 'text-rose-500'}`} size={40} />
              <p className="text-xl font-bold leading-relaxed">
                "{getPesanApresiasi(data.status, data.nisn)}"
              </p>
            </motion.div>

            {/* Grid Informasi dengan Animasi Muncul Berurutan */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 gap-10"
            >
              <section className="space-y-6">
                <h4 className="text-slate-400 font-black text-xs tracking-[0.3em] flex items-center gap-3 italic">
                  <User size={18} className="text-blue-500" /> PROFIL SISWA
                </h4>
                <div className="space-y-6 border-l-4 border-blue-100 pl-6">
                  <motion.div variants={itemVariants}><InfoField label="NAMA LENGKAP" value={data.nama} /></motion.div>
                  <motion.div variants={itemVariants}><InfoField label="NISN" value={data.nisn} /></motion.div>
                  <motion.div variants={itemVariants}><InfoField label="TEMPAT, TANGGAL LAHIR" value={`${data.tempat_lahir}, ${data.tanggal_lahir}`} /></motion.div>
                  <motion.div variants={itemVariants}><InfoField label="JENIS KELAMIN" value={data.jk === 'L' ? 'LAKI-LAKI' : 'PEREMPUAN'} /></motion.div>
                </div>
              </section>

              <section className="space-y-6">
                <h4 className="text-slate-400 font-black text-xs tracking-[0.3em] flex items-center gap-3 italic">
                  <ShieldCheck size={18} className="text-emerald-500" /> HASIL AKADEMIK
                </h4>
                <div className="space-y-6 border-l-4 border-emerald-100 pl-6">
                  <motion.div variants={itemVariants}><InfoField label="NIPD / NO INDUK" value={data.nipd} /></motion.div>
                  <motion.div variants={itemVariants}><InfoField label="NOMOR NIK" value={data.nik} /></motion.div>
                  <motion.div variants={itemVariants}><InfoField label="AGAMA" value={data.agama} /></motion.div>
                  <motion.div variants={itemVariants}>
                    <div className="p-4 bg-emerald-50 rounded-2xl inline-block border border-emerald-100">
                       <InfoField label="KETERANGAN" value={data.status} highlight />
                    </div>
                  </motion.div>
                </div>
              </section>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="border-slate-100 text-center"
            >
            </motion.div>
          </div>
        </motion.div>

        <p className="text-center mt-12 text-slate-400 text-[10px] font-bold tracking-[0.4em] uppercase">
          &copy; 2026 - SMPN 18 Buton Tengah - Berakhlak & Berprestasi
        </p>
      </div>
    </div>
  );
}

function InfoField({ label, value, highlight }) {
  return (
    <div className="group">
      <p className="text-[9px] font-black text-slate-300 tracking-widest mb-1 uppercase group-hover:text-blue-400 transition-colors">
        {label}
      </p>
      <p className={`text-xl font-black ${highlight ? 'text-emerald-600 drop-shadow-sm' : 'text-slate-800'}`}>
        {value || '-'}
      </p>
    </div>
  );
}