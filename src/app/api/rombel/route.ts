import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any).role;
    const madrasahId = (session.user as any).madrasahId;
    const url = new URL(req.url);
    const filterTahunAjaran = url.searchParams.get("tahun_ajaran");

    let whereClause: any = {};
    if (role === "madrasah") {
      whereClause.madrasah_id = madrasahId;
    }
    
    if (filterTahunAjaran) {
      whereClause.tahun_ajaran = filterTahunAjaran;
    }

    const data = await prisma.rombel.findMany({
      where: whereClause,
      orderBy: { created_at: "desc" }
    });

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Request body tidak valid" }, { status: 400 });
    }

    const {
      tahun_ajaran, nama_rombel, siswa_laki, siswa_perempuan, wali_kelas_id
    } = body;

    if (!tahun_ajaran || !nama_rombel) {
      return NextResponse.json({ error: "Tahun Ajaran dan Nama Rombel wajib diisi" }, { status: 400 });
    }

    const role = (session.user as any).role;
    const madrasahId = role === "admin" ? body.madrasah_id : (session.user as any).madrasahId;
    if (!madrasahId) return NextResponse.json({ error: "Madrasah ID tidak valid. Pastikan Anda sudah login sebagai madrasah." }, { status: 400 });

    const newRombel = await prisma.rombel.create({
      data: {
        madrasah_id: madrasahId,
        tahun_ajaran,
        nama_rombel,
        siswa_laki: siswa_laki ? parseInt(siswa_laki.toString(), 10) : 0,
        siswa_perempuan: siswa_perempuan ? parseInt(siswa_perempuan.toString(), 10) : 0,
        wali_kelas_id: wali_kelas_id || null,
      }
    });

    return NextResponse.json({ success: true, id: newRombel.id });
  } catch (error: any) {
    console.error("POST /api/rombel error:", error);
    return NextResponse.json({ error: error.message || "Terjadi kesalahan server" }, { status: 500 });
  }
}
