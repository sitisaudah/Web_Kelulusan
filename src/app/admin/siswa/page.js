"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  UserPlus, 
  Filter, 
  Edit, 
  Trash2, 
  MoreVertical, 
  ChevronLeft, 
  ChevronRight,
  Download,
  ArrowLeft,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Link from 'next/link';

export default function DataSiswa() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");

  // Data Dummy
  const [students, setStudents] = useState([
    { id: 1, nisn: "0081234501", nama: "Achmad Zulkarnain", kelas: "IX-A", status: "Lulus" },
    { id: 2, nisn: "0081234502", nama: "Bella Saputri", kelas: "IX-B", status: "Lulus" },
    { id: 3, nisn: "0081234503", nama: "Candra Wijaya", kelas: "IX-A", status: "Tidak Lulus" },
    { id: 4, nisn: "0081234504", nama: "Dina Larasati", kelas: "IX-C", status: "Lulus" },
    { id: 5, nisn: "0081234505", nama: "Eko Prasetyo", kelas: "IX-B", status: "Lulus" },
  ]);

  // Logika Filter
  const filteredStudents = students.filter(s => {
    const matchSearch = s.nama.toLowerCase().includes(searchTerm.toLowerCase()) || s.nisn.includes(searchTerm);
    const matchStatus = filterStatus === "Semua" || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Breadcrumb & Header */}
      <div className="max-w-7xl mx-auto">
        <Link href="/admin" className="flex items-center text-blue-600 mb-4 hover:gap-2 transition-all">
          <ArrowLeft size={18} className="mr-1" /> Kembali ke Dashboard
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Manajemen Data Siswa</h1>
            <p className="text-gray-500 text-sm">Total {filteredStudents.length} siswa ditemukan</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition shadow-sm">
              <Download size={18} /> Export
            </button>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md">
              <UserPlus size={18} /> Tambah Siswa
            </button>
          </div>
        </div>

        {/* Toolbar: Search & Filter */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Cari Nama atau NISN..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select 
                className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="Semua">Semua Status</option>
                <option value="Lulus">Lulus</option>
                <option value="Tidak Lulus">Tidak Lulus</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs uppercase font-bold text-gray-500">No</th>
                  <th className="px-6 py-4 text-xs uppercase font-bold text-gray-500">NISN</th>
                  <th className="px-6 py-4 text-xs uppercase font-bold text-gray-500">Nama Lengkap</th>
                  <th className="px-6 py-4 text-xs uppercase font-bold text-gray-500">Kelas</th>
                  <th className="px-6 py-4 text-xs uppercase font-bold text-gray-500">Status</th>
                  <th className="px-6 py-4 text-xs uppercase font-bold text-gray-500 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <AnimatePresence>
                  {filteredStudents.map((siswa, index) => (
                    <motion.tr 
                      key={siswa.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-blue-50/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-600">{index + 1}</td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-700">{siswa.nisn}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-800">{siswa.nama}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{siswa.kelas}</td>
                      <td className="px-6 py-4">
                        {siswa.status === "Lulus" ? (
                          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
                            <CheckCircle size={12} /> Lulus
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
                            <XCircle size={12} /> Tidak Lulus
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center items-center gap-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition" title="Edit Data">
                            <Edit size={18} />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition" title="Hapus Data">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <p className="text-sm text-gray-500">Menampilkan 1 sampai {filteredStudents.length} dari {filteredStudents.length} data</p>
            <div className="flex gap-2">
              <button className="p-2 border border-gray-200 rounded bg-white hover:bg-gray-50 disabled:opacity-50" disabled>
                <ChevronLeft size={18} />
              </button>
              <button className="px-3 py-1 border border-blue-600 bg-blue-600 text-white rounded text-sm">1</button>
              <button className="p-2 border border-gray-200 rounded bg-white hover:bg-gray-50">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}