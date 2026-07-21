import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Newspaper, Users, Activity, FileText, Download, GraduationCap, Server, Sparkles, ChevronRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { OverviewChart } from "./OverviewChart";

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

  const activityLogs = await getActivityLogs(6);

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
    <div className="flex-1 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-800 p-8 text-white shadow-lg">
        <div className="absolute -right-10 -top-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <Badge className="bg-white/20 text-white hover:bg-white/30 border-none mb-2 backdrop-blur-md shadow-sm px-3 py-1 font-semibold uppercase tracking-widest text-[10px]">
              <Sparkles className="w-3 h-3 mr-1.5 inline-block" /> Portal Administrator
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Selamat Datang di <span className="text-emerald-200">{siteName}</span>
            </h1>
            <p className="text-emerald-50 max-w-xl font-medium">
              Pantau aktivitas portal, kelola berita, dan lihat statistik harian madrasah dengan antarmuka yang bersih dan interaktif.
            </p>
          </div>
          <div className="flex shrink-0">
            <Button className="bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl font-bold shadow-xl shadow-black/10 px-6 py-6" render={<Link href="/dashboard/berita/tambah" />}>
              Tulis Berita Baru
              <ChevronRight className="w-4 h-4 ml-2 opacity-50" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow duration-200 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Berita</CardTitle>
            <div className="bg-blue-50 p-2.5 rounded-lg">
              <Newspaper className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tighter text-slate-800">{totalBerita}</div>
            <p className="text-xs text-muted-foreground mt-2 font-medium flex items-center">
              <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded mr-1.5">{publishedBerita} Publikasi</span>
              <span className="text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{draftBerita} Draft</span>
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow duration-200 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Pengunjung</CardTitle>
            <div className="bg-amber-50 p-2.5 rounded-lg">
              <Users className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tighter text-slate-800">{totalVisitors.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground mt-2 font-medium flex items-center text-emerald-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              Tumbuh secara organik
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow duration-200 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Siswa Aktif</CardTitle>
            <div className="bg-emerald-50 p-2.5 rounded-lg">
              <GraduationCap className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tighter text-slate-800">{totalSiswa.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground mt-2 font-medium bg-slate-100 w-fit px-2 py-0.5 rounded text-slate-600">
              T.A. {tahunAjaran || "-"}
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow duration-200 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Status Sistem</CardTitle>
            <div className="bg-purple-50 p-2.5 rounded-lg">
              <Server className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mt-1">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <div className="text-2xl font-bold text-slate-800 tracking-tight">Online</div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              Layanan operasional normal
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4 border-border/50 shadow-sm flex flex-col overflow-hidden">
          <CardHeader className="border-b border-slate-100/50 bg-slate-50/30">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              Statistik Kunjungan & Interaksi
            </CardTitle>
            <CardDescription>
              Representasi visual interaksi portal web selama 7 hari terakhir.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-6">
            <div className="h-[350px] w-full">
              <OverviewChart />
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 lg:col-span-3 border-border/50 shadow-sm flex flex-col">
          <CardHeader className="border-b border-slate-100/50 bg-slate-50/30">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Log Aktivitas Terbaru
            </CardTitle>
            <CardDescription>
              Rekam jejak aksi administrator pada sistem.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {activityLogs.length === 0 ? (
                <div className="text-center text-muted-foreground p-8 flex flex-col items-center">
                  <div className="bg-slate-100 p-3 rounded-full mb-3">
                    <Activity className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-sm font-medium">Belum ada aktivitas tercatat.</p>
                </div>
              ) : (
                activityLogs.map((item, i) => (
                  <div key={item.id} className="p-4 flex items-start gap-4 hover:bg-slate-50/50 transition-colors">
                    <div className="bg-emerald-50 rounded-full p-2 mt-0.5 shrink-0">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">
                        {item.action}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                    <div className="shrink-0 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-1 rounded">
                      {formatRelativeTime(item.created_at)}
                    </div>
                  </div>
                ))
              )}
            </div>
            {activityLogs.length > 0 && (
              <div className="p-4 border-t border-slate-100 bg-slate-50/30 text-center">
                <Link href="#" className="text-xs font-semibold text-primary hover:underline">
                  Lihat Semua Log Aktivitas
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
