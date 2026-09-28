import React from 'react';
import { getCurrentUserAction } from '@/backend/actions/authActions';
import Topbar from '@/components/portal/Topbar';
import { User, ShieldCheck, Award, Home, Phone } from 'lucide-react';

export default async function SiswaProfilPage() {
  const { user, profile, studentData } = await getCurrentUserAction();
  const studentName = studentData?.nama || profile?.nama_lengkap || 'Siswa SMPN 18';

  return (
    <div className="space-y-8 max-w-5xl">
      <Topbar
        title="Profil Siswa"
        subtitle="Data Induk Peserta Didik SMP Negeri 18 Buton Tengah"
        user={{ nama_lengkap: studentName, role: 'Siswa' }}
      />

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header Profile */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 p-8 text-white flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-3xl bg-white text-blue-800 flex items-center justify-center font-black text-3xl shadow-xl">
            {studentName[0]?.toUpperCase() || 'S'}
          </div>
          <div className="text-center sm:text-left space-y-1">
            <span className="bg-blue-500/30 text-blue-200 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              Kelas {studentData?.kelas || 'IX'} &bull; Tahun Ajaran 2025/2026
            </span>
            <h2 className="text-2xl font-black">{studentName}</h2>
            <p className="text-xs text-blue-200 font-mono">
              NISN: {studentData?.nisn || user?.email?.split('@')[0] || '-'}
            </p>
          </div>
        </div>

        {/* Data Sections */}
        <div className="p-8 space-y-8">
          {/* 1. Data Diri Siswa */}
          <section className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
              <User size={16} /> Identitas Pribadi
            </h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <ProfileItem label="Nama Lengkap" value={studentData?.nama || studentName} />
              <ProfileItem label="Nomor Induk Siswa Nasional (NISN)" value={studentData?.nisn || '-'} isMono />
              <ProfileItem label="Nomor Induk Peserta Didik (NIPD)" value={studentData?.nipd || '-'} />
              <ProfileItem label="Nomor Induk Kependudukan (NIK)" value={studentData?.nik || '-'} isMono />
              <ProfileItem label="Tempat Lahir" value={studentData?.tempat_lahir || '-'} />
              <ProfileItem label="Tanggal Lahir" value={studentData?.tanggal_lahir || '-'} />
              <ProfileItem label="Jenis Kelamin" value={studentData?.jk === 'P' ? 'Perempuan' : 'Laki-Laki'} />
              <ProfileItem label="Agama" value={studentData?.agama || 'Islam'} />
              <ProfileItem label="Tingkat Kelas" value={`Kelas ${studentData?.kelas || 'IX'}`} />
            </div>
          </section>

          {/* 2. Data Orang Tua / Wali */}
          <section className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
              <Home size={16} /> Data Orang Tua &amp; Domisili
            </h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <ProfileItem label="Nama Ayah Kandung" value={studentData?.nama_ayah || '-'} />
              <ProfileItem label="Nama Ibu Kandung" value={studentData?.nama_ibu || '-'} />
              <ProfileItem label="Alamat Domisili" value={studentData?.alamat || 'Desa Tanailandu, Kec. Mawasangka'} />
            </div>
          </section>

          {/* 3. Info Akun Portal */}
          <section className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
              <ShieldCheck size={16} /> Status Akun Portal
            </h3>
            <div className="grid sm:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <ProfileItem label="Email Terdaftar" value={user?.email || '-'} />
              <ProfileItem label="Status Akses" value="Aktif (Siswa Terverifikasi)" highlight />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ProfileItem({ label, value, isMono, highlight }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-sm font-bold ${isMono ? 'font-mono' : ''} ${highlight ? 'text-emerald-600' : 'text-slate-800'}`}>
        {value}
      </p>
    </div>
  );
}
