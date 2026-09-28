"use client";
import React, { useState, useRef } from 'react';
import { 
  FileText, ExternalLink, Download, Maximize2, 
  Minimize2, ZoomIn, ZoomOut, RotateCw, AlertCircle 
} from 'lucide-react';

export default function PdfViewer({ 
  url, 
  title = "Naskah Soal Ujian (PDF)", 
  className = "",
  allowDownload = true 
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const containerRef = useRef(null);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error('Fullscreen request failed:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 20, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 20, 60));
  const handleResetZoom = () => setZoom(100);

  if (!url) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl text-center text-slate-400 space-y-3">
        <FileText size={48} className="text-slate-300" />
        <p className="text-xs font-bold text-slate-500">File PDF naskah soal belum diunggah.</p>
      </div>
    );
  }

  // Parameter untuk viewer native PDF browser
  const pdfViewerUrl = `${url}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`;

  return (
    <div 
      ref={containerRef}
      className={`flex flex-col bg-slate-900 rounded-3xl overflow-hidden shadow-lg border border-slate-800 ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''} ${className}`}
    >
      {/* Header Toolbar Viewer */}
      <div className="bg-slate-900/95 backdrop-blur-md px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-slate-200 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
            <FileText size={18} />
          </div>
          <div className="truncate">
            <p className="text-xs font-black text-white truncate">{title}</p>
            <p className="text-[10px] text-slate-400 font-medium">Naskah Soal Resmi &bull; PDF Dokumen</p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Zoom controls */}
          <div className="hidden sm:flex items-center bg-slate-800/80 rounded-xl p-0.5 border border-slate-700/60 text-xs">
            <button
              type="button"
              onClick={handleZoomOut}
              title="Perkecil Tampilan"
              className="p-1.5 hover:text-white text-slate-400 rounded-lg hover:bg-slate-700 transition"
            >
              <ZoomOut size={15} />
            </button>
            <span 
              onClick={handleResetZoom}
              title="Klik untuk reset zoom 100%"
              className="px-2 py-0.5 font-mono text-[11px] font-bold text-slate-300 cursor-pointer hover:text-white"
            >
              {zoom}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              title="Perbesar Tampilan"
              className="p-1.5 hover:text-white text-slate-400 rounded-lg hover:bg-slate-700 transition"
            >
              <ZoomIn size={15} />
            </button>
          </div>

          {/* Buka di Tab Baru */}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            title="Buka PDF di Tab Baru (Disarankan untuk HP)"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition flex items-center gap-1.5 text-xs font-bold"
          >
            <ExternalLink size={16} />
            <span className="hidden md:inline">Buka Tab Baru</span>
          </a>

          {/* Unduh File PDF jika diizinkan */}
          {allowDownload && (
            <a
              href={url}
              download
              title="Unduh Salinan Naskah PDF"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition flex items-center gap-1.5 text-xs font-bold"
            >
              <Download size={16} />
              <span className="hidden md:inline">Unduh</span>
            </a>
          )}

          {/* Layar Penuh (Fullscreen) */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Keluar dari Layar Penuh" : "Mode Layar Penuh"}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Frame Kontainer PDF */}
      <div className="flex-1 w-full relative bg-slate-950 overflow-auto min-h-[450px]">
        <div 
          style={{ 
            width: zoom !== 100 ? `${zoom}%` : '100%', 
            height: '100%',
            minHeight: '100%',
            transition: 'width 0.2s ease-in-out'
          }}
          className="mx-auto h-full"
        >
          <object
            data={pdfViewerUrl}
            type="application/pdf"
            className="w-full h-full min-h-[500px] border-0"
          >
            <iframe
              src={pdfViewerUrl}
              className="w-full h-full min-h-[500px] border-0"
              title={title}
            >
              {/* Fallback jika browser mobile tidak mendukung iframe PDF langsung */}
              <div className="p-8 text-center text-slate-300 flex flex-col items-center justify-center h-full space-y-4">
                <AlertCircle size={40} className="text-amber-400" />
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-white">Browser Tidak Mendukung Penampil PDF Tersemat</h4>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Silakan klik tombol di bawah untuk membuka naskah soal PDF di aplikasi pembaca PDF atau tab baru.
                  </p>
                </div>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition inline-flex items-center gap-2"
                >
                  <ExternalLink size={16} /> Buka Naskah Soal PDF
                </a>
              </div>
            </iframe>
          </object>
        </div>
      </div>
    </div>
  );
}
