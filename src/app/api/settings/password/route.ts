import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrCreateGoogleSheet } from "@/lib/google-sheets";
import bcrypt from "bcryptjs";

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

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!spreadsheetId) {
      return NextResponse.json({ error: "Spreadsheet ID not configured" }, { status: 500 });
    }

    const sheet = await getOrCreateGoogleSheet(spreadsheetId, "Users");
    const rows = await sheet.getRows();

    // In auth.ts, session.user.email is set to user's username
    const username = session.user.email;
    const userRow = rows.find(row => row.get("username") === username);

    if (!userRow) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    const storedHash = userRow.get("password_hash");
    
    // Verifikasi password lama
    const isPasswordValid = await bcrypt.compare(currentPassword, storedHash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Sandi saat ini salah" }, { status: 401 });
    }

    // Enkripsi password baru
    const newHash = await bcrypt.hash(newPassword, 10);
    userRow.assign({ password_hash: newHash });
    await userRow.save();

    return NextResponse.json({ success: true, message: "Kata sandi berhasil diperbarui" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
