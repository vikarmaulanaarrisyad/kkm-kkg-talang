import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Sandi saat ini dan sandi baru wajib diisi" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Sandi baru minimal 6 karakter" }, { status: 400 });
    }

    const username = session.user.email;
    const userRole = (session.user as any).role;

    if (userRole === "admin") {
      const user = await prisma.user.findUnique({ where: { username } });
      if (!user) return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isPasswordValid) return NextResponse.json({ error: "Sandi saat ini salah" }, { status: 401 });

      const newHash = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { username },
        data: { password_hash: newHash }
      });
    } else if (userRole === "madrasah") {
      const madrasah = await prisma.madrasah.findUnique({ where: { username } });
      if (!madrasah) return NextResponse.json({ error: "Madrasah tidak ditemukan" }, { status: 404 });

      const isPasswordValid = await bcrypt.compare(currentPassword, madrasah.password_hash);
      if (!isPasswordValid) return NextResponse.json({ error: "Sandi saat ini salah" }, { status: 401 });

      const newHash = await bcrypt.hash(newPassword, 10);
      await prisma.madrasah.update({
        where: { username },
        data: { password_hash: newHash }
      });
    } else if (userRole === "guru") {
      const guru = await prisma.guru.findFirst({ where: { nuptk: username } });
      if (!guru) return NextResponse.json({ error: "Guru tidak ditemukan" }, { status: 404 });

      const isPasswordValid = await bcrypt.compare(currentPassword, guru.password_hash || "");
      if (!isPasswordValid) return NextResponse.json({ error: "Sandi saat ini salah" }, { status: 401 });

      const newHash = await bcrypt.hash(newPassword, 10);
      await prisma.guru.update({
        where: { id: guru.id },
        data: { password_hash: newHash }
      });
    } else {
      return NextResponse.json({ error: "Role tidak valid" }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Kata sandi berhasil diperbarui" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
