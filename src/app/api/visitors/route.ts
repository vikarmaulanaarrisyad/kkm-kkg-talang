import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const VISITOR_KEY = "visitor_count";

export async function GET() {
  try {
    const setting = await prisma.visitor.findUnique({
      where: { key: VISITOR_KEY }
    }).catch(async () => {
      // Fallback if Visitor model is empty or using Setting model instead?
      // Wait, in schema.prisma Visitor has id as @id, but no unique on key?
      // Ah, wait! The Visitor table has id @id, key String. Is key unique?
      // It's not unique in schema.prisma. Let's just use findFirst.
      return null;
    });

    const visitor = await prisma.visitor.findFirst({
      where: { key: VISITOR_KEY }
    });

    const count = visitor ? parseInt(visitor.value || "0", 10) : 0;

    return NextResponse.json({ count });
  } catch (e: any) {
    return NextResponse.json({ count: 0 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const visitor = await prisma.visitor.findFirst({
      where: { key: VISITOR_KEY }
    });

    let newCount = 1;
    if (visitor) {
      newCount = parseInt(visitor.value || "0", 10) + 1;
      await prisma.visitor.update({
        where: { id: visitor.id },
        data: { value: String(newCount) }
      });
    } else {
      await prisma.visitor.create({
        data: {
          key: VISITOR_KEY,
          value: "1"
        }
      });
    }

    return NextResponse.json({ count: newCount });
  } catch (e: any) {
    return NextResponse.json({ count: 0 });
  }
}
