import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await prisma.tahunAjaran.findMany({
      orderBy: { created_at: "asc" }
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
    
    if ((session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { nama_tahun, semester } = body;

    if (!nama_tahun || !semester) {
      return NextResponse.json({ error: "Nama Tahun dan Semester wajib diisi" }, { status: 400 });
    }

    const exists = await prisma.tahunAjaran.findFirst({
      where: {
        nama_tahun,
        semester
      }
    });

    if (exists) {
      return NextResponse.json({ error: "Tahun Ajaran dan Semester ini sudah ada" }, { status: 400 });
    }

    const newTahunAjaran = await prisma.tahunAjaran.create({
      data: {
        nama_tahun,
        semester
      }
    });

    return NextResponse.json({ success: true, id: newTahunAjaran.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
