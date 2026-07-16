import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrCreateGoogleSheet } from "@/lib/google-sheets";

const SHEET_TITLE = "Permintaan_Reset";
const HEADERS = ["id", "madrasah_id", "guru_id", "nama_guru", "status", "requested_at", "resolved_at"];

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!spreadsheetId) return NextResponse.json({ error: "Spreadsheet ID not configured" }, { status: 500 });

    const sheet = await getOrCreateGoogleSheet(spreadsheetId, SHEET_TITLE, HEADERS);
    const rows = await sheet.getRows();

    const role = (session.user as any).role;
    const madrasahId = (session.user as any).madrasahId;

    const filteredRows = role === "admin" 
      ? rows.filter(r => r.get("status") === "pending")
      : rows.filter(r => r.get("madrasah_id") === madrasahId);

    const data = filteredRows.map(r => ({
      id: r.get("id"),
      madrasah_id: r.get("madrasah_id"),
      guru_id: r.get("guru_id"),
      nama_guru: r.get("nama_guru"),
      status: r.get("status"),
      requested_at: r.get("requested_at"),
      resolved_at: r.get("resolved_at"),
    }));

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "madrasah") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!spreadsheetId) return NextResponse.json({ error: "Spreadsheet ID not configured" }, { status: 500 });

    const { guru_id, nama_guru } = await req.json();
    if (!guru_id || !nama_guru) return NextResponse.json({ error: "Missing data" }, { status: 400 });

    const madrasahId = (session.user as any).madrasahId;
    const sheet = await getOrCreateGoogleSheet(spreadsheetId, SHEET_TITLE, HEADERS);
    
    // Check if there is already a pending request
    const rows = await sheet.getRows();
    const existing = rows.find(r => r.get("guru_id") === guru_id && r.get("status") === "pending");
    if (existing) {
      return NextResponse.json({ error: "Pengajuan reset untuk guru ini sudah ada dan sedang menunggu persetujuan." }, { status: 400 });
    }

    const id = Date.now().toString();
    await sheet.addRow({
      id,
      madrasah_id: madrasahId,
      guru_id,
      nama_guru,
      status: "pending",
      requested_at: new Date().toISOString(),
      resolved_at: ""
    });

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
