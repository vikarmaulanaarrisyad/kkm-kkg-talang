import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const slug = params.slug;
    const sop = await (prisma as any).wikiSOP.findUnique({
      where: { slug }
    });
    
    if (!sop) {
      return NextResponse.json({ error: "SOP tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ data: sop });
  } catch (error) {
    console.error("Gagal mengambil detail Wiki SOP:", error);
    return NextResponse.json({ error: "Terjadi kesalahan sistem" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const slug = params.slug;
    const { title, content, category } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: "Judul dan konten wajib diisi" }, { status: 400 });
    }

    const updatedSop = await (prisma as any).wikiSOP.update({
      where: { slug },
      data: {
        title,
        content,
        category: category || "Umum",
      }
    });

    revalidatePath('/wiki');
    revalidatePath(`/wiki/${slug}`);

    return NextResponse.json({ success: true, data: updatedSop });
  } catch (error) {
    console.error("Gagal mengubah Wiki SOP:", error);
    return NextResponse.json({ error: "Terjadi kesalahan sistem" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const slug = params.slug;

    await (prisma as any).wikiSOP.delete({
      where: { slug }
    });

    revalidatePath('/wiki');
    revalidatePath(`/wiki/${slug}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Gagal menghapus Wiki SOP:", error);
    return NextResponse.json({ error: "Terjadi kesalahan sistem" }, { status: 500 });
  }
}
