import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import LupaPasswordForm from "./LupaPasswordForm";
import Link from "next/link";
import { ArrowLeft, KeyRound, ShieldCheck, HelpCircle } from "lucide-react";
import { getCachedSiteName, getCachedKontakInfo } from "@/lib/settings";

export default async function LupaPasswordPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  const siteName = await getCachedSiteName();
  const kontak = await getCachedKontakInfo();

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-50 font-sans selection:bg-emerald-500 selection:text-white">
      {/* LEFT SIDE: Branding / Visual (Hidden on small mobile, turns into header on tablet) */}
      <div className="relative w-full md:w-5/12 lg:w-1/2 bg-slate-900 flex flex-col justify-between p-8 md:p-12 lg:p-16 overflow-hidden min-h-[300px] md:min-h-screen">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-[500px] h-[500px] bg-emerald-600 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[400px] h-[400px] bg-blue-800 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>

        {/* Content Top */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/login" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm">Kembali ke Login</span>
          </Link>
        </div>

        {/* Content Middle */}
        <div className="relative z-10 mt-12 md:mt-0 flex-grow flex flex-col justify-center">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center mb-8 shadow-2xl">
            <KeyRound className="w-8 h-8 text-amber-300" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight mb-6">
            Lupa <span className="text-amber-300">Password?</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-md leading-relaxed font-medium">
            Keamanan data {siteName} adalah prioritas kami. Jangan khawatir jika Anda kehilangan akses, Admin siap membantu memulihkannya.
          </p>

          <div className="mt-12 space-y-4 hidden lg:block">
            <div className="flex items-center gap-4 text-slate-200 bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
              <span className="font-medium">Proses Verifikasi Aman & Terpercaya</span>
            </div>
            <div className="flex items-center gap-4 text-slate-200 bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
              <HelpCircle className="w-6 h-6 text-emerald-400 shrink-0" />
              <span className="font-medium">Dukungan Admin Fast Response</span>
            </div>
          </div>
        </div>

        {/* Content Bottom */}
        <div className="relative z-10 mt-8 hidden md:block">
          <p className="text-slate-500 text-sm font-medium">
            &copy; {new Date().getFullYear()} {siteName}. Hak Cipta Dilindungi.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Form Area */}
      <div className="w-full md:w-7/12 lg:w-1/2 flex items-center justify-center p-6 sm:p-8 md:p-12 lg:p-16 relative z-20 -mt-10 md:mt-0">
        <div className="w-full max-w-md bg-white rounded-3xl md:rounded-none md:bg-transparent shadow-2xl md:shadow-none p-8 sm:p-10 md:p-0 border border-slate-100 md:border-none relative z-30">
          
          <div className="mb-10 text-center md:text-left mt-4 md:mt-0">
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Atur Ulang Sandi</h2>
            <p className="text-slate-500 mt-3 text-sm sm:text-base">
              Beritahu Admin bahwa Anda mengalami kendala login agar password dapat direset.
            </p>
          </div>

          <LupaPasswordForm adminPhone={kontak.telepon} />

        </div>
      </div>
    </div>
  );
}
