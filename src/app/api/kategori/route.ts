import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const data = await prisma.kategori.findMany();
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
    const { name } = body;

    if (!name) return NextResponse.json({ error: "Nama kategori wajib diisi" }, { status: 400 });

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const existing = await prisma.kategori.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Kategori sudah ada" }, { status: 400 });
    }

    await prisma.kategori.create({
      data: {
        name,
        slug
      }
    });

    return NextResponse.json({ success: true, message: "Kategori berhasil ditambahkan" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
