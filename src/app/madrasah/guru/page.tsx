"use client";

import { useState, useEffect } from "react";
import { Plus, Users, Pencil, Trash2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Swal from "sweetalert2";

type Guru = {
  id: string;
  nama: string;
  nuptk: string;
  peg_id: string;
  nip: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: string;
  jabatan: string;
  status_kepegawaian: string;
  pendidikan_terakhir: string;
  bidang_studi: string;
  no_hp: string;
  email: string;
};

const EMPTY_FORM: Omit<Guru, "id"> = {
  nama: "", nuptk: "", peg_id: "", nip: "",
  tempat_lahir: "", tanggal_lahir: "", jenis_kelamin: "",
  jabatan: "", status_kepegawaian: "", pendidikan_terakhir: "",
  bidang_studi: "", no_hp: "", email: "",
};

function GuruForm({ initial, onSave, onCancel, loading, masterData }: {
  initial?: Partial<Guru>;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  masterData: any[];
}) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...(initial || {}) });
  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [key]: e.target.value }));
  const setSelect = (key: string) => (v: string | null) => setForm(f => ({ ...f, [key]: v || "" }));

  const statusOptions = masterData.filter(d => d.kategori === "status_kepegawaian");
  const jabatanOptions = masterData.filter(d => d.kategori === "jabatan");
  const pendidikanOptions = masterData.filter(d => d.kategori === "pendidikan_terakhir");

  return (
    <form onSubmit={async e => { e.preventDefault(); await onSave(form); }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Identitas */}
        <div className="md:col-span-2">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 pb-2 border-b">Identitas Guru</h3>
        </div>
        <div className="md:col-span-2 space-y-1.5">
          <Label>Nama Lengkap <span className="text-red-500">*</span></Label>
          <Input value={form.nama} onChange={set("nama")} placeholder="Nama lengkap guru" required />
        </div>
        <div className="space-y-1.5">
          <Label>NUPTK</Label>
          <Input value={form.nuptk} onChange={set("nuptk")} placeholder="16 digit NUPTK" maxLength={16} />
        </div>
        <div className="space-y-1.5">
          <Label>PegID</Label>
          <Input value={form.peg_id} onChange={set("peg_id")} placeholder="PegID Kemenag" />
        </div>
        <div className="space-y-1.5">
          <Label>NIP</Label>
          <Input value={form.nip} onChange={set("nip")} placeholder="NIP (jika PNS)" />
        </div>
        <div className="space-y-1.5">
          <Label>Jenis Kelamin</Label>
          <Select value={form.jenis_kelamin} onValueChange={setSelect("jenis_kelamin")}>
            <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="L">Laki-laki</SelectItem>
              <SelectItem value="P">Perempuan</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Tempat Lahir</Label>
          <Input value={form.tempat_lahir} onChange={set("tempat_lahir")} placeholder="Kota/Kab." />
        </div>
        <div className="space-y-1.5">
          <Label>Tanggal Lahir</Label>
          <Input type="date" value={form.tanggal_lahir} onChange={set("tanggal_lahir")} />
        </div>

        {/* Kepegawaian */}
        <div className="md:col-span-2 pt-2">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 pb-2 border-b">Data Kepegawaian</h3>
        </div>
        <div className="space-y-1.5">
          <Label>Status Kepegawaian</Label>
          <Select value={form.status_kepegawaian} onValueChange={setSelect("status_kepegawaian")}>
            <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
            <SelectContent>
              {statusOptions.length === 0 && <SelectItem value="PNS" disabled>Belum ada data master</SelectItem>}
              {statusOptions.map(opt => (
                <SelectItem key={opt.id} value={opt.nama_nilai}>{opt.nama_nilai}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Jabatan / Tugas</Label>
          <Select value={form.jabatan} onValueChange={setSelect("jabatan")}>
            <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
            <SelectContent>
              {jabatanOptions.length === 0 && <SelectItem value="Guru" disabled>Belum ada data master</SelectItem>}
              {jabatanOptions.map(opt => (
                <SelectItem key={opt.id} value={opt.nama_nilai}>{opt.nama_nilai}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Pendidikan Terakhir</Label>
          <Select value={form.pendidikan_terakhir} onValueChange={setSelect("pendidikan_terakhir")}>
            <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
            <SelectContent>
              {pendidikanOptions.length === 0 && <SelectItem value="S1" disabled>Belum ada data master</SelectItem>}
              {pendidikanOptions.map(opt => (
                <SelectItem key={opt.id} value={opt.nama_nilai}>{opt.nama_nilai}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Bidang Studi / Mapel</Label>
          <Input value={form.bidang_studi} onChange={set("bidang_studi")} placeholder="Matematika, PAI, dll." />
        </div>

        {/* Kontak */}
        <div className="md:col-span-2 pt-2">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 pb-2 border-b">Kontak</h3>
        </div>
        <div className="space-y-1.5">
          <Label>No. HP / WhatsApp</Label>
          <Input value={form.no_hp} onChange={set("no_hp")} placeholder="08xxxxxxxxxx" />
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input type="email" value={form.email} onChange={set("email")} placeholder="guru@email.com" />
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-2 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>Batal</Button>
        <Button type="submit" disabled={loading}>{loading ? "Menyimpan..." : "Simpan Data"}</Button>
      </div>
    </form>
  );
}

export default function MadrasahGuruPage() {
  const [guru, setGuru] = useState<Guru[]>([]);
  const [masterData, setMasterData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<"list" | "form">("list");
  const [selected, setSelected] = useState<Guru | null>(null);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resGuru, resMaster] = await Promise.all([
        fetch("/api/guru"),
        fetch("/api/master")
      ]);
      const dataGuru = await resGuru.json();
      const dataMaster = await resMaster.json();
      
      setGuru(Array.isArray(dataGuru) ? dataGuru : []);
      setMasterData(Array.isArray(dataMaster) ? dataMaster : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (form: any) => {
    setSaving(true);
    try {
      const isEdit = !!selected;
      const url = isEdit ? `/api/guru/${selected!.id}` : "/api/guru";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { Swal.fire("Gagal", data.error, "error"); return; }
      Swal.fire("Berhasil", `Data guru berhasil ${isEdit ? "diperbarui" : "ditambahkan"}`, "success");
      setMode("list");
      setSelected(null);
      fetchData();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (g: Guru) => {
    const result = await Swal.fire({
      title: "Hapus Data Guru?",
      text: `Data "${g.nama}" akan dihapus permanen.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444",
    });
    if (!result.isConfirmed) return;
    const res = await fetch(`/api/guru/${g.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) { Swal.fire("Gagal", data.error, "error"); return; }
    Swal.fire("Dihapus", "Data guru dihapus", "success");
    fetchData();
  };

  const filtered = guru.filter(g => g.nama?.toLowerCase().includes(search.toLowerCase()) || g.nuptk?.includes(search));

  const statusColor = (s: string) => {
    if (s === "PNS") return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (s === "Non-PNS") return "bg-blue-100 text-blue-700 border-blue-200";
    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  };

  if (mode === "form") {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => { setMode("list"); setSelected(null); }}>← Kembali</Button>
          <div>
            <h1 className="text-2xl font-bold">{selected ? `Edit: ${selected.nama}` : "Tambah Data Guru"}</h1>
            <p className="text-sm text-muted-foreground">Isi data guru dengan lengkap dan akurat</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <GuruForm
              initial={selected || undefined}
              onSave={handleSave}
              onCancel={() => { setMode("list"); setSelected(null); }}
              loading={saving}
              masterData={masterData}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Data Guru</h1>
          <p className="text-sm text-muted-foreground">Kelola data guru madrasah Anda</p>
        </div>
        <Button onClick={() => { setSelected(null); setMode("form"); }} className="gap-2">
          <Plus className="w-4 h-4" /> Tambah Guru
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Cari nama atau NUPTK..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Badge variant="secondary" className="h-10 px-4 flex items-center font-bold">{filtered.length} Guru</Badge>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-16 text-center">
          <Users className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="font-semibold text-muted-foreground">Belum ada data guru</p>
          <p className="text-sm text-muted-foreground mt-1">Klik "Tambah Guru" untuk mulai mengisi data.</p>
        </CardContent></Card>
      ) : (
        <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-4 py-4 font-bold">No</th>
                  <th className="px-4 py-4 font-bold">Nama Guru</th>
                  <th className="px-4 py-4 font-bold">Identitas (NUPTK/PegID)</th>
                  <th className="px-4 py-4 font-bold">Status</th>
                  <th className="px-4 py-4 font-bold">Jabatan & Studi</th>
                  <th className="px-4 py-4 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((g, i) => (
                  <tr key={g.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4 text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-4">
                      <div className="font-bold text-foreground">{g.nama}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{g.jenis_kelamin === "L" ? "Laki-laki" : g.jenis_kelamin === "P" ? "Perempuan" : ""}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1 text-xs font-mono">
                        {g.nuptk ? <span><span className="text-muted-foreground mr-1">NUPTK:</span>{g.nuptk}</span> : null}
                        {g.peg_id ? <span><span className="text-muted-foreground mr-1">PegID:</span>{g.peg_id}</span> : null}
                        {g.nip ? <span><span className="text-muted-foreground mr-1">NIP:</span>{g.nip}</span> : null}
                        {(!g.nuptk && !g.peg_id && !g.nip) && <span className="text-muted-foreground">—</span>}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {g.status_kepegawaian ? (
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusColor(g.status_kepegawaian)}`}>
                          {g.status_kepegawaian}
                        </span>
                      ) : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium">{g.jabatan || "—"}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{g.bidang_studi || "—"}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="outline" className="gap-1.5 h-8" onClick={() => { setSelected(g); setMode("form"); }}>
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(g)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
