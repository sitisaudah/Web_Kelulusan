"use client";
import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, Filter, Download, Search, 
  Trophy, CheckCircle2, XCircle, Loader2, Edit3, X, Save, Check
} from 'lucide-react';
import Topbar from '@/components/portal/Topbar';
import { getAllHasilUlangan, getUlanganList, gradeEssaySubmission } from '@/backend/actions/ulanganActions';

export default function AdminHasilUlanganPage() {
  const [results, setResults] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('Semua');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal Koreksi Essay
  const [gradingResult, setGradingResult] = useState(null);
  const [essayScores, setEssayScores] = useState({});
  const [teacherNotes, setTeacherNotes] = useState('');
  const [savingGrade, setSavingGrade] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resResults, resExams] = await Promise.all([
        getAllHasilUlangan(selectedExam),
        getUlanganList(),
      ]);

      if (resResults.success) setResults(resResults.data);
      if (resExams.success) setExams(resExams.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedExam]);

  const filteredResults = results.filter((r) => {
    const studentName = r.siswa?.nama || r.profile?.nama_lengkap || '';
    const studentNisn = r.siswa?.nisn || '';
    const term = searchTerm.toLowerCase();
    return studentName.toLowerCase().includes(term) || studentNisn.includes(term);
  });

  const handleOpenGrading = (result) => {
    setGradingResult(result);
    setEssayScores(result.koreksi_essay || {});
    setTeacherNotes(result.catatan_guru || '');
  };

  const handleSaveGrade = async () => {
    if (!gradingResult) return;
    setSavingGrade(true);

    try {
      const res = await gradeEssaySubmission({
        resultId: gradingResult.id,
        skorEssayMap: essayScores,
        catatanGuru: teacherNotes,
      });

      if (res.success) {
        alert('Nilai essay berhasil disimpan!');
        setGradingResult(null);
        loadData();
      } else {
        alert(res.message || 'Gagal menyimpan nilai.');
      }
    } catch (err) {
      alert('Terjadi kesalahan saat menyimpan nilai.');
    } finally {
      setSavingGrade(false);
    }
  };

  const exportCSV = () => {
    if (filteredResults.length === 0) return alert('Tidak ada data nilai untuk diexport.');

    const headers = ['Nama Siswa', 'NISN', 'Kelas', 'Mata Pelajaran', 'Judul Ulangan', 'Nilai Total', 'Nilai PG', 'Nilai Essay', 'Status', 'Waktu Pengumpulan'];
    const rows = filteredResults.map((r) => [
      `"${r.siswa?.nama || r.profile?.nama_lengkap || '-'}"`,
      `"${r.siswa?.nisn || '-'}"`,
      `"${r.siswa?.kelas || r.ulangan?.kelas || '-'}"`,
      `"${r.ulangan?.mapel || '-'}"`,
      `"${r.ulangan?.judul || '-'}"`,
      r.nilai,
      r.nilai_pg ?? r.nilai,
      r.nilai_essay ?? '-',
      `"${r.status_koreksi || 'Selesai'}"`,
      `"${new Date(r.submitted_at).toLocaleString('id-ID')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap_nilai_ulangan_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <Topbar
        title="Rekapitulasi Nilai &amp; Koreksi Ujian"
        subtitle="Laporan Hasil Pengerjaan Ulangan CBT &amp; Koreksi Jawaban Essay Siswa"
      />

      {/* Header Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Pengumpulan</p>
            <p className="text-3xl font-black text-slate-800 mt-1">{filteredResults.length}</p>
            <span className="text-[10px] text-slate-500 font-medium">Lembar Jawaban Masuk</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CheckSquare size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rata-Rata Nilai</p>
            <p className="text-3xl font-black text-emerald-600 mt-1">
              {filteredResults.length > 0
                ? (
                    filteredResults.reduce((acc, r) => acc + (Number(r.nilai) || 0), 0) /
                    filteredResults.length
                  ).toFixed(1)
                : 0}
            </p>
            <span className="text-[10px] text-slate-500 font-medium">Skala 0 - 100</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Trophy size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ujian Terdaftar</p>
            <p className="text-3xl font-black text-slate-800 mt-1">{exams.length}</p>
            <span className="text-[10px] text-slate-500 font-medium">Mata Pelajaran Aktif</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Filter size={24} />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari siswa atau NISN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-600"
            />
          </div>

          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="w-full sm:w-56 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-600"
          >
            <option value="Semua">Semua Ulangan</option>
            {exams.map((u) => (
              <option key={u.id} value={u.id}>
                {u.judul} ({u.mapel})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={exportCSV}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
        >
          <Download size={15} /> Export Rekap Nilai (.CSV)
        </button>
      </div>

      {/* Tabel Data Nilai & Koreksi */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-6">Peserta Didik</th>
                <th className="py-3.5 px-6">Ujian / Mapel</th>
                <th className="py-3.5 px-6 text-center">Hasil PG</th>
                <th className="py-3.5 px-6 text-center">Nilai Total</th>
                <th className="py-3.5 px-6 text-center">Status Essay</th>
                <th className="py-3.5 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="animate-spin mx-auto text-blue-600 mb-2" size={24} />
                    Memuat rekapitulasi nilai...
                  </td>
                </tr>
              ) : filteredResults.length > 0 ? (
                filteredResults.map((r) => {
                  const hasEssayAnswers = r.jawaban_essay && Object.keys(r.jawaban_essay).length > 0;
                  const isGraded = r.status_koreksi === 'Sudah Dikoreksi';

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-4 px-6">
                        <p className="font-extrabold text-slate-800">
                          {r.siswa?.nama || r.profile?.nama_lengkap || 'Siswa'}
                        </p>
                        <p className="text-[11px] font-mono text-slate-400">
                          NISN: {r.siswa?.nisn || '-'} &bull; Kelas {r.siswa?.kelas || r.ulangan?.kelas || 'IX'}
                        </p>
                        {(r.is_disqualified || r.status_koreksi === 'DIDISKUALIFIKASI') && (
                          <span className="inline-block mt-1 text-[9px] font-black text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                            ⚠️ Didiskualifikasi ({r.catatan_pelanggaran || '> 3x Peringatan'})
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <span className="bg-blue-50 text-blue-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md inline-block mb-1">
                          {r.ulangan?.mapel || 'Mapel'}
                        </span>
                        <p className="text-slate-700 text-xs truncate max-w-xs font-semibold">
                          {r.ulangan?.judul || 'Ulangan'}
                        </p>
                      </td>

                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-3 text-xs">
                          <span className="text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 size={13} /> {r.total_benar}
                          </span>
                          <span className="text-rose-500 flex items-center gap-1">
                            <XCircle size={13} /> {r.total_salah}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          Skor PG: {r.is_disqualified ? 0 : (r.nilai_pg ?? r.nilai)}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-center">
                        {r.is_disqualified || r.status_koreksi === 'DIDISKUALIFIKASI' ? (
                          <div>
                            <span className="text-xl font-black text-rose-600">0</span>
                            <span className="block text-[9px] font-black text-rose-500 uppercase tracking-wider">
                              Diskualifikasi
                            </span>
                          </div>
                        ) : (
                          <span className={`text-xl font-black ${
                            Number(r.nilai) >= 75 ? 'text-emerald-600' : 'text-amber-500'
                          }`}>
                            {r.nilai}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-center">
                        {r.is_disqualified || r.status_koreksi === 'DIDISKUALIFIKASI' ? (
                          <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                            Didiskualifikasi
                          </span>
                        ) : hasEssayAnswers ? (
                          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                            isGraded 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-amber-50 text-amber-800 border border-amber-200 animate-pulse'
                          }`}>
                            {isGraded ? '✓ Sudah Dikoreksi' : 'Perlu Koreksi'}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Hanya PG</span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right">
                        {hasEssayAnswers ? (
                          <button
                            type="button"
                            onClick={() => handleOpenGrading(r)}
                            className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-black px-3.5 py-1.5 rounded-xl transition cursor-pointer"
                          >
                            <Edit3 size={13} />
                            <span>{isGraded ? 'Ubah Nilai Essay' : 'Koreksi Essay'}</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">Nilai Otomatis</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    Tidak ada data hasil ulangan yang cocok dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Koreksi Jawaban Essay */}
      {gradingResult && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full my-6 space-y-6 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <Edit3 size={18} className="text-rose-600" />
                  <span>Koreksi Jawaban Essay Siswa</span>
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {gradingResult.siswa?.nama || gradingResult.profile?.nama_lengkap} (NISN: {gradingResult.siswa?.nisn || '-'})
                </p>
              </div>
              <button
                onClick={() => setGradingResult(null)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto space-y-5 flex-1 pr-1 text-xs">
              {/* Ringkasan Skor PG */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Nilai Bagian PG</span>
                  <p className="text-xl font-black text-blue-600">
                    {gradingResult.nilai_pg ?? gradingResult.nilai} / 100
                  </p>
                </div>
                <span className="text-[11px] font-bold text-slate-500">
                  Benar: {gradingResult.total_benar} &bull; Salah: {gradingResult.total_salah}
                </span>
              </div>

              {/* Daftar Soal & Jawaban Essay */}
              <div className="space-y-4">
                <h4 className="font-extrabold text-slate-700 text-xs uppercase tracking-wider">
                  Daftar Jawaban Essay Siswa:
                </h4>

                {Object.entries(gradingResult.jawaban_essay || {}).map(([eNum, answerText]) => {
                  const foundEssay = gradingResult.ulangan?.soal_essay?.find(
                    (eq) => eq.nomor === parseInt(eNum)
                  );
                  const currentScore = essayScores[eNum] ?? '';

                  return (
                    <div
                      key={eNum}
                      className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <span className="w-7 h-7 rounded-xl bg-rose-600 text-white font-black text-xs flex items-center justify-center">
                          E{eNum}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-500">Beri Skor:</span>
                          <input
                            type="number"
                            min={0}
                            max={foundEssay?.bobot || 100}
                            placeholder="0"
                            value={currentScore}
                            onChange={(e) =>
                              setEssayScores({ ...essayScores, [eNum]: e.target.value })
                            }
                            className="w-16 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center font-black text-xs outline-none focus:border-blue-600"
                          />
                          <span className="text-slate-400 text-[11px]">
                            / {foundEssay?.bobot || 20} Poin
                          </span>
                        </div>
                      </div>

                      {/* Pertanyaan Essay */}
                      {foundEssay?.pertanyaan && (
                        <p className="text-slate-800 font-bold text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                          {foundEssay.pertanyaan}
                        </p>
                      )}

                      {/* Teks Jawaban Siswa */}
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                          Jawaban Siswa:
                        </span>
                        <div className="p-3 bg-blue-50/40 rounded-xl border border-blue-100 text-slate-800 font-medium leading-relaxed mt-1 whitespace-pre-wrap">
                          {answerText?.trim() || '(Siswa tidak mengisi jawaban)'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Catatan / Feedback Guru */}
              <div className="space-y-1.5 pt-2">
                <label className="block text-slate-700 font-bold">
                  Catatan / Feedback untuk Siswa (Opsional):
                </label>
                <textarea
                  rows={3}
                  placeholder="Beri catatan atau evaluasi untuk siswa ini..."
                  value={teacherNotes}
                  onChange={(e) => setTeacherNotes(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-600 font-medium"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => setGradingResult(null)}
                className="flex-1 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={savingGrade}
                onClick={handleSaveGrade}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {savingGrade ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                <span>Simpan Nilai Essay</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
