import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, LogOut, LayoutDashboard, ScanLine } from "lucide-react";
import LogoutButton from "@/app/dashboard/logout-button";

export default async function GuruLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");
  if ((session.user as any).role !== "guru") redirect("/");

  const guruName = session.user?.name || "Guru";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-emerald-700 text-white shadow-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-200" />
            <div>
              <h1 className="font-bold text-sm">Portal Guru</h1>
              <p className="text-[10px] text-emerald-100 opacity-80 uppercase tracking-widest">KKM & KKG MI TALANG</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold">{guruName}</p>
              <p className="text-xs text-emerald-200">Peserta KKG</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-800 border-2 border-emerald-400 flex items-center justify-center text-xs font-bold shadow-inner shrink-0">
              {guruName.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 mb-20">
        {children}
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-40 pb-safe">
        <div className="max-w-md mx-auto px-6 py-2 flex items-center justify-between">
          <Link href="/guru/dashboard" className="flex flex-col items-center p-2 text-slate-500 hover:text-emerald-600 transition-colors">
            <LayoutDashboard className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-bold">Dashboard</span>
          </Link>
          
          <Link href="/guru/scan" className="flex flex-col items-center -mt-6">
            <div className="bg-emerald-600 text-white p-4 rounded-full shadow-lg shadow-emerald-600/30 border-4 border-slate-50 relative group hover:bg-emerald-700 transition-all hover:scale-105 active:scale-95">
              <ScanLine className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-emerald-700 mt-1">Scan Kehadiran</span>
          </Link>
          
          <div className="flex flex-col items-center p-2 text-slate-500 hover:text-red-600 transition-colors cursor-pointer">
            <LogoutButton iconOnly />
          </div>
        </div>
      </nav>
    </div>
  );
}
