"use client";

import { useState, useEffect, useCallback } from "react";
import { useFormDraft } from "@/hooks/useFormDraft";
import {
  FileSignature, Plus, Search, Trash2, Eye, Loader2,
  FileText, Mail, ClipboardList, Download, X, Users, ChevronDown
} from "lucide-react";
import Swal from "sweetalert2";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DownloadPdfBtn from "@/components/surat/DownloadPdfBtn";

interface Surat {
  id: string;
  nomor_surat: string;
  judul: string;
  jenis: string;
  isi: string;
  file_url: string;
  penerima: string;
  created_at: string;
  created_by: string;
  dibaca_count: number;
}

const JENIS_OPTIONS = ["Undangan Rapat", "Undangan Workshop", "Surat Keputusan (SK)", "Edaran Umum", "Pengumuman"];

const jenisIcon = (jenis: string) => {
  if (jenis.includes("Undangan")) return <Mail className="w-4 h-4 text-blue-500" />;
  if (jenis.includes("Keputusan")) return <FileText className="w-4 h-4 text-amber-500" />;
  return <ClipboardList className="w-4 h-4 text-emerald-500" />;
};

export default function SuratPage() {
  const [data, setData] = useState<Surat[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedSurat, setSelectedSurat] = useState<Surat | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { form, setForm, clearDraft: clearFormDraft } = useFormDraft("draft_surat_form", {
    judul: "", jenis: JENIS_OPTIONS[0], isi: "", penerima: "all"
  });
  const { form: template, setForm: setTemplate, clearDraft: clearTemplateDraft } = useFormDraft("draft_surat_template", {
    tanggal: "", waktu: "", tempat: "", acara: ""
  });
  const { form: workshopTemplate, setForm: setWorkshopTemplate, clearDraft: clearWorkshopTemplateDraft } = useFormDraft("draft_surat_workshop", {
    tanggal: "", waktu: "", tempat: "", tema: "", narasumber: "", peserta: "Guru Kelas MI se-Kecamatan Talang", dresscode: "Batik/Seragam Dinas"
  });
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [madrasahs, setMadrasahs] = useState<any[]>([]);
  const [isTempatRapatLainnya, setIsTempatRapatLainnya] = useState(false);
  const [isTempatWorkshopLainnya, setIsTempatWorkshopLainnya] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/surat");
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } catch (e) {
      Swal.fire("Error", "Gagal memuat data surat", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMadrasah = async () => {
    try {
      const res = await fetch("/api/madrasah");
      const json = await res.json();
      setMadrasahs(json);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { 
    fetchData(); 
    fetchMadrasah();
  }, [fetchData]);

  const formatDateIndo = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
      return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.jenis !== "Lainnya" && form.jenis !== "Pemberitahuan") {
       if (form.jenis === "Undangan Rapat" && (!template.tanggal || !template.waktu || !template.tempat || !template.acara)) {
          Swal.fire("Error", "Mohon lengkapi semua form template rapat", "error");
          return;
       }
       if (form.jenis === "Undangan Workshop" && (!workshopTemplate.tema || !workshopTemplate.tanggal || !workshopTemplate.waktu || !workshopTemplate.tempat || !workshopTemplate.narasumber)) {
          Swal.fire("Error", "Mohon lengkapi semua form template workshop", "error");
          return;
       }
    }
    
    setSubmitting(true);
    try {
      let finalIsi = form.isi;
      let finalJudul = form.judul;

      if (form.jenis === "Undangan Rapat") {
        if (!finalJudul) finalJudul = `Undangan Rapat: ${template.acara || "KKG"}`;
        const formattedDate = formatDateIndo(template.tanggal);
        finalIsi = `Assalamu'alaikum Wr. Wb.\n\nDengan hormat, \nSehubungan dengan adanya kegiatan KKG, kami mengundang Bapak/Ibu Kepala Madrasah beserta Guru Kelas untuk hadir pada pertemuan yang akan diselenggarakan pada:\n\nHari/Tanggal : ${formattedDate}\nWaktu        : ${template.waktu}\nTempat       : ${template.tempat}\nAcara        : ${template.acara}\n\nMengingat pentingnya acara tersebut, kehadiran Bapak/Ibu sangat kami harapkan.\n\nDemikian undangan ini kami sampaikan. Atas perhatian dan kerjasamanya, kami ucapkan terima kasih.\n\nWassalamu'alaikum Wr. Wb.`;
      } else if (form.jenis === "Undangan Workshop") {
        if (!finalJudul) finalJudul = `Undangan Workshop KKG: ${workshopTemplate.tema || "Tingkat Kecamatan"}`;
        const formattedDate = formatDateIndo(workshopTemplate.tanggal);
        finalIsi = `Assalamu'alaikum Wr. Wb.\n\nDengan hormat,\nDalam rangka peningkatan kompetensi dan profesionalisme guru, Kelompok Kerja Guru (KKG) MI Kecamatan Talang bermaksud menyelenggarakan kegiatan Workshop. Untuk itu, kami mengundang Bapak/Ibu untuk hadir pada kegiatan yang akan dilaksanakan sebagai berikut:\n\nTema         : ${workshopTemplate.tema}\nHari/Tanggal : ${formattedDate}\nWaktu        : ${workshopTemplate.waktu}\nTempat       : ${workshopTemplate.tempat}\nNarasumber   : ${workshopTemplate.narasumber}\nPeserta      : ${workshopTemplate.peserta}\nDress Code   : ${workshopTemplate.dresscode}\n\nMengingat pentingnya kegiatan ini dalam rangka peningkatan mutu pembelajaran, kehadiran Bapak/Ibu tepat waktu sangat kami harapkan.\n\nDemikian undangan ini kami sampaikan. Atas perhatian dan kehadirannya, kami ucapkan terima kasih.\n\nWassalamu'alaikum Wr. Wb.`;
      }

      const fd = new FormData();
      fd.append("judul", finalJudul);
      fd.append("jenis", form.jenis);
      fd.append("isi", finalIsi);
      fd.append("penerima", form.penerima);
      if (fileInput) fd.append("file", fileInput);

      const res = await fetch("/api/surat", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal membuat surat");

      // Auto-create Kegiatan untuk Undangan agar ada QR Absensi
      if (form.jenis === "Undangan Rapat" || form.jenis === "Undangan Workshop") {
        try {
           const isRapat = form.jenis === "Undangan Rapat";
           const formattedDate = formatDateIndo(isRapat ? template.tanggal : workshopTemplate.tanggal);
           const kData = {
              nama: finalJudul,
              jenis: isRapat ? "KKG" : "KKM",
              tempat: isRapat ? template.tempat : workshopTemplate.tempat,
              tanggal: formattedDate,
              waktu: isRapat ? template.waktu : workshopTemplate.waktu
           };
           await fetch("/api/kegiatan", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(kData)
           });
        } catch (e) {
           console.error("Gagal membuat kegiatan otomatis", e);
        }
      }

      Swal.fire("Berhasil! ✉️", "Surat berhasil dibuat, dan Kegiatan + QR Absensi otomatis ditambahkan", "success");
      setShowModal(false);
      clearFormDraft();
      clearTemplateDraft();
      clearWorkshopTemplateDraft();
      setFileInput(null);
      fetchData();
    } catch (err: any) {
      Swal.fire("Gagal", err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Hapus Surat?",
      text: "Surat yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/surat/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");
      Swal.fire("Terhapus!", "Surat berhasil dihapus.", "success");
      fetchData();
    } catch (err: any) {
      Swal.fire("Error", err.message, "error");
    }
  };

  const filtered = data.filter(s =>
    s.judul?.toLowerCase().includes(search.toLowerCase()) ||
    s.jenis?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileSignature className="w-6 h-6 text-emerald-600" />
            Surat Menyurat
          </h1>
          <p className="text-slate-500 text-sm mt-1">Kelola distribusi undangan rapat, SK, dan edaran kepada anggota madrasah.</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-all">
          <Plus className="w-4 h-4" /> Buat Surat
        </button>
      </div>

      <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input type="text" placeholder="Cari judul atau jenis surat..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm" />
            </div>
            <Badge variant="secondary" className="px-4 py-2 bg-emerald-50 text-emerald-700 font-semibold text-sm self-start sm:self-center">
              Total: {filtered.length} Surat
            </Badge>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
          ) : filtered.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/50 text-slate-500 font-medium">
                  <tr>
                    <th className="px-5 py-4">Nomor Surat</th>
                    <th className="px-5 py-4">Surat</th>
                    <th className="px-5 py-4">Jenis</th>
                    <th className="px-5 py-4">Penerima</th>
                    <th className="px-5 py-4">Tanggal</th>
                    <th className="px-5 py-4 text-center">Dibaca</th>
                    <th className="px-5 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center font-mono text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                          {s.nomor_surat || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {jenisIcon(s.jenis)}
                          <span className="font-semibold text-slate-800 line-clamp-1">{s.judul}</span>
                        </div>
                        {s.file_url && <span className="text-xs text-emerald-600 flex items-center gap-1 mt-1"><Download className="w-3 h-3" />Ada lampiran</span>}
                      </td>
                      <td className="px-5 py-4 text-slate-600">{s.jenis}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${s.penerima === "all" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"}`}>
                          <Users className="w-3 h-3" />
                          {s.penerima === "all" ? "Semua Madrasah" : "Pilihan"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-xs">
                        {s.created_at ? new Date(s.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm">
                          {s.dibaca_count}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right space-x-2">
                        <button onClick={() => setSelectedSurat(s)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Lihat Detail">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(s.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 px-4">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileSignature className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Belum ada surat</h3>
              <p className="text-slate-500 text-sm">Klik tombol "Buat Surat" untuk membuat surat pertama.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Buat Surat */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" /> Buat Surat Baru
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Judul Surat {!["Undangan Rapat", "Undangan Workshop"].includes(form.jenis) && <span className="text-red-500">*</span>}</label>
                  <input type="text" required={!["Undangan Rapat", "Undangan Workshop"].includes(form.jenis)} value={form.judul} onChange={e => setForm(f => ({ ...f, judul: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50 text-sm"
                    placeholder={["Undangan Rapat", "Undangan Workshop"].includes(form.jenis) ? "Boleh dikosongkan (Otomatis dari sistem)" : "Contoh: Edaran Libur Semester"} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Jenis Surat <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select value={form.jenis} onChange={e => setForm(f => ({ ...f, jenis: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50 text-sm appearance-none">
                      {JENIS_OPTIONS.map(j => <option key={j} value={j}>{j}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Penerima</label>
                  <div className="relative">
                    <select value={form.penerima} onChange={e => setForm(f => ({ ...f, penerima: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50 text-sm appearance-none">
                      <option value="all">Semua Madrasah</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                {form.jenis === "Undangan Rapat" ? (
                  <div className="sm:col-span-2 grid gap-5 sm:grid-cols-2 bg-emerald-50/30 p-5 rounded-xl border border-emerald-100">
                    <div className="sm:col-span-2">
                      <p className="text-sm font-bold text-emerald-800">🗓️ Detail Undangan Rapat</p>
                      <p className="text-xs text-emerald-600 mt-1">Isi form berikut, teks surat akan disusun otomatis.</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700">Hari/Tanggal <span className="text-red-500">*</span></label>
                      <input type="date" required value={template.tanggal} onChange={e => setTemplate(t => ({ ...t, tanggal: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700">Waktu (WIB) <span className="text-red-500">*</span></label>
                      <input type="text" required value={template.waktu} onChange={e => setTemplate(t => ({ ...t, waktu: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white text-sm"
                        placeholder="Contoh: 08.00 - Selesai" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700">Tempat <span className="text-red-500">*</span></label>
                      <select 
                        value={isTempatRapatLainnya ? "lainnya" : (madrasahs.some(m => m.nama === template.tempat) ? template.tempat : (template.tempat ? "lainnya" : ""))} 
                        onChange={e => {
                          if (e.target.value === "lainnya") {
                            setIsTempatRapatLainnya(true);
                            setTemplate(t => ({ ...t, tempat: "" }));
                          } else {
                            setIsTempatRapatLainnya(false);
                            setTemplate(t => ({ ...t, tempat: e.target.value }));
                          }
                        }}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white text-sm appearance-none"
                      >
                        <option value="" disabled>-- Pilih Madrasah --</option>
                        {madrasahs.map(m => (
                          <option key={m.id} value={m.nama}>{m.nama}</option>
                        ))}
                        <option value="lainnya">Lainnya (Ketik Manual)</option>
                      </select>
                      {isTempatRapatLainnya && (
                        <input type="text" required placeholder="Contoh: Gedung MWC NU Talang" value={template.tempat} onChange={e => setTemplate(t => ({ ...t, tempat: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white text-sm mt-2" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700">Acara <span className="text-red-500">*</span></label>
                      <input type="text" required value={template.acara} onChange={e => setTemplate(t => ({ ...t, acara: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white text-sm"
                        placeholder="Contoh: Rapat Koordinasi Kurikulum" />
                    </div>
                  </div>
                ) : form.jenis === "Undangan Workshop" ? (
                  <div className="sm:col-span-2 grid gap-5 sm:grid-cols-2 bg-blue-50/30 p-5 rounded-xl border border-blue-100">
                    <div className="sm:col-span-2">
                      <p className="text-sm font-bold text-blue-800">🎓 Detail Undangan Workshop KKG</p>
                      <p className="text-xs text-blue-600 mt-1">Isi form berikut, teks undangan workshop akan disusun secara otomatis dan profesional.</p>
                    </div>
                    <div className="sm:col-span-2 space-y-2">
                      <label className="text-xs font-semibold text-slate-700">Tema Workshop <span className="text-red-500">*</span></label>
                      <input type="text" required value={workshopTemplate.tema} onChange={e => setWorkshopTemplate(t => ({ ...t, tema: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-sm"
                        placeholder="Contoh: Peningkatan Kompetensi Guru dalam Pembelajaran Berdiferensiasi" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700">Hari/Tanggal <span className="text-red-500">*</span></label>
                      <input type="date" required value={workshopTemplate.tanggal} onChange={e => setWorkshopTemplate(t => ({ ...t, tanggal: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700">Waktu (WIB) <span className="text-red-500">*</span></label>
                      <input type="text" required value={workshopTemplate.waktu} onChange={e => setWorkshopTemplate(t => ({ ...t, waktu: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-sm"
                        placeholder="Contoh: 08.00 - 15.00" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700">Tempat <span className="text-red-500">*</span></label>
                      <select 
                        value={isTempatWorkshopLainnya ? "lainnya" : (madrasahs.some(m => m.nama === workshopTemplate.tempat) ? workshopTemplate.tempat : (workshopTemplate.tempat ? "lainnya" : ""))} 
                        onChange={e => {
                          if (e.target.value === "lainnya") {
                            setIsTempatWorkshopLainnya(true);
                            setWorkshopTemplate(t => ({ ...t, tempat: "" }));
                          } else {
                            setIsTempatWorkshopLainnya(false);
                            setWorkshopTemplate(t => ({ ...t, tempat: e.target.value }));
                          }
                        }}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-sm appearance-none"
                      >
                        <option value="" disabled>-- Pilih Madrasah --</option>
                        {madrasahs.map(m => (
                          <option key={m.id} value={m.nama}>{m.nama}</option>
                        ))}
                        <option value="lainnya">Lainnya (Ketik Manual)</option>
                      </select>
                      {isTempatWorkshopLainnya && (
                        <input type="text" required placeholder="Contoh: Aula MI Talang 1" value={workshopTemplate.tempat} onChange={e => setWorkshopTemplate(t => ({ ...t, tempat: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-sm mt-2" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700">Narasumber <span className="text-red-500">*</span></label>
                      <input type="text" required value={workshopTemplate.narasumber} onChange={e => setWorkshopTemplate(t => ({ ...t, narasumber: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-sm"
                        placeholder="Contoh: Pengawas Madrasah Kec. Talang" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700">Peserta</label>
                      <input type="text" value={workshopTemplate.peserta} onChange={e => setWorkshopTemplate(t => ({ ...t, peserta: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-sm"
                        placeholder="Guru Kelas MI se-Kecamatan Talang" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700">Dress Code</label>
                      <input type="text" value={workshopTemplate.dresscode} onChange={e => setWorkshopTemplate(t => ({ ...t, dresscode: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-sm"
                        placeholder="Batik/Seragam Dinas" />
                    </div>
                  </div>
                ) : (
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Isi Surat</label>
                    <textarea rows={5} value={form.isi} onChange={e => setForm(f => ({ ...f, isi: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50 text-sm resize-none"
                      placeholder="Tuliskan isi surat di sini..." />
                  </div>
                )}
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Lampiran File (PDF/Dokumen)</label>
                  <input type="file" accept=".pdf,.doc,.docx,.xlsx,.xls"
                    onChange={e => setFileInput(e.target.files?.[0] || null)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
                  {fileInput && <p className="text-xs text-emerald-600">✓ {fileInput.name}</p>}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={submitting}
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all disabled:opacity-70">
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Mengirim...</> : <><FileSignature className="w-4 h-4" />Kirim Surat</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Surat */}
      {selectedSurat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {jenisIcon(selectedSurat.jenis)}
                  <Badge variant="outline" className="text-xs bg-white">{selectedSurat.jenis}</Badge>
                </div>
                <h3 className="text-lg font-bold text-slate-800">{selectedSurat.judul}</h3>
                <p className="text-xs text-slate-500 mt-1">Oleh {selectedSurat.created_by} • {selectedSurat.created_at ? new Date(selectedSurat.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' }) : ""}</p>
              </div>
              <button onClick={() => setSelectedSurat(null)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {selectedSurat.isi && (
                <div className="bg-slate-50 p-4 rounded-xl text-slate-700 whitespace-pre-wrap text-sm leading-relaxed border border-slate-100">
                  {selectedSurat.isi}
                </div>
              )}
              
              <div className="flex flex-wrap gap-3 pt-2">
                {selectedSurat.file_url && (
                  <a href={selectedSurat.file_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all">
                    <Download className="w-4 h-4" /> Unduh Lampiran
                  </a>
                )}
                {/* Tombol khusus PDF format resmi Kop KKG */}
                <DownloadPdfBtn surat={selectedSurat} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
