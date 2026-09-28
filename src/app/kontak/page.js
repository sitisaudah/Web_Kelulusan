"use client";
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Loader2, MessageSquare } from 'lucide-react';
import { kirimPesanKontak } from '@/backend/actions/kontakActions';

export default function KontakPage() {
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    no_hp: '',
    subjek: '',
    pesan: '',
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await kirimPesanKontak(formData);
      if (res.success) {
        setSuccessMsg(res.message);
        setFormData({ nama: '', email: '', no_hp: '', subjek: '', pesan: '' });
      } else {
        setErrorMsg(res.message || 'Gagal mengirim pesan.');
      }
    } catch (err) {
      setErrorMsg('Terjadi kesalahan koneksi saat mengirim pesan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
          Hubungi Sekolah
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Kontak &amp; Layanan Pengaduan
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          Punya pertanyaan, saran, atau keperluan administrasi sekolah? Sampaikan langsung kepada pihak SMP Negeri 18 Buton Tengah.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Info Kontak */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-700 to-blue-900 text-white p-8 rounded-3xl shadow-lg space-y-6">
            <h3 className="text-lg font-black tracking-tight">Informasi Resmi</h3>
            <p className="text-xs text-blue-100/90 leading-relaxed">
              Layanan informasi dan komunikasi tata usaha SMP Negeri 18 Buton Tengah.
            </p>

            <div className="space-y-4 pt-2 text-xs">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-amber-400 shrink-0 mt-0.5" />
                <span>Jalan Poros Waburense, Desa Tanailandu, Kec. Mawasangka, Kab. Buton Tengah, Sultra 93762</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-amber-400 shrink-0" />
                <span>info@smpn18buteng.sch.id</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-amber-400 shrink-0" />
                <span>0812-3456-7890</span>
              </div>
            </div>

            <div className="pt-4 border-t border-blue-600/50">
              <span className="text-[11px] font-bold text-blue-200">
                Respon Cepat: Hari Kerja 08.00 – 14.00 WITA
              </span>
            </div>
          </div>
        </div>

        {/* Form Kirim Pesan */}
        <div className="lg:col-span-2 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">Formulir Pesan / Aspirasi</h3>
              <p className="text-xs text-slate-500">Pesan akan diteruskan ke dashboard Admin sekolah</p>
            </div>
          </div>

          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-2xl text-xs font-bold flex items-center gap-3 border border-emerald-200">
              <CheckCircle2 size={18} /> {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 p-4 bg-rose-50 text-rose-700 rounded-2xl text-xs font-bold flex items-center gap-3 border border-rose-200">
              <AlertCircle size={18} /> {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Nama Anda / Orang Tua"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-600 focus:bg-white outline-none text-xs font-semibold text-slate-800 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Alamat Email *</label>
                <input
                  type="email"
                  required
                  placeholder="email@anda.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-600 focus:bg-white outline-none text-xs font-semibold text-slate-800 transition"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Nomor HP / WhatsApp</label>
                <input
                  type="tel"
                  placeholder="Contoh: 08123456789"
                  value={formData.no_hp}
                  onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-600 focus:bg-white outline-none text-xs font-semibold text-slate-800 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Subjek Pesan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pertanyaan Legalisir Ijazah"
                  value={formData.subjek}
                  onChange={(e) => setFormData({ ...formData, subjek: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-600 focus:bg-white outline-none text-xs font-semibold text-slate-800 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Isi Pesan / Pertanyaan *</label>
              <textarea
                rows={5}
                required
                placeholder="Tuliskan pesan lengkap Anda di sini..."
                value={formData.pesan}
                onChange={(e) => setFormData({ ...formData, pesan: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-600 focus:bg-white outline-none text-xs font-semibold text-slate-800 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-8 py-4 rounded-2xl shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Mengirim...
                </>
              ) : (
                <>
                  <Send size={16} /> Kirim Pesan Sekarang
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
