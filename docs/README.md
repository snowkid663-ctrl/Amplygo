# AmplyGo — Feature docs

Design notes and specs for AmplyGo features. Each feature gets its own file
under `features/` so ideas are captured and organized **before** implementation.

## Convention

- One file per feature: `docs/features/<kebab-case-name>.md`.
- Each doc has: **Status**, **Summary**, **User flows**, **Data model**,
  **Scope (MVP → later)**, and **Open questions**.
- `Status` is one of: `idea` · `spec'd` · `in progress` · `shipped`.

## Index

| Feature | Status | Doc |
|---|---|---|
| Campaign Invites (invite links, QR, per-link analytics) | shipped (MVP) | [features/campaign-invites.md](features/campaign-invites.md) |
| Campaign Embeds (iframe join widget) | shipped (basic) | [features/embeds.md](features/embeds.md) |
| Creator Badges (with rarity) | in progress | [features/badges.md](features/badges.md) |
| Shareable Results (growth loop) | shipped (MVP) | [features/shareable-results.md](features/shareable-results.md) |
| Campaign approval (auto-approve companies, admin approves campaigns) | shipped | — |
