import './globals.css';
import { Inter } from 'next/font/google';
import Providers from './providers';
import Navbar from '../components/navbar';
import Footer from '../components/footer';

// Google Font: Inter — tipografi modern untuk portal pendidikan
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: {
    default: 'Portal Web Sekolah',
    template: '%s | Portal Web Sekolah',
  },
  description: 'Portal informasi, ujian online, dan pengumuman kelulusan sekolah.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="bg-slate-50 text-slate-900 flex flex-col min-h-screen font-sans antialiased">
        <Providers>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}