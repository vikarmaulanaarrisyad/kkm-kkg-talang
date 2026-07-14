import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

import { getOrCreateGoogleSheet } from "@/lib/google-sheets";

export async function generateMetadata(): Promise<Metadata> {
  let siteName = "CMS Madrasah Ibtidaiyah";
  let siteLogo = "/icon.png";
  let siteDescription = "Sistem Informasi Manajemen KKM & KKG Madrasah Ibtidaiyah Kecamatan Talang";
  
  try {
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (spreadsheetId) {
      const sheet = await getOrCreateGoogleSheet(spreadsheetId, "Settings", ["key", "value"]);
      const rows = await sheet.getRows();
      
      const logoRow = rows.find((row: any) => row.get("key") === "site_logo");
      if (logoRow && logoRow.get("value")) {
        const url = logoRow.get("value");
        if (url.includes("cloudinary.com") && url.includes("/upload/")) {
          // Otomatis ubah ukuran menjadi 64x64 agar sangat ringan dan berbentuk persegi sempurna untuk Favicon
          siteLogo = url.replace("/upload/", "/upload/w_64,h_64,c_fill,f_auto,q_auto/");
        } else {
          siteLogo = url;
        }
      }
      
      const nameRow = rows.find((row: any) => row.get("key") === "site_name");
      if (nameRow && nameRow.get("value")) {
        siteName = nameRow.get("value");
      }
    }
  } catch (e) {
    console.error("Failed to fetch metadata from Google Sheets:", e);
  }

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={cn("h-full", "antialiased", inter.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <Providers>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
