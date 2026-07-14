import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrCreateGoogleSheet } from "@/lib/google-sheets";

const SHEET_TITLE = "TahunAjaran";
const HEADERS = ["id", "nama_tahun", "semester", "created_at"];

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!spreadsheetId) return NextResponse.json({ error: "Spreadsheet ID not configured" }, { status: 500 });

    const sheet = await getOrCreateGoogleSheet(spreadsheetId, SHEET_TITLE, HEADERS);
    const rows = await sheet.getRows();

    const data = rows.map(r => ({
      id: r.get("id"),
      nama_tahun: r.get("nama_tahun"),
      semester: r.get("semester"),
      created_at: r.get("created_at"),
    }));

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    if ((session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!spreadsheetId) return NextResponse.json({ error: "Spreadsheet ID not configured" }, { status: 500 });

    const body = await req.json();
    const { nama_tahun, semester } = body;

    if (!nama_tahun || !semester) {
      return NextResponse.json({ error: "Nama Tahun dan Semester wajib diisi" }, { status: 400 });
    }

    const sheet = await getOrCreateGoogleSheet(spreadsheetId, SHEET_TITLE, HEADERS);
    const rows = await sheet.getRows();
    
    // Check duplicate
    const exists = rows.some(r => r.get("nama_tahun") === nama_tahun && r.get("semester") === semester);
    if (exists) {
      return NextResponse.json({ error: "Tahun Ajaran dan Semester ini sudah ada" }, { status: 400 });
    }

    const id = Date.now().toString();
    await sheet.addRow({
      id,
      nama_tahun,
      semester,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
