const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
require('dotenv').config({ path: '.env.local' });

async function resetGuruSheet() {
  console.log("Menghubungkan ke Google Sheets...");
  const jwt = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID, jwt);
  await doc.loadInfo();
  
  const sheetTitle = "Guru";
  const existingSheet = doc.sheetsByTitle[sheetTitle];
  
  if (existingSheet) {
    console.log(`Menghapus sheet "${sheetTitle}" lama...`);
    await existingSheet.delete();
  }
  
  console.log(`Membuat ulang sheet "${sheetTitle}" dengan header yang benar...`);
  const HEADERS = [
    "id", "madrasah_id", "nama", "gelar_depan", "gelar_belakang", "nuptk", "peg_id", "nip",
    "tempat_lahir", "tanggal_lahir", "jenis_kelamin", "jabatan",
    "status_kepegawaian", "pendidikan_terakhir", "bidang_studi",
    "no_hp", "email", "created_at", "password_hash"
  ];
  
  await doc.addSheet({ title: sheetTitle, headerValues: HEADERS });
  
  console.log("SELESAI! Sheet Guru berhasil direset.");
}

resetGuruSheet().catch(console.error);
