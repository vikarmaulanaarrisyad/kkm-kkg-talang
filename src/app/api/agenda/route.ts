import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const data = await prisma.agenda.findMany({
      orderBy: { date: 'asc' }
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

    const body = await req.json();
    const { title, date, time, location, status } = body;
    
    if (!title || !date) {
      return NextResponse.json({ error: "Judul dan Tanggal wajib diisi" }, { status: 400 });
    }
    
    const newAgenda = await prisma.agenda.create({
      data: {
        title,
        date,
        time: time || null,
        location: location || null,
        status: status || "upcoming"
      }
    });

    return NextResponse.json({ message: "Berhasil menambahkan agenda", data: newAgenda });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
