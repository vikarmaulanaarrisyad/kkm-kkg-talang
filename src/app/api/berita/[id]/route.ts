import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import { uploadToDrive, deleteFromDrive, extractDriveFileId } from "@/lib/google-drive";
import { addActivityLog } from "@/lib/activity-log";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const berita = await prisma.berita.findUnique({
      where: { id }
    });
    
    if (!berita) {
      return NextResponse.json({ error: "Berita tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ data: berita });
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

    const existing = await prisma.berita.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Berita tidak ditemukan" }, { status: 404 });
    }

    let storageProvider = "cloudinary";
    try {
      const { getCachedStorageProvider } = await import("@/lib/settings");
      storageProvider = await getCachedStorageProvider();
    } catch (e) {
      console.error("Gagal membaca pengaturan penyimpanan", e);
    }

    let imageUrl = existing.image_url || "";

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

    await prisma.berita.update({
      where: { id },
      data: {
        title,
        slug,
        content,
        image_url: imageUrl,
        status,
        category
      }
    });

    const user = session.user?.name || "Admin";
    await addActivityLog(
      "Berita Diperbarui",
      `"${title}" berhasil diperbarui oleh ${user}`,
      user
    );

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

    const existing = await prisma.berita.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Berita tidak ditemukan" }, { status: 404 });
    }

    const imageUrl = existing.image_url;
    if (imageUrl) {
      if (imageUrl.includes("drive.google.com")) {
        const fileId = extractDriveFileId(imageUrl);
        if (fileId) await deleteFromDrive(fileId);
      } else {
        const publicId = extractPublicId(imageUrl);
        if (publicId) await cloudinary.uploader.destroy(publicId);
      }
    }

    await prisma.berita.delete({ where: { id } });

    const user = session.user?.name || "Admin";
    await addActivityLog(
      "Berita Dihapus",
      `"${existing.title}" berhasil dihapus oleh ${user}`,
      user
    );

    return NextResponse.json({ success: true, message: "Berita berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
