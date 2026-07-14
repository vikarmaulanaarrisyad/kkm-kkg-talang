import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrCreateGoogleSheet } from "@/lib/google-sheets";

const SURAT_HEADERS = ["id", "nomor_surat", "judul", "jenis", "isi", "file_url", "penerima", "created_at", "created_by"];

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID!;
    const sheet = await getOrCreateGoogleSheet(spreadsheetId, "Surat", SURAT_HEADERS);
    const rows = await sheet.getRows();
    const row = rows.find(r => r.get("id") === resolvedParams.id);

    if (!row) return NextResponse.json({ error: "Surat tidak ditemukan" }, { status: 404 });

    return NextResponse.json({
      id: row.get("id"),
      nomor_surat: row.get("nomor_surat") || "",
      judul: row.get("judul"),
      jenis: row.get("jenis"),
      isi: row.get("isi"),
      file_url: row.get("file_url"),
      penerima: row.get("penerima"),
      created_at: row.get("created_at"),
      created_by: row.get("created_by"),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID!;
    const sheet = await getOrCreateGoogleSheet(spreadsheetId, "Surat", SURAT_HEADERS);
    const rows = await sheet.getRows();
    const row = rows.find(r => r.get("id") === resolvedParams.id);

    if (!row) return NextResponse.json({ error: "Surat tidak ditemukan" }, { status: 404 });

    // Delete file from Cloudinary if exists
    const fileUrl = row.get("file_url");
    if (fileUrl && fileUrl.includes("cloudinary.com")) {
      try {
        const { default: cloudinary } = await import("@/lib/cloudinary");
        const parts = fileUrl.split('/upload/');
        if (parts.length >= 2) {
          const publicId = parts[1].replace(/\.[^.]+$/, '');
          await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
        }
      } catch (e) {
        console.error("Failed to delete file from Cloudinary:", e);
      }
    }

    await row.delete();

    // Also delete related SuratBaca records
    try {
      const bacaSheet = await getOrCreateGoogleSheet(spreadsheetId, "SuratBaca", ["id", "surat_id", "madrasah_id", "dibaca_at"]);
      const bacaRows = await bacaSheet.getRows();
      const toDelete = bacaRows.filter(r => r.get("surat_id") === resolvedParams.id);
      for (const r of toDelete) await r.delete();
    } catch (e) {}

    return NextResponse.json({ message: "Surat berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
