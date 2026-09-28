"use client";
import React, { useState, useEffect, use, useRef } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Plus, Edit2, Trash2, HelpCircle, 
  CheckCircle2, Loader2, X, AlertCircle, FileText,
  UploadCloud, Sparkles, Save, Eye, Check, Edit3, Trash
} from 'lucide-react';
import Topbar from '@/components/portal/Topbar';
import { getUlanganById, getSoalList, saveSoal, deleteSoal, saveUlangan, reextractExamFromPdf } from '@/backend/actions/ulanganActions';
import PdfViewer from '@/components/portal/PdfViewer';

export default function AdminBankSoalPage({ params }) {
  const unwrappedParams = use(params);
  const ulanganId = unwrappedParams.id;

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active section tab ('pg', 'essay')
  const [activeTab, setActiveTab] = useState('pg');

  // PDF Exam State
  const [soalPg, setSoalPg] = useState([]);
  const [soalEssay, setSoalEssay] = useState([]);
  const [savingPdfExam, setSavingPdfExam] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef(null);

  // Edit Modal State (for editing a specific PG or Essay question)
  const [editingItem, setEditingItem] = useState(null); // { type: 'pg' | 'essay', item: {...} }

  const loadData = async () => {
    setLoading(true);
    try {
      const [resExam, resSoal] = await Promise.all([
        getUlanganById(ulanganId, false),
        getSoalList(ulanganId, false),
      ]);

      if (resExam.success && resExam.data) {
        let ex = resExam.data;

        // Jika ujian PDF belum terekstrak butirnya, jalankan ekstraksi otomatis di latar
        if (ex.tipe_ujian === 'pdf' && ex.file_pdf_url && (!ex.soal_pg || ex.soal_pg.length === 0)) {
          try {
            const reExt = await reextractExamFromPdf(ulanganId);
            if (reExt.success && reExt.soal_pg) {
              ex.soal_pg = reExt.soal_pg;
              ex.soal_essay = reExt.soal_essay || [];
            }
          } catch (e) {}
        }

        setExam(ex);
        setSoalPg(ex.soal_pg || []);
        setSoalEssay(ex.soal_essay || []);
      }

      if (resSoal.success) setQuestions(resSoal.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [ulanganId]);

  // Upload replace PDF and re-extract
  const handleReplacePdf = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('File harus berupa dokumen PDF (.pdf)');
      return;
    }

    setUploadingPdf(true);
    try {
      const data = new FormData();
      data.append('file', file);

      const res = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: data,
      });
      const result = await res.json();

      if (result.success) {
        setExam((prev) => ({
          ...prev,
          file_pdf_url: result.url,
          file_pdf_nama: result.fileName,
          file_pdf_size: result.fileSize,
        }));
        if (result.soal_pg?.length > 0) setSoalPg(result.soal_pg);
        if (result.soal_essay?.length > 0) setSoalEssay(result.soal_essay);
        alert(`Berhasil mengekstrak ${result.total_pg} soal PG dan ${result.total_essay} soal Essay dari PDF.`);
      } else {
        alert(result.message || 'Gagal mengunggah file.');
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan saat upload.');
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleKeyChangePg = (num, opt) => {
    setSoalPg((prev) =>
      prev.map((q) => (q.nomor === num ? { ...q, kunci_jawaban: opt } : q))
    );
  };

  const handleDeletePg = (num) => {
    if (!confirm(`Hapus soal PG nomor ${num}?`)) return;
    setSoalPg((prev) => {
      const filtered = prev.filter((q) => q.nomor !== num);
      return filtered.map((q, idx) => ({ ...q, nomor: idx + 1 }));
    });
  };

  const handleDeleteEssay = (num) => {
    if (!confirm(`Hapus soal Essay nomor ${num}?`)) return;
    setSoalEssay((prev) => {
      const filtered = prev.filter((e) => e.nomor !== num);
      return filtered.map((e, idx) => ({ ...e, nomor: idx + 1 }));
    });
  };

  const handleAutoExtract = async () => {
    setExtracting(true);
    try {
      const res = await reextractExamFromPdf(ulanganId);
      if (res.success) {
        if (res.soal_pg?.length > 0) setSoalPg(res.soal_pg);
        if (res.soal_essay?.length > 0) setSoalEssay(res.soal_essay);
        alert(res.message || `Berhasil mengekstrak ${res.total_pg} soal PG dan ${res.total_essay} soal Essay dari PDF!`);
        await loadData();
      } else {
        alert(res.message || 'Gagal mengekstrak soal dari PDF.');
      }
    } catch (err) {
      alert('Terjadi kesalahan saat mengekstrak soal.');
    } finally {
      setExtracting(false);
    }
  };

  const handleSaveExamQuestions = async () => {
    setSavingPdfExam(true);
    setSaveSuccess(false);

    try {
      const keysMap = {};
      soalPg.forEach((q) => {
        keysMap[q.nomor] = q.kunci_jawaban || 'A';
      });

      const payload = {
        ...exam,
        soal_pg: soalPg,
        soal_essay: soalEssay,
        total_soal_pdf: soalPg.length,
        kunci_jawaban_pdf: keysMap,
      };

      const res = await saveUlangan(payload);
      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        loadData();
      } else {
        alert(res.message || 'Gagal menyimpan perubahan.');
      }
    } catch (err) {
      alert('Terjadi kesalahan saat menyimpan.');
    } finally {
      setSavingPdfExam(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <Loader2 className="animate-spin mx-auto text-blue-600 mb-2" size={32} />
        <p className="text-xs font-bold">Memuat bank soal...</p>
      </div>
    );
  }

  const isPdfExam = exam?.tipe_ujian === 'pdf';

  return (
    <div className="space-y-8 max-w-6xl">
      <Topbar
        title="Manajemen Butir Soal (PG & Essay)"
        subtitle={exam ? `${exam.judul} (${exam.mapel} - Kelas ${exam.kelas})` : 'Memuat data...'}
      />

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <Link
          href="/admin/ulangan"
          className="inline-flex items-center gap-1.5 text-blue-600 hover:gap-2 transition-all text-xs font-bold"
        >
          <ArrowLeft size={16} /> Kembali ke Daftar Ulangan
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {exam?.file_pdf_url && (
            <>
              <button
                type="button"
                onClick={handleAutoExtract}
                disabled={extracting}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              >
                {extracting ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                <span>{extracting ? 'Mengekstrak...' : '⚡ Ekstrak Otomatis Soal PDF'}</span>
              </button>

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,application/pdf"
                  onChange={handleReplacePdf}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPdf}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <UploadCloud size={15} />
                  <span>{uploadingPdf ? 'Mengekstrak...' : 'Ganti PDF'}</span>
                </button>
              </div>
            </>
          )}

          <button
            type="button"
            disabled={savingPdfExam}
            onClick={handleSaveExamQuestions}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-black px-5 py-2 rounded-xl shadow-sm transition cursor-pointer disabled:opacity-50"
          >
            {savingPdfExam ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : saveSuccess ? (
              <>
                <Check size={15} />
                <span>Tersimpan!</span>
              </>
            ) : (
              <>
                <Save size={15} />
                <span>Simpan Perubahan Soal</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Layout: Split Screen */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Naskah Soal PDF Asli */}
        <div className="lg:col-span-5 space-y-4">
          <div className="h-[72vh] min-h-[580px]">
            <PdfViewer
              url={exam?.file_pdf_url}
              title={exam?.judul || 'Naskah Soal PDF'}
              allowDownload={true}
              className="h-full"
            />
          </div>
        </div>

        {/* Kolom Kanan: Editor Soal PG & Essay di Web */}
        <div className="lg:col-span-7 space-y-5">
          {/* Banner Peringatan jika belum ada soal tapi ada file PDF */}
          {soalPg.length === 0 && soalEssay.length === 0 && exam?.file_pdf_url && (
            <div className="bg-amber-50 border-2 border-amber-300 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertCircle size={28} className="text-amber-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-black text-amber-900">Butir Soal Web Belum Terekstrak</h4>
                  <p className="text-[11px] text-amber-700">File PDF tersedia. Klik tombol di samping untuk mengekstrak seluruh butir PG dan Essay secara otomatis ke tampilan web.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAutoExtract}
                disabled={extracting}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-black rounded-xl shadow-md transition flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
              >
                {extracting ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                <span>Ekstrak Sekarang</span>
              </button>
            </div>
          )}

          {/* Tabs: Pilihan Ganda vs Essay */}
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab('pg')}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'pg'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 size={16} />
              <span>Soal Pilihan Ganda ({soalPg.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('essay')}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'essay'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 size={16} />
              <span>Soal Essay / Uraian ({soalEssay.length})</span>
            </button>
          </div>

          {/* Konten Tab 1: Soal Pilihan Ganda */}
          {activeTab === 'pg' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-bold text-slate-500">
                  Daftar Pertanyaan &amp; Kunci Jawaban Pilihan Ganda:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const nextNum = soalPg.length + 1;
                    setSoalPg([
                      ...soalPg,
                      {
                        nomor: nextNum,
                        pertanyaan: `Pertanyaan Pilihan Ganda Baru #${nextNum}`,
                        pilihan_a: '',
                        pilihan_b: '',
                        pilihan_c: '',
                        pilihan_d: '',
                        kunci_jawaban: 'A',
                        bobot: 10,
                      },
                    ]);
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  + Tambah Butir PG
                </button>
              </div>

              <div className="space-y-3 max-h-[62vh] overflow-y-auto pr-1">
                {soalPg.map((q) => (
                  <div
                    key={q.nomor}
                    className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 font-black text-xs flex items-center justify-center shrink-0">
                        {q.nomor}
                      </span>

                      <div className="flex-1 min-w-0">
                        <textarea
                          rows={2}
                          value={q.pertanyaan}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSoalPg((prev) =>
                              prev.map((item) =>
                                item.nomor === q.nomor ? { ...item, pertanyaan: val } : item
                              )
                            );
                          }}
                          className="w-full text-xs font-bold text-slate-800 p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeletePg(q.nomor)}
                        className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Opsi Jawaban A, B, C, D */}
                    <div className="grid sm:grid-cols-2 gap-2 text-xs">
                      {['a', 'b', 'c', 'd'].map((opt) => (
                        <div key={opt} className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0 uppercase">
                            {opt}
                          </span>
                          <input
                            type="text"
                            value={q[`pilihan_${opt}`] || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSoalPg((prev) =>
                                prev.map((item) =>
                                  item.nomor === q.nomor ? { ...item, [`pilihan_${opt}`]: val } : item
                                )
                              );
                            }}
                            className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-xs font-medium"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Kunci Jawaban */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-500">Kunci Jawaban Benar:</span>
                      <div className="flex gap-1">
                        {['A', 'B', 'C', 'D'].map((opt) => {
                          const isKey = q.kunci_jawaban === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleKeyChangePg(q.nomor, opt)}
                              className={`w-7 h-7 rounded-xl font-black text-xs transition cursor-pointer ${
                                isKey
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}

                {soalPg.length === 0 && (
                  <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center text-slate-400 text-xs font-bold">
                    Belum ada butir soal Pilihan Ganda. Klik tombol "+ Tambah Butir PG" di atas.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Konten Tab 2: Soal Essay / Uraian */}
          {activeTab === 'essay' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-bold text-slate-500">
                  Daftar Pertanyaan Soal Essay / Uraian:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const nextNum = soalEssay.length + 1;
                    setSoalEssay([
                      ...soalEssay,
                      {
                        nomor: nextNum,
                        pertanyaan: `Pertanyaan Essay Baru #${nextNum}`,
                        bobot: 20,
                      },
                    ]);
                  }}
                  className="text-xs font-bold text-rose-600 hover:text-rose-800 cursor-pointer"
                >
                  + Tambah Butir Essay
                </button>
              </div>

              <div className="space-y-3 max-h-[62vh] overflow-y-auto pr-1">
                {soalEssay.map((eq) => (
                  <div
                    key={eq.nomor}
                    className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="w-8 h-8 rounded-xl bg-rose-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                        E{eq.nomor}
                      </span>

                      <div className="flex-1 min-w-0">
                        <textarea
                          rows={3}
                          value={eq.pertanyaan}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSoalEssay((prev) =>
                              prev.map((item) =>
                                item.nomor === eq.nomor ? { ...item, pertanyaan: val } : item
                              )
                            );
                          }}
                          className="w-full text-xs font-bold text-slate-800 p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500 leading-relaxed"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteEssay(eq.nomor)}
                        className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-500">Bobot Nilai Maksimal:</span>
                      <div className="flex items-center gap-1.5 font-bold">
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={eq.bobot || 20}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 10;
                            setSoalEssay((prev) =>
                              prev.map((item) =>
                                item.nomor === eq.nomor ? { ...item, bobot: val } : item
                              )
                            );
                          }}
                          className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs font-bold"
                        />
                        <span className="text-slate-400 text-[11px]">Poin</span>
                      </div>
                    </div>
                  </div>
                ))}

                {soalEssay.length === 0 && (
                  <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center text-slate-400 text-xs font-bold">
                    Belum ada butir soal Essay / Uraian. Klik "+ Tambah Butir Essay" di atas.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
