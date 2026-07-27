import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    
    const topic = await prisma.diskusiTopic.findUnique({
      where: { id },
      include: {
        replies: {
          orderBy: { created_at: 'asc' }
        }
      }
    });

    if (!topic) return NextResponse.json({ error: "Topik diskusi tidak ditemukan" }, { status: 404 });

    return NextResponse.json({ data: topic });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "Konten balasan wajib diisi" }, { status: 400 });
    }

    const reply = await prisma.diskusiReply.create({
      data: {
        topic_id: id,
        content,
        author_id: (session.user as any).id,
        author_name: session.user?.name || 'Unknown',
        author_role: (session.user as any).role || 'user',
      }
    });

    // Update the topic's updated_at timestamp so it bubbles up to the top
    await prisma.diskusiTopic.update({
      where: { id },
      data: { updated_at: new Date() }
    });

    return NextResponse.json({ success: true, data: reply });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    if ((session.user as any).role !== 'admin') {
      return NextResponse.json({ error: "Hanya admin yang dapat menghapus diskusi" }, { status: 403 });
    }

    const { id } = await params;

    await prisma.diskusiTopic.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Diskusi berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
