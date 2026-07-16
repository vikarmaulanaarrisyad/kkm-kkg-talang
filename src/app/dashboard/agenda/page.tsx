"use client";

import { useState, useEffect, useCallback } from "react";
import { useFormDraft } from "@/hooks/useFormDraft";
import { Plus, Trash2, Pencil, Calendar, Clock, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Swal from "sweetalert2";

type Agenda = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  status: string;
};

const EMPTY_FORM: Omit<Agenda, "id"> = {
  title: "", date: "", time: "", location: "", description: "", status: "Upcoming",
};

export default function AdminAgendaPage() {
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<"list" | "form">("list");
  const [selected, setSelected] = useState<Agenda | null>(null);
  const [search, setSearch] = useState("");
  const { form, setForm, clearDraft } = useFormDraft("draft_agenda", EMPTY_FORM, !!selected);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/agenda");
      const data = await res.json();
      setAgendas(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const setF = (key: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
    setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const isEdit = !!selected;
      const url = isEdit ? `/api/agenda/${selected!.id}` : "/api/agenda";
      const method = isEdit ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      
      Swal.fire("Berhasil", `Agenda berhasil ${isEdit ? "diperbarui" : "ditambahkan"}`, "success");
      setMode("list");
      setSelected(null);
      clearDraft();
      fetchData();
    } catch (error: any) {
      Swal.fire("Gagal", error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: Agenda) => {
    const result = await Swal.fire({
      title: "Hapus Agenda?",
      text: `Apakah Anda yakin ingin menghapus "${item.title}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/agenda/${item.id}`, { method: "DELETE" });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }
      fetchData();
      Swal.fire("Terhapus", "Agenda berhasil dihapus", "success");
    } catch (error: any) {
      Swal.fire("Gagal", error.message, "error");
    }
  };

  const filtered = agendas.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));
  // Urutkan dari yang terbaru/mendatang
  filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (mode === "form") {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => { setMode("list"); setSelected(null); }}>← Kembali</Button>
          <div>
            <h1 className="text-2xl font-bold">{selected ? `Edit Agenda: ${selected.title}` : "Tambah Agenda Baru"}</h1>
            <p className="text-sm text-muted-foreground">Isi detail kegiatan dengan lengkap</p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-1.5">
                <Label>Nama / Judul Kegiatan <span className="text-red-500">*</span></Label>
                <Input value={form.title} onChange={setF("title")} placeholder="Contoh: Rapat Kerja KKM 2026" required />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Tanggal <span className="text-red-500">*</span></Label>
                  <Input type="date" value={form.date} onChange={setF("date")} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Waktu</Label>
                  <Input type="text" value={form.time} onChange={setF("time")} placeholder="08:00 - Selesai" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Lokasi / Tempat</Label>
                  <Input value={form.location} onChange={setF("location")} placeholder="Gedung Serbaguna MIS..." />
                </div>
                <div className="space-y-1.5">
                  <Label>Status Kegiatan</Label>
                  <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v || "" }))}>
                    <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Upcoming">Akan Datang (Upcoming)</SelectItem>
                      <SelectItem value="Completed">Selesai (Completed)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Deskripsi / Catatan Tambahan</Label>
                <Textarea value={form.description} onChange={setF("description")} placeholder="Peserta wajib membawa laptop, dsb..." rows={4} />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => { setMode("list"); setSelected(null); }}>Batal</Button>
                <Button type="submit" disabled={saving}>{saving ? "Menyimpan..." : "Simpan Agenda"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agenda Kegiatan</h1>
          <p className="text-sm text-muted-foreground">Kelola jadwal kegiatan KKM dan KKG</p>
        </div>
        <Button onClick={() => { setForm(EMPTY_FORM); setSelected(null); setMode("form"); }} className="gap-2">
          <Plus className="w-4 h-4" /> Tambah Agenda
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Cari kegiatan..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-16 text-center">
          <Calendar className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="font-semibold text-muted-foreground">Belum ada agenda</p>
          <p className="text-sm text-muted-foreground mt-1">Klik "Tambah Agenda" untuk membuat jadwal baru.</p>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(a => (
            <Card key={a.id} className="hover:shadow-md transition-all">
              <CardContent className="p-5">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={a.status === "Completed" ? "secondary" : "default"} className={a.status === "Completed" ? "bg-gray-100 text-gray-600" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}>
                        {a.status === "Completed" ? "Selesai" : "Akan Datang"}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(a.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg leading-tight mb-2">{a.title}</h3>
                    
                    <div className="space-y-1 mt-3 text-sm text-muted-foreground">
                      {a.time && (
                        <p className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {a.time}</p>
                      )}
                      {a.location && (
                        <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {a.location}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-col">
                    <Button size="icon" variant="outline" className="w-8 h-8" onClick={() => { 
                      setForm({ title: a.title, date: a.date, time: a.time, location: a.location, description: a.description, status: a.status });
                      setSelected(a); 
                      setMode("form"); 
                    }}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="w-8 h-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(a)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
