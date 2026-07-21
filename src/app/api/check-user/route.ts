import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json({ error: "Username wajib diisi" }, { status: 400 });
    }

    let found = false;
    let role = "";
    let adminPhone = "";

    // 1. Cek Admin
    const adminUser = await prisma.user.findFirst();
    if (adminUser) {
      // Admin tidak ada no_wa di Prisma saat ini, kita bisa gunakan fallback
      adminPhone = "+6281234567890";
    }

    const checkAdmin = await prisma.user.findUnique({ where: { username } });
    if (checkAdmin) {
      found = true;
      role = "admin";
    }

    // 2. Cek Madrasah
    if (!found) {
      const checkMadrasah = await prisma.madrasah.findUnique({ where: { username } });
      if (checkMadrasah) {
        found = true;
        role = "madrasah";
      }
    }

    // 3. Cek Guru
    if (!found) {
      const checkGuru = await prisma.guru.findFirst({
        where: {
          OR: [
            { nip: username },
            { peg_id: username },
            { nuptk: username },
          ]
        }
      });
      if (checkGuru) {
        found = true;
        role = "guru";
      }
    }

    return NextResponse.json({ exists: found, role, adminPhone });
  } catch (error: any) {
    console.error("Check user error:", error);
    return NextResponse.json({ error: "Gagal memverifikasi pengguna" }, { status: 500 });
  }
}
