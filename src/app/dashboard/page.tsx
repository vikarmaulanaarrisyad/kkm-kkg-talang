import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Newspaper, Users, Activity, FileText, Download, GraduationCap, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { getCachedSiteName, getCachedTahunAjaran, getAllSettings } from "@/lib/settings";
import { getActivityLogs } from "@/lib/activity-log";
import prisma from "@/lib/prisma";

export default async function DashboardPage() {
  const siteName = await getCachedSiteName();
  const tahunAjaran = await getCachedTahunAjaran();

  let totalBerita = 0;
  let publishedBerita = 0;
  let draftBerita = 0;
  let thisMonthBerita = 0;
  let totalVisitors = 0;
  let totalSiswa = 0;

  try {
    const beritaStats = await prisma.berita.groupBy({
      by: ['status'],
      _count: true
    });
    
    totalBerita = beritaStats.reduce((acc: number, curr: any) => acc + curr._count, 0);
    publishedBerita = beritaStats.find((s: any) => s.status === 'Published')?._count || 0;
    draftBerita = beritaStats.find((s: any) => s.status === 'Draft')?._count || 0;

    const now = new Date();
    thisMonthBerita = await prisma.berita.count({
      where: {
        created_at: {
          gte: new Date(now.getFullYear(), now.getMonth(), 1)
        }
      }
    });

    const allSettings = await getAllSettings();
    totalVisitors = parseInt(allSettings.visitor_count || "0", 10);
    
    if (tahunAjaran) {
      const rombelRows = await prisma.rombel.findMany({
        where: { tahun_ajaran: tahunAjaran },
        select: { siswa_laki: true, siswa_perempuan: true }
      });
      totalSiswa = rombelRows.reduce((acc: number, curr: any) => acc + parseInt(curr.siswa_laki || "0", 10) + parseInt(curr.siswa_perempuan || "0", 10), 0);
    }
  } catch (e) {
    console.error("Failed to fetch dashboard stats:", e);
  }

  const activityLogs = await getActivityLogs(7);

  function formatRelativeTime(isoString: string): string {
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return "Baru saja";
    if (mins < 60) return `${mins} menit lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    if (days === 1) return "Kemarin";
    return `${days} hari lalu`;
  }

  return (
    <div className="flex-1 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/berita/tambah">
              Tulis Berita
            </Link>
          </Button>
          <Button className="bg-primary text-primary-foreground gap-2">
            <Download className="w-4 h-4" />
            <span>Download Laporan</span>
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Berita
            </CardTitle>
            <Newspaper className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBerita}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-emerald-500 font-medium">{publishedBerita} Publikasi</span> &middot; {draftBerita} Draft
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pengunjung Web
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVisitors.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total sesi unik sejak web dirilis
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Siswa Aktif</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSiswa.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tahun Ajaran {tahunAjaran || "-"}
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Status Sistem
            </CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mt-1">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <div className="text-2xl font-bold">Online</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Semua layanan berjalan normal
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4 shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle>Ringkasan Portal</CardTitle>
            <CardDescription>
              Informasi singkat {siteName}.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center items-center text-center p-6 sm:p-10">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <FileText className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Platform Terpadu KKM</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Kelola data madrasah anggota, guru, siswa, serta bagikan berita dan informasi secara transparan melalui portal publik.
            </p>
            {thisMonthBerita > 0 ? (
              <div className="mt-6 inline-flex items-center bg-muted px-4 py-2 rounded-lg text-sm font-medium">
                <Activity className="w-4 h-4 mr-2 text-primary" />
                Ada {thisMonthBerita} berita baru bulan ini
              </div>
            ) : (
              <div className="mt-6 inline-flex items-center bg-muted px-4 py-2 rounded-lg text-sm font-medium">
                <FileText className="w-4 h-4 mr-2 text-muted-foreground" />
                Belum ada berita baru bulan ini
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-1 lg:col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle>Aktivitas Terakhir</CardTitle>
            <CardDescription>
              Log sistem dan aktivitas terbaru admin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {activityLogs.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p className="text-sm">Belum ada aktivitas tercatat.</p>
                </div>
              ) : (
                activityLogs.map((item, i) => (
                  <div key={item.id} className="flex items-center group">
                    <div className="w-2 h-2 rounded-full bg-primary/40 mr-4 group-hover:bg-primary transition-colors mt-0.5 self-start"></div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {item.action}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {item.description}
                      </p>
                    </div>
                    <div className="ml-auto text-xs text-muted-foreground self-start mt-0.5">
                      {formatRelativeTime(item.created_at)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
