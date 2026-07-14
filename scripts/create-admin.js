const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const bcrypt = require('bcryptjs');

async function run() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const sheetId = process.env.GOOGLE_SPREADSHEET_ID;

  if (!email || !key || !sheetId) {
    console.error("Kredensial tidak lengkap di .env.local!");
    process.exit(1);
  }

  const jwt = new JWT({
    email: email,
    key: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const doc = new GoogleSpreadsheet(sheetId, jwt);

  try {
    console.log("Menghubungkan ke Google Spreadsheet...");
    await doc.loadInfo();
    console.log(`Berhasil terhubung ke dokumen: ${doc.title}`);

    let usersSheet = doc.sheetsByTitle["Users"];
    if (!usersSheet) {
      console.log("Sheet 'Users' tidak ditemukan. Membuat sheet baru...");
      usersSheet = await doc.addSheet({
        title: "Users",
        headerValues: ['id', 'username', 'password_hash', 'role', 'name', 'created_at']
      });
      console.log("Sheet 'Users' berhasil dibuat dengan header.");
    } else {
      console.log("Sheet 'Users' sudah ada.");
      // Pastikan header sudah ada
      await usersSheet.loadHeaderRow().catch(async () => {
         await usersSheet.setHeaderRow(['id', 'username', 'password_hash', 'role', 'name', 'created_at']);
      });
    }

    const username = "admin";
    const plainPassword = "password123";
    const name = "Administrator KKM";

    // Cek apakah user admin sudah ada
    const rows = await usersSheet.getRows();
    const existingAdmin = rows.find(r => r.get('username') === username);

    if (existingAdmin) {
      console.log(`User dengan username '${username}' sudah ada!`);
      return;
    }

    console.log("Membuat hash password...");
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(plainPassword, salt);

    console.log("Menambahkan user admin ke Spreadsheet...");
    await usersSheet.addRow({
      id: Date.now().toString(),
      username: username,
      password_hash: passwordHash,
      role: 'admin',
      name: name,
      created_at: new Date().toISOString()
    });

    console.log("\n=============================================");
    console.log("✅ AKUN ADMIN BERHASIL DIBUAT DI SPREADSHEET!");
    console.log("Username : " + username);
    console.log("Password : " + plainPassword);
    console.log("=============================================\n");
    console.log("Silakan login menggunakan kredensial di atas.");

  } catch (err) {
    console.error("Terjadi kesalahan:", err);
  }
}

run();
