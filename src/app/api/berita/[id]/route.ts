import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrCreateGoogleSheet } from "@/lib/google-sheets";
import cloudinary from "@/lib/cloudinary";
import { uploadToDrive, deleteFromDrive, extractDriveFileId } from "@/lib/google-drive";

const SHEET_TITLE = "Berita";
const HEADERS = ['id', 'title', 'slug', 'content', 'image_url', 'author', 'status', 'created_at', 'category'];

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!spreadsheetId) {
      return NextResponse.json({ error: "Spreadsheet ID not configured" }, { status: 500 });
    }

    const sheet = await getOrCreateGoogleSheet(spreadsheetId, SHEET_TITLE, HEADERS);
    const rows = await sheet.getRows();
    
    const row = rows.find(r => r.get('id') === id);
    if (!row) {
      return NextResponse.json({ error: "Berita tidak ditemukan" }, { status: 404 });
    }

    const data = {
      id: row.get('id'),
      title: row.get('title'),
      slug: row.get('slug'),
      content: row.get('content'),
      image_url: row.get('image_url'),
      author: row.get('author'),
      status: row.get('status'),
      created_at: row.get('created_at'),
      category: row.get('category'),
    };

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

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

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const status = formData.get('status') as string || 'Draft';
    const category = formData.get('category') as string || 'Umum';
    const imageFile = formData.get('image') as File | null;
    const removeImage = formData.get('remove_image') as string;

    if (!title || !content) {
      return NextResponse.json({ error: "Judul dan konten wajib diisi" }, { status: 400 });
    }

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!spreadsheetId) {
      return NextResponse.json({ error: "Spreadsheet ID not configured" }, { status: 500 });
    }

    const sheet = await getOrCreateGoogleSheet(spreadsheetId, SHEET_TITLE, HEADERS);
    const rows = await sheet.getRows();
    
    const row = rows.find(r => r.get('id') === id);
    if (!row) {
      return NextResponse.json({ error: "Berita tidak ditemukan" }, { status: 404 });
    }

    let storageProvider = "cloudinary";
    try {
      const settingsSheet = await getOrCreateGoogleSheet(spreadsheetId, "Settings", ["key", "value"]);
      const settingsRows = await settingsSheet.getRows();
      const providerRow = settingsRows.find(r => r.get("key") === "storage_provider");
      if (providerRow && providerRow.get("value")) storageProvider = providerRow.get("value");
    } catch (e) {
      console.error("Gagal membaca pengaturan penyimpanan", e);
    }

    let imageUrl = row.get('image_url') || "";

    // Delete existing image if replacing or removing
    if (imageUrl && (imageFile || removeImage === "true")) {
      if (imageUrl.includes("drive.google.com")) {
        const fileId = extractDriveFileId(imageUrl);
        if (fileId) await deleteFromDrive(fileId);
      } else {
        const publicId = extractPublicId(imageUrl);
        if (publicId) await cloudinary.uploader.destroy(publicId);
      }
      
      if (removeImage === "true") {
        imageUrl = "";
      }
    }

    // Upload new image if provided
    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (storageProvider === "google_drive") {
        const result = await uploadToDrive(buffer, imageFile.name, imageFile.type);
        imageUrl = result.url;
      } else {
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { 
              folder: "kkm-talang/berita",
              transformation: [
                { width: 800, crop: "scale" },
                { quality: "auto", fetch_format: "auto" }
              ]
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(buffer);
        }) as any;
        imageUrl = uploadResult.secure_url;
      }
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    row.assign({
      title,
      slug,
      content,
      image_url: imageUrl,
      status,
      category
    });
    
    await row.save();

    return NextResponse.json({ success: true, message: "Berita berhasil diperbarui" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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
      return NextResponse.json({ error: "Berita tidak ditemukan" }, { status: 404 });
    }

    const imageUrl = row.get('image_url');
    if (imageUrl) {
      if (imageUrl.includes("drive.google.com")) {
        const fileId = extractDriveFileId(imageUrl);
        if (fileId) await deleteFromDrive(fileId);
      } else {
        const publicId = extractPublicId(imageUrl);
        if (publicId) await cloudinary.uploader.destroy(publicId);
      }
    }

    await row.delete();

    return NextResponse.json({ success: true, message: "Berita berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
