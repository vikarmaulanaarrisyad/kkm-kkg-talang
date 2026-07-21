import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const surats = await prisma.surat.findMany({
      orderBy: { created_at: "desc" }
    });

    const readCounts = await prisma.suratBaca.groupBy({
      by: ['surat_id'],
      _count: { surat_id: true }
    });

    const readCountMap = new Map(readCounts.map(rc => [rc.surat_id, rc._count.surat_id]));

    const data = surats.map(s => ({
      ...s,
      dibaca_count: readCountMap.get(s.id) || 0,
    }));

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

    // Generate nomor surat otomatis: NNN/KKG-TALANG/BULAN_ROMAWI/TAHUN
    const ROMAN_MONTHS = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = ROMAN_MONTHS[now.getMonth()];
    
    // Count existing this year
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear + 1, 0, 1);
    
    const sameYearCount = await prisma.surat.count({
      where: {
        created_at: {
          gte: startOfYear,
          lt: endOfYear
        }
      }
    });

    const nomorUrut = String(sameYearCount + 1).padStart(3, "0");
    const nomorSurat = `${nomorUrut}/KKG-TALANG/${currentMonth}/${currentYear}`;

    const newSurat = await prisma.surat.create({
      data: {
        nomor_surat: nomorSurat,
        judul,
        jenis,
        isi: isi || null,
        file_url: file_url || null,
        penerima,
        created_by: session.user?.name || "Admin",
      }
    });

    return NextResponse.json({ message: "Surat berhasil dibuat", id: newSurat.id, nomor_surat: nomorSurat }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/surat error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
