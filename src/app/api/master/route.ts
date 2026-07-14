import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrCreateGoogleSheet } from "@/lib/google-sheets";

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
const MASTER_COLUMNS = ["id", "kategori", "nama_nilai", "created_at"];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const kategori = searchParams.get("kategori");

    if (!SPREADSHEET_ID) throw new Error("Missing SPREADSHEET_ID");
    
    const sheet = await getOrCreateGoogleSheet(SPREADSHEET_ID, "MasterData", MASTER_COLUMNS);
    const rows = await sheet.getRows();
    
    let data = rows.map(r => ({
      id: r.get("id"),
      kategori: r.get("kategori"),
      nama_nilai: r.get("nama_nilai"),
      created_at: r.get("created_at"),
    }));

    if (kategori) {
      data = data.filter(d => d.kategori === kategori);
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { kategori, nama_nilai } = await req.json();
    if (!kategori || !nama_nilai) {
      return NextResponse.json({ error: "Kategori dan nama_nilai wajib diisi" }, { status: 400 });
    }

    if (!SPREADSHEET_ID) throw new Error("Missing SPREADSHEET_ID");
    
    const sheet = await getOrCreateGoogleSheet(SPREADSHEET_ID, "MasterData", MASTER_COLUMNS);
    
    const newRow = {
      id: Date.now().toString(),
      kategori,
      nama_nilai,
      created_at: new Date().toISOString(),
    };

    await sheet.addRow(newRow);

    return NextResponse.json({ message: "Berhasil menambahkan master data", data: newRow });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
