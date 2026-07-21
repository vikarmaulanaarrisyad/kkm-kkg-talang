import { unstable_cache } from 'next/cache';
import prisma from './prisma';

// ─── MASTER CACHE: Ambil SEMUA data Settings dalam SATU request ───────────────
const getAllSettings = unstable_cache(
  async (): Promise<Record<string, string>> => {
    try {
      const rows = await prisma.setting.findMany();
      const result: Record<string, string> = {};
      rows.forEach(row => {
        if (row.key) result[row.key] = row.value || "";
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
      const count = await prisma.madrasah.count({
        where: { status: "pending" }
      });
      return count;
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
      
      const [allSurats, readSurats] = await Promise.all([
        prisma.surat.findMany({
          select: { id: true, penerima: true }
        }),
        prisma.suratBaca.findMany({
          where: { madrasah_id: madrasahId },
          select: { surat_id: true }
        })
      ]);
      
      const readIds = new Set(readSurats.map(s => s.surat_id));
      
      const mySurats = allSurats.filter(s => {
        const penerima = s.penerima || "all";
        return penerima === "all" || penerima === madrasahId || penerima.split(",").includes(madrasahId);
      });

      return mySurats.filter(s => !readIds.has(s.id)).length;
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
