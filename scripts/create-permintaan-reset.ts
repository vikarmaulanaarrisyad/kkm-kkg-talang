import { config } from "dotenv";
config({ path: ".env.local" });

import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });

async function run() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "permintaan_resets" (
        "id" TEXT NOT NULL,
        "madrasah_id" TEXT NOT NULL,
        "guru_id" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "resolved_at" TIMESTAMP(3),

        CONSTRAINT "permintaan_resets_pkey" PRIMARY KEY ("id")
    );
  `);
  console.log("Table permintaan_resets created");
  pool.end();
}

run();
