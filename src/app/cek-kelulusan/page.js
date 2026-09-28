"use client";
import React, { useState } from 'react';
import { Calendar, GraduationCap, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { checkGraduationStatus } from '@/backend/services/graduationService';

export default function CekKelulusan() {
  const [nisn, setNisn] = useState("");
  const [tglLahirRaw, setTglLahirRaw] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleCek = async () => {
    // Validasi input
    if (!nisn || !tglLahirRaw) {
      setErrorMsg("Harap isi NISN dan Tanggal Lahir!");
      return;
    }

    if (nisn.length < 9) {
      setErrorMsg("NISN harus terdiri dari minimal 10 angka (cek kembali)");
      return;
    }
    
    setLoading(true);
    setErrorMsg("");

    try {
      const result = await checkGraduationStatus(nisn, tglLahirRaw);

      if (result.found && result.data) {
        localStorage.setItem('hasil_siswa', JSON.stringify(result.data));
        router.push('/hasil');
      } else {
        setLoading(false);
        setErrorMsg(result.message || `Data Tidak Ditemukan!\nNISN: ${nisn}\nTgl Lahir: ${tglLahirRaw}\nPastikan data sesuai Dapodik.`);
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg("Gagal mengambil data dari Google Spreadsheet. Periksa koneksi internet Anda.");
    }
  };

  return (
    <div className="min-h-screen bg-blue-600 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="bg-white p-8 rounded-[40px] shadow-2xl w-full max-w-md border-4 border-white/20"
      >
        <div className="bg-blue-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3">
          <GraduationCap className="text-blue-600" size={40} />
        </div>
        
        <h1 className="text-2xl font-black text-center text-slate-800 mb-2 uppercase italic tracking-tighter">Portal Kelulusan</h1>
        <p className="text-center text-slate-400 font-bold text-[10px] mb-8 uppercase tracking-[0.3em]">SMP NEGERI 18 BUTON TENGAH</p>
        
        <div className="space-y-5">
          <AnimatePresence>
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                className="bg-red-50 text-red-600 p-4 rounded-2xl text-[11px] font-bold border border-red-100 whitespace-pre-line leading-relaxed"
              >
                <AlertCircle size={16} className="inline mr-2" /> {errorMsg}
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-widest">NISN Siswa</label>
            <input 
              type="text" 
              maxLength={10}
              placeholder="Contoh: 0104433545" 
              value={nisn} 
              onChange={(e) => setNisn(e.target.value.replace(/\D/g, ""))} // Hanya angka
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none transition-all font-bold text-slate-700 mt-1" 
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-widest">Pilih Tanggal Lahir</label>
            <div className="relative mt-1">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={20} />
              <input 
                type="date" 
                value={tglLahirRaw} 
                onChange={(e) => setTglLahirRaw(e.target.value)} 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-700 uppercase"
                style={{ colorScheme: 'light' }}
              />
            </div>
          </div>
          
          <button 
            onClick={handleCek} 
            disabled={loading} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-3xl shadow-xl transition-all flex items-center justify-center gap-3 mt-4 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 className="animate-spin" /> : "LIHAT HASIL KELULUSAN"}
          </button>

          <p className="text-center text-slate-300 font-bold text-[9px] mt-4 uppercase tracking-widest italic">
            &copy; 2026 Digital Graduation System
          </p>
        </div>
      </motion.div>
    </div>
  );
}