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

    let whereClause: any = {};
    if (role === "admin") {
      whereClause.status = "pending";
    } else {
      whereClause.madrasah_id = madrasahId;
    }

    const requests = await prisma.permintaanReset.findMany({
      where: whereClause,
      orderBy: { requested_at: "desc" }
    });

    // fetch guru names
    const guruIds = [...new Set(requests.map(r => r.guru_id))];
    const gurus = await prisma.guru.findMany({
      where: { id: { in: guruIds } },
      select: { id: true, nama: true }
    });
    const guruMap = new Map(gurus.map(g => [g.id, g.nama]));

    const data = requests.map(r => ({
      id: r.id,
      madrasah_id: r.madrasah_id,
      guru_id: r.guru_id,
      nama_guru: guruMap.get(r.guru_id) || "Guru",
      status: r.status,
      requested_at: r.requested_at,
      resolved_at: r.resolved_at,
    }));

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "madrasah") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { guru_id, nama_guru } = await req.json();
    if (!guru_id || !nama_guru) return NextResponse.json({ error: "Missing data" }, { status: 400 });

    const madrasahId = (session.user as any).madrasahId;
    
    // Check if there is already a pending request
    const existing = await prisma.permintaanReset.findFirst({
      where: {
        guru_id,
        status: "pending"
      }
    });

    if (existing) {
      return NextResponse.json({ error: "Pengajuan reset untuk guru ini sudah ada dan sedang menunggu persetujuan." }, { status: 400 });
    }

    const newRequest = await prisma.permintaanReset.create({
      data: {
        madrasah_id: madrasahId,
        guru_id,
        status: "pending",
        requested_at: new Date()
      }
    });

    return NextResponse.json({ success: true, id: newRequest.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
