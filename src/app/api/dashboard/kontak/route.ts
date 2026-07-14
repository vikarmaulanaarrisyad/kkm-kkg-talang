import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrCreateGoogleSheet } from "@/lib/google-sheets";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!spreadsheetId) {
      return NextResponse.json({ error: "Konfigurasi Google Spreadsheet tidak valid" }, { status: 500 });
    }

    const sheet = await getOrCreateGoogleSheet(spreadsheetId, "Kontak", [
      "id", "nama", "email", "subjek", "pesan", "created_at"
    ]);

    const rows = await sheet.getRows();
    const data = rows.map(r => ({
      id: r.get("id"),
      nama: r.get("nama"),
      email: r.get("email"),
      subjek: r.get("subjek"),
      pesan: r.get("pesan"),
      created_at: r.get("created_at"),
    }));

    // Urutkan dari terbaru ke terlama
    data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("API GET Kontak Dashboard Error:", error);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    const sheet = await getOrCreateGoogleSheet(spreadsheetId!, "Kontak");
    const rows = await sheet.getRows();
    const rowToDelete = rows.find(r => r.get("id") === id);

    if (!rowToDelete) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }

    await rowToDelete.delete();
    return NextResponse.json({ message: "Berhasil dihapus" });
  } catch (error: any) {
    console.error("API DELETE Kontak Dashboard Error:", error);
    return NextResponse.json({ error: "Gagal menghapus data" }, { status: 500 });
  }
}
