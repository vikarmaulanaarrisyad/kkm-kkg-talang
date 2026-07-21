import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const existing = await prisma.unduhan.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Data unduhan tidak ditemukan" }, { status: 404 });

    await prisma.unduhan.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Unduhan berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { title, url, icon_type } = body;

    const existing = await prisma.unduhan.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Data unduhan tidak ditemukan" }, { status: 404 });

    await prisma.unduhan.update({
      where: { id },
      data: {
        title: title || existing.title,
        url: url || existing.url,
        icon_type: icon_type || existing.icon_type,
      }
    });

    return NextResponse.json({ success: true, message: "Unduhan berhasil diperbarui" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
