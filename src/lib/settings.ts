import { unstable_cache } from 'next/cache';
import { getOrCreateGoogleSheet } from './google-sheets';

export const getCachedSiteName = unstable_cache(
  async () => {
    try {
      const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
      if (!spreadsheetId) return "CMS Madrasah";
      const sheet = await getOrCreateGoogleSheet(spreadsheetId, "Settings", ["key", "value"]);
      const rows = await sheet.getRows();
      const nameRow = rows.find((row: any) => row.get("key") === "site_name");
      return nameRow && nameRow.get("value") ? nameRow.get("value") : "CMS Madrasah";
    } catch (e) {
      console.error("Failed to fetch site_name for cache:", e);
      return "CMS Madrasah";
    }
  },
  ['site-settings-name'],
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
