import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrCreateGoogleSheet } from "@/lib/google-sheets";
import cloudinary from "@/lib/cloudinary";
import { uploadToDrive, deleteFromDrive, extractDriveFileId } from "@/lib/google-drive";

const SHEET_TITLE = "Settings";
const HEADERS = ["key", "value"];

function extractPublicId(url: string) {
  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    let path = parts[1];
    if (path.match(/^v\d+\//)) {
      path = path.replace(/^v\d+\//, '');
    }
    return path.substring(0, path.lastIndexOf('.')) || path;
  } catch (e) {
    return null;
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!spreadsheetId) {
      return NextResponse.json({ error: "Spreadsheet ID not configured" }, { status: 500 });
    }

    const sheet = await getOrCreateGoogleSheet(spreadsheetId, SHEET_TITLE, HEADERS);
    const rows = await sheet.getRows();

    const settings: Record<string, string> = {};
    rows.forEach(row => {
      const key = row.get("key");
      const value = row.get("value");
      if (key) {
        settings[key] = value || "";
      }
    });

    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!spreadsheetId) {
      return NextResponse.json({ error: "Spreadsheet ID not configured" }, { status: 500 });
    }

    const formData = await req.formData();
    const site_name = formData.get("site_name") as string;
    const site_url = formData.get("site_url") as string;
    const tahun_ajaran_aktif = formData.get("tahun_ajaran_aktif") as string;
    const storage_provider = formData.get("storage_provider") as string;
    const logoFile = formData.get("site_logo") as File | null;
    const removeLogo = formData.get("remove_logo") as string;

    const profil_tentang = formData.get("profil_tentang") as string;
    const profil_visi = formData.get("profil_visi") as string;
    const profil_misi = formData.get("profil_misi") as string;
    const profil_misi_utama = formData.get("profil_misi_utama") as string;

    const sheet = await getOrCreateGoogleSheet(spreadsheetId, SHEET_TITLE, HEADERS);
    const rows = await sheet.getRows();

    const updateOrCreateRow = async (key: string, value: string) => {
      const row = rows.find(r => r.get("key") === key);
      if (row) {
        row.assign({ value });
        await row.save();
      } else {
        await sheet.addRow({ key, value });
      }
    };

    if (site_name !== null) await updateOrCreateRow("site_name", site_name);
    if (site_url !== null) await updateOrCreateRow("site_url", site_url);
    if (tahun_ajaran_aktif !== null) await updateOrCreateRow("tahun_ajaran_aktif", tahun_ajaran_aktif);
    if (storage_provider) await updateOrCreateRow("storage_provider", storage_provider);
    
    if (profil_tentang !== null) await updateOrCreateRow("profil_tentang", profil_tentang);
    if (profil_visi !== null) await updateOrCreateRow("profil_visi", profil_visi);
    if (profil_misi !== null) await updateOrCreateRow("profil_misi", profil_misi);
    if (profil_misi_utama !== null) await updateOrCreateRow("profil_misi_utama", profil_misi_utama);

    // Get current target provider for logo logic
    const currentProviderRow = rows.find(r => r.get("key") === "storage_provider");
    const targetProvider = storage_provider || (currentProviderRow ? currentProviderRow.get("value") : "cloudinary");

    // Handle Logo
    const logoRow = rows.find(r => r.get("key") === "site_logo");
    let currentLogo = logoRow ? logoRow.get("value") : "";

    if (currentLogo && (logoFile || removeLogo === "true")) {
      if (currentLogo.includes("drive.google.com")) {
        const fileId = extractDriveFileId(currentLogo);
        if (fileId) await deleteFromDrive(fileId);
      } else {
        const publicId = extractPublicId(currentLogo);
        if (publicId) await cloudinary.uploader.destroy(publicId);
      }

      if (removeLogo === "true") {
        currentLogo = "";
      }
    }

    if (logoFile && logoFile.size > 0) {
      const arrayBuffer = await logoFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (targetProvider === "google_drive") {
        const result = await uploadToDrive(buffer, logoFile.name, logoFile.type);
        currentLogo = result.url;
      } else {
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { 
              folder: "kkm-talang/settings",
              transformation: [
                { width: 400, crop: "scale" },
                { quality: "auto", fetch_format: "auto" }
              ]
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(buffer);
        }) as any;
        currentLogo = uploadResult.secure_url;
      }
    }

    if (logoFile || removeLogo === "true") {
      await updateOrCreateRow("site_logo", currentLogo);
    }

    return NextResponse.json({ success: true, message: "Pengaturan berhasil diperbarui" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
