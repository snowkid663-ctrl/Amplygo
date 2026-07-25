import { NextResponse } from "next/server";
import { refreshYouTubeStats } from "@/lib/tracking";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Refreshes real video stats. Protect with CRON_SECRET: send it as
 * `Authorization: Bearer <CRON_SECRET>` or `?key=<CRON_SECRET>`.
 * If CRON_SECRET isn't set, the endpoint is disabled (avoids being open).
 */
async function handle(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 503 });

  const auth = req.headers.get("authorization");
  const url = new URL(req.url);
  const provided = auth?.replace(/^Bearer\s+/i, "") || url.searchParams.get("key");
  if (provided !== secret) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await refreshYouTubeStats();
  return NextResponse.json({ ok: true, ...result });
}

export const GET = handle;
export const POST = handle;
