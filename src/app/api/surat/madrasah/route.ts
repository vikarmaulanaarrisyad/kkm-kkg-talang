import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrCreateGoogleSheet } from "@/lib/google-sheets";

const SURAT_HEADERS = ["id", "nomor_surat", "judul", "jenis", "isi", "file_url", "penerima", "created_at", "created_by"];
const BACA_HEADERS = ["id", "surat_id", "madrasah_id", "dibaca_at"];

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "madrasah") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const madrasahId = (session.user as any).id || session.user?.email || "";
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID!;

    const [suratSheet, bacaSheet] = await Promise.all([
      getOrCreateGoogleSheet(spreadsheetId, "Surat", SURAT_HEADERS),
      getOrCreateGoogleSheet(spreadsheetId, "SuratBaca", BACA_HEADERS),
    ]);

    const [suratRows, bacaRows] = await Promise.all([
      suratSheet.getRows(),
      bacaSheet.getRows(),
    ]);

    const myBacaIds = new Set(
      bacaRows
        .filter(b => b.get("madrasah_id") === madrasahId)
        .map(b => b.get("surat_id"))
    );

    // Filter: surat untuk all atau khusus madrasah ini
    const mySurats = suratRows
      .filter(r => {
        const penerima = r.get("penerima") || "all";
        return penerima === "all" || penerima === madrasahId || penerima.split(",").includes(madrasahId);
      })
       .map(r => ({
        id: r.get("id"),
        nomor_surat: r.get("nomor_surat") || "",
        judul: r.get("judul"),
        jenis: r.get("jenis"),
        isi: r.get("isi"),
        file_url: r.get("file_url"),
        created_at: r.get("created_at"),
        created_by: r.get("created_by"),
        sudah_dibaca: myBacaIds.has(r.get("id")),
      }));

    mySurats.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json(mySurats);
  } catch (error: any) {
    console.error("GET /api/surat/madrasah error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "madrasah") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const madrasahId = (session.user as any).id || session.user?.email || "";
    const { surat_id } = await req.json();

    if (!surat_id) return NextResponse.json({ error: "surat_id diperlukan" }, { status: 400 });

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID!;
    const bacaSheet = await getOrCreateGoogleSheet(spreadsheetId, "SuratBaca", BACA_HEADERS);
    const bacaRows = await bacaSheet.getRows();

    const alreadyRead = bacaRows.find(
      b => b.get("surat_id") === surat_id && b.get("madrasah_id") === madrasahId
    );

    if (!alreadyRead) {
      await bacaSheet.addRow({
        id: `baca-${Date.now()}`,
        surat_id,
        madrasah_id: madrasahId,
        dibaca_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ message: "Surat ditandai sudah dibaca" });
  } catch (error: any) {
    console.error("PUT /api/surat/madrasah error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
