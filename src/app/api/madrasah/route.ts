import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

// GET — Admin: semua madrasah. Public tidak bisa akses.
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const statusFilter = new URL(req.url).searchParams.get("status");

    const data = await prisma.madrasah.findMany({
      where: statusFilter ? { status: statusFilter } : undefined,
      orderBy: { created_at: "desc" }
    });

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST — PUBLIC: Madrasah mendaftar sendiri, status = "pending"
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nama, nsm, npsn, alamat, kecamatan, username, password } = body;

    if (!nama || !username || !password) {
      return NextResponse.json({ error: "Nama madrasah, username, dan password wajib diisi" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
    }

    // Cek username duplikat
    const exists = await prisma.madrasah.findUnique({ where: { username } });
    if (exists) {
      return NextResponse.json({ error: "Username sudah digunakan, coba username lain" }, { status: 400 });
    }

    const password_hash = await bcrypt.hash(password, 12);

    await prisma.madrasah.create({
      data: {
        nama,
        nsm: nsm || null,
        npsn: npsn || null,
        alamat: alamat || null,
        kecamatan: kecamatan || null,
        username,
        password_hash,
        status: "pending",
      }
    });

    return NextResponse.json({ success: true, message: "Pendaftaran berhasil! Tunggu aktivasi dari Admin KKM & KKG." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
