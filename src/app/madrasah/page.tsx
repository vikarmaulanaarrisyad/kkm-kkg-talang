import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Users, BookOpen, TrendingUp, Calendar, Clock, MapPin, ArrowRight, GraduationCap, Sparkles, ChevronRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getCachedSiteName, getCachedTahunAjaran } from "@/lib/settings";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function MadrasahDashboard() {
  const session = await getServerSession(authOptions);
  const madrasahId = (session?.user as any)?.madrasahId;
  const madrasahName = session?.user?.name || "Madrasah";
  const tahunAjaran = await getCachedTahunAjaran();

  let totalGuru = 0;
  let pnsCount = 0;
  let nonPnsCount = 0;
  let upcomingAgendas: any[] = [];
  
  let totalSiswa = 0;
  let siswaL = 0;
  let siswaP = 0;

  try {
    if (madrasahId) {
      const guruStats = await prisma.guru.groupBy({
        by: ['status_kepegawaian' as any],
        where: { madrasah_id: madrasahId },
        _count: true
      });
      
      totalGuru = guruStats.reduce((acc: number, curr: any) => acc + Number(curr._count || 0), 0);
      pnsCount = Number(guruStats.find((s: any) => s.status_kepegawaian === "PNS")?._count || 0);
      nonPnsCount = guruStats.filter((s: any) => s.status_kepegawaian !== "PNS" && s.status_kepegawaian).reduce((acc: number, curr: any) => acc + Number(curr._count || 0), 0);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      upcomingAgendas = await prisma.agenda.findMany({
        where: {
          status: { notIn: ["Completed", "Selesai"] }
        },
        orderBy: { date: 'asc' },
        take: 3
      });
      upcomingAgendas = upcomingAgendas.filter((a: any) => new Date(a.date) >= today);
        
      if (tahunAjaran) {
        const rombelRows = await prisma.rombel.findMany({
          where: { madrasah_id: madrasahId, tahun_ajaran: tahunAjaran },
          select: { siswa_laki: true, siswa_perempuan: true }
        });
        siswaL = rombelRows.reduce((acc: number, curr: any) => acc + parseInt(curr.siswa_laki || "0", 10), 0);
        siswaP = rombelRows.reduce((acc: number, curr: any) => acc + parseInt(curr.siswa_perempuan || "0", 10), 0);
        totalSiswa = siswaL + siswaP;
      }
    }
  } catch (e) {
    console.error(e);
  }

  return (
    <div className="flex-1 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-900 p-8 text-white shadow-lg">
        <div className="absolute -right-10 -top-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-10 bottom-0 opacity-10 pointer-events-none">
          <BookOpen className="w-48 h-48 transform translate-y-1/4" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <Badge className="bg-white/20 text-white hover:bg-white/30 border-none mb-2 backdrop-blur-md shadow-sm px-3 py-1 font-semibold uppercase tracking-widest text-[10px]">
              <Sparkles className="w-3 h-3 mr-1.5 inline-block" /> Portal Madrasah
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Selamat Datang, <span className="text-amber-300">{madrasahName}</span>
            </h1>
            <p className="text-emerald-50 max-w-xl font-medium">
              Kelola data guru, pantau rombongan belajar, dan ikuti kegiatan KKG terbaru melalui satu dasbor terpadu yang efisien.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Button className="bg-amber-500 text-amber-950 hover:bg-amber-400 rounded-xl font-bold shadow-xl shadow-black/10 px-6" render={<Link href="/madrasah/guru" />}>
              <Users className="w-4 h-4 mr-2" />
              Kelola Guru
            </Button>
            <Button className="bg-white/10 text-white border-white/20 hover:bg-white/20 rounded-xl font-bold backdrop-blur-md px-6" variant="outline" render={<Link href="/madrasah/rombel" />}>
              <GraduationCap className="w-4 h-4 mr-2" />
              Kelola Rombel
            </Button>
          </div>
        </div>
      </div>
      
      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow duration-200 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Guru</CardTitle>
            <div className="bg-blue-50 p-2.5 rounded-lg">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tighter text-slate-800">{totalGuru}</div>
            <p className="text-xs text-muted-foreground mt-2 font-medium flex items-center">
              Seluruh guru terdaftar
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow duration-200 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Guru PNS</CardTitle>
            <div className="bg-emerald-50 p-2.5 rounded-lg">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tighter text-slate-800">{pnsCount}</div>
            <p className="text-xs text-muted-foreground mt-2 font-medium flex items-center text-emerald-600">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Berstatus ASN/PNS
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Guru Non-PNS</CardTitle>
            <div className="bg-amber-50 p-2.5 rounded-lg">
              <BookOpen className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tighter text-slate-800">{nonPnsCount}</div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              Honorer / GTT / GTY
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow duration-200 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Total Siswa Aktif</CardTitle>
            <div className="bg-purple-50 p-2.5 rounded-lg">
              <GraduationCap className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tighter text-slate-800">{totalSiswa.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground mt-2 font-medium flex items-center gap-1.5">
              <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">T.A. {tahunAjaran || "-"}</span>
              L: {siswaL} / P: {siswaP}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1 lg:col-span-3 border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="border-b border-slate-100/50 bg-slate-50/30 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                Agenda KKG Mendatang
              </CardTitle>
              <CardDescription className="mt-1">
                Jadwal kegiatan Kelompok Kerja Guru yang akan segera dilaksanakan.
              </CardDescription>
            </div>
            <Button variant="outline" className="hidden sm:flex text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200" size="sm" render={<Link href="/madrasah/kegiatan" />}>
              Lihat Semua
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            {upcomingAgendas.length === 0 ? (
              <div className="text-center text-muted-foreground p-8 flex flex-col items-center">
                <div className="bg-slate-100 p-4 rounded-full mb-3">
                  <Calendar className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-sm font-medium text-slate-600">Belum ada agenda dalam waktu dekat.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {upcomingAgendas.map(agenda => (
                  <div key={agenda.id} className="border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-shadow relative overflow-hidden group bg-white">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500 rounded-l-2xl group-hover:bg-amber-400 transition-colors" />
                    <div className="ml-2">
                      <Badge className="bg-emerald-100 hover:bg-emerald-100 text-emerald-800 font-bold mb-3 border-none">
                        {new Date(agenda.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </Badge>
                      <h3 className="text-base font-bold text-slate-800 mb-4 group-hover:text-emerald-700 transition-colors leading-tight line-clamp-2">
                        {agenda.title}
                      </h3>
                      
                      <div className="space-y-2 text-xs font-medium text-slate-500">
                        {agenda.time && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-emerald-500" />
                            <span>{agenda.time}</span>
                          </div>
                        )}
                        {agenda.location && (
                          <div className="flex items-start gap-2">
                            <MapPin className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                            <span className="line-clamp-2">{agenda.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button variant="outline" className="w-full mt-6 sm:hidden text-emerald-700 bg-emerald-50" size="sm" render={<Link href="/madrasah/kegiatan" />}>
              Lihat Semua Agenda
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
