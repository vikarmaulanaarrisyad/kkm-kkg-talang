"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-madrasah-800 rounded-md transition-colors"
    >
      <LogOut className="w-5 h-5 mr-3" />
      Keluar
    </button>
  );
}
