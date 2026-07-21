import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const pengurusList = await prisma.pengurus.findMany({
      select: { name: true, role: true }
    });

    let ketua = "KETUA KKG";
    let sekretaris = "SEKRETARIS KKG";

    for (const p of pengurusList) {
      const role = (p.role || "").toLowerCase();
      const name = p.name || "";
      if (role.includes("ketua")) {
        ketua = name;
      } else if (role.includes("sekretaris")) {
        sekretaris = name;
      }
    }

    return NextResponse.json({ ketua, sekretaris });
  } catch (error) {
    console.error("Error fetching signatures:", error);
    return NextResponse.json({ ketua: "KETUA KKG", sekretaris: "SEKRETARIS KKG" });
  }
}
