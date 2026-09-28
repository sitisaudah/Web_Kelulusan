"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Users, FileUp, Award, BookOpen, 
  CheckSquare, MessageSquare, Settings, Home, LogOut, Shield 
} from 'lucide-react';
import { logoutAction } from '@/backend/actions/authActions';

export default function AdminSidebar({ userProfile }) {
  const pathname = usePathname();

  const menu = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Data Siswa', path: '/admin/siswa', icon: Users },
    { name: 'Import Data', path: '/admin/import', icon: FileUp },
    { name: 'Kelulusan Sheets', path: '/admin/kelulusan', icon: Award, badge: 'Sheets' },
    { name: 'Ulangan CBT', path: '/admin/ulangan', icon: BookOpen },
    { name: 'Hasil Ulangan', path: '/admin/hasil-ulangan', icon: CheckSquare },
    { name: 'Pesan Kontak', path: '/admin/kontak', icon: MessageSquare },
    { name: 'Pengaturan', path: '/admin/seting', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col justify-between shrink-0 p-5">
      <div>
        {/* Brand */}
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="bg-blue-600 p-2 rounded-xl text-white">
            <Shield size={22} />
          </div>
          <div>
            <h2 className="font-extrabold text-white text-sm tracking-tight leading-none">
              ADMIN PORTAL
            </h2>
            <p className="text-[10px] text-slate-400 font-bold mt-1">
              SMPN 18 Buton Tengah
            </p>
          </div>
        </div>

        {/* User Card */}
        <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/50 mb-6">
          <p className="text-xs font-bold text-white truncate">
            {userProfile?.nama_lengkap || 'Administrator'}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
            {userProfile?.email || 'admin@smpn18.sch.id'}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="bg-blue-500/20 text-blue-400 text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase">
              {userProfile?.role || 'ADMIN'}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {menu.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact 
              ? pathname === item.path 
              : pathname === item.path || pathname.startsWith(`${item.path}/`);

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono">
                    {item.badge}
                  </span>
                )}
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
