import { refreshYouTubeStats } from "../src/lib/tracking";
import { sql } from "../src/lib/db";

// Cron entrypoint: refresh real video stats (YouTube in Phase 1).
async function main() {
  const result = await refreshYouTubeStats();
  console.log("refresh-stats:", JSON.stringify(result));
  await sql().end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
