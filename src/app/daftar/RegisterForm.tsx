"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, Eye, EyeOff, School } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Step = "form" | "success";

export default function RegisterForm() {
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    nama: "",
    nsm: "",
    npsn: "",
    kecamatan: "",
    alamat: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/madrasah", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: form.nama,
          nsm: form.nsm,
          npsn: form.npsn,
          kecamatan: form.kecamatan,
          alamat: form.alamat,
          username: form.username,
          password: form.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Terjadi kesalahan. Silakan coba lagi.");
        return;
      }
      setStep("success");
    } catch {
      setError("Terjadi kesalahan jaringan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "success") {
    return (
      <div className="w-full text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">Pendaftaran Berhasil!</h2>
          <p className="mt-3 text-slate-600 leading-relaxed text-sm">
            Pendaftaran <strong>{form.nama}</strong> telah diterima dan sedang menunggu verifikasi dari Admin KKM & KKG.
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-left space-y-2">
          <p className="text-sm font-bold text-amber-800">📋 Apa selanjutnya?</p>
          <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
            <li>Admin KKM & KKG akan meninjau pendaftaran Anda</li>
            <li>Setelah diaktivasi, Anda bisa login menggunakan username yang didaftarkan</li>
            <li>Hubungi pengurus KKM & KKG jika butuh info lebih lanjut</li>
          </ul>
        </div>
        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all"
          >
            Cek Status Login
          </Link>
          <Link href="/" className="text-sm text-slate-500 hover:text-emerald-700 transition-colors">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Data Madrasah */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 pb-2 border-b border-slate-100">
            Data Madrasah
          </h3>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nama">Nama Madrasah <span className="text-red-500">*</span></Label>
              <Input id="nama" value={form.nama} onChange={set("nama")} placeholder="MI Nurul Huda Talang" required className="h-11 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="nsm">NSM</Label>
                <Input id="nsm" value={form.nsm} onChange={set("nsm")} placeholder="111232000000" maxLength={12} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="npsn">NPSN</Label>
                <Input id="npsn" value={form.npsn} onChange={set("npsn")} placeholder="60712345" maxLength={8} className="h-11 rounded-xl" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kecamatan">Kecamatan</Label>
              <Input id="kecamatan" value={form.kecamatan} onChange={set("kecamatan")} placeholder="Talang" className="h-11 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="alamat">Alamat</Label>
              <Input id="alamat" value={form.alamat} onChange={set("alamat")} placeholder="Jl. Raya No. 1, Desa ..." className="h-11 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Akun Login */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 pb-2 border-b border-slate-100 mt-6">
            Akun Login
          </h3>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">Username <span className="text-red-500">*</span></Label>
              <Input
                id="username"
                value={form.username}
                onChange={set("username")}
                placeholder="mi-nurul-huda (tanpa spasi)"
                required
                pattern="[a-z0-9\-_]+"
                title="Hanya huruf kecil, angka, tanda hubung, dan underscore"
                className="h-11 rounded-xl"
              />
              <p className="text-xs text-muted-foreground">Hanya huruf kecil, angka, - dan _</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Minimal 6 karakter"
                  required
                  minLength={6}
                  className="h-11 rounded-xl pr-10"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Konfirmasi Password <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={set("confirmPassword")}
                  placeholder="Ulangi password"
                  required
                  className="h-11 rounded-xl pr-10"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white mt-4">
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Mendaftarkan...
            </span>
          ) : "Daftar Sekarang"}
        </Button>
      </form>
    </div>
  );
}
