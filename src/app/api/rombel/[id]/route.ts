import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrCreateGoogleSheet } from "@/lib/google-sheets";

const SHEET_TITLE = "Rombel";
const HEADERS = [
  "id", 
  "madrasah_id", 
  "tahun_ajaran", 
  "nama_rombel", 
  "siswa_laki", 
  "siswa_perempuan", 
  "wali_kelas_id", 
  "created_at"
];

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!spreadsheetId) return NextResponse.json({ error: "Spreadsheet ID not configured" }, { status: 500 });

    const sheet = await getOrCreateGoogleSheet(spreadsheetId, SHEET_TITLE, HEADERS);
    const rows = await sheet.getRows();
    const row = rows.find(r => r.get("id") === id);
    if (!row) return NextResponse.json({ error: "Data Rombel tidak ditemukan" }, { status: 404 });

    const role = (session.user as any).role;
    const madrasahId = (session.user as any).madrasahId;
    if (role === "madrasah" && row.get("madrasah_id") !== madrasahId) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const body = await req.json();
    row.assign({
      tahun_ajaran: body.tahun_ajaran ?? row.get("tahun_ajaran"),
      nama_rombel: body.nama_rombel ?? row.get("nama_rombel"),
      siswa_laki: body.siswa_laki !== undefined ? body.siswa_laki.toString() : row.get("siswa_laki"),
      siswa_perempuan: body.siswa_perempuan !== undefined ? body.siswa_perempuan.toString() : row.get("siswa_perempuan"),
      wali_kelas_id: body.wali_kelas_id ?? row.get("wali_kelas_id"),
    });
    await row.save();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!spreadsheetId) return NextResponse.json({ error: "Spreadsheet ID not configured" }, { status: 500 });

    const sheet = await getOrCreateGoogleSheet(spreadsheetId, SHEET_TITLE, HEADERS);
    const rows = await sheet.getRows();
    const row = rows.find(r => r.get("id") === id);
    if (!row) return NextResponse.json({ error: "Data Rombel tidak ditemukan" }, { status: 404 });

    const role = (session.user as any).role;
    const madrasahId = (session.user as any).madrasahId;
    if (role === "madrasah" && row.get("madrasah_id") !== madrasahId) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    await row.delete();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
