import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrCreateGoogleSheet } from "@/lib/google-sheets";
import cloudinary from "@/lib/cloudinary";

const SHEET_TITLE = "Berita";
const HEADERS = ['id', 'title', 'slug', 'content', 'image_url', 'author', 'status', 'created_at'];

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
      title: row.get('title'),
      slug: row.get('slug'),
      content: row.get('content'),
      image_url: row.get('image_url'),
      author: row.get('author'),
      status: row.get('status'),
      created_at: row.get('created_at'),
    }));

    // Sort by created_at descending
    data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("Error fetching berita:", error);
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
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const status = formData.get('status') as string || 'Draft';
    const imageFile = formData.get('image') as File;

    if (!title || !content) {
      return NextResponse.json({ error: "Judul dan konten wajib diisi" }, { status: 400 });
    }

    let imageUrl = "";

    // Upload image to Cloudinary if exists
    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Wrap upload stream in a Promise
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "kkm-talang/berita" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      }) as any;

      imageUrl = uploadResult.secure_url;
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const id = Date.now().toString();

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!spreadsheetId) {
      return NextResponse.json({ error: "Spreadsheet ID not configured" }, { status: 500 });
    }

    const sheet = await getOrCreateGoogleSheet(spreadsheetId, SHEET_TITLE, HEADERS);
    
    await sheet.addRow({
      id,
      title,
      slug,
      content,
      image_url: imageUrl,
      author: session.user?.name || "Admin",
      status,
      created_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true, message: "Berita berhasil ditambahkan" });
  } catch (error: any) {
    console.error("Error creating berita:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
