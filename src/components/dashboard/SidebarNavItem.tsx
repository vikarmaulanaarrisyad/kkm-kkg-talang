"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import React from "react";

export function SidebarNavItem({ 
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
    <SidebarMenuItem>
      <SidebarMenuButton 
        tooltip={title} 
        isActive={isActive}
        render={
          <Link 
            href={href} 
            className={`flex items-center px-4 py-3 rounded-xl text-sm transition-all duration-300 ${
              isActive 
                ? 'bg-emerald-50 text-emerald-700 font-bold shadow-sm' 
                : 'font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-sm'
            }`} 
          />
        }
      >
        <Icon className={`w-4 h-4 mr-3 ${isActive ? 'text-emerald-600' : 'text-sidebar-primary'}`} />
        <span className="flex-1">{title}</span>
        {badge}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
