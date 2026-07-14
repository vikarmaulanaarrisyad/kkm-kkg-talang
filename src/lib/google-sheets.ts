import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// Inisialisasi kredensial dari environment variable
const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
];

export async function getGoogleSheet(sheetId: string, sheetTitle: string) {
  try {
    const jwt = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: SCOPES,
    });

    const doc = new GoogleSpreadsheet(sheetId, jwt);
    await doc.loadInfo();
    
    // Cari sheet berdasarkan judul (misal: "Users", "Berita")
    const sheet = doc.sheetsByTitle[sheetTitle];
    
    // Jika sheet belum ada, kita bisa lempar error
    if (!sheet) {
      throw new Error(`Sheet dengan judul "${sheetTitle}" tidak ditemukan di spreadsheet ini.`);
    }

    return sheet;
  } catch (error) {
    console.error('Error connecting to Google Sheets:', error);
    throw error;
  }
}
