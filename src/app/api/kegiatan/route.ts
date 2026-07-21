import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any).role;
    const madrasahName = (session.user as any).name;
    
    let whereClause = {};
    if (role === "madrasah") {
      whereClause = { tempat: madrasahName };
    }

    const data = await prisma.kegiatan.findMany({
      where: whereClause,
      orderBy: { created_at: "desc" }
    });
    
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any).role;
    if (role === "guru") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { nama, jenis, tempat, tanggal, waktu } = body;

    if (!nama || !tanggal) {
      return NextResponse.json({ error: "Nama dan tanggal wajib diisi" }, { status: 400 });
    }

    const newId = `EVT-${Date.now()}`;
    const newKegiatan = await prisma.kegiatan.create({
      data: {
        id: newId,
        nama,
        jenis: jenis || "KKG",
        tempat: tempat || null,
        tanggal,
        waktu: waktu || null,
        status: "waiting",
        created_by: session.user?.name || null,
        madrasah_id: (session.user as any).madrasahId || null,
      }
    });

    return NextResponse.json({ message: "Kegiatan berhasil dibuat", id: newId }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: "ID dan status wajib diisi" }, { status: 400 });
    }

    const existing = await prisma.kegiatan.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Kegiatan tidak ditemukan" }, { status: 404 });
    }

    await prisma.kegiatan.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json({ message: "Status berhasil diupdate" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
