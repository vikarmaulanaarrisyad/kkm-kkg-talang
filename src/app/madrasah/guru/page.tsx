"use client";

import { useState, useEffect } from "react";
import { useFormDraft } from "@/hooks/useFormDraft";
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
  onSave: (data: any) => Promise<boolean>;
  onCancel: () => void;
  loading: boolean;
  masterData: any[];
}) {
  const { form, setForm, clearDraft } = useFormDraft("draft_guru", { ...EMPTY_FORM, ...(initial || {}) }, !!initial);
  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [key]: e.target.value }));
  const setSelect = (key: string) => (v: string | null) => setForm(f => ({ ...f, [key]: v || "" }));

  const statusOptions = masterData.filter(d => d.kategori === "status_kepegawaian");
  const jabatanOptions = masterData.filter(d => d.kategori === "jabatan");
  const pendidikanOptions = masterData.filter(d => d.kategori === "pendidikan_terakhir");

  const selectClass = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-gray-50 focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all";

  return (
    <form onSubmit={async e => { 
      e.preventDefault(); 
      const success = await onSave(form); 
      if (success) clearDraft();
    }} className="space-y-6">

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

import { DataTable, ColumnDef, DataTableMeta } from "@/components/ui/data-table";

export default function MadrasahGuruPage() {
  const [data, setData] = useState<Guru[]>([]);
  const [meta, setMeta] = useState<DataTableMeta>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [masterData, setMasterData] = useState<any[]>([]);
  const [mode, setMode] = useState<"list" | "form">("list");
  const [selected, setSelected] = useState<Guru | null>(null);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const [resGuru, resMaster] = await Promise.all([
        fetch(`/api/guru?paginated=true&page=${page}&limit=10&search=${encodeURIComponent(search)}`),
        fetch("/api/master")
      ]);
      const jsonGuru = await resGuru.json();
      const jsonMaster = await resMaster.json();
      
      if (jsonGuru.data) {
        setData(jsonGuru.data);
        setMeta(jsonGuru.metadata);
      } else {
        setData(Array.isArray(jsonGuru) ? jsonGuru : []);
      }
      setMasterData(Array.isArray(jsonMaster) ? jsonMaster : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, search]);

  const handleSave = async (form: any) => {
    Swal.fire({
      title: 'Menyimpan...',
      text: 'Mohon tunggu sebentar',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

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
      if (!res.ok) { Swal.fire("Gagal", data.error, "error"); return false; }
      
      Swal.fire("Berhasil", `Data guru berhasil ${isEdit ? "diperbarui" : "ditambahkan"}`, "success");
      setMode("list");
      setSelected(null);
      fetchData();
      return true;
    } catch (e: any) {
      Swal.fire("Error", e.message, "error");
      return false;
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
    
    Swal.fire({ title: 'Menghapus...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      const res = await fetch(`/api/guru/${g.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { Swal.fire("Gagal", data.error, "error"); return; }
      Swal.fire("Dihapus", "Data guru dihapus", "success");
      fetchData();
    } catch (e: any) {
      Swal.fire("Error", e.message, "error");
    }
  };

  const statusColor = (s: string) => {
    if (s === "PNS") return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (s === "Non-PNS") return "bg-blue-100 text-blue-700 border-blue-200";
    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  };

  const columns: ColumnDef<Guru>[] = [
    {
      header: "No",
      className: "w-[50px] text-center",
      cell: (_: any, index: number) => (
        <span className="font-medium text-muted-foreground">
          {(meta.page - 1) * meta.limit + index + 1}
        </span>
      )
    },
    {
      header: "Nama Guru",
      cell: (g: Guru) => (
        <div>
          <div className="font-bold text-gray-900 text-base">
            {g.gelar_depan ? `${g.gelar_depan} ` : ""}{g.nama}{g.gelar_belakang ? `, ${g.gelar_belakang}` : ""}
          </div>
          <div className="text-xs font-medium text-gray-500 mt-0.5">
            {g.jenis_kelamin === "L" ? "Laki-laki" : g.jenis_kelamin === "P" ? "Perempuan" : ""}
          </div>
        </div>
      ),
    },
    {
      header: "Identitas",
      cell: (g: Guru) => (
        <div className="flex flex-col gap-1 text-xs font-mono">
          {g.nuptk ? <span><span className="text-gray-400 font-sans mr-1">NUPTK:</span>{g.nuptk}</span> : null}
          {g.peg_id ? <span><span className="text-gray-400 font-sans mr-1">PegID:</span>{g.peg_id}</span> : null}
          {g.nip ? <span><span className="text-gray-400 font-sans mr-1">NIP:</span>{g.nip}</span> : null}
          {(!g.nuptk && !g.peg_id && !g.nip) && <span className="text-gray-400 font-sans">—</span>}
        </div>
      ),
    },
    {
      header: "Status",
      cell: (g: Guru) => (
        g.status_kepegawaian ? (
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusColor(g.status_kepegawaian)} shadow-sm`}>
            {g.status_kepegawaian}
          </span>
        ) : <span className="text-gray-400">—</span>
      ),
    },
    {
      header: "Jabatan & Studi",
      cell: (g: Guru) => (
        <div>
          <div className="text-sm font-semibold text-gray-800">{g.jabatan || "—"}</div>
          <div className="text-xs font-medium text-emerald-600 mt-0.5 bg-emerald-50 w-max px-2 py-0.5 rounded">{g.bidang_studi || "—"}</div>
        </div>
      ),
    },
    {
      header: "Aksi",
      className: "text-right",
      cell: (g: Guru) => (
        <div className="flex items-center justify-end gap-2">
          <Button size="sm" variant="outline" className="gap-1.5 h-8 bg-white hover:bg-gray-50 rounded-lg shadow-sm border-gray-200" onClick={() => { setSelected(g); setMode("form"); }}>
            <Pencil className="w-3.5 h-3.5 text-blue-600" /> <span className="text-gray-700">Edit</span>
          </Button>
          <Button size="sm" variant="outline" className="h-8 bg-white text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100 rounded-lg shadow-sm" onClick={() => handleDelete(g)}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  if (mode === "form") {
    const isEdit = !!selected;
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-start sm:items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md shadow-sm shrink-0">
                {isEdit ? <Pencil className="w-6 h-6 text-amber-300" /> : <Plus className="w-6 h-6 text-emerald-100" />}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 text-emerald-100 text-xs font-semibold mb-1 uppercase tracking-wider">
                  <span>Portal Madrasah</span>
                  <ChevronRight className="w-3 h-3 text-emerald-300/50" />
                  <span>Data Guru</span>
                  <ChevronRight className="w-3 h-3 text-emerald-300/50" />
                  <span className="text-amber-300">{isEdit ? "Edit Data" : "Tambah Baru"}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {isEdit ? `Edit: ${selected!.nama}` : "Tambah Guru Baru"}
                </h1>
              </div>
            </div>
            <button
              onClick={() => { setMode("list"); setSelected(null); }}
              className="flex items-center justify-center gap-2 text-sm font-bold text-emerald-900 bg-white hover:bg-emerald-50 px-5 py-2.5 rounded-xl shadow-md transition-all w-full sm:w-auto hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white p-2 rounded-3xl shadow-sm border border-gray-100">
          <GuruForm
            initial={selected || undefined}
            onSave={handleSave}
            onCancel={() => { setMode("list"); setSelected(null); }}
            loading={false}
            masterData={masterData}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Data Guru</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Kelola data seluruh pendidik di madrasah Anda dengan mudah.</p>
        </div>
        <Button onClick={() => { setSelected(null); setMode("form"); }} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/20 px-6 py-5 font-bold transition-all hover:scale-105 active:scale-95">
          <Plus className="w-5 h-5" /> Tambah Guru Baru
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <DataTable
          columns={columns}
          data={data}
          meta={meta}
          loading={loading}
          onSearch={(s) => { setSearch(s); setPage(1); }}
          onPageChange={(p) => setPage(p)}
          searchPlaceholder="Cari nama, NUPTK, NIP, atau PegID..."
        />
      </div>
    </div>
  );
}
