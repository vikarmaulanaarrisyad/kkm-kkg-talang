import { unstable_cache } from 'next/cache';
import { getOrCreateGoogleSheet } from './google-sheets';

export const getCachedSiteName = unstable_cache(
  async () => {
    try {
      const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
      if (!spreadsheetId) return "KKM & KKG MI TALANG";
      const sheet = await getOrCreateGoogleSheet(spreadsheetId, "Settings", ["key", "value"]);
      const rows = await sheet.getRows();
      const nameRow = rows.find((row: any) => row.get("key") === "site_name");
      return nameRow && nameRow.get("value") ? nameRow.get("value") : "KKM & KKG MI TALANG";
    } catch (e) {
      console.error("Failed to fetch site_name for cache:", e);
      return "KKM & KKG MI TALANG";
    }
  },
  ['site-settings-name'],
  { revalidate: 60, tags: ['settings'] }
);

export const getCachedStorageProvider = unstable_cache(
  async () => {
    try {
      const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
      if (!spreadsheetId) return "google_drive";
      const sheet = await getOrCreateGoogleSheet(spreadsheetId, "Settings", ["key", "value"]);
      const rows = await sheet.getRows();
      const providerRow = rows.find((row: any) => row.get("key") === "storage_provider");
      return providerRow && providerRow.get("value") ? providerRow.get("value") : "google_drive";
    } catch (e) {
      console.error("Failed to fetch storage_provider for cache:", e);
      return "google_drive";
    }
  },
  ['site-settings-storage-provider'],
  { revalidate: 60, tags: ['settings'] }
);

export const getCachedTahunAjaran = unstable_cache(
  async () => {
    try {
      const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
      if (!spreadsheetId) return "";
      const sheet = await getOrCreateGoogleSheet(spreadsheetId, "Settings", ["key", "value"]);
      const rows = await sheet.getRows();
      const row = rows.find((r: any) => r.get("key") === "tahun_ajaran_aktif");
      return row && row.get("value") ? row.get("value") : "";
    } catch (e) {
      console.error("Failed to fetch tahun_ajaran_aktif for cache:", e);
      return "";
    }
  },
  ['site-settings-tahun-ajaran'],
  { revalidate: 60, tags: ['settings'] }
);

export const getCachedSiteLogo = unstable_cache(
  async () => {
    try {
      const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
      if (!spreadsheetId) return "/icon.png";
      const sheet = await getOrCreateGoogleSheet(spreadsheetId, "Settings", ["key", "value"]);
      const rows = await sheet.getRows();
      const logoRow = rows.find((row: any) => row.get("key") === "site_logo");
      if (logoRow && logoRow.get("value")) {
        const url = logoRow.get("value");
        if (url.includes("cloudinary.com") && url.includes("/upload/")) {
          return url.replace("/upload/", "/upload/w_64,h_64,c_fill,f_auto,q_auto/");
        } else {
          return url;
        }
      }
      return "/icon.png";
    } catch (e) {
      return "/icon.png";
    }
  },
  ['site-settings-logo'],
  { revalidate: 60, tags: ['settings'] }
);
