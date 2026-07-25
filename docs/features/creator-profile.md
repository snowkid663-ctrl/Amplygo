# Creator profile — the performance panel

**Status:** shipped (MVP)
**Last updated:** 2026-07-25

## Principle
The profile must answer in ~15 seconds: **"Is this creator worth following?"**
It's not a résumé, not Instagram, not LinkedIn — it's a **performance panel**.
Route: `/creator/profile` (own view; a company-facing `/creators/[id]` can reuse
the same layout later).

## Sections (top → bottom)
1. **Identity** — banner + avatar, name, up-to-4 earned badges (small), tag line
   (top campaign categories, e.g. `AI • Motion Design • SaaS`), country flag,
   "Creator since <Month Year>". No follower vanity, no long bio.
2. **Creator Overview** — four big numbers: **Videos**, **Views Generated**,
   **Revenue Earned** (creator's display currency), **Campaigns**.
3. **Recent Performance · Last 30 days** — Videos / Views / Revenue.
4. **Creator Network** — brands (company names) the creator has worked with.
5. **Featured Videos** — top approved videos by views (tiles link out).
6. **Creator Insights** — heuristic, AI-styled bullets derived from real signals
   (consistency, dominant category, strongest-performing category, reach,
   approval rate, brand count).

## Data
`creatorProfile(creatorId, displayCurrency)` in `src/lib/data.ts` aggregates from
approved submissions joined to campaigns + companies (views, net→converted,
category, country, company, videoUrl) plus participation counts and the user's
`createdAt`. All amounts convert to the creator's display currency.

## Later
- Company-facing `/creators/[id]` (same component), reachable from leaderboards
  and submission reviews.
- Real video thumbnails (per-platform oEmbed) instead of gradient tiles.
- Persisted creator country + niche instead of inferring from campaigns.
- Insights via an actual model instead of heuristics.
