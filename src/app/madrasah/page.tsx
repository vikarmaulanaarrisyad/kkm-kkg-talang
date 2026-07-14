import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Users, BookOpen, TrendingUp, Calendar, Clock, MapPin, ArrowRight, GraduationCap } from "lucide-react";
import { getOrCreateGoogleSheet } from "@/lib/google-sheets";
import Link from "next/link";

import { getCachedSiteName, getCachedTahunAjaran } from "@/lib/settings";

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
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (spreadsheetId && madrasahId) {
      const sheet = await getOrCreateGoogleSheet(spreadsheetId, "Guru", [
        "id", "madrasah_id", "nama", "nuptk", "peg_id", "nip", "tempat_lahir", "tanggal_lahir",
        "jenis_kelamin", "jabatan", "status_kepegawaian", "pendidikan_terakhir", "bidang_studi", "no_hp", "email", "created_at"
      ]);
      const rows = await sheet.getRows();
      const myGuru = rows.filter((r: any) => r.get("madrasah_id") === madrasahId);
      totalGuru = myGuru.length;
      pnsCount = myGuru.filter((r: any) => r.get("status_kepegawaian") === "PNS").length;
      nonPnsCount = myGuru.filter((r: any) => r.get("status_kepegawaian") !== "PNS" && r.get("status_kepegawaian")).length;
      
      const agendaSheet = await getOrCreateGoogleSheet(spreadsheetId, "Agenda", ["id", "title", "date", "time", "location", "status"]);
      const agendaRows = await agendaSheet.getRows();
      const allAgendas = agendaRows.map((r: any) => ({
        id: r.get("id"), title: r.get("title"), date: r.get("date"), time: r.get("time"), location: r.get("location"), status: r.get("status")
      }));
      upcomingAgendas = allAgendas
        .filter(a => a.status !== "Completed" && new Date(a.date) >= new Date(new Date().setHours(0,0,0,0)))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3);
        
      if (tahunAjaran) {
        const rombelSheet = await getOrCreateGoogleSheet(spreadsheetId, "Rombel", ["id", "madrasah_id", "tahun_ajaran", "nama_rombel", "siswa_laki", "siswa_perempuan", "wali_kelas_id"]);
        const rombelRows = await rombelSheet.getRows();
        const myRombel = rombelRows.filter((r: any) => r.get("madrasah_id") === madrasahId && r.get("tahun_ajaran") === tahunAjaran);
        siswaL = myRombel.reduce((acc, curr) => acc + parseInt(curr.get("siswa_laki") || "0", 10), 0);
        siswaP = myRombel.reduce((acc, curr) => acc + parseInt(curr.get("siswa_perempuan") || "0", 10), 0);
        totalSiswa = siswaL + siswaP;
      }
    }
  } catch (e) {
    console.error(e);
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-emerald-800 bg-gradient-to-r from-emerald-800 to-emerald-600 rounded-3xl p-8 sm:p-10 text-white shadow-xl border border-emerald-700/50">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
          <BookOpen className="w-64 h-64" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2 text-amber-400">
            Selamat Datang!
          </h1>
          <p className="text-emerald-50 text-lg max-w-2xl font-medium">
            Portal Manajemen Guru — <strong className="text-white font-black drop-shadow-md">{madrasahName}</strong>
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link href="/madrasah/guru" className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-bold text-emerald-950 shadow-md hover:bg-amber-400 hover:shadow-lg transition-all group">
              <Users className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              Kelola Data Guru
            </Link>
            <Link href="/madrasah/rombel" className="inline-flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all group">
              <GraduationCap className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              Kelola Data Siswa
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Guru Card */}
        <div className="bg-white border border-madrasah-100 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-madrasah-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110 duration-500" />
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-extrabold text-madrasah-700 uppercase tracking-widest">Total Guru</p>
            <div className="p-3 bg-madrasah-100 rounded-2xl group-hover:bg-madrasah-600 transition-colors duration-500">
              <Users className="w-6 h-6 text-madrasah-600 group-hover:text-white transition-colors duration-500" />
            </div>
          </div>
          <p className="text-5xl font-black text-gray-900 tracking-tighter">{totalGuru}</p>
          <p className="text-sm text-gray-500 mt-2 font-medium">Keseluruhan guru terdaftar</p>
        </div>

        {/* PNS Card */}
        <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110 duration-500" />
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-extrabold text-emerald-700 uppercase tracking-widest">Guru PNS</p>
            <div className="p-3 bg-emerald-100 rounded-2xl group-hover:bg-emerald-600 transition-colors duration-500">
              <TrendingUp className="w-6 h-6 text-emerald-600 group-hover:text-white transition-colors duration-500" />
            </div>
          </div>
          <p className="text-5xl font-black text-gray-900 tracking-tighter">{pnsCount}</p>
          <p className="text-sm text-gray-500 mt-2 font-medium">Berstatus Pegawai Negeri Sipil</p>
        </div>

        {/* Non-PNS Card */}
        <div className="bg-white border border-gold-100 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gold-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110 duration-500" />
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-extrabold text-gold-700 uppercase tracking-widest">Non-PNS / GTT</p>
            <div className="p-3 bg-gold-100 rounded-2xl group-hover:bg-gold-500 transition-colors duration-500">
              <BookOpen className="w-6 h-6 text-gold-600 group-hover:text-white transition-colors duration-500" />
            </div>
          </div>
          <p className="text-5xl font-black text-gray-900 tracking-tighter">{nonPnsCount}</p>
          <p className="text-sm text-gray-500 mt-2 font-medium">Honorer atau Guru Tetap Yayasan</p>
        </div>
        
        {/* Siswa Card */}
        {tahunAjaran && (
          <div className="bg-white border border-blue-100 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all group relative overflow-hidden md:col-span-3 lg:col-span-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110 duration-500" />
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-extrabold text-blue-700 uppercase tracking-widest">Siswa {tahunAjaran}</p>
              <div className="p-3 bg-blue-100 rounded-2xl group-hover:bg-blue-600 transition-colors duration-500">
                <GraduationCap className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors duration-500" />
              </div>
            </div>
            <p className="text-5xl font-black text-gray-900 tracking-tighter">{totalSiswa}</p>
            <p className="text-sm text-gray-500 mt-2 font-medium">L: {siswaL} | P: {siswaP}</p>
          </div>
        )}
      </div>

      {/* Agenda Rundown Widget */}
      {upcomingAgendas.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-emerald-600" />
              Agenda Mendatang
            </h2>
            <Link href="/agenda" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group">
              Lihat Semua <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingAgendas.map(agenda => (
              <div key={agenda.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col h-full group">
                <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500 rounded-l-3xl" />
                <span className="inline-block w-max bg-emerald-100 text-emerald-800 font-bold text-xs px-3 py-1 rounded-full mb-3 ml-2">
                  {new Date(agenda.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <h3 className="text-lg font-bold text-gray-900 ml-2 mb-4 group-hover:text-emerald-700 transition-colors leading-tight">{agenda.title}</h3>
                
                <div className="mt-auto ml-2 space-y-2 text-sm text-gray-600">
                  {agenda.time && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-500" />
                      <span>{agenda.time}</span>
                    </div>
                  )}
                  {agenda.location && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-emerald-500 mt-0.5" />
                      <span className="line-clamp-2">{agenda.location}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
