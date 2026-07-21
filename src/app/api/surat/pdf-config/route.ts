import { NextResponse } from "next/server";
import { getCachedSiteName, getCachedSiteLogo, getCachedKontakInfo } from "@/lib/settings";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const siteName = await getCachedSiteName();
    const logo = await getCachedSiteLogo();
    const kontak = await getCachedKontakInfo();

    let ketua = "KETUA KKG";
    let sekretaris = "SEKRETARIS KKG";

    try {
      const pengurusList = await prisma.pengurus.findMany({
        select: { name: true, role: true }
      });
      for (const p of pengurusList) {
        const role = (p.role || "").toLowerCase();
        const name = p.name || "";
        if (role.includes("ketua")) {
          ketua = name;
        } else if (role.includes("sekretaris")) {
          sekretaris = name;
        }
      }
    } catch (e) {
      console.error("Gagal mengambil data pengurus:", e);
    }

    return NextResponse.json({ siteName, logo, kontak, ketua, sekretaris });
  } catch (error: any) {
    console.error("API pdf-config error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
