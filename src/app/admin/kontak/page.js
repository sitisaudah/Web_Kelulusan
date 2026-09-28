"use client";
import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Mail, Phone, Calendar, 
  Trash2, CheckCircle2, Eye, Loader2 
} from 'lucide-react';
import Topbar from '@/components/portal/Topbar';
import { getPesanKontakList, tandaiPesanDibaca, hapusPesanKontak } from '@/backend/actions/kontakActions';

export default function AdminKontakPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const res = await getPesanKontakList();
      if (res.success) {
        setMessages(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleSelect = async (msg) => {
    setSelectedMessage(msg);
    if (!msg.is_read) {
      await tandaiPesanDibaca(msg.id);
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m))
      );
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus pesan ini?')) return;

    try {
      const res = await hapusPesanKontak(id);
      if (res.success) {
        if (selectedMessage?.id === id) setSelectedMessage(null);
        loadMessages();
      } else {
        alert(res.message || 'Gagal menghapus pesan.');
      }
    } catch (err) {
      alert('Terjadi kesalahan.');
    }
  };

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <div className="space-y-8">
      <Topbar
        title="Kotak Masuk Pesan &amp; Saran"
        subtitle="Pesan dan Aspirasi Pengunjung dari Formulir Kontak Website Publik"
      />

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-base font-extrabold text-slate-800">
            Daftar Pesan Masuk ({messages.length})
          </h2>
          <p className="text-xs text-slate-500">
            {unreadCount} pesan belum dibaca
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Kolom Daftar Pesan */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100 max-h-[700px] overflow-y-auto">
          {loading ? (
            <div className="py-12 text-center text-slate-400">
              <Loader2 className="animate-spin mx-auto text-blue-600 mb-2" size={24} />
              Memuat pesan masuk...
            </div>
          ) : messages.length > 0 ? (
            messages.map((m) => {
              const isSelected = selectedMessage?.id === m.id;

              return (
                <div
                  key={m.id}
                  onClick={() => handleSelect(m)}
                  className={`p-4 transition cursor-pointer flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-blue-50/80 border-l-4 border-blue-600'
                      : m.is_read
                      ? 'bg-white hover:bg-slate-50'
                      : 'bg-blue-50/30 font-bold hover:bg-blue-50/60'
                  }`}
                >
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {m.nama}
                    </span>
                    {!m.is_read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                    )}
                  </div>
                  <h4 className="text-xs font-semibold text-slate-700 truncate">
                    {m.subjek}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1">
                    {m.pesan}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1">
                    {new Date(m.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              Belum ada pesan masuk dari pengunjung website.
            </div>
          )}
        </div>

        {/* Kolom Detail Pesan */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm min-h-[400px]">
          {selectedMessage ? (
            <div className="space-y-6">
              <div className="flex justify-between items-start gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-black text-slate-800">
                    {selectedMessage.subjek}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-500 mt-2">
                    <span className="font-bold text-slate-700">
                      Pengirim: {selectedMessage.nama}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail size={14} /> {selectedMessage.email}
                    </span>
                    {selectedMessage.no_hp && (
                      <span className="flex items-center gap-1">
                        <Phone size={14} /> {selectedMessage.no_hp}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(selectedMessage.id)}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                  title="Hapus Pesan"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Teks Isi Pesan */}
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                {selectedMessage.pesan}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-100">
                <span>
                  Waktu Kirim:{' '}
                  {new Date(selectedMessage.created_at).toLocaleString('id-ID')}
                </span>
                <a
                  href={`mailto:${selectedMessage.email}?subject=Balasan: ${encodeURIComponent(selectedMessage.subjek)}`}
                  className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
                >
                  <Mail size={14} /> Balas via Email
                </a>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
              <MessageSquare size={36} className="text-slate-300" />
              <p className="text-xs font-bold">Pilih pesan di sebelah kiri untuk membaca isi lengkap</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
