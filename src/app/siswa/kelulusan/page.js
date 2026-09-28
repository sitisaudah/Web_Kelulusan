"use client";
import React, { useState, useEffect } from 'react';
import { Award, Trophy, XCircle, Printer, RefreshCw, AlertCircle, Sparkles, CheckCircle2, User, ShieldCheck } from 'lucide-react';
import Topbar from '@/components/portal/Topbar';
import { checkGraduationStatus } from '@/backend/services/graduationService';
import confetti from 'canvas-confetti';

export default function SiswaKelulusanPage() {
  const [nisn, setNisn] = useState('');
  const [tglLahir, setTglLahir] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Saat pertama kali dimuat, periksa apakah ada hasil kelulusan yang tersimpan di localStorage
  useEffect(() => {
    const saved = localStorage.getItem('hasil_siswa');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setResultData(parsed);
        if (parsed.nisn) setNisn(parsed.nisn);
        if (parsed.tanggal_lahir) setTglLahir(parsed.tanggal_lahir);
      } catch (e) {}
    }
  }, []);

  const handleCek = async (e) => {
    if (e) e.preventDefault();
    if (!nisn || !tglLahir) {
      setErrorMsg('Harap lengkapi NISN dan Tanggal Lahir.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await checkGraduationStatus(nisn, tglLahir);
      if (res.found && res.data) {
        setResultData(res.data);
        localStorage.setItem('hasil_siswa', JSON.stringify(res.data));

        if (res.data.status === 'LULUS') {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      } else {
        setResultData(null);
        setErrorMsg(res.message || 'Data kelulusan tidak ditemukan.');
      }
    } catch (err) {
      setErrorMsg('Gagal memuat data dari Google Spreadsheet. Periksa koneksi internet.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const isLulus = resultData?.status === 'LULUS';

  return (
    <div className="space-y-8 max-w-4xl">
      <Topbar
        title="Cek Kelulusan Siswa"
        subtitle="Data Kelulusan Resmi Terintegrasi Langsung dengan Google Spreadsheet"
      />

      {/* Form Input Pencarian */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm print:hidden">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Award size={18} className="text-blue-600" /> Verifikasi Data Kelulusan Anda
        </h3>

        {errorMsg && (
          <div className="mb-4 p-4 bg-rose-50 text-rose-700 rounded-2xl text-xs font-bold flex items-center gap-2 border border-rose-100">
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleCek} className="grid sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-widest">
              NISN Siswa
            </label>
            <input
              type="text"
              required
              maxLength={10}
              placeholder="Contoh: 0104433545"
              value={nisn}
              onChange={(e) => setNisn(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-600 outline-none text-xs font-bold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-widest">
              Tanggal Lahir
            </label>
            <input
              type="date"
              required
              value={tglLahir}
              onChange={(e) => setTglLahir(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-600 outline-none text-xs font-bold text-slate-800"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {loading ? <RefreshCw size={16} className="animate-spin" /> : <Award size={16} />}
            {loading ? 'Memeriksa...' : 'Cek Status'}
          </button>
        </form>
      </div>

      {/* Tampilan Hasil Kelulusan */}
      {resultData ? (
        <div className={`rounded-3xl shadow-xl overflow-hidden border-4 ${isLulus ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'} print:border-none print:shadow-none print:bg-white`}>
          {/* Header Kartu */}
          <div className={`p-8 text-center text-white ${isLulus ? 'bg-gradient-to-r from-emerald-600 to-teal-700' : 'bg-gradient-to-r from-rose-600 to-red-700'} print:bg-white print:text-slate-900 print:border-b`}>
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center print:hidden">
              {isLulus ? <Trophy size={32} className="text-yellow-300" /> : <XCircle size={32} />}
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-90 block mb-1">
              SURAT KETERANGAN KELULUSAN SEMENTARA
            </span>
            <h2 className="text-2xl font-black uppercase tracking-tight">
              {isLulus ? 'DINYATAKAN LULUS' : 'DINYATAKAN TIDAK LULUS'}
            </h2>
            <p className="text-xs opacity-90 mt-1">
              SMP NEGERI 18 BUTON TENGAH — TAHUN AJARAN 2025/2026
            </p>
          </div>

          {/* Isi Kartu Siswa */}
          <div className="p-8 space-y-8 bg-white">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <User size={16} className="text-blue-600" /> Data Siswa
                </h4>
                <div className="space-y-2 text-xs border-l-2 border-slate-200 pl-4">
                  <div>
                    <p className="text-slate-400 text-[10px] font-bold">NAMA LENGKAP</p>
                    <p className="font-bold text-slate-800 text-sm">{resultData.nama}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] font-bold">NISN</p>
                    <p className="font-mono font-bold text-slate-800">{resultData.nisn}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] font-bold">TEMPAT, TANGGAL LAHIR</p>
                    <p className="font-bold text-slate-800">{resultData.tempat_lahir}, {resultData.tanggal_lahir}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] font-bold">JENIS KELAMIN</p>
                    <p className="font-bold text-slate-800">{resultData.jk === 'L' ? 'LAKI-LAKI' : 'PEREMPUAN'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-600" /> Akademik &amp; Keluarga
                </h4>
                <div className="space-y-2 text-xs border-l-2 border-slate-200 pl-4">
                  <div>
                    <p className="text-slate-400 text-[10px] font-bold">NIPD / NO INDUK</p>
                    <p className="font-bold text-slate-800">{resultData.nipd || '-'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] font-bold">NOMOR NIK</p>
                    <p className="font-mono font-bold text-slate-800">{resultData.nik || '-'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] font-bold">NAMA ORANG TUA (AYAH / IBU)</p>
                    <p className="font-bold text-slate-800">{resultData.nama_ayah || '-'} / {resultData.nama_ibu || '-'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] font-bold">STATUS RESMI</p>
                    <span className={`inline-block px-3 py-1 rounded-lg text-xs font-black uppercase ${isLulus ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {resultData.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tombol Cetak Dokumen */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
              <span className="text-[11px] text-slate-400">
                Sumber Data: Google Spreadsheet SMPN 18 Buton Tengah
              </span>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition cursor-pointer"
              >
                <Printer size={16} /> Cetak Bukti Kelulusan (PDF)
              </button>
            </div>

            {/* Signature Area untuk Print */}
            <div className="hidden print:block pt-10 text-right text-xs">
              <p className="text-slate-600">Tanailandu, 02 Juni 2026</p>
              <p className="text-slate-600 mb-14">Kepala SMP Negeri 18 Buton Tengah</p>
              <p className="font-bold text-slate-900 underline">RUSLAN SAULA, S.Pd.</p>
              <p className="text-slate-500 text-[10px]">NIP. 197805122008011012</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <Award size={40} className="mx-auto text-slate-300" />
          <h3 className="font-black text-slate-800 text-base">Belum Ada Data yang Diperiksa</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Masukkan NISN dan tanggal lahir Anda pada formulir di atas untuk mengambil status kelulusan resmi dari Google Spreadsheet.
          </p>
        </div>
      )}
    </div>
  );
}
