import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrCreateGoogleSheet } from "@/lib/google-sheets";

const SHEET_TITLE = "Unduhan";
const HEADERS = ['id', 'title', 'url', 'icon_type', 'created_at'];

export async function GET() {
  try {
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!spreadsheetId) return NextResponse.json({ error: "Spreadsheet ID not configured" }, { status: 500 });

    const sheet = await getOrCreateGoogleSheet(spreadsheetId, SHEET_TITLE, HEADERS);
    const rows = await sheet.getRows();

    const data = rows.map(row => ({
      id: row.get('id'),
      title: row.get('title'),
      url: row.get('url'),
      icon_type: row.get('icon_type'),
      created_at: row.get('created_at')
    }));

    // Sort by created_at descending if possible
    data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { title, url, icon_type } = body;

    if (!title || !url) return NextResponse.json({ error: "Judul dan URL wajib diisi" }, { status: 400 });

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!spreadsheetId) return NextResponse.json({ error: "Spreadsheet ID not configured" }, { status: 500 });

    const sheet = await getOrCreateGoogleSheet(spreadsheetId, SHEET_TITLE, HEADERS);
    
    const id = Date.now().toString();
    const created_at = new Date().toISOString();

    await sheet.addRow({
      id,
      title,
      url,
      icon_type: icon_type || 'default',
      created_at
    });

    return NextResponse.json({ success: true, message: "Unduhan berhasil ditambahkan" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
