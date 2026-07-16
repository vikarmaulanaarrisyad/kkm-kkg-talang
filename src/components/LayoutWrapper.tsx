"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import VisitorTracker from "./VisitorTracker";

export default function LayoutWrapper({ children, siteName }: { children: React.ReactNode, siteName?: string }) {
  const pathname = usePathname();
  const isPublicRoute = !pathname?.startsWith("/dashboard") && 
                        !pathname?.startsWith("/madrasah") && 
                        !pathname?.startsWith("/guru") && 
                        !pathname?.startsWith("/login") && 
                        !pathname?.startsWith("/daftar") &&
                        !pathname?.startsWith("/lupa-password");

  return (
    <>
      {isPublicRoute && <Navbar siteName={siteName} />}
      {isPublicRoute && <VisitorTracker />}
      <main className={!isPublicRoute ? "flex-grow flex flex-col w-full" : "flex-grow flex flex-col"}>
        {children}
      </main>
      {isPublicRoute && <Footer siteName={siteName} />}
    </>
  );
}
