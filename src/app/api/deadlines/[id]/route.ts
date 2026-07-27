import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    const { title, description, date, category } = await request.json();

    if (!title || !date) {
      return NextResponse.json({ error: "Judul dan tanggal wajib diisi" }, { status: 400 });
    }

    const updatedDeadline = await (prisma as any).deadline.update({
      where: { id },
      data: {
        title,
        description,
        date: new Date(date),
        category: category || "Umum"
      }
    });

    return NextResponse.json({ success: true, data: updatedDeadline });
  } catch (error) {
    console.error("Gagal mengubah Deadline:", error);
    return NextResponse.json({ error: "Terjadi kesalahan sistem" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;

    await (prisma as any).deadline.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Gagal menghapus Deadline:", error);
    return NextResponse.json({ error: "Terjadi kesalahan sistem" }, { status: 500 });
  }
}
