"use client";
import React, { useState } from 'react';
import { 
  CheckCircle2, Bookmark, HelpCircle, 
  FileText, Send, Loader2, ArrowLeft, ArrowRight,
  Eye, Layers, AlertCircle, Edit3
} from 'lucide-react';

export default function WebExamQuestionsView({
  examTitle = "Ujian Online",
  mapel = "Mata Pelajaran",
  kelas = "IX",
  soalPg = [],
  soalEssay = [],
  jawabanPg = {},
  onSelectPg = () => {},
  jawabanEssay = {},
  onChangeEssay = () => {},
  raguMap = {},
  onToggleRagu = () => {},
  onSubmit = () => {},
  submitting = false,
  onTogglePdf = () => {},
  showPdfToggle = true,
  pdfVisible = false,
}) {
  const [activeSection, setActiveSection] = useState('all'); // 'all', 'pg', 'essay'

  const totalPg = soalPg.length;
  const totalEssay = soalEssay.length;
  const answeredPgCount = Object.keys(jawabanPg).filter((k) => Boolean(jawabanPg[k])).length;
  const answeredEssayCount = Object.keys(jawabanEssay).filter((k) => Boolean(jawabanEssay[k]?.trim())).length;
  const totalRaguCount = Object.values(raguMap).filter(Boolean).length;

  const scrollToElement = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-blue-500', 'transition-all');
      setTimeout(() => el.classList.remove('ring-2', 'ring-blue-500'), 1500);
    }
  };

  return (
    <div className="space-y-6 select-none" onContextMenu={(e) => e.preventDefault()}>
      {/* Sub-Header Kontrol Soal & Filter */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSection('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSection === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Semua Soal ({totalPg + totalEssay})
          </button>

          {totalPg > 0 && (
            <button
              type="button"
              onClick={() => setActiveSection('pg')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'pg'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
              }`}
            >
              <CheckCircle2 size={13} />
              <span>Pilihan Ganda ({answeredPgCount}/{totalPg})</span>
            </button>
          )}

          {totalEssay > 0 && (
            <button
              type="button"
              onClick={() => setActiveSection('essay')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'essay'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700'
              }`}
            >
              <Edit3 size={13} />
              <span>Soal Essay ({answeredEssayCount}/{totalEssay})</span>
            </button>
          )}
        </div>

        {/* Tombol Buka / Sembunyikan Naskah PDF Asli */}
        {showPdfToggle && (
          <button
            type="button"
            onClick={onTogglePdf}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer inline-flex items-center gap-2 ${
              pdfVisible 
                ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            <FileText size={15} className="text-rose-500" />
            <span>{pdfVisible ? 'Tutup Naskah PDF' : 'Buka Naskah PDF Asli'}</span>
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri / Utama: Tampilan Soal PG & Essay di Web */}
        <div className="lg:col-span-8 space-y-6">
          {/* ========================================== */}
          {/* BAGIAN I: SOAL PILIHAN GANDA               */}
          {/* ========================================== */}
          {(activeSection === 'all' || activeSection === 'pg') && totalPg > 0 && (
            <div className="space-y-4">
              <div className="p-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-white shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} />
                  <h3 className="font-extrabold text-xs tracking-wide uppercase">
                    Bagian I: Soal Pilihan Ganda ({totalPg} Butir)
                  </h3>
                </div>
                <span className="text-[10px] font-bold bg-white/20 px-2.5 py-0.5 rounded-full">
                  Terjawab: {answeredPgCount} / {totalPg}
                </span>
              </div>

              {soalPg.map((q, idx) => {
                const num = q.nomor || idx + 1;
                const isSelectedOption = jawabanPg[num] || '';
                const isRagu = Boolean(raguMap[num]);

                // Opsi jawaban
                const options = [
                  { key: 'A', text: q.pilihan_a },
                  { key: 'B', text: q.pilihan_b },
                  { key: 'C', text: q.pilihan_c },
                  { key: 'D', text: q.pilihan_d },
                ];
                if (q.pilihan_e) {
                  options.push({ key: 'E', text: q.pilihan_e });
                }

                return (
                  <div
                    key={`pg-${num}`}
                    id={`soal-pg-${num}`}
                    className={`bg-white p-6 rounded-3xl border transition-all duration-200 space-y-4 ${
                      isRagu
                        ? 'border-amber-300 bg-amber-50/20 shadow-xs'
                        : isSelectedOption
                        ? 'border-blue-200 shadow-sm'
                        : 'border-slate-200 shadow-xs hover:border-slate-300'
                    }`}
                  >
                    {/* Header Nomor Soal & Ragu-ragu */}
                    <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                          isSelectedOption ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {num}
                        </span>
                        <span className="text-xs font-bold text-slate-700">
                          Pilihan Ganda Nomor {num}
                        </span>
                        {isSelectedOption && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded">
                            ✓ Dijawab: {isSelectedOption}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => onToggleRagu(num)}
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer ${
                          isRagu
                            ? 'bg-amber-400 text-slate-900 shadow-xs'
                            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Bookmark size={14} className={isRagu ? 'fill-slate-900' : ''} />
                        <span>{isRagu ? 'Ragu-ragu' : 'Tandai Ragu'}</span>
                      </button>
                    </div>

                    {/* Teks Pertanyaan */}
                    <p className="text-sm sm:text-base font-bold text-slate-800 leading-relaxed pt-1">
                      {q.pertanyaan}
                    </p>

                    {/* Pilihan Jawaban A, B, C, D */}
                    <div className="space-y-2.5 pt-2">
                      {options.map(({ key, text }) => {
                        const isSelected = isSelectedOption === key;

                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => onSelectPg(num, key)}
                            className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3.5 cursor-pointer ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50/70 text-blue-950 shadow-xs ring-2 ring-blue-600/20'
                                : 'border-slate-100 hover:border-slate-300 bg-slate-50/50 text-slate-700 hover:bg-slate-100/60'
                            }`}
                          >
                            <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-xs scale-105'
                                : 'bg-white border border-slate-200 text-slate-600'
                            }`}>
                              {key}
                            </span>
                            <span className="text-xs sm:text-sm font-semibold pt-1 leading-snug">
                              {text || `Pilihan ${key}`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ========================================== */}
          {/* BAGIAN II: SOAL ESSAY / URAIAN             */}
          {/* ========================================== */}
          {(activeSection === 'all' || activeSection === 'essay') && totalEssay > 0 && (
            <div className="space-y-4 pt-4">
              <div className="p-3.5 bg-gradient-to-r from-rose-600 to-pink-600 rounded-2xl text-white shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit3 size={18} />
                  <h3 className="font-extrabold text-xs tracking-wide uppercase">
                    Bagian II: Soal Essay / Uraian ({totalEssay} Butir)
                  </h3>
                </div>
                <span className="text-[10px] font-bold bg-white/20 px-2.5 py-0.5 rounded-full">
                  Terisi: {answeredEssayCount} / {totalEssay}
                </span>
              </div>

              {soalEssay.map((eq, idx) => {
                const eNum = eq.nomor || idx + 1;
                const essayAnswer = jawabanEssay[eNum] || '';
                const charCount = essayAnswer.length;
                const wordCount = essayAnswer.trim() ? essayAnswer.trim().split(/\s+/).length : 0;

                return (
                  <div
                    key={`essay-${eNum}`}
                    id={`soal-essay-${eNum}`}
                    className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 hover:border-slate-300 transition"
                  >
                    <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                          E{eNum}
                        </span>
                        <span className="text-xs font-black text-slate-800">
                          Soal Essay Nomor {eNum}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-xl">
                        Bobot: {eq.bobot || 20} Poin
                      </span>
                    </div>

                    {/* Teks Pertanyaan Essay */}
                    <p className="text-sm sm:text-base font-bold text-slate-800 leading-relaxed">
                      {eq.pertanyaan}
                    </p>

                    {/* Area Penulisan Jawaban Essay */}
                    <div className="space-y-1.5 pt-2">
                      <label className="block text-xs font-black text-slate-600">
                        Lembar Jawaban Essay Anda:
                      </label>
                      <textarea
                        rows={5}
                        placeholder="Ketik uraian jawaban Anda di sini secara lengkap dan terstruktur (Dilarang menempelkan teks dari luar)..."
                        value={essayAnswer}
                        onChange={(e) => onChangeEssay(eNum, e.target.value)}
                        onPaste={(e) => e.preventDefault()}
                        onCopy={(e) => e.preventDefault()}
                        onCut={(e) => e.preventDefault()}
                        className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none focus:border-rose-500 focus:bg-white text-xs sm:text-sm font-medium text-slate-800 leading-relaxed transition shadow-inner"
                      />
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 px-1">
                        <span>{wordCount} Kata &bull; {charCount} Karakter</span>
                        {charCount > 0 ? (
                          <span className="text-emerald-600 font-black">✓ Jawaban Tersimpan Otomatis</span>
                        ) : (
                          <span className="text-amber-500">Belum diisi</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {totalPg === 0 && totalEssay === 0 && (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <AlertCircle size={36} className="mx-auto text-amber-500" />
              <p className="text-xs font-bold text-slate-600">
                Belum ada butir soal yang berhasil diekstrak. Silakan periksa naskah PDF asli.
              </p>
            </div>
          )}
        </div>

        {/* Kolom Kanan: Navigasi Cepat & Rekapitulasi */}
        <div className="lg:col-span-4 space-y-5 sticky top-24">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">
                Navigasi Lembar Soal
              </h4>
              <p className="text-xs text-slate-600 font-bold mt-1">
                Klik nomor untuk lompat langsung ke butir soal
              </p>
            </div>

            {/* Kisi Navigasi PG */}
            {totalPg > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-black text-blue-700 flex items-center justify-between">
                  <span>Pilihan Ganda:</span>
                  <span>{answeredPgCount} / {totalPg}</span>
                </span>
                <div className="grid grid-cols-5 gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-50 rounded-2xl border border-slate-100">
                  {soalPg.map((q, idx) => {
                    const num = q.nomor || idx + 1;
                    const isAnswered = Boolean(jawabanPg[num]);
                    const isRagu = Boolean(raguMap[num]);

                    let bg = 'bg-white text-slate-600 border-slate-200 hover:border-slate-400';
                    if (isRagu) {
                      bg = 'bg-amber-400 text-slate-900 font-black border-amber-500 shadow-xs';
                    } else if (isAnswered) {
                      bg = 'bg-blue-600 text-white font-black border-blue-600 shadow-xs';
                    }

                    return (
                      <button
                        key={`jump-pg-${num}`}
                        type="button"
                        onClick={() => scrollToElement(`soal-pg-${num}`)}
                        className={`h-8 rounded-xl text-xs font-bold border flex items-center justify-center transition cursor-pointer ${bg}`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Kisi Navigasi Essay */}
            {totalEssay > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-black text-rose-700 flex items-center justify-between">
                  <span>Soal Essay:</span>
                  <span>{answeredEssayCount} / {totalEssay}</span>
                </span>
                <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-50 rounded-2xl border border-slate-100">
                  {soalEssay.map((eq, idx) => {
                    const eNum = eq.nomor || idx + 1;
                    const isFilled = Boolean(jawabanEssay[eNum]?.trim());

                    return (
                      <button
                        key={`jump-essay-${eNum}`}
                        type="button"
                        onClick={() => scrollToElement(`soal-essay-${eNum}`)}
                        className={`h-8 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center ${
                          isFilled
                            ? 'bg-rose-600 text-white font-black border-rose-600 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        E{eNum}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Legenda Warna */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-[11px] font-medium text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-blue-600 shrink-0" />
                <span>PG sudah dijawab</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-rose-600 shrink-0" />
                <span>Essay sudah terisi</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-amber-400 shrink-0" />
                <span>Ditandai ragu-ragu</span>
              </div>
            </div>

            {/* Tombol Kumpulkan Ujian */}
            <div className="pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={submitting}
                onClick={onSubmit}
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs py-3.5 rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Mengirim Jawaban...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Selesai &amp; Kumpulkan Ujian</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
