import { google } from "googleapis";
import { Readable } from "stream";

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

function getDriveClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: SCOPES,
  });
  return google.drive({ version: "v3", auth });
}

export async function uploadToDrive(buffer: Buffer, originalName: string, mimeType: string) {
  const drive = getDriveClient();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!folderId) {
    throw new Error("GOOGLE_DRIVE_FOLDER_ID belum dikonfigurasi di file .env");
  }

  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);

  const fileMetadata = {
    name: `${Date.now()}-${originalName}`,
    parents: [folderId],
  };

  const media = {
    mimeType: mimeType,
    body: stream,
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: "id",
  });

  const fileId = response.data.id;

  if (fileId) {
    // Mengatur izin file menjadi publik (Siapa saja yang memiliki tautan dapat melihat)
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    // Membuat URL mentah agar bisa digunakan di tag <img>
    const rawUrl = `https://drive.google.com/uc?id=${fileId}`;
    
    return {
      fileId: fileId,
      url: rawUrl,
    };
  }

  throw new Error("Gagal mendapatkan ID file setelah upload");
}

export async function deleteFromDrive(fileId: string) {
  try {
    const drive = getDriveClient();
    await drive.files.delete({ fileId });
    return true;
  } catch (error) {
    console.error("Gagal menghapus file dari Google Drive:", error);
    return false;
  }
}

export function extractDriveFileId(url: string): string | null {
  try {
    if (url.includes("drive.google.com/uc?id=")) {
      const urlParams = new URL(url).searchParams;
      return urlParams.get("id");
    }
    return null;
  } catch (e) {
    return null;
  }
}
