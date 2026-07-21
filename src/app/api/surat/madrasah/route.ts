import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "madrasah") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const madrasahId = (session.user as any).id || session.user?.email || "";

    const [allSurats, myBacas] = await Promise.all([
      prisma.surat.findMany({ orderBy: { created_at: "desc" } }),
      prisma.suratBaca.findMany({ where: { madrasah_id: madrasahId } })
    ]);

    const myBacaIds = new Set(myBacas.map(b => b.surat_id));

    // Filter: surat untuk all atau khusus madrasah ini
    const mySurats = allSurats
      .filter(r => {
        const penerima = r.penerima || "all";
        return penerima === "all" || penerima === madrasahId || penerima.split(",").includes(madrasahId);
      })
      .map(r => ({
        id: r.id,
        nomor_surat: r.nomor_surat || "",
        judul: r.judul,
        jenis: r.jenis,
        isi: r.isi,
        file_url: r.file_url,
        created_at: r.created_at,
        created_by: r.created_by,
        sudah_dibaca: myBacaIds.has(r.id),
      }));

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

    const alreadyRead = await prisma.suratBaca.findFirst({
      where: {
        surat_id: surat_id,
        madrasah_id: madrasahId
      }
    });

    if (!alreadyRead) {
      await prisma.suratBaca.create({
        data: {
          surat_id,
          madrasah_id: madrasahId,
        }
      });
    }

    return NextResponse.json({ message: "Surat ditandai sudah dibaca" });
  } catch (error: any) {
    console.error("PUT /api/surat/madrasah error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
