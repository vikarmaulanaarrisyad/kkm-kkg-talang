"use client";

import { useEffect, useState } from "react";
import { Mail, Search, Trash2, Eye, Loader2, MessageSquare } from "lucide-react";
import Swal from "sweetalert2";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Pesan {
  id: string;
  nama: string;
  email: string;
  subjek: string;
  pesan: string;
  created_at: string;
}

export default function PesanMasukPage() {
  const [data, setData] = useState<Pesan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPesan, setSelectedPesan] = useState<Pesan | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/dashboard/kontak");
      const result = await res.json();
      setData(result || []);
    } catch (error) {
      console.error("Gagal mengambil data pesan", error);
      Swal.fire("Error", "Gagal mengambil data pesan", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Hapus Pesan?",
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal"
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/dashboard/kontak?id=${id}`, { method: "DELETE" });
        if (res.ok) {
          Swal.fire("Terhapus!", "Pesan berhasil dihapus.", "success");
          fetchData();
        } else {
          throw new Error("Gagal menghapus");
        }
      } catch (error) {
        Swal.fire("Error", "Gagal menghapus pesan", "error");
      }
    }
  };

  const filteredData = data.filter(item => 
    item.nama?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.subjek?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Mail className="w-6 h-6 text-emerald-600" />
            Pesan Masuk
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Kelola pesan, saran, dan pertanyaan dari masyarakat.
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari pengirim, email, atau subjek..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
              />
            </div>
            <Badge variant="secondary" className="px-4 py-2 bg-emerald-50 text-emerald-700 font-semibold text-sm self-start sm:self-center">
              Total: {filteredData.length} Pesan
            </Badge>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center py-20 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : filteredData.length > 0 ? (
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/50 text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-4">Pengirim</th>
                    <th className="px-6 py-4">Subjek</th>
                    <th className="px-6 py-4">Tanggal</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{item.nama}</div>
                        <div className="text-slate-500 text-xs">{item.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-700">{item.subjek}</div>
                        <div className="text-slate-500 text-xs truncate max-w-[200px]">{item.pesan}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedPesan(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Baca Pesan"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-16 px-4">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Tidak ada pesan</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">
                  Belum ada pesan masuk atau pencarian Anda tidak menemukan hasil.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal Detail Pesan */}
      {selectedPesan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{selectedPesan.subjek}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs bg-white">{selectedPesan.nama}</Badge>
                  <span className="text-slate-400 text-xs">•</span>
                  <span className="text-slate-500 text-xs">{selectedPesan.email}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPesan(null)}
                className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 p-2 rounded-full transition-colors border border-slate-200"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="bg-slate-50 p-5 rounded-xl text-slate-700 whitespace-pre-wrap text-sm leading-relaxed border border-slate-100">
                {selectedPesan.pesan}
              </div>
              <div className="mt-4 text-right">
                <span className="text-xs text-slate-400">
                  Dikirim pada: {selectedPesan.created_at ? new Date(selectedPesan.created_at).toLocaleString('id-ID') : "-"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
