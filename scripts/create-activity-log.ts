import { config } from "dotenv";
config({ path: ".env.local" });

import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });

async function run() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "activity_logs" (
        "id" TEXT NOT NULL,
        "action" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "user" TEXT NOT NULL,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
    );
  `);
  console.log("Table activity_logs created");
  pool.end();
}

run();
