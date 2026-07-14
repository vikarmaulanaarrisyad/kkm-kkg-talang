import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrCreateGoogleSheet } from "@/lib/google-sheets";

const SHEET_TITLE = "Kehadiran";
const HEADERS = [
  "id", "kegiatan_id", "guru_id", "nama_guru", "madrasah_id", "waktu_hadir", "status"
];

// GET: Ambil daftar presensi (Admin / Madrasah)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const kegiatanId = url.searchParams.get("kegiatan_id");
    const guruIdParam = url.searchParams.get("guru_id");
    
    if (!kegiatanId && !guruIdParam) {
      return NextResponse.json({ error: "kegiatan_id or guru_id is required" }, { status: 400 });
    }

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID!;
    const sheet = await getOrCreateGoogleSheet(spreadsheetId, SHEET_TITLE, HEADERS);
    const rows = await sheet.getRows();

    const role = (session.user as any).role;
    const userMadrasahId = (session.user as any).madrasahId;

    let filtered = rows;
    
    if (kegiatanId) {
      filtered = filtered.filter(r => r.get("kegiatan_id") === kegiatanId);
    }
    
    if (guruIdParam) {
      // If "me", resolve to session user id, else use param
      const targetGuruId = guruIdParam === "me" ? (session.user as any)?.id : guruIdParam;
      filtered = filtered.filter(r => r.get("guru_id") === targetGuruId);
    }
    
    // Madrasah hanya bisa lihat kehadiran guru dari madrasahnya sendiri
    if (role === "madrasah" && !guruIdParam) {
      filtered = filtered.filter(r => r.get("madrasah_id") === userMadrasahId);
    }

    const data = filtered.map(r => ({
      id: r.get("id"),
      kegiatan_id: r.get("kegiatan_id"),
      guru_id: r.get("guru_id"),
      nama_guru: r.get("nama_guru"),
      madrasah_id: r.get("madrasah_id"),
      waktu_hadir: r.get("waktu_hadir"),
      status: r.get("status"),
    }));

    // Sort by waktu hadir descending
    data.sort((a, b) => new Date(b.waktu_hadir).getTime() - new Date(a.waktu_hadir).getTime());
    
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Rekam scan QR Code (Oleh Guru)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "guru") {
      return NextResponse.json({ error: "Hanya Guru yang dapat melakukan presensi" }, { status: 403 });
    }

    const body = await req.json();
    const { kegiatan_id } = body;

    if (!kegiatan_id) {
      return NextResponse.json({ error: "QR Code tidak valid (kegiatan_id hilang)" }, { status: 400 });
    }

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID!;
    
    // 1. Validasi apakah kegiatan ini ada dan aktif
    const kegiatanSheet = await getOrCreateGoogleSheet(spreadsheetId, "Kegiatan", ["id", "status"]);
    const kegiatanRows = await kegiatanSheet.getRows();
    const kegiatanInfo = kegiatanRows.find(r => r.get("id") === kegiatan_id);
    
    if (!kegiatanInfo) {
      return NextResponse.json({ error: "Kegiatan tidak ditemukan" }, { status: 404 });
    }
    if (kegiatanInfo.get("status") !== "active") {
      return NextResponse.json({ error: "Sesi presensi untuk kegiatan ini sudah ditutup" }, { status: 400 });
    }

    // 2. Cek apakah sudah presensi sebelumnya
    const sheet = await getOrCreateGoogleSheet(spreadsheetId, SHEET_TITLE, HEADERS);
    const rows = await sheet.getRows();
    
    const guruId = (session.user as any).id;
    const sudahHadir = rows.find(r => r.get("kegiatan_id") === kegiatan_id && r.get("guru_id") === guruId);

    if (sudahHadir) {
      return NextResponse.json({ error: "Anda sudah melakukan presensi untuk kegiatan ini" }, { status: 400 });
    }

    // 3. Simpan presensi
    const newId = `ATT-${Date.now()}`;
    await sheet.addRow({
      id: newId,
      kegiatan_id,
      guru_id: guruId,
      nama_guru: session.user?.name || "Guru",
      madrasah_id: (session.user as any).madrasahId || "",
      waktu_hadir: new Date().toISOString(),
      status: "Hadir",
    });

    return NextResponse.json({ message: "Presensi berhasil dicatat!", id: newId }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
