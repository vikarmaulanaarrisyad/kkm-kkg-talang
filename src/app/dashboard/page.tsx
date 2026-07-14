import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Newspaper, Users, Clock, ArrowUpRight, FileText, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 to-primary text-primary-foreground p-8 shadow-md">
        <div className="relative z-10 max-w-3xl">
          <Badge className="bg-white/20 text-white hover:bg-white/30 border-none mb-4 backdrop-blur-sm shadow-sm">
            Versi 1.0.0
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            Selamat Datang di CMS Madrasah
          </h1>
          <p className="text-primary-foreground/80 text-lg">
            Kelola konten berita, pantau statistik pengunjung, dan atur portal informasi KKM & KKG Madrasah Ibtidaiyah Kecamatan Talang dengan mudah.
          </p>
        </div>
        
        {/* Background decorative elements */}
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-32 bottom-0 -mb-12 w-48 h-48 bg-gold-400 opacity-20 rounded-full blur-3xl pointer-events-none"></div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm border-border/50 hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Berita</CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Newspaper className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">12</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <ArrowUpRight className="w-3 h-3 text-emerald-500 mr-1" />
              <span className="text-emerald-500 font-medium">+2</span> sejak bulan lalu
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50 hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pengunjung Aktif</CardTitle>
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">1,450</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <ArrowUpRight className="w-3 h-3 text-emerald-500 mr-1" />
              <span className="text-emerald-500 font-medium">+15%</span> dari bulan lalu
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50 hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Draft Berita</CardTitle>
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <FileText className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">3</div>
            <p className="text-xs text-muted-foreground mt-1">
              Menunggu publikasi
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50 hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sistem</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Activity className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground mt-1">Online</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Semua layanan normal
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-full shadow-sm border-border/50">
            <CardHeader>
              <CardTitle>Aktivitas Terakhir</CardTitle>
              <CardDescription>Log aktivitas admin dalam 7 hari terakhir.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: "Berita baru dipublikasikan", desc: "Admin mengunggah berita 'Kunjungan Kemenag'", time: "2 jam yang lalu" },
                  { title: "Perubahan Pengaturan", desc: "Tema website diperbarui", time: "Kemarin, 14:30" },
                  { title: "Berita dihapus", desc: "Draft berita 'Rapat Tahunan' dibuang", time: "2 hari yang lalu" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start pb-4 border-b border-border/50 last:border-0 last:pb-0">
                    <div className="mt-0.5 p-2 bg-muted rounded-full">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <div className="ml-auto text-xs text-muted-foreground whitespace-nowrap">
                      {item.time}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full shadow-sm border-border/50">
            <CardHeader>
              <CardTitle>Informasi Penting</CardTitle>
              <CardDescription>Pemberitahuan sistem terbaru</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50/50 dark:bg-blue-950/20 border-l-4 border-blue-500 p-4 rounded-r-md">
                <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                  <strong>Catatan Sistem:</strong><br />
                  Koneksi API Google Spreadsheet dan Google Drive aktif. Sistem siap untuk operasi CRUD berita.
                </p>
              </div>
              
              <div className="mt-4 pt-4 border-t border-border/50">
                <h4 className="text-sm font-medium mb-3">Aksi Cepat</h4>
                <div className="space-y-2">
                  <button className="w-full justify-start text-left text-sm px-3 py-2 bg-muted/50 hover:bg-muted rounded-md transition-colors font-medium">
                    + Buat Berita Baru
                  </button>
                  <button className="w-full justify-start text-left text-sm px-3 py-2 bg-muted/50 hover:bg-muted rounded-md transition-colors font-medium">
                    ⚙️ Pengaturan Website
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
