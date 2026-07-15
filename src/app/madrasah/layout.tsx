import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, LayoutDashboard, Users, GraduationCap, Mail, Calendar } from "lucide-react";
import LogoutButton from "@/app/dashboard/logout-button";
import MobileSidebar from "@/components/madrasah/MobileSidebar";
import { getCachedSiteName, getCachedUnreadSuratCount } from "@/lib/settings";
import { MadrasahNavItem } from "@/components/madrasah/MadrasahNavItem";

export default async function MadrasahLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");
  if ((session.user as any).role !== "madrasah") redirect("/dashboard");

  const madrasahName = session.user?.name || "Madrasah";
  const madrasahId = (session.user as any).id || session.user?.email || "";
  const siteName = await getCachedSiteName();

  // Fetch unread surat count using cache to avoid API limit
  const unreadCount = await getCachedUnreadSuratCount(madrasahId);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-emerald-950 p-4 text-white shadow-md z-30 sticky top-0">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <span className="font-bold text-lg tracking-tight">{siteName}</span>
        </div>
        <MobileSidebar madrasahName={madrasahName} siteName={siteName} />
      </div>

      {/* Desktop Sidebar - Kemenag Theme */}
      <aside className="hidden md:flex w-64 flex-shrink-0 bg-emerald-950 text-emerald-50 flex-col shadow-xl z-20 sticky top-0 h-screen overflow-y-auto">
        <div className="p-6 border-b border-emerald-900">
          <Link href="/madrasah" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-2.5 rounded-xl shadow-lg">
              <BookOpen className="w-5 h-5 text-emerald-950" />
            </div>
            <div>
              <p className="font-extrabold text-sm leading-tight text-white tracking-wide">{siteName}</p>
              <p className="text-xs text-emerald-200 truncate max-w-[130px] font-medium">{madrasahName}</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 px-2 mb-4">Menu Utama</p>
          <MadrasahNavItem href="/madrasah" icon={<LayoutDashboard />} title="Dashboard" exact />
          <MadrasahNavItem href="/madrasah/guru" icon={<Users />} title="Data Guru" />
          <MadrasahNavItem href="/madrasah/rombel" icon={<GraduationCap />} title="Data Rombel & Siswa" />
          <MadrasahNavItem 
            href="/madrasah/surat" 
            icon={<Mail />} 
            title="Surat Masuk" 
            badge={unreadCount > 0 ? (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            ) : null}
          />
          <MadrasahNavItem href="/madrasah/kegiatan" icon={<Calendar />} title="Kegiatan & Presensi" />
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
      <main className="flex-1 w-full overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
