import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.agenda.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Agenda tidak ditemukan" }, { status: 404 });
    }

    await prisma.agenda.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title : undefined,
        date: body.date !== undefined ? body.date : undefined,
        time: body.time !== undefined ? body.time : undefined,
        location: body.location !== undefined ? body.location : undefined,
        status: body.status !== undefined ? body.status : undefined,
      }
    });

    return NextResponse.json({ message: "Agenda berhasil diupdate" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.agenda.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Agenda tidak ditemukan" }, { status: 404 });
    }

    await prisma.agenda.delete({ where: { id } });

    return NextResponse.json({ message: "Agenda berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
