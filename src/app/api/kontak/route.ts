import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nama, email, subjek, pesan } = body;

    if (!nama || !email || !subjek || !pesan) {
      return NextResponse.json(
        { error: "Semua kolom harus diisi" },
        { status: 400 }
      );
    }

    const newKontak = await prisma.kontak.create({
      data: {
        nama,
        email,
        subjek,
        pesan
      }
    });

    return NextResponse.json(
      { message: "Pesan berhasil dikirim", id: newKontak.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("API Kontak Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses permintaan" },
      { status: 500 }
    );
  }
}
