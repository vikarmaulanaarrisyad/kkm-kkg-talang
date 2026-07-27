import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    // If 'all' is true, return everything (for admin). Otherwise, return only upcoming ones.
    const whereClause = all ? {} : { date: { gte: new Date() } };

    const deadlines = await (prisma as any).deadline.findMany({
      where: whereClause,
      orderBy: { date: 'asc' }
    });
    
    return NextResponse.json({ data: deadlines });
  } catch (error) {
    console.error("Gagal mengambil Deadline:", error);
    return NextResponse.json({ error: "Terjadi kesalahan sistem" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, date, category } = await request.json();

    if (!title || !date) {
      return NextResponse.json({ error: "Judul dan tanggal wajib diisi" }, { status: 400 });
    }

    const newDeadline = await (prisma as any).deadline.create({
      data: {
        title,
        description,
        date: new Date(date),
        category: category || "Umum"
      }
    });

    return NextResponse.json({ success: true, data: newDeadline });
  } catch (error) {
    console.error("Gagal menambah Deadline:", error);
    return NextResponse.json({ error: "Terjadi kesalahan sistem" }, { status: 500 });
  }
}
