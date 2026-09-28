"use client";
import React from 'react';
import { MapPin, Navigation, Clock, Phone, Mail, Compass, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function LokasiPage() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
          Lokasi &amp; Akses
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Peta &amp; Alamat Sekolah
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          Temukan lokasi kampus SMP Negeri 18 Buton Tengah di jalur poros Waburense, Desa Tanailandu, Kecamatan Mawasangka.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Info Alamat & Petunjuk Arah */}
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">Alamat Lengkap</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Jalan Poros Waburense, Desa Tanailandu, Kecamatan Mawasangka, Kabupaten Buton Tengah, Sulawesi Tenggara, Kode Pos 93762.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Clock size={24} />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">Jam Operasional</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Senin – Kamis: 07.15 – 13.30 WITA<br />
                  Jumat: 07.15 – 11.15 WITA<br />
                  Sabtu: 07.15 – 12.30 WITA
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Compass size={24} />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">Akses Transportasi</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Dapat dijangkau dengan mudah menggunakan kendaraan roda dua maupun roda empat melalui Jalan Poros Utama Tanailandu – Waburense.
                </p>
              </div>
            </div>

            <a
              href="https://maps.google.com/?q=Tanailandu+Mawasangka+Buton+Tengah"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3.5 rounded-2xl transition shadow-sm"
            >
              <Navigation size={16} /> Buka di Google Maps <ExternalLink size={14} />
            </a>
          </div>

          <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-3">
            <h4 className="font-bold text-sm text-blue-300">Butuh Informasi Lebih Lanjut?</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hubungi layanan tata usaha sekolah untuk konfirmasi kunjungan dinas atau informasi pendaftaran.
            </p>
            <Link
              href="/kontak"
              className="inline-block text-xs font-bold text-white underline hover:text-blue-300 transition"
            >
              Kirim Pesan Melalui Form Kontak &rarr;
            </Link>
          </div>
        </div>

        {/* Peta Google Maps Tersemat */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[450px] relative">
          <iframe
            title="Lokasi SMPN 18 Buton Tengah Tanailandu"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63600.0!2d122.3!3d-5.3!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2da225d3bc648f57%3A0x2884a44f772594a1!2sTanailandu%2C%20Mawasangka%2C%20Central%20Buton%20Regency%2C%20Southeast%20Sulawesi!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid"
            className="w-full h-full min-h-[450px] border-0"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
}
