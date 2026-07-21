import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const data = await prisma.unduhan.findMany({
      orderBy: { created_at: "desc" }
    });

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { title, url, icon_type } = body;

    if (!title || !url) return NextResponse.json({ error: "Judul dan URL wajib diisi" }, { status: 400 });

    await prisma.unduhan.create({
      data: {
        title,
        url,
        icon_type: icon_type || 'default'
      }
    });

    return NextResponse.json({ success: true, message: "Unduhan berhasil ditambahkan" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
