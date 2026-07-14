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

    // Filter per madrasah jika bukan admin
    const filtered = role === "admin"
      ? rows
      : rows.filter(r => r.get("madrasah_id") === madrasahId);

    // Optional filter by madrasah_id query param (for admin)
    const url = new URL(req.url);
    const filterMadrasahId = url.searchParams.get("madrasah_id");
    const finalRows = (role === "admin" && filterMadrasahId)
      ? filtered.filter(r => r.get("madrasah_id") === filterMadrasahId)
      : filtered;

    const data = finalRows.map(r => ({
      id: r.get("id"),
      madrasah_id: r.get("madrasah_id"),
      nama: r.get("nama"),
      gelar_depan: r.get("gelar_depan"),
      gelar_belakang: r.get("gelar_belakang"),
      nuptk: r.get("nuptk")?.replace(/^'/, ""),
      peg_id: r.get("peg_id")?.replace(/^'/, ""),
      nip: r.get("nip")?.replace(/^'/, ""),
      tempat_lahir: r.get("tempat_lahir"),
      tanggal_lahir: r.get("tanggal_lahir"),
      jenis_kelamin: r.get("jenis_kelamin"),
      jabatan: r.get("jabatan"),
      status_kepegawaian: r.get("status_kepegawaian"),
      pendidikan_terakhir: r.get("pendidikan_terakhir"),
      bidang_studi: r.get("bidang_studi"),
      no_hp: r.get("no_hp")?.replace(/^'/, ""),
      email: r.get("email"),
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

    const body = await req.json();
    const {
      nama, gelar_depan, gelar_belakang, nuptk, peg_id, nip, tempat_lahir, tanggal_lahir,
      jenis_kelamin, jabatan, status_kepegawaian, pendidikan_terakhir,
      bidang_studi, no_hp, email
    } = body;

    if (!nama) return NextResponse.json({ error: "Nama guru wajib diisi" }, { status: 400 });

    const role = (session.user as any).role;
    const madrasahId = role === "admin" ? body.madrasah_id : (session.user as any).madrasahId;
    if (!madrasahId) return NextResponse.json({ error: "Madrasah ID tidak valid" }, { status: 400 });

    const sheet = await getOrCreateGoogleSheet(spreadsheetId, SHEET_TITLE, HEADERS);
    const id = Date.now().toString();

    await sheet.addRow({
      id, madrasah_id: madrasahId, nama,
      gelar_depan: gelar_depan || "", gelar_belakang: gelar_belakang || "",
      nuptk: nuptk ? `'${nuptk}` : "", peg_id: peg_id ? `'${peg_id}` : "", nip: nip ? `'${nip}` : "",
      tempat_lahir: tempat_lahir || "", tanggal_lahir: tanggal_lahir || "",
      jenis_kelamin: jenis_kelamin || "", jabatan: jabatan || "",
      status_kepegawaian: status_kepegawaian || "", pendidikan_terakhir: pendidikan_terakhir || "",
      bidang_studi: bidang_studi || "", no_hp: no_hp ? `'${no_hp}` : "", email: email || "",
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
