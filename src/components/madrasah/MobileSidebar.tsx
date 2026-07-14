"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, BookOpen, LayoutDashboard, Users, GraduationCap } from "lucide-react";
import Link from "next/link";
import LogoutButton from "@/app/dashboard/logout-button";

export default function MadrasahMobileSidebar({ madrasahName, siteName }: { madrasahName: string; siteName: string }) {
  return (
    <Sheet>
      <SheetTrigger className="p-2 -mr-2 text-white hover:bg-emerald-900 rounded-md">
        <Menu className="w-6 h-6" />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 bg-emerald-950 text-emerald-50 border-emerald-900 p-0 flex flex-col">
        <div className="p-6 border-b border-emerald-900">
          <Link href="/madrasah" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-2.5 rounded-xl shadow-lg">
              <BookOpen className="w-5 h-5 text-emerald-950" />
            </div>
            <div>
              <p className="font-extrabold text-sm leading-tight text-white tracking-wide">{siteName}</p>
              <p className="text-xs text-emerald-200 truncate max-w-[150px] font-medium">{madrasahName}</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 px-2 mb-4">Menu Utama</p>
          <Link href="/madrasah" className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold hover:bg-emerald-800 hover:text-white transition-all">
            <LayoutDashboard className="w-4 h-4 text-amber-400" />
            Dashboard
          </Link>
          <Link href="/madrasah/guru" className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold hover:bg-emerald-800 hover:text-white transition-all">
            <Users className="w-4 h-4 text-amber-400" />
            Data Guru
          </Link>
          <Link href="/madrasah/rombel" className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold hover:bg-emerald-800 hover:text-white transition-all">
            <GraduationCap className="w-4 h-4 text-amber-400" />
            Data Rombel & Siswa
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
      </SheetContent>
    </Sheet>
  );
}
