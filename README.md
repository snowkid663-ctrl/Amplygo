# AmplyGo — MVP (Phase 1)

Marketplace connecting companies to content creators for performance-based
(CPM) campaigns. This is a working, self-contained implementation of the
phase-1 scope agreed on: **auth + the end-to-end campaign flow** (company
creates a campaign → creator joins → creator submits content → admin
approves → money moves). Full dashboards, fraud tooling, real payments and
real social-API tracking are intentionally out of scope for this pass — see
"What's phase 2" below.

## Stack

- **Next.js 14** (App Router) + TypeScript, React 18
- **SQLite via Node's built-in `node:sqlite`** — no Prisma/native binaries.
  (Prisma's engine download is blocked by network restrictions in some
  sandboxed environments; `node:sqlite` ships inside Node 22+ itself, so
  there's nothing to download or compile. All queries are hand-written
  parameterized SQL in `src/lib/data.ts` / `src/lib/schema.sql`.)
- **NextAuth (Credentials provider)** — email/password auth, JWT sessions,
  role stored in the token (`COMPANY` / `CREATOR` / `ADMIN`).
- No CSS framework — a small design-system layer in `src/app/globals.css`
  reproduces the dark/glass look (oklch colors, blurred sidebar/topbar,
  pill tags, gradient buttons) from the original HTML prototypes.

Requires **Node.js 22.5+** (for `node:sqlite`).

## Running it locally

```bash
npm install
npm run seed     # creates admin@amplygo.com / password123, plus a demo
                  # approved company and a demo creator
npm run dev
```

Open http://localhost:3000.

Seeded accounts (all password `password123`):
- `admin@amplygo.com` — admin
- `acme@amplygo.com` — company, pre-approved, $0 balance
- `jane@amplygo.com` — creator

To verify the whole business flow end-to-end without a browser:

```bash
npm run smoke
```

This walks through: company registers → admin approves → company deposits
funds → publishes a CPM campaign → creator connects a social account →
joins → submits a video → admin approves with a view count → checks that
the company balance, campaign spend, creator earnings and platform fee
(10%) all update correctly, including a payout request. It asserts on every
step and fails loudly if any business rule breaks.

## The core flow this build proves out

1. **Register** as a Company or Creator (`/auth`).
2. Company is created with status `PENDING` — it **must be approved by an
   admin** before it can publish (spend) a campaign.
3. Company adds balance (mock deposit — no payment processor wired up yet)
   and creates a campaign: CPM, total budget, targeting (platform /
   language / country), and a rules checklist.
4. Creator connects the social account matching a campaign's platform
   (mocked — just records a handle, no real OAuth) — required before
   joining any campaign.
5. Creator browses **active** campaigns, accepts the rules, and joins
   (one participation per campaign, enforced by a DB unique constraint).
6. Creator submits their published video link + date.
7. **Admin reviews the submission** and enters a view count (this stands in
   for the automatic API read that would happen in phase 2) and
   approves/rejects. On approval:
   - gross cost = `views / 1000 × CPM`
   - creator receives 90% of that
   - AmplyGo keeps 10% (the platform fee)
   - the company's balance and the campaign's spend both update
   - a company **cannot** reject a submission that follows the rules — only
     an admin can, matching the product spec's fraud-prevention answer.
8. Creator sees their earnings and can request a payout (min $20, processed
   manually by admin — no automated payout rail yet).

All of this is backed by real API routes (`src/app/api/**`) and a real
SQLite database file (`dev.db`, created automatically on first run) — not
mocked in the UI layer.

## Where the business rules came from

The data model and the open questions from the product docs you provided
(`AmplyGo Product Specification`, `Vision.md`, `Perguntas e
questionamentos`) are encoded directly:

- CPM-only pricing, 10% AmplyGo fee (`src/lib/money.ts`)
- Company needs admin approval + sufficient balance before publishing
- One submission per campaign per creator (DB `UNIQUE` constraint)
- Creator must connect a social account before joining
- Minimum payout $20
- Company can flag but not unilaterally reject a compliant submission

A few things called out as "still open" in `Perguntas e questionamentos`
(30-day minimum publish window, view-count freeze after 30 days, account-age
fraud checks, international language/country targeting beyond simple
select fields) are **not enforced yet** — they're noted inline in the code
(`schema.sql`, `data.ts`) as phase-2 items rather than silently ignored.

## What's phase 2 (intentionally not built here)

Per your brief and the product docs' own "Fora do MVP" list:

- Real OAuth + automatic view tracking from TikTok/YouTube/Instagram APIs
  (today: admin enters view counts manually on approval)
- Real payment processing for company deposits and creator payouts (today:
  both are simulated/manual)
- The full "Company Dashboard" revenue/ROI/funnel/ROAS/sales-feed screens
  from the prototypes — those depend on a real checkout/sales-attribution
  system that doesn't exist yet (clicks → landing → checkout → purchase is
  explicitly a placeholder funnel in the prototypes)
- Fraud detection (view-spike flags, account-age checks), reputation, chat,
  mobile app, campaign recommendations, public API
- Google/YouTube social login (buttons are present but disabled — needs
  real OAuth app credentials, which only you can create)
- Budget escrow (today a company's balance is just checked against a
  campaign's budget at publish time, not locked/reserved)

## Project layout

```
src/lib/schema.sql   SQLite schema (source of truth for the data model)
src/lib/data.ts       All database access (typed repository functions)
src/lib/money.ts       CPM / fee-split math
src/lib/auth.ts        NextAuth config (credentials provider)
src/middleware.ts       Role-based route protection (/company, /creator, /admin)
src/app/api/**          REST-ish API routes used by the pages
src/app/(company|creator|admin)/**   Role-specific pages
src/components/**        Shared UI + a few client-side interactive widgets
scripts/seed.ts          Creates demo accounts
scripts/smoke.ts         End-to-end business-logic test (see above)
```

## Known simplifications (read before treating this as production)

- `NEXTAUTH_SECRET` in `.env` is a placeholder — replace it before any real
  deployment.
- SQLite is fine for an MVP/demo; a real deployment should move to Postgres
  (the query layer is plain SQL, not an ORM, so this is a rewrite of
  `data.ts`/`schema.sql`, not a huge lift).
- No rate limiting, no email verification, no password reset flow.
- `node:sqlite` is still an experimental Node API (stable enough for this
  use, but worth knowing).
