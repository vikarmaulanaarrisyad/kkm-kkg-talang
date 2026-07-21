import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const kategori = searchParams.get("kategori");

    let whereClause: any = {};
    if (kategori) {
      whereClause.kategori = kategori;
    }

    const data = await prisma.masterData.findMany({
      where: whereClause,
      orderBy: { created_at: "asc" }
    });

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { kategori, nama_nilai } = await req.json();
    if (!kategori || !nama_nilai) {
      return NextResponse.json({ error: "Kategori dan nama_nilai wajib diisi" }, { status: 400 });
    }

    const newMasterData = await prisma.masterData.create({
      data: {
        kategori,
        nama_nilai
      }
    });

    return NextResponse.json({ message: "Berhasil menambahkan master data", data: newMasterData });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
