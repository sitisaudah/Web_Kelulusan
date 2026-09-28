"use client";
import React, { useState, useEffect } from 'react';
import { 
  Save, Globe, Phone, Mail, FileSpreadsheet, 
  CheckCircle2, AlertCircle, Loader2, ArrowLeft 
} from 'lucide-react';
import Link from 'next/link';
import Topbar from '@/components/portal/Topbar';
import { getAllSettings, updateSettingsBatch } from '@/backend/actions/settingActions';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    nama_sekolah: 'SMP NEGERI 18 BUTON TENGAH',
    npsn: '69989025',
    tahun_ajaran: '2025/2026',
    alamat: 'Jalan Poros Waburense, Desa Tanailandu, Kec. Mawasangka, Kab. Buton Tengah, Sulawesi Tenggara 93762',
    email_kontak: 'info@smpn18buteng.sch.id',
    telepon_kontak: '0812-3456-7890',
    google_sheet_kelulusan: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTUVq4l9uDPXQLj8S3BBa0lrRWvNWATwEzjtdhzfJvDMMVfGR5PIODosccCS9KOgYPT9OIm5jPoLSMD/pub?output=csv',
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
        subtitle="Konfigurasi Identitas, Tahun Ajaran, dan Spreadsheet Kelulusan di Supabase"
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

        {/* 3. Konfigurasi Google Spreadsheet Kelulusan */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <FileSpreadsheet size={18} className="text-amber-500" /> Sumber Data Kelulusan (Google Sheets)
          </h3>

          <div className="text-xs font-bold">
            <label className="block text-slate-600 mb-1">
              URL CSV Publik Google Spreadsheet
            </label>
            <input
              type="url"
              required
              value={settings.google_sheet_kelulusan}
              onChange={(e) => setSettings({ ...settings, google_sheet_kelulusan: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 text-slate-800 font-mono text-[11px]"
            />
            <p className="text-[11px] text-slate-400 font-normal mt-1.5">
              URL yang dipublikasikan ke web dalam format CSV (File &rarr; Bagikan &rarr; Publikasikan ke web &rarr; CSV).
            </p>
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