"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, MapPin, Mail, Phone, ExternalLink } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  // Sembunyikan footer publik jika berada di dalam portal siswa atau admin
  if (pathname.startsWith('/siswa') || (pathname.startsWith('/admin') && pathname !== '/admin/login')) {
    return null;
  }

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-14 pb-8 px-4 print:hidden">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10">
        {/* Kolom 1: Profil Sekolah */}
        <div className="md:col-span-1 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-600 p-2 rounded-xl text-white">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="font-black text-lg text-white tracking-tight">
              SMPN 18 BUTON TENGAH
            </span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            Membentuk generasi muda Buton Tengah yang berakhlak mulia, berprestasi akademik, dan berwawasan teknologi digital.
          </p>
          <div className="pt-2">
            <span className="inline-block bg-blue-900/50 text-blue-300 text-[11px] font-bold px-3 py-1 rounded-full border border-blue-700/50">
              NPSN: 69989025
            </span>
          </div>
        </div>

        {/* Kolom 2: Tautan Cepat */}
        <div>
          <h4 className="font-bold text-white text-sm mb-4 tracking-wider uppercase">Tautan Cepat</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/" className="hover:text-blue-400 transition-colors">Beranda</Link></li>
            <li><Link href="/tentang" className="hover:text-blue-400 transition-colors">Tentang Sekolah</Link></li>
            <li><Link href="/lokasi" className="hover:text-blue-400 transition-colors">Lokasi &amp; Peta</Link></li>
            <li><Link href="/kontak" className="hover:text-blue-400 transition-colors">Hubungi Kami</Link></li>
            <li><Link href="/cek-kelulusan" className="text-blue-400 hover:text-blue-300 font-bold">Cek Kelulusan Siswa</Link></li>
          </ul>
        </div>

        {/* Kolom 3: Layanan Portal */}
        <div>
          <h4 className="font-bold text-white text-sm mb-4 tracking-wider uppercase">Portal Sekolah</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/login?tab=siswa" className="hover:text-blue-400 transition-colors">Portal Siswa (CBT &amp; Nilai)</Link></li>
            <li><Link href="/login?tab=staff" className="hover:text-blue-400 transition-colors">Portal Guru &amp; Admin</Link></li>
            <li><Link href="/admin/login" className="hover:text-blue-400 transition-colors">Login Admin Legacy</Link></li>
          </ul>
        </div>

        {/* Kolom 4: Kontak & Alamat */}
        <div className="space-y-3">
          <h4 className="font-bold text-white text-sm mb-4 tracking-wider uppercase">Kontak Resmi</h4>
          <div className="flex items-start gap-2 text-xs text-slate-400">
            <MapPin size={16} className="text-blue-400 shrink-0 mt-0.5" />
            <span>Jalan Poros Waburense, Desa Tanailandu, Kec. Mawasangka, Kab. Buton Tengah, Sulawesi Tenggara 93762</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Mail size={16} className="text-blue-400 shrink-0" />
            <span>info@smpn18buteng.sch.id</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Phone size={16} className="text-blue-400 shrink-0" />
            <span>(0812) 3456-7890</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-800 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
        <p>&copy; 2026 SMP Negeri 18 Buton Tengah. Hak Cipta Dilindungi Undang-Undang.</p>
        <p className="text-[11px] text-slate-600">Terintegrasi dengan Google Spreadsheet &amp; Supabase Cloud</p>
      </div>
    </footer>
  );
}