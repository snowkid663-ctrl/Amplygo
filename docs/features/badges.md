# Creator Badges (with rarity)

**Status:** in progress (MVP: computable badges, rarity display, and a gamified
gallery shipped)
**Last updated:** 2026-07-25

## Gamified gallery (shipped 2026-07-25)

Badges no longer live on the creator **dashboard** — they moved to the creator
**profile** (Settings → Badges) and render as a full **gallery** instead of a
flat pill list:

- Every badge in the catalog is shown. **Earned** badges glow in their rarity
  color; **locked** ones are dimmed with a lock.
- Locked badges with a measurable metric show a **progress bar** + a
  `current / target` label (e.g. `6 / 10 campaigns`, `82k / 100k avg views`).
- Sorted **earned first, then closest-to-unlock**, so the creator always sees
  their next win. A header shows `earned / total`.
- Progress is computed by `badgeProgress()` in `src/lib/badges.ts`; the UI is
  `src/components/BadgeGallery.tsx`.

## Summary

Badges aren't just achievements — they're **trust + decision signals**. A company
scanning creators should instantly read "proven performer / reliable / niche fit".
Creators collect them (gamification → engagement). Each badge has a **rarity tier**
like a game, which makes rarer ones desirable and more meaningful to brands.

## Rarity tiers

| Tier | Dot | Meaning |
|---|---|---|
| Common | 🟢 | Baseline good behavior |
| Rare | 🔵 | Solid, above average |
| Epic | 🟣 | Strong track record |
| Legendary | 🟡 | Elite |
| Mythic | 🔴 | Once-in-a-platform |

## Categories & catalog

Legend: **[✓]** computed from real data today · **[~]** future (needs metrics we
don't track yet: ratings, retention, ROI, audience geo, sales attribution).

### 🚀 Performance
- **Viral Creator** 🔵 — 100k+ average views. [✓]
- **Million View Club** 🟣 — one video passed 1M. [✓]
- **Momentum** 🔵 — avg views +50% in last 30 days. [~]
- **Trending** 🔵 — top 5% in views this month. [~]
- **High Performer** 🟣 — avg campaign beat expectations 2x. [~]

### 🤝 Reliability (most valuable to brands)
- **Trusted Creator** 🔵 — 10+ completed campaigns. [✓]
- **Verified** 🔵 — identity + socials verified. [~]
- **Reliable** 🟢 — 95%+ completion rate. [✓]
- **Fast Publisher** 🟢 — usually publishes within 24h. [✓]
- **Rule Follower** 🟢 — 98% of videos approved. [✓]
- **Responsive** 🟢 — replies to requests quickly. [~]

### 🎬 Content quality — Storyteller / Creative Mind / High Production / Strong Hook [~]

### 💰 Business
- **Revenue Driver** 🟣 — generated $10k+ for brands. [✓]
- **ROI Machine** 🟣 — frequent positive ROI. [~]
- **Sales Booster** 🟣 — great at converting. [~]

### 🌎 Audience — Global Reach / US / Brazil / Multilingual [~]

### 🏆 Experience
- **Early Creator** 🔵 — joined in AmplyGo's first year. [✓]
- **Veteran** 🟣 — completed 100 campaigns. [✓]
- **Elite Creator** 🟡 — top 1% of creators. [~]
- **Legend / Hall of Fame** 🔴 — lifetime achievement. [~]

### 📱 Platform
- **TikTok / Reels / Shorts Expert** 🔵 — outstanding platform performance. [✓]

### 💎 Exclusive
- **Diamond Creator** 🟡 — reached $100k earned on AmplyGo. [✓]
- **Rising Star** 🔵 — fastest-growing this month. [~]
- **Brand Favorite** 🔵 — worked with 20+ companies. [✓]
- **Community Favorite** 🔵 — 5-star over many campaigns. [~]

### Niches [~]
Tech / Finance / Gaming / AI / Fitness / Education / Food / Automotive — needs a
category signal on the creator.

## Where badges show
- Creator dashboard ("Your badges").
- (later) Creator public profile + next to their name in company views
  (leaderboard, submissions) so brands read trust at a glance.

## Implementation notes
- Catalog + rarity + earn-rules: `src/lib/badges.ts`.
- Stats from real data: `creatorBadgeStats(creatorId)` in `src/lib/data.ts`
  (views, approvals, gross/net in USD, distinct companies, platform mix, join
  date, publish speed).
- Component: `src/components/BadgeList.tsx`.

## Open questions
- "Verified" — manual admin action or automated (OAuth connect = verified)?
- Elite/Trending/Top-% need cross-creator ranking (a periodic job).
- Rewards for rare badges? (priority in listings, higher default CPM share…)
