"use client";
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, GraduationCap, LogIn, Award } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Sembunyikan navbar publik jika berada di dalam portal siswa atau admin
  if (pathname.startsWith('/siswa') || (pathname.startsWith('/admin') && pathname !== '/admin/login')) {
    return null;
  }

  const menuItems = [
    { name: 'Home', path: '/' },
    { name: 'Tentang', path: '/tentang' },
    { name: 'Lokasi', path: '/lokasi' },
    { name: 'Kontak', path: '/kontak' },
    { name: 'Cek Kelulusan', path: '/cek-kelulusan', badge: true },
  ];

  return (
    <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 p-2 rounded-xl text-white group-hover:scale-105 transition-transform shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-blue-900 leading-tight">
                SMPN 18 BUTON TENGAH
              </span>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                BERAKHLAK &amp; BERPRESTASI
              </span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  pathname === item.path
                    ? 'text-blue-600'
                    : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                {item.badge && <Award size={16} className="text-amber-500" />}
                {item.name}
              </Link>
            ))}

            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-95"
            >
              <LogIn size={15} /> Login Portal
            </Link>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <Link
              href="/login"
              className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg mr-1"
            >
              Login
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg"
              aria-label="Menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2.5 rounded-xl text-sm font-semibold ${
                pathname === item.path
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item.name}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setIsOpen(false)}
            className="w-full mt-2 inline-flex justify-center items-center gap-2 bg-blue-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl"
          >
            <LogIn size={16} /> Masuk ke Portal
          </Link>
        </div>
      )}
    </nav>
  );
}