import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, LayoutDashboard, Users, LogOut } from "lucide-react";
import LogoutButton from "@/app/dashboard/logout-button";

export default async function MadrasahLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");
  if ((session.user as any).role !== "madrasah") redirect("/dashboard");

  const madrasahName = session.user?.name || "Madrasah";

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar - Kemenag Theme */}
      <aside className="w-64 flex-shrink-0 bg-emerald-950 text-emerald-50 flex flex-col shadow-xl z-20">
        <div className="p-6 border-b border-emerald-900">
          <Link href="/madrasah" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-2.5 rounded-xl shadow-lg">
              <BookOpen className="w-5 h-5 text-emerald-950" />
            </div>
            <div>
              <p className="font-extrabold text-sm leading-tight text-white tracking-wide">Portal Madrasah</p>
              <p className="text-xs text-emerald-200 truncate max-w-[130px] font-medium">{madrasahName}</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 px-2 mb-4">Menu Utama</p>
          <Link href="/madrasah" className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold hover:bg-emerald-800 hover:text-white transition-all group">
            <LayoutDashboard className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            Dashboard
          </Link>
          <Link href="/madrasah/guru" className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold hover:bg-emerald-800 hover:text-white transition-all group">
            <Users className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            Data Guru
          </Link>
        </nav>

        <div className="p-4 border-t border-emerald-900 bg-emerald-950/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 rounded-full bg-emerald-800 border-2 border-amber-500/50 flex items-center justify-center text-xs font-bold text-amber-400 shadow-inner">
              {madrasahName.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{madrasahName}</p>
              <p className="text-[10px] text-emerald-300 font-medium">Administrator Madrasah</p>
            </div>
          </div>
          <div className="px-2">
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
