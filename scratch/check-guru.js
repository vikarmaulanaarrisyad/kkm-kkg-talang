const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
require('dotenv').config({ path: '../.env.local' });

async function run() {
  const jwt = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID, jwt);
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle["Guru"];
  await sheet.loadHeaderRow();
  console.log("Headers:");
  console.log(sheet.headerValues);

  const rows = await sheet.getRows();
  console.log("\nRow 0 Raw Values:");
  if (rows.length > 0) {
    console.log(rows[0]._rawData);
  }
}
run().catch(console.error);
