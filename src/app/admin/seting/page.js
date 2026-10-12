"use client";
import React, { useState, useEffect } from 'react';
import { 
  Save, Globe, Phone, Mail, FileSpreadsheet, 
  CheckCircle2, AlertCircle, Loader2, ArrowLeft,
  ShieldCheck, Key 
} from 'lucide-react';
import Link from 'next/link';
import Topbar from '@/components/portal/Topbar';
import { getAllSettings, updateSettingsBatch } from '@/backend/actions/settingActions';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    nama_sekolah: 'SMP NEGERI 18 BUTON TENGAH',
    npsn: '69989025',
    tahun_ajaran: '2026/2027',
    alamat: 'Jalan Poros Waburense, Desa Tanailandu, Kec. Mawasangka, Kab. Buton Tengah, Sulawesi Tenggara 93762',
    email_kontak: 'info@smpn18buteng.sch.id',
    telepon_kontak: '0812-3456-7890',
    pengumuman_buka: 'true',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function fetchSettings() {
      try {
        const data = await getAllSettings();
        if (data) setSettings((prev) => ({ ...prev, ...data }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await updateSettingsBatch(settings);
      if (res.success) {
        setSuccessMsg(res.message);
      } else {
        setErrorMsg(res.message || 'Gagal menyimpan pengaturan.');
      }
    } catch (err) {
      setErrorMsg('Terjadi kesalahan koneksi ke server.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <Topbar
        title="Pengaturan Sistem Sekolah"
        subtitle="Konfigurasi Identitas Lembaga, Tahun Ajaran, dan Pengumuman Kelulusan"
      />

      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl text-xs font-bold flex items-center gap-2 border border-emerald-200">
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl text-xs font-bold flex items-center gap-2 border border-rose-200">
          <AlertCircle size={18} /> {errorMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Identitas Lembaga */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Globe size={18} className="text-blue-600" /> Identitas Sekolah
          </h3>

          <div className="grid sm:grid-cols-2 gap-4 text-xs font-bold">
            <div>
              <label className="block text-slate-600 mb-1">Nama Resmi Sekolah</label>
              <input
                type="text"
                required
                value={settings.nama_sekolah}
                onChange={(e) => setSettings({ ...settings, nama_sekolah: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">NPSN</label>
              <input
                type="text"
                value={settings.npsn}
                onChange={(e) => setSettings({ ...settings, npsn: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 text-slate-800"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-xs font-bold">
            <div>
              <label className="block text-slate-600 mb-1">Tahun Ajaran Aktif</label>
              <input
                type="text"
                required
                value={settings.tahun_ajaran}
                onChange={(e) => setSettings({ ...settings, tahun_ajaran: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">Status Pengumuman Kelulusan</label>
              <select
                value={settings.pengumuman_buka}
                onChange={(e) => setSettings({ ...settings, pengumuman_buka: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 text-slate-800"
              >
                <option value="true">Pengumuman DIBUKA (Publik Bisa Akses)</option>
                <option value="false">Pengumuman DITUTUP (Menunggu Jadwal)</option>
              </select>
            </div>
          </div>

          <div className="text-xs font-bold">
            <label className="block text-slate-600 mb-1">Alamat Lengkap Sekolah</label>
            <textarea
              rows={2}
              value={settings.alamat}
              onChange={(e) => setSettings({ ...settings, alamat: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 text-slate-800"
            />
          </div>
        </div>

        {/* 2. Kontak & Saluran Komunikasi */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Phone size={18} className="text-emerald-600" /> Kontak Resmi Sekolah
          </h3>

          <div className="grid sm:grid-cols-2 gap-4 text-xs font-bold">
            <div>
              <label className="block text-slate-600 mb-1">Email Resmi</label>
              <input
                type="email"
                value={settings.email_kontak}
                onChange={(e) => setSettings({ ...settings, email_kontak: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">Nomor Telepon / WhatsApp</label>
              <input
                type="text"
                value={settings.telepon_kontak}
                onChange={(e) => setSettings({ ...settings, telepon_kontak: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* 3. Pangkalan Data & Ketentuan Akses Akun Siswa */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck size={18} className="text-blue-600" /> Pangkalan Data Siswa &amp; Ketentuan Akses Login
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-100 flex items-start gap-3">
              <CheckCircle2 size={18} className="text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-900 leading-relaxed font-semibold">
                <p className="font-extrabold mb-1">Integrasi Data Pokok Pendidikan (Dapodik)</p>
                <p className="text-blue-700">
                  Data identitas pribadi peserta didik, domisili, orang tua/wali, dan rombongan belajar disinkronkan secara resmi dan utuh melalui menu <b>Data Siswa</b> &amp; <b>Data Kelulusan</b>.
                </p>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3">
              <Key size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900 leading-relaxed font-semibold">
                <p className="font-extrabold mb-1">Kredensial Resmi Masuk Portal Siswa</p>
                <p className="text-emerald-700">
                  Siswa masuk menggunakan <b>NISN</b> sebagai username dan <b>Tanggal Lahir (Format: YYYY-MM-DD, contoh: 2012-02-11)</b> sebagai password resmi. Pastikan siswa diinstruksikan memasukkan tanggal lahir sesuai data Dapodik agar tidak terjadi kesalahan login.
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl shadow-md transition flex items-center justify-center gap-2 text-xs active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Menyimpan ke Supabase...' : 'Simpan Semua Perubahan'}
        </button>
      </form>
    </div>
  );
}