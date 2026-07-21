import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const guru = await prisma.guru.findUnique({ where: { id } });
    if (!guru) return NextResponse.json({ error: "Data guru tidak ditemukan" }, { status: 404 });

    const role = (session.user as any).role;
    const madrasahId = (session.user as any).madrasahId;
    if (role === "madrasah" && guru.madrasah_id !== madrasahId) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    return NextResponse.json(guru);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const existing = await prisma.guru.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Data guru tidak ditemukan" }, { status: 404 });

    const role = (session.user as any).role;
    const madrasahId = (session.user as any).madrasahId;
    if (role === "madrasah" && existing.madrasah_id !== madrasahId) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const body = await req.json();
    
    await prisma.guru.update({
      where: { id },
      data: {
        nama: body.nama ?? existing.nama,
        gelar_depan: body.gelar_depan ?? existing.gelar_depan,
        gelar_belakang: body.gelar_belakang ?? existing.gelar_belakang,
        nuptk: body.nuptk ?? existing.nuptk,
        peg_id: body.peg_id ?? existing.peg_id,
        nip: body.nip ?? existing.nip,
        tempat_lahir: body.tempat_lahir ?? existing.tempat_lahir,
        tanggal_lahir: body.tanggal_lahir ?? existing.tanggal_lahir,
        jenis_kelamin: body.jenis_kelamin ?? existing.jenis_kelamin,
        jabatan: body.jabatan ?? existing.jabatan,
        status_kepegawaian: body.status_kepegawaian ?? existing.status_kepegawaian,
        pendidikan_terakhir: body.pendidikan_terakhir ?? existing.pendidikan_terakhir,
        bidang_studi: body.bidang_studi ?? existing.bidang_studi,
        no_hp: body.no_hp ?? existing.no_hp,
        email: body.email ?? existing.email,
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

    const existing = await prisma.guru.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Data guru tidak ditemukan" }, { status: 404 });

    const role = (session.user as any).role;
    const madrasahId = (session.user as any).madrasahId;
    if (role === "madrasah" && existing.madrasah_id !== madrasahId) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    await prisma.guru.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
