import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const existing = await prisma.rombel.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Data Rombel tidak ditemukan" }, { status: 404 });

    const role = (session.user as any).role;
    const madrasahId = (session.user as any).madrasahId;
    if (role === "madrasah" && existing.madrasah_id !== madrasahId) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const body = await req.json();
    await prisma.rombel.update({
      where: { id },
      data: {
        tahun_ajaran: body.tahun_ajaran ?? existing.tahun_ajaran,
        nama_rombel: body.nama_rombel ?? existing.nama_rombel,
        siswa_laki: body.siswa_laki !== undefined ? parseInt(body.siswa_laki.toString(), 10) : existing.siswa_laki,
        siswa_perempuan: body.siswa_perempuan !== undefined ? parseInt(body.siswa_perempuan.toString(), 10) : existing.siswa_perempuan,
        wali_kelas_id: body.wali_kelas_id ?? existing.wali_kelas_id,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const existing = await prisma.rombel.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Data Rombel tidak ditemukan" }, { status: 404 });

    const role = (session.user as any).role;
    const madrasahId = (session.user as any).madrasahId;
    if (role === "madrasah" && existing.madrasah_id !== madrasahId) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    await prisma.rombel.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
