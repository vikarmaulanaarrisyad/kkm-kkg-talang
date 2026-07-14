import { NextResponse } from "next/server";
import { getCachedSiteName, getCachedSiteLogo, getCachedKontakInfo, getAllSettings } from "@/lib/settings";
import { getOrCreateGoogleSheet } from "@/lib/google-sheets";

export async function GET() {
  try {
    const siteName = await getCachedSiteName();
    const logo = await getCachedSiteLogo();
    const kontak = await getCachedKontakInfo();

    let ketua = "KETUA KKG";
    let sekretaris = "SEKRETARIS KKG";

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (spreadsheetId) {
      try {
        const sheet = await getOrCreateGoogleSheet(spreadsheetId, "Pengurus", ['id', 'name', 'role']);
        const rows = await sheet.getRows();
        for (const row of rows) {
          const role = (row.get('role') || "").toLowerCase();
          const name = row.get('name') || "";
          if (role.includes("ketua")) {
            ketua = name;
          } else if (role.includes("sekretaris")) {
            sekretaris = name;
          }
        }
      } catch (e) {
        console.error("Gagal mengambil data pengurus:", e);
      }
    }

    return NextResponse.json({ siteName, logo, kontak, ketua, sekretaris });
  } catch (error: any) {
    console.error("API pdf-config error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
