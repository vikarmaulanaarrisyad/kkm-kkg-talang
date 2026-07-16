import { NextResponse } from "next/server";
import { getOrCreateGoogleSheet } from "@/lib/google-sheets";

export async function POST(req: Request) {
  try {
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json({ error: "Username wajib diisi" }, { status: 400 });
    }

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!spreadsheetId) {
      return NextResponse.json({ error: "Konfigurasi server tidak valid" }, { status: 500 });
    }

    let found = false;
    let role = "";
    let adminPhone = "";

    // 1. Cek tabel Admin (sekaligus ambil nomor WA admin pertama)
    const adminSheet = await getOrCreateGoogleSheet(spreadsheetId, "Users");
    const adminRows = await adminSheet.getRows();
    
    // Asumsikan Admin utama ada di baris pertama
    if (adminRows.length > 0) {
      adminPhone = adminRows[0].get("no_wa") || adminRows[0].get("whatsapp") || adminRows[0].get("telepon") || "+6281234567890";
    }

    if (adminRows.some(row => row.get("username") === username)) {
      found = true;
      role = "admin";
    }

    // 2. Cek tabel Madrasah
    if (!found) {
      const madrasahSheet = await getOrCreateGoogleSheet(spreadsheetId, "Madrasah", ["username"]);
      const madrasahRows = await madrasahSheet.getRows();
      if (madrasahRows.some(row => row.get("username") === username)) {
        found = true;
        role = "madrasah";
      }
    }

    // 3. Cek tabel Guru
    if (!found) {
      const guruSheet = await getOrCreateGoogleSheet(spreadsheetId, "Guru", ["nip", "peg_id", "nuptk"]);
      const guruRows = await guruSheet.getRows();
      
      const normalizeID = (val: any) => (val || "").toString().replace(/^'/, "").trim();
      
      if (guruRows.some(row => {
        const valNip = normalizeID(row.get("nip"));
        const valPegId = normalizeID(row.get("peg_id"));
        const valNuptk = normalizeID(row.get("nuptk"));
        return valNip === username || valPegId === username || valNuptk === username;
      })) {
        found = true;
        role = "guru";
      }
    }

    return NextResponse.json({ exists: found, role, adminPhone });
  } catch (error: any) {
    console.error("Check user error:", error);
    return NextResponse.json({ error: "Gagal memverifikasi pengguna" }, { status: 500 });
  }
}
