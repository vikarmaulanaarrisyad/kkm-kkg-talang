"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Calendar, CheckCircle2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Swal from "sweetalert2";

type TahunAjaran = {
  id: string;
  nama_tahun: string;
  semester: string;
};

export default function TahunAjaranPage() {
  const [data, setData] = useState<TahunAjaran[]>([]);
  const [activeTahun, setActiveTahun] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ nama_tahun: "", semester: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resTahun, resSet] = await Promise.all([
        fetch("/api/tahun-ajaran"),
        fetch("/api/settings")
      ]);
      const dataTahun = await resTahun.json();
      const dataSet = await resSet.json();
      
      setData(Array.isArray(dataTahun) ? dataTahun : []);
      setActiveTahun(dataSet.data?.tahun_ajaran_aktif || "");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama_tahun || !form.semester) {
      Swal.fire("Peringatan", "Semua kolom wajib diisi", "warning");
      return;
    }

    setIsSubmitting(true);
    Swal.fire({ title: 'Menyimpan...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
      const res = await fetch("/api/tahun-ajaran", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      
      await fetchData();
      Swal.fire("Berhasil", "Tahun ajaran berhasil ditambahkan", "success");
      setIsAdding(false);
      setForm({ nama_tahun: "", semester: "" });
    } catch (err: any) {
      Swal.fire("Gagal", err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await Swal.fire({
      title: "Hapus Tahun Ajaran?",
      text: "Data yang sudah digunakan di rombel mungkin akan terpengaruh.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal"
    });

    if (res.isConfirmed) {
      try {
        const response = await fetch(`/api/tahun-ajaran/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Gagal menghapus");
        Swal.fire("Terhapus", "Data berhasil dihapus", "success");
        fetchData();
      } catch (err: any) {
        Swal.fire("Gagal", err.message, "error");
      }
    }
  };

  const handleSetActive = async (t: TahunAjaran) => {
    const activeString = `${t.nama_tahun} - ${t.semester}`;
    
    Swal.fire({ title: 'Mengaktifkan...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    
    try {
      const formData = new FormData();
      formData.append("tahun_ajaran_aktif", activeString);
      
      const res = await fetch("/api/settings", {
        method: "PUT",
        body: formData
      });
      
      if (!res.ok) throw new Error("Gagal mengaktifkan tahun ajaran");
      
      await fetchData();
      Swal.fire("Berhasil", `${activeString} sekarang menjadi Tahun Ajaran aktif`, "success");
    } catch (err: any) {
      Swal.fire("Gagal", err.message, "error");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Calendar className="w-7 h-7 text-primary" />
            Tahun Ajaran
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola data tahun ajaran dan semester aktif</p>
        </div>
        <Button onClick={() => setIsAdding(true)} className="w-full sm:w-auto shadow-md">
          <Plus className="w-4 h-4 mr-2" /> Tambah Tahun Ajaran
        </Button>
      </div>

      <Dialog open={isAdding} onOpenChange={setIsAdding}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Tahun Ajaran</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Tahun (misal: 2024/2025)</Label>
              <Input value={form.nama_tahun} onChange={e => setForm(p => ({ ...p, nama_tahun: e.target.value }))} placeholder="2024/2025" required />
            </div>
            <div className="space-y-2">
              <Label>Semester</Label>
              <Select value={form.semester} onValueChange={v => setForm(p => ({ ...p, semester: v || "" }))}>
                <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ganjil">Ganjil</SelectItem>
                  <SelectItem value="Genap">Genap</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full mt-4">Simpan</Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-4 py-3 text-left font-bold text-muted-foreground w-16">No</th>
              <th className="px-4 py-3 text-left font-bold text-muted-foreground">Tahun Ajaran</th>
              <th className="px-4 py-3 text-left font-bold text-muted-foreground">Semester</th>
              <th className="px-4 py-3 text-center font-bold text-muted-foreground">Status Aktif</th>
              <th className="px-4 py-3 text-right font-bold text-muted-foreground">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-10">Memuat...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-muted-foreground">Belum ada data</td></tr>
            ) : data.map((t, i) => {
              const str = `${t.nama_tahun} - ${t.semester}`;
              const isActive = str === activeTahun;
              return (
                <tr key={t.id} className={`border-b last:border-0 ${isActive ? 'bg-primary/5' : 'hover:bg-muted/30'} transition-colors`}>
                  <td className="px-4 py-4">{i + 1}</td>
                  <td className="px-4 py-4 font-bold">{t.nama_tahun}</td>
                  <td className="px-4 py-4">{t.semester}</td>
                  <td className="px-4 py-4 text-center">
                    {isActive ? (
                      <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1" /> Aktif</Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">Non-Aktif</Badge>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {!isActive && (
                        <Button variant="outline" size="sm" onClick={() => handleSetActive(t)} className="text-primary border-primary/20 hover:bg-primary/10">
                          Set Aktif
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-100" onClick={() => handleDelete(t.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
