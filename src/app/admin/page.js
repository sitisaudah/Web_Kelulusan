"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Plus, 
  Search, 
  FileEdit, 
  Trash2, 
  LogOut,
  LayoutDashboard,
  Settings,
  Upload
} from 'lucide-react';

export default function AdminDashboard() {
  // Data dummy untuk tampilan
  const [students, setStudents] = useState([
    { id: 1, name: "Budi Santoso", nisn: "0012345678", status: "Lulus" },
    { id: 2, name: "Siti Aminah", nisn: "0012345679", status: "Lulus" },
    { id: 3, name: "Rian Hidayat", nisn: "0012345680", status: "Ditunda" },
  ]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-blue-800 text-white hidden md:flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-blue-700">
          Admin SMP
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button className="flex items-center space-x-3 w-full p-3 bg-blue-700 rounded-lg">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>

          <Link href="/admin/siswa">
          <button className="flex items-center space-x-3 w-full p-3 hover:bg-blue-700 rounded-lg transition">
            <Users size={20} />
            <span>Data Siswa</span>
          </button>
          </Link>

            <Link href="/admin/import">
          <button className="flex items-center space-x-3 w-full p-3 hover:bg-blue-700 rounded-lg transition">
            <Upload size={20} />
            <span>Import Data</span>
          </button>
          </Link>

          <Link href="/admin/seting">
          <button className="flex items-center space-x-3 w-full p-3 hover:bg-blue-700 rounded-lg transition">
            <Settings size={20} />
            <span>Pengaturan</span>
          </button>
          </Link>
        </nav>
        <div className="p-4 border-t border-blue-700">
          <button className="flex items-center space-x-3 w-full p-3 hover:bg-red-600 rounded-lg transition">
            <LogOut size={20} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Ringkasan Data</h1>
            <p className="text-gray-500">Kelola pengumuman kelulusan siswa di sini.</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-md transition w-fit">
            <Plus size={20} /> Tambah Siswa
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatsCard icon={<Users className="text-blue-600" />} title="Total Siswa" count="120" color="bg-blue-100" />
          <StatsCard icon={<UserCheck className="text-green-600" />} title="Lulus" count="115" color="bg-green-100" />
          <StatsCard icon={<UserX className="text-red-600" />} title="Tidak Lulus" count="5" color="bg-red-100" />
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Daftar Kelulusan</h2>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Cari nama atau NISN..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 uppercase text-sm">
                <tr>
                  <th className="px-6 py-4 font-semibold">Nama Siswa</th>
                  <th className="px-6 py-4 font-semibold">NISN</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student) => (
                  <motion.tr 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    key={student.id} 
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 font-medium text-gray-800">{student.name}</td>
                    <td className="px-6 py-4 text-gray-600">{student.nisn}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        student.status === 'Lulus' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center space-x-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                          <FileEdit size={18} />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Hapus">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

// Komponen Card Statistik
function StatsCard({ icon, title, count, color }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4"
    >
      <div className={`p-4 rounded-lg ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{count}</p>
      </div>
    </motion.div>
  );
}