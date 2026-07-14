"use client";

import { useState, useEffect } from "react";
import {
  Plus, Users, Pencil, Trash2, Search,
  Save, ArrowLeft, GraduationCap, Calendar, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Swal from "sweetalert2";

type Rombel = {
  id: string;
  madrasah_id: string;
  tahun_ajaran: string;
  nama_rombel: string;
  siswa_laki: number;
  siswa_perempuan: number;
  wali_kelas_id: string;
};

type Guru = {
  id: string;
  nama: string;
  gelar_depan: string;
  gelar_belakang: string;
};

const EMPTY_FORM = {
  nama_rombel: "",
  siswa_laki: 0,
  siswa_perempuan: 0,
  wali_kelas_id: "",
};

export default function RombelPage() {
  const [data, setData] = useState<Rombel[]>([]);
  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [tahunAjaranAktif, setTahunAjaranAktif] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState("");
  const [search, setSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch Settings for Tahun Ajaran
      const setRes = await fetch("/api/settings");
      let activeTahun = "";
      if (setRes.ok) {
        const setJson = await setRes.json();
        activeTahun = setJson.data?.tahun_ajaran_aktif || "";
        setTahunAjaranAktif(activeTahun);
      }

      // Fetch Guru
      const guruRes = await fetch("/api/guru");
      if (guruRes.ok) {
        setGuruList(await guruRes.json());
      }

      // Fetch Rombel for active tahun
      if (activeTahun) {
        const rombelRes = await fetch(`/api/rombel?tahun_ajaran=${encodeURIComponent(activeTahun)}`);
        if (rombelRes.ok) {
          setData(await rombelRes.json());
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.type === "number" ? parseInt(e.target.value) || 0 : e.target.value;
    setForm((p) => ({ ...p, [key]: val }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama_rombel.trim()) {
      Swal.fire("Peringatan", "Nama rombel wajib diisi", "warning");
      return;
    }
    if (!tahunAjaranAktif) {
      Swal.fire("Peringatan", "Tahun Ajaran Aktif belum diatur oleh Admin. Hubungi Admin KKM/KKG.", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = isEditing ? `/api/rombel/${editId}` : "/api/rombel";
      const method = isEditing ? "PUT" : "POST";
      const submittedWali = form.wali_kelas_id === "none" ? "" : form.wali_kelas_id;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, wali_kelas_id: submittedWali, tahun_ajaran: tahunAjaranAktif }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      Swal.fire("Berhasil", "Data rombel berhasil disimpan", "success");
      setIsEditing(false);
      setForm(EMPTY_FORM);
      fetchData();
    } catch (error: any) {
      Swal.fire("Gagal", error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (r: Rombel) => {
    setForm({
      nama_rombel: r.nama_rombel,
      siswa_laki: r.siswa_laki,
      siswa_perempuan: r.siswa_perempuan,
      wali_kelas_id: r.wali_kelas_id,
    });
    setEditId(r.id);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    const res = await Swal.fire({
      title: "Hapus Rombel?",
      text: "Data rombel ini akan dihapus permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444",
    });

    if (!res.isConfirmed) return;

    try {
      const resp = await fetch(`/api/rombel/${id}`, { method: "DELETE" });
      if (!resp.ok) throw new Error("Gagal menghapus data");
      Swal.fire("Terhapus", "Data rombel berhasil dihapus", "success");
      fetchData();
    } catch (error: any) {
      Swal.fire("Gagal", error.message, "error");
    }
  };

  const formatName = (g: Guru) => {
    return `${g.gelar_depan ? g.gelar_depan + ' ' : ''}${g.nama}${g.gelar_belakang ? ', ' + g.gelar_belakang : ''}`;
  };

  const getGuruName = (id: string) => {
    const g = guruList.find(x => x.id === id);
    return g ? formatName(g) : "—";
  };

  const filtered = data.filter(r => r.nama_rombel.toLowerCase().includes(search.toLowerCase()));

  const totalLaki = filtered.reduce((acc, curr) => acc + curr.siswa_laki, 0);
  const totalPerempuan = filtered.reduce((acc, curr) => acc + curr.siswa_perempuan, 0);
  const totalSiswa = totalLaki + totalPerempuan;

  const formContent = (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Nama Rombel / Kelas <span className="text-red-500">*</span></Label>
          <Input value={form.nama_rombel} onChange={set("nama_rombel")} placeholder="Misal: Kelas 1A" required />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Jml. Siswa Laki-Laki</Label>
            <Input type="number" min="0" value={form.siswa_laki} onChange={set("siswa_laki")} />
          </div>
          <div className="space-y-2">
            <Label>Jml. Siswa Perempuan</Label>
            <Input type="number" min="0" value={form.siswa_perempuan} onChange={set("siswa_perempuan")} />
          </div>
        </div>
        <div className="bg-emerald-50 text-emerald-700 font-bold p-3 rounded-lg text-center text-lg">
          Total Siswa: {form.siswa_laki + form.siswa_perempuan}
        </div>

        <div className="space-y-2">
          <Label>Wali Kelas (Opsional)</Label>
          <Select value={form.wali_kelas_id} onValueChange={v => setForm(p => ({ ...p, wali_kelas_id: v }))}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih Guru..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">-- Kosong / Belum Ada --</SelectItem>
              {guruList.map(g => (
                <SelectItem key={g.id} value={g.id}>{formatName(g)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-base font-bold bg-emerald-600 hover:bg-emerald-700 shadow-md">
        {isSubmitting ? <span className="animate-spin mr-2">⏳</span> : <Save className="w-5 h-5 mr-2" />}
        Simpan Rombel
      </Button>
    </form>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-emerald-900 flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-emerald-600" />
            Data Rombel & Siswa
          </h1>
          <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
            <Calendar className="w-4 h-4 text-emerald-500" /> 
            Tahun Ajaran Aktif: <strong className="text-emerald-700">{tahunAjaranAktif || "Belum diatur"}</strong>
          </p>
        </div>
        <Button onClick={() => { setForm(EMPTY_FORM); setEditId(""); setIsEditing(true); }} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 shadow-md">
          <Plus className="w-4 h-4 mr-2" /> Tambah Rombel
        </Button>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-emerald-900">{editId ? "Edit Rombel" : "Tambah Rombel"}</DialogTitle>
            <DialogDescription>
              Tahun Ajaran: {tahunAjaranAktif}
            </DialogDescription>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-100 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-emerald-500 text-white rounded-xl"><Users className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-emerald-800">Total Siswa</p>
              <h4 className="text-2xl font-black text-emerald-900">{totalSiswa}</h4>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-muted-foreground">Laki-Laki</p>
            <h4 className="text-xl font-bold">{totalLaki}</h4>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-muted-foreground">Perempuan</p>
            <h4 className="text-xl font-bold">{totalPerempuan}</h4>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Cari rombel..." className="pl-9 bg-white" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card className="bg-white border-dashed border-2">
          <CardContent className="py-16 text-center">
            <GraduationCap className="w-12 h-12 mx-auto text-emerald-200 mb-4" />
            <p className="font-semibold text-emerald-900">Belum ada data rombel</p>
            <p className="text-sm text-muted-foreground mb-4">Tambahkan kelas pertama Anda untuk tahun ajaran ini.</p>
            <Button onClick={() => { setForm(EMPTY_FORM); setEditId(""); setIsEditing(true); }} variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
              Tambah Sekarang
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-4 py-3 text-left font-bold text-muted-foreground w-16">No</th>
                <th className="px-4 py-3 text-left font-bold text-muted-foreground">Rombel</th>
                <th className="px-4 py-3 text-center font-bold text-muted-foreground">L</th>
                <th className="px-4 py-3 text-center font-bold text-muted-foreground">P</th>
                <th className="px-4 py-3 text-center font-bold text-emerald-700">Total</th>
                <th className="px-4 py-3 text-left font-bold text-muted-foreground">Wali Kelas</th>
                <th className="px-4 py-3 text-right font-bold text-muted-foreground">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-emerald-50/50 transition-colors">
                  <td className="px-4 py-4 text-muted-foreground">{i + 1}</td>
                  <td className="px-4 py-4 font-bold text-foreground">{r.nama_rombel}</td>
                  <td className="px-4 py-4 text-center">{r.siswa_laki}</td>
                  <td className="px-4 py-4 text-center">{r.siswa_perempuan}</td>
                  <td className="px-4 py-4 text-center font-black text-emerald-600">{r.siswa_laki + r.siswa_perempuan}</td>
                  <td className="px-4 py-4 text-muted-foreground text-xs">{getGuruName(r.wali_kelas_id)}</td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-100" onClick={() => handleEdit(r)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-100" onClick={() => handleDelete(r.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
