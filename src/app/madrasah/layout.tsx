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
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-card border-r border-border flex flex-col shadow-sm">
        <div className="p-5 border-b border-border">
          <Link href="/madrasah" className="flex items-center gap-3 group">
            <div className="bg-primary p-2 rounded-xl shadow">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-bold text-sm leading-tight text-foreground">Portal Madrasah</p>
              <p className="text-xs text-muted-foreground truncate max-w-[120px]">{madrasahName}</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 px-3 mb-3">Menu</p>
          <Link href="/madrasah" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all">
            <LayoutDashboard className="w-4 h-4 text-primary" />
            Dashboard
          </Link>
          <Link href="/madrasah/guru" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all">
            <Users className="w-4 h-4 text-primary" />
            Data Guru
          </Link>
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
              {madrasahName.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">{madrasahName}</p>
              <p className="text-xs text-muted-foreground">Madrasah</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
