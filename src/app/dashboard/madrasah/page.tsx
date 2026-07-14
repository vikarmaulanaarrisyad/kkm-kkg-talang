"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, School, Edit, Trash2, Eye, EyeOff, Search, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Swal from "sweetalert2";

type Madrasah = {
  id: string;
  nama: string;
  nsm: string;
  npsn: string;
  alamat: string;
  kecamatan: string;
  username: string;
  status: string;
  created_at: string;
};

type Tab = "pending" | "active" | "rejected";

function MadrasahForm({ initial, onSave, onCancel }: {
  initial?: Partial<Madrasah>;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    nama: initial?.nama || "", nsm: initial?.nsm || "", npsn: initial?.npsn || "",
    alamat: initial?.alamat || "", kecamatan: initial?.kecamatan || "",
    username: initial?.username || "", password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  return (
    <form onSubmit={async e => { e.preventDefault(); setLoading(true); try { await onSave(form); } finally { setLoading(false); } }} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2 space-y-1.5">
          <Label>Nama Madrasah <span className="text-red-500">*</span></Label>
          <Input value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} placeholder="MI Nurul Huda" required />
        </div>
        <div className="space-y-1.5">
          <Label>NSM</Label>
          <Input value={form.nsm} onChange={e => setForm({ ...form, nsm: e.target.value })} placeholder="111232000000" />
        </div>
        <div className="space-y-1.5">
          <Label>NPSN</Label>
          <Input value={form.npsn} onChange={e => setForm({ ...form, npsn: e.target.value })} placeholder="60712345" />
        </div>
        <div className="space-y-1.5">
          <Label>Kecamatan</Label>
          <Input value={form.kecamatan} onChange={e => setForm({ ...form, kecamatan: e.target.value })} placeholder="Talang" />
        </div>
        <div className="space-y-1.5">
          <Label>Alamat</Label>
          <Input value={form.alamat} onChange={e => setForm({ ...form, alamat: e.target.value })} placeholder="Jl. Raya No. 1" />
        </div>
        <div className="space-y-1.5">
          <Label>Username <span className="text-red-500">*</span></Label>
          <Input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="mi-nurul-huda" required />
        </div>
        <div className="space-y-1.5">
          <Label>Password {initial?.id ? "(kosongkan jika tidak diubah)" : <span className="text-red-500">*</span>}</Label>
          <div className="relative">
            <Input type={showPwd ? "text" : "password"} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder={initial?.id ? "••••••••" : "Min. 6 karakter"} required={!initial?.id} />
            <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-2.5 text-muted-foreground">
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Batal</Button>
        <Button type="submit" disabled={loading}>{loading ? "Menyimpan..." : "Simpan"}</Button>
      </div>
    </form>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "pending") return <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100"><Clock className="w-3 h-3 mr-1" />Menunggu Aktivasi</Badge>;
  if (status === "active") return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100"><CheckCircle className="w-3 h-3 mr-1" />Aktif</Badge>;
  if (status === "rejected") return <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100"><XCircle className="w-3 h-3 mr-1" />Ditolak</Badge>;
  return null;
}

export default function AdminMadrasahPage() {
  const [list, setList] = useState<Madrasah[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"list" | "tambah" | "edit">("list");
  const [selected, setSelected] = useState<Madrasah | null>(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Tab>("pending");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/madrasah");
      const data = await res.json();
      setList(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const changeStatus = async (m: Madrasah, status: "active" | "rejected") => {
    const label = status === "active" ? "aktifkan" : "tolak";
    const result = await Swal.fire({
      title: `${status === "active" ? "Aktifkan" : "Tolak"} Madrasah?`,
      html: `<strong>${m.nama}</strong> akan ${status === "active" ? "diaktifkan dan dapat login ke sistem." : "ditolak dan tidak dapat login."}`,
      icon: status === "active" ? "question" : "warning",
      showCancelButton: true,
      confirmButtonText: status === "active" ? "✓ Aktifkan" : "✗ Tolak",
      cancelButtonText: "Batal",
      confirmButtonColor: status === "active" ? "#16a34a" : "#dc2626",
    });
    if (!result.isConfirmed) return;

    const res = await fetch(`/api/madrasah/${m.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) { Swal.fire("Gagal", data.error, "error"); return; }

    Swal.fire(
      status === "active" ? "Diaktifkan!" : "Ditolak",
      `${m.nama} berhasil ${status === "active" ? "diaktifkan" : "ditolak"}.`,
      "success"
    );
    fetchData();
    if (status === "active") setTab("active");
  };

  const handleCreate = async (form: any) => {
    const res = await fetch("/api/madrasah", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, status: "active" }),
    });
    const data = await res.json();
    if (!res.ok) { Swal.fire("Gagal", data.error, "error"); return; }
    Swal.fire("Berhasil", "Madrasah berhasil ditambahkan", "success");
    setMode("list"); fetchData();
  };

  const handleUpdate = async (form: any) => {
    const body = { ...form };
    if (!body.password) delete body.password;
    const res = await fetch(`/api/madrasah/${selected!.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) { Swal.fire("Gagal", data.error, "error"); return; }
    Swal.fire("Berhasil", "Data madrasah diperbarui", "success");
    setMode("list"); fetchData();
  };

  const handleDelete = async (m: Madrasah) => {
    const result = await Swal.fire({
      title: "Hapus Madrasah?", text: `"${m.nama}" akan dihapus permanen.`,
      icon: "warning", showCancelButton: true,
      confirmButtonText: "Hapus", cancelButtonText: "Batal", confirmButtonColor: "#ef4444",
    });
    if (!result.isConfirmed) return;
    const res = await fetch(`/api/madrasah/${m.id}`, { method: "DELETE" });
    if (!res.ok) { Swal.fire("Gagal", "Gagal menghapus.", "error"); return; }
    Swal.fire("Dihapus", "Madrasah dihapus", "success");
    fetchData();
  };

  const pending = list.filter(m => m.status === "pending");
  const active = list.filter(m => m.status === "active" || !m.status);
  const rejected = list.filter(m => m.status === "rejected");

  const tabData = tab === "pending" ? pending : tab === "active" ? active : rejected;
  const filtered = tabData.filter(m =>
    m.nama?.toLowerCase().includes(search.toLowerCase()) ||
    m.nsm?.includes(search) || m.username?.toLowerCase().includes(search.toLowerCase())
  );

  if (mode !== "list") {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => { setMode("list"); setSelected(null); }}>← Kembali</Button>
          <h1 className="text-2xl font-bold">{mode === "tambah" ? "Tambah Madrasah Baru" : `Edit: ${selected?.nama}`}</h1>
        </div>
        <Card><CardContent className="pt-6">
          <MadrasahForm initial={mode === "edit" ? selected! : undefined} onSave={mode === "tambah" ? handleCreate : handleUpdate} onCancel={() => { setMode("list"); setSelected(null); }} />
        </CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kelola Madrasah</h1>
          <p className="text-sm text-muted-foreground">Aktivasi pendaftaran & manajemen akun madrasah anggota</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}><RefreshCw className="w-4 h-4" /></Button>
          <Button onClick={() => setMode("tambah")} className="gap-2"><Plus className="w-4 h-4" /> Tambah Manual</Button>
        </div>
      </div>

      {/* Tab + Search */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="flex bg-muted rounded-xl p-1 gap-1">
          {([
            { key: "pending", label: "Menunggu", count: pending.length, color: "text-amber-600" },
            { key: "active", label: "Aktif", count: active.length, color: "text-emerald-600" },
            { key: "rejected", label: "Ditolak", count: rejected.length, color: "text-red-600" },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${tab === t.key ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t.label}
              {t.count > 0 && (
                <span className={`text-xs font-black px-1.5 py-0.5 rounded-full ${tab === t.key ? `bg-primary/10 ${t.color}` : "bg-muted-foreground/20"}`}>{t.count}</span>
              )}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Cari nama, NSM, username..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Pending notice */}
      {tab === "pending" && pending.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            Ada <strong>{pending.length} pendaftaran baru</strong> yang menunggu persetujuan Anda. Tinjau dan aktifkan untuk memberikan akses login kepada madrasah tersebut.
          </p>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-16 text-center">
          <School className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="font-semibold text-muted-foreground">
            {tab === "pending" ? "Tidak ada pendaftaran baru" : tab === "active" ? "Belum ada madrasah aktif" : "Tidak ada pendaftaran ditolak"}
          </p>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(m => (
            <Card key={m.id} className={`hover:shadow-lg transition-all ${m.status === "pending" ? "border-amber-200 bg-amber-50/30" : ""}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${m.status === "pending" ? "bg-amber-100" : m.status === "rejected" ? "bg-red-100" : "bg-primary/10"}`}>
                      <School className={`w-5 h-5 ${m.status === "pending" ? "text-amber-600" : m.status === "rejected" ? "text-red-500" : "text-primary"}`} />
                    </div>
                    <div>
                      <CardTitle className="text-base leading-tight">{m.nama}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">{m.kecamatan || "—"}</p>
                    </div>
                  </div>
                  <StatusBadge status={m.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">NSM</span>
                  <span className="font-mono font-medium">{m.nsm || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">NPSN</span>
                  <span className="font-mono font-medium">{m.npsn || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Username</span>
                  <Badge variant="outline" className="font-mono text-xs">{m.username}</Badge>
                </div>
                {m.created_at && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Daftar</span>
                    <span className="text-muted-foreground">{new Date(m.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-3 border-t space-y-2">
                  {m.status === "pending" && (
                    <div className="grid grid-cols-2 gap-2">
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 gap-1.5 text-white" onClick={() => changeStatus(m, "active")}>
                        <CheckCircle className="w-3.5 h-3.5" /> Aktifkan
                      </Button>
                      <Button size="sm" variant="destructive" className="gap-1.5" onClick={() => changeStatus(m, "rejected")}>
                        <XCircle className="w-3.5 h-3.5" /> Tolak
                      </Button>
                    </div>
                  )}
                  {m.status === "rejected" && (
                    <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5" onClick={() => changeStatus(m, "active")}>
                      <CheckCircle className="w-3.5 h-3.5" /> Aktifkan Kembali
                    </Button>
                  )}
                  {m.status === "active" && (
                    <Button size="sm" variant="outline" className="w-full gap-1.5" onClick={() => changeStatus(m, "rejected")}>
                      <XCircle className="w-3.5 h-3.5" /> Nonaktifkan
                    </Button>
                  )}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 gap-1.5" onClick={() => { setSelected(m); setMode("edit"); }}>
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(m)}>
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
