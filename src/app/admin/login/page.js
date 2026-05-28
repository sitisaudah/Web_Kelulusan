"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, Eye, EyeOff, LogIn, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { setCookie } from 'cookies-next';

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // ==========================================
  // ATUR USERNAME & PASSWORD ADMIN DI SINI
  // ==========================================
  const ADMIN_USER = "adminsmpn18buteng"; // Ganti sesukamu
  const ADMIN_PASS = "smpn18butengjaya"; // Ganti sesukamu
  // ==========================================

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Logika Pengecekan
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      // Jika Benar: Beri Cookie (Tanda Pengenal) selama 1 jam
      setCookie('admin_session', 'active', { maxAge: 3600 });
      
      setTimeout(() => {
        setIsLoading(false);
        router.push('/admin'); // Masuk ke Dashboard
      }, 1500);
    } else {
      // Jika Salah
      setTimeout(() => {
        setIsLoading(false);
        setError("Username atau Password salah! Periksa kembali.");
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Dekorasi Latar */}
      <div className="absolute top-0 left-0 w-full h-40 bg-blue-600" />
      <div className="absolute top-32 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-white rounded-full opacity-40 shadow-2xl" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <Link href="/" className="inline-flex items-center text-white mb-6 hover:gap-2 transition-all font-bold tracking-tight">
          <ArrowLeft size={18} className="mr-2" /> KEMBALI KE BERANDA
        </Link>

        <div className="bg-white rounded-[40px] shadow-2xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-slate-900 p-10 text-center text-white relative">
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-blue-600 p-4 rounded-2xl shadow-xl text-white">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-2xl font-black mb-1 mt-2 tracking-tighter">PORTAL ADMIN</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">SMPN 18 Buton Tengah</p>
          </div>

          <div className="p-10 pt-14">
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-3 border border-red-100"
                >
                  <AlertCircle size={18} /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* INPUT USERNAME */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-2 ml-1 uppercase tracking-widest">Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <input 
                    type="text" 
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan Username"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all font-bold text-slate-700"
                  />
                </div>
              </div>

              {/* INPUT PASSWORD */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-2 ml-1 uppercase tracking-widest">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all font-bold text-slate-700"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-3xl shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn size={20} />
                    MASUK SEKARANG
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
             <p className="text-[9px] text-slate-400 font-black tracking-[0.3em] uppercase">
               &copy; 2026 Official Admin System
             </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}