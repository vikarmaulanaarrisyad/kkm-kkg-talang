"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton({ iconOnly }: { iconOnly?: boolean }) {
  if (iconOnly) {
    return (
      <button onClick={() => signOut({ callbackUrl: "/" })} className="flex flex-col items-center">
        <LogOut className="w-5 h-5 mb-1" />
        <span className="text-[10px] font-bold">Keluar</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="flex items-center w-full px-4 py-2.5 text-sm font-bold text-red-100 hover:text-white bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-red-500 rounded-xl transition-all shadow-sm"
    >
      <LogOut className="w-4 h-4 mr-3" />
      Keluar
    </button>
  );
}
