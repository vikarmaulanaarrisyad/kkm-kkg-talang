import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Users, BookOpen, TrendingUp } from "lucide-react";
import { getOrCreateGoogleSheet } from "@/lib/google-sheets";
import Link from "next/link";

export default async function MadrasahDashboard() {
  const session = await getServerSession(authOptions);
  const madrasahId = (session?.user as any)?.madrasahId;
  const madrasahName = session?.user?.name || "Madrasah";

  let totalGuru = 0;
  let pnsCount = 0;
  let nonPnsCount = 0;

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
    }
  } catch (e) {}

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
      </div>
    </div>
  );
}
