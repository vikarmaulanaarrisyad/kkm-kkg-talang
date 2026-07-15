import { unstable_cache } from 'next/cache';
import { getOrCreateGoogleSheet } from './google-sheets';

// ─── MASTER CACHE: Ambil SEMUA data Settings dalam SATU request ───────────────
// Semua fungsi turunan di bawah menggunakan cache ini agar tidak membebani
// Google Sheets API quota (error 429).
const getAllSettings = unstable_cache(
  async (): Promise<Record<string, string>> => {
    try {
      const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
      if (!spreadsheetId) return {};
      const sheet = await getOrCreateGoogleSheet(spreadsheetId, "Settings", ["key", "value"]);
      const rows = await sheet.getRows();
      const result: Record<string, string> = {};
      rows.forEach((row: any) => {
        const key = row.get("key");
        if (key) result[key] = row.get("value") || "";
      });
      return result;
    } catch (e) {
      console.error("Failed to fetch all settings:", e);
      return {};
    }
  },
  ['all-site-settings'],
  { revalidate: 60, tags: ['settings'] }
);

// ─── Derived helpers (tidak buat request baru, pakai master cache) ────────────

export const getCachedSiteName = async (): Promise<string> => {
  const settings = await getAllSettings();
  return settings.site_name || "KKM & KKG MI TALANG";
};

export const getCachedStorageProvider = async (): Promise<string> => {
  const settings = await getAllSettings();
  return settings.storage_provider || "google_drive";
};

export const getCachedTahunAjaran = async (): Promise<string> => {
  const settings = await getAllSettings();
  return settings.tahun_ajaran_aktif || "";
};

export const getCachedSiteLogo = async (): Promise<string> => {
  const settings = await getAllSettings();
  const url = settings.site_logo;
  if (url) {
    if (url.includes("cloudinary.com") && url.includes("/upload/")) {
      return url.replace("/upload/", "/upload/w_64,h_64,c_fill,f_auto,q_auto/");
    }
    return url;
  }
  return "/icon.png";
};

export const getCachedKontakInfo = async () => {
  const settings = await getAllSettings();
  return {
    alamat: settings.kontak_alamat || "Kecamatan Talang, Kabupaten Tegal\nJawa Tengah, Indonesia",
    email:  settings.kontak_email  || "info@kkmtalang.id",
    telepon: settings.kontak_telepon || "+62 812-3456-7890",
  };
};

export const getCachedPendingMadrasahCount = unstable_cache(
  async (): Promise<number> => {
    try {
      const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
      if (!spreadsheetId) return 0;
      const sheet = await getOrCreateGoogleSheet(spreadsheetId, "Madrasah", ["id", "status"]);
      const rows = await sheet.getRows();
      return rows.filter((r: any) => r.get("status") === "pending").length;
    } catch (e) {
      console.error("Failed to fetch pending madrasah:", e);
      return 0;
    }
  },
  ['pending-madrasah-count'],
  { revalidate: 60, tags: ['madrasah'] }
);

export const getCachedUnreadSuratCount = unstable_cache(
  async (madrasahId: string): Promise<number> => {
    try {
      if (!madrasahId) return 0;
      const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
      if (!spreadsheetId) return 0;
      const [suratSheet, bacaSheet] = await Promise.all([
        getOrCreateGoogleSheet(spreadsheetId, "Surat", ["id", "penerima"]),
        getOrCreateGoogleSheet(spreadsheetId, "SuratBaca", ["surat_id", "madrasah_id"])
      ]);
      const [suratRows, bacaRows] = await Promise.all([suratSheet.getRows(), bacaSheet.getRows()]);
      
      const myBacaIds = new Set(
        bacaRows.filter(b => b.get("madrasah_id") === madrasahId).map(b => b.get("surat_id"))
      );
      const mySurats = suratRows.filter(r => {
        const penerima = r.get("penerima") || "all";
        return penerima === "all" || penerima === madrasahId || penerima.split(",").includes(madrasahId);
      });

      return mySurats.filter(s => !myBacaIds.has(s.get("id"))).length;
    } catch (e) {
      console.error("Failed to fetch unread surat:", e);
      return 0;
    }
  },
  ['unread-surat-count'],
  { revalidate: 60, tags: ['surat'] }
);

// Export master cache jika dibutuhkan langsung
export { getAllSettings };
