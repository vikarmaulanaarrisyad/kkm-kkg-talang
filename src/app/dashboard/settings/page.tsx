"use client";

import { useState, useEffect } from "react";
import { Settings, Shield, Image as ImageIcon, Upload, Save, Eye, EyeOff, Plug, Database, Cloud, HardDrive, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import Swal from "sweetalert2";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("umum");
  
  // State Umum
  const [siteName, setSiteName] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isLogoRemoved, setIsLogoRemoved] = useState(false);
  const [storageProvider, setStorageProvider] = useState("cloudinary");
  
  // State Keamanan
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // State Integrasi
  const [integrations, setIntegrations] = useState<any>(null);
  const [loadingIntegrations, setLoadingIntegrations] = useState(true);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoadingIntegrations(true);
      const res = await fetch("/api/settings");
      if (res.ok) {
        const json = await res.json();
        const data = json.data;
        if (data) {
          setSiteName(data.site_name || "");
          setSiteUrl(data.site_url || "");
          if (data.storage_provider) setStorageProvider(data.storage_provider);
          if (data.site_logo) {
            setLogoPreview(data.site_logo);
          }
        }
      }

      const resInt = await fetch("/api/settings/integrations");
      if (resInt.ok) {
        const jsonInt = await resInt.json();
        setIntegrations(jsonInt.data);
      }
    } catch (err) {
      console.error("Gagal memuat pengaturan", err);
    } finally {
      setLoading(false);
      setLoadingIntegrations(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setIsLogoRemoved(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setIsLogoRemoved(true);
  };

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteName) {
      Swal.fire("Peringatan", "Nama Situs wajib diisi", "warning");
      return;
    }

    try {
      Swal.fire({
        title: "Menyimpan Pengaturan...",
        text: "Mohon tunggu sebentar",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      const formData = new FormData();
      formData.append("site_name", siteName);
      formData.append("site_url", siteUrl);
      formData.append("storage_provider", storageProvider);
      
      if (logoFile) {
        formData.append("site_logo", logoFile);
      } else if (isLogoRemoved) {
        formData.append("remove_logo", "true");
      }

      const res = await fetch("/api/settings", {
        method: "PUT",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menyimpan");

      setIsLogoRemoved(false);
      setLogoFile(null);
      Swal.fire("Berhasil", "Pengaturan umum berhasil disimpan", "success");
    } catch (err: any) {
      Swal.fire("Gagal", err.message, "error");
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      Swal.fire("Peringatan", "Semua kolom sandi wajib diisi", "warning");
      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire("Peringatan", "Konfirmasi sandi tidak cocok", "warning");
      return;
    }

    if (newPassword.length < 6) {
      Swal.fire("Peringatan", "Sandi baru minimal 6 karakter", "warning");
      return;
    }

    try {
      Swal.fire({
        title: "Memperbarui Sandi...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      const res = await fetch("/api/settings/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal memperbarui sandi");

      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      Swal.fire("Berhasil", "Sandi berhasil diperbarui", "success");
    } catch (err: any) {
      Swal.fire("Gagal", err.message, "error");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out pb-10">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary" />
          Pengaturan Sistem
        </h1>
        <p className="text-muted-foreground mt-2 text-lg max-w-2xl">
          Konfigurasi preferensi situs, nama web, logo, dan amankan akun Anda di sini.
        </p>
      </div>

      {loading ? (
        <Card className="h-[400px] flex items-center justify-center border-border/50 shadow-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </Card>
      ) : (
        <Tabs defaultValue="umum" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-3 bg-muted/50 p-1">
            <TabsTrigger value="umum" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
              Umum
            </TabsTrigger>
            <TabsTrigger value="keamanan" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
              Keamanan
            </TabsTrigger>
            <TabsTrigger value="integrasi" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
              Integrasi
            </TabsTrigger>
          </TabsList>

          <TabsContent value="umum" className="mt-0">
            <Card className="border-border/50 shadow-sm overflow-hidden">
              <form onSubmit={handleSaveGeneral}>
                <CardHeader className="bg-muted/10 border-b border-border/50">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    Informasi Situs
                  </CardTitle>
                  <CardDescription>Ubah nama situs, logo, dan URL utama.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  
                  {/* Form Fields */}
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-3">
                      <Label htmlFor="siteName" className="text-sm font-semibold text-foreground/90">Nama Situs / Aplikasi <span className="text-destructive">*</span></Label>
                      <Input 
                        id="siteName" 
                        value={siteName} 
                        onChange={(e) => setSiteName(e.target.value)} 
                        placeholder="Misal: KKM MI Talang"
                        className="bg-muted/30 focus-visible:bg-background transition-colors"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="siteUrl" className="text-sm font-semibold text-foreground/90">URL Website Utama</Label>
                      <Input 
                        id="siteUrl" 
                        type="url"
                        value={siteUrl} 
                        onChange={(e) => setSiteUrl(e.target.value)} 
                        placeholder="https://..."
                        className="bg-muted/30 focus-visible:bg-background transition-colors"
                      />
                    </div>
                  </div>

                  {/* Storage Provider Dropdown */}
                  <div className="space-y-3 pt-4 border-t border-border/50">
                    <Label htmlFor="storageProvider" className="text-sm font-semibold text-foreground/90">Penyimpanan Media Utama</Label>
                    <select 
                      id="storageProvider"
                      value={storageProvider}
                      onChange={(e) => setStorageProvider(e.target.value)}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="cloudinary">Cloudinary (Disarankan - Cepat, Gratis & Optimasi Otomatis)</option>
                      <option value="google_drive">Google Drive (Hanya untuk akun Google Workspace / Edukasi)</option>
                    </select>
                    <p className="text-xs text-muted-foreground mt-1">
                      <strong>Catatan Google Drive:</strong> Akun Gmail personal biasa tidak dapat menggunakan opsi ini karena batasan kuota Google API untuk akun sistem (Service Account). Gunakan Cloudinary untuk opsi yang dijamin 100% gratis dan lancar.
                    </p>
                  </div>

                  {/* Logo Upload Section */}
                  <div className="space-y-4 pt-4 border-t border-border/50">
                    <Label className="text-sm font-semibold text-foreground/90">Logo Situs</Label>
                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                      {/* Preview Box */}
                      <div className="relative group w-32 h-32 rounded-2xl border-2 border-dashed border-border/60 flex items-center justify-center bg-muted/20 overflow-hidden shrink-0">
                        {logoPreview ? (
                          <>
                            <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2 bg-white" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                              <Label htmlFor="logo-upload" className="cursor-pointer">
                                <Button type="button" variant="secondary" size="sm" className="h-8 shadow-md">Ganti</Button>
                              </Label>
                              <Button type="button" variant="destructive" size="sm" onClick={handleRemoveLogo} className="h-8 shadow-md">Hapus</Button>
                            </div>
                          </>
                        ) : (
                          <div className="text-center">
                            <ImageIcon className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                            <span className="text-xs text-muted-foreground font-medium">Belum ada logo</span>
                          </div>
                        )}
                      </div>

                      {/* Upload Instructions */}
                      <div className="flex-1 space-y-3">
                        <Label htmlFor="logo-upload" className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
                          <Upload className="w-4 h-4 mr-2" />
                          Pilih Gambar
                        </Label>
                        <Input 
                          id="logo-upload" 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleLogoChange}
                        />
                        <p className="text-sm text-muted-foreground">
                          Format yang didukung: JPG, PNG, WEBP.<br/>
                          Disarankan memiliki latar belakang transparan (PNG). Gambar akan otomatis dioptimasi ukurannya oleh Cloudinary.
                        </p>
                      </div>
                    </div>
                  </div>

                </CardContent>
                <CardFooter className="bg-muted/10 border-t border-border/50 p-6 flex justify-end">
                  <Button type="submit" className="shadow-md">
                    <Save className="w-4 h-4 mr-2" />
                    Simpan Perubahan
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="keamanan" className="mt-0">
            <Card className="border-border/50 shadow-sm overflow-hidden">
              <form onSubmit={handleSavePassword}>
                <CardHeader className="bg-muted/10 border-b border-border/50">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Shield className="w-5 h-5 text-amber-500" />
                    Ubah Kata Sandi
                  </CardTitle>
                  <CardDescription>Jaga keamanan akun administrator Anda dengan mengganti kata sandi secara berkala.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 max-w-lg space-y-5">
                  
                  <div className="space-y-3">
                    <Label htmlFor="current" className="text-sm font-semibold text-foreground/90">Sandi Saat Ini</Label>
                    <div className="relative">
                      <Input 
                        id="current" 
                        type={showPassword ? "text" : "password"} 
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="bg-muted/30 focus-visible:bg-background pr-10"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="new" className="text-sm font-semibold text-foreground/90">Sandi Baru</Label>
                    <Input 
                      id="new" 
                      type={showPassword ? "text" : "password"} 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-muted/30 focus-visible:bg-background"
                      placeholder="Minimal 6 karakter"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="confirm" className="text-sm font-semibold text-foreground/90">Konfirmasi Sandi Baru</Label>
                    <Input 
                      id="confirm" 
                      type={showPassword ? "text" : "password"} 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-muted/30 focus-visible:bg-background"
                    />
                  </div>

                </CardContent>
                <CardFooter className="bg-muted/10 border-t border-border/50 p-6 flex justify-end">
                  <Button type="submit" variant="default" className="shadow-md bg-amber-600 hover:bg-amber-700 text-white">
                    <Shield className="w-4 h-4 mr-2" />
                    Perbarui Kata Sandi
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="integrasi" className="mt-0">
            <Card className="border-border/50 shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/10 border-b border-border/50">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Plug className="w-5 h-5 text-blue-500" />
                  Status Integrasi
                </CardTitle>
                <CardDescription>
                  Pantau koneksi antara website dengan layanan pihak ketiga. Konfigurasi kredensial hanya dapat diubah melalui file server rahasia (.env) demi keamanan tingkat tinggi.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {loadingIntegrations ? (
                  <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {/* Google Sheets */}
                    <div className="border border-border/50 rounded-xl p-5 bg-card relative overflow-hidden group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-green-50 text-green-600 rounded-lg">
                          <Database className="w-6 h-6" />
                        </div>
                        {integrations?.googleSheets?.status === "connected" ? (
                          <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Terhubung</span>
                        ) : (
                          <span className="flex items-center text-xs font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-full"><XCircle className="w-3.5 h-3.5 mr-1" /> Terputus</span>
                        )}
                      </div>
                      <h3 className="font-bold text-foreground">Google Sheets</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{integrations?.googleSheets?.details || "Memeriksa..."}</p>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-green-500/10 transition-colors"></div>
                    </div>

                    {/* Cloudinary */}
                    <div className="border border-border/50 rounded-xl p-5 bg-card relative overflow-hidden group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                          <Cloud className="w-6 h-6" />
                        </div>
                        {integrations?.cloudinary?.status === "connected" ? (
                          <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Terhubung</span>
                        ) : (
                          <span className="flex items-center text-xs font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-full"><XCircle className="w-3.5 h-3.5 mr-1" /> Terputus</span>
                        )}
                      </div>
                      <h3 className="font-bold text-foreground">Cloudinary (Media)</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{integrations?.cloudinary?.details || "Memeriksa..."}</p>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-500/10 transition-colors"></div>
                    </div>

                    {/* Google Drive */}
                    <div className="border border-border/50 rounded-xl p-5 bg-card relative overflow-hidden group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
                          <HardDrive className="w-6 h-6" />
                        </div>
                        {integrations?.googleDrive?.status === "connected" ? (
                          <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Terhubung</span>
                        ) : integrations?.googleDrive?.status === "pending" ? (
                          <span className="flex items-center text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full"><AlertCircle className="w-3.5 h-3.5 mr-1" /> Menunggu</span>
                        ) : (
                          <span className="flex items-center text-xs font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-full"><XCircle className="w-3.5 h-3.5 mr-1" /> Terputus</span>
                        )}
                      </div>
                      <h3 className="font-bold text-foreground">Google Drive</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{integrations?.googleDrive?.details || "Memeriksa..."}</p>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-amber-500/10 transition-colors"></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
