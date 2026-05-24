"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, User, Eye, EyeOff, LogIn, ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { setCookie } from 'cookies-next';

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const username = e.target[0].value;
    const password = e.target[1].value;

    // --- LOGIKA LOGIN (Ganti sesuai kebutuhan) ---
    if (username === "admin" && password === "admin123") {
      // Simpan cookie selama 1 jam (3600 detik)
      setCookie('admin_session', 'active', { maxAge: 3600 });
      
      setTimeout(() => {
        setIsLoading(false);
        router.push('/admin'); 
      }, 1500);
    } else {
      setTimeout(() => {
        setIsLoading(false);
        setError("Username atau password salah!");
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-32 bg-blue-600" />
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-white rounded-full opacity-50 shadow-2xl" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md">
        <Link href="/" className="inline-flex items-center text-white mb-6 hover:gap-2 transition-all font-medium">
          <ArrowLeft size={18} className="mr-2" /> Kembali ke Beranda
        </Link>

        <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden">
          <div className="bg-slate-800 p-8 text-center text-white relative">
            <h1 className="text-2xl font-bold mb-1 mt-2 uppercase tracking-tight">Portal Admin</h1>
            <p className="text-slate-400 text-sm">SMP NEGERI 18 BUTON TENGAH</p>
          </div>

          <div className="p-10 pt-12">
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-600 text-sm rounded-xl text-center font-bold">
                {error}
              </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input type="text" required placeholder="admin" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input type={showPassword ? "text" : "password"} required placeholder="••••••••" className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={isLoading} type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70">
                {isLoading ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : <><LogIn size={20} /> MASUK DASHBOARD</>}
              </motion.button>
            </form>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
             <p className="text-xs text-slate-400 font-medium tracking-widest uppercase italic">&copy; 2026 SMP NEGERI 18 BUTON TENGAH</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}