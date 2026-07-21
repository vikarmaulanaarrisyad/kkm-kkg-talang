import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const kegiatanId = url.searchParams.get("kegiatan_id");
    const guruIdParam = url.searchParams.get("guru_id");
    
    if (!kegiatanId && !guruIdParam) {
      return NextResponse.json({ error: "kegiatan_id or guru_id is required" }, { status: 400 });
    }

    const role = (session.user as any).role;
    const userMadrasahId = (session.user as any).madrasahId;

    let whereClause: any = {};
    if (kegiatanId) {
      whereClause.jadwal_id = kegiatanId;
    }
    
    if (guruIdParam) {
      whereClause.guru_id = guruIdParam === "me" ? (session.user as any)?.id : guruIdParam;
    }

    // Ambil data presensi
    const presensis = await prisma.presensi.findMany({
      where: whereClause,
      orderBy: { waktu_masuk: "desc" }
    });

    // Ambil data guru terkait untuk nama & madrasah_id
    const guruIds = [...new Set(presensis.map((p: any) => p.guru_id))];
    const gurus = await prisma.guru.findMany({
      where: { id: { in: guruIds } },
      select: { id: true, nama: true, madrasah_id: true }
    });
    
    const guruMap = new Map(gurus.map((g: any) => [g.id, g]));

    let data = presensis.map((p: any) => {
      const guru = guruMap.get(p.guru_id);
      return {
        id: p.id,
        kegiatan_id: p.jadwal_id,
        guru_id: p.guru_id,
        nama_guru: guru?.nama || "Guru",
        madrasah_id: guru?.madrasah_id || "",
        waktu_hadir: p.waktu_masuk,
        status: p.status,
      };
    });

    // Filter by madrasah_id if role is madrasah and searching by kegiatan
    if (role === "madrasah" && !guruIdParam) {
      data = data.filter((d: any) => d.madrasah_id === userMadrasahId);
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "guru") {
      return NextResponse.json({ error: "Hanya Guru yang dapat melakukan presensi" }, { status: 403 });
    }

    const body = await req.json();
    const { kegiatan_id } = body;

    if (!kegiatan_id) {
      return NextResponse.json({ error: "QR Code tidak valid (kegiatan_id hilang)" }, { status: 400 });
    }

    const kegiatanInfo = await prisma.kegiatan.findUnique({ where: { id: kegiatan_id } });
    if (!kegiatanInfo) {
      return NextResponse.json({ error: "Kegiatan tidak ditemukan" }, { status: 404 });
    }
    
    const status = kegiatanInfo.status;
    if (status === "waiting") {
      return NextResponse.json({ error: "Sesi presensi belum dibuka oleh Admin KKG" }, { status: 400 });
    }
    if (status === "completed") {
      return NextResponse.json({ error: "Sesi presensi untuk kegiatan ini sudah ditutup" }, { status: 400 });
    }
    if (status !== "active") {
      return NextResponse.json({ error: "Sesi presensi tidak aktif" }, { status: 400 });
    }

    const guruId = String((session.user as any).id);
    
    const sudahHadir = await prisma.presensi.findFirst({
      where: {
        jadwal_id: kegiatan_id,
        guru_id: guruId
      }
    });

    if (sudahHadir) {
      return NextResponse.json({ error: "Anda sudah melakukan presensi untuk kegiatan ini" }, { status: 400 });
    }

    const newPresensi = await prisma.presensi.create({
      data: {
        guru_id: guruId,
        jadwal_id: kegiatan_id,
        waktu_masuk: new Date(),
        status: "Hadir"
      }
    });

    return NextResponse.json({ message: "Presensi berhasil dicatat!", id: newPresensi.id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
