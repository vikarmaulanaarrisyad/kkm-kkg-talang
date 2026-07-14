import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Newspaper, Users, Clock, ArrowUpRight, FileText, Activity, Sparkles, ChevronRight, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

import { getOrCreateGoogleSheet } from "@/lib/google-sheets";

export default async function DashboardPage() {
  let siteName = "CMS Madrasah";
  try {
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (spreadsheetId) {
      const sheet = await getOrCreateGoogleSheet(spreadsheetId, "Settings", ["key", "value"]);
      const rows = await sheet.getRows();
      const nameRow = rows.find((r: any) => r.get("key") === "site_name");
      if (nameRow && nameRow.get("value")) {
        siteName = nameRow.get("value");
      }
    }
  } catch (e) {}

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
      
      {/* Premium Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        
        {/* Welcome Hero - Takes up 2 cols */}
        <div className="md:col-span-2 xl:col-span-2 row-span-2 relative overflow-hidden rounded-[2rem] gradient-kemenag text-white p-8 sm:p-10 shadow-2xl shadow-primary/20 hover-float group">
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <Badge className="bg-white/20 text-white hover:bg-white/30 border-none mb-6 backdrop-blur-md shadow-sm px-4 py-1.5 text-xs font-semibold uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5 mr-2 inline-block" />
                Portal Admin
              </Badge>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
                Selamat Datang di <br/> <span className="text-yellow-200">{siteName}</span>
              </h1>
              <p className="text-white/80 text-lg max-w-md font-medium leading-relaxed">
                Platform terpadu untuk {siteName}. Kelola publikasi, artikel, dan pantau aktivitas dengan antarmuka Enterprise.
              </p>
            </div>
            
            <div className="mt-8 flex items-center gap-4">
              <Link href="/dashboard/berita/tambah" className="inline-flex items-center justify-center rounded-xl bg-white text-primary px-6 py-3 text-sm font-bold shadow-lg shadow-black/10 hover:bg-white/90 transition-all hover:scale-105 active:scale-95">
                Tulis Berita Baru
                <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
          
          {/* Aesthetic 3D Background Elements */}
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none group-hover:bg-white/20 transition-all duration-700"></div>
          <div className="absolute right-10 bottom-10 w-48 h-48 bg-yellow-300/20 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-1000 ease-out"></div>
        </div>
        
        {/* Stat Card 1 */}
        <Card className="glass-panel border-0 hover-float relative overflow-hidden rounded-[2rem] xl:col-span-1">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Newspaper className="w-24 h-24" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Total Berita</CardTitle>
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <Newspaper className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-5xl font-black text-foreground tracking-tighter mt-2">12</div>
            <div className="flex items-center mt-4 bg-emerald-500/10 w-fit px-2.5 py-1 rounded-lg">
              <ArrowUpRight className="w-3 h-3 text-emerald-600 mr-1" />
              <span className="text-xs font-bold text-emerald-600">+2 bulan ini</span>
            </div>
          </CardContent>
        </Card>

        {/* Stat Card 2 */}
        <Card className="glass-panel border-0 hover-float relative overflow-hidden rounded-[2rem] xl:col-span-1">
           <div className="absolute top-0 right-0 p-4 opacity-10">
            <Users className="w-24 h-24" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Pengunjung</CardTitle>
            <div className="p-2.5 bg-yellow-500/10 rounded-xl">
              <Users className="h-5 w-5 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-5xl font-black text-foreground tracking-tighter mt-2">1.4k</div>
            <div className="flex items-center mt-4 bg-yellow-500/10 w-fit px-2.5 py-1 rounded-lg">
              <ArrowUpRight className="w-3 h-3 text-yellow-600 mr-1" />
              <span className="text-xs font-bold text-yellow-600">+15% traffic</span>
            </div>
          </CardContent>
        </Card>

        {/* System Status Card */}
        <Card className="glass-panel border-0 hover-float relative overflow-hidden rounded-[2rem] xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Status Sistem</CardTitle>
            <div className="flex items-center bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-emerald-600">Online</span>
            </div>
          </CardHeader>
          <CardContent className="mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/50 dark:bg-black/20 p-4 rounded-2xl border border-white/20">
                <p className="text-xs text-muted-foreground font-medium mb-1">Koneksi Database</p>
                <p className="text-sm font-bold text-foreground">Google Sheets API <span className="text-emerald-500">✓</span></p>
              </div>
              <div className="bg-white/50 dark:bg-black/20 p-4 rounded-2xl border border-white/20">
                <p className="text-xs text-muted-foreground font-medium mb-1">Image Storage</p>
                <p className="text-sm font-bold text-foreground">Cloudinary CDN <span className="text-emerald-500">✓</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Log List */}
      <div className="mt-8">
        <h3 className="text-xl font-bold tracking-tight mb-6 flex items-center">
          Aktivitas Terakhir
          <Badge variant="outline" className="ml-3 bg-white/50 border-white/40">Log Sistem</Badge>
        </h3>
        <div className="space-y-4">
          {[
            { title: "Berita baru dipublikasikan", desc: "Admin mengunggah berita 'Kunjungan Kemenag'", time: "2 jam yang lalu", icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" },
            { title: "Perubahan Pengaturan", desc: "Tema UI premium berhasil diaplikasikan", time: "Kemarin, 14:30", icon: Settings, color: "text-purple-500", bg: "bg-purple-500/10" },
            { title: "Sistem Backup", desc: "Backup database sukses dilakukan", time: "2 hari yang lalu", icon: Activity, color: "text-emerald-500", bg: "bg-emerald-500/10" }
          ].map((item, i) => (
            <div key={i} className="glass-panel p-5 rounded-2xl flex items-center gap-5 hover-float cursor-default">
              <div className={`p-3 rounded-xl ${item.bg}`}>
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{item.title}</p>
                <p className="text-xs font-medium text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
              <div className="ml-auto text-xs font-bold text-muted-foreground/50 whitespace-nowrap bg-muted/30 px-3 py-1.5 rounded-lg">
                {item.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
