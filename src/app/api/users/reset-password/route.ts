import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { guru_id, action, request_id } = body;
    // action: "approve", "reject", "direct_reset"

    if (!guru_id) return NextResponse.json({ error: "ID Guru wajib diisi" }, { status: 400 });

    const guruRow = await prisma.guru.findUnique({ where: { id: guru_id } });

    if (!guruRow) {
      return NextResponse.json({ error: "Data Guru tidak ditemukan" }, { status: 404 });
    }

    if (action === "approve" || action === "direct_reset") {
      const defaultPassword = "123456";
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      
      await prisma.guru.update({
        where: { id: guru_id },
        data: { password_hash: hashedPassword }
      });
    }

    // Jika ini dari request, update status request
    if (request_id) {
      await prisma.permintaanReset.update({
        where: { id: request_id },
        data: {
          status: action === "approve" ? "approved" : "rejected",
          resolved_at: new Date()
        }
      });
    }

    return NextResponse.json({ success: true, message: action === "reject" ? "Pengajuan ditolak" : "Password berhasil direset ke 123456" });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
