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
    const filterMadrasahId = url.searchParams.get("madrasah_id");

    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const search = url.searchParams.get("search") || "";
    const isPaginated = url.searchParams.get("paginated") === "true";

    let whereClause: any = {};
    if (role === "madrasah") {
      whereClause.madrasah_id = madrasahId;
    } else if (role === "admin" && filterMadrasahId) {
      whereClause.madrasah_id = filterMadrasahId;
    }

    if (search) {
      whereClause.OR = [
        { nama: { contains: search, mode: "insensitive" } },
        { nuptk: { contains: search, mode: "insensitive" } },
        { nip: { contains: search, mode: "insensitive" } },
        { peg_id: { contains: search, mode: "insensitive" } }
      ];
    }

    if (isPaginated) {
      const skip = (page - 1) * limit;
      const [data, total] = await Promise.all([
        prisma.guru.findMany({
          where: whereClause,
          orderBy: { created_at: "desc" },
          skip,
          take: limit
        }),
        prisma.guru.count({ where: whereClause })
      ]);
      
      return NextResponse.json({
        data,
        metadata: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    }

    const data = await prisma.guru.findMany({
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

    const body = await req.json();
    const {
      nama, gelar_depan, gelar_belakang, nuptk, peg_id, nip, tempat_lahir, tanggal_lahir,
      jenis_kelamin, jabatan, status_kepegawaian, pendidikan_terakhir,
      bidang_studi, no_hp, email
    } = body;

    if (!nama) return NextResponse.json({ error: "Nama guru wajib diisi" }, { status: 400 });

    const role = (session.user as any).role;
    const madrasahId = role === "admin" ? body.madrasah_id : (session.user as any).madrasahId;
    if (!madrasahId) return NextResponse.json({ error: "Madrasah ID tidak valid" }, { status: 400 });

    const newGuru = await prisma.guru.create({
      data: {
        madrasah_id: madrasahId,
        nama,
        gelar_depan: gelar_depan || null,
        gelar_belakang: gelar_belakang || null,
        nuptk: nuptk || null,
        peg_id: peg_id || null,
        nip: nip || null,
        tempat_lahir: tempat_lahir || null,
        tanggal_lahir: tanggal_lahir || null,
        jenis_kelamin: jenis_kelamin || null,
        jabatan: jabatan || null,
        status_kepegawaian: status_kepegawaian || null,
        pendidikan_terakhir: pendidikan_terakhir || null,
        bidang_studi: bidang_studi || null,
        no_hp: no_hp || null,
        email: email || null,
      }
    });

    return NextResponse.json({ success: true, id: newGuru.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
