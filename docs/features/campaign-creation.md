# Campaign creation

**Status:** shipped (MVP)
**Last updated:** 2026-07-25

## Targeting is multi-select
Platforms, Languages and Countries are now **multi-select** (chip dropdowns,
`MultiSelect` component). "YouTube Shorts" / "Instagram Reels" labels are just
"YouTube" / "Instagram" (from `PLATFORM_LABEL`).

**Storage (backward-compatible):** the existing single `campaign.platform` stays
the **primary** platform (first selected) so all existing logic — joins, filters,
icons, demo metrics — keeps working untouched. The full set lives in a new CSV
column `platforms`. Languages/Countries are stored comma-joined in the existing
`language` / `country` text columns (no new columns, no CHECK conflicts).

## Rules: checklist OR free-write
A segmented toggle lets the company either tick a **checklist** (stored in
`rulesChecklist`) or **write** rules in prose (stored in `rulesExtra`). Only the
active mode is sent.

## Product assets
- **Media**: images / GIFs / videos of the product (helps creators). Uploaded via
  `POST /api/upload` → stored in Postgres `media` table → `/api/media/<id>`.
  Stored on the campaign as JSON `productMedia: {url,type}[]`.
- **Files**: PDF / DOC / XLS / TXT / ZIP briefs, same upload path, stored as JSON
  `attachments: {url,name}[]`. `/api/upload` accepts images, video and documents
  up to 20 MB.

Both render in a "Product assets" panel on the campaign detail page.

## Data model
`ALTER TABLE campaigns ADD COLUMN platforms text, "productMedia" text,
attachments text` (all nullable; applied via `npm run migrate`).

## Next (requested, not yet done)
- Analytics: Stripe-style per-card date filter (day/week/month).
- Share results: modal with a live **preview** of the public page.
- Public results page: charts + animation glow-up.
