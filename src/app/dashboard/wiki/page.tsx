"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, BookOpen } from "lucide-react";
import Swal from "sweetalert2";

export default function AdminWikiPage() {
  const [sops, setSops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Umum");
  const [content, setContent] = useState("");

  const categories = ["Umum", "EMIS", "Simpatika", "RDM", "PDUM", "Verval PD"];

  useEffect(() => {
    fetchSops();
  }, []);

  const fetchSops = async () => {
    try {
      const res = await fetch("/api/wiki");
      const json = await res.json();
      if (json.data) {
        setSops(json.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingSlug(null);
    setTitle("");
    setCategory("Umum");
    setContent("");
    setShowModal(true);
  };

  const openEditModal = (sop: any) => {
    setEditingSlug(sop.slug);
    setTitle(sop.title);
    setCategory(sop.category);
    setContent(sop.content);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      Swal.fire("Error", "Judul dan konten wajib diisi", "error");
      return;
    }

    try {
      Swal.fire({ title: 'Menyimpan...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      
      const url = editingSlug ? `/api/wiki/${editingSlug}` : "/api/wiki";
      const method = editingSlug ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, content })
      });

      if (!res.ok) throw new Error("Gagal menyimpan data");

      await fetchSops();
      closeModal();
      Swal.fire("Berhasil!", "SOP berhasil disimpan", "success");
    } catch (error) {
      Swal.fire("Error", "Terjadi kesalahan sistem", "error");
    }
  };

  const handleDelete = async (slug: string) => {
    const result = await Swal.fire({
      title: 'Hapus SOP?',
      text: "Anda tidak dapat mengembalikan ini!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus!'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/wiki/${slug}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Gagal menghapus");
        
        await fetchSops();
        Swal.fire('Terhapus!', 'SOP telah dihapus.', 'success');
      } catch (error) {
        Swal.fire('Error', 'Gagal menghapus SOP', 'error');
      }
    }
  };

  const filteredSops = sops.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kelola Wiki & SOP</h1>
          <p className="text-slate-500">Pusat panduan pendataan untuk Operator Madrasah</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Tambah SOP
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Cari SOP..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left text-sm font-semibold text-slate-600">
                <th className="p-4">Judul SOP</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Penulis</th>
                <th className="p-4">Terakhir Diupdate</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Memuat data...</td></tr>
              ) : filteredSops.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Tidak ada SOP ditemukan.</td></tr>
              ) : (
                filteredSops.map(sop => (
                  <tr key={sop.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{sop.title}</p>
                          <p className="text-xs text-slate-500">/{sop.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">
                        {sop.category}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{sop.author_name}</td>
                    <td className="p-4 text-sm text-slate-600">
                      {new Date(sop.updated_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(sop)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(sop.slug)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">{editingSlug ? "Edit SOP" : "Tambah SOP Baru"}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <Trash2 className="w-5 h-5" /> {/* Just using any icon for close if X is not imported, let's use a text */}
                <span className="font-bold text-xl">&times;</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="sopForm" onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Judul Panduan / SOP</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Contoh: Cara Mutasi Siswa di EMIS"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                  <select 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Konten Panduan (Markdown / Teks)</label>
                  <textarea 
                    required
                    rows={12}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
                    placeholder="Tulis panduan langkah demi langkah di sini..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  ></textarea>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={closeModal}
                className="px-6 py-2 rounded-xl text-slate-600 font-medium hover:bg-slate-200 transition-colors"
              >
                Batal
              </button>
              <button 
                type="submit" 
                form="sopForm"
                className="px-6 py-2 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors"
              >
                Simpan SOP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
