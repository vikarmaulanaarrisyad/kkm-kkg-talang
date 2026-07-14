import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { LayoutDashboard, FileText, Settings } from "lucide-react";
import LogoutButton from "./LogoutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-madrasah-900 text-white flex flex-col">
        <div className="p-4 border-b border-madrasah-800">
          <h2 className="text-xl font-bold text-gold-400">CMS Admin</h2>
          <p className="text-sm text-madrasah-200 mt-1">Halo, {session?.user?.name}</p>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            <li>
              <Link href="/dashboard" className="flex items-center px-4 py-3 text-madrasah-50 hover:bg-madrasah-800 transition-colors">
                <LayoutDashboard className="w-5 h-5 mr-3" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/dashboard/berita" className="flex items-center px-4 py-3 text-madrasah-50 hover:bg-madrasah-800 transition-colors">
                <FileText className="w-5 h-5 mr-3" />
                Kelola Berita
              </Link>
            </li>
            <li>
              <Link href="/dashboard/settings" className="flex items-center px-4 py-3 text-madrasah-50 hover:bg-madrasah-800 transition-colors">
                <Settings className="w-5 h-5 mr-3" />
                Pengaturan
              </Link>
            </li>
          </ul>
        </nav>
        <div className="p-4 border-t border-madrasah-800">
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
