"use client";

import { useState, useEffect } from "react";
import { Users, KeyRound, CheckCircle2, XCircle, Search, ShieldAlert, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Swal from "sweetalert2";
import Link from "next/link";

export default function MadrasahUsersPage() {
  const [guru, setGuru] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resGuru, resReq] = await Promise.all([
        fetch("/api/guru"),
        fetch("/api/users/reset-request")
      ]);
      const dataGuru = await resGuru.json();
      const dataReq = await resReq.json();
      
      setGuru(Array.isArray(dataGuru) ? dataGuru : []);
      setRequests(Array.isArray(dataReq) ? dataReq : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAjukanReset = async (g: any) => {
    const result = await Swal.fire({
      title: "Ajukan Reset Password?",
      text: `Anda akan mengajukan reset password untuk "${g.nama}" ke Admin KKG. Password akan direset menjadi default (123456).`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Ajukan",
      cancelButtonText: "Batal",
      confirmButtonColor: "#059669",
    });
    
    if (!result.isConfirmed) return;

    Swal.fire({ title: 'Memproses...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    
    try {
      const res = await fetch("/api/users/reset-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guru_id: g.id, nama_guru: g.nama })
      });
      const data = await res.json();
      
      if (!res.ok) {
        Swal.fire("Gagal", data.error, "error");
        return;
      }
      
      Swal.fire("Berhasil", "Pengajuan reset berhasil dikirim ke Admin KKG.", "success");
      fetchData();
    } catch (e: any) {
      Swal.fire("Gagal", "Terjadi kesalahan sistem", "error");
    }
  };

  const filtered = guru.filter(g => g.nama?.toLowerCase().includes(search.toLowerCase()) || g.nuptk?.includes(search));

  const getRequestStatus = (guru_id: string) => {
    // Cari request terakhir untuk guru ini
    const reqs = requests.filter(r => r.guru_id === guru_id);
    if (reqs.length === 0) return null;
    
    // Sort descending by requested_at
    reqs.sort((a, b) => new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime());
    return reqs[0].status;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm shrink-0">
              <ShieldAlert className="w-6 h-6 text-emerald-100" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Manajemen Akun Guru</h1>
              <p className="text-emerald-100 text-xs sm:text-sm mt-0.5">Kelola akses dan ajukan reset password guru ke Admin KKG.</p>
            </div>
          </div>
          <Link href="/madrasah/guru" className="flex items-center justify-center gap-2 text-sm font-medium text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Data Guru
          </Link>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Cari nama atau NUPTK..." className="pl-9 bg-white" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-16 text-center">
          <Users className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="font-semibold text-muted-foreground">Belum ada data guru</p>
        </CardContent></Card>
      ) : (
        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b">
                <tr>
                  <th className="px-6 py-4 font-bold">No</th>
                  <th className="px-6 py-4 font-bold">Nama Guru</th>
                  <th className="px-6 py-4 font-bold">Identitas (NIP/NUPTK/PegID)</th>
                  <th className="px-6 py-4 font-bold">Status Reset</th>
                  <th className="px-6 py-4 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((g, i) => {
                  const status = getRequestStatus(g.id);
                  return (
                    <tr key={g.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-slate-500">{i + 1}</td>
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {g.gelar_depan ? `${g.gelar_depan} ` : ""}{g.nama}{g.gelar_belakang ? `, ${g.gelar_belakang}` : ""}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                        {g.nip || g.peg_id || g.nuptk || "—"}
                      </td>
                      <td className="px-6 py-4">
                        {status === "pending" && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200"><Loader2 className="w-3 h-3 animate-spin" /> Menunggu KKG</span>}
                        {status === "approved" && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3 h-3" /> Disetujui</span>}
                        {status === "rejected" && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200"><XCircle className="w-3 h-3" /> Ditolak</span>}
                        {!status && <span className="text-slate-400">—</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="gap-2"
                          disabled={status === "pending"}
                          onClick={() => handleAjukanReset(g)}
                        >
                          <KeyRound className="w-3.5 h-3.5" /> 
                          {status === "pending" ? "Sedang Diajukan" : "Ajukan Reset"}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
