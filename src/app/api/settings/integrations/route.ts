import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrCreateGoogleSheet } from "@/lib/google-sheets";
import cloudinary from "@/lib/cloudinary";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const integrations = {
      googleSheets: {
        status: "disconnected",
        details: "Kredensial tidak ditemukan",
      },
      cloudinary: {
        status: "disconnected",
        details: "Kredensial tidak ditemukan",
      },
      googleDrive: {
        status: "disconnected",
        details: "Folder ID belum dikonfigurasi",
      }
    };

    // 1. Check Google Sheets
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    const serviceEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    if (spreadsheetId && serviceEmail) {
      try {
        await getOrCreateGoogleSheet(spreadsheetId, "Settings");
        const maskedId = spreadsheetId.substring(0, 8) + "..." + spreadsheetId.substring(spreadsheetId.length - 8);
        integrations.googleSheets.status = "connected";
        integrations.googleSheets.details = `Terhubung ke ID: ${maskedId}`;
      } catch (error: any) {
        integrations.googleSheets.status = "error";
        integrations.googleSheets.details = error.message || "Gagal menghubungi API Google Sheets";
      }
    }

    // 2. Check Cloudinary
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const cloudApiKey = process.env.CLOUDINARY_API_KEY;
    if (cloudName && cloudApiKey) {
      try {
        await cloudinary.api.ping();
        integrations.cloudinary.status = "connected";
        integrations.cloudinary.details = `Terhubung ke Cloud: ${cloudName}`;
      } catch (error: any) {
        integrations.cloudinary.status = "error";
        integrations.cloudinary.details = "Gagal memverifikasi API Cloudinary";
      }
    }

    // 3. Check Google Drive (Placeholder / Optional)
    // Walaupun menggunakan service account yang sama dengan Sheets, biasanya butuh Folder ID khusus
    const driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    if (driveFolderId && serviceEmail) {
      integrations.googleDrive.status = "connected";
      integrations.googleDrive.details = `Terhubung ke Folder ID: ${driveFolderId.substring(0, 5)}...`;
    } else if (serviceEmail) {
      integrations.googleDrive.status = "pending";
      integrations.googleDrive.details = "Service Account tersedia, tapi Folder ID kosong";
    }

    return NextResponse.json({ success: true, data: integrations });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
