import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { LayoutDashboard, FileText, Settings, BookOpen, Bell, Tag, School, Users, Calendar } from "lucide-react";
import LogoutButton from "./logout-button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

import { getCachedSiteName } from "@/lib/settings";
import { getOrCreateGoogleSheet } from "@/lib/google-sheets";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const userName = session?.user?.name || "Admin";
  const userInitials = userName.substring(0, 2).toUpperCase();

  const siteName = await getCachedSiteName();

  // Fetch pending madrasah count for badge
  let pendingCount = 0;
  try {
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (spreadsheetId) {
      const sheet = await getOrCreateGoogleSheet(spreadsheetId, "Madrasah", [
        "id", "nama", "nsm", "npsn", "alamat", "kecamatan", "username", "password_hash", "status", "created_at"
      ]);
      const rows = await sheet.getRows();
      pendingCount = rows.filter((r: any) => r.get("status") === "pending").length;
    }
  } catch {}

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-mesh">
        <Sidebar className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-[4px_0_24px_rgba(0,0,0,0.1)]">
          <SidebarHeader className="p-6 flex items-center justify-center border-b border-sidebar-border">
            <Link href="/" className="flex items-center gap-3 group hover-float">
              <div className="bg-sidebar-primary p-2 rounded-xl shadow-lg shadow-black/20">
                <BookOpen className="w-5 h-5 text-sidebar-primary-foreground" />
              </div>
              <span className="font-bold text-lg tracking-tight text-sidebar-foreground line-clamp-1">
                {siteName}
              </span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="px-3 py-6">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-bold uppercase tracking-widest text-sidebar-foreground/60 mb-3 px-4">Utama</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Dashboard" render={<Link href="/dashboard" className="flex items-center px-4 py-3 rounded-xl text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-sm transition-all duration-300" />}>
                      <LayoutDashboard className="w-4 h-4 mr-3 text-sidebar-primary" />
                      <span>Dashboard</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Kelola Berita" render={<Link href="/dashboard/berita" className="flex items-center px-4 py-3 rounded-xl text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-sm transition-all duration-300" />}>
                      <FileText className="w-4 h-4 mr-3 text-sidebar-primary" />
                      <span>Kelola Berita</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Kelola Kategori" render={<Link href="/dashboard/kategori" className="flex items-center px-4 py-3 rounded-xl text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-sm transition-all duration-300" />}>
                      <Tag className="w-4 h-4 mr-3 text-sidebar-primary" />
                      <span>Kelola Kategori</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Kelola Agenda" render={<Link href="/dashboard/agenda" className="flex items-center px-4 py-3 rounded-xl text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-sm transition-all duration-300" />}>
                      <Calendar className="w-4 h-4 mr-3 text-sidebar-primary" />
                      <span>Kelola Agenda</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-6">
              <SidebarGroupLabel className="text-xs font-bold uppercase tracking-widest text-sidebar-foreground/60 mb-3 px-4">Madrasah</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Kelola Madrasah" render={<Link href="/dashboard/madrasah" className="flex items-center px-4 py-3 rounded-xl text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-sm transition-all duration-300" />}>
                      <School className="w-4 h-4 mr-3 text-sidebar-primary" />
                      <span className="flex-1">Kelola Madrasah</span>
                      {pendingCount > 0 && (
                        <span className="ml-auto bg-amber-500 text-white text-xs font-black w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">{pendingCount}</span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Data Guru" render={<Link href="/dashboard/guru" className="flex items-center px-4 py-3 rounded-xl text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-sm transition-all duration-300" />}>
                      <Users className="w-4 h-4 mr-3 text-sidebar-primary" />
                      <span>Data Guru</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-6">
              <SidebarGroupLabel className="text-xs font-bold uppercase tracking-widest text-sidebar-foreground/60 mb-3 px-4">Sistem</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Tahun Ajaran" render={<Link href="/dashboard/tahun-ajaran" className="flex items-center px-4 py-3 rounded-xl text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-sm transition-all duration-300" />}>
                      <Calendar className="w-4 h-4 mr-3 text-sidebar-primary" />
                      <span>Tahun Ajaran</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Master Data" render={<Link href="/dashboard/master" className="flex items-center px-4 py-3 rounded-xl text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-sm transition-all duration-300" />}>
                      <Settings className="w-4 h-4 mr-3 text-sidebar-primary" />
                      <span>Master Data</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Pengaturan" render={<Link href="/dashboard/settings" className="flex items-center px-4 py-3 rounded-xl text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-sm transition-all duration-300" />}>
                      <Settings className="w-4 h-4 mr-3 text-sidebar-primary" />
                      <span>Pengaturan</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-sidebar-border bg-sidebar-accent/20">
            <div className="flex items-center gap-3 mb-4 px-2">
              <Avatar className="h-10 w-10 border-2 border-sidebar-primary/40 shadow-sm">
                <AvatarImage src="" alt={userName} />
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground font-bold">{userInitials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-sidebar-foreground leading-none">{userName}</span>
                <span className="text-xs font-medium text-sidebar-primary mt-1">Administrator</span>
              </div>
            </div>
            <LogoutButton />
          </SidebarFooter>
        </Sidebar>
        
        <main className="flex-1 flex flex-col w-full min-w-0 relative">
          <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 mt-4 shrink-0">
            <header className="sticky top-4 z-10 flex h-16 w-full items-center gap-4 rounded-2xl glass-panel px-4 sm:px-6 transition-all">
              <SidebarTrigger className="-ml-2 text-primary hover:bg-primary/10 rounded-xl" />
              <Separator orientation="vertical" className="h-6 bg-border/50" />
              <Breadcrumb className="hidden sm:flex">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/dashboard" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">Admin</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-sm font-bold gradient-kemenag-text">Dashboard</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              
              <div className="ml-auto flex items-center gap-4">
                <button className="relative p-2.5 text-muted-foreground hover:text-primary transition-all rounded-xl hover:bg-primary/10">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm animate-pulse"></span>
                </button>
              </div>
            </header>
          </div>
          <div className="flex-1 overflow-auto">
            <div className="p-4 sm:p-8 pt-8 max-w-[1400px] mx-auto w-full h-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
