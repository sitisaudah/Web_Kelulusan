import React from 'react';
import { getHasilUlanganSiswa } from '@/backend/actions/ulanganActions';
import Topbar from '@/components/portal/Topbar';
import { Trophy, Calendar, BookOpen, CheckCircle2, XCircle, Award, Edit3, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default async function SiswaHasilUlanganPage() {
  const { data: results } = await getHasilUlanganSiswa();

  return (
    <div className="space-y-8 max-w-5xl">
      <Topbar
        title="Rekapitulasi Nilai Ujian"
        subtitle="Arsip Nilai dan Hasil Ulangan Online CBT (Pilihan Ganda & Essay)"
      />

      {results && results.length > 0 ? (
        <div className="space-y-4">
          <div className="grid gap-4">
            {results.map((r) => {
              const nilaiNum = Number(r.nilai) || 0;
              const isGood = nilaiNum >= 75;
              const hasEssay = Boolean(r.jawaban_essay && Object.keys(r.jawaban_essay).length > 0);
              const isGraded = r.status_koreksi === 'Sudah Dikoreksi';

              const submittedDate = new Date(r.submitted_at).toLocaleDateString('id-ID', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={r.id}
                  className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between gap-5 hover:border-slate-300 transition"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-blue-50 text-blue-700 text-[10px] font-extrabold px-2.5 py-1 rounded-lg">
                          {r.ulangan?.mapel || 'Mata Pelajaran'}
                        </span>
                        <span className="text-slate-400 text-xs font-medium">
                          {submittedDate}
                        </span>
                        {hasEssay && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isGraded 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {isGraded ? '✓ Essay Sudah Dikoreksi' : 'Essay Menunggu Koreksi Guru'}
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-extrabold text-slate-800">
                        {r.ulangan?.judul || 'Ulangan Online'}
                      </h4>

                      <div className="flex items-center gap-4 text-xs font-bold text-slate-500 pt-1 flex-wrap">
                        <span className="flex items-center gap-1 text-emerald-600">
                          <CheckCircle2 size={14} /> PG Benar: {r.total_benar}
                        </span>
                        <span className="flex items-center gap-1 text-rose-500">
                          <XCircle size={14} /> PG Salah: {r.total_salah}
                        </span>
                        {r.nilai_pg !== undefined && (
                          <span className="text-blue-700">
                            Skor PG: {r.nilai_pg}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Nilai Total
                      </span>
                      {r.is_disqualified || r.status_koreksi === 'DIDISKUALIFIKASI' ? (
                        <div className="text-right">
                          <span className="text-4xl font-black tracking-tight text-rose-600">
                            0
                          </span>
                          <span className="block text-[10px] font-black px-2 py-0.5 rounded mt-1 bg-rose-100 text-rose-800 border border-rose-200">
                            Didiskualifikasi
                          </span>
                        </div>
                      ) : (
                        <>
                          <span className={`text-4xl font-black tracking-tight ${isGood ? 'text-emerald-600' : 'text-amber-500'}`}>
                            {nilaiNum}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded mt-1 ${isGood ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                            {isGood ? 'Tuntas' : 'Perlu Remedial'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Catatan Pelanggaran jika Didiskualifikasi */}
                  {r.catatan_pelanggaran && (
                    <div className="p-3.5 bg-rose-50/80 rounded-2xl border border-rose-200 text-xs text-rose-950 space-y-1">
                      <div className="flex items-center gap-1.5 font-black text-[11px] text-rose-700">
                        <AlertTriangle size={13} />
                        <span>Keterangan Diskualifikasi:</span>
                      </div>
                      <p className="font-medium leading-relaxed pl-4 text-rose-800">
                        "{r.catatan_pelanggaran}"
                      </p>
                    </div>
                  )}

                  {/* Catatan / Feedback Guru jika ada */}
                  {r.catatan_guru && (
                    <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-100 text-xs text-blue-950 space-y-1">
                      <div className="flex items-center gap-1.5 font-black text-[11px] text-blue-800">
                        <MessageSquare size={13} />
                        <span>Catatan Guru:</span>
                      </div>
                      <p className="font-medium leading-relaxed pl-4 text-slate-700">
                        "{r.catatan_guru}"
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4">
          <Trophy size={40} className="mx-auto text-slate-300" />
          <h3 className="font-black text-slate-800 text-base">Belum Ada Hasil Ujian</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Anda belum menyelesaikan ulangan online apa pun. Silakan cek daftar ujian yang tersedia.
          </p>
          <Link
            href="/siswa/ulangan"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-sm transition"
          >
            Buka Daftar Ujian
          </Link>
        </div>
      )}
    </div>
  );
}
