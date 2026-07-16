"use client";

import { useState, useEffect } from "react";
import { Users, KeyRound, CheckCircle2, XCircle, Search, ShieldAlert, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Swal from "sweetalert2";
import Link from "next/link";

export default function AdminUsersPage() {
  const [guru, setGuru] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [madrasahList, setMadrasahList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchGuru, setSearchGuru] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resGuru, resReq, resM] = await Promise.all([
        fetch("/api/guru"),
        fetch("/api/users/reset-request"),
        fetch("/api/madrasah")
      ]);
      const dataGuru = await resGuru.json();
      const dataReq = await resReq.json();
      const dataM = await resM.json();
      
      setGuru(Array.isArray(dataGuru) ? dataGuru : []);
      setRequests(Array.isArray(dataReq) ? dataReq : []);
      setMadrasahList(Array.isArray(dataM) ? dataM : []);
    } finally {
      setLoading(false);
    }
  };

  const getMadrasahName = (id: string) => madrasahList.find(m => m.id === id)?.nama || "—";

  useEffect(() => { fetchData(); }, []);

  const handleAction = async (action: "approve" | "reject" | "direct_reset", g: any, requestId?: string) => {
    let title = "";
    let text = "";
    
    if (action === "approve") {
      title = "Setujui Reset Password?";
      text = `Password untuk "${g.nama_guru || g.nama}" akan diubah menjadi 123456.`;
    } else if (action === "reject") {
      title = "Tolak Pengajuan?";
      text = `Anda akan menolak pengajuan reset untuk "${g.nama_guru || g.nama}".`;
    } else {
      title = "Reset Password Langsung?";
      text = `Anda akan me-reset paksa password "${g.nama}" menjadi 123456.`;
    }

    const result = await Swal.fire({
      title,
      text,
      icon: action === "reject" ? "warning" : "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Lanjutkan",
      cancelButtonText: "Batal",
      confirmButtonColor: action === "reject" ? "#d33" : "#059669",
    });
    
    if (!result.isConfirmed) return;

    Swal.fire({ title: 'Memproses...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    
    try {
      const res = await fetch("/api/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guru_id: g.guru_id || g.id, action, request_id: requestId })
      });
      const data = await res.json();
      
      if (!res.ok) {
        Swal.fire("Gagal", data.error, "error");
        return;
      }
      
      Swal.fire("Berhasil", data.message, "success");
      fetchData();
    } catch (e: any) {
      Swal.fire("Gagal", "Terjadi kesalahan sistem", "error");
    }
  };

  const filteredGuru = guru.filter(g => g.nama?.toLowerCase().includes(searchGuru.toLowerCase()) || g.nuptk?.includes(searchGuru));
  const pendingRequests = requests.filter(r => r.status === "pending");

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm shrink-0">
              <ShieldAlert className="w-6 h-6 text-emerald-100" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Manajemen Akun Guru (KKG)</h1>
              <p className="text-emerald-100 text-xs sm:text-sm mt-0.5">Setujui pengajuan reset password dari Madrasah atau reset langsung.</p>
            </div>
          </div>
          <Link href="/dashboard/guru" className="flex items-center justify-center gap-2 text-sm font-medium text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Data Guru
          </Link>
        </div>
      </div>

      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList className="bg-slate-100 p-1">
          <TabsTrigger value="requests" className="relative">
            Permintaan Reset
            {pendingRequests.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{pendingRequests.length}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">Semua Akun Guru</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : pendingRequests.length === 0 ? (
            <Card><CardContent className="py-16 text-center">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-400/30 mb-4" />
              <p className="font-semibold text-muted-foreground">Tidak ada permintaan reset yang menunggu.</p>
            </CardContent></Card>
          ) : (
            <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b">
                    <tr>
                      <th className="px-6 py-4 font-bold">Waktu Pengajuan</th>
                      <th className="px-6 py-4 font-bold">Madrasah</th>
                      <th className="px-6 py-4 font-bold">Nama Guru</th>
                      <th className="px-6 py-4 font-bold text-right">Aksi (KKG)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {pendingRequests.map((r, i) => (
                      <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-slate-500 text-xs">
                          {new Date(r.requested_at).toLocaleString("id-ID")}
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-medium">
                          {getMadrasahName(r.madrasah_id)}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-800">
                          {r.nama_guru}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleAction("reject", r, r.id)}>
                              Tolak
                            </Button>
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleAction("approve", r, r.id)}>
                              Setujui
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
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Cari nama atau NUPTK..." className="pl-9 bg-white" value={searchGuru} onChange={e => setSearchGuru(e.target.value)} />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : filteredGuru.length === 0 ? (
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
                      <th className="px-6 py-4 font-bold">Madrasah</th>
                      <th className="px-6 py-4 font-bold">Nama Guru</th>
                      <th className="px-6 py-4 font-bold">Identitas (NIP/NUPTK/PegID)</th>
                      <th className="px-6 py-4 font-bold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredGuru.map((g, i) => (
                      <tr key={g.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-slate-600 text-xs">
                          {getMadrasahName(g.madrasah_id)}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-800">
                          {g.gelar_depan ? `${g.gelar_depan} ` : ""}{g.nama}{g.gelar_belakang ? `, ${g.gelar_belakang}` : ""}
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                          {g.nip || g.peg_id || g.nuptk || "—"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            className="gap-2 bg-red-500 hover:bg-red-600"
                            onClick={() => handleAction("direct_reset", g)}
                          >
                            <KeyRound className="w-3.5 h-3.5" /> 
                            Reset Paksa
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
