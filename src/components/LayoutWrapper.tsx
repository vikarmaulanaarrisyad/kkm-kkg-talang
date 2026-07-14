"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import VisitorTracker from "./VisitorTracker";

export default function LayoutWrapper({ children, siteName }: { children: React.ReactNode, siteName?: string }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  return (
    <>
      {!isDashboard && <Navbar siteName={siteName} />}
      {!isDashboard && <VisitorTracker />}
      <main className={isDashboard ? "flex-grow flex flex-col w-full" : "flex-grow flex flex-col"}>
        {children}
      </main>
      {!isDashboard && <Footer siteName={siteName} />}
    </>
  );
}
