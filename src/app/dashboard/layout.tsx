import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { LayoutDashboard, FileText, Settings, BookOpen, Bell, Tag, School, Users, Calendar, Download, MessageSquare, FileSignature, KeyRound, Moon } from "lucide-react";
import LogoutButton from "./logout-button";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarNavItem } from "@/components/dashboard/SidebarNavItem";

import { getCachedSiteName, getCachedPendingMadrasahCount } from "@/lib/settings";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const userName = session?.user?.name || "Admin";
  const userInitials = userName.substring(0, 2).toUpperCase();

  const siteName = await getCachedSiteName();

  // Fetch pending madrasah count for badge using cache to avoid API limit
  const pendingCount = await getCachedPendingMadrasahCount();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50/50">
        <Sidebar>
          <SidebarHeader className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-lg text-primary-foreground">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg tracking-tight">
                Admin KKG
              </span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarNavItem href="/dashboard" icon={<LayoutDashboard />} title="Dashboard" exact />
                  <SidebarNavItem href="/dashboard/berita" icon={<FileText />} title="Kelola Berita" />
                  <SidebarNavItem href="/dashboard/kategori" icon={<Tag />} title="Kelola Kategori" />
                  <SidebarNavItem href="/dashboard/agenda" icon={<Calendar />} title="Kelola Agenda" />
                  <SidebarNavItem href="/dashboard/unduhan" icon={<Download />} title="Kelola Unduhan" />
                  <SidebarNavItem href="/dashboard/pengurus" icon={<Users />} title="Kelola Pengurus" />
                  <SidebarNavItem href="/dashboard/kontak" icon={<MessageSquare />} title="Pesan Masuk" />
                  <SidebarNavItem href="/dashboard/surat" icon={<FileSignature />} title="Surat Menyurat" />
                  <SidebarNavItem href="/dashboard/kegiatan" icon={<Calendar />} title="Kegiatan & Presensi" />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Madrasah</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarNavItem 
                    href="/dashboard/madrasah" 
                    icon={<School />} 
                    title="Kelola Madrasah" 
                    badge={pendingCount > 0 ? <span className="ml-auto bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">{pendingCount}</span> : null}
                  />
                  <SidebarNavItem href="/dashboard/guru" icon={<Users />} title="Data Guru" />
                  <SidebarNavItem href="/dashboard/users" icon={<KeyRound />} title="Manajemen Akun" />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Sistem</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarNavItem href="/dashboard/tahun-ajaran" icon={<Calendar />} title="Tahun Ajaran" />
                  <SidebarNavItem href="/dashboard/master" icon={<Settings />} title="Master Data" />
                  <SidebarNavItem href="/dashboard/settings" icon={<Settings />} title="Pengaturan" />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t">
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
                  <span className="text-sm font-bold text-slate-800">{userName}</span>
                  <span className="text-xs font-medium text-slate-500">Admin Utama</span>
                </div>
                <Avatar className="h-10 w-10 border-2 border-emerald-100">
                  <AvatarFallback className="bg-emerald-600 text-white font-bold">{userInitials}</AvatarFallback>
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
