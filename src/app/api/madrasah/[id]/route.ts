import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrCreateGoogleSheet } from "@/lib/google-sheets";
import bcrypt from "bcryptjs";

const SHEET_TITLE = "Madrasah";
const HEADERS = ["id", "nama", "nsm", "npsn", "alamat", "kecamatan", "username", "password_hash", "status", "created_at"];

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
    if (!row) return NextResponse.json({ error: "Madrasah tidak ditemukan" }, { status: 404 });

    return NextResponse.json({
      id: row.get("id"),
      nama: row.get("nama"),
      nsm: row.get("nsm"),
      npsn: row.get("npsn"),
      alamat: row.get("alamat"),
      kecamatan: row.get("kecamatan"),
      username: row.get("username"),
      status: row.get("status") || "active",
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
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!spreadsheetId) return NextResponse.json({ error: "Spreadsheet ID not configured" }, { status: 500 });

    const body = await req.json();
    const { nama, nsm, npsn, alamat, kecamatan, username, password } = body;

    const sheet = await getOrCreateGoogleSheet(spreadsheetId, SHEET_TITLE, HEADERS);
    const rows = await sheet.getRows();
    const row = rows.find(r => r.get("id") === id);
    if (!row) return NextResponse.json({ error: "Madrasah tidak ditemukan" }, { status: 404 });

    const updates: any = { nama, nsm: nsm || "", npsn: npsn || "", alamat: alamat || "", kecamatan: kecamatan || "", username };
    if (password) {
      updates.password_hash = await bcrypt.hash(password, 12);
    }

    row.assign(updates);
    await row.save();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH — Admin: ubah status madrasah (active / rejected)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await req.json();
    if (!["active", "rejected", "pending"].includes(status)) {
      return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
    }

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!spreadsheetId) return NextResponse.json({ error: "Spreadsheet ID not configured" }, { status: 500 });

    const sheet = await getOrCreateGoogleSheet(spreadsheetId, SHEET_TITLE, HEADERS);
    const rows = await sheet.getRows();
    const row = rows.find(r => r.get("id") === id);
    if (!row) return NextResponse.json({ error: "Madrasah tidak ditemukan" }, { status: 404 });

    row.assign({ status });
    await row.save();

    return NextResponse.json({ success: true, status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!spreadsheetId) return NextResponse.json({ error: "Spreadsheet ID not configured" }, { status: 500 });

    const sheet = await getOrCreateGoogleSheet(spreadsheetId, SHEET_TITLE, HEADERS);
    const rows = await sheet.getRows();
    const row = rows.find(r => r.get("id") === id);
    if (!row) return NextResponse.json({ error: "Madrasah tidak ditemukan" }, { status: 404 });

    await row.delete();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
