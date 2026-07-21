"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { Plus, Pencil, Trash2, Search, ExternalLink, Image as ImageIcon, ChevronLeft, ChevronRight, RefreshCw, FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface Berita {
  id: string;
  title: string;
  slug: string;
  status: string;
  author: string;
  image_url?: string;
  created_at: string;
  category?: string;
}

type Meta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export default function BeritaPage() {
  const [data, setData] = useState<Berita[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/berita?search=${encodeURIComponent(debouncedSearch)}&page=${page}&limit=10`);
      const json = await res.json();
      if (res.ok) {
        setData(json.data || []);
        if (json.meta) setMeta(json.meta);
      }
    } catch (error) {
      console.error("Gagal mengambil data berita", error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Berita ini akan dihapus secara permanen beserta gambarnya!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });

    if (!result.isConfirmed) return;

    Swal.fire({
      title: 'Menghapus Berita...',
      text: 'Mohon tunggu sebentar',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    try {
      const res = await fetch(`/api/berita/${id}`, { method: "DELETE" });
      const json = await res.json();
      
      if (res.ok) {
        Swal.fire('Terhapus!', 'Berita berhasil dihapus.', 'success');
        fetchData();
      } else {
        Swal.fire('Gagal!', json.error || "Gagal menghapus berita", 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error!', "Terjadi kesalahan sistem saat menghapus", 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kelola Berita</h1>
          <p className="text-muted-foreground mt-1">Daftar semua berita dan informasi KKM.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} className="gap-2">
            <RefreshCw className="w-4 h-4" /> <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2" render={<Link href="/dashboard/berita/tambah" />}>
            <Plus className="w-4 h-4" />
            Berita Baru
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border-border/50 overflow-hidden">
        <CardHeader className="pb-4 border-b border-border/50 bg-muted/10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              Daftar Publikasi
            </CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari judul berita..."
                className="pl-9 h-10 bg-white border-border/50 focus:border-primary focus:bg-background transition-colors"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[50px] text-center">No</TableHead>
                <TableHead className="w-[80px] text-center">Gambar</TableHead>
                <TableHead className="w-[300px]">Judul</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Penulis</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="text-right pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-10 w-16 rounded-md mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full max-w-[250px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="text-right pr-6"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <FileText className="w-10 h-10 mb-3 opacity-20" />
                      <p>Tidak ada berita ditemukan.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item, index) => (
                  <TableRow key={item.id} className="hover:bg-muted/30 transition-colors group">
                    <TableCell className="text-center font-medium text-muted-foreground">
                      {(meta.page - 1) * meta.limit + index + 1}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.image_url ? (
                        <div className="w-16 h-10 rounded-md overflow-hidden border border-border/50 mx-auto shadow-sm">
                          <img src={item.image_url} alt="Cover" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-16 h-10 rounded-md bg-muted flex items-center justify-center border border-border/50 mx-auto">
                          <ImageIcon className="w-4 h-4 text-muted-foreground/50" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="text-foreground">{item.title}</span>
                        <span className="text-xs text-muted-foreground font-normal mt-0.5 truncate max-w-[250px]">/{item.slug}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-muted text-muted-foreground">{item.category || "Umum"}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.status === "Published" ? "default" : "secondary"} className={item.status === "Published" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{item.author}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-40 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" title="Edit" render={<Link href={`/dashboard/berita/edit/${item.id}`} />}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" title="Hapus" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Lihat Publikasi" render={<Link href={`/berita/${item.slug}`} target="_blank" />}>
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {meta.totalPages > 1 && (
            <div className="border-t border-border/50 p-4 flex items-center justify-between bg-muted/10">
              <span className="text-sm text-muted-foreground">
                Menampilkan {(meta.page - 1) * meta.limit + 1} - {Math.min(meta.page * meta.limit, meta.total)} dari {meta.total} berita
              </span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} className="h-8 w-8 p-0">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: meta.totalPages }).map((_, i) => {
                  const p = i + 1;
                  if (meta.totalPages > 5) {
                    if (p !== 1 && p !== meta.totalPages && Math.abs(page - p) > 1) {
                      if (p === 2 || p === meta.totalPages - 1) return <span key={p} className="px-2">...</span>;
                      return null;
                    }
                  }
                  return (
                    <Button key={p} variant={page === p ? "default" : "outline"} size="sm" className="h-8 w-8 p-0" onClick={() => setPage(p)}>
                      {p}
                    </Button>
                  );
                })}
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(p + 1, meta.totalPages))} disabled={page === meta.totalPages} className="h-8 w-8 p-0">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
