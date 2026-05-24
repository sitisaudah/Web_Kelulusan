import './globals.css'
import Navbar from '../components/navbar'
import Footer from '../components/footer'

export const metadata = {
  title: 'Pengumuman Kelulusan SMP 2025/2026',
  description: 'Sistem Informasi Kelulusan Siswa Online',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="bg-slate-50 text-slate-900 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  )
}