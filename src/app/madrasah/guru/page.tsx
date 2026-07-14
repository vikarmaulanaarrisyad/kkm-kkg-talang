"use client";

import { useState, useEffect } from "react";
import {
  Plus, Users, Pencil, Trash2, Search,
  UserCircle, Fingerprint, CalendarDays, Phone, Mail,
  Briefcase, GraduationCap, BookOpen, BadgeCheck, ArrowLeft, Save, ChevronRight
} from "lucide-react";
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
  gelar_depan: string;
  gelar_belakang: string;
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
  nama: "", gelar_depan: "", gelar_belakang: "", nuptk: "", peg_id: "", nip: "",
  tempat_lahir: "", tanggal_lahir: "", jenis_kelamin: "",
  jabatan: "", status_kepegawaian: "", pendidikan_terakhir: "",
  bidang_studi: "", no_hp: "", email: "",
};

function FormSection({ icon: Icon, title, subtitle, color, children }: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
      <div className={`flex items-center gap-4 px-6 py-4 border-b ${color}`}>
        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-white text-sm tracking-wide">{title}</h3>
          {subtitle && <p className="text-white/70 text-xs mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {children}
        </div>
      </div>
    </div>
  );
}

function FormField({ label, required, hint, fullWidth, children }: {
  label: string;
  required?: boolean;
  hint?: string;
  fullWidth?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-2 ${fullWidth ? "md:col-span-2" : ""}`}>
      <label className="block text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function StyledInput({ icon: Icon, ...props }: { icon?: React.ElementType } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />}
      <input
        {...props}
        className={`w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-gray-50 focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all placeholder:text-gray-300 ${
          Icon ? "pl-10" : ""
        } ${props.className || ""}`}
      />
    </div>
  );
}

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

  const selectClass = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-gray-50 focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all";

  return (
    <form onSubmit={async e => { e.preventDefault(); await onSave(form); }} className="space-y-6">

      {/* Identitas */}
      <FormSection icon={UserCircle} title="Identitas Guru" subtitle="Data pribadi dan nomor identitas" color="bg-gradient-to-r from-emerald-600 to-emerald-500">
        <FormField label="Gelar Depan" hint="Misal: Drs., H.">
          <StyledInput icon={UserCircle} value={form.gelar_depan} onChange={set("gelar_depan")} placeholder="Gelar depan (opsional)" />
        </FormField>
        <FormField label="Nama Lengkap" required>
          <StyledInput icon={UserCircle} value={form.nama} onChange={set("nama")} placeholder="Nama lengkap guru (tanpa gelar)" required />
        </FormField>
        <FormField label="Gelar Belakang" hint="Misal: S.Pd., M.Pd.">
          <StyledInput icon={UserCircle} value={form.gelar_belakang} onChange={set("gelar_belakang")} placeholder="Gelar belakang (opsional)" />
        </FormField>
        <FormField label="NUPTK" hint="16 digit Nomor Unik Pendidik dan Tenaga Kependidikan">
          <StyledInput icon={Fingerprint} value={form.nuptk} onChange={set("nuptk")} placeholder="Contoh: 1234567890123456" maxLength={16} />
        </FormField>
        <FormField label="PegID Kemenag" hint="Nomor ID Pegawai Kemenag">
          <StyledInput icon={BadgeCheck} value={form.peg_id} onChange={set("peg_id")} placeholder="PegID dari sistem Kemenag" />
        </FormField>
        <FormField label="NIP" hint="Wajib diisi untuk PNS">
          <StyledInput icon={Fingerprint} value={form.nip} onChange={set("nip")} placeholder="NIP 18 digit (khusus PNS)" />
        </FormField>
        <FormField label="Jenis Kelamin">
          <Select value={form.jenis_kelamin} onValueChange={setSelect("jenis_kelamin")}>
            <SelectTrigger className={selectClass}><SelectValue placeholder="Pilih jenis kelamin..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="L">Laki-laki</SelectItem>
              <SelectItem value="P">Perempuan</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Tempat Lahir">
          <StyledInput icon={CalendarDays} value={form.tempat_lahir} onChange={set("tempat_lahir")} placeholder="Kota / Kabupaten" />
        </FormField>
        <FormField label="Tanggal Lahir">
          <StyledInput icon={CalendarDays} type="date" value={form.tanggal_lahir} onChange={set("tanggal_lahir")} />
        </FormField>
      </FormSection>

      {/* Kepegawaian */}
      <FormSection icon={Briefcase} title="Data Kepegawaian" subtitle="Status jabatan dan riwayat pendidikan" color="bg-gradient-to-r from-amber-500 to-amber-400">
        <FormField label="Status Kepegawaian">
          <Select value={form.status_kepegawaian} onValueChange={setSelect("status_kepegawaian")}>
            <SelectTrigger className={selectClass}><SelectValue placeholder="Pilih status..." /></SelectTrigger>
            <SelectContent>
              {statusOptions.length === 0 && <SelectItem value="_" disabled>Belum ada data master — hubungi Admin</SelectItem>}
              {statusOptions.map(opt => (
                <SelectItem key={opt.id} value={opt.nama_nilai}>{opt.nama_nilai}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Jabatan / Tugas">
          <Select value={form.jabatan} onValueChange={setSelect("jabatan")}>
            <SelectTrigger className={selectClass}><SelectValue placeholder="Pilih jabatan..." /></SelectTrigger>
            <SelectContent>
              {jabatanOptions.length === 0 && <SelectItem value="_" disabled>Belum ada data master — hubungi Admin</SelectItem>}
              {jabatanOptions.map(opt => (
                <SelectItem key={opt.id} value={opt.nama_nilai}>{opt.nama_nilai}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Pendidikan Terakhir">
          <Select value={form.pendidikan_terakhir} onValueChange={setSelect("pendidikan_terakhir")}>
            <SelectTrigger className={selectClass}><SelectValue placeholder="Pilih pendidikan..." /></SelectTrigger>
            <SelectContent>
              {pendidikanOptions.length === 0 && <SelectItem value="_" disabled>Belum ada data master — hubungi Admin</SelectItem>}
              {pendidikanOptions.map(opt => (
                <SelectItem key={opt.id} value={opt.nama_nilai}>{opt.nama_nilai}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Bidang Studi / Mapel">
          <StyledInput icon={BookOpen} value={form.bidang_studi} onChange={set("bidang_studi")} placeholder="Matematika, PAI, Bahasa Inggris..." />
        </FormField>
      </FormSection>

      {/* Kontak */}
      <FormSection icon={Phone} title="Informasi Kontak" subtitle="Nomor HP dan alamat email aktif" color="bg-gradient-to-r from-blue-600 to-blue-500">
        <FormField label="No. HP / WhatsApp" hint="Gunakan nomor yang aktif di WhatsApp">
          <StyledInput icon={Phone} value={form.no_hp} onChange={set("no_hp")} placeholder="08xxxxxxxxxx" />
        </FormField>
        <FormField label="Email" hint="Alamat email yang aktif digunakan">
          <StyledInput icon={Mail} type="email" value={form.email} onChange={set("email")} placeholder="nama@email.com" />
        </FormField>
      </FormSection>

      {/* Action buttons */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-gray-100 mt-8">
        <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto gap-2 rounded-xl">
          <ArrowLeft className="w-4 h-4" /> Batal
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-8 shadow-md hover:shadow-lg transition-all"
        >
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Menyimpan...</>
          ) : (
            <><Save className="w-4 h-4" /> Simpan Data Guru</>
          )}
        </Button>
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
    const isEdit = !!selected;
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm shrink-0">
                {isEdit ? <Pencil className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 text-emerald-200 text-xs font-semibold mb-1">
                  <span>Portal Madrasah</span>
                  <ChevronRight className="w-3 h-3" />
                  <span>Data Guru</span>
                  <ChevronRight className="w-3 h-3" />
                  <span>{isEdit ? "Edit" : "Tambah"}</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  {isEdit ? `Edit Data: ${selected!.nama}` : "Tambah Data Guru Baru"}
                </h1>
                <p className="text-emerald-100 text-xs sm:text-sm mt-0.5">Isi formulir berikut dengan data yang lengkap dan akurat</p>
              </div>
            </div>
            <button
              onClick={() => { setMode("list"); setSelected(null); }}
              className="flex items-center justify-center gap-2 text-sm font-medium text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali
            </button>
          </div>
        </div>

        {/* Form */}
        <GuruForm
          initial={selected || undefined}
          onSave={handleSave}
          onCancel={() => { setMode("list"); setSelected(null); }}
          loading={saving}
          masterData={masterData}
        />
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
                      <div className="font-bold text-foreground">
                        {g.gelar_depan ? `${g.gelar_depan} ` : ""}{g.nama}{g.gelar_belakang ? `, ${g.gelar_belakang}` : ""}
                      </div>
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
