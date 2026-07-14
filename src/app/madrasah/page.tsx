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
      const myGuru = rows.filter(r => r.get("madrasah_id") === madrasahId);
      totalGuru = myGuru.length;
      pnsCount = myGuru.filter(r => r.get("status_kepegawaian") === "PNS").length;
      nonPnsCount = myGuru.filter(r => r.get("status_kepegawaian") !== "PNS" && r.get("status_kepegawaian")).length;
    }
  } catch (e) {}

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Selamat Datang!</h1>
        <p className="text-muted-foreground mt-1">Portal Manajemen Guru — <strong>{madrasahName}</strong></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Guru</p>
            <div className="p-2 bg-primary/10 rounded-xl"><Users className="w-5 h-5 text-primary" /></div>
          </div>
          <p className="text-5xl font-black text-foreground">{totalGuru}</p>
          <p className="text-xs text-muted-foreground mt-2">Guru terdaftar di {madrasahName}</p>
        </div>

        <div className="bg-card border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">PNS</p>
            <div className="p-2 bg-emerald-500/10 rounded-xl"><TrendingUp className="w-5 h-5 text-emerald-600" /></div>
          </div>
          <p className="text-5xl font-black text-foreground">{pnsCount}</p>
          <p className="text-xs text-muted-foreground mt-2">Guru berstatus PNS</p>
        </div>

        <div className="bg-card border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Non-PNS / GTT</p>
            <div className="p-2 bg-blue-500/10 rounded-xl"><BookOpen className="w-5 h-5 text-blue-600" /></div>
          </div>
          <p className="text-5xl font-black text-foreground">{nonPnsCount}</p>
          <p className="text-xs text-muted-foreground mt-2">Guru Non-PNS / GTT</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-2xl p-8 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold mb-2">Mulai Kelola Data Guru</h2>
          <p className="text-primary-foreground/80 text-sm">Tambahkan data guru lengkap dengan NUPTK, PegID, dan informasi lainnya.</p>
        </div>
        <Link href="/madrasah/guru" className="flex-shrink-0 bg-white text-primary px-6 py-3 rounded-xl font-bold hover:bg-white/90 transition-all">
          Kelola Guru →
        </Link>
      </div>
    </div>
  );
}
