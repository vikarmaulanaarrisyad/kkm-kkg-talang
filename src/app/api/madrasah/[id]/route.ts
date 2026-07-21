import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const madrasah = await prisma.madrasah.findUnique({ where: { id } });
    if (!madrasah) return NextResponse.json({ error: "Madrasah tidak ditemukan" }, { status: 404 });

    return NextResponse.json(madrasah);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { nama, nsm, npsn, alamat, kecamatan, username, password } = body;

    const existing = await prisma.madrasah.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Madrasah tidak ditemukan" }, { status: 404 });

    const updates: any = { 
      nama, 
      nsm: nsm || null, 
      npsn: npsn || null, 
      alamat: alamat || null, 
      kecamatan: kecamatan || null, 
      username 
    };
    
    if (password) {
      updates.password_hash = await bcrypt.hash(password, 12);
    }

    await prisma.madrasah.update({
      where: { id },
      data: updates
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH — Admin: ubah status madrasah (active / rejected)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await req.json();
    if (!["active", "rejected", "pending"].includes(status)) {
      return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
    }

    const existing = await prisma.madrasah.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Madrasah tidak ditemukan" }, { status: 404 });

    await prisma.madrasah.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json({ success: true, status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.madrasah.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Madrasah tidak ditemukan" }, { status: 404 });

    await prisma.madrasah.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
