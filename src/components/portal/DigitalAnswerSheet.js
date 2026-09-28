"use client";
import React, { useState } from 'react';
import { 
  CheckCircle2, AlertTriangle, HelpCircle, 
  Send, Loader2, Bookmark, Check, X 
} from 'lucide-react';

export default function DigitalAnswerSheet({
  totalQuestions = 10,
  options = ['A', 'B', 'C', 'D'],
  answers = {},
  onAnswerChange = () => {},
  raguMap = {},
  onRaguToggle = () => {},
  onSubmit = () => {},
  submitting = false,
  readOnly = false,
  correctAnswers = null, // Jika dioper, menampilkan review jawaban benar/salah
}) {
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'unanswered', 'ragu'

  const totalNum = Number(totalQuestions) || 10;
  const questionNumbers = Array.from({ length: totalNum }, (_, i) => i + 1);

  // Hitung metrik
  const answeredCount = questionNumbers.filter((n) => Boolean(answers[n])).length;
  const raguCount = questionNumbers.filter((n) => Boolean(raguMap[n])).length;
  const unansweredCount = totalNum - answeredCount;
  const progressPercent = Math.round((answeredCount / totalNum) * 100);

  const filteredNumbers = questionNumbers.filter((n) => {
    if (activeFilter === 'unanswered') return !answers[n];
    if (activeFilter === 'ragu') return Boolean(raguMap[n]);
    return true;
  });

  const scrollToQuestion = (qNum) => {
    const el = document.getElementById(`ljk-row-${qNum}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-blue-500', 'transition-all');
      setTimeout(() => el.classList.remove('ring-2', 'ring-blue-500'), 1200);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header LJK & Status Terjawab */}
      <div className="p-5 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 space-y-4 shrink-0">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-2">
              <span>Lembar Jawaban Komputer (LJK)</span>
              <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                {totalNum} Butir
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Klik opsi jawaban sesuai naskah soal PDF di samping
            </p>
          </div>

          {/* Badge Persentase */}
          <div className="text-right">
            <span className="text-xs font-black text-blue-600 font-mono">
              {progressPercent}%
            </span>
            <p className="text-[10px] text-slate-400 font-semibold">Progres</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Filter / Status Badges */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold pt-1">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`py-1.5 px-2 rounded-xl transition border cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="block text-[10px] text-slate-400 uppercase font-black">Semua</span>
            <span className="text-sm">{totalNum}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter(activeFilter === 'unanswered' ? 'all' : 'unanswered')}
            className={`py-1.5 px-2 rounded-xl transition border cursor-pointer ${
              activeFilter === 'unanswered'
                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                : unansweredCount > 0
                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                : 'bg-slate-50 text-slate-400 border-slate-100'
            }`}
          >
            <span className="block text-[10px] uppercase font-black opacity-80">Belum</span>
            <span className="text-sm">{unansweredCount}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter(activeFilter === 'ragu' ? 'all' : 'ragu')}
            className={`py-1.5 px-2 rounded-xl transition border cursor-pointer ${
              activeFilter === 'ragu'
                ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                : raguCount > 0
                ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                : 'bg-slate-50 text-slate-400 border-slate-100'
            }`}
          >
            <span className="block text-[10px] uppercase font-black opacity-80">Ragu</span>
            <span className="text-sm">{raguCount}</span>
          </button>
        </div>

        {/* Grid Nomor Cepat (Navigasi Butir Soal) */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
            <span>Kisi Navigasi Nomor:</span>
            <span>Klik nomor untuk lompat</span>
          </div>
          <div className="max-h-24 overflow-y-auto p-1 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
              {questionNumbers.map((num) => {
                const isAnswered = Boolean(answers[num]);
                const isRagu = Boolean(raguMap[num]);

                let bgClass = 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400';
                if (isRagu) {
                  bgClass = 'bg-amber-400 text-slate-900 font-black border-amber-500 shadow-xs';
                } else if (isAnswered) {
                  bgClass = 'bg-emerald-600 text-white font-black border-emerald-600 shadow-xs';
                }

                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => scrollToQuestion(num)}
                    className={`h-7 rounded-lg text-xs font-bold flex items-center justify-center transition cursor-pointer ${bgClass}`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Daftar Baris Jawaban Soal (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 divide-y divide-slate-100">
        {filteredNumbers.map((num) => {
          const selectedOption = answers[num] || '';
          const isRagu = Boolean(raguMap[num]);
          const correctKey = correctAnswers ? correctAnswers[num] : null;

          return (
            <div
              key={num}
              id={`ljk-row-${num}`}
              className={`pt-3 first:pt-0 p-3 rounded-2xl transition-all ${
                isRagu ? 'bg-amber-50/70 border border-amber-200' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                    selectedOption 
                      ? 'bg-slate-900 text-white' 
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {num}
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    Soal Nomor {num}
                  </span>
                </div>

                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => onRaguToggle(num)}
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg transition cursor-pointer ${
                      isRagu
                        ? 'bg-amber-400 text-slate-900 shadow-xs'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Bookmark size={13} className={isRagu ? 'fill-slate-900' : ''} />
                    <span>{isRagu ? 'Ragu-ragu' : 'Tandai Ragu'}</span>
                  </button>
                )}
              </div>

              {/* Pilihan A, B, C, D (atau E) */}
              <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
                {options.map((opt) => {
                  const isSelected = selectedOption === opt;
                  const isCorrect = correctKey === opt;
                  const isWrong = correctKey && isSelected && !isCorrect;

                  let optClass = 'bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50/50';

                  if (correctAnswers) {
                    if (isCorrect) {
                      optClass = 'bg-emerald-600 border-emerald-600 text-white font-black';
                    } else if (isWrong) {
                      optClass = 'bg-rose-600 border-rose-600 text-white font-black';
                    } else {
                      optClass = 'bg-slate-50 text-slate-300 border-slate-100';
                    }
                  } else if (isSelected) {
                    optClass = 'bg-blue-600 border-blue-600 text-white font-black shadow-sm ring-2 ring-blue-600/30';
                  }

                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={readOnly}
                      onClick={() => onAnswerChange(num, opt)}
                      className={`h-11 rounded-xl border-2 flex items-center justify-center gap-1.5 text-sm font-bold transition active:scale-95 cursor-pointer disabled:cursor-default ${optClass}`}
                    >
                      <span>{opt}</span>
                      {correctAnswers && isCorrect && <Check size={14} />}
                      {correctAnswers && isWrong && <X size={14} />}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filteredNumbers.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs font-semibold">
            Tidak ada nomor soal dalam filter ini.
          </div>
        )}
      </div>

      {/* Footer LJK: Tombol Selesai & Kirim */}
      {!readOnly && (
        <div className="p-4 bg-slate-50 border-t border-slate-100 shrink-0 space-y-2">
          <button
            type="button"
            disabled={submitting}
            onClick={onSubmit}
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs py-3.5 px-4 rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Mengirim Lembar Jawaban...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Kumpulkan &amp; Selesaikan Ujian</span>
              </>
            )}
          </button>
          <p className="text-[10px] text-center text-slate-400 font-medium">
            Pastikan seluruh soal naskah PDF telah terjawab sebelum mengumpulkan.
          </p>
        </div>
      )}
    </div>
  );
}
