# Campaign analytics — the company dashboard

**Status:** shipped (MVP, demo-backed where sales aren't tracked yet)
**Last updated:** 2026-07-25

## Principle
AmplyGo sells **creators generating distribution** — so the campaign dashboard
must answer more than "how much money?". It follows the narrative a company
actually thinks in: *Is my money coming back? → Why? → Who / what / where?*

## Layout (top → bottom, clear hierarchy)
1. **Hero — "Your campaign today"** (status + platform meta, a compact
   **↗ Share results** control, four "today" pulses — Views / Creators / Videos /
   Revenue each with ▲%, a one-line summary, and the budget bar).
2. **AI Insights** — 3 auto-generated cards (acceleration + reason, a suggestion,
   a trend). Heuristic today (`m.insights` in `demoMetrics.ts`).
3. **Business** — Revenue, Profit, ROI, Sales, CPA, ROAS, Conversion.
4. **Distribution** — Creators, Videos, Views, Reach, Shares, Comments.
5. **Content** — Videos today, Average views, Best performing video, Top platform.
6. **Creators** — New today, Active, Returning %, Growth.
7. Exploration (unchanged): invite panel, revenue chart, funnel, leaderboard,
   top videos, latest sales, timeline, tabs.
8. **Community** — Announcements read, Challenge participants, Comments, Messages.

All groups use small equal cards (`.metric-grid` + `<Metric>`), Linear/Stripe
style, instead of burying everything in charts.

## Data
`campaignMetrics(campaign, submissions, nameOf, currency, participantCount)` in
`src/lib/demoMetrics.ts` now also returns `creators, videos, reach, shares,
comments, avgViews, bestVideoViews, cpaCents, roas, conversionRatePct,
topPlatform, today, creatorMetrics, community, insights`. Real values (views,
spend, creators, videos) are used where present; the rest is deterministic demo
per campaign id, pending sales attribution (phase 2). Disclaimer stays on-page.

## Related changes
- **Share results** is no longer a standalone card — it's a compact popover in
  the hero header (`<ShareResults compact />`).
- Company **dashboard** KPI sparklines removed (were visually noisy/buggy); a
  stray duplicate avatar in the header was removed.
- Account **dropdown** clickability fixed: the topbar is now `sticky` with a
  stacking context above page content, and the menu sits at a high z-index.
