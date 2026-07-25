# Real stats tracking

**Status:** Phase 1 shipped (YouTube views/likes/comments)
**Last updated:** 2026-07-25

## Goal
Replace manually-entered / demo engagement numbers with **real** data pulled
from the platforms, stored as a time-series so we can chart growth.

## Phase 1 — YouTube (shipped)
Public YouTube video statistics need only an **API key** (no per-creator OAuth).

**Flow**
1. On submit, if the campaign platform is YouTube, `extractYouTubeId(videoUrl)`
   stores `submissions.externalVideoId` (watch / youtu.be / shorts / embed).
2. `refreshYouTubeStats()` (`src/lib/tracking.ts`) batches all trackable video
   ids (≤50/request) → `videos.list?part=statistics` → writes a snapshot to
   `video_stats` and updates `submissions.viewsCount/likesCount/commentsCount/
   statsUpdatedAt`. So existing analytics (which read `viewsCount`) become real.
3. Runs on a schedule via **GitHub Actions** (`.github/workflows/refresh-stats.yml`,
   every 6h) which calls `POST /api/cron/refresh-stats` (auth: `Bearer $CRON_SECRET`
   or `?key=`). Render cron jobs need a paid plan, so we schedule for free from
   Actions; the web service does the fetch + DB writes. `npm run refresh-stats`
   also runs it locally / from any scheduler.

**Config (Render dashboard / .env.local)**
- `YOUTUBE_API_KEY` — Google Cloud → Credentials → API key (enable YouTube Data
  API v3). Without it, refresh is a safe no-op (`{enabled:false}`).
- `CRON_SECRET` — protects the HTTP endpoint (503 if unset, so never open).
  Set the **same** value as a GitHub Actions repo secret named `CRON_SECRET`.

**Data model**
- `submissions.externalVideoId / likesCount / commentsCount / statsUpdatedAt`
- `video_stats(id, submissionId, views, likes, comments, capturedAt)` — snapshots.

## Phase 2 — TikTok & Instagram (not started)
Need approved developer apps + creator OAuth (TikTok Display/Content API;
Instagram Graph API on a Business/Creator account). Same `video_stats` model;
add per-platform fetchers behind the creators' stored OAuth tokens.

## Phase 3 — Sales attribution (not started)
Unique tracking links (reuse invite `ref` + click counts) + per-creator coupon
codes → then pixel/postback (S2S) and Shopify/Stripe integrations for true
revenue/ROAS. Until then, revenue/sales/funnel stay demo.
