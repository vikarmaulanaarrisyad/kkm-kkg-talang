import { config } from "dotenv";
config({ path: ".env.local" });

import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });

async function run() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "master_data" (
        "id" TEXT NOT NULL,
        "kategori" TEXT NOT NULL,
        "nama_nilai" TEXT NOT NULL,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "master_data_pkey" PRIMARY KEY ("id")
    );
  `);
  console.log("Table master_data created");
  pool.end();
}

run();
