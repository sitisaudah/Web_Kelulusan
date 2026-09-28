import React from 'react';
import AdminSidebar from '@/components/portal/AdminSidebar';
import { getCurrentUserAction } from '@/backend/actions/authActions';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Panel Admin & Guru | SMP Negeri 18 Buton Tengah',
};

export default async function AdminLayout({ children }) {
  const { user, profile } = await getCurrentUserAction();
  const cookieStore = await cookies();
  const legacySession = cookieStore.get('admin_session')?.value;

  // Profil pengguna fallback untuk legacy session
  const activeProfile = profile || {
    nama_lengkap: legacySession === 'active' ? 'Administrator (Legacy)' : 'Staf Sekolah',
    email: user?.email || 'admin@smpn18.sch.id',
    role: profile?.role || 'admin',
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar userProfile={activeProfile} />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}
