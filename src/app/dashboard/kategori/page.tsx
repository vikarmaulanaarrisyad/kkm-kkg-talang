"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Tag, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function KategoriPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/kategori");
      const json = await res.json();
      if (json.data) {
        setCategories(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/kategori", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      const json = await res.json();
      
      if (res.ok) {
        Swal.fire({ title: "Berhasil", text: json.message, icon: "success", confirmButtonColor: "#15803d" });
        setNewName("");
        fetchCategories();
      } else {
        Swal.fire({ title: "Gagal", text: json.error, icon: "error" });
      }
    } catch (e) {
      Swal.fire({ title: "Gagal", text: "Terjadi kesalahan sistem", icon: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: 'Hapus Kategori?',
      text: `Anda yakin ingin menghapus kategori "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/kategori/${id}`, { method: "DELETE" });
        const json = await res.json();
        
        if (res.ok) {
          Swal.fire({ title: "Terhapus", text: json.message, icon: "success", confirmButtonColor: "#15803d" });
          fetchCategories();
        } else {
          Swal.fire({ title: "Gagal", text: json.error, icon: "error" });
        }
      } catch (e) {
        Swal.fire({ title: "Gagal", text: "Terjadi kesalahan sistem", icon: "error" });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-madrasah-600" />
      </div>
    );
  }

  const totalPages = Math.ceil(categories.length / itemsPerPage);
  const paginatedCategories = categories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Kelola Kategori</h1>
          <p className="text-sm text-gray-500 mt-1">Atur kategori berita untuk mempermudah pencarian.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Plus className="w-5 h-5 mr-2 text-madrasah-600" /> Tambah Kategori
            </h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Nama Kategori</label>
                <Input 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Misal: Pengumuman"
                  required
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full bg-madrasah-700 hover:bg-madrasah-800 text-white" nativeButton>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Simpan Kategori"}
              </Button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50/50 text-gray-600 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Nama Kategori</th>
                    <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-6 py-8 text-center text-gray-500">
                        Belum ada kategori.
                      </td>
                    </tr>
                  ) : (
                    paginatedCategories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center font-medium text-gray-900">
                            <Tag className="w-4 h-4 mr-2 text-madrasah-500" /> {cat.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDelete(cat.id, cat.name)}
                            nativeButton
                            className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border-0"
                          >
                            <Trash2 className="w-4 h-4 mr-1" /> Hapus
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="border-t border-border/50 p-4 flex items-center justify-between bg-muted/10">
                <span className="text-sm text-muted-foreground">
                  Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, categories.length)} dari {categories.length} kategori
                </span>
                <div className="flex gap-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    nativeButton
                  >
                    {"<"}
                  </Button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <Button
                      key={i}
                      variant={currentPage === i + 1 ? "default" : "outline"}
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => setCurrentPage(i + 1)}
                      nativeButton
                    >
                      {i + 1}
                    </Button>
                  ))}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    nativeButton
                  >
                    {">"}
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
