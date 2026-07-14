import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrCreateGoogleSheet } from "@/lib/google-sheets";
import cloudinary from "@/lib/cloudinary";
import { uploadToDrive } from "@/lib/google-drive";
import { addActivityLog } from "@/lib/activity-log";

const SHEET_TITLE = "Pengurus";
const HEADERS = ['id', 'name', 'role', 'image_url', 'order', 'created_at'];

export async function GET() {
  try {
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!spreadsheetId) {
      return NextResponse.json({ error: "Spreadsheet ID not configured" }, { status: 500 });
    }

    const sheet = await getOrCreateGoogleSheet(spreadsheetId, SHEET_TITLE, HEADERS);
    const rows = await sheet.getRows();

    const data = rows.map(row => ({
      id: row.get('id'),
      name: row.get('name'),
      role: row.get('role'),
      image_url: row.get('image_url'),
      order: parseInt(row.get('order') || "99", 10),
      created_at: row.get('created_at'),
    }));

    // Sort by order ascending, then by created_at descending
    data.sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("Error fetching pengurus:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const name = formData.get('name') as string;
    const role = formData.get('role') as string;
    const order = formData.get('order') as string || '99';
    const imageFile = formData.get('image') as File;

    if (!name || !role) {
      return NextResponse.json({ error: "Nama dan jabatan wajib diisi" }, { status: 400 });
    }

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!spreadsheetId) {
      return NextResponse.json({ error: "Spreadsheet ID not configured" }, { status: 500 });
    }

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

    let image_url = "";

    // Upload image if exists
    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (storageProvider === "google_drive") {
        const result = await uploadToDrive(buffer, imageFile.name, imageFile.type);
        image_url = result.url;
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
        image_url = uploadResult.secure_url;
      }
    }

    const sheet = await getOrCreateGoogleSheet(spreadsheetId, SHEET_TITLE, HEADERS);
    
    const id = Date.now().toString();
    const created_at = new Date().toISOString();

    await sheet.addRow({
      id,
      name,
      role,
      image_url,
      order,
      created_at
    });

    await addActivityLog("Menambahkan pengurus baru: " + name, session.user?.name || "Admin");

    return NextResponse.json({ success: true, message: "Pengurus berhasil ditambahkan" });
  } catch (error: any) {
    console.error("Error creating pengurus:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
