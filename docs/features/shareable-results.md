# Shareable Results (growth loop)

**Status:** shipped (MVP: public results page + share). Cards/PNG + Wrapped recaps pending.
**Last updated:** 2026-07-24

## Summary

Turn successful campaigns into **organic marketing for AmplyGo**. A company can
publish a beautiful **public results page** for a campaign (big numbers, top
creators, ROAS) with a subtle **"Powered by AmplyGo"** and a CTA. Every share
("our campaign got 12.4M views") makes viewers ask "what platform is this?" —
the Spotify-Wrapped / Stripe-report effect. The dashboard should be pretty
enough that people *want* to post it unprompted.

## Shipped (MVP)
- Public page **`/share/<token>`** — premium glass layout: hero **views** number
  (huge, gradient), stat cards (Revenue, ROAS, Sales, Videos), **Top creators**
  podium, an animated gradient-border CTA ("Want results like this? Start free"),
  and a discreet **"Powered by AmplyGo"** footer. Has social link-preview
  metadata (`generateMetadata`).
- Company enables it from the campaign page → **Share results** panel: creates
  the link (`POST /api/campaigns/[id]/share` → `campaigns.shareToken`), then
  Copy / Open / **Share on X** / **Share on LinkedIn**.
- Numbers use the same metrics as the campaign dashboard (real views/spend +
  demo revenue/ROAS while sales attribution is phase 2).

## Design principle
Make it *status-worthy*, like Spotify Wrapped / GitHub graph / Duolingo recap —
people share because it looks good, not because they were asked.

## Pending (phase 2)
- **Per-network cards / PNG export** (Views, ROI, Growth, Leaderboard, Timeline)
  via an OG image generator (satori / @vercel/og). Currently share = the page.
- **Monthly recaps ("Wrapped")**:
  - Company: "July — 12.4M views · 428 creators · $0.39 CPM · top creator".
  - Creator: "July recap — 28 videos · 4.8M views · $842 earned · top campaign".
    Perfect for Stories / LinkedIn.
- Revoke / regenerate share token; per-share view analytics.
- Chart/timeline card on the public page.

## Files
- `src/app/share/[token]/page.tsx` — public results page.
- `src/components/ShareResults.tsx` — company share panel.
- `src/app/api/campaigns/[id]/share/route.ts` — enable/return token.
- `campaigns.shareToken` (schema).
