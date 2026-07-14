import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrCreateGoogleSheet } from "@/lib/google-sheets";

const SURAT_HEADERS = ["id", "nomor_surat", "judul", "jenis", "isi", "file_url", "penerima", "created_at", "created_by"];

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID!;
    const sheet = await getOrCreateGoogleSheet(spreadsheetId, "Surat", SURAT_HEADERS);
    const rows = await sheet.getRows();

    // Get read counts from SuratBaca
    const bacaSheet = await getOrCreateGoogleSheet(spreadsheetId, "SuratBaca", ["id", "surat_id", "madrasah_id", "dibaca_at"]);
    const bacaRows = await bacaSheet.getRows();

    const data = rows.map(r => {
      const suratId = r.get("id");
      const dibacaCount = bacaRows.filter(b => b.get("surat_id") === suratId).length;
      return {
        id: suratId,
        nomor_surat: r.get("nomor_surat") || "",
        judul: r.get("judul"),
        jenis: r.get("jenis"),
        isi: r.get("isi"),
        file_url: r.get("file_url"),
        penerima: r.get("penerima"),
        created_at: r.get("created_at"),
        created_by: r.get("created_by"),
        dibaca_count: dibacaCount,
      };
    });

    data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("GET /api/surat error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const judul = formData.get("judul") as string;
    const jenis = formData.get("jenis") as string;
    const isi = formData.get("isi") as string;
    const penerima = formData.get("penerima") as string || "all";
    const fileUpload = formData.get("file") as File | null;

    if (!judul || !jenis) {
      return NextResponse.json({ error: "Judul dan jenis surat wajib diisi" }, { status: 400 });
    }

    let file_url = "";
    if (fileUpload && fileUpload.size > 0) {
      // Upload ke Cloudinary sebagai raw file
      const { default: cloudinary } = await import("@/lib/cloudinary");
      const buffer = Buffer.from(await fileUpload.arrayBuffer());
      const uploadResult = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "kkm-talang/surat", resource_type: "raw" },
          (error, result) => { if (error) reject(error); else resolve(result); }
        ).end(buffer);
      });
      file_url = uploadResult.secure_url;
    }

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID!;
    const sheet = await getOrCreateGoogleSheet(spreadsheetId, "Surat", SURAT_HEADERS);

    // Generate nomor surat otomatis: NNN/KKG-TALANG/BULAN_ROMAWI/TAHUN
    const ROMAN_MONTHS = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = ROMAN_MONTHS[now.getMonth()];
    const existingRows = await sheet.getRows();
    const sameYearCount = existingRows.filter(r => {
      const d = r.get("created_at");
      return d && new Date(d).getFullYear() === currentYear;
    }).length;
    const nomorUrut = String(sameYearCount + 1).padStart(3, "0");
    const nomorSurat = `${nomorUrut}/KKG-TALANG/${currentMonth}/${currentYear}`;

    const newId = `surat-${Date.now()}`;
    await sheet.addRow({
      id: newId,
      nomor_surat: nomorSurat,
      judul,
      jenis,
      isi: isi || "",
      file_url,
      penerima,
      created_at: now.toISOString(),
      created_by: session.user?.name || "Admin",
    });

    return NextResponse.json({ message: "Surat berhasil dibuat", id: newId, nomor_surat: nomorSurat }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/surat error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
