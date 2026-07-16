import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrCreateGoogleSheet } from "@/lib/google-sheets";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!spreadsheetId) return NextResponse.json({ error: "Spreadsheet ID not configured" }, { status: 500 });

    const body = await req.json();
    const { guru_id, action, request_id } = body;
    // action: "approve", "reject", "direct_reset"

    if (!guru_id) return NextResponse.json({ error: "ID Guru wajib diisi" }, { status: 400 });

    const guruSheet = await getOrCreateGoogleSheet(spreadsheetId, "Guru");
    const guruRows = await guruSheet.getRows();
    const guruRow = guruRows.find(r => r.get("id") === guru_id);

    if (!guruRow) {
      return NextResponse.json({ error: "Data Guru tidak ditemukan" }, { status: 404 });
    }

    if (action === "approve" || action === "direct_reset") {
      const defaultPassword = "123456";
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      
      guruRow.set("password_hash", hashedPassword);
      await guruRow.save();
    }

    // Jika ini dari request, update status request
    if (request_id) {
      const reqSheet = await getOrCreateGoogleSheet(spreadsheetId, "Permintaan_Reset");
      const reqRows = await reqSheet.getRows();
      const requestRow = reqRows.find(r => r.get("id") === request_id);
      
      if (requestRow) {
        requestRow.set("status", action === "approve" ? "approved" : "rejected");
        requestRow.set("resolved_at", new Date().toISOString());
        await requestRow.save();
      }
    }

    return NextResponse.json({ success: true, message: action === "reject" ? "Pengajuan ditolak" : "Password berhasil direset ke 123456" });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
