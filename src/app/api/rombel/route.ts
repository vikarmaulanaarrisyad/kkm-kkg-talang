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

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any).role;
    const madrasahId = (session.user as any).madrasahId;
    const url = new URL(req.url);
    const filterTahunAjaran = url.searchParams.get("tahun_ajaran");

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!spreadsheetId) return NextResponse.json({ error: "Spreadsheet ID not configured" }, { status: 500 });

    const sheet = await getOrCreateGoogleSheet(spreadsheetId, SHEET_TITLE, HEADERS);
    const rows = await sheet.getRows();

    // Admin sees all, Madrasah sees only theirs
    let finalRows = rows;
    if (role === "madrasah") {
      finalRows = rows.filter(r => r.get("madrasah_id") === madrasahId);
    }
    
    if (filterTahunAjaran) {
      finalRows = finalRows.filter(r => r.get("tahun_ajaran") === filterTahunAjaran);
    }

    const data = finalRows.map(r => ({
      id: r.get("id"),
      madrasah_id: r.get("madrasah_id"),
      tahun_ajaran: r.get("tahun_ajaran"),
      nama_rombel: r.get("nama_rombel"),
      siswa_laki: parseInt(r.get("siswa_laki") || "0", 10),
      siswa_perempuan: parseInt(r.get("siswa_perempuan") || "0", 10),
      wali_kelas_id: r.get("wali_kelas_id") || "",
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

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!spreadsheetId) return NextResponse.json({ error: "Spreadsheet ID not configured" }, { status: 500 });

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Request body tidak valid" }, { status: 400 });
    }

    const {
      tahun_ajaran, nama_rombel, siswa_laki, siswa_perempuan, wali_kelas_id
    } = body;

    if (!tahun_ajaran || !nama_rombel) {
      return NextResponse.json({ error: "Tahun Ajaran dan Nama Rombel wajib diisi" }, { status: 400 });
    }

    const role = (session.user as any).role;
    const madrasahId = role === "admin" ? body.madrasah_id : (session.user as any).madrasahId;
    if (!madrasahId) return NextResponse.json({ error: "Madrasah ID tidak valid. Pastikan Anda sudah login sebagai madrasah." }, { status: 400 });

    const sheet = await getOrCreateGoogleSheet(spreadsheetId, SHEET_TITLE, HEADERS);
    const id = Date.now().toString();

    await sheet.addRow({
      id, 
      madrasah_id: madrasahId, 
      tahun_ajaran, 
      nama_rombel, 
      siswa_laki: (siswa_laki || 0).toString(), 
      siswa_perempuan: (siswa_perempuan || 0).toString(), 
      wali_kelas_id: wali_kelas_id || "", 
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error("POST /api/rombel error:", error);
    return NextResponse.json({ error: error.message || "Terjadi kesalahan server" }, { status: 500 });
  }
}
