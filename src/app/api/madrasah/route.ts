import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrCreateGoogleSheet } from "@/lib/google-sheets";
import bcrypt from "bcryptjs";

const SHEET_TITLE = "Madrasah";
const HEADERS = ["id", "nama", "nsm", "npsn", "alamat", "kecamatan", "username", "password_hash", "status", "created_at"];

// GET — Admin: semua madrasah. Public tidak bisa akses.
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!spreadsheetId) return NextResponse.json({ error: "Spreadsheet ID not configured" }, { status: 500 });

    const sheet = await getOrCreateGoogleSheet(spreadsheetId, SHEET_TITLE, HEADERS);
    const rows = await sheet.getRows();

    const statusFilter = new URL(req.url).searchParams.get("status");

    const data = rows
      .map(r => ({
        id: r.get("id"),
        nama: r.get("nama"),
        nsm: r.get("nsm"),
        npsn: r.get("npsn"),
        alamat: r.get("alamat"),
        kecamatan: r.get("kecamatan"),
        username: r.get("username"),
        status: r.get("status") || "active",
        created_at: r.get("created_at"),
      }))
      .filter(r => statusFilter ? r.status === statusFilter : true);

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST — PUBLIC: Madrasah mendaftar sendiri, status = "pending"
export async function POST(req: NextRequest) {
  try {
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!spreadsheetId) return NextResponse.json({ error: "Spreadsheet ID not configured" }, { status: 500 });

    const body = await req.json();
    const { nama, nsm, npsn, alamat, kecamatan, username, password } = body;

    if (!nama || !username || !password) {
      return NextResponse.json({ error: "Nama madrasah, username, dan password wajib diisi" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
    }

    const sheet = await getOrCreateGoogleSheet(spreadsheetId, SHEET_TITLE, HEADERS);
    const rows = await sheet.getRows();

    // Cek username duplikat
    const exists = rows.find(r => r.get("username") === username);
    if (exists) {
      return NextResponse.json({ error: "Username sudah digunakan, coba username lain" }, { status: 400 });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const id = Date.now().toString();

    await sheet.addRow({
      id, nama, nsm: nsm || "", npsn: npsn || "", alamat: alamat || "",
      kecamatan: kecamatan || "", username, password_hash,
      status: "pending",
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message: "Pendaftaran berhasil! Tunggu aktivasi dari Admin KKM & KKG." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
