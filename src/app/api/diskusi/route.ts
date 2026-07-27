import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const topics = await prisma.diskusiTopic.findMany({
      orderBy: { updated_at: 'desc' },
      include: {
        _count: {
          select: { replies: true }
        }
      }
    });

    return NextResponse.json({ data: topics });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { title, content } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: "Judul dan konten wajib diisi" }, { status: 400 });
    }

    const topic = await prisma.diskusiTopic.create({
      data: {
        title,
        content,
        author_id: (session.user as any).id,
        author_name: session.user?.name || 'Unknown',
        author_role: (session.user as any).role || 'user',
      }
    });

    return NextResponse.json({ success: true, data: topic });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
