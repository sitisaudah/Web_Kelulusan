"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, User, Award, BookOpen, 
  FileText, Home, LogOut, GraduationCap 
} from 'lucide-react';
import { logoutAction } from '@/backend/actions/authActions';

export default function StudentSidebar({ studentName, nisn }) {
  const pathname = usePathname();

  const menu = [
    { name: 'Dashboard', path: '/siswa/dashboard', icon: LayoutDashboard },
    { name: 'Profil Siswa', path: '/siswa/profil', icon: User },
    { name: 'Cek Kelulusan', path: '/siswa/kelulusan', icon: Award, highlight: true },
    { name: 'Ujian / Ulangan', path: '/siswa/ulangan', icon: BookOpen },
    { name: 'Hasil Ulangan', path: '/siswa/hasil-ulangan', icon: FileText },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col justify-between shrink-0 p-5">
      <div>
        {/* Brand */}
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="bg-blue-600 p-2 rounded-xl text-white">
            <GraduationCap size={22} />
          </div>
          <div>
            <h2 className="font-extrabold text-white text-sm tracking-tight leading-none">
              PORTAL SISWA
            </h2>
            <p className="text-[10px] text-slate-400 font-bold mt-1">
              SMPN 18 Buton Tengah
            </p>
          </div>
        </div>

        {/* User Card */}
        <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/50 mb-6">
          <p className="text-xs font-bold text-white truncate">
            {studentName || 'Siswa SMPN 18'}
          </p>
          <p className="text-[11px] font-mono text-blue-400 mt-0.5">
            NISN: {nisn || '-'}
          </p>
          <span className="inline-block mt-2 bg-emerald-500/20 text-emerald-400 text-[9px] font-extrabold px-2 py-0.5 rounded-md">
            SISWA AKTIF
          </span>
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5">
          {menu.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : item.highlight ? 'text-amber-400' : 'text-slate-400'} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Navigation */}
      <div className="pt-6 border-t border-slate-800 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <Home size={18} />
          <span>Ke Website Utama</span>
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
          >
            <LogOut size={18} />
            <span>Keluar (Logout)</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
