"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export function MadrasahNavItem({
  href,
  icon: Icon,
  title,
  exact = false,
  badge
}: {
  href: string;
  icon: any;
  title: string;
  exact?: boolean;
  badge?: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname === href || pathname?.startsWith(href + "/");

  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all group ${
        isActive
          ? 'bg-emerald-800 text-white shadow-md'
          : 'hover:bg-emerald-800 hover:text-white'
      }`}
    >
      <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-amber-300 scale-110' : 'text-amber-400'}`} />
      <div className="flex-1 flex items-center justify-between">
        <span>{title}</span>
        {badge}
      </div>
    </Link>
  );
}
