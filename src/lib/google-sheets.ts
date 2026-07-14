import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// Inisialisasi kredensial dari environment variable
const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
];

export async function getOrCreateGoogleSheet(sheetId: string, sheetTitle: string, headers: string[] = []) {
  try {
    const jwt = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: SCOPES,
    });

    const doc = new GoogleSpreadsheet(sheetId, jwt);
    await doc.loadInfo();
    
    let sheet = doc.sheetsByTitle[sheetTitle];
    
    if (!sheet) {
      if (headers.length > 0) {
        sheet = await doc.addSheet({ title: sheetTitle, headerValues: headers });
      } else {
        throw new Error(`Sheet dengan judul "${sheetTitle}" tidak ditemukan di spreadsheet ini.`);
      }
    } else {
      // Ensure headers exist
      if (headers.length > 0) {
        try {
          await sheet.loadHeaderRow();
        } catch (e) {
          await sheet.setHeaderRow(headers);
        }
      }
    }

    return sheet;
  } catch (error) {
    console.error('Error connecting to Google Sheets:', error);
    throw error;
  }
}
