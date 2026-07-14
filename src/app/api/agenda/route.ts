import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrCreateGoogleSheet } from "@/lib/google-sheets";

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
const AGENDA_COLUMNS = ["id", "title", "date", "time", "location", "description", "status", "created_at"];

export async function GET() {
  try {
    if (!SPREADSHEET_ID) throw new Error("Missing SPREADSHEET_ID");
    
    const sheet = await getOrCreateGoogleSheet(SPREADSHEET_ID, "Agenda", AGENDA_COLUMNS);
    const rows = await sheet.getRows();
    
    const data = rows.map(r => ({
      id: r.get("id"),
      title: r.get("title"),
      date: r.get("date"),
      time: r.get("time"),
      location: r.get("location"),
      description: r.get("description"),
      status: r.get("status"),
      created_at: r.get("created_at"),
    }));

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, date, time, location, description, status } = body;
    
    if (!title || !date) {
      return NextResponse.json({ error: "Judul dan Tanggal wajib diisi" }, { status: 400 });
    }

    if (!SPREADSHEET_ID) throw new Error("Missing SPREADSHEET_ID");
    
    const sheet = await getOrCreateGoogleSheet(SPREADSHEET_ID, "Agenda", AGENDA_COLUMNS);
    
    const newRow = {
      id: Date.now().toString(),
      title,
      date,
      time: time || "",
      location: location || "",
      description: description || "",
      status: status || "Upcoming",
      created_at: new Date().toISOString(),
    };

    await sheet.addRow(newRow);

    return NextResponse.json({ message: "Berhasil menambahkan agenda", data: newRow });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
