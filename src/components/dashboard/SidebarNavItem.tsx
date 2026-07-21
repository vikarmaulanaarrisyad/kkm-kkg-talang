"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import React from "react";

export function SidebarNavItem({ 
  href, 
  icon, 
  title, 
  exact = false, 
  badge 
}: { 
  href: string; 
  icon: React.ReactNode; 
  title: string; 
  exact?: boolean;
  badge?: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname === href || pathname?.startsWith(href + "/");

  return (
    <SidebarMenuItem>
      <SidebarMenuButton 
        tooltip={title} 
        isActive={isActive}
        className={`relative flex items-center px-4 py-3 text-sm transition-all duration-300 w-full overflow-hidden ${
          isActive 
            ? 'bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-50 hover:text-emerald-700' 
            : 'font-medium hover:bg-slate-100 hover:text-slate-900 text-slate-500'
        }`}
        render={
          <Link href={href} className="flex items-center w-full">
            {isActive && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-600 rounded-r-full" />
            )}
            <div className={`mr-3 flex items-center justify-center [&>svg]:w-4 [&>svg]:h-4 [&>svg]:shrink-0 transition-transform ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
              {icon}
            </div>
            <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">{title}</span>
            {badge && (
              <div className="ml-2">
                {badge}
              </div>
            )}
          </Link>
        }
      />
    </SidebarMenuItem>
  );
}
