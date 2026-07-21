import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LayoutDashboard, BookOpen, Users, GraduationCap, Mail, Calendar, KeyRound, Moon } from "lucide-react";
import LogoutButton from "@/app/dashboard/logout-button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarNavItem } from "@/components/dashboard/SidebarNavItem";

import { getCachedSiteName, getCachedUnreadSuratCount } from "@/lib/settings";

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
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50/50">
        <Sidebar className="border-r border-slate-200 bg-white text-slate-800 shadow-sm">
          <SidebarHeader className="p-6 flex items-center gap-3 border-b border-slate-100">
            <div className="bg-emerald-600 p-2 rounded-xl text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-emerald-800 line-clamp-1">
              Admin Madrasah
            </span>
          </SidebarHeader>
          <SidebarContent className="px-3 py-6">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 px-4">Menu Utama</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarNavItem href="/madrasah" icon={<LayoutDashboard />} title="Dashboard" exact />
                  <SidebarNavItem href="/madrasah/guru" icon={<Users />} title="Data Guru" />
                  <SidebarNavItem href="/madrasah/users" icon={<KeyRound />} title="Manajemen Akun" />
                  <SidebarNavItem href="/madrasah/rombel" icon={<GraduationCap />} title="Data Rombel & Siswa" />
                  <SidebarNavItem 
                    href="/madrasah/surat" 
                    icon={<Mail />} 
                    title="Surat Masuk" 
                    badge={unreadCount > 0 ? (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    ) : null}
                  />
                  <SidebarNavItem href="/madrasah/kegiatan" icon={<Calendar />} title="Kegiatan & Presensi" />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-slate-100 bg-slate-50/50">
            <LogoutButton />
          </SidebarFooter>
        </Sidebar>
        
        <main className="flex-1 flex flex-col w-full min-w-0 relative">
          <header className="sticky top-0 z-20 flex h-20 w-full items-center justify-between bg-white border-b border-slate-200 px-4 sm:px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-slate-500 hover:bg-slate-100 rounded-xl" />
              <div className="hidden sm:flex flex-col ml-2">
                <span className="text-sm font-bold text-emerald-600 uppercase tracking-wider">ADMINISTRATOR PANEL</span>
                <span className="text-xs font-medium text-slate-500">KKM-KKG-TALANG</span>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <button className="text-slate-400 hover:text-slate-600 transition-colors">
                <Moon className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-sm font-bold text-slate-800">{madrasahName}</span>
                  <span className="text-xs font-medium text-slate-500">Admin Sekolah</span>
                </div>
                <Avatar className="h-10 w-10 border-2 border-emerald-100">
                  <AvatarFallback className="bg-emerald-600 text-white font-bold">{madrasahName.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>
          
          <div className="flex-1 overflow-auto bg-slate-50">
            <div className="p-4 sm:p-8 max-w-[1400px] mx-auto w-full h-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
