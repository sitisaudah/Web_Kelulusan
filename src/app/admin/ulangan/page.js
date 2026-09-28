"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  BookOpen, Plus, Edit2, Trash2, Clock, 
  HelpCircle, CheckCircle2, XCircle, Loader2, X,
  FileText, UploadCloud, Eye, Check, ExternalLink,
  Sparkles, Layers, Edit3, Trash
} from 'lucide-react';
import Topbar from '@/components/portal/Topbar';
import { getUlanganList, saveUlangan, deleteUlangan } from '@/backend/actions/ulanganActions';
import PdfViewer from '@/components/portal/PdfViewer';

export default function AdminUlanganPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewPdfModal, setPreviewPdfModal] = useState(null);
  const [editingExam, setEditingExam] = useState(null);
  
  // Upload State
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  // Active tab inside modal for reviewing extracted items ('pg', 'essay', 'pdf')
  const [modalTab, setModalTab] = useState('pg');

  // Form State
  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    mapel: 'IPA',
    kelas: 'IX',
    durasi_menit: 60,
    is_active: true,
    tipe_ujian: 'pdf',
    file_pdf_url: '',
    file_pdf_nama: '',
    file_pdf_size: '',
    total_soal_pdf: 0,
    opsi_jawaban: 'ABCD',
    kunci_jawaban_pdf: {},
    bobot_per_soal: 10,
    soal_pg: [],
    soal_essay: [],
  });

  const [modalLoading, setModalLoading] = useState(false);

  const loadExams = async () => {
    setLoading(true);
    try {
      const res = await getUlanganList();
      if (res.success) {
        setExams(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  const handleOpenAdd = (type = 'pdf') => {
    setEditingExam(null);
    setUploadError('');
    setModalTab('pg');

    setFormData({
      judul: '',
      deskripsi: '',
      mapel: 'IPA',
      kelas: 'IX',
      durasi_menit: 60,
      is_active: true,
      tipe_ujian: type,
      file_pdf_url: '',
      file_pdf_nama: '',
      file_pdf_size: '',
      total_soal_pdf: 0,
      opsi_jawaban: 'ABCD',
      kunci_jawaban_pdf: {},
      bobot_per_soal: 10,
      soal_pg: [],
      soal_essay: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exam) => {
    setEditingExam(exam);
    setUploadError('');
    setModalTab('pg');

    setFormData({
      id: exam.id,
      judul: exam.judul,
      deskripsi: exam.deskripsi || '',
      mapel: exam.mapel,
      kelas: exam.kelas,
      durasi_menit: exam.durasi_menit,
      is_active: exam.is_active,
      tipe_ujian: exam.tipe_ujian || 'manual',
      file_pdf_url: exam.file_pdf_url || '',
      file_pdf_nama: exam.file_pdf_nama || '',
      file_pdf_size: exam.file_pdf_size || '',
      total_soal_pdf: exam.total_soal_pdf || exam.soal_pg?.length || 0,
      opsi_jawaban: exam.opsi_jawaban || 'ABCD',
      kunci_jawaban_pdf: exam.kunci_jawaban_pdf || {},
      bobot_per_soal: exam.bobot_per_soal || 10,
      soal_pg: exam.soal_pg || [],
      soal_essay: exam.soal_essay || [],
    });
    setIsModalOpen(true);
  };

  // Upload handler via API route with auto-extraction
  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Harap pilih file dokumen berformat PDF.');
      return;
    }

    setUploadingPdf(true);
    setUploadError('');

    try {
      const data = new FormData();
      data.append('file', file);

      const res = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: data,
      });

      const result = await res.json();
      if (result.success) {
        const parsedPg = result.soal_pg || [];
        const parsedEssay = result.soal_essay || [];

        // Buat kunci jawaban awal dari hasil parsing PG
        const keys = {};
        parsedPg.forEach((q) => {
          keys[q.nomor] = q.kunci_jawaban || 'A';
        });

        // Set judul otomatis dari nama file jika judul belum diisi
        const autoTitle = formData.judul 
          ? formData.judul 
          : file.name.replace(/\.pdf$/i, '').replace(/_/g, ' ');

        setFormData((prev) => ({
          ...prev,
          judul: autoTitle,
          file_pdf_url: result.url,
          file_pdf_nama: result.fileName,
          file_pdf_size: result.fileSize,
          soal_pg: parsedPg,
          soal_essay: parsedEssay,
          total_soal_pdf: parsedPg.length,
          kunci_jawaban_pdf: keys,
        }));

        setModalTab(parsedPg.length > 0 ? 'pg' : parsedEssay.length > 0 ? 'essay' : 'pg');
      } else {
        setUploadError(result.message || 'Gagal mengunggah dan mengekstrak file PDF.');
      }
    } catch (err) {
      setUploadError('Terjadi kesalahan jaringan saat mengunggah PDF.');
    } finally {
      setUploadingPdf(false);
    }
  };

  // Ubah kunci jawaban PG
  const handleKeyChange = (questionNum, option) => {
    setFormData((prev) => {
      const updatedKeys = {
        ...prev.kunci_jawaban_pdf,
        [questionNum]: option,
      };

      const updatedPg = prev.soal_pg.map((q) =>
        q.nomor === questionNum ? { ...q, kunci_jawaban: option } : q
      );

      return {
        ...prev,
        kunci_jawaban_pdf: updatedKeys,
        soal_pg: updatedPg,
      };
    });
  };

  // Tambah butir PG manual
  const handleAddPgItem = () => {
    const nextNum = formData.soal_pg.length + 1;
    const newItem = {
      nomor: nextNum,
      pertanyaan: `Pertanyaan Pilihan Ganda Nomor ${nextNum}`,
      pilihan_a: 'Pilihan A',
      pilihan_b: 'Pilihan B',
      pilihan_c: 'Pilihan C',
      pilihan_d: 'Pilihan D',
      kunci_jawaban: 'A',
      bobot: 10,
    };

    setFormData((prev) => ({
      ...prev,
      soal_pg: [...prev.soal_pg, newItem],
      total_soal_pdf: prev.soal_pg.length + 1,
      kunci_jawaban_pdf: { ...prev.kunci_jawaban_pdf, [nextNum]: 'A' },
    }));
  };

  // Tambah butir Essay manual
  const handleAddEssayItem = () => {
    const nextNum = formData.soal_essay.length + 1;
    const newItem = {
      nomor: nextNum,
      pertanyaan: `Jelaskan pertanyaan essay nomor ${nextNum}...`,
      bobot: 20,
    };

    setFormData((prev) => ({
      ...prev,
      soal_essay: [...prev.soal_essay, newItem],
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (formData.tipe_ujian === 'pdf' && !formData.file_pdf_url) {
      alert('Harap unggah naskah soal PDF terlebih dahulu.');
      return;
    }

    setModalLoading(true);

    try {
      const res = await saveUlangan(formData);
      if (res.success) {
        setIsModalOpen(false);
        loadExams();
      } else {
        alert(res.message || 'Gagal menyimpan ulangan.');
      }
    } catch (err) {
      alert('Terjadi kesalahan saat menyimpan.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id, judul) => {
    if (!confirm(`Hapus ulangan: "${judul}" beserta seluruh data naskah dan nilainya?`)) return;

    try {
      const res = await deleteUlangan(id);
      if (res.success) {
        loadExams();
      } else {
        alert(res.message || 'Gagal menghapus.');
      }
    } catch (err) {
      alert('Terjadi kesalahan saat menghapus.');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <Topbar
        title="Manajemen Ujian / CBT"
        subtitle="Kelola Ujian Naskah Soal PDF (Pilihan Ganda & Essay) serta Bank Soal"
      />

      {/* Header Info & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <span>Daftar Ulangan &amp; Asesmen</span>
            <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-black">
              {exams.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Ekstraksi otomatis soal PDF ke tampilan web (Pilihan Ganda &amp; Soal Essay / Uraian).
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => handleOpenAdd('pdf')}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white text-xs font-black px-5 py-3 rounded-2xl shadow-sm transition active:scale-95 cursor-pointer"
          >
            <FileText size={16} /> + Upload Soal PDF
          </button>

          <button
            onClick={() => handleOpenAdd('manual')}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-3 rounded-2xl transition active:scale-95 cursor-pointer"
          >
            <Plus size={16} /> CBT Manual
          </button>
        </div>
      </div>

      {/* Grid Kartu Ulangan */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <Loader2 className="animate-spin mx-auto text-blue-600 mb-2" size={32} />
            <p className="text-xs font-bold">Memuat daftar ujian...</p>
          </div>
        ) : exams.length > 0 ? (
          exams.map((u) => {
            const isPdf = u.tipe_ujian === 'pdf';
            const totalPg = u.soal_pg?.length || u.total_soal_pdf || 0;
            const totalEssay = u.soal_essay?.length || 0;

            return (
              <div
                key={u.id}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-400 transition-all hover:shadow-md group"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="bg-blue-50 text-blue-700 text-[10px] font-extrabold px-2.5 py-1 rounded-lg">
                        {u.mapel}
                      </span>
                      {isPdf ? (
                        <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-black px-2 py-0.5 rounded-lg flex items-center gap-1">
                          <FileText size={11} /> Naskah PDF
                        </span>
                      ) : (
                        <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-black px-2 py-0.5 rounded-lg flex items-center gap-1">
                          <Layers size={11} /> CBT Manual
                        </span>
                      )}
                    </div>

                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        u.is_active
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {u.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-800 text-base leading-snug group-hover:text-blue-600 transition-colors">
                    {u.judul}
                  </h3>

                  {u.deskripsi && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {u.deskripsi}
                    </p>
                  )}

                  {/* Badges Jumlah Soal di Web */}
                  <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-wrap items-center gap-2 text-xs font-bold">
                    {totalPg > 0 && (
                      <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle2 size={11} /> {totalPg} Soal PG
                      </span>
                    )}
                    {totalEssay > 0 && (
                      <span className="bg-rose-100 text-rose-800 text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Edit3 size={11} /> {totalEssay} Soal Essay
                      </span>
                    )}
                    {totalPg === 0 && totalEssay === 0 && (
                      <span className="text-slate-400 text-[10px]">Belum ada soal diekstrak</span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs font-bold text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> {u.durasi_menit} Menit
                    </span>
                    <span>Kelas {u.kelas}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <Link
                    href={`/admin/ulangan/${u.id}/soal`}
                    className="w-full inline-flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-black py-2.5 rounded-xl transition"
                  >
                    <Edit3 size={15} /> Kelola Butir Soal (PG &amp; Essay)
                  </Link>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEdit(u)}
                      className="flex-1 inline-flex items-center justify-center gap-1 text-slate-600 hover:bg-slate-100 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(u.id, u.judul)}
                      className="flex-1 inline-flex items-center justify-center gap-1 text-rose-600 hover:bg-rose-50 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      <Trash2 size={14} /> Hapus
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <BookOpen size={32} />
            </div>
            <h4 className="font-bold text-slate-800 text-base">Belum Ada Ujian / Ulangan</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Klik tombol di atas untuk mengunggah naskah soal PDF yang berisi Pilihan Ganda &amp; Soal Essay.
            </p>
          </div>
        )}
      </div>

      {/* Modal Buat / Edit Ulangan */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full my-6 space-y-5 shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="text-base font-black text-slate-800">
                  {editingExam ? 'Edit Informasi & Butir Soal Ujian' : 'Upload Soal PDF & Kelola Ujian'}
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Ekstraksi otomatis teks soal pilihan ganda dan essay dari naskah PDF ke web.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5 overflow-y-auto pr-1 flex-1 text-xs font-bold">
              {/* Pilihan Format Ujian */}
              <div>
                <label className="block text-slate-600 mb-2">Tipe Format Ujian *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, tipe_ujian: 'pdf' })}
                    className={`p-3.5 rounded-2xl border-2 text-left transition cursor-pointer flex items-start gap-3 ${
                      formData.tipe_ujian === 'pdf'
                        ? 'border-rose-600 bg-rose-50/50 text-rose-950 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${formData.tipe_ujian === 'pdf' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="font-extrabold text-xs">Ujian Naskah PDF (Otomatis)</p>
                      <p className="text-[10px] font-normal text-slate-500 mt-0.5 leading-relaxed">
                        Upload PDF, sistem mengekstrak soal PG dan Essay langsung ke tampilan web.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, tipe_ujian: 'manual' })}
                    className={`p-3.5 rounded-2xl border-2 text-left transition cursor-pointer flex items-start gap-3 ${
                      formData.tipe_ujian === 'manual'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-950 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${formData.tipe_ujian === 'manual' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <Layers size={18} />
                    </div>
                    <div>
                      <p className="font-extrabold text-xs">CBT Manual</p>
                      <p className="text-[10px] font-normal text-slate-500 mt-0.5 leading-relaxed">
                        Ketik pertanyaan &amp; pilihan ganda secara manual.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Area Upload File PDF */}
              {formData.tipe_ujian === 'pdf' && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700 font-extrabold flex items-center gap-1.5">
                      <FileText size={15} className="text-rose-500" />
                      Unggah File Dokumen PDF *
                    </span>
                    {formData.file_pdf_url && (
                      <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        ✓ Berhasil Diekstrak
                      </span>
                    )}
                  </div>

                  <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-4 text-center bg-white transition">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".pdf,application/pdf"
                      onChange={handlePdfUpload}
                      className="hidden"
                    />

                    {formData.file_pdf_url ? (
                      <div className="flex items-center justify-between gap-3 text-left">
                        <div className="flex items-center gap-3 truncate">
                          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                            <FileText size={20} />
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-black text-slate-800 truncate">
                              {formData.file_pdf_nama || 'naskah_soal.pdf'}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">
                              Ukuran: {formData.file_pdf_size || 'PDF'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingPdf}
                            className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold cursor-pointer"
                          >
                            {uploadingPdf ? 'Mengekstrak...' : 'Ganti PDF'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer space-y-2 py-3"
                      >
                        <UploadCloud size={32} className="mx-auto text-blue-500" />
                        <div>
                          <p className="text-xs font-bold text-slate-700">
                            {uploadingPdf ? 'Mengunggah & mengekstrak naskah soal...' : 'Klik untuk memilih naskah soal PDF'}
                          </p>
                          <p className="text-[10px] text-slate-400 font-normal mt-0.5">
                            Sistem akan otomatis mendeteksi soal Pilihan Ganda &amp; Soal Essay dari PDF
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {uploadError && (
                    <p className="text-rose-600 text-[11px] font-bold">{uploadError}</p>
                  )}

                  {/* Preview Hasil Parsing Soal (PG & Essay) */}
                  {(formData.soal_pg?.length > 0 || formData.soal_essay?.length > 0) && (
                    <div className="pt-2 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setModalTab('pg')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                              modalTab === 'pg'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                            }`}
                          >
                            <CheckCircle2 size={13} />
                            <span>Soal Pilihan Ganda ({formData.soal_pg?.length || 0})</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setModalTab('essay')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                              modalTab === 'essay'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                            }`}
                          >
                            <Edit3 size={13} />
                            <span>Soal Essay ({formData.soal_essay?.length || 0})</span>
                          </button>
                        </div>

                        {modalTab === 'pg' && (
                          <button
                            type="button"
                            onClick={handleAddPgItem}
                            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                          >
                            + Tambah Soal PG
                          </button>
                        )}
                        {modalTab === 'essay' && (
                          <button
                            type="button"
                            onClick={handleAddEssayItem}
                            className="text-[11px] font-bold text-rose-600 hover:text-rose-800 cursor-pointer"
                          >
                            + Tambah Soal Essay
                          </button>
                        )}
                      </div>

                      {/* Konten Tab PG */}
                      {modalTab === 'pg' && (
                        <div className="max-h-60 overflow-y-auto space-y-3 p-2 bg-white rounded-2xl border border-slate-200">
                          {formData.soal_pg.map((q, idx) => (
                            <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                              <div className="flex justify-between items-center">
                                <span className="font-black text-slate-700">
                                  No {q.nomor}. Kunci Jawaban:
                                </span>
                                <div className="flex gap-1">
                                  {['A', 'B', 'C', 'D'].map((opt) => {
                                    const isKey = (q.kunci_jawaban || formData.kunci_jawaban_pdf[q.nomor]) === opt;
                                    return (
                                      <button
                                        key={opt}
                                        type="button"
                                        onClick={() => handleKeyChange(q.nomor, opt)}
                                        className={`w-6 h-6 rounded-lg text-xs font-black transition cursor-pointer ${
                                          isKey ? 'bg-blue-600 text-white' : 'bg-white border text-slate-600 hover:bg-slate-200'
                                        }`}
                                      >
                                        {opt}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                              <p className="text-slate-800 font-medium line-clamp-2">
                                {q.pertanyaan}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Konten Tab Essay */}
                      {modalTab === 'essay' && (
                        <div className="max-h-60 overflow-y-auto space-y-3 p-2 bg-white rounded-2xl border border-slate-200">
                          {formData.soal_essay.map((eq, idx) => (
                            <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                              <div className="flex justify-between items-center">
                                <span className="font-black text-rose-700">
                                  Essay No {eq.nomor}
                                </span>
                                <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-bold">
                                  Bobot: {eq.bobot || 20} Poin
                                </span>
                              </div>
                              <p className="text-slate-800 font-medium">
                                {eq.pertanyaan}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Data Umum Ulangan */}
              <div>
                <label className="block text-slate-600 mb-1">Judul Ulangan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Asesmen Sumatif IPA Kelas IX"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 mb-1">Mata Pelajaran *</label>
                  <select
                    value={formData.mapel}
                    onChange={(e) => setFormData({ ...formData, mapel: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                  >
                    <option value="IPA">Ilmu Pengetahuan Alam (IPA)</option>
                    <option value="Matematika">Matematika</option>
                    <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                    <option value="Bahasa Inggris">Bahasa Inggris</option>
                    <option value="IPS">Ilmu Pengetahuan Sosial (IPS)</option>
                    <option value="PPKn">PPKn</option>
                    <option value="PAI">Pendidikan Agama Islam</option>
                    <option value="PJOK">PJOK</option>
                    <option value="Seni Budaya">Seni Budaya</option>
                    <option value="Informatika">Informatika / TIK</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Tingkat Kelas *</label>
                  <select
                    value={formData.kelas}
                    onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                  >
                    <option value="IX">Kelas IX (Sembilan)</option>
                    <option value="VIII">Kelas VIII (Delapan)</option>
                    <option value="VII">Kelas VII (Tujuh)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Durasi Pengerjaan (Menit) *</label>
                <input
                  type="number"
                  required
                  min={5}
                  max={240}
                  value={formData.durasi_menit}
                  onChange={(e) => setFormData({ ...formData, durasi_menit: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Deskripsi / Petunjuk Ujian</label>
                <textarea
                  rows={2}
                  placeholder="Petunjuk khusus bagi siswa..."
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600"
                />
                <label htmlFor="isActiveCheck" className="text-xs text-slate-700 cursor-pointer">
                  Aktifkan ulangan agar langsung dapat dikerjakan siswa
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={modalLoading || uploadingPdf}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  {modalLoading ? <Loader2 size={14} className="animate-spin" /> : 'Simpan Ujian'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
