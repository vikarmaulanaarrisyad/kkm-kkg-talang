const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
require('dotenv').config({ path: '.env.local' });

async function listSheets() {
  const jwt = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID, jwt);
  await doc.loadInfo();
  
  console.log("Daftar Sheet:");
  for (const sheet of doc.sheetsByIndex) {
    console.log(`- ${sheet.title} (Rows: ${sheet.rowCount}, Cols: ${sheet.columnCount})`);
    
    // Print first row of the sheet to see headers
    try {
      await sheet.loadHeaderRow();
      console.log(`  Headers: ${sheet.headerValues.join(', ')}`);
    } catch (e) {
      console.log(`  Headers: (kosong atau error)`);
    }
  }
}

listSheets().catch(console.error);
