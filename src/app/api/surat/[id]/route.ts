import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const surat = await prisma.surat.findUnique({ where: { id: resolvedParams.id } });
    if (!surat) return NextResponse.json({ error: "Surat tidak ditemukan" }, { status: 404 });

    return NextResponse.json(surat);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.surat.findUnique({ where: { id: resolvedParams.id } });
    if (!existing) return NextResponse.json({ error: "Surat tidak ditemukan" }, { status: 404 });

    // Delete file from Cloudinary if exists
    const fileUrl = existing.file_url;
    if (fileUrl && fileUrl.includes("cloudinary.com")) {
      try {
        const { default: cloudinary } = await import("@/lib/cloudinary");
        const parts = fileUrl.split('/upload/');
        if (parts.length >= 2) {
          const publicId = parts[1].replace(/\.[^.]+$/, '');
          await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
        }
      } catch (e) {
        console.error("Failed to delete file from Cloudinary:", e);
      }
    }

    await prisma.surat.delete({ where: { id: resolvedParams.id } });

    // Note: surat_bacas are deleted automatically due to Prisma relation if onDelete: Cascade is configured,
    // but in schema.prisma it's not explicitly Cascade, wait, let me just manually delete.
    await prisma.suratBaca.deleteMany({ where: { surat_id: resolvedParams.id } });

    return NextResponse.json({ message: "Surat berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
