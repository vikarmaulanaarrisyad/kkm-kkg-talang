import { NextResponse } from "next/server";
import { getOrCreateGoogleSheet } from "@/lib/google-sheets";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nama, email, subjek, pesan } = body;

    if (!nama || !email || !subjek || !pesan) {
      return NextResponse.json(
        { error: "Semua kolom harus diisi" },
        { status: 400 }
      );
    }

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!spreadsheetId) {
      return NextResponse.json(
        { error: "Konfigurasi Google Spreadsheet tidak valid" },
        { status: 500 }
      );
    }

    const sheet = await getOrCreateGoogleSheet(spreadsheetId, "Kontak", [
      "id",
      "nama",
      "email",
      "subjek",
      "pesan",
      "created_at"
    ]);

    const newId = `msg-${Date.now()}`;
    await sheet.addRow({
      id: newId,
      nama,
      email,
      subjek,
      pesan,
      created_at: new Date().toISOString()
    });

    return NextResponse.json(
      { message: "Pesan berhasil dikirim", id: newId },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("API Kontak Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses permintaan" },
      { status: 500 }
    );
  }
}
