# Profile media — photo, banner & reposition

**Status:** shipped

## Summary
Creators and companies can set a profile **photo** (avatar/logo) and a **banner**.
The avatar is changed by clicking it (a camera overlay appears on hover — no
permanent badge icon). Banners can be **repositioned** so the important part of
the image sits where the user wants.

## User flows
- **Change photo:** hover the avatar → camera overlay → click → file picker.
  Accepts PNG, JPEG, WebP and **GIF**, up to 4 MB.
- **Change banner:** hover the banner → "Change banner" / "Remove".
- **Reposition banner:** "Reposition" → drag up/down on the banner to pick the
  vertical focal point → "Save position". Cancel restores the previous value.

## Data model
- `companies.bannerPos` / `creators.bannerPos` — integer `0..100` (default `50`),
  the vertical focal point applied as CSS `background-position: center {pos}%`.
- Images stored under `public/uploads/` (MVP local storage).

## API
- `POST /api/profile/image` — upload avatar/banner (`kind` field).
- `PATCH /api/profile/image` — `{ bannerPos: number }` saves the focal point.
- `DELETE /api/profile/image` — `{ kind }` clears the reference.

## Scope (later)
- Drag-to-crop for the avatar; horizontal banner offset too.
- Move uploads to object storage (S3/Supabase Storage) for multi-instance deploys.
