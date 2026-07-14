import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrCreateGoogleSheet } from "@/lib/google-sheets";

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
const MASTER_COLUMNS = ["id", "kategori", "nama_nilai", "created_at"];

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!SPREADSHEET_ID) throw new Error("Missing SPREADSHEET_ID");
    
    const sheet = await getOrCreateGoogleSheet(SPREADSHEET_ID, "MasterData", MASTER_COLUMNS);
    const rows = await sheet.getRows();
    
    const rowIndex = rows.findIndex(r => r.get("id") === params.id);
    if (rowIndex === -1) {
      return NextResponse.json({ error: "Data master tidak ditemukan" }, { status: 404 });
    }

    await rows[rowIndex].delete();

    return NextResponse.json({ message: "Data master berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
