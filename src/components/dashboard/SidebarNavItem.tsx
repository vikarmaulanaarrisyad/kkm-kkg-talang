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
        render={
          <Link href={href}>
            {icon}
            <span>{title}</span>
            {badge && (
              <div className="ml-auto flex items-center">
                {badge}
              </div>
            )}
          </Link>
        }
      />
    </SidebarMenuItem>
  );
}
