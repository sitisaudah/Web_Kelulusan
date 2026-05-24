export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 pt-12 pb-8 px-4">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
        <div>
          <h4 className="font-bold text-blue-900 mb-4">SMP NEGERI  18  BUTON TENGAH</h4>
          <p className="text-slate-500 text-sm leading-relaxed">
            Jalan Poros Waburense, Desa Tanailandu, Kecamatan Mawasangka, Kabupaten Buton Tengah, Sulawesi Tenggara
          </p>
        </div>
        <div>
          <h4 className="font-bold text-slate-800 mb-4">Kontak Kami</h4>
          <p className="text-slate-500 text-sm">
            Email: info@smpn1.sch.id<br/>
            Telp: (021) 12345678
          </p>
        </div>
        <div>
          <h4 className="font-bold text-slate-800 mb-4">Media Sosial</h4>
          <div className="flex space-x-4">
            <span className="text-sm text-slate-500 hover:text-blue-600 cursor-pointer transition-colors">Instagram</span>
            <span className="text-sm text-slate-500 hover:text-blue-600 cursor-pointer transition-colors">Facebook</span>
            <span className="text-sm text-slate-500 hover:text-blue-600 cursor-pointer transition-colors">YouTube</span>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-slate-100 mt-8 pt-8 text-center text-slate-400 text-xs">
        &copy; 2026 SMP Negeri 18 Buton Tengah. All Rights Reserved.
      </div>
    </footer>
  );
}