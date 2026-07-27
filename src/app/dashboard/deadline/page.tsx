"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Calendar, Search, Clock } from "lucide-react";
import Swal from "sweetalert2";

export default function AdminDeadlinePage() {
  const [deadlines, setDeadlines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [category, setCategory] = useState("Umum");

  const categories = ["Umum", "EMIS", "Simpatika", "RDM", "PDUM", "Verval PD"];

  useEffect(() => {
    fetchDeadlines();
  }, []);

  const fetchDeadlines = async () => {
    try {
      const res = await fetch("/api/deadlines?all=true");
      const json = await res.json();
      if (json.data) {
        setDeadlines(json.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setDate("");
    setTime("23:59");
    setCategory("Umum");
    setShowModal(true);
  };

  const openEditModal = (deadline: any) => {
    const d = new Date(deadline.date);
    const dateStr = d.toISOString().split('T')[0];
    const timeStr = d.toTimeString().split(' ')[0].substring(0, 5);

    setEditingId(deadline.id);
    setTitle(deadline.title);
    setDescription(deadline.description || "");
    setDate(dateStr);
    setTime(timeStr);
    setCategory(deadline.category);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !time) {
      Swal.fire("Error", "Judul, tanggal, dan waktu wajib diisi", "error");
      return;
    }

    try {
      Swal.fire({ title: 'Menyimpan...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      
      const fullDate = new Date(`${date}T${time}:00`).toISOString();
      const url = editingId ? `/api/deadlines/${editingId}` : "/api/deadlines";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, date: fullDate, category })
      });

      if (!res.ok) throw new Error("Gagal menyimpan data");

      await fetchDeadlines();
      closeModal();
      Swal.fire("Berhasil!", "Pengingat deadline berhasil disimpan", "success");
    } catch (error) {
      Swal.fire("Error", "Terjadi kesalahan sistem", "error");
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Hapus Pengingat?',
      text: "Anda tidak dapat mengembalikan ini!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus!'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/deadlines/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Gagal menghapus");
        
        await fetchDeadlines();
        Swal.fire('Terhapus!', 'Pengingat telah dihapus.', 'success');
      } catch (error) {
        Swal.fire('Error', 'Gagal menghapus pengingat', 'error');
      }
    }
  };

  const filteredDeadlines = deadlines.filter(d => 
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kelola Pengingat & Cut-off</h1>
          <p className="text-slate-500">Atur widget hitung mundur untuk mengingatkan operator</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-amber-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-600 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Tambah Deadline
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Cari deadline..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left text-sm font-semibold text-slate-600">
                <th className="p-4">Agenda / Tenggat Waktu</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Tanggal Cut-off</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-500">Memuat data...</td></tr>
              ) : filteredDeadlines.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-500">Tidak ada pengingat ditemukan.</td></tr>
              ) : (
                filteredDeadlines.map(deadline => {
                  const d = new Date(deadline.date);
                  const isExpired = d < new Date();

                  return (
                    <tr key={deadline.id} className={`border-b border-slate-100 hover:bg-slate-50 ${isExpired ? 'opacity-60' : ''}`}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isExpired ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-600'}`}>
                            <Clock className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{deadline.title}</p>
                            <p className="text-xs text-slate-500 truncate max-w-xs">{deadline.description || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">
                          {deadline.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm">
                          <span className={isExpired ? 'text-red-500 font-semibold' : 'text-slate-700 font-semibold'}>
                            {d.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                          <span className="text-slate-500 text-xs">
                            {d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                          </span>
                        </div>
                        {isExpired && <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Expired</span>}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openEditModal(deadline)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(deadline.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">{editingId ? "Edit Pengingat" : "Tambah Pengingat Baru"}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <span className="font-bold text-xl">&times;</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="deadlineForm" onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Judul Tenggat Waktu (Contoh: Cut-off EMIS)</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan Singkat (Opsional)</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                  <select 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
                    <input 
                      type="date" 
                      required
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Waktu (WIB)</label>
                    <input 
                      type="time" 
                      required
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                    />
                  </div>
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
                form="deadlineForm"
                className="px-6 py-2 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
