"use client";

import { useState, useEffect } from "react";
import { Users, Search, Download, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Guru = {
  id: string;
  madrasah_id: string;
  nama: string;
  nuptk: string;
  peg_id: string;
  nip: string;
  jabatan: string;
  status_kepegawaian: string;
  pendidikan_terakhir: string;
  bidang_studi: string;
  jenis_kelamin: string;
  no_hp: string;
  email: string;
  created_at: string;
};

type Madrasah = { id: string; nama: string; };

export default function AdminGuruPage() {
  const [guru, setGuru] = useState<Guru[]>([]);
  const [madrasahList, setMadrasahList] = useState<Madrasah[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterMadrasah, setFilterMadrasah] = useState("all");

  useEffect(() => {
    fetch("/api/madrasah").then(r => r.json()).then(d => setMadrasahList(Array.isArray(d) ? d : []));
    fetch("/api/guru").then(r => r.json()).then(d => { setGuru(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  const filtered = guru.filter(g => {
    const matchSearch = g.nama?.toLowerCase().includes(search.toLowerCase()) ||
      g.nuptk?.includes(search) || g.peg_id?.includes(search);
    const matchMadrasah = filterMadrasah === "all" || g.madrasah_id === filterMadrasah;
    return matchSearch && matchMadrasah;
  });

  const getMadrasahName = (id: string) => madrasahList.find(m => m.id === id)?.nama || "—";

  const exportCSV = () => {
    const headers = ["No", "Nama", "Madrasah", "NUPTK", "PegID/NIP", "Jabatan", "Status Kepegawaian", "Pend. Terakhir", "Bidang Studi", "No. HP", "Email"];
    const rows = filtered.map((g, i) => [
      i + 1, g.nama, getMadrasahName(g.madrasah_id), g.nuptk, g.peg_id || g.nip,
      g.jabatan, g.status_kepegawaian, g.pendidikan_terakhir, g.bidang_studi, g.no_hp, g.email
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c ?? ""}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "data-guru.csv"; a.click();
  };

  const statusColor = (s: string) => {
    if (s === "PNS") return "bg-emerald-100 text-emerald-700";
    if (s === "Non-PNS") return "bg-blue-100 text-blue-700";
    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Data Guru</h1>
          <p className="text-sm text-muted-foreground">Rekap data seluruh guru dari semua madrasah anggota</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={exportCSV}>
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Cari nama, NUPTK, PegID..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterMadrasah} onValueChange={v => setFilterMadrasah(v ?? "all")}>
          <SelectTrigger className="w-52">
            <Filter className="w-3.5 h-3.5 mr-2" />
            <SelectValue placeholder="Filter Madrasah" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Madrasah</SelectItem>
            {madrasahList.map(m => <SelectItem key={m.id} value={m.id}>{m.nama}</SelectItem>)}
          </SelectContent>
        </Select>
        <Badge variant="secondary" className="h-10 px-4 flex items-center font-bold">
          {filtered.length} Guru
        </Badge>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-16 text-center">
          <Users className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="font-semibold text-muted-foreground">Belum ada data guru</p>
        </CardContent></Card>
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                {["No", "Nama Guru", "Madrasah", "NUPTK", "PegID/NIP", "Jabatan", "Status", "Pend.", "Bidang Studi", "Kontak"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((g, i) => (
                <tr key={g.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                  <td className="px-4 py-3 font-semibold">{g.nama}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{getMadrasahName(g.madrasah_id)}</td>
                  <td className="px-4 py-3 font-mono text-xs">{g.nuptk || "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs">{g.peg_id || g.nip || "—"}</td>
                  <td className="px-4 py-3">{g.jabatan || "—"}</td>
                  <td className="px-4 py-3">
                    {g.status_kepegawaian ? (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusColor(g.status_kepegawaian)}`}>{g.status_kepegawaian}</span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs">{g.pendidikan_terakhir || "—"}</td>
                  <td className="px-4 py-3 text-xs">{g.bidang_studi || "—"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{g.no_hp || g.email || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
