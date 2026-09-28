"use client";
import React, { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';
import { 
  Clock, CheckCircle2, AlertTriangle, ArrowLeft, 
  ArrowRight, Send, HelpCircle, Loader2, Trophy,
  FileText, CheckSquare, Layers, Sparkles, Edit3, Eye,
  ShieldAlert, ShieldX, XCircle, Maximize2, Ban
} from 'lucide-react';
import { getUlanganById, getSoalList, submitUlanganJawaban } from '@/backend/actions/ulanganActions';
import PdfViewer from '@/components/portal/PdfViewer';
import DigitalAnswerSheet from '@/components/portal/DigitalAnswerSheet';
import WebExamQuestionsView from '@/components/portal/WebExamQuestionsView';

/**
 * Memainkan nada peringatan frekuensi tinggi via Web Audio API
 */
function playWarningBeep() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {}
}

export default function RuangUjianCBTPage({ params }) {
  const resolvedParams = params && typeof params.then === 'function' ? use(params) : (params || {});
  const ulanganId = resolvedParams.id;

  const [exam, setExam] = useState(null);
  const [soalList, setSoalList] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [resultSummary, setResultSummary] = useState(null);

  // Jawaban PG & Essay
  const [jawabanPg, setJawabanPg] = useState({});
  const [jawabanEssay, setJawabanEssay] = useState({});
  const [raguMap, setRaguMap] = useState({});

  // Toggle PDF preview side panel
  const [showPdfPanel, setShowPdfPanel] = useState(false);

  // ========================================================
  // SISTEM ANTI-CURANG & PENGAWASAN (PROCTORING SYSTEM)
  // ========================================================
  const [examStarted, setExamStarted] = useState(false); // Modal tata tertib fullscreen awal
  const [warningCount, setWarningCount] = useState(0); // 1 - 3 Peringatan, > 3 Diskualifikasi
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [lastViolationReason, setLastViolationReason] = useState('');
  const [isDisqualified, setIsDisqualified] = useState(false);

  // Refs untuk sinkronisasi mutable & mencegah re-render effect / race condition
  const warningCountRef = useRef(0);
  const showWarningModalRef = useRef(false);
  const isDisqualifiedRef = useRef(false);
  const lastViolationTimeRef = useRef(0);
  const examStartedTimeRef = useRef(0);
  const jawabanPgRef = useRef(jawabanPg);
  const jawabanEssayRef = useRef(jawabanEssay);

  useEffect(() => {
    jawabanPgRef.current = jawabanPg;
  }, [jawabanPg]);

  useEffect(() => {
    jawabanEssayRef.current = jawabanEssay;
  }, [jawabanEssay]);

  // Load Exam Data
  useEffect(() => {
    if (!ulanganId) return;
    async function loadData() {
      try {
        const [resExam, resSoal] = await Promise.all([
          getUlanganById(ulanganId, true),
          getSoalList(ulanganId, true),
        ]);

        if (resExam.success && resExam.data) {
          const ex = resExam.data;
          setExam(ex);
          setTimeLeft(ex.durasi_menit * 60);
        }

        if (resSoal.success && resSoal.data) {
          setSoalList(resSoal.data);
        }
      } catch (err) {
        console.error('Gagal memuat ujian:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [ulanganId]);

  // Eksekusi Diskualifikasi Otomatis ke Backend
  const handleTriggerDisqualification = async (reason) => {
    if (isDisqualifiedRef.current) return;
    isDisqualifiedRef.current = true;
    showWarningModalRef.current = false;

    setIsDisqualified(true);
    setShowWarningModal(false);
    setShowConfirmModal(false);

    try {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    } catch (e) {}

    try {
      await submitUlanganJawaban({
        ulanganId,
        jawaban_pg: jawabanPgRef.current,
        jawaban_essay: jawabanEssayRef.current,
        is_disqualified: true,
        catatan_pelanggaran: `Didiskualifikasi otomatis oleh sistem: Terdeteksi melanggar tata tertib lebih dari 3 kali. Pelanggaran terakhir: ${reason}.`,
      });
    } catch (err) {
      console.error('Gagal mengirim status diskualifikasi:', err);
    }
  };

  // Pencatat Pelanggaran (Toleransi Maksimal 3x)
  const recordViolation = (reason) => {
    // Abaikan jika ujian belum dimulai, sedang melihat modal warning, atau sudah selesai/diskualifikasi
    if (!examStarted || isDisqualifiedRef.current || isDisqualified || resultSummary) return;
    if (showWarningModalRef.current) return;

    // Grace period 3 detik setelah mulai ujian agar transisi fullscreen/fokus tidak memicu false positive
    if (Date.now() - examStartedTimeRef.current < 3000) return;

    // Debounce 1.5 detik
    const now = Date.now();
    if (now - lastViolationTimeRef.current < 1500) return;
    lastViolationTimeRef.current = now;

    playWarningBeep();

    const newCount = warningCountRef.current + 1;
    warningCountRef.current = newCount;
    setWarningCount(newCount);
    setLastViolationReason(reason);

    if (newCount <= 3) {
      showWarningModalRef.current = true;
      setShowWarningModal(true);
    } else {
      // Lebih dari 3x pelanggaran (ke-4) -> langsung diskualifikasi
      handleTriggerDisqualification(reason);
    }
  };

  // Event Listeners Anti-Kecurangan (Hanya aktif setelah tombol "Mulai Ujian" diklik)
  useEffect(() => {
    if (!examStarted || isDisqualified || resultSummary) return;

    // 1. Deteksi Pindah Tab atau Minimize Window
    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordViolation('Membuka tab browser lain atau meminimalkan jendela ujian');
      }
    };

    // 2. Deteksi Keluar Jendela / Alt+Tab / Aplikasi Lain
    const handleWindowBlur = () => {
      if (showWarningModalRef.current) return;
      recordViolation('Membuka aplikasi lain atau keluar dari fokus jendela ujian');
    };

    // 3. Deteksi Keluar Layar Penuh (Fullscreen Exit)
    const handleFullscreenChange = () => {
      if (Date.now() - examStartedTimeRef.current < 2500) return;
      if (!document.fullscreenElement && examStarted && !isDisqualifiedRef.current && !resultSummary && !showWarningModalRef.current) {
        recordViolation('Keluar dari mode Layar Penuh (Fullscreen)');
      }
    };

    // 4. Mencegah & Mendeteksi Copy, Cut, Paste
    const handleCopy = (e) => {
      e.preventDefault();
      recordViolation('Mencoba menyalin (Copy) teks naskah soal');
    };

    const handleCut = (e) => {
      e.preventDefault();
      recordViolation('Mencoba memotong (Cut) teks ujian');
    };

    const handlePaste = (e) => {
      e.preventDefault();
      recordViolation('Mencoba menempel (Paste) teks dari luar');
    };

    // 5. Mencegah Klik Kanan
    const handleContextMenu = (e) => {
      e.preventDefault();
      recordViolation('Mencoba melakukan Klik Kanan pada lembar soal');
    };

    // 6. Mencegah Tombol Pintas Keyboard (Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A, F12, dsb)
    const handleKeyDown = (e) => {
      const key = e.key?.toLowerCase();
      const ctrlOrMeta = e.ctrlKey || e.metaKey;

      // Blokir F12 & DevTools
      if (e.key === 'F12' || (ctrlOrMeta && e.shiftKey && (key === 'i' || key === 'j' || key === 'c'))) {
        e.preventDefault();
        recordViolation('Mencoba membuka Developer Tools browser');
        return;
      }

      // Blokir Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A, Ctrl+U, Ctrl+P
      if (ctrlOrMeta && ['c', 'v', 'x', 'a', 'u', 'p'].includes(key)) {
        e.preventDefault();
        recordViolation(`Mencoba menggunakan tombol pintas keyboard (Ctrl+${key.toUpperCase()})`);
        return;
      }
    };

    // 7. Mencegah Keluar Halaman Tanpa Sengaja
    const handleBeforeUnload = (e) => {
      if (examStarted && !isDisqualifiedRef.current && !resultSummary) {
        e.preventDefault();
        e.returnValue = 'Ujian sedang berlangsung! Jika Anda meninggalkan halaman ini, ujian Anda akan diserahkan.';
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [examStarted, isDisqualified, resultSummary]);

  // Fungsi Mulai Ujian & Masuk Layar Penuh
  const handleStartExam = async () => {
    examStartedTimeRef.current = Date.now();
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (e) {
      console.warn('Fullscreen tidak didukung atau dibatalkan:', e);
    }
    setExamStarted(true);
  };

  // Fungsi Melanjutkan Ujian Setelah Peringatan
  const handleAcknowledgeWarning = async () => {
    showWarningModalRef.current = false;
    setShowWarningModal(false);
    examStartedTimeRef.current = Date.now();

    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (e) {}
  };

  // Fungsi Pengumpulan Ujian Akhir
  const handleSubmitFinal = async () => {
    if (submitting || resultSummary || isDisqualifiedRef.current) return;
    setShowConfirmModal(false);
    setSubmitting(true);

    try {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    } catch (e) {}

    try {
      const res = await submitUlanganJawaban({
        ulanganId,
        jawaban_pg: jawabanPgRef.current,
        jawaban_essay: jawabanEssayRef.current,
      });

      if (res.success && res.hasil) {
        setResultSummary(res.hasil);
      } else {
        alert(res.message || 'Gagal mengirim ujian.');
      }
    } catch (err) {
      alert('Terjadi kesalahan saat mengirim jawaban.');
    } finally {
      setSubmitting(false);
    }
  };

  // Timer Countdown Effect
  useEffect(() => {
    if (!examStarted || timeLeft === null || resultSummary || isDisqualified) return;

    if (timeLeft <= 0) {
      handleSubmitFinal();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return null;
        return prev > 0 ? prev - 1 : 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, timeLeft, resultSummary, isDisqualified]);

  const handleSelectPg = (num, opt) => {
    if (isDisqualified) return;
    setJawabanPg((prev) => ({
      ...prev,
      [num]: opt,
    }));
  };

  const handleChangeEssay = (num, text) => {
    if (isDisqualified) return;
    setJawabanEssay((prev) => ({
      ...prev,
      [num]: text,
    }));
  };

  const handleToggleRagu = (num) => {
    if (isDisqualified) return;
    setRaguMap((prev) => ({
      ...prev,
      [num]: !prev[num],
    }));
  };

  // Format MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-blue-600" size={36} />
        <p className="text-xs font-bold text-slate-500">Mempersiapkan Ruang Ujian CBT...</p>
      </div>
    );
  }

  const isPdfExam = exam?.tipe_ujian === 'pdf';
  const hasExtractedWebQuestions = (exam?.soal_pg?.length > 0) || (exam?.soal_essay?.length > 0);
  const hasContent = hasExtractedWebQuestions || Boolean(exam?.file_pdf_url) || (soalList.length > 0);

  if (!exam || !hasContent) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 max-w-lg mx-auto mt-10 shadow-sm">
        <AlertTriangle size={36} className="mx-auto text-amber-500" />
        <h3 className="text-base font-black text-slate-800">
          Ujian Belum Memiliki Naskah Soal atau Butir Soal
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Ujian ini belum memiliki file naskah PDF atau butir soal yang diunggah oleh guru pengampu.
        </p>
        <Link
          href="/siswa/ulangan"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition"
        >
          Kembali ke Daftar Ujian
        </Link>
      </div>
    );
  }

  // ========================================================
  // TAMPILAN DISKUALIFIKASI (JIKA PELANGGARAN > 3 KALI)
  // ========================================================
  if (isDisqualified) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border-2 border-rose-500 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in duration-300">
          <div className="w-24 h-24 mx-auto rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-inner">
            <Ban size={48} className="animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="bg-rose-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-xs">
              Status: Didiskualifikasi
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              UJIAN DIBATALKAN!
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {exam.judul} ({exam.mapel})
            </p>
          </div>

          <div className="p-5 bg-rose-50/80 rounded-2xl border border-rose-200 text-left space-y-3">
            <div className="flex items-center justify-between border-b border-rose-200/60 pb-2">
              <span className="text-[11px] font-bold text-slate-600">Nilai Akhir:</span>
              <span className="text-2xl font-black text-rose-600">0</span>
            </div>
            <div className="flex items-center justify-between border-b border-rose-200/60 pb-2">
              <span className="text-[11px] font-bold text-slate-600">Total Pelanggaran:</span>
              <span className="text-xs font-black text-rose-700">{warningCount}x (Batas: 3x)</span>
            </div>
            <p className="text-[11px] text-rose-800 leading-relaxed font-semibold">
              ⚠️ Anda telah terdeteksi melakukan pelanggaran tata tertib ujian lebih dari 3 kali ({lastViolationReason}). Seluruh jawaban Anda telah dibatalkan oleh sistem dan nilai ujian tercatat sebagai 0.
            </p>
          </div>

          <Link
            href="/siswa/ulangan"
            className="block w-full bg-slate-900 hover:bg-black text-white font-black text-xs py-3.5 rounded-2xl shadow-md transition text-center"
          >
            Kembali ke Daftar Ujian
          </Link>
        </div>
      </div>
    );
  }

  // ========================================================
  // MODAL SKOR HASIL UJIAN SETELAH SELESAI NORMAL
  // ========================================================
  if (resultSummary) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-3xl border-2 border-emerald-200 shadow-2xl text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
          <Trophy size={40} />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-800">Ujian Berhasil Dikumpulkan!</h2>
          <p className="text-xs text-slate-500 font-medium">{exam.judul}</p>
        </div>

        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Nilai Pilihan Ganda (Otomatis)
          </p>
          <p className="text-5xl font-black text-emerald-600 tracking-tight">
            {resultSummary.nilai}
          </p>
          <div className="flex justify-center gap-6 pt-2 text-xs font-bold">
            <span className="text-emerald-700">Benar: {resultSummary.totalBenar}</span>
            <span className="text-rose-600">Salah: {resultSummary.totalSalah}</span>
            <span className="text-slate-600">Total PG: {resultSummary.totalSoalPG} Butir</span>
          </div>

          {resultSummary.hasEssay && (
            <div className="mt-3 pt-3 border-t border-slate-200 text-xs font-bold text-rose-700 bg-rose-50 p-2.5 rounded-xl text-center">
              ✓ {resultSummary.totalSoalEssay} Jawaban Essay Anda telah tersimpan dan dikirim ke guru untuk dikoreksi.
            </div>
          )}
        </div>

        <Link
          href="/siswa/hasil-ulangan"
          className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3.5 rounded-2xl shadow-md transition text-center"
        >
          Lihat Riwayat &amp; Rekapitulasi Nilai &rarr;
        </Link>
      </div>
    );
  }

  // ========================================================
  // MODAL AWAL: TATA TERTIB & MASUK LAYAR PENUH (FULLSCREEN)
  // ========================================================
  if (!examStarted) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
              <ShieldAlert size={34} />
            </div>
            <div>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Mode Ujian Terproteksi (CBT Secure)
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-2">
                Tata Tertib &amp; Pengawasan Ujian
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {exam.judul} &bull; {exam.mapel} (Kelas {exam.kelas})
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs space-y-3 font-semibold text-slate-700">
            <p className="font-extrabold text-slate-900 flex items-center gap-1.5 text-xs text-rose-700">
              <AlertTriangle size={15} /> PERATURAN KETAT SELAMA UJIAN:
            </p>
            <ul className="space-y-2 text-[11px] list-disc list-inside leading-relaxed text-slate-600">
              <li>
                <strong className="text-slate-800">Layar Penuh (Fullscreen):</strong> Ujian wajib dikerjakan dalam mode layar penuh.
              </li>
              <li>
                <strong className="text-slate-800">Dilarang Membuka Tab / Aplikasi Lain:</strong> Sistem akan mendeteksi setiap kali Anda berpindah tab atau keluar layar (Alt+Tab).
              </li>
              <li>
                <strong className="text-slate-800">Dilarang Copy-Paste &amp; Klik Kanan:</strong> Tindakan menyalin atau menempel teks soal dilarang keras.
              </li>
              <li>
                <strong className="text-rose-600">Batas Toleransi: Maksimal 3x Peringatan!</strong>
              </li>
              <li>
                <strong className="text-rose-700 bg-rose-50 px-1 py-0.5 rounded">
                  Pelanggaran ke-4 akan LANGSUNG DIDISKUALIFIKASI dan Nilai Ujian Otomatis 0!
                </strong>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={handleStartExam}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-xs py-4 rounded-2xl shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Maximize2 size={16} />
              <span>Mulai Ujian Sekarang (Masuk Layar Penuh)</span>
            </button>
            <Link
              href="/siswa/ulangan"
              className="block w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2.5 rounded-xl transition text-center"
            >
              Batal / Kembali ke Daftar
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const answeredPgCount = Object.keys(jawabanPg).filter((k) => Boolean(jawabanPg[k])).length;
  const answeredEssayCount = Object.keys(jawabanEssay).filter((k) => Boolean(jawabanEssay[k]?.trim())).length;
  const totalPgCount = exam.soal_pg?.length || 0;
  const totalEssayCount = exam.soal_essay?.length || 0;
  const isTimeCritical = timeLeft !== null && timeLeft < 300;

  return (
    <div className="max-w-7xl mx-auto space-y-5 select-none" onContextMenu={(e) => e.preventDefault()}>
      {/* Top Bar Ruang Ujian */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-4 sticky top-4 z-40 shadow-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0">
            <FileText size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-blue-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-md uppercase">
                {exam.mapel} &bull; Kelas {exam.kelas}
              </span>
              <span className="bg-rose-500/20 text-rose-300 text-[9px] font-black px-2 py-0.5 rounded-md">
                PG ({totalPgCount}) &bull; Essay ({totalEssayCount})
              </span>

              {/* Status Peringatan Pelanggaran */}
              <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-md flex items-center gap-1 ${
                warningCount === 0 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : warningCount === 1 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : warningCount === 2
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 animate-pulse'
                  : 'bg-rose-500/30 text-rose-300 border border-rose-500/60 animate-bounce'
              }`}>
                <ShieldAlert size={11} />
                <span>Peringatan: {warningCount}/3</span>
              </span>
            </div>

            <h2 className="text-sm sm:text-base font-extrabold mt-0.5 truncate max-w-md text-white">
              {exam.judul}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status terisi */}
          <div className="hidden sm:block text-right text-xs font-bold text-slate-300">
            <span>PG: {answeredPgCount}/{totalPgCount}</span>
            {totalEssayCount > 0 && <span className="ml-2 text-rose-400">Essay: {answeredEssayCount}/{totalEssayCount}</span>}
          </div>

          {/* Timer Box */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-mono text-sm sm:text-base font-black shadow-inner ${
            isTimeCritical 
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse' 
              : 'bg-slate-800 text-amber-400 border border-slate-700/50'
          }`}>
            <Clock size={18} />
            <span>{timeLeft !== null ? formatTime(timeLeft) : '--:--'}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs px-4 py-2.5 rounded-2xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <Send size={15} />
            <span className="hidden sm:inline">Kumpulkan</span>
          </button>
        </div>
      </div>

      {/* Tampilan Utama Soal di Web */}
      {hasExtractedWebQuestions ? (
        <div className="space-y-6">
          {/* Modal / Panel Naskah PDF Asli jika siswa ingin melihat PDF */}
          {showPdfPanel && exam.file_pdf_url && (
            <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 rounded-3xl max-w-5xl w-full h-[85vh] flex flex-col shadow-2xl border border-slate-700 overflow-hidden">
                <div className="p-4 bg-slate-800 flex justify-between items-center text-white border-b border-slate-700">
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-rose-400" />
                    <span className="text-xs font-black">Naskah Asli PDF: {exam.judul}</span>
                  </div>
                  <button
                    onClick={() => setShowPdfPanel(false)}
                    className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                  >
                    Tutup Naskah (Kembali ke Lembar Soal) &times;
                  </button>
                </div>
                <div className="flex-1 p-2">
                  <PdfViewer url={exam.file_pdf_url} title={exam.judul} />
                </div>
              </div>
            </div>
          )}

          {/* Web Questions Component (PG & Essay) */}
          <WebExamQuestionsView
            examTitle={exam.judul}
            mapel={exam.mapel}
            kelas={exam.kelas}
            soalPg={exam.soal_pg || []}
            soalEssay={exam.soal_essay || []}
            jawabanPg={jawabanPg}
            onSelectPg={handleSelectPg}
            jawabanEssay={jawabanEssay}
            onChangeEssay={handleChangeEssay}
            raguMap={raguMap}
            onToggleRagu={handleToggleRagu}
            onSubmit={() => setShowConfirmModal(true)}
            submitting={submitting}
            onTogglePdf={() => setShowPdfPanel(!showPdfPanel)}
            showPdfToggle={Boolean(exam.file_pdf_url)}
            pdfVisible={showPdfPanel}
          />
        </div>
      ) : (
        /* Fallback jika hanya file PDF murni tanpa ekstraksi teks */
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 h-[78vh] min-h-[580px]">
            <PdfViewer url={exam.file_pdf_url} title={exam.judul} allowDownload={true} className="h-full" />
          </div>
          <div className="lg:col-span-4 h-[78vh] min-h-[580px]">
            <DigitalAnswerSheet
              totalQuestions={exam.total_soal_pdf || 10}
              options={['A', 'B', 'C', 'D']}
              answers={jawabanPg}
              onAnswerChange={handleSelectPg}
              raguMap={raguMap}
              onRaguToggle={handleToggleRagu}
              onSubmit={() => setShowConfirmModal(true)}
              submitting={submitting}
            />
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL PERINGATAN PELANGGARAN KECURANGAN (1, 2, 3)         */}
      {/* ======================================================== */}
      {showWarningModal && !isDisqualified && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl border-4 border-rose-500 text-center">
            <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto border-2 border-rose-300 animate-bounce">
              <ShieldAlert size={36} />
            </div>

            <div className="space-y-1">
              <span className="bg-rose-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Peringatan {warningCount} dari 3
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-2">
                Peringatan Pelanggaran Terdeteksi!
              </h3>
            </div>

            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-left space-y-2">
              <p className="text-[11px] font-bold text-rose-900">
                Aksi yang Terdeteksi:
              </p>
              <p className="text-xs font-black text-rose-700 bg-white p-2.5 rounded-xl border border-rose-200">
                "{lastViolationReason}"
              </p>
              <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
                Anda dilarang berpindah tab, keluar dari layar penuh, membuka aplikasi lain, atau menyalin/menempel teks.
              </p>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs font-black text-amber-900">
              {warningCount < 3 ? (
                <span>⚠️ Sisa Kesempatan: <strong className="text-rose-600 font-black">{3 - warningCount} kali lagi</strong> sebelum diskualifikasi otomatis.</span>
              ) : (
                <span className="text-rose-600 animate-pulse">🚨 INI ADALAH PERINGATAN TERAKHIR! 1 pelanggaran lagi Anda akan LANGSUNG DIDISKUALIFIKASI!</span>
              )}
            </div>

            <button
              type="button"
              onClick={handleAcknowledgeWarning}
              className="w-full bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-xs py-3.5 rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Maximize2 size={15} />
              <span>Saya Mengerti &amp; Kembali ke Layar Penuh Ujian</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Pengumpulan Ujian Normal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle size={26} />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-800">Kumpulkan Ujian Sekarang?</h3>
              <div className="text-xs text-slate-500 space-y-1 pt-1">
                <p>
                  Soal Pilihan Ganda Terjawab:{' '}
                  <strong className="text-slate-800">{answeredPgCount}</strong> dari{' '}
                  <strong className="text-slate-800">{totalPgCount}</strong> butir
                </p>
                {totalEssayCount > 0 && (
                  <p>
                    Soal Essay Terisi:{' '}
                    <strong className="text-slate-800">{answeredEssayCount}</strong> dari{' '}
                    <strong className="text-slate-800">{totalEssayCount}</strong> butir
                  </p>
                )}
                {Object.values(raguMap).filter(Boolean).length > 0 && (
                  <p className="text-amber-600 font-bold">
                    ({Object.values(raguMap).filter(Boolean).length} soal masih bertanda ragu-ragu)
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 cursor-pointer"
              >
                Periksa Lagi
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmitFinal}
                className="flex-1 py-3 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : 'Ya, Kumpulkan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
