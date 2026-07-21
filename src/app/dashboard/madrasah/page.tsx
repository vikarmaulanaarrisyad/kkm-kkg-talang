"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, School, Edit, Trash2, Eye, EyeOff, Search, CheckCircle, XCircle, Clock, RefreshCw, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/ui/data-table";
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

type Tab = "pending" | "active" | "rejected" | "all";

type Meta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

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
    <form onSubmit={async e => { e.preventDefault(); setLoading(true); try { await onSave(form); } finally { setLoading(false); } }} className="space-y-4 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2 space-y-2">
          <Label>Nama Madrasah <span className="text-red-500">*</span></Label>
          <Input value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} placeholder="MI Nurul Huda" required />
        </div>
        <div className="space-y-2">
          <Label>NSM</Label>
          <Input value={form.nsm} onChange={e => setForm({ ...form, nsm: e.target.value })} placeholder="111232000000" />
        </div>
        <div className="space-y-2">
          <Label>NPSN</Label>
          <Input value={form.npsn} onChange={e => setForm({ ...form, npsn: e.target.value })} placeholder="60712345" />
        </div>
        <div className="space-y-2">
          <Label>Kecamatan</Label>
          <Input value={form.kecamatan} onChange={e => setForm({ ...form, kecamatan: e.target.value })} placeholder="Talang" />
        </div>
        <div className="space-y-2">
          <Label>Alamat</Label>
          <Input value={form.alamat} onChange={e => setForm({ ...form, alamat: e.target.value })} placeholder="Jl. Raya No. 1" />
        </div>
        <div className="space-y-2">
          <Label>Username <span className="text-red-500">*</span></Label>
          <Input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="mi-nurul-huda" required />
        </div>
        <div className="space-y-2">
          <Label>Password {initial?.id ? "(kosongkan jika tidak diubah)" : <span className="text-red-500">*</span>}</Label>
          <div className="relative">
            <Input type={showPwd ? "text" : "password"} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder={initial?.id ? "••••••••" : "Min. 6 karakter"} required={!initial?.id} />
            <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-4 border-t mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>Batal</Button>
        <Button type="submit" disabled={loading}>{loading ? "Menyimpan..." : "Simpan"}</Button>
      </div>
    </form>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "pending") return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200"><Clock className="w-3 h-3 mr-1" />Menunggu</Badge>;
  if (status === "active") return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200"><CheckCircle className="w-3 h-3 mr-1" />Aktif</Badge>;
  if (status === "rejected") return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />Ditolak</Badge>;
  return null;
}

export default function AdminMadrasahPage() {
  const [list, setList] = useState<Madrasah[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [tab, setTab] = useState<Tab>("pending");
  const [page, setPage] = useState(1);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<Madrasah | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page on tab change
  useEffect(() => {
    setPage(1);
  }, [tab]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/madrasah?status=${tab}&search=${encodeURIComponent(debouncedSearch)}&page=${page}&limit=10`);
      const json = await res.json();
      if (res.ok) {
        setList(json.data || []);
        if (json.meta) setMeta(json.meta);
      }
    } catch (e) {
      console.error("Failed to fetch", e);
    } finally {
      setLoading(false);
    }
  }, [tab, debouncedSearch, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openModal = (madrasah?: Madrasah) => {
    setSelected(madrasah || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelected(null);
  };

  const changeStatus = async (m: Madrasah, status: "active" | "rejected") => {
    const result = await Swal.fire({
      title: `${status === "active" ? "Aktifkan" : "Tolak"} Madrasah?`,
      html: `<strong>${m.nama}</strong> akan ${status === "active" ? "diaktifkan dan dapat login." : "ditolak dan tidak dapat login."}`,
      icon: status === "active" ? "question" : "warning",
      showCancelButton: true,
      confirmButtonText: status === "active" ? "✓ Aktifkan" : "✗ Tolak",
      cancelButtonText: "Batal",
      confirmButtonColor: status === "active" ? "#10b981" : "#ef4444",
    });
    if (!result.isConfirmed) return;

    Swal.fire({ title: 'Memproses...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    const res = await fetch(`/api/madrasah/${m.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) { Swal.fire("Gagal", data.error, "error"); return; }

    Swal.fire(status === "active" ? "Diaktifkan!" : "Ditolak", `${m.nama} berhasil ${status === "active" ? "diaktifkan" : "ditolak"}.`, "success");
    fetchData();
  };

  const handleSave = async (form: any) => {
    Swal.fire({ title: 'Menyimpan...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    const isEdit = !!selected?.id;
    const url = isEdit ? `/api/madrasah/${selected.id}` : "/api/madrasah";
    const method = isEdit ? "PUT" : "POST";
    
    const body = { ...form };
    if (isEdit && !body.password) delete body.password;
    if (!isEdit) body.status = "active";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) { Swal.fire("Gagal", data.error, "error"); return; }
    
    Swal.fire("Berhasil", `Madrasah berhasil ${isEdit ? "diperbarui" : "ditambahkan"}`, "success");
    closeModal();
    fetchData();
  };

  const handleDelete = async (m: Madrasah) => {
    const result = await Swal.fire({
      title: "Hapus Madrasah?", text: `"${m.nama}" akan dihapus permanen!`,
      icon: "warning", showCancelButton: true,
      confirmButtonText: "Ya, Hapus!", cancelButtonText: "Batal", confirmButtonColor: "#ef4444",
    });
    if (!result.isConfirmed) return;
    
    Swal.fire({ title: 'Menghapus...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    const res = await fetch(`/api/madrasah/${m.id}`, { method: "DELETE" });
    if (!res.ok) { Swal.fire("Gagal", "Gagal menghapus madrasah.", "error"); return; }
    
    Swal.fire("Dihapus", "Data madrasah berhasil dihapus.", "success");
    fetchData();
  };

  const columns = [
    {
      header: "No",
      className: "w-[50px] text-center",
      cell: (_: any, i: number) => <span className="font-medium text-muted-foreground">{(meta.page - 1) * meta.limit + i + 1}</span>
    },
    {
      header: "Identitas Madrasah",
      cell: (m: Madrasah) => (
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg shrink-0 ${m.status === "pending" ? "bg-amber-100" : m.status === "rejected" ? "bg-red-100" : "bg-emerald-100"}`}>
            <School className={`w-4 h-4 ${m.status === "pending" ? "text-amber-600" : m.status === "rejected" ? "text-red-600" : "text-emerald-600"}`} />
          </div>
          <div>
            <p className="font-semibold text-foreground">{m.nama}</p>
            <p className="text-xs text-muted-foreground">{m.kecamatan || "Alamat tidak tersedia"}</p>
          </div>
        </div>
      )
    },
    {
      header: "NSM / NPSN",
      cell: (m: Madrasah) => (
        <div className="flex flex-col space-y-1">
          <span className="text-sm font-mono">{m.nsm || "-"}</span>
          <span className="text-xs text-muted-foreground font-mono">{m.npsn || "-"}</span>
        </div>
      )
    },
    {
      header: "Username",
      cell: (m: Madrasah) => (
        <Badge variant="secondary" className="font-mono text-xs font-normal">
          @{m.username}
        </Badge>
      )
    },
    {
      header: "Status",
      cell: (m: Madrasah) => <StatusBadge status={m.status || "active"} />
    },
    {
      header: "Aksi",
      className: "text-right",
      cell: (m: Madrasah) => (
        <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-40 group-hover:opacity-100 transition-opacity">
          {m.status === "pending" && (
            <>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" onClick={() => changeStatus(m, "active")} title="Aktifkan">
                <CheckCircle className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => changeStatus(m, "rejected")} title="Tolak">
                <XCircle className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => openModal(m)} title="Edit">
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(m)} title="Hapus">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kelola Madrasah</h1>
          <p className="text-muted-foreground mt-1">Aktivasi pendaftaran & manajemen akun madrasah anggota.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} className="gap-2">
            <RefreshCw className="w-4 h-4" /> <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button onClick={() => openModal()} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="w-4 h-4" /> Madrasah Baru
          </Button>
        </div>
      </div>

      <DataTable 
        columns={columns}
        data={list}
        meta={meta}
        loading={loading}
        searchPlaceholder="Cari nama, nsm, atau username..."
        initialSearch={search}
        onSearch={setSearch}
        onPageChange={setPage}
        emptyMessage="Tidak ada data madrasah ditemukan."
        emptyIcon={<School className="w-10 h-10 mb-3 opacity-20" />}
        tabs={
          <div className="flex bg-muted/50 p-1 rounded-xl w-fit">
            {[
              { key: "pending", label: "Menunggu" },
              { key: "active", label: "Aktif" },
              { key: "rejected", label: "Ditolak" },
              { key: "all", label: "Semua" },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key as Tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  tab === t.key ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        }
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <School className="w-5 h-5 text-emerald-600" />
              {selected ? "Edit Madrasah" : "Tambah Madrasah Baru"}
            </DialogTitle>
            <DialogDescription>
              {selected ? "Ubah informasi madrasah anggota di bawah ini." : "Masukkan data madrasah anggota baru untuk memberikan akses login."}
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6">
            <MadrasahForm initial={selected || undefined} onSave={handleSave} onCancel={closeModal} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
