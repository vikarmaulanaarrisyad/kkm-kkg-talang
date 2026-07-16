import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrCreateGoogleSheet } from "@/lib/google-sheets";

const SHEET_TITLE = "Testimoni";
const HEADERS = ["id", "name", "role", "quote", "image_url", "status", "created_at"];

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!spreadsheetId) return NextResponse.json({ error: "Spreadsheet ID not configured" }, { status: 500 });

    const body = await req.json();
    const { quote } = body;

    if (!quote || quote.trim().length < 10) {
      return NextResponse.json({ error: "Testimoni terlalu singkat (minimal 10 karakter)." }, { status: 400 });
    }

    const name = session.user?.name || "Guru Madrasah";
    
    // Assign a default role or specific role if available
    const role = (session.user as any).role === "guru" ? "Guru Madrasah" : "Pengurus";
    
    // Generate a default avatar
    const image_url = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=fff&size=150`;

    const sheet = await getOrCreateGoogleSheet(spreadsheetId, SHEET_TITLE, HEADERS);
    const id = Date.now().toString();

    await sheet.addRow({
      id,
      name,
      role,
      quote: quote.trim(),
      image_url,
      status: "Approved", // Defaulting to Approved for immediate visibility as requested
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error("Testimoni error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
