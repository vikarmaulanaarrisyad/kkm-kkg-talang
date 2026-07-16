const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
require('dotenv').config({ path: '.env.local' });

async function checkMasterData() {
  const jwt = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID, jwt);
  await doc.loadInfo();
  
  const sheet = doc.sheetsByTitle["MasterData"];
  if (sheet) {
    const rows = await sheet.getRows();
    console.log(`Jumlah baris di MasterData: ${rows.length}`);
    rows.forEach(r => {
      console.log(`[${r.get('kategori')}] => ${r.get('nama_nilai')}`);
    });
  } else {
    console.log("Sheet MasterData tidak ditemukan!");
  }
}

checkMasterData().catch(console.error);
