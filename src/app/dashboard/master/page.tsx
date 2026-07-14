"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Settings, Briefcase, GraduationCap, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Swal from "sweetalert2";

type MasterItem = {
  id: string;
  kategori: string;
  nama_nilai: string;
};

const CATEGORIES = [
  { id: "status_kepegawaian", label: "Status Kepegawaian", icon: Settings, color: "text-blue-500" },
  { id: "jabatan", label: "Jabatan / Tugas", icon: Briefcase, color: "text-amber-500" },
  { id: "pendidikan_terakhir", label: "Pendidikan Terakhir", icon: GraduationCap, color: "text-emerald-500" },
];

export default function MasterDataPage() {
  const [data, setData] = useState<MasterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("status_kepegawaian");
  const [newValue, setNewValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/master");
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValue.trim()) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/master", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kategori: activeTab, nama_nilai: newValue }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      
      setNewValue("");
      fetchData();
      Swal.fire("Berhasil", "Data berhasil ditambahkan", "success");
    } catch (error: any) {
      Swal.fire("Gagal", error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: MasterItem) => {
    const result = await Swal.fire({
      title: "Hapus Data?",
      text: `Apakah Anda yakin ingin menghapus "${item.nama_nilai}"? Data guru yang sudah menggunakan nilai ini mungkin akan terdampak.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/master/${item.id}`, { method: "DELETE" });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }
      fetchData();
      Swal.fire("Terhapus", "Data berhasil dihapus", "success");
    } catch (error: any) {
      Swal.fire("Gagal", error.message, "error");
    }
  };

  const activeData = data.filter(d => d.kategori === activeTab);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Master Data</h1>
          <p className="text-sm text-muted-foreground">Kelola pilihan dropdown untuk form data guru</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-2">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left font-semibold text-sm ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "bg-card hover:bg-muted text-muted-foreground border"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-primary-foreground" : cat.color}`} />
                {cat.label}
              </button>
            )
          })}
        </div>

        <div className="md:col-span-3">
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-4">
                Kelola {CATEGORIES.find(c => c.id === activeTab)?.label}
              </h2>
              
              <form onSubmit={handleAdd} className="flex gap-3 mb-6">
                <Input 
                  placeholder="Ketik nilai baru (cth: Honorer)" 
                  value={newValue}
                  onChange={e => setNewValue(e.target.value)}
                  disabled={isSubmitting}
                  className="flex-1"
                />
                <Button type="submit" disabled={isSubmitting || !newValue.trim()} className="gap-2">
                  <Plus className="w-4 h-4" /> Tambah
                </Button>
              </form>

              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : activeData.length === 0 ? (
                <div className="text-center py-10 bg-muted/30 rounded-xl border border-dashed">
                  <p className="text-muted-foreground font-medium">Belum ada data untuk kategori ini</p>
                </div>
              ) : (
                <div className="border rounded-xl overflow-hidden bg-background">
                  <ul className="divide-y divide-border">
                    {activeData.map((item, i) => (
                      <li key={item.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <span className="text-muted-foreground text-sm font-mono w-6 text-center">{i + 1}</span>
                          <span className="font-semibold">{item.nama_nilai}</span>
                        </div>
                        <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(item)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
