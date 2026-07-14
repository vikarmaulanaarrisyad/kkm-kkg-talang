"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  return (
    <>
      {!isDashboard && <Navbar />}
      <main className={isDashboard ? "flex-grow flex flex-col w-full" : "flex-grow flex flex-col"}>
        {children}
      </main>
      {!isDashboard && <Footer />}
    </>
  );
}
