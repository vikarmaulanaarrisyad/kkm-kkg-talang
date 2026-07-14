"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Loader2, Download, FileText, Calendar, FileSignature, BookOpen, Link as LinkIcon } from "lucide-react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function UnduhanPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({ id: "", title: "", url: "", icon_type: "FileText" });
  const [isEditing, setIsEditing] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/unduhan");
      const json = await res.json();
      if (json.data) {
        setItems(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.url.trim()) return;

    setIsSubmitting(true);
    try {
      const endpoint = isEditing ? `/api/unduhan/${formData.id}` : "/api/unduhan";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      
      if (res.ok) {
        Swal.fire({ title: "Berhasil", text: json.message, icon: "success", confirmButtonColor: "#15803d" });
        resetForm();
        fetchItems();
      } else {
        Swal.fire({ title: "Gagal", text: json.error, icon: "error" });
      }
    } catch (e) {
      Swal.fire({ title: "Gagal", text: "Terjadi kesalahan sistem", icon: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    const result = await Swal.fire({
      title: 'Hapus Unduhan?',
      text: `Anda yakin ingin menghapus dokumen "${title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/unduhan/${id}`, { method: "DELETE" });
        const json = await res.json();
        
        if (res.ok) {
          Swal.fire({ title: "Terhapus", text: json.message, icon: "success", confirmButtonColor: "#15803d" });
          fetchItems();
        } else {
          Swal.fire({ title: "Gagal", text: json.error, icon: "error" });
        }
      } catch (e) {
        Swal.fire({ title: "Gagal", text: "Terjadi kesalahan sistem", icon: "error" });
      }
    }
  };

  const handleEdit = (item: any) => {
    setFormData({
      id: item.id,
      title: item.title,
      url: item.url,
      icon_type: item.icon_type || "FileText"
    });
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormData({ id: "", title: "", url: "", icon_type: "FileText" });
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const paginatedItems = items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getIconPreview = (type: string) => {
    switch(type) {
      case 'FileText': return <FileText className="w-5 h-5 text-emerald-600" />;
      case 'Calendar': return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'FileSignature': return <FileSignature className="w-5 h-5 text-amber-600" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5 text-purple-600" />;
      default: return <Download className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pojok Unduhan</h1>
          <p className="text-sm text-slate-500">Kelola tautan dokumen untuk diunduh oleh pengunjung.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-4">{isEditing ? "Edit Dokumen" : "Tambah Dokumen Baru"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Judul Dokumen</label>
                <Input 
                  placeholder="Misal: Format RPP Kurmer" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">URL Tautan / File (Google Drive)</label>
                <Input 
                  placeholder="https://drive.google.com/..." 
                  value={formData.url} 
                  onChange={e => setFormData({...formData, url: e.target.value})} 
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Tipe Ikon</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  value={formData.icon_type}
                  onChange={e => setFormData({...formData, icon_type: e.target.value})}
                >
                  <option value="FileText">Teks / Dokumen (Hijau)</option>
                  <option value="Calendar">Kalender (Biru)</option>
                  <option value="FileSignature">Surat Resmi (Oranye)</option>
                  <option value="BookOpen">Buku / Juknis (Ungu)</option>
                  <option value="Download">Umum / Download (Abu-abu)</option>
                </select>
                <div className="flex items-center gap-2 mt-2 text-sm text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span>Pratinjau Ikon:</span>
                  {getIconPreview(formData.icon_type)}
                </div>
              </div>
              
              <div className="pt-2 flex gap-2">
                <Button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                  {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : (isEditing ? <Edit className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />)}
                  {isEditing ? 'Simpan Perubahan' : 'Tambahkan'}
                </Button>
                {isEditing && (
                  <Button type="button" variant="outline" onClick={resetForm} className="w-full">Batal</Button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Dokumen</th>
                    <th className="px-6 py-4 font-semibold">Tautan</th>
                    <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedItems.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Download className="w-8 h-8 text-slate-300" />
                          <p>Belum ada data dokumen unduhan.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                              {getIconPreview(item.icon_type)}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-800">{item.title}</div>
                              <div className="text-xs text-slate-400 mt-0.5">{new Date(item.created_at).toLocaleDateString('id-ID')}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors text-xs font-medium max-w-[200px] truncate">
                            <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{item.url}</span>
                          </a>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-slate-200" onClick={() => handleEdit(item)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 border-slate-200" onClick={() => handleDelete(item.id, item.title)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Sebelumnya
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
