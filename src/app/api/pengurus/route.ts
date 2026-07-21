import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import { uploadToDrive } from "@/lib/google-drive";
import { addActivityLog } from "@/lib/activity-log";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const data = await prisma.pengurus.findMany({
      orderBy: [
        { order: "asc" },
        { created_at: "desc" }
      ]
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
    const orderStr = formData.get('order') as string;
    const order = orderStr ? parseInt(orderStr, 10) : 99;
    const imageFile = formData.get('image') as File;

    if (!name || !role) {
      return NextResponse.json({ error: "Nama dan jabatan wajib diisi" }, { status: 400 });
    }

    let storageProvider = "cloudinary";
    try {
      const { getCachedStorageProvider } = await import("@/lib/settings");
      storageProvider = await getCachedStorageProvider();
    } catch (e) {
      console.error("Gagal membaca pengaturan penyimpanan, menggunakan cloudinary", e);
    }

    let image_url = "";

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

    await prisma.pengurus.create({
      data: {
        name,
        role,
        image_url: image_url || null,
        order
      }
    });

    await addActivityLog("Menambahkan pengurus baru: " + name, session.user?.name || "Admin");

    return NextResponse.json({ success: true, message: "Pengurus berhasil ditambahkan" });
  } catch (error: any) {
    console.error("Error creating pengurus:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
