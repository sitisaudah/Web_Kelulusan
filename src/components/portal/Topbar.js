"use client";
import React from 'react';
import { Bell, Calendar, UserCheck } from 'lucide-react';

export default function Topbar({ title, subtitle, user }) {
  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
      <div>
        <h1 className="text-xl font-black text-slate-800 tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
          <Calendar size={14} className="text-blue-600" />
          <span>{today}</span>
        </div>

        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs">
            {user?.nama_lengkap ? user.nama_lengkap[0].toUpperCase() : 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-none">
              {user?.nama_lengkap || 'Pengguna'}
            </p>
            <span className="text-[10px] text-slate-400 font-medium capitalize">
              {user?.role || 'Pengguna'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
