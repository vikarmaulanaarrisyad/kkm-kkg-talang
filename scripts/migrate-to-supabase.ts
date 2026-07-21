import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { getOrCreateGoogleSheet } from "../src/lib/google-sheets";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function migrateData() {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  if (!spreadsheetId) {
    throw new Error("GOOGLE_SPREADSHEET_ID is missing");
  }

  console.log("Memulai migrasi dari Google Sheets ke Supabase...");

  try {
    // ============================================
    // 1. Madrasah (Parent for Guru, Rombel, etc)
    // ============================================
    console.log("Migrasi: Madrasah");
    const madrasahSheet = await getOrCreateGoogleSheet(spreadsheetId, "Madrasah", [
      "id", "nama", "nsm", "npsn", "alamat", "kecamatan", "username", "password_hash", "status", "created_at"
    ]);
    const madrasahRows = await madrasahSheet.getRows();
    const madrasahData = madrasahRows.map(r => ({
      id: r.get("id"),
      nsm: r.get("nsm") || null,
      npsn: r.get("npsn") || null,
      nama: r.get("nama"),
      alamat: r.get("alamat") || null,
      kecamatan: r.get("kecamatan") || null,
      username: r.get("username"),
      password_hash: r.get("password_hash"),
      status: r.get("status") || "active",
      created_at: r.get("created_at") ? new Date(r.get("created_at")) : new Date(),
    })).filter(m => m.id && m.username); // Ensure required fields exist

    if (madrasahData.length > 0) {
      await prisma.madrasah.createMany({ data: madrasahData, skipDuplicates: true });
    }

    // ============================================
    // 2. Users (Admin)
    // ============================================
    console.log("Migrasi: Users");
    const userSheet = await getOrCreateGoogleSheet(spreadsheetId, "Users", [
      "id", "username", "password_hash", "name", "role", "created_at"
    ]);
    const userRows = await userSheet.getRows();
    const userData = userRows.map(r => ({
      id: r.get("id") || r.rowNumber.toString(),
      username: r.get("username"),
      password_hash: r.get("password_hash"),
      name: r.get("name") || "Admin",
      role: r.get("role") || "admin",
      created_at: r.get("created_at") ? new Date(r.get("created_at")) : new Date(),
    })).filter(u => u.username && u.password_hash);
    
    if (userData.length > 0) {
      await prisma.user.createMany({ data: userData, skipDuplicates: true });
    }

    // ============================================
    // 3. Guru
    // ============================================
    console.log("Migrasi: Guru");
    const guruSheet = await getOrCreateGoogleSheet(spreadsheetId, "Guru", [
      "id", "madrasah_id", "nama", "nip", "peg_id", "nuptk", "password_hash", "created_at"
    ]);
    const guruRows = await guruSheet.getRows();
    const guruData = guruRows.map(r => ({
      id: r.get("id"),
      madrasah_id: r.get("madrasah_id"),
      nama: r.get("nama"),
      nip: r.get("nip") || null,
      peg_id: r.get("peg_id") || null,
      nuptk: r.get("nuptk") || null,
      password_hash: r.get("password_hash") || null,
      created_at: r.get("created_at") ? new Date(r.get("created_at")) : new Date(),
    })).filter(g => g.id && g.madrasah_id);
    
    if (guruData.length > 0) {
      await prisma.guru.createMany({ data: guruData, skipDuplicates: true });
    }

    // ============================================
    // 4. Rombel
    // ============================================
    console.log("Migrasi: Rombel");
    const rombelSheet = await getOrCreateGoogleSheet(spreadsheetId, "Rombel", [
      "id", "madrasah_id", "tahun_ajaran", "nama_rombel", "siswa_laki", "siswa_perempuan", "wali_kelas_id", "created_at"
    ]);
    const rombelRows = await rombelSheet.getRows();
    const rombelData = rombelRows.map(r => ({
      id: r.get("id"),
      madrasah_id: r.get("madrasah_id"),
      tahun_ajaran: r.get("tahun_ajaran") || "",
      nama_rombel: r.get("nama_rombel") || "",
      siswa_laki: parseInt(r.get("siswa_laki") || "0", 10),
      siswa_perempuan: parseInt(r.get("siswa_perempuan") || "0", 10),
      wali_kelas_id: r.get("wali_kelas_id") || null,
      created_at: r.get("created_at") ? new Date(r.get("created_at")) : new Date(),
    })).filter(r => r.id && r.madrasah_id);
    
    if (rombelData.length > 0) {
      await prisma.rombel.createMany({ data: rombelData, skipDuplicates: true });
    }

    // ============================================
    // 5. Berita
    // ============================================
    console.log("Migrasi: Berita");
    const beritaSheet = await getOrCreateGoogleSheet(spreadsheetId, "Berita", [
      "id", "title", "slug", "content", "image_url", "author", "status", "created_at", "category"
    ]);
    const beritaRows = await beritaSheet.getRows();
    const beritaData = beritaRows.map(r => ({
      id: r.get("id"),
      title: r.get("title") || "",
      slug: r.get("slug") || r.get("id"),
      content: r.get("content") || "",
      image_url: r.get("image_url") || null,
      author: r.get("author") || "Admin",
      status: r.get("status") || "draft",
      category: r.get("category") || "Uncategorized",
      created_at: r.get("created_at") ? new Date(r.get("created_at")) : new Date(),
    })).filter(b => b.id);
    
    if (beritaData.length > 0) {
      await prisma.berita.createMany({ data: beritaData, skipDuplicates: true });
    }

    // ============================================
    // 6. Agenda
    // ============================================
    console.log("Migrasi: Agenda");
    const agendaSheet = await getOrCreateGoogleSheet(spreadsheetId, "Agenda", [
      "id", "title", "date", "time", "location", "status"
    ]);
    const agendaRows = await agendaSheet.getRows();
    const agendaData = agendaRows.map(r => ({
      id: r.get("id"),
      title: r.get("title") || "",
      date: r.get("date") || "",
      time: r.get("time") || null,
      location: r.get("location") || null,
      status: r.get("status") || "upcoming",
    })).filter(a => a.id);
    
    if (agendaData.length > 0) {
      await prisma.agenda.createMany({ data: agendaData, skipDuplicates: true });
    }

    // ============================================
    // 7. Pengurus
    // ============================================
    console.log("Migrasi: Pengurus");
    const pengurusSheet = await getOrCreateGoogleSheet(spreadsheetId, "Pengurus", [
      "id", "name", "role", "image_url", "order", "created_at"
    ]);
    const pengurusRows = await pengurusSheet.getRows();
    const pengurusData = pengurusRows.map(r => ({
      id: r.get("id"),
      name: r.get("name") || "",
      role: r.get("role") || "",
      image_url: r.get("image_url") || null,
      order: r.get("order") ? parseInt(r.get("order"), 10) : null,
      created_at: r.get("created_at") ? new Date(r.get("created_at")) : new Date(),
    })).filter(p => p.id);
    
    if (pengurusData.length > 0) {
      await prisma.pengurus.createMany({ data: pengurusData, skipDuplicates: true });
    }

    // ============================================
    // 8. Settings
    // ============================================
    console.log("Migrasi: Settings");
    const settingsSheet = await getOrCreateGoogleSheet(spreadsheetId, "Settings", ["key", "value"]);
    const settingsRows = await settingsSheet.getRows();
    const settingsData = settingsRows.map(r => ({
      key: r.get("key"),
      value: r.get("value") || "",
    })).filter(s => s.key);
    
    if (settingsData.length > 0) {
      await prisma.setting.createMany({ data: settingsData, skipDuplicates: true });
    }

    console.log("Migrasi Selesai! Semua data dari Google Sheets berhasil dimasukkan ke PostgreSQL.");
  } catch (error) {
    console.error("Migrasi gagal:", error);
  } finally {
    await prisma.$disconnect();
    pool.end();
  }
}

migrateData();
