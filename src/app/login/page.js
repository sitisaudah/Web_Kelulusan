"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Lock, Mail, GraduationCap, ShieldCheck, 
  LogIn, ArrowLeft, AlertCircle, Eye, EyeOff, CheckCircle2 
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginSiswaAction, loginStaffAction } from '@/backend/actions/authActions';

function LoginFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialTab = searchParams.get('tab') === 'staff' ? 'staff' : 'siswa';
  const paramMessage = searchParams.get('message');

  const [activeTab, setActiveTab] = useState(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(paramMessage || '');

  // Siswa inputs
  const [nisn, setNisn] = useState('');
  const [siswaPassword, setSiswaPassword] = useState('');

  // Staff inputs
  const [email, setEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');

  useEffect(() => {
    if (paramMessage) {
      setErrorMessage(paramMessage);
    }
  }, [paramMessage]);

  const handleLoginSiswa = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await loginSiswaAction({ nisn, password: siswaPassword });
      if (res.success) {
        window.location.href = '/siswa/dashboard';
      } else {
        setErrorMessage(res.message || 'NISN atau password salah.');
        setLoading(false);
      }
    } catch (err) {
      setErrorMessage('Terjadi kesalahan koneksi autentikasi.');
      setLoading(false);
    }
  };

  const handleLoginStaff = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await loginStaffAction({ email, password: staffPassword });
      if (res.success) {
        window.location.href = '/admin';
      } else {
        setErrorMessage(res.message || 'Username atau password salah.');
        setLoading(false);
      }
    } catch (err) {
      setErrorMessage('Terjadi kesalahan koneksi autentikasi.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 relative overflow-hidden py-12">
      {/* Latar Belakang Dekoratif */}
      <div className="absolute top-0 left-0 w-full h-56 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900" />
      <div className="absolute top-44 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-white rounded-full opacity-40 shadow-2xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <Link
          href="/"
          className="inline-flex items-center text-white mb-6 hover:gap-2 transition-all font-bold text-xs tracking-tight"
        >
          <ArrowLeft size={16} className="mr-1.5" /> KEMBALI KE BERANDA
        </Link>

        <div className="bg-white rounded-[36px] shadow-2xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-slate-900 p-8 text-center text-white relative">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg">
              {activeTab === 'siswa' ? <GraduationCap size={28} /> : <ShieldCheck size={28} />}
            </div>
            <h1 className="text-xl font-black tracking-tight">PORTAL TERPADU</h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
              SMP Negeri 18 Buton Tengah
            </p>

            {/* Tab Selector */}
            <div className="mt-6 p-1 bg-slate-800 rounded-2xl flex">
              <button
                type="button"
                onClick={() => { setActiveTab('siswa'); setErrorMessage(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'siswa'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Login Siswa
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('staff'); setErrorMessage(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'staff'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Guru &amp; Admin
              </button>
            </div>
          </div>

          <div className="p-8">
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-5 p-3.5 bg-red-50 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-2.5 border border-red-100"
                >
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {activeTab === 'siswa' ? (
              /* FORM LOGIN SISWA */
              <form onSubmit={handleLoginSiswa} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">
                    NISN Siswa
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 0104433545"
                      value={nisn}
                      onChange={(e) => setNisn(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-600 focus:bg-white outline-none text-xs font-bold text-slate-800 transition"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Masukkan 10 digit NISN Anda</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Password (Tanggal Lahir)
                    </label>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      Format: YYYY-MM-DD
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Contoh: 2012-02-11"
                      value={siswaPassword}
                      onChange={(e) => setSiswaPassword(e.target.value)}
                      className="w-full pl-11 pr-11 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-600 focus:bg-white outline-none text-xs font-bold text-slate-800 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <div className="mt-2.5 p-3 bg-blue-50/80 border border-blue-100 rounded-2xl text-[11px] text-blue-900 leading-relaxed font-medium">
                    <span className="font-extrabold text-blue-700">💡 Petunjuk Password:</span> Masukkan <strong>Tanggal Lahir</strong> Anda (format: <code>YYYY-MM-DD</code>, contoh: <code>2012-02-11</code>) atau nomor <strong>NISN</strong> Anda sesuai berkas data resmi sekolah.
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-xs transition active:scale-95 disabled:opacity-50 mt-2 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogIn size={16} /> MASUK PORTAL SISWA
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* FORM LOGIN GURU & ADMIN */
              <form onSubmit={handleLoginStaff} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">
                    Username Admin / Email Resmi
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      required
                      placeholder="Username atau email resmi"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-600 focus:bg-white outline-none text-xs font-bold text-slate-800 transition"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Gunakan username <code className="text-blue-600 font-mono">adminsmpn18buteng</code> atau email resmi terdaftar
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">
                    Password Akun
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                      className="w-full pl-11 pr-11 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-600 focus:bg-white outline-none text-xs font-bold text-slate-800 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-xs transition active:scale-95 disabled:opacity-50 mt-2 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogIn size={16} /> MASUK PANEL ADMIN/GURU
                    </>
                  )}
                </button>

                <div className="pt-2 text-center">
                  <Link
                    href="/admin/login"
                    className="text-[11px] text-blue-600 hover:underline font-semibold"
                  >
                    Atau masuk via Login Admin Legacy &rarr;
                  </Link>
                </div>
              </form>
            )}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
            <p className="text-[9px] text-slate-400 font-black tracking-widest uppercase">
              &copy; 2026 SMP NEGERI 18 BUTON TENGAH
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-slate-400">Memuat...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
