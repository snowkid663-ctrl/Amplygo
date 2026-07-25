# Campaign Embeds

**Status:** shipped (basic)
**Last updated:** 2026-07-24

## Summary

A distribution channel alongside invite links + QR: companies can **embed a
campaign "join" widget** on any external site via an `<iframe>`. It renders a
compact, self-contained card (brand, campaign, CPM, platform, budget left) with
a **Join campaign →** button that opens the full invite flow in a new tab.

This makes AmplyGo campaigns shareable the way a YouTube video or a Typeform is:
paste one snippet, done.

## How it works

- Public route **`/embed/<token>`** renders the widget with **no app chrome**,
  dark self-contained styling, `dynamic = "force-dynamic"`.
- The company gets the snippet from a campaign's invite (Invite manager →
  **Embed** button):
  ```html
  <iframe src="https://<host>/embed/<token>" width="360" height="240"
    style="border:0;border-radius:14px" title="AmplyGo campaign"></iframe>
  ```
- The token is an existing **invite token**, so embeds inherit the invite's
  revoke / expiry / max-uses and its click/join analytics (the Join button
  routes through `/invite/<token>`).

## Framing / security

The app sets `X-Frame-Options: SAMEORIGIN` everywhere to prevent clickjacking —
but **`/embed/*` is excluded** and instead sends `Content-Security-Policy:
frame-ancestors *`, so only embed pages can be framed by third-party sites.
(Configured in `next.config.mjs`.)

## Files
- `src/app/embed/[token]/page.tsx` — the widget.
- Snippet generation + copy: `src/components/CampaignInviteManager.tsx`.
- Header rules: `next.config.mjs`.

## Later
- Per-embed analytics separate from link clicks (distinct `invite_events`).
- A themeable / sizeable widget (light mode, compact vs full).
- A creator "profile + badges" embed.
