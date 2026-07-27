import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidateTag } from "next/cache";

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    let whereClause = {};
    if (category && category !== 'Semua') {
      whereClause = { category };
    }

    const sops = await (prisma as any).wikiSOP.findMany({
      where: whereClause,
      orderBy: { updated_at: 'desc' }
    });
    
    return NextResponse.json({ data: sops });
  } catch (error) {
    console.error("Gagal mengambil Wiki SOP:", error);
    return NextResponse.json({ error: "Terjadi kesalahan sistem" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, content, category } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: "Judul dan konten wajib diisi" }, { status: 400 });
    }

    let slug = generateSlug(title);
    
    // Check if slug exists
    const existing = await (prisma as any).wikiSOP.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const newSop = await (prisma as any).wikiSOP.create({
      data: {
        title,
        slug,
        content,
        category: category || "Umum",
        author_id: (session.user as any).id,
        author_name: session.user.name || "Admin",
      }
    });

    revalidateTag('wiki');

    return NextResponse.json({ success: true, data: newSop });
  } catch (error) {
    console.error("Gagal menambah Wiki SOP:", error);
    return NextResponse.json({ error: "Terjadi kesalahan sistem" }, { status: 500 });
  }
}
