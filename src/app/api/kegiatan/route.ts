import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrCreateGoogleSheet } from "@/lib/google-sheets";

const SHEET_TITLE = "Kegiatan";
const HEADERS = [
  "id", "nama", "jenis", "tempat", "tanggal", "waktu", "status", "created_by", "created_at", "madrasah_id"
];

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID!;
    const sheet = await getOrCreateGoogleSheet(spreadsheetId, SHEET_TITLE, HEADERS);
    const rows = await sheet.getRows();

    const role = (session.user as any).role;
    const madrasahName = (session.user as any).name;
    
    let data = rows.map(r => ({
      id: r.get("id"),
      nama: r.get("nama"),
      jenis: r.get("jenis"),
      tempat: r.get("tempat"),
      tanggal: r.get("tanggal"),
      waktu: r.get("waktu"),
      status: r.get("status"),
      created_by: r.get("created_by"),
      created_at: r.get("created_at"),
      madrasah_id: r.get("madrasah_id") || "",
    }));

    if (role === "madrasah") {
      data = data.filter(d => d.tempat === madrasahName);
    }

    // Sort by created_at descending (latest first)
    data.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any).role;
    if (role === "guru") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { nama, jenis, tempat, tanggal, waktu } = body;

    if (!nama || !tanggal) {
      return NextResponse.json({ error: "Nama dan tanggal wajib diisi" }, { status: 400 });
    }

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID!;
    const sheet = await getOrCreateGoogleSheet(spreadsheetId, SHEET_TITLE, HEADERS);

    const newId = `EVT-${Date.now()}`;
    await sheet.addRow({
      id: newId,
      nama,
      jenis: jenis || "KKG",
      tempat: tempat || "",
      tanggal,
      waktu: waktu || "",
      status: "waiting",
      created_by: session.user?.name || "",
      created_at: new Date().toISOString(),
      madrasah_id: (session.user as any).madrasahId || "",
    });

    return NextResponse.json({ message: "Kegiatan berhasil dibuat", id: newId }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: "ID dan status wajib diisi" }, { status: 400 });
    }

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID!;
    const sheet = await getOrCreateGoogleSheet(spreadsheetId, SHEET_TITLE, HEADERS);
    const rows = await sheet.getRows();

    const row = rows.find(r => r.get("id") === id);
    if (!row) {
      return NextResponse.json({ error: "Kegiatan tidak ditemukan" }, { status: 404 });
    }

    row.set("status", status);
    await row.save();

    return NextResponse.json({ message: "Status berhasil diupdate" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
