import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const integrations = {
      database: {
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

    // 1. Check Database (PostgreSQL)
    try {
      await prisma.$queryRaw`SELECT 1`;
      integrations.database.status = "connected";
      integrations.database.details = `Terhubung ke Database PostgreSQL`;
    } catch (error: any) {
      integrations.database.status = "error";
      integrations.database.details = error.message || "Gagal menghubungi Database";
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
    const driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    const serviceEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    if (driveFolderId && serviceEmail) {
      integrations.googleDrive.status = "connected";
      integrations.googleDrive.details = `Terhubung ke Folder ID: ${driveFolderId.substring(0, 5)}...`;
    } else if (serviceEmail) {
      integrations.googleDrive.status = "pending";
      integrations.googleDrive.details = "Service Account tersedia, tapi Folder ID kosong";
    }

    // Map `database` back to `googleSheets` key in response to avoid breaking existing frontend that looks for `googleSheets`
    const legacyResponse = {
      ...integrations,
      googleSheets: integrations.database
    };

    return NextResponse.json({ success: true, data: legacyResponse });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
