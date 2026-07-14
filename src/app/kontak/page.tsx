import { getOrCreateGoogleSheet } from "@/lib/google-sheets";
import KontakClient from "./KontakClient";
import { getCachedSiteName } from "@/lib/settings";

export const revalidate = 60;

export async function generateMetadata() {
  const siteName = await getCachedSiteName();
  return {
    title: `Hubungi Kami | ${siteName}`,
    description: `Hubungi pengurus ${siteName} untuk pertanyaan, saran, dan masukan.`,
  };
}

async function getKontakInfo() {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  if (!spreadsheetId) return { alamat: "", email: "", telepon: "" };
  try {
    const sheet = await getOrCreateGoogleSheet(spreadsheetId, "Settings", ["key", "value"]);
    const rows = await sheet.getRows();
    const get = (key: string) => rows.find((r: any) => r.get("key") === key)?.get("value") || "";
    return {
      alamat: get("kontak_alamat") || "Kecamatan Talang, Kabupaten Tegal\nJawa Tengah, Indonesia",
      email: get("kontak_email") || "info@kkmtalang.id",
      telepon: get("kontak_telepon") || "+62 812-3456-7890",
    };
  } catch {
    return {
      alamat: "Kecamatan Talang, Kabupaten Tegal\nJawa Tengah, Indonesia",
      email: "info@kkmtalang.id",
      telepon: "+62 812-3456-7890",
    };
  }
}

export default async function KontakPage() {
  const kontakInfo = await getKontakInfo();
  return <KontakClient kontakInfo={kontakInfo} />;
}
