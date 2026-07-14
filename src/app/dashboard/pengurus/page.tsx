"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Loader2, Users, Image as ImageIcon, X } from "lucide-react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PengurusPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({ id: "", name: "", role: "", order: "99" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isImageRemoved, setIsImageRemoved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/pengurus");
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        Swal.fire("Gagal", "Ukuran gambar terlalu besar! Maksimal 4MB.", "error");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setIsImageRemoved(false);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setIsImageRemoved(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.role.trim()) return;

    setIsSubmitting(true);
    try {
      const endpoint = isEditing ? `/api/pengurus/${formData.id}` : "/api/pengurus";
      const method = isEditing ? "PUT" : "POST";

      const data = new FormData();
      data.append("name", formData.name);
      data.append("role", formData.role);
      data.append("order", formData.order);
      
      if (imageFile) {
        data.append("image", imageFile);
      } else if (isImageRemoved && isEditing) {
        data.append("remove_image", "true");
      }

      const res = await fetch(endpoint, {
        method,
        body: data,
      });

      if (res.status === 413) {
        throw new Error("Ukuran gambar terlalu besar! Maksimal 4MB.");
      }

      const json = await res.json();
      
      if (res.ok) {
        Swal.fire({ title: "Berhasil", text: json.message, icon: "success", confirmButtonColor: "#15803d" });
        resetForm();
        fetchItems();
      } else {
        Swal.fire({ title: "Gagal", text: json.error, icon: "error" });
      }
    } catch (e: any) {
      Swal.fire({ title: "Gagal", text: e.message || "Terjadi kesalahan sistem", icon: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: 'Hapus Pengurus?',
      text: `Anda yakin ingin menghapus "${name}" dari kepengurusan?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/pengurus/${id}`, { method: "DELETE" });
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
      name: item.name,
      role: item.role,
      order: item.order?.toString() || "99"
    });
    setImagePreview(item.image_url || null);
    setImageFile(null);
    setIsImageRemoved(false);
    setIsEditing(true);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({ id: "", name: "", role: "", order: "99" });
    setImagePreview(null);
    setImageFile(null);
    setIsImageRemoved(false);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Struktur Pengurus</h1>
          <p className="text-sm text-slate-500">Kelola daftar pengurus yang tampil di halaman depan.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              {isEditing ? "Edit Pengurus" : "Tambah Pengurus"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Nama Lengkap</label>
                <Input 
                  placeholder="Misal: Drs. H. Ahmad, M.Pd" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Jabatan</label>
                <Input 
                  placeholder="Misal: Ketua KKM" 
                  value={formData.role} 
                  onChange={e => setFormData({...formData, role: e.target.value})} 
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Nomor Urut Tampil (Makin kecil makin di atas)</label>
                <Input 
                  type="number"
                  placeholder="Misal: 1" 
                  value={formData.order} 
                  onChange={e => setFormData({...formData, order: e.target.value})} 
                />
                <p className="text-xs text-slate-400">Contoh: 1 untuk Ketua, 2 untuk Sekretaris, 99 untuk anggota.</p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700">Foto Profil (Opsional)</label>
                
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-full border-4 border-slate-100" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-500">
                      <ImageIcon className="w-8 h-8 mb-2" />
                      <p className="text-sm font-medium">Klik untuk upload foto</p>
                      <p className="text-xs mt-1">PNG, JPG (Maks. 4MB)</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                )}
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
                    <th className="px-6 py-4 font-semibold">Pengurus</th>
                    <th className="px-6 py-4 font-semibold">Jabatan</th>
                    <th className="px-6 py-4 font-semibold">Urutan</th>
                    <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedItems.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Users className="w-8 h-8 text-slate-300" />
                          <p>Belum ada data pengurus.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                              {item.image_url ? (
                                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <Users className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                            <div className="font-semibold text-slate-800">{item.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-medium border border-emerald-100">
                            {item.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-medium">
                          {item.order}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-slate-200" onClick={() => handleEdit(item)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 border-slate-200" onClick={() => handleDelete(item.id, item.name)}>
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
