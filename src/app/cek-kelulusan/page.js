"use client";
import React, { useState } from 'react';
import Papa from 'papaparse';
import { Search, Calendar, GraduationCap, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function CekKelulusan() {
  const [nisn, setNisn] = useState("");
  const [tglLahirRaw, setTglLahirRaw] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQROG_sfb9He-IVo2xD2MhYXg2wpf-5YZF5L_nDhpOFRyGLXl2csLxAgqBHCN_IeMD8msQ9kW7WxSjm/pub?output=csv";

  const handleCek = () => {
    if (!nisn || !tglLahirRaw) {
      setErrorMsg("Harap isi NISN dan Tanggal Lahir!");
      return;
    }
    
    setLoading(true);
    setErrorMsg("");

    Papa.parse(GOOGLE_SHEET_URL, {
      download: true,
      header: false, // Kita baca mentah dulu untuk mencari posisi kolom
      skipEmptyLines: true,
      complete: (results) => {
        const allRows = results.data;
        
        // 1. CARI BARIS HEADER (Baris yang berisi tulisan 'Nama' atau 'NISN')
        const headerIndex = allRows.findIndex(row => 
          row.some(cell => cell?.toString().toLowerCase().includes('nisn'))
        );

        if (headerIndex === -1) {
          setErrorMsg("Gagal mengenali struktur tabel Google Sheets.");
          setLoading(false);
          return;
        }

        const headerRow = allRows[headerIndex];
        
        // 2. TEMUKAN POSISI KOLOM SECARA OTOMATIS
        const getIdx = (name) => headerRow.findIndex(cell => cell?.toString().toLowerCase().includes(name.toLowerCase()));
        
        const idxNama = getIdx('nama');
        const idxNISN = getIdx('nisn');
        const idxTgl  = getIdx('tanggal');
        const idxKet  = getIdx('keterangan');
        const idxIbu  = getIdx('ibu');
        const idxAyah = getIdx('ayah');
        const idxNIK  = getIdx('nik');
        const idxNIPD = getIdx('nipd');
        const idxJK   = getIdx('jk');
        const idxTempat = getIdx('tempat');
        const idxAgama = getIdx('agama');

        // 3. LOGIKA TANGGAL (Ubah 2011-01-15 menjadi 1/15/2011)
        const [year, month, day] = tglLahirRaw.split("-");
        const mClean = parseInt(month, 10).toString();
        const dClean = parseInt(day, 10).toString();
        const tglTarget = `${mClean}/${dClean}/${year}`; 

        // 4. CARI DATA SISWA
        const foundRow = allRows.slice(headerIndex + 1).find(row => {
          const valNISN = row[idxNISN]?.toString().trim();
          const valTgl = row[idxTgl]?.toString().trim();
          return valNISN === nisn.trim() && valTgl === tglTarget;
        });

        if (foundRow) {
          const normalizedData = {
            nama: foundRow[idxNama] || "Tidak Ada Nama",           
            nipd: foundRow[idxNIPD] || "-",           
            jk: foundRow[idxJK] || "-",             
            nisn: foundRow[idxNISN] || "-",           
            tempat_lahir: foundRow[idxTempat] || "-",    
            tanggal_lahir: foundRow[idxTgl] || "-",   
            nik: foundRow[idxNIK] || "-",            
            agama: foundRow[idxAgama] || "-",         
            nama_ayah: foundRow[idxAyah] || "-",     
            nama_ibu: foundRow[idxIbu] || "-",      
            status: foundRow[idxKet] || "LULUS", 
          };

          localStorage.setItem('hasil_siswa', JSON.stringify(normalizedData));
          router.push('/hasil');
        } else {
          setLoading(false);
          setErrorMsg(`Data Tidak Ditemukan!\nInput: ${nisn} & ${tglTarget}\nPeriksa penulisan di Sheets.`);
        }
      },
      error: () => {
        setErrorMsg("Gagal mengambil data. Cek koneksi internet.");
        setLoading(false);
      }
    });
  };

  return (
    <div className="min-h-screen bg-blue-600 flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-[40px] shadow-2xl w-full max-w-md">
        <div className="bg-blue-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <GraduationCap className="text-blue-600" size={40} />
        </div>
        <h1 className="text-2xl font-black text-center text-slate-800 mb-2 uppercase italic tracking-tighter">Portal Kelulusan</h1>
        <p className="text-center text-slate-400 font-bold text-[10px] mb-8 uppercase tracking-[0.3em]">SMP NEGERI 18 BUTON TENGAH</p>
        
        <div className="space-y-5">
          <AnimatePresence>
            {errorMsg && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 text-red-600 p-4 rounded-2xl text-[11px] font-bold border border-red-100 whitespace-pre-line">
                <AlertCircle size={16} className="inline mr-2" /> {errorMsg}
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-widest">NISN Siswa</label>
            <input type="text" placeholder="Masukkan NISN" value={nisn} onChange={(e) => setNisn(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none transition-all font-bold text-slate-700 mt-1" />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-widest">Pilih Tanggal Lahir</label>
            <input type="date" value={tglLahirRaw} onChange={(e) => setTglLahirRaw(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none transition-all font-bold text-slate-700 uppercase mt-1" style={{ colorScheme: 'light' }} />
          </div>
          
          <button onClick={handleCek} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-3xl shadow-xl transition-all flex items-center justify-center gap-3 mt-4">
            {loading ? <Loader2 className="animate-spin" /> : "LIHAT HASIL KELULUSAN"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}