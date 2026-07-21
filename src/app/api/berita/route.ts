import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import { uploadToDrive } from "@/lib/google-drive";
import { addActivityLog } from "@/lib/activity-log";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const data = await prisma.berita.findMany({
      orderBy: { created_at: "desc" }
    });

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
    const category = formData.get('category') as string || 'Umum';
    const imageFile = formData.get('image') as File;

    if (!title || !content) {
      return NextResponse.json({ error: "Judul dan konten wajib diisi" }, { status: 400 });
    }

    let storageProvider = "cloudinary";
    try {
      const { getCachedStorageProvider } = await import("@/lib/settings");
      storageProvider = await getCachedStorageProvider();
    } catch (e) {
      console.error("Gagal membaca pengaturan penyimpanan, menggunakan cloudinary", e);
    }

    let imageUrl = "";

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

    await prisma.berita.create({
      data: {
        title,
        slug,
        content,
        image_url: imageUrl,
        author: session.user?.name || "Admin",
        status,
        category
      }
    });

    const user = session.user?.name || "Admin";
    await addActivityLog(
      status === "Published" ? "Berita Dipublikasikan" : "Berita Draft Disimpan",
      `"${title}" berhasil ${status === "Published" ? "dipublikasikan" : "disimpan sebagai draft"} oleh ${user}`,
      user
    );

    return NextResponse.json({ success: true, message: "Berita berhasil ditambahkan" });
  } catch (error: any) {
    console.error("Error creating berita:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
