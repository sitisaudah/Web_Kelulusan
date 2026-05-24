"use client";
import React, { useState, useEffect } from 'react';
import { Save, Bell, Globe, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  // 1. Buat State untuk menampung input
  const [settings, setSettings] = useState({
    namaSekolah: "SMP NEGERI 1 CONTOH",
    tahunAjaran: "2025/2026",
    tanggalBuka: "",
    jamBuka: "",
    pesanTambahan: ""
  });

  // 2. Ambil data dari LocalStorage saat halaman dibuka
  useEffect(() => {
    const savedData = localStorage.getItem('schoolSettings');
    if (savedData) {
      setSettings(JSON.parse(savedData));
    }
  }, []);

  // 3. Fungsi untuk menyimpan
  const handleSave = () => {
    localStorage.setItem('schoolSettings', JSON.stringify(settings));
    alert("Perubahan berhasil disimpan di Browser!");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <Link href="/admin" className="flex items-center text-blue-600 mb-6 hover:underline">
        <ArrowLeft size={20} className="mr-2" /> Kembali ke Dashboard
      </Link>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Pengaturan Sistem</h1>

        <div className="space-y-6">
          {/* Identitas Sekolah */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <Globe className="mr-2 text-blue-600" size={20} /> Identitas Sekolah
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Sekolah</label>
                <input 
                  type="text" 
                  value={settings.namaSekolah} 
                  onChange={(e) => setSettings({...settings, namaSekolah: e.target.value})}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Ajaran</label>
                <input 
                  type="text" 
                  value={settings.tahunAjaran} 
                  onChange={(e) => setSettings({...settings, tahunAjaran: e.target.value})}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
            </div>
          </div>

          {/* Waktu Pengumuman */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <Clock className="mr-2 text-orange-500" size={20} /> Jadwal Pengumuman
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Buka</label>
                <input 
                  type="date" 
                  value={settings.tanggalBuka}
                  onChange={(e) => setSettings({...settings, tanggalBuka: e.target.value})}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jam Buka (WIB)</label>
                <input 
                  type="time" 
                  value={settings.jamBuka}
                  onChange={(e) => setSettings({...settings, jamBuka: e.target.value})}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
            </div>
          </div>

          <button 
            onClick={handleSave}
            className="flex items-center justify-center w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition shadow-md"
          >
            <Save size={20} className="mr-2" /> Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
}