import React from 'react';
import { getCurrentUserAction } from '@/backend/actions/authActions';
import Topbar from '@/components/portal/Topbar';
import { 
  User, ShieldCheck, Award, Home, Phone, MapPin, 
  Users, CheckCircle2, FileSpreadsheet, Calendar, Mail
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SiswaProfilPage() {
  const { user, profile, studentData } = await getCurrentUserAction();
  const studentName = studentData?.nama || profile?.nama_lengkap || 'Siswa SMPN 18';
  const nisn = studentData?.nisn || user?.email?.split('@')[0] || '-';
  const isLulus = (studentData?.status || 'LULUS').toUpperCase().includes('LULUS');

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
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 p-8 text-white flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
          <div className="w-24 h-24 rounded-3xl bg-white text-blue-800 flex items-center justify-center font-black text-3xl shadow-xl shrink-0">
            {studentName[0]?.toUpperCase() || 'S'}
          </div>
          <div className="text-center sm:text-left space-y-2 flex-1">
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start items-center">
              <span className="bg-blue-500/30 text-blue-100 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-blue-400/30">
                {studentData?.kelas || studentData?.rombel || 'Kelas IX'} &bull; TP 2026/2027
              </span>
              <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                isLulus ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30' : 'bg-rose-500/20 text-rose-200 border border-rose-400/30'
              }`}>
                Status: {studentData?.status || 'LULUS'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">{studentName}</h2>
            <div className="flex flex-wrap gap-4 text-xs text-blue-200 font-mono justify-center sm:justify-start">
              <span>NISN: {nisn}</span>
              {studentData?.nipd && <span>NIPD: {studentData.nipd}</span>}
              {studentData?.nik && <span>NIK: {studentData.nik}</span>}
            </div>
          </div>
        </div>

        {/* Official Data Banner */}
        <div className="bg-blue-50/70 border-b border-blue-100 px-8 py-3.5 flex items-center justify-between flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-blue-900 font-semibold">
            <ShieldCheck size={17} className="text-blue-600 shrink-0" />
            <span>Pangkalan Data Pokok Pendidikan Resmi SMP Negeri 18 Buton Tengah</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-700 font-extrabold text-[11px] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>Data Terverifikasi Resmi</span>
          </div>
        </div>

        {/* Data Sections */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* 1. Data Diri Siswa */}
          <section className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
              <User size={16} /> Identitas Pribadi
            </h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <ProfileItem label="Nama Lengkap" value={studentData?.nama || studentName} />
              <ProfileItem label="Nomor Induk Siswa Nasional (NISN)" value={studentData?.nisn || nisn} isMono />
              <ProfileItem label="Nomor Induk Peserta Didik (NIPD)" value={studentData?.nipd || '-'} isMono />
              <ProfileItem label="Nomor Induk Kependudukan (NIK)" value={studentData?.nik || '-'} isMono />
              <ProfileItem label="Tempat Lahir" value={studentData?.tempat_lahir || '-'} />
              <ProfileItem label="Tanggal Lahir" value={studentData?.tanggal_lahir || '-'} />
              <ProfileItem 
                label="Jenis Kelamin" 
                value={
                  studentData?.jk === 'P' || studentData?.jk === 'Perempuan' 
                    ? 'Perempuan' 
                    : studentData?.jk === 'L' || studentData?.jk === 'Laki-Laki'
                    ? 'Laki-Laki'
                    : '-'
                } 
              />
              <ProfileItem label="Agama" value={studentData?.agama || 'Islam'} />
              <ProfileItem label="Tingkat / Rombel" value={studentData?.kelas || studentData?.rombel || 'Kelas IX'} />
            </div>
          </section>

          {/* 2. Data Alamat & Domisili */}
          <section className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
              <MapPin size={16} /> Data Alamat &amp; Domisili
            </h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div className="sm:col-span-2 md:col-span-3">
                <ProfileItem 
                  label="Alamat Domisili Lengkap" 
                  value={studentData?.alamat_lengkap || studentData?.alamat || 'Desa Tanailandu, Kec. Mawasangka'} 
                />
              </div>
              <ProfileItem 
                label="RT / RW" 
                value={`RT ${studentData?.rt !== null && studentData?.rt !== undefined ? studentData.rt : '0'} / RW ${studentData?.rw !== null && studentData?.rw !== undefined ? studentData.rw : '0'}`} 
              />
              <ProfileItem label="Dusun / Lingkungan" value={studentData?.dusun || '-'} />
              <ProfileItem label="Kelurahan / Desa" value={studentData?.kelurahan || '-'} />
              <ProfileItem label="Kecamatan" value={studentData?.kecamatan || 'Kec. Mawasangka'} />
              <ProfileItem label="Kode Pos" value={studentData?.kode_pos || '93762'} isMono />
              <ProfileItem label="Jenis Tempat Tinggal" value={studentData?.jenis_tinggal || 'Bersama orang tua'} />
              <ProfileItem label="Alat Transportasi" value={studentData?.alat_transportasi || '-'} />
            </div>
          </section>

          {/* 3. Kontak & Kelengkapan Administrasi */}
          <section className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
              <Phone size={16} /> Kontak &amp; Administrasi
            </h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <ProfileItem label="Nomor HP / WhatsApp" value={studentData?.no_hp || '-'} isMono />
              <ProfileItem label="Nomor Telepon Rumah" value={studentData?.telepon || '-'} isMono />
              <ProfileItem label="Alamat Email Siswa" value={studentData?.email || user?.email || '-'} />
              <ProfileItem label="Nomor SKHUN" value={studentData?.skhun || '-'} isMono />
              <ProfileItem label="Penerima KPS / KIP" value={studentData?.penerima_kps || 'Tidak'} />
              <ProfileItem label="Nomor KPS / KIP" value={studentData?.no_kps || '-'} isMono />
            </div>
          </section>

          {/* 4. Data Orang Tua & Wali Lengkap */}
          <section className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
              <Users size={16} /> Data Orang Tua &amp; Wali Lengkap
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Card Ayah */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                <div className="pb-2 border-b border-slate-200">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2.5 py-1 rounded-md">
                    Ayah Kandung
                  </span>
                </div>
                <div className="space-y-3.5">
                  <ProfileItem label="Nama Ayah" value={studentData?.nama_ayah || '-'} />
                  <ProfileItem label="NIK Ayah" value={studentData?.nik_ayah || '-'} isMono />
                  <ProfileItem label="Tahun Lahir" value={studentData?.tahun_lahir_ayah || '-'} />
                  <ProfileItem label="Pendidikan Terakhir" value={studentData?.pendidikan_ayah || '-'} />
                  <ProfileItem label="Pekerjaan" value={studentData?.pekerjaan_ayah || '-'} />
                  <ProfileItem label="Penghasilan Bulanan" value={studentData?.penghasilan_ayah || '-'} />
                </div>
              </div>

              {/* Card Ibu */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                <div className="pb-2 border-b border-slate-200">
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-100/70 px-2.5 py-1 rounded-md">
                    Ibu Kandung
                  </span>
                </div>
                <div className="space-y-3.5">
                  <ProfileItem label="Nama Ibu" value={studentData?.nama_ibu || '-'} />
                  <ProfileItem label="NIK Ibu" value={studentData?.nik_ibu || '-'} isMono />
                  <ProfileItem label="Tahun Lahir" value={studentData?.tahun_lahir_ibu || '-'} />
                  <ProfileItem label="Pendidikan Terakhir" value={studentData?.pendidikan_ibu || '-'} />
                  <ProfileItem label="Pekerjaan" value={studentData?.pekerjaan_ibu || '-'} />
                  <ProfileItem label="Penghasilan Bulanan" value={studentData?.penghasilan_ibu || '-'} />
                </div>
              </div>

              {/* Card Wali */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                <div className="pb-2 border-b border-slate-200">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100/70 px-2.5 py-1 rounded-md">
                    Wali Siswa
                  </span>
                </div>
                <div className="space-y-3.5">
                  <ProfileItem label="Nama Wali" value={studentData?.nama_wali || '-'} />
                  <ProfileItem label="NIK Wali" value={studentData?.nik_wali || '-'} isMono />
                  <ProfileItem label="Tahun Lahir" value={studentData?.tahun_lahir_wali || '-'} />
                  <ProfileItem label="Pendidikan Terakhir" value={studentData?.pendidikan_wali || '-'} />
                  <ProfileItem label="Pekerjaan" value={studentData?.pekerjaan_wali || '-'} />
                  <ProfileItem label="Penghasilan Bulanan" value={studentData?.penghasilan_wali || '-'} />
                </div>
              </div>
            </div>
          </section>

          {/* 5. Info Akun & Status Verifikasi */}
          <section className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
              <ShieldCheck size={16} /> Status Akun Portal &amp; Kelulusan
            </h3>
            <div className="grid sm:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <ProfileItem label="Status Akses Portal" value="Aktif (Siswa Terverifikasi)" highlight />
              <ProfileItem 
                label="Status Kelulusan Siswa" 
                value={studentData?.status || 'LULUS'} 
                highlight={isLulus} 
              />
              <ProfileItem label="Asal Sekolah" value="SMP Negeri 18 Buton Tengah" />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ProfileItem({ label, value, isMono, highlight }) {
  const displayVal = value !== null && value !== undefined && value !== '' ? value : '-';

  return (
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-sm font-bold break-words ${isMono ? 'font-mono' : ''} ${highlight ? 'text-emerald-600 font-black' : 'text-slate-800'}`}>
        {displayVal}
      </p>
    </div>
  );
}
