import { config } from "dotenv";
config({ path: ".env.local" });

import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });

async function run() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "kontaks" (
        "id" TEXT NOT NULL,
        "nama" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "subjek" TEXT NOT NULL,
        "pesan" TEXT NOT NULL,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "kontaks_pkey" PRIMARY KEY ("id")
    );
  `);
  console.log("Table kontaks created");
  pool.end();
}

run();
