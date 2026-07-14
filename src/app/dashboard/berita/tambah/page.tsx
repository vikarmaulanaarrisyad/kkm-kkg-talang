"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import { ArrowLeft, Save, Image as ImageIcon, Send, X, FileText, CheckCircle2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

export default function TambahBeritaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("Draft");
  const [category, setCategory] = useState("Umum");
  const [categories, setCategories] = useState<any[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/kategori")
      .then(res => res.json())
      .then(json => {
        if (json.data && json.data.length > 0) {
          setCategories(json.data);
          setCategory(json.data[0].name);
        }
      })
      .catch(console.error);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent, isDraft: boolean = false) => {
    e.preventDefault();
    if (!title || !content) {
      Swal.fire('Peringatan!', 'Judul dan isi berita wajib diisi.', 'warning');
      setError("Judul dan isi berita wajib diisi.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      Swal.fire({
        title: 'Menyimpan...',
        text: 'Sedang mengunggah data',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const finalStatus = isDraft ? "Draft" : "Published";
      setStatus(finalStatus);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("status", finalStatus);
      formData.append("category", category);
      if (image) {
        formData.append("image", image);
      }

      const res = await fetch("/api/berita", {
        method: "POST",
        body: formData,
      });

      if (res.status === 413) {
        throw new Error("Ukuran gambar terlalu besar! Maksimal 4MB.");
      }

      let data;
      try {
        data = await res.json();
      } catch (e) {
        throw new Error("Terjadi kesalahan pada server (Respon tidak valid).");
      }

      if (!res.ok) {
        throw new Error(data?.error || "Gagal menyimpan berita.");
      }

      await Swal.fire('Berhasil!', 'Berita berhasil disimpan.', 'success');
      router.push("/dashboard/berita");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      Swal.fire('Gagal!', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" render={<Link href="/dashboard/berita" className="rounded-xl bg-white border-border/50 hover:bg-muted shadow-sm" />}>
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Tulis Berita</h1>
            <p className="text-sm text-muted-foreground font-medium">Buat pengumuman atau artikel baru untuk madrasah.</p>
          </div>
        </div>
      </div>

      <form className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Main Content Form */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="rounded-[1.5rem] border-border/40 shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-muted/10 border-b border-border/40 pb-6">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Konten Utama
              </CardTitle>
              <CardDescription>Masukkan judul dan isi berita utama di sini.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-xl border border-destructive/20 font-medium flex items-center gap-2">
                  <X className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-bold">Judul Berita <span className="text-destructive">*</span></Label>
                <Input 
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Peringatan Hari Santri Nasional 2026..."
                  className="h-12 px-4 rounded-xl border-border/50 bg-background focus-visible:ring-primary text-base font-medium transition-all"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content" className="text-sm font-bold flex items-center justify-between">
                  <span>Isi Berita <span className="text-destructive">*</span></span>
                </Label>
                <div className="rounded-xl border border-border/50 overflow-hidden bg-background focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all shadow-sm">
                  <Textarea 
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Tulis paragraf lengkap dari berita Anda..."
                    className="min-h-[400px] border-0 focus-visible:ring-0 rounded-none px-4 py-4 resize-y text-base leading-relaxed bg-transparent"
                    disabled={loading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Settings Form */}
        <div className="space-y-6">
          <Card className="rounded-[1.5rem] border-border/40 shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-muted/10 border-b border-border/40 pb-6">
              <CardTitle className="text-lg flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                Media & Pengaturan
              </CardTitle>
              <CardDescription>Upload sampul dan atur status.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              <div className="space-y-3">
                <Label className="text-sm font-bold block">Kategori</Label>
                <Select value={category} onValueChange={(val) => setCategory(val || "")} disabled={loading}>
                  <SelectTrigger className="h-12 rounded-xl bg-background border-border/50">
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length > 0 ? categories.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    )) : (
                      <SelectItem value="Umum">Umum</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-bold block">Gambar Sampul</Label>
                {!previewUrl ? (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border/60 hover:border-primary/50 rounded-xl bg-muted/20 hover:bg-primary/5 cursor-pointer transition-all">
                    <div className="flex flex-col items-center justify-center">
                      <div className="p-3 bg-white rounded-full shadow-sm mb-2">
                        <Upload className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">Klik untuk upload</p>
                      <p className="text-[11px] text-muted-foreground mt-1">JPG, PNG maks 5MB</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} disabled={loading} />
                  </label>
                ) : (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden group border border-border/50 shadow-sm">
                    <img src={previewUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="destructive" size="sm" onClick={removeImage} className="rounded-lg px-4 font-bold">
                        <X className="w-4 h-4 mr-2" />
                        Hapus
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-2">
                <Label className="text-sm font-bold block">Status Publikasi</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div 
                    onClick={() => !loading && setStatus("Draft")}
                    className={`flex items-center justify-center p-3.5 rounded-xl border-2 cursor-pointer transition-all ${status === "Draft" ? "border-amber-500 bg-amber-500/10" : "border-border/50 bg-background hover:bg-muted/50"} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${status === "Draft" ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" : "bg-muted-foreground/30"}`}></div>
                      <span className={`font-bold text-sm ${status === "Draft" ? "text-amber-700 dark:text-amber-500" : "text-muted-foreground"}`}>Draft</span>
                    </div>
                  </div>
                  <div 
                    onClick={() => !loading && setStatus("Published")}
                    className={`flex items-center justify-center p-3.5 rounded-xl border-2 cursor-pointer transition-all ${status === "Published" ? "border-emerald-500 bg-emerald-500/10" : "border-border/50 bg-background hover:bg-muted/50"} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${status === "Published" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" : "bg-muted-foreground/30"}`}></div>
                      <span className={`font-bold text-sm ${status === "Published" ? "text-emerald-700 dark:text-emerald-500" : "text-muted-foreground"}`}>Published</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <div className="p-6 bg-muted/10 border-t border-border/40 space-y-3">
              <Button 
                type="button"
                variant="outline"
                onClick={(e) => handleSubmit(e, true)}
                disabled={loading}
                className="w-full h-12 rounded-xl font-bold border-border/60 bg-white hover:bg-muted transition-all"
              >
                {loading && status === "Draft" ? "Menyimpan Draft..." : "Simpan Draft"}
              </Button>
              <Button 
                type="button"
                onClick={(e) => handleSubmit(e, false)}
                disabled={loading}
                className="w-full h-12 rounded-xl font-bold shadow-md hover:shadow-lg transition-all bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {loading && status === "Published" ? (
                  "Menyimpan..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Publikasikan Berita
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
}
