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
import { DataTable } from "@/components/ui/data-table";

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

  const columns = [
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
      header: "Gambar",
      className: "w-[80px] text-center",
      cell: (item: Berita) => item.image_url ? (
        <div className="w-16 h-10 rounded-md overflow-hidden border border-border/50 mx-auto shadow-sm">
          <img src={item.image_url} alt="Cover" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-16 h-10 rounded-md bg-muted flex items-center justify-center border border-border/50 mx-auto">
          <ImageIcon className="w-4 h-4 text-muted-foreground/50" />
        </div>
      )
    },
    {
      header: "Judul",
      className: "w-[300px]",
      cell: (item: Berita) => (
        <div className="flex flex-col">
          <span className="text-foreground">{item.title}</span>
          <span className="text-xs text-muted-foreground font-normal mt-0.5 truncate max-w-[250px]">/{item.slug}</span>
        </div>
      )
    },
    {
      header: "Kategori",
      cell: (item: Berita) => (
        <Badge variant="outline" className="bg-muted text-muted-foreground">{item.category || "Umum"}</Badge>
      )
    },
    {
      header: "Status",
      cell: (item: Berita) => (
        <Badge variant={item.status === "Published" ? "default" : "secondary"} className={item.status === "Published" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}>
          {item.status}
        </Badge>
      )
    },
    {
      header: "Penulis",
      cell: (item: Berita) => <span className="text-muted-foreground text-sm">{item.author}</span>
    },
    {
      header: "Tanggal",
      cell: (item: Berita) => (
        <span className="text-muted-foreground text-sm">
          {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      )
    },
    {
      header: "Aksi",
      className: "text-right pr-6",
      cell: (item: Berita) => (
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
      )
    }
  ];

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

      <DataTable 
        columns={columns}
        data={data}
        meta={meta}
        loading={loading}
        searchPlaceholder="Cari judul berita..."
        initialSearch={search}
        onSearch={setSearch}
        onPageChange={setPage}
        emptyMessage="Tidak ada berita ditemukan."
        emptyIcon={<FileText className="w-10 h-10 mb-3 opacity-20" />}
      />
    </div>
  );
}
