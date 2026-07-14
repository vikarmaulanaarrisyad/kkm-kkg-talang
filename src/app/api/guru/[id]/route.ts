import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrCreateGoogleSheet } from "@/lib/google-sheets";

const SHEET_TITLE = "Guru";
const HEADERS = [
  "id", "madrasah_id", "nama", "gelar_depan", "gelar_belakang", "nuptk", "peg_id", "nip",
  "tempat_lahir", "tanggal_lahir", "jenis_kelamin", "jabatan",
  "status_kepegawaian", "pendidikan_terakhir", "bidang_studi",
  "no_hp", "email", "created_at"
];

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!spreadsheetId) return NextResponse.json({ error: "Spreadsheet ID not configured" }, { status: 500 });

    const sheet = await getOrCreateGoogleSheet(spreadsheetId, SHEET_TITLE, HEADERS);
    const rows = await sheet.getRows();
    const row = rows.find(r => r.get("id") === id);
    if (!row) return NextResponse.json({ error: "Data guru tidak ditemukan" }, { status: 404 });

    // Madrasah can only access their own teachers
    const role = (session.user as any).role;
    const madrasahId = (session.user as any).madrasahId;
    if (role === "madrasah" && row.get("madrasah_id") !== madrasahId) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    return NextResponse.json({
      id: row.get("id"),
      madrasah_id: row.get("madrasah_id"),
      nama: row.get("nama"),
      gelar_depan: row.get("gelar_depan"),
      gelar_belakang: row.get("gelar_belakang"),
      nuptk: row.get("nuptk")?.replace(/^'/, ""),
      peg_id: row.get("peg_id")?.replace(/^'/, ""),
      nip: row.get("nip")?.replace(/^'/, ""),
      tempat_lahir: row.get("tempat_lahir"),
      tanggal_lahir: row.get("tanggal_lahir"),
      jenis_kelamin: row.get("jenis_kelamin"),
      jabatan: row.get("jabatan"),
      status_kepegawaian: row.get("status_kepegawaian"),
      pendidikan_terakhir: row.get("pendidikan_terakhir"),
      bidang_studi: row.get("bidang_studi"),
      no_hp: row.get("no_hp")?.replace(/^'/, ""),
      email: row.get("email"),
      created_at: row.get("created_at"),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

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
    if (!row) return NextResponse.json({ error: "Data guru tidak ditemukan" }, { status: 404 });

    // Madrasah can only edit their own teachers
    const role = (session.user as any).role;
    const madrasahId = (session.user as any).madrasahId;
    if (role === "madrasah" && row.get("madrasah_id") !== madrasahId) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const body = await req.json();
    row.assign({
      nama: body.nama ?? row.get("nama"),
      gelar_depan: body.gelar_depan ?? row.get("gelar_depan"),
      gelar_belakang: body.gelar_belakang ?? row.get("gelar_belakang"),
      nuptk: body.nuptk ? `'${body.nuptk}` : row.get("nuptk"),
      peg_id: body.peg_id ? `'${body.peg_id}` : row.get("peg_id"),
      nip: body.nip ? `'${body.nip}` : row.get("nip"),
      tempat_lahir: body.tempat_lahir ?? row.get("tempat_lahir"),
      tanggal_lahir: body.tanggal_lahir ?? row.get("tanggal_lahir"),
      jenis_kelamin: body.jenis_kelamin ?? row.get("jenis_kelamin"),
      jabatan: body.jabatan ?? row.get("jabatan"),
      status_kepegawaian: body.status_kepegawaian ?? row.get("status_kepegawaian"),
      pendidikan_terakhir: body.pendidikan_terakhir ?? row.get("pendidikan_terakhir"),
      bidang_studi: body.bidang_studi ?? row.get("bidang_studi"),
      no_hp: body.no_hp ? `'${body.no_hp}` : row.get("no_hp"),
      email: body.email ?? row.get("email"),
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
    if (!row) return NextResponse.json({ error: "Data guru tidak ditemukan" }, { status: 404 });

    // Madrasah can only delete their own teachers
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
