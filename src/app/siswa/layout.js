import React from 'react';
import StudentSidebar from '@/components/portal/StudentSidebar';
import { getCurrentUserAction } from '@/backend/actions/authActions';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Portal Siswa | SMP Negeri 18 Buton Tengah',
};

export default async function StudentLayout({ children }) {
  const { user, profile, studentData } = await getCurrentUserAction();

  // Guard: pastikan yang login adalah siswa atau admin
  if (!user || (profile?.role !== 'siswa' && profile?.role !== 'admin')) {
    redirect('/login?tab=siswa&message=Silakan login sebagai siswa');
  }

  const studentName = studentData?.nama || profile?.nama_lengkap || user.email?.split('@')[0];
  const nisn = studentData?.nisn || user.email?.split('@')[0] || '-';

  return (
    <div className="flex min-h-screen bg-slate-50">
      <StudentSidebar studentName={studentName} nisn={nisn} />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}
