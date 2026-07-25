# Campaign Invites

**Status:** shipped (MVP) · referral rewards pending
**Owner:** —
**Last updated:** 2026-07-25

### Branding / theming (shipped 2026-07-25)
Companies can brand each invite link from the create modal:
- **Accent color** — a swatch palette (validated server-side as `#rrggbb`). Applied
  to the invite page brand label, estimated-earnings figures, and the primary CTA.
- **Background image** — uploaded via `POST /api/upload` (auth-gated, returns a
  `/uploads/...` path); shown full-bleed behind the invite card with a dark
  overlay (replaces the network background when set).
- Stored on `campaign_invites.themeColor` / `themeBgUrl`. Server only accepts a
  hex color and a `/uploads/...` path or `https://` URL.

### Shipped in MVP
- Company: create invite links per campaign (label, expiration, max uses,
  **require-approval**), copy link, revoke, per-link **clicks + joins** counts.
- Public landing `/invite/<token>` (brand, CPM, platform, budget left,
  requirements, estimated net earnings, "Invited by <company>").
- Join flow: logged-in creator one-click; logged-out → auth (returns via
  `callbackUrl`) → join. Records `inviteId` + `ref`. Enforces expiry/max-uses/revoke.
- **Require approval** → participation is `PENDING`; the company approves/rejects
  on the campaign page ("Join requests"). Pending creators can't submit yet.

### Also shipped
- **QR code** per link (`/api/invites/[id]/qr` → SVG, download).
- **Embed** widget per link (see [embeds.md](embeds.md)).
- **Per-link analytics**: multiple labelled links per campaign, each with
  clicks, joins and **conversion %**.

### Still pending (phase 2)
- Referral **rewards** (money vs credits — undecided).
- `invite_events` table for time-series / channel breakdown beyond counters.

## Summary

Turn "share a campaign" into a proper **acquisition + analytics tool**, not just
a copy-link button. A company creates one or more **invite links** for a
campaign. Creators open a beautiful landing page for that campaign and join in
one click (logging in / signing up if needed). Links carry **referral** info,
support **QR codes**, can be **revoked/expired/limited**, and report
**per-link analytics** (clicks → joins) so the company learns which channel
(Discord, WhatsApp, email, X…) brings the best creators.

Why it matters: for a marketplace, "which channel converts which creators" is
worth far more than a generic share button — it compounds adoption.

---

## User flows

### Company — create & manage invites

On the campaign page, an **Invite Creators** action:

```
🔥 Summer Sale Campaign
Creators: 23 · Budget: $2,400
[ Invite Creators ]
```

Opens a share panel:

```
Share Campaign
Anyone with this link can request to join this campaign.

https://amplygo.com/invite/xA72KpL9        [ Copy Link ]  [ QR Code ]

Permissions
  ☑ Allow anyone to join
  ☐ Require approval
Expiration        ○ Never   ○ 7 days   ○ Custom
Maximum uses      ○ Unlimited   ○ 100   ○ 1000
Label / channel   [ Discord ]        (optional, for analytics)
```

A campaign can have **multiple links**, each with its own label + analytics:

```
Campaign
 ├── Invite #1  Discord   132 clicks · 29 joins
 ├── Invite #2  WhatsApp   87 clicks · 41 joins
 └── Invite #3  Email     311 clicks · 102 joins
```

### Creator — open an invite

`amplygo.com/invite/xA72KpL9` → a public landing page:

```
Invited by NovaVision            ← builds trust vs a generic link
Nike · Summer Collection Campaign

💰 $3.50 CPM   🌎 Worldwide   🎥 Shorts + TikTok + Reels
Budget remaining: $8,340

Requirements: English · 15–45s · Mention product · Original content

Estimated earnings
  10k → $35     100k → $350     1M → $3,500

[ Join Campaign ]
```

- If **logged out**: `Continue with Google` / `Create account`, then
  "Do you want to join this campaign? [Join] [Cancel]".
- If **logged in as creator**: one-click join.
- After joining → straight to the **campaign dashboard**.
- If link requires approval → creator's request is `PENDING` until the company
  accepts.

---

## Referral & rewards (phase 2)

Links can carry a referrer: `…/invite/xA72KpL9?ref=creator123`. This attributes
each join to who shared it (a creator, an agency, a company employee). Enables
future rewards, e.g.:

- "Invite a creator — earn 2% of their first month's earnings."
- "Invite creators — get 10 bonus credits."

Just **record `ref`** now; pay-outs are a later decision.

---

## URL design

Use `/invite/<token>` — **not** `/campaign/<id>` — so we can:

- revoke a link without touching the campaign,
- issue many links per campaign,
- measure clicks/joins per link,
- attribute the channel that converts best.

Token: short, random, unguessable (e.g. 8–10 url-safe chars).

---

## Data model (proposed)

```
campaign_invites
  id            text pk
  campaignId    text -> campaigns(id) on delete cascade
  token         text unique            -- the /invite/<token> slug
  label         text                   -- "Discord", "WhatsApp"… (optional)
  requireApproval integer default 0
  maxUses       integer                -- null = unlimited
  uses          integer default 0      -- successful joins via this link
  clicks        integer default 0      -- landing views
  expiresAt     text                   -- null = never
  createdBy     text -> users(id)
  active        integer default 1      -- revoke = set 0
  createdAt     text default now()

invite_events            -- optional, for richer analytics
  id, inviteId, type ('click'|'join'), ref, createdAt
```

`participations` gains optional `inviteId` + `ref` columns to attribute joins.

---

## Scope

**MVP**
- Company: create/copy/**revoke** one link per campaign; optional expiration +
  max uses + require-approval.
- Public `/invite/<token>` landing (real campaign data, estimated earnings).
- Join flow (logged-in one-click; logged-out → auth → join), respecting
  approval, expiry, max uses.
- Count **clicks** and **joins** per link.

**Later**
- Multiple labelled links per campaign + per-link analytics table.
- Referral (`?ref=`) attribution + rewards.
- QR code generation (events / print).
- "Invited by <company/creator>" trust header.

---

## Open questions

- "Require approval" — who approves: the company, or AmplyGo admin (fraud)?
- Do referral rewards touch real money (payouts) or platform credits?
- Expiry/max-use enforcement: hard block, or just stop showing in listings?
- Should company employees/agencies get their own sub-links (roles)?
