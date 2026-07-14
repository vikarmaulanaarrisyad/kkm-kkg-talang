import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrCreateGoogleSheet } from "@/lib/google-sheets";
import cloudinary from "@/lib/cloudinary";
import { uploadToDrive, deleteFromDrive, extractDriveFileId } from "@/lib/google-drive";
import { addActivityLog } from "@/lib/activity-log";

const SHEET_TITLE = "Pengurus";
const HEADERS = ['id', 'name', 'role', 'image_url', 'order', 'created_at'];

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

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
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
    
    const row = rows.find(r => r.get('id') === id);
    if (!row) {
      return NextResponse.json({ error: "Pengurus tidak ditemukan" }, { status: 404 });
    }

    const imageUrl = row.get('image_url');
    if (imageUrl) {
      try {
        if (imageUrl.includes("drive.google.com")) {
          const fileId = extractDriveFileId(imageUrl);
          if (fileId) await deleteFromDrive(fileId);
        } else {
          const publicId = extractPublicId(imageUrl);
          if (publicId) await cloudinary.uploader.destroy(publicId);
        }
      } catch (e) {
        console.error("Gagal menghapus gambar:", e);
      }
    }

    const name = row.get('name');
    await row.delete();

    await addActivityLog("Menghapus pengurus: " + name, session.user?.name || "Admin");

    return NextResponse.json({ success: true, message: "Pengurus berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!spreadsheetId) {
      return NextResponse.json({ error: "Spreadsheet ID not configured" }, { status: 500 });
    }

    const formData = await req.formData();
    const name = formData.get('name') as string;
    const role = formData.get('role') as string;
    const order = formData.get('order') as string;
    const imageFile = formData.get('image') as File | null;
    const removeImage = formData.get('remove_image') as string;

    const sheet = await getOrCreateGoogleSheet(spreadsheetId, SHEET_TITLE, HEADERS);
    const rows = await sheet.getRows();
    
    const row = rows.find(r => r.get('id') === id);
    if (!row) {
      return NextResponse.json({ error: "Pengurus tidak ditemukan" }, { status: 404 });
    }

    if (name) row.set('name', name);
    if (role) row.set('role', role);
    if (order !== null && order !== undefined) row.set('order', order);

    let currentImageUrl = row.get('image_url');

    if (currentImageUrl && (imageFile || removeImage === "true")) {
      try {
        if (currentImageUrl.includes("drive.google.com")) {
          const fileId = extractDriveFileId(currentImageUrl);
          if (fileId) await deleteFromDrive(fileId);
        } else {
          const publicId = extractPublicId(currentImageUrl);
          if (publicId) await cloudinary.uploader.destroy(publicId);
        }
      } catch (e) {
        console.error("Gagal menghapus gambar lama:", e);
      }

      if (removeImage === "true") {
        currentImageUrl = "";
      }
    }

    if (imageFile && imageFile.size > 0) {
      // Get Storage Provider setting
      let storageProvider = "cloudinary";
      try {
        const settingsSheet = await getOrCreateGoogleSheet(spreadsheetId, "Settings", ["key", "value"]);
        const settingsRows = await settingsSheet.getRows();
        const providerRow = settingsRows.find(r => r.get("key") === "storage_provider");
        if (providerRow && providerRow.get("value")) {
          storageProvider = providerRow.get("value");
        }
      } catch (e) {
        console.error("Gagal membaca pengaturan penyimpanan, menggunakan cloudinary", e);
      }

      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (storageProvider === "google_drive") {
        const result = await uploadToDrive(buffer, imageFile.name, imageFile.type);
        currentImageUrl = result.url;
      } else {
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { 
              folder: "kkm-talang/pengurus",
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
        currentImageUrl = uploadResult.secure_url;
      }
    }

    if (imageFile || removeImage === "true") {
      row.set('image_url', currentImageUrl);
    }

    await row.save();

    await addActivityLog("Memperbarui data pengurus: " + (name || row.get('name')), session.user?.name || "Admin");

    return NextResponse.json({ success: true, message: "Pengurus berhasil diperbarui" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
