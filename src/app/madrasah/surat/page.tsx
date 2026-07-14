"use client";

import { useState, useEffect, useCallback } from "react";
import { FileSignature, Search, Eye, Loader2, Download, X, Mail, FileText, ClipboardList } from "lucide-react";
import Swal from "sweetalert2";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DownloadPdfBtn from "@/components/surat/DownloadPdfBtn";

interface Surat {
  id: string;
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileSignature className="w-6 h-6 text-emerald-600" />
            Kotak Masuk Surat
          </h1>
          <p className="text-slate-500 text-sm mt-1">Daftar undangan rapat, surat keputusan, dan edaran dari KKM-KKG.</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input type="text" placeholder="Cari surat..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm" />
            </div>
            <div className="flex gap-2 self-start sm:self-center">
              <Badge variant="secondary" className="px-4 py-2 bg-emerald-50 text-emerald-700 font-semibold text-sm">
                Total: {filtered.length}
              </Badge>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="px-4 py-2 font-semibold text-sm animate-pulse">
                  {unreadCount} Baru
                </Badge>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
          ) : filtered.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/50 text-slate-500 font-medium">
                  <tr>
                    <th className="px-5 py-4 w-12"></th>
                    <th className="px-5 py-4">Surat</th>
                    <th className="px-5 py-4">Jenis</th>
                    <th className="px-5 py-4">Tanggal</th>
                    <th className="px-5 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(s => (
                    <tr key={s.id} className={`transition-colors cursor-pointer ${s.sudah_dibaca ? 'hover:bg-slate-50/70' : 'bg-emerald-50/30 font-semibold hover:bg-emerald-50/50'}`} onClick={() => markAsRead(s)}>
                      <td className="px-5 py-4 text-center">
                        {!s.sudah_dibaca && <div className="w-2 h-2 rounded-full bg-red-500 mx-auto" title="Surat Belum Dibaca"></div>}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {jenisIcon(s.jenis)}
                          <span className={`text-slate-800 line-clamp-1 ${!s.sudah_dibaca ? 'font-bold' : ''}`}>{s.judul}</span>
                        </div>
                        {s.file_url && <span className="text-xs text-emerald-600 flex items-center gap-1 mt-1"><Download className="w-3 h-3" />Ada lampiran</span>}
                      </td>
                      <td className="px-5 py-4 text-slate-600">{s.jenis}</td>
                      <td className="px-5 py-4 text-slate-500 text-xs">
                        {s.created_at ? new Date(s.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Lihat Detail">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 px-4">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Belum ada surat masuk</h3>
              <p className="text-slate-500 text-sm">Anda belum menerima undangan atau SK baru.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Detail Surat */}
      {selectedSurat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {jenisIcon(selectedSurat.jenis)}
                  <Badge variant="outline" className="text-xs bg-white">{selectedSurat.jenis}</Badge>
                </div>
                <h3 className="text-lg font-bold text-slate-800">{selectedSurat.judul}</h3>
                <p className="text-xs text-slate-500 mt-1">Oleh {selectedSurat.created_by} • {selectedSurat.created_at ? new Date(selectedSurat.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' }) : ""}</p>
              </div>
              <button onClick={() => setSelectedSurat(null)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {selectedSurat.isi && (
                <div className="bg-slate-50 p-4 rounded-xl text-slate-700 whitespace-pre-wrap text-sm leading-relaxed border border-slate-100">
                  {selectedSurat.isi}
                </div>
              )}
              
              <div className="flex flex-wrap gap-3 pt-2">
                {selectedSurat.file_url && (
                  <a href={selectedSurat.file_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all">
                    <Download className="w-4 h-4" /> Unduh Lampiran Surat
                  </a>
                )}
                {/* Tombol khusus PDF format resmi Kop KKG */}
                <DownloadPdfBtn surat={selectedSurat} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
