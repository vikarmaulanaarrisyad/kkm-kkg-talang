import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// Inisialisasi kredensial dari environment variable
const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
];

let docPromise: Promise<GoogleSpreadsheet> | null = null;
let lastLoadTime = 0;
const CACHE_TTL_MS = 60000; // Cache document info for 60 seconds

function formatPrivateKey(key: string | undefined) {
  if (!key) return '';
  // Hilangkan tanda kutip ganda atau tunggal di awal dan akhir (jika ada)
  let formattedKey = key.replace(/^["']|["']$/g, '');
  // Ganti literal \n dengan newline (enter) yang sebenarnya
  formattedKey = formattedKey.replace(/\\n/g, '\n');
  
  // Jika karena suatu hal key menjadi 1 baris tanpa \n sama sekali
  if (!formattedKey.includes('\n') && formattedKey.includes('-----BEGIN PRIVATE KEY-----')) {
    formattedKey = formattedKey.replace('-----BEGIN PRIVATE KEY-----', '-----BEGIN PRIVATE KEY-----\n');
    formattedKey = formattedKey.replace('-----END PRIVATE KEY-----', '\n-----END PRIVATE KEY-----');
    // Mengganti spasi di tengah-tengah base64 menjadi newline
    formattedKey = formattedKey.replace(/([a-zA-Z0-9+/=]) ([a-zA-Z0-9+/=])/g, '$1\n$2');
  }
  
  return formattedKey;
}

async function getDoc(sheetId: string): Promise<GoogleSpreadsheet> {
  const now = Date.now();
  if (docPromise && now - lastLoadTime < CACHE_TTL_MS) {
    return docPromise;
  }
  
  const jwt = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: formatPrivateKey(process.env.GOOGLE_PRIVATE_KEY),
    scopes: SCOPES,
  });
  
  const doc = new GoogleSpreadsheet(sheetId, jwt);
  docPromise = doc.loadInfo().then(() => doc);
  lastLoadTime = now;
  
  return docPromise.catch(err => {
    // If it fails, clear the cache so next attempt retries
    docPromise = null;
    throw err;
  });
}

export async function getOrCreateGoogleSheet(sheetId: string, sheetTitle: string, headers: string[] = []) {
  try {
    const doc = await getDoc(sheetId);
    let sheet = doc.sheetsByTitle[sheetTitle];
    
    if (!sheet) {
      if (headers.length > 0) {
        sheet = await doc.addSheet({ title: sheetTitle, headerValues: headers });
        // Refresh doc metadata after adding sheet
        await doc.loadInfo(); 
      } else {
        throw new Error(`Sheet dengan judul "${sheetTitle}" tidak ditemukan di spreadsheet ini.`);
      }
    } else {
      // Hanya loadHeaderRow jika kita butuh sinkronisasi kolom (biasanya hanya saat testing)
      // Untuk mengurangi API Calls (mencegah 429), kita bisa melewati ini karena header sudah di set di awal.
      if (headers.length > 0) {
        try {
          // Attempt to access headerValues. If they aren't loaded, it throws an error in v4.
          const _dummy = sheet.headerValues;
        } catch {
          // It threw an error, so we need to load them
          try {
            await sheet.loadHeaderRow();
            const existingHeaders = sheet.headerValues;
            const missingHeaders = headers.filter(h => !existingHeaders.includes(h));
            if (missingHeaders.length > 0) {
              await sheet.setHeaderRow([...existingHeaders, ...missingHeaders]);
            }
          } catch (e) {
            await sheet.setHeaderRow(headers);
          }
        }
      }
    }

    return sheet;
  } catch (error) {
    console.error('Error connecting to Google Sheets:', error);
    throw error;
  }
}

const rowsCache = new Map<string, { time: number, promise: Promise<any[]> }>();
const ROWS_CACHE_TTL = 10000; // 10 seconds

export async function getCachedRows(sheet: any, sheetTitle: string) {
  const now = Date.now();
  const cached = rowsCache.get(sheetTitle);
  
  if (cached && now - cached.time < ROWS_CACHE_TTL) {
    return cached.promise;
  }
  
  const promise = sheet.getRows().catch((err: any) => {
    rowsCache.delete(sheetTitle);
    throw err;
  });
  
  rowsCache.set(sheetTitle, { time: now, promise });
  return promise;
}
