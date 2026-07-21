"use client";

import { useState, useEffect, useCallback } from "react";
import { FileSignature, Search, Loader2, Download, Mail, FileText, ClipboardList, ChevronLeft, CalendarDays, Clock, Inbox } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DownloadPdfBtn from "@/components/surat/DownloadPdfBtn";

interface Surat {
  id: string;
  nomor_surat?: string;
  judul: string;
  jenis: string;
  isi: string;
  file_url: string;
  created_at: string;
  created_by: string;
  sudah_dibaca: boolean;
}

const jenisIcon = (jenis: string) => {
  if (jenis.includes("Undangan")) return <Mail className="w-4 h-4 text-blue-500" />;
  if (jenis.includes("Keputusan")) return <FileText className="w-4 h-4 text-amber-500" />;
  return <ClipboardList className="w-4 h-4 text-emerald-500" />;
};

const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  const now = new Date();
  const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  
  if (isToday) {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
};

export default function MadrasahSuratPage() {
  const [data, setData] = useState<Surat[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSurat, setSelectedSurat] = useState<Surat | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/surat/madrasah");
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const markAsRead = async (surat: Surat) => {
    setSelectedSurat(surat);
    if (!surat.sudah_dibaca) {
      try {
        await fetch("/api/surat/madrasah", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ surat_id: surat.id })
        });
        setData(prev => prev.map(s => s.id === surat.id ? { ...s, sudah_dibaca: true } : s));
      } catch (e) {
        console.error("Gagal menandai dibaca:", e);
      }
    }
  };

  const filtered = data.filter(s =>
    s.judul?.toLowerCase().includes(search.toLowerCase()) ||
    s.jenis?.toLowerCase().includes(search.toLowerCase())
  );

  const unreadCount = data.filter(s => !s.sudah_dibaca).length;

  return (
    <div className="h-[calc(100vh-8rem)] min-h-[600px] flex flex-col space-y-4 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileSignature className="w-7 h-7 text-emerald-600" />
            Kotak Masuk KKG
          </h1>
          <p className="text-slate-500 text-sm mt-1">E-Office — Surat menyurat resmi dari KKG Pusat.</p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input type="text" placeholder="Cari surat atau edaran..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm shadow-sm" />
        </div>
      </div>

      {/* Main Container - 2 Pane Layout */}
      <Card className="flex-1 border border-slate-200 shadow-sm rounded-2xl overflow-hidden flex flex-col md:flex-row bg-white">
        
        {/* Left Pane: Inbox List */}
        <div className={`w-full md:w-96 shrink-0 border-r border-slate-100 flex flex-col ${selectedSurat ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <Inbox className="w-5 h-5 text-slate-500" />
              <span className="font-semibold text-slate-700">Inbox</span>
            </div>
            {unreadCount > 0 ? (
              <Badge className="bg-red-500 hover:bg-red-600 text-white shadow-sm px-2 py-0.5 animate-pulse">
                {unreadCount} Baru
              </Badge>
            ) : (
              <Badge variant="outline" className="text-slate-500 bg-white">Semua Dibaca</Badge>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-40"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 px-6">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <Mail className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-base font-bold text-slate-700 mb-1">Kotak Masuk Kosong</h3>
                <p className="text-slate-500 text-sm">Tidak ada pesan yang ditemukan.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100/60">
                {filtered.map((s) => {
                  const isSelected = selectedSurat?.id === s.id;
                  return (
                    <div 
                      key={s.id} 
                      onClick={() => markAsRead(s)}
                      className={`p-4 cursor-pointer transition-all border-l-4 ${
                        isSelected 
                          ? "bg-emerald-50/50 border-emerald-500" 
                          : !s.sudah_dibaca 
                            ? "bg-white border-blue-500 hover:bg-slate-50" 
                            : "bg-white border-transparent hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1 gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {jenisIcon(s.jenis)}
                          <span className="text-xs font-semibold text-slate-500 truncate">{s.created_by || "KKG Pusat"}</span>
                        </div>
                        <span className={`text-[11px] whitespace-nowrap ${!s.sudah_dibaca ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
                          {s.created_at ? formatDate(s.created_at) : ""}
                        </span>
                      </div>
                      
                      <h4 className={`text-sm mb-1 line-clamp-1 pr-2 ${!s.sudah_dibaca ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                        {s.judul}
                      </h4>
                      
                      <div className="flex items-center justify-between mt-1.5">
                        <p className={`text-xs line-clamp-1 flex-1 pr-2 ${!s.sudah_dibaca ? 'text-slate-600 font-medium' : 'text-slate-500'}`}>
                          {s.isi?.replace(/\n/g, ' ') || <span className="italic">Tidak ada isi teks</span>}
                        </p>
                        {s.file_url && <Download className="w-3 h-3 text-slate-400 shrink-0" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Reading Area */}
        <div className={`flex-1 bg-white flex-col h-full ${!selectedSurat ? 'hidden md:flex' : 'flex'}`}>
          {!selectedSurat ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/30">
              <img src="https://illustrations.popsy.co/emerald/surreal-hourglass.svg" alt="Select message" className="w-64 h-64 opacity-50 mb-6" onError={(e) => e.currentTarget.style.display = 'none'} />
              <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mb-6 border border-emerald-100">
                <Mail className="w-10 h-10 text-emerald-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">Belum Ada Pesan Terpilih</h3>
              <p className="text-slate-500 text-center max-w-sm">
                Pilih surat dari daftar di sebelah kiri untuk membaca isi lengkap dan mengunduh lampirannya.
              </p>
            </div>
          ) : (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Reading Pane Header */}
              <div className="p-4 sm:p-6 border-b border-slate-100 shrink-0 bg-white">
                <button 
                  onClick={() => setSelectedSurat(null)}
                  className="md:hidden flex items-center gap-1 text-sm font-semibold text-emerald-600 mb-4 hover:bg-emerald-50 px-2 py-1 -ml-2 rounded-lg w-max"
                >
                  <ChevronLeft className="w-4 h-4" /> Kembali
                </button>
                
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-200">
                    {selectedSurat.jenis}
                  </Badge>
                  {selectedSurat.nomor_surat && (
                    <span className="text-xs font-mono text-slate-400">
                      No: {selectedSurat.nomor_surat}
                    </span>
                  )}
                </div>
                
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight mb-4">
                  {selectedSurat.judul}
                </h2>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200">
                      <span className="font-bold text-emerald-700">{selectedSurat.created_by?.charAt(0) || "K"}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{selectedSurat.created_by || "Admin KKG Pusat"}</p>
                      <p className="text-xs text-slate-500">Kepada: Kepala Madrasah / Operator</p>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-slate-600 flex items-center gap-1.5 justify-end">
                      <CalendarDays className="w-4 h-4 text-slate-400" />
                      {selectedSurat.created_at ? new Date(selectedSurat.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' }) : "-"}
                    </p>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 justify-end mt-1">
                      <Clock className="w-3.5 h-3.5" />
                      {selectedSurat.created_at ? new Date(selectedSurat.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ""}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Reading Pane Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50/30">
                <div className="max-w-3xl mx-auto">
                  {selectedSurat.isi ? (
                    <div className="prose prose-slate prose-sm sm:prose-base max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {selectedSurat.isi}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-slate-400 italic">
                      Surat ini tidak memiliki isi teks. Silakan periksa lampiran.
                    </div>
                  )}
                  
                  <div className="mt-12 pt-6 border-t border-slate-200">
                    <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" /> Lampiran & Dokumen Resmi
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {selectedSurat.file_url && (
                        <a href={selectedSurat.file_url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-all group">
                          <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" /> 
                          Unduh Lampiran Asli
                        </a>
                      )}
                      {/* Tombol PDF bawaan dengan Kop KKG */}
                      <DownloadPdfBtn surat={selectedSurat} />
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
