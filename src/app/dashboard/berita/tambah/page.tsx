"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UploadCloud, Save } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
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

export default function TambahBeritaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("Draft");
  const [image, setImage] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      setError("Judul dan isi berita wajib diisi.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("status", status);
      if (image) {
        formData.append("image", image);
      }

      const res = await fetch("/api/berita", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan berita.");
      }

      router.push("/dashboard/berita");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/berita">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tulis Berita</h1>
          <p className="text-muted-foreground text-sm">Buat dan publikasikan informasi terbaru KKM.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Informasi Berita</CardTitle>
            <CardDescription>Masukkan rincian berita. Gambar akan diunggah otomatis ke Cloudinary.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md border border-destructive/20">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Judul Berita <span className="text-destructive">*</span></Label>
              <Input 
                id="title" 
                placeholder="Masukkan judul berita yang menarik..." 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="image">Gambar Sampul (Opsional)</Label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input 
                      id="image" 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setImage(e.target.files?.[0] || null)}
                      disabled={loading}
                      className="cursor-pointer"
                    />
                  </div>
                  {image && (
                    <div className="text-xs text-muted-foreground truncate w-24">
                      {image.name}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status Publikasi</Label>
                <Select value={status} onValueChange={setStatus} disabled={loading}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft (Simpan Sementara)</SelectItem>
                    <SelectItem value="Published">Published (Publikasikan)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Isi Berita <span className="text-destructive">*</span></Label>
              <Textarea 
                id="content" 
                placeholder="Tulis konten berita lengkap di sini..." 
                className="min-h-[300px] resize-y"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={loading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 border-t border-border/50 pt-6">
            <Button variant="ghost" type="button" asChild disabled={loading}>
              <Link href="/dashboard/berita">Batal</Link>
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[120px]">
              {loading ? (
                <>
                  <UploadCloud className="w-4 h-4 mr-2 animate-bounce" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Berita
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
