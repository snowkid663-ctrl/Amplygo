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
| Campaign Invites (links, QR, analytics, **branding**) | shipped (MVP) | [features/campaign-invites.md](features/campaign-invites.md) |
| Campaign Embeds (iframe join widget) | shipped (basic) | [features/embeds.md](features/embeds.md) |
| Creator Badges (rarity + gamified gallery) | in progress | [features/badges.md](features/badges.md) |
| Shareable Results (growth loop) | shipped (MVP) | [features/shareable-results.md](features/shareable-results.md) |
| Stats tracking (real YouTube views/likes/comments) | Phase 1 shipped | [features/stats-tracking.md](features/stats-tracking.md) |
| Sales tracking (tracking links + Stripe webhook) | Phase 3 shipped | [features/sales-tracking.md](features/sales-tracking.md) |
| Campaign creation (multi-select targeting, rules toggle, product assets) | shipped (MVP) | [features/campaign-creation.md](features/campaign-creation.md) |
| Campaign analytics (company dashboard, grouped metrics + AI insights) | shipped (MVP) | [features/campaign-analytics.md](features/campaign-analytics.md) |
| Creator profile (performance panel) | shipped (MVP) | [features/creator-profile.md](features/creator-profile.md) |
| Profile media (photo, banner, reposition) | shipped | [features/profile-media.md](features/profile-media.md) |
| Social login & YouTube auto-link | shipped | [features/social-login.md](features/social-login.md) |
| Campaign approval (auto-approve companies, admin approves campaigns) | shipped | — |
