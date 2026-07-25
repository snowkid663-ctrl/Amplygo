import { ensureSchema, sql } from "../src/lib/db";

// Applies schema.sql (idempotent: CREATE TABLE IF NOT EXISTS + ALTER ... ADD
// COLUMN IF NOT EXISTS). Safe to run against an existing database — it only
// adds what's missing and never drops data.
async function main() {
  await ensureSchema();
  console.log("Schema up to date.");
  await sql().end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
