import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrCreateGoogleSheet } from "@/lib/google-sheets";

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
const AGENDA_COLUMNS = ["id", "title", "date", "time", "location", "description", "status", "created_at"];

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    if (!SPREADSHEET_ID) throw new Error("Missing SPREADSHEET_ID");
    
    const sheet = await getOrCreateGoogleSheet(SPREADSHEET_ID, "Agenda", AGENDA_COLUMNS);
    const rows = await sheet.getRows();
    
    const rowIndex = rows.findIndex(r => r.get("id") === id);
    if (rowIndex === -1) {
      return NextResponse.json({ error: "Agenda tidak ditemukan" }, { status: 404 });
    }

    const row = rows[rowIndex];
    if (body.title) row.set("title", body.title);
    if (body.date) row.set("date", body.date);
    if (body.time !== undefined) row.set("time", body.time);
    if (body.location !== undefined) row.set("location", body.location);
    if (body.description !== undefined) row.set("description", body.description);
    if (body.status) row.set("status", body.status);

    await row.save();

    return NextResponse.json({ message: "Agenda berhasil diupdate" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!SPREADSHEET_ID) throw new Error("Missing SPREADSHEET_ID");
    
    const sheet = await getOrCreateGoogleSheet(SPREADSHEET_ID, "Agenda", AGENDA_COLUMNS);
    const rows = await sheet.getRows();
    
    const rowIndex = rows.findIndex(r => r.get("id") === id);
    if (rowIndex === -1) {
      return NextResponse.json({ error: "Agenda tidak ditemukan" }, { status: 404 });
    }

    await rows[rowIndex].delete();

    return NextResponse.json({ message: "Agenda berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
