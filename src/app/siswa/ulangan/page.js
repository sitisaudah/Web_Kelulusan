import React from 'react';
import Link from 'next/link';
import { getUlanganList, getHasilUlanganSiswa } from '@/backend/actions/ulanganActions';
import { getCurrentUserAction } from '@/backend/actions/authActions';
import Topbar from '@/components/portal/Topbar';
import { BookOpen, Clock, Calendar, CheckCircle2, ChevronRight, FileText, Layers } from 'lucide-react';

export default async function SiswaUlanganPage() {
  const { studentData } = await getCurrentUserAction();
  const kelas = studentData?.kelas || 'IX';

  const { data: exams } = await getUlanganList({ kelas, isStudent: true });
  const { data: submittedResults } = await getHasilUlanganSiswa();

  const submittedExamIds = new Set((submittedResults || []).map((r) => r.ulangan?.id));

  return (
    <div className="space-y-8 max-w-5xl">
      <Topbar
        title="Ujian / Ulangan Online (CBT)"
        subtitle={`Daftar Ujian Kompetensi Siswa Kelas ${kelas}`}
      />

      {/* Daftar Ulangan Aktif */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
            Ujian Tersedia ({exams?.length || 0})
          </h3>
          <span className="text-[11px] text-slate-400 font-medium">
            Tersedia dalam format Naskah Soal PDF &amp; CBT Interaktif
          </span>
        </div>

        {exams && exams.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-5">
            {exams.map((u) => {
              const isDone = submittedExamIds.has(u.id);
              const isPdf = u.tipe_ujian === 'pdf';

              return (
                <div
                  key={u.id}
                  className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-blue-400 transition-all hover:shadow-md group"
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
                            <Layers size={11} /> CBT Interaktif
                          </span>
                        )}
                      </div>

                      {isDone ? (
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                          <CheckCircle2 size={12} /> Selesai
                        </span>
                      ) : (
                        <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                          Tersedia
                        </span>
                      )}
                    </div>

                    <h4 className="font-extrabold text-slate-800 text-base group-hover:text-blue-600 transition-colors leading-snug">
                      {u.judul}
                    </h4>

                    {u.deskripsi && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {u.deskripsi}
                      </p>
                    )}

                    <div className="pt-2 flex items-center gap-4 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Clock size={14} className="text-slate-400" />
                        <span>{u.durasi_menit} Menit</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar size={14} className="text-slate-400" />
                        <span>Kelas {u.kelas}</span>
                      </div>
                      {isPdf && u.total_soal_pdf && (
                        <div className="font-bold text-blue-600 text-xs">
                          {u.total_soal_pdf} Butir LJK
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100">
                    {isDone ? (
                      <Link
                        href="/siswa/hasil-ulangan"
                        className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-3 rounded-2xl transition"
                      >
                        Lihat Nilai Ujian
                      </Link>
                    ) : (
                      <Link
                        href={`/siswa/ulangan/${u.id}`}
                        className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 rounded-2xl shadow-sm transition active:scale-95"
                      >
                        Kerjakan Sekarang <ChevronRight size={16} />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
            <BookOpen size={36} className="mx-auto text-slate-300" />
            <h4 className="font-bold text-slate-800 text-sm">Tidak Ada Ujian Aktif</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Saat ini belum ada jadwal ujian online untuk kelas Anda. Silakan hubungi bapak/ibu guru pengampu mata pelajaran.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
