import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";
import Link from "next/link";
import { ArrowLeft, BookOpen, GraduationCap, Users } from "lucide-react";
import { getOrCreateGoogleSheet } from "@/lib/google-sheets";

async function getSiteName() {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  if (!spreadsheetId) return "KKM & KKG";
  try {
    const sheet = await getOrCreateGoogleSheet(spreadsheetId, "Settings", ['key', 'value']);
    const rows = await sheet.getRows();
    const siteRow = rows.find(r => r.get('key') === 'site_name');
    return siteRow ? siteRow.get('value') || "KKM & KKG" : "KKM & KKG";
  } catch (e) {
    return "KKM & KKG";
  }
}

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  const siteName = await getSiteName();

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-50 font-sans selection:bg-emerald-500 selection:text-white">
      {/* LEFT SIDE: Branding / Visual (Hidden on small mobile, turns into header on tablet) */}
      <div className="relative w-full md:w-5/12 lg:w-1/2 bg-emerald-700 flex flex-col justify-between p-8 md:p-12 lg:p-16 overflow-hidden min-h-[300px] md:min-h-screen">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-[500px] h-[500px] bg-emerald-600 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[400px] h-[400px] bg-emerald-800 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>

        {/* Content Top */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm">Kembali ke Beranda</span>
          </Link>
        </div>

        {/* Content Middle */}
        <div className="relative z-10 mt-12 md:mt-0 flex-grow flex flex-col justify-center">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center mb-8 shadow-2xl">
            <GraduationCap className="w-8 h-8 text-emerald-100" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight mb-6">
            Selamat Datang di Portal <span className="text-emerald-200">Resmi</span>
          </h1>
          <p className="text-lg text-emerald-100/90 max-w-md leading-relaxed font-medium">
            Sistem informasi terpadu {siteName}. Mengelola data, anggota, dan rapor digital dengan lebih mudah dan efisien.
          </p>

          <div className="mt-12 space-y-4 hidden lg:block">
            <div className="flex items-center gap-4 text-emerald-50 bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
              <Users className="w-6 h-6 text-emerald-200 shrink-0" />
              <span className="font-medium">Komunitas Pendidik Profesional</span>
            </div>
            <div className="flex items-center gap-4 text-emerald-50 bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
              <BookOpen className="w-6 h-6 text-emerald-200 shrink-0" />
              <span className="font-medium">Peningkatan Kompetensi Berkelanjutan</span>
            </div>
          </div>
        </div>

        {/* Content Bottom */}
        <div className="relative z-10 mt-8 hidden md:block">
          <p className="text-emerald-200/60 text-sm font-medium">
            &copy; {new Date().getFullYear()} {siteName}. Hak Cipta Dilindungi.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Form Area */}
      <div className="w-full md:w-7/12 lg:w-1/2 flex items-center justify-center p-6 sm:p-8 md:p-12 lg:p-16 relative z-20 -mt-10 md:mt-0">
        <div className="w-full max-w-md bg-white rounded-3xl md:rounded-none md:bg-transparent shadow-2xl md:shadow-none p-8 sm:p-10 md:p-0 border border-slate-100 md:border-none relative z-30">
          
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Login Akun</h2>
            <p className="text-slate-500 mt-3 text-sm sm:text-base">
              Masukkan kredensial yang telah didaftarkan untuk masuk ke dalam *dashboard* {siteName}.
            </p>
          </div>

          <LoginForm />

          <div className="mt-10 text-center md:text-left">
            <p className="text-sm text-slate-500 font-medium">
              Belum mendaftarkan Madrasah Anda?{" "}
              <Link href="/daftar" className="text-emerald-600 hover:text-emerald-700 font-bold underline decoration-2 underline-offset-4 transition-colors">
                Daftar Sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
