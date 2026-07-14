export const revalidate = 60;

import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

import { getCachedSiteName, getCachedSiteLogo } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const siteName = await getCachedSiteName();
  const siteLogo = await getCachedSiteLogo();

  const siteDescription = "Sistem Informasi Manajemen KKM & KKG Madrasah Ibtidaiyah Kecamatan Talang";
  


  return {
    title: siteName,
    description: siteDescription,
    icons: {
      icon: siteLogo,
    }
  };
}

import Providers from "@/components/Providers";
import LayoutWrapper from "@/components/LayoutWrapper";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteName = await getCachedSiteName();

  return (
    <html
      lang="id"
      className={cn("h-full", "antialiased", inter.variable, "font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <Providers>
          <LayoutWrapper siteName={siteName}>
            {children}
          </LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
