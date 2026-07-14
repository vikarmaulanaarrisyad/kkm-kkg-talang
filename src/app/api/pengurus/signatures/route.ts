import { NextResponse } from "next/server";
import { getOrCreateGoogleSheet } from "@/lib/google-sheets";

export async function GET() {
  try {
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!spreadsheetId) return NextResponse.json({ ketua: "", sekretaris: "" });

    const sheet = await getOrCreateGoogleSheet(spreadsheetId, "Pengurus", ['id', 'name', 'role', 'image_url', 'order', 'created_at']);
    const rows = await sheet.getRows();

    let ketua = "KETUA KKG";
    let sekretaris = "SEKRETARIS KKG";

    for (const row of rows) {
      const role = (row.get('role') || "").toLowerCase();
      const name = row.get('name') || "";
      if (role.includes("ketua")) {
        ketua = name;
      } else if (role.includes("sekretaris")) {
        sekretaris = name;
      }
    }

    return NextResponse.json({ ketua, sekretaris });
  } catch (error) {
    console.error("Error fetching signatures:", error);
    return NextResponse.json({ ketua: "KETUA KKG", sekretaris: "SEKRETARIS KKG" });
  }
}
